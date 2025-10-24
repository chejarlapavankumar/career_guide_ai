import sqlite3 from 'sqlite3';
import { pipeline } from '@xenova/transformers';


async function generateEmbeddings() {
    console.log("Starting embedding generation script...");

    console.log("Loading AI model (this may take a moment)...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log("AI model loaded.");

    const db = new sqlite3.Database('./careerguide.db', (err) => {
        if (err) return console.error("DB connection error:", err.message);
        console.log("Connected to the SQLite database.");
    });

    const sql = `
        SELECT 
            p.id,
            p.name,
            p.description,
            p.work_environment,
            GROUP_CONCAT(r.responsibility_text, '. ') AS responsibilities
        FROM professions p
        LEFT JOIN professions p_child ON p.id = p_child.parent_id
        LEFT JOIN responsibilities r ON p.id = r.profession_id
        WHERE p_child.id IS NULL -- Only get "leaf" professions
        GROUP BY p.id, p.name, p.description, p.work_environment;
    `;

    const professions = await new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });

    console.log(`Found ${professions.length} professions to embed.`);

    for (const prof of professions) {
        const textToEmbed = [
            prof.name,
            prof.description,
            prof.work_environment,
            prof.responsibilities
        ].join('. '); 

        console.log(`Generating embedding for: ${prof.name}...`);

        const emb = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
        
        const vector = JSON.stringify(Array.from(emb.data));

        await new Promise((resolve, reject) => {
            db.run("UPDATE professions SET embedding = ? WHERE id = ?", [vector, prof.id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    console.log("✅ All embeddings have been generated and saved successfully.");
    db.close();
}

generateEmbeddings();