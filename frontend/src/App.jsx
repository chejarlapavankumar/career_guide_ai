import { useEffect, useState } from "react";

function App() {
  const [professions, setProfessions] = useState([]);
  const [details, setDetails] = useState(null);
  const [selectedProfession, setSelectedProfession] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/professions")
      .then(res => res.json())
      .then(data => setProfessions(data))
      .catch(err => console.error(err));
  }, []);

  const handleProfessionClick=(id)=>{
    setSelectedProfession(id);
    setDetails(null);
    fetch(`http://localhost:5000/api/professions/${id}`)
    .then(res=>res.json())
    .then(data=>setDetails(data))
    .catch(err=>console.error(err));
  };

  return (
    <div className="min-h-screen bg-blue-900 p-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">
        Career Guide AI
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {professions.map(prof => (
          <button
            key={prof.id}
            onClick={()=>handleProfessionClick(prof.id)}
            className="bg-blue-300 shadow-md rounded-xl p-4 hover:bg-blue-100 transition"
          >
            {prof.name}
          </button>
        ))}
      </div>
      {details && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{details.name}</h2>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-grey-700">Key Responsibilities</h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              {details.responsibilities.map((r,i)=><li key={i}>{r}</li>)}
            </ul>
          </div>

          <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">Required Skills</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {details.skills.map(s => (
              <span key={s.id} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {s.skill_name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">Learning Paths</h3>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            {details.learningPaths.map((lp, i) => <li key={i}>{lp}</li>)}
          </ul>
        </div>
      </div>
          
      )}
    </div>
  );
}

export default App;
