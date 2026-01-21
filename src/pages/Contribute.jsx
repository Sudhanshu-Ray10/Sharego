import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebaseConfig";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FaUser, FaPhone, FaMapMarkerAlt, FaHandHoldingHeart, FaArrowLeft, FaCommentDots } from "react-icons/fa";

const Contribute = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [demand, setDemand] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [donorPhone, setDonorPhone] = useState("");
  const [message, setMessage] = useState("");
  
  const donorId = auth.currentUser?.uid;
  const donorName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "User";

  useEffect(() => {
    const fetchDemand = async () => {
      try {
        const ref = doc(db, "recent_demands", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setDemand({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("Error fetching demand:", err);
      }
    };
    fetchDemand();
  }, [id]);

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!donorPhone) {
      alert("Please enter your phone number so they can contact you!");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "requests"), {
        itemId: id,
        itemName: demand.name,
        donorId: donorId,
        donorName: donorName,
        receiverId: demand.requestedById,
        receiverName: demand.fullName,
        phone: donorPhone,
        message: message || "I would like to fulfill your request!",
        status: "pending", 
        type: "fulfillment",
        createdAt: serverTimestamp(),
      });

      alert("🎉 Contribution offer sent! Check your chats.");
      navigate("/requests");

    } catch (err) {
      console.error("Error sending offer:", err);
      alert("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!demand) return <div className="flex h-screen items-center justify-center text-emerald-600 font-bold">Loading Details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 animate-slideDown">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: Demand Details */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-24">
            <div className="relative h-64 bg-pink-50 flex items-center justify-center p-8">
                 {demand.imageUrl ? (
                    <img src={demand.imageUrl} alt={demand.name} className="h-full w-full object-contain drop-shadow-md rounded-xl" />
                 ) : (
                    <div className="text-8xl">{demand.emoji}</div>
                 )}
                 <div className="absolute top-4 left-4 bg-white/90 text-pink-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                     Requested Item
                 </div>
            </div>
            
            <div className="p-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{demand.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-1"><FaUser className="text-pink-500"/> Asked by <strong>{demand.fullName}</strong></span>
                    {demand.address && (
                        <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-pink-500"/> {demand.address}</span>
                    )}
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 italic text-gray-600 mb-6">
                    "{demand.description || "No description provided."}"
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                    <FaHandHoldingHeart className="text-emerald-500 text-xl" />
                    <p className="text-xs text-gray-400 font-medium">By offering help, you can start a chat with the requester.</p>
                </div>
            </div>
        </div>

        {/* RIGHT: Offer Form */}
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Offer Help 🤝</h2>
                    <p className="text-gray-500 text-sm mt-1">Great! You have what they need. Connect now.</p>
                </div>

                <form onSubmit={handleContribute} className="space-y-5">
                    
                    <div className="opacity-60 pointer-events-none">
                         <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Your Name</label>
                         <div className="relative">
                            <FaUser className="absolute left-4 top-3.5 text-gray-400"/>
                            <input
                                type="text"
                                disabled
                                value={donorName}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Your Mobile Number</label>
                        <div className="relative">
                            <FaPhone className="absolute left-4 top-3.5 text-gray-400"/>
                            <input
                                type="tel"
                                placeholder="So they can contact you (e.g. +91...)"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                                value={donorPhone}
                                onChange={(e) => setDonorPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Message (Optional)</label>
                        <div className="relative">
                             <FaCommentDots className="absolute left-4 top-3.5 text-gray-400"/>
                            <textarea
                                rows="3"
                                placeholder="I have this item! When can I drop it off?"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none resize-none shadow-sm"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2 mt-4 ${
                            loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                        }`}
                    >
                        {loading ? "Sending..." : "Send Offer 💌"}
                    </button>
                </form>
            </div>

            <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-3 rounded-xl text-gray-500 hover:text-gray-800 font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
            >
                <FaArrowLeft /> Cancel & Go Back
            </button>
        </div>

      </div>
    </div>
  );
};

export default Contribute;
