import {useEffect, useState} from "react"
import {Link} from "react-router-dom";

function HomePage(){
    const [domains,setDomains]=useState([]);

    useEffect(() =>{
        fetch("http://localhost:5000/api/professions")
        .then(res=>res.json())
        .then(data=>setDomains(data));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-center mb-6">Career Guidance AI</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {
                    domains.map(domain => (
                        <Link
                            key={domain.id}
                            to={`/domain/${domain.id}`}
                            className="bg-white text-center p-4 rounded-xl shadow hover:bg-blue-100 transition"
                        >
                            {domain.name}
                        </Link>
                    ))
                }
            </div>
        </div>
    );
}
export default HomePage;