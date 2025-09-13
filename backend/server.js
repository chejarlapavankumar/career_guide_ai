const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// connect to SQLite
const db = new sqlite3.Database('./careerguide.db');

// API: get all professions
app.get('/api/professions', (req, res) => {
  db.all("SELECT id, name FROM professions", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
