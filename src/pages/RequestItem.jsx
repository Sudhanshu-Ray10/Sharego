import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebaseConfig";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FaUser, FaPhone, FaMapMarkerAlt, FaCommentAlt, FaArrowLeft, FaGift } from "react-icons/fa";

const RequestItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  const receiverId = auth.currentUser?.uid;
  const receiverName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "User";

  const fetchItem = async () => {
    try {
      const ref = doc(db, "items", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.log("Error fetching item:", err);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!phone || !address) {
      alert("Please fill phone and address!");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "requests"), {
        itemId: id,
        itemName: item.name,
        donorId: item.donorId,
        donorName: item.donorName,
        receiverId,
        receiverName,
        phone,
        address,
        message,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("🎉 Request sent successfully!");
      navigate("/browse-items");

    } catch (err) {
      console.error("Error sending request:", err);
      alert("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return <div className="flex justify-center items-center h-screen text-emerald-600 font-bold">Loading Item Details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 animate-slideDown">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: Item Details Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-24">
            <div className="relative h-64 bg-gray-100 flex items-center justify-center p-8">
                 <img
                    src={item.imageUrl || "https://cdn-icons-png.flaticon.com/512/4076/4076549.png"}
                    alt={item.name}
                    className="h-full w-full object-contain drop-shadow-md"
                  />
                 <div className="absolute top-4 left-4 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                     {item.category}
                 </div>
            </div>
            
            <div className="p-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{item.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-1"><FaUser className="text-emerald-500"/> Donated by <strong>{item.donorName}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-emerald-500"/> {item.location || "Location not specified"}</span>
                </div>
                
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                    {item.description || "No description provided."}
                </p>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                    <FaGift className="text-emerald-500 text-xl" />
                    <p className="text-xs text-gray-400 font-medium">Requesting this item notifies the donor immediately.</p>
                </div>
            </div>
        </div>

        {/* RIGHT: Request Form */}
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Send Request 💌</h2>
                    <p className="text-gray-500 text-sm mt-1">Provide your details so the donor can contact you.</p>
                </div>

                <form onSubmit={handleRequest} className="space-y-5">
                    
                    <div className="opacity-60 pointer-events-none">
                         <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Your Name</label>
                         <div className="relative">
                            <FaUser className="absolute left-4 top-3.5 text-gray-400"/>
                            <input
                                type="text"
                                disabled
                                value={receiverName}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Phone Number</label>
                        <div className="relative">
                            <FaPhone className="absolute left-4 top-3.5 text-gray-400"/>
                            <input
                                type="tel"
                                placeholder="e.g. +91 98765 43210"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Delivery Address / Pickup Plan</label>
                        <div className="relative">
                             <FaMapMarkerAlt className="absolute left-4 top-3.5 text-gray-400"/>
                             <textarea
                                rows="3"
                                placeholder="Enter your full address or propose a pickup time/place..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none resize-none shadow-sm"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Message to Donor (Optional)</label>
                        <div className="relative">
                             <FaCommentAlt className="absolute left-4 top-3.5 text-gray-400"/>
                            <textarea
                                rows="3"
                                placeholder="Why do you need this item?"
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
                        {loading ? "Sending..." : "Confirm Request"}
                    </button>
                </form>
            </div>

            <button
                onClick={() => navigate("/browse-items")}
                className="w-full py-3 rounded-xl text-gray-500 hover:text-gray-800 font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
            >
                <FaArrowLeft /> Cancel & Go Back
            </button>
        </div>

      </div>
    </div>
  );
};

export default RequestItem;
