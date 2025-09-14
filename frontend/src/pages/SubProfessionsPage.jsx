import {useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";

function SubProfessionsPage(){
    const {domainId} = useParams();
    const [subProfessions,setSubProfessions]=useState([]);

    useEffect(() => {
        fetch(`http://localhost:5000/api/professions/parent/${domainId}`)
        .then(res=> res.json())
        .then(data=> setSubProfessions(data));
    }, [domainId]);

    return(
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-center mb-6">Select a Profession</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {
                    subProfessions.map(prof => (
                        <Link
                            key={prof.id}
                            to={`/profession/${prof.id}`}
                            className="bg-white text-center p-4 rounded-xl shadow hover:bg-green-100 transition"
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