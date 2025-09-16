import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import {pipeline} from '@xenova/transformers';

async function main() {
  
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
      const extractor=await pipeline('feature-extraction','Xenova/all-MiniLM-L6-v2');
      
      const professions=await new Promise((resolve,reject) => {
        const sql=`SELECT p.id, p.name, GROUP_CONCAT(r.responsibility_text, '. ') AS description FROM professions p JOIN responsibilities r ON p.id = r.profession_id LEFT JOIN professions p2 ON p.id = p2.parent_id  WHERE p2.id IS NULL GROUP BY p.id, p.name;`;

        db.all(sql,[],(err,rows)=> err? reject(err):resolve(rows));
      });

      const queryEmbedding=(await extractor(query,{pooling:'mean',normalize:true})).data;
      const professionEmbedding=await Promise.all(
        professions.map(p => extractor(p.description || p.name, {pooling :'mean',normalize:true}))
      );

      const results=professions.map((profession,i) => ({
        id: profession.id,
        name:profession.name,
        score: cosineSimilarity(queryEmbedding, professionEmbedding[i].data)
      }));
      
      results.sort((a,b) => b.score-a.score);
      res.json(results.slice(0,8));
    }
    catch(error){
      console.error("Search error:",error);
      res.status(500).json({error: "Failed to perform AI search"});
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main();
