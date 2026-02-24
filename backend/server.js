import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { pipeline } from '@xenova/transformers';

import {GoogleGenerativeAI} from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model=genAI.getGenerativeModel({model: "models/gemini-2.5-flash"});

async function main() {
  const extractor=await pipeline('feature-extraction','Xenova/all-MiniLM-L6-v2');

  const app = express();
  const PORT = 5000;

  app.use(cors());
  app.use(express.json());

// connect to SQLite
  const db = new sqlite3.Database('./careerguide.db', (err) => {
    if(err) {
      console.error("Error connecting to the database:",err.message);
    }else{
      console.log("Successfully connected to the SQLite database.");
    }
  });


  // API: get all professions
  app.get('/api/professions', (req, res) => {
    db.all("SELECT id, name FROM professions WHERE parent_id IS NULL", [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  app.get('/api/professions/parent/:id', (req, res)=>{
    const {id} = req.params;
    db.all("SELECT id, name FROM professions WHERE parent_id= ?",[id],(err,rows)=>{
      if(err){
        return res.status(500).json({"error": err.message});
      }
      res.json(rows);
    });
  });

  app.get("/api/professions/:id", (req, res) => {
    const { id } = req.params;

    const professionQuery = "SELECT * FROM professions WHERE id = ?";
    const skillsQuery = `
      SELECT s.id, s.skill_name, s.skill_type 
      FROM skills s
      JOIN profession_skills ps ON s.id = ps.skill_id
      WHERE ps.profession_id = ?
    `;
    const responsibilitiesQuery = "SELECT responsibility_text FROM responsibilities WHERE profession_id = ?";
    const learningPathsQuery = "SELECT path_description FROM learning_paths WHERE profession_id = ?";

    // Use Promise.all to run all queries in parallel for better performance
    Promise.all([
      new Promise((resolve, reject) => db.get(professionQuery, [id], (err, row) => err ? reject(err) : resolve(row))),
      new Promise((resolve, reject) => db.all(skillsQuery, [id], (err, rows) => err ? reject(err) : resolve(rows))),
      new Promise((resolve, reject) => db.all(responsibilitiesQuery, [id], (err, rows) => err ? reject(err) : resolve(rows))),
      new Promise((resolve, reject) => db.all(learningPathsQuery, [id], (err, rows) => err ? reject(err) : resolve(rows)))
    ]).then(([profession, skills, responsibilities, learningPaths]) => {
      if (!profession) {
        return res.status(404).json({ error: "Profession not found" });
      }

      // Combine all the data into a single JSON response
      const response = {
        ...profession,
        skills: skills,
        responsibilities: responsibilities.map(r => r.responsibility_text),
        learningPaths: learningPaths.map(l => l.path_description)
      };
      res.json(response);
    }).catch(err => {
      res.status(500).json({ error: err.message });
    });
  });


  function cosineSimilarity(vecA,vecB){
    let dotProduct=0.0;
    let normA=0.0;
    let normB=0.0;
    for(let i=0; i<vecA.length; i++){
      dotProduct+=vecA[i]*vecB[i];
      normA+=vecA[i]*vecA[i];
      normB+=vecB[i]*vecB[i];
    }
    return dotProduct/(Math.sqrt(normA)*Math.sqrt(normB));
  }

  app.post('/api/search',async(req,res) => {
    try{
      const {query}=req.body;
      if(!query){
        return res.status(400).json({error: "Query is required"});
      }
      
      
      const queryEmb= (await extractor(query, {pooling:'mean', normalize:true})).data;

      const professions = await new Promise((resolve, reject) =>
        db.all("SELECT id, name, embedding FROM professions", [], (err, rows) =>
          err ? reject(err) : resolve(rows)
        )
      );

      

      const results = professions.map(p => {
        const emb = p.embedding ? JSON.parse(p.embedding) : null;
        if (!emb) return { id: p.id, name: p.name, score: -1 };
        return {
          id: p.id,
          name: p.name,
          score: cosineSimilarity(queryEmb, emb),
        };
      });

      results.sort((a, b) => b.score - a.score);
      const bestScore=results[0]?.score || 0;
      const dynamicThreshold=bestScore*0.7;
      const filteredResults=results.filter(r => r.score >= dynamicThreshold);
      res.json(filteredResults);
    }
    catch(error){
      console.error("Search error:",error);
      res.status(500).json({error: "Failed to perform AI search"});
    }
  });

app.post('/api/generate-learning-path',async(req,res) => {
  try{
    const {professionName} = req.body;
    if(!professionName){
      return res.status(400).json({error: "Profession name is required"});
    }

    const prompt = `
      Act as an expert career coach and senior ${professionName}.
      Generate a detailed, step-by-step learning path for someone wanting to become a "${professionName}".
      Use clear markdown formatting **strictly** as follows:
      - Use H2 headings (##) for main sections (e.g., ## Month 1: The Foundations).
      - Use H3 headings (###) for subsections (e.g., ### Key Topics).
      - Use bullet points (*) for lists.
      - Use bold text (**) for emphasis on key terms or technologies.
      - Ensure proper line breaks between paragraphs and list items.
      
      Include **exactly** these sections:

      ## Month 1: The Foundations
      ### Key Topics:
      * [List key foundational concepts]
      ### Goals:
      * [List specific, achievable goals for the first month]

      ## Months 2-3: Core Skills
      ### Key Tools & Technologies:
      * [List essential tools/languages/frameworks]
      ### Practice:
      * [Suggest ways to practice these skills]

      ## Months 4-6: Building & Specializing
      ### Advanced Topics:
      * [List more advanced concepts or specializations]
      ### Project Ideas:
      * [Suggest 1-2 slightly more complex project ideas]

      ## Your First Project
      ### Idea:
      * [Describe a simple, specific beginner project]
      ### Key Steps:
      * [List the main steps to build it]

      ## Key Learning Resources
      ### Online Courses:
      * [List 1-2 specific course names and platforms, e.g., "**Complete Web Development Bootcamp** on Udemy"]
      ### YouTube Channels:
      * [List 1-2 relevant channel names]
      ### Books:
      * [List 1-2 relevant book titles, if applicable]
      ### Documentation/Websites:
      * [List 1-2 essential websites, e.g., official documentation]

      Maintain an encouraging and practical tone throughout.
    `;
      
    console.log(`Generating learning path for ${professionName}`);

    const result=await model.generateContent(prompt);
    const response = await result.response;
    const text=response.text();
    res.json({learningPath: text})
  }
  catch(error){
    console.error("LLM Error:",error);
    res.status(500).json({error: "Failed to generate learning path"});
  }
});


  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main();
