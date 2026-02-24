import {useEffect, useState} from "react"
import {Link} from "react-router-dom";

function HomePage(){
    const [domains,setDomains]=useState([]);
    const [searchResults, setSearchResults]=useState([]);
    const [query,setQuery]=useState("");

    useEffect(() =>{
        fetch(`${import.meta.env.VITE_API_URL}/api/professions`)
        .then(res=>res.json())
        .then(data=>setDomains(data));
    }, []);

    const handleSearch= (e) =>{
        e.preventDefault();
        if(query.trim()===""){
            setSearchResults([]);
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/search`,{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({query:query})
        })
        .then(res=>res.json())
        .then(data=>setSearchResults(data));
    }
    const displayList= searchResults.length >0 ? searchResults :domains;

    return (
        <div className="min-h-screen bg-white p-8">
            <h1 className="text-primary-900 font-bold text-center mb-6 text-5xl tracking-tight">Career Guidance AI</h1>

            <p className="text-center text-lg text-primary-500 mb-8">
                Drop your interests here and find your perfect career path.
            </p>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8 flex">
                <input
                    type="text"
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                    placeholder="eg., i enjoy solving puzzles and working with data"
                    className="w-full px-4 py-2 border border-coral-700 placeholder-coral-500 bg-coral-50 text-coral-500 rounded-l-lg focus:outline-none focus:ring-primary-500"
                />
                <button type="submit" className="bg-coral-500 text-white px-6 py-2 rounded-r-lg hover:bg-coral-700">
                    Search
                </button>
            </form>

            <hr className="my-8 border-primary-700 border-2" />


            <h2 className="text-2xl font-semibold mb-4 text-center text-primary-600">
                {searchResults.length>0 ? "Top Recommendations" : "Or, Choose a Domain"}
            </h2>

            <div className="flex flex-wrap justify-center gap-4 max-w-7xl mx-auto">
                {displayList.map(item => (
                <Link
                    key={item.id}
                    to={searchResults.length > 0 ? `/profession/${item.id}` : `/domain/${item.id}`}
                    className="sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%] bg-primary-700 text-center p-4 rounded-xl shadow-md hover:bg-primary-500 hover:shadow-lg transition transform hover:-translate-y-1 text-white duration-200"
                >
                    {item.name}
                </Link>
                ))}
            </div>
        </div>
    );
}
export default HomePage;