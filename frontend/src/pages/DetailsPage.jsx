import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";


function DetailsPage(){
    const {professionId} = useParams();
    const [details,setDetails]=useState(null);
    const [isLoading,setIsLoading]=useState(true);

    useEffect(() => {
      setIsLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/professions/${professionId}`)
        .then(res=>res.json())
        .then(data=> {
          setDetails(data)
          setIsLoading(false);
        });
    }, [professionId]);

    if(isLoading){
        return <SkeletonLoader/>;
    }
    return(
      <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800">{details.name}</h2>
        <p className="mt-2 text-lg text-gray-600">{details.description}</p>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3">Key Responsibilities</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {details.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {details.skills.map(s => (
              <span key={s.id} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {s.skill_name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3">Common Learning Paths</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {details.learningPaths.map((lp, i) => <li key={i}>{lp}</li>)}
          </ul>
        </div>
      </div>
    </div>
    );
}
export default DetailsPage;