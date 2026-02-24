import {useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";

function SubProfessionsPage(){
    const {domainId} = useParams();
    const [subProfessions,setSubProfessions]=useState([]);
    const [isLoading, setIsLoading] =useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/professions/parent/${domainId}`)
        .then(res=> res.json())
        .then(data=> {setSubProfessions(data);
            setIsLoading(false);
    });
    }, [domainId]);

    if(isLoading){
        return <div className="p-8 text-center">Loading professions...</div>
    }


    return(
        <div className="min-h-screen bg-primary-100 p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-primary-900">Select a Profession</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {
                    subProfessions.map(prof => (
                        <Link
                            key={prof.id}
                            to={`/profession/${prof.id}`}
                            className="bg-primary-700 text-white text-center p-4 rounded-xl shadow hover:bg-primary-500 transition"
                        >
                            {prof.name}
                        </Link>
                    ))
                }
            </div>
        </div>
    );

}
export default SubProfessionsPage;