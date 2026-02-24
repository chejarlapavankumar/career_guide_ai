import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";

import ReactMarkdown from 'react-markdown';

function DetailsPage(){
    const {professionId} = useParams();
    const [details,setDetails]=useState(null);
    const [isLoading,setIsLoading]=useState(true);

    const [learningPath,setLearningPath]=useState("");
    const [isPathLoading, setIsPathLoading]=useState(false);

    useEffect(() => {
      setIsLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/professions/${professionId}`)
        .then(res=>res.json())
        .then(data=> {
          setDetails(data)
          setIsLoading(false);
        });
    }, [professionId]);

    const handleGeneratePath = () => {
      setIsPathLoading(true);
      setLearningPath("");

      fetch(`${import.meta.env.VITE_API_URL}/api/generate-learning-path`, {
        method : 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({professionName: details.name})
      })
      .then(res=>res.json())
      .then(data=>{
        setLearningPath(data.learningPath);
        setIsPathLoading(false);
      })
      .catch(err=>{
        console.error("Error generating learning path:",err);
        setIsPathLoading(false);
        setLearningPath("Sorry, I couldn't generate a learning path for this profession at this time.");
      });
    };
    
    if(isLoading){
        return <SkeletonLoader/>;
    }
    return(
      <div className="p-8 bg-primary-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-primary-50 p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-primary-900">{details.name}</h2>
        <p className="mt-2 text-lg text-primary-700">{details.description}</p>
        
        <div className="mt-6 bg-primary-800 rounded-xl p-4">
          <h3 className="text-xl font-semibold text-primary-100 border-b pb-2 mb-3">Key Responsibilities</h3>
          <ul className="list-disc list-inside space-y-2 text-primary-50">
            {details.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        
        <div className="mt-6 bg-primary-800 rounded-xl p-4">
          <h3 className="text-xl font-semibold text-primary-100 border-b pb-2 mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {details.skills.map(s => (
              <span key={s.id} className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                {s.skill_name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-primary-800 rounded-xl p-4">
          <h3 className="text-xl font-semibold text-primary-100 border-b pb-2 mb-3">Common Learning Paths</h3>
          <ul className="list-disc list-inside space-y-2 text-primary-50">
            {details.learningPaths.map((lp, i) => <li key={i}>{lp}</li>)}
          </ul>
        </div>

        <hr className="my-8 border-primary-700 border-2" />


        <div className="mt-8 bg-primary-800 rounded-xl p-4 hover:bg-primary-500 transition-colors duration-200">
          <h3 className="text-2xl font-bold text-primary-100">Your learning path</h3>
          <p className="text-primary-50 mt-2">Get a custom, step-by-step guide from our AI career coach.</p>
          <button 
            onClick={handleGeneratePath}
            disabled={isPathLoading}
            className="mt-8 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 disabled:bg-green-400"
          >
            {isPathLoading ? "Generating...":"Generate My Path"}
          </button>

          <div className="mt-6 prose prose-lg max-w-none bg-primary-100 rounded-xl px-4 text-primary-800">
            {isPathLoading && <p>Generating your custom path, please wait...</p>}
            <ReactMarkdown>{learningPath}</ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
    );
}
export default DetailsPage;