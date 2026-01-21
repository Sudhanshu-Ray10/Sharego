import { useState, useEffect } from "react";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaTag, FaBoxOpen } from "react-icons/fa";

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  const categories = ["All", "Clothes", "Books", "Toys", "Electronics", "Furniture", "Shoes", "Kitchenware", "Other"];

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "items"),
      where("status", "==", "available")
      // orderBy("createdAt", "desc") // Requires index, safer to sort client-side for now or add index later
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((item) => item.donorId !== uid); // Don't show my own items
      
      setItems(data);
      setFilteredItems(data);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  // Handle Search & Filter
  useEffect(() => {
    let result = items;

    if (selectedCategory !== "All") {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerTerm) || 
        item.description?.toLowerCase().includes(lowerTerm) ||
        item.location?.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredItems(result);
  }, [searchTerm, selectedCategory, items]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-slideDown">
      
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                 Browse Donations <span className="text-emerald-600">🌍</span>
              </h1>
              <p className="text-gray-500 mb-8 max-w-2xl">
                 Discover items shared by your community. Request what you need and give it a second life.
              </p>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  
                  {/* Search Input */}
                  <div className="relative w-full md:w-96">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search items, locations..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-gray-700"
                      />
                  </div>

                  {/* Category Pills */}
                  <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 hide-scrollbar">
                      {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                                selectedCategory === cat 
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md" 
                                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                            }`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        
        {loading ? (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-emerald-50 p-6 rounded-full mb-4">
                    <FaBoxOpen className="text-4xl text-emerald-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No items found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                <button 
                    onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
                    className="mt-6 text-emerald-600 font-semibold hover:underline"
                >
                    Clear all filters
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate(`/request/${item.id}`)}
                        className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                    >
                        {/* Image */}
                        <div className="relative h-56 bg-gray-100 overflow-hidden flex items-center justify-center p-6">
                             <div className="absolute inset-0 bg-white/40 group-hover:bg-transparent transition-colors duration-300"></div>
                             <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"
                              />
                             {/* Badge */}
                             <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 shadow-sm flex items-center gap-1">
                                <FaTag className="text-[10px]" /> {item.category}
                             </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                    <FaMapMarkerAlt className="text-emerald-500" />
                                    <span className="truncate max-w-[150px]">{item.location || "Unknown Location"}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                    {item.description || "No description provided."}
                                </p>
                            </div>
                            
                            <button className="w-full mt-5 bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};

export default BrowseItems;
