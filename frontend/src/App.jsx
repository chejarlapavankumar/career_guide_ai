import { useEffect, useState } from "react";

function App() {
  const [professions, setProfessions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/professions")
      .then(res => res.json())
      .then(data => setProfessions(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Career Guide AI
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {professions.map(prof => (
          <button
            key={prof.id}
            className="bg-white shadow-md rounded-xl p-4 hover:bg-blue-100 transition"
          >
            {prof.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
