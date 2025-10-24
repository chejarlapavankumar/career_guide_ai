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
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-center mb-6">Career Guidance AI</h1>

            <p className="text-center text-lg text-gray-600 mb-8">
                Describe your interests and find your perfect career path.
            </p>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8 flex">
                <input
                    type="text"
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                    placeholder="eg., i enjoy solving puzzles and working with data"
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-blue-500"
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700">
                    Search
                </button>
            </form>

            <h2 className="text-2xl font-semibold mb-4 text-center">
                {searchResults.length>0 ? "Top Recommendations" : "Or, Choose a Domain"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {displayList.map(item => (
                <Link
                    key={item.id}
                    to={searchResults.length > 0 ? `/profession/${item.id}` : `/domain/${item.id}`}
                    className="bg-white text-center p-4 rounded-xl shadow-md hover:bg-blue-100 hover:shadow-lg transition transform hover:-translate-y-1"
                >
                    {item.name}
                </Link>
                ))}
            </div>
        </div>
    );
}
export default HomePage;