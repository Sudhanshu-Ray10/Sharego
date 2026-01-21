import { useEffect, useState } from "react";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, onSnapshot, doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/ChatContext";
import { FaHeart, FaGift, FaTrash } from "react-icons/fa";

const MyRequests = () => {
  const uid = auth.currentUser?.uid;
  const navigate = useNavigate();
  const { openChat } = useChat();

  const [activeTab, setActiveTab] = useState("direct"); // 'direct' or 'public'
  
  const [requests, setRequests] = useState([]);      // Direct requests for items
  const [myManyNeeds, setMyManyNeeds] = useState([]); // Public "Ask Item" posts
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    // 1. Fetch Direct Requests (Requests I made for specific items)
    const q1 = query(collection(db, "requests"), where("receiverId", "==", uid));
    const unsub1 = onSnapshot(q1, async (snap) => {
      const data = [];
      for (const d of snap.docs) {
        const req = { id: d.id, ...d.data() };
        // Fetch linked item image
        try {
          if (req.itemId) {
              const itemRef = doc(db, "items", req.itemId);
              const itemSnap = await getDoc(itemRef);
              if (itemSnap.exists()) {
                req.imageUrl = itemSnap.data().imageUrl || null;
              }
          }
        } catch (err) {
          console.error("Item image fetch error:", err);
        }
        data.push(req);
      }
      setRequests(data);
      setLoading(false);
    });

    // 2. Fetch Public Needs (Items I posted in "Ask Item")
    const q2 = query(collection(db, "recent_demands"), where("requestedById", "==", uid));
    const unsub2 = onSnapshot(q2, (snap) => {
        const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setMyManyNeeds(data);
    });

    return () => {
        unsub1();
        unsub2();
    };
  }, [uid]);

  const handleDeleteNeed = async (id) => {
      if(!window.confirm("Are you sure you want to delete this public request?")) return;
      try {
          await deleteDoc(doc(db, "recent_demands", id));
      } catch (err) {
          alert("Error deleting: " + err.message);
      }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-emerald-600 font-bold">Loading your requests...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4 animate-slideDown">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-5xl border border-gray-100 relative">
        
        <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">My Requests 📦</h2>
            <p className="text-gray-500">Track items you've asked for.</p>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-4 mb-8">
            <button 
                onClick={() => setActiveTab("direct")}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                    activeTab === "direct" 
                    ? "bg-green-600 text-white shadow-lg shadow-green-200" 
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
                <FaGift className="inline mr-2 mb-1"/> Direct Requests
            </button>
            <button 
                onClick={() => setActiveTab("public")}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                    activeTab === "public" 
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-200" 
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
                <FaHeart className="inline mr-2 mb-1"/> Public Needs
            </button>
        </div>

        {/* --- TAB 1: DIRECT REQUESTS --- */}
        {activeTab === "direct" && (
            <div className="animate-fadeIn">
                {requests.length === 0 ? (
                    <div className="flex flex-col items-center p-10 text-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">🎁</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No requests yet</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">
                            Browse donated items and request what you need directly from donors.
                        </p>
                        <button onClick={() => navigate("/browse-items")} className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                            Browse Items
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {requests.map((req) => (
                        <div key={req.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col overflow-hidden group">
                             <div className="p-4 flex gap-4 items-center bg-gray-50/50">
                                <img 
                                    src={req.imageUrl || "https://cdn-icons-png.flaticon.com/512/4076/4076549.png"} 
                                    alt="Item" 
                                    className="w-16 h-16 object-contain bg-white rounded-lg border border-gray-100"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition">{req.itemName}</h3>
                                    <p className="text-xs text-gray-500">Donor: {req.donorName || "Unknown"}</p>
                                </div>
                             </div>
                             
                             <div className="p-4 border-t border-gray-100 flex flex-col justify-between flex-1">
                                 {/* Status Steps */}
                                 <div className="flex items-center justify-between relative text-xs font-semibold text-gray-400 mb-4 px-2">
                                     <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                                     
                                     <div className={`flex flex-col items-center bg-white px-1 z-10 ${req.status === 'pending' || req.status === 'accepted' || req.status === 'completed' ? 'text-yellow-600' : ''}`}>
                                         <div className={`w-3 h-3 rounded-full mb-1 ${req.status === 'pending' || req.status === 'accepted' || req.status === 'completed' ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                                         Pending
                                     </div>
                                      <div className={`flex flex-col items-center bg-white px-1 z-10 ${req.status === 'accepted' || req.status === 'completed' ? 'text-blue-600' : ''}`}>
                                         <div className={`w-3 h-3 rounded-full mb-1 ${req.status === 'accepted' || req.status === 'completed' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                         Accepted
                                     </div>
                                      <div className={`flex flex-col items-center bg-white px-1 z-10 ${req.status === 'completed' ? 'text-green-600' : ''}`}>
                                         <div className={`w-3 h-3 rounded-full mb-1 ${req.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                         Received
                                     </div>
                                 </div>
                                 
                                 {req.status === 'accepted' && (
                                     <div className="flex flex-col gap-2 w-full">
                                         <button
                                             onClick={() => openChat(req.id)}
                                             className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                         >
                                             Chat with Donor 💬
                                         </button>
                                         <button
                                             onClick={async () => {
                                                 if(!window.confirm("Confirm you received this item?")) return;
                                                 try {
                                                     // 1. Mark Request as Completed
                                                     await updateDoc(doc(db, "requests", req.id), { status: "completed" });
                                                     
                                                     // 2. Mark Item as Completed (if linked)
                                                     if(req.itemId) {
                                                         // Check if it's a standard item or public need
                                                         // Standard items are in 'items' collection. Public needs in 'recent_demands'.
                                                         // We can try updating 'items' first. If it fails or doesn't exist, it might be a demand, 
                                                         // but 'demands' usually don't track 'completed' in the same way (they become fulfilled).
                                                         // Let's assume standard item for stats counting.
                                                         const itemRef = doc(db, "items", req.itemId);
                                                         // We can use a check or just try update. 
                                                         // To be safe, let's just update. If it doesn't exist (public need), it might be ignored or error.
                                                         // Better: Check if we have 'type' in request?
                                                         if (req.type !== 'fulfillment') {
                                                             await updateDoc(itemRef, { status: "completed" });
                                                         } else {
                                                             // It's a public need. 'recent_demands'.
                                                             // We might want to mark the demand as fully closed if not already?
                                                             // Usually 'fulfilled' is set on accept. 'completed' confirms dropoff.
                                                             await updateDoc(doc(db, "recent_demands", req.itemId), { status: "completed" });
                                                         }
                                                     }
                                                     alert("Nice! Transaction completed. 🎉");
                                                 } catch (e) {
                                                     console.error("Error completing:", e);
                                                     alert("Error updating status");
                                                 }
                                             }}
                                             className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-md shadow-green-100"
                                         >
                                             Mark as Received ✅
                                         </button>
                                     </div>
                                 )}
                                 {req.status === 'declined' && (
                                     <div className="w-full py-2 bg-red-50 text-red-500 font-bold rounded-lg text-center text-sm">
                                         Request Declined
                                     </div>
                                 )}
                             </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- TAB 2: PUBLIC NEEDS --- */}
        {activeTab === "public" && (
             <div className="animate-fadeIn">
                {myManyNeeds.length === 0 ? (
                    <div className="flex flex-col items-center p-10 text-center">
                        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">📢</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No public needs posted</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">
                            Broadcast what you need to the community so anyone can help.
                        </p>
                        <button onClick={() => navigate("/ask-item")} className="mt-6 px-6 py-2 bg-pink-500 text-white rounded-lg font-bold hover:bg-pink-600">
                            Ask for Help
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myManyNeeds.map((need) => (
                            <div key={need.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden relative group">
                                <div className="h-40 bg-gray-100 relative">
                                    <img src={need.imageUrl} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button 
                                            onClick={() => handleDeleteNeed(need.id)}
                                            className="bg-white p-2 rounded-full text-red-500 shadow-md hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                                            title="Delete Post"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        {need.emoji} {need.name}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-600 text-sm line-clamp-2 italic mb-3">"{need.description}"</p>
                                    <p className="text-xs text-gray-400">Posted on: {need.createdAt ? new Date(need.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        )}

      </div>
    </div>
  );
};

export default MyRequests;
