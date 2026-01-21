import { useEffect, useState } from "react";
import { db, auth } from "../services/firebaseConfig";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaHandHoldingHeart, FaMapMarkerAlt, FaUser, FaSearch } from "react-icons/fa";

const CommunityNeeds = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    // Fetch all unfulfilled needs, ordered by newest
    const q = query(
        collection(db, "recent_demands"), 
        orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(d => d.status !== 'fulfilled'); // Hide fulfilled needs
      
      setNeeds(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredNeeds = needs.filter(n => 
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-slideDown">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* HEADER */}
        <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-pink-100 text-pink-600 text-sm font-bold uppercase tracking-wider mb-2">
                Community Board
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Help Your Neighbors ❤️
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                These are items currently requested by people in your community. 
                If you have one lying around, you can be a hero today!
            </p>
        </div>

        {/* SEARCH */}
        <div className="max-w-xl mx-auto mb-12 relative">
            <FaSearch className="absolute left-5 top-4 text-gray-400 text-lg"/>
            <input 
                type="text" 
                placeholder="Search for items (e.g. 'Books', 'Cycle')..." 
                className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition-all text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* GRID */}
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                    <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
                ))}
             </div>
        ) : filteredNeeds.length === 0 ? (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">🙌</div>
                <h3 className="text-2xl font-bold text-gray-800">No active requests!</h3>
                <p className="text-gray-500">The community is fully stocked for now.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNeeds.map((need) => (
                    <div key={need.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
                        
                        {/* Image Header */}
                        <div className="h-48 bg-pink-50 relative flex items-center justify-center p-6 overflow-hidden">
                             {need.imageUrl ? (
                                 <img src={need.imageUrl} alt={need.name} className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                             ) : (
                                 <span className="text-7xl group-hover:scale-125 transition-transform duration-300">{need.emoji}</span>
                             )}
                             
                             {/* Badge for own posts */}
                             {need.requestedById === uid && (
                                 <div className="absolute top-3 right-3 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                     Your Post
                                 </div>
                             )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">{need.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
                                    <span className="flex items-center gap-1"><FaUser/> {need.fullName}</span>
                                    {need.address && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 truncate max-w-[100px]"><FaMapMarkerAlt/> {need.address}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm line-clamp-3 mb-6 bg-pink-50/50 p-3 rounded-xl italic">
                                "{need.description || "I need this item..."}"
                            </p>

                            <div className="mt-auto">
                                {need.requestedById === uid ? (
                                    <button 
                                        disabled
                                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-bold cursor-default"
                                    >
                                        Manage in My Requests
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => navigate(`/contribute/${need.id}`)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:to-pink-700 transition flex items-center justify-center gap-2"
                                    >
                                        <FaHandHoldingHeart className="text-lg"/> I Can Help
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default CommunityNeeds;
