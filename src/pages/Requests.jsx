import { useEffect, useState } from "react";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/ChatContext";
import { FaUser, FaMapMarkerAlt, FaPhone, FaCheckCircle, FaTimesCircle, FaCommentDots } from "react-icons/fa";

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const uid = auth.currentUser?.uid;
    const navigate = useNavigate();
    const { openChat } = useChat();

    // Separate requests by status
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const pastRequests = requests.filter(r => r.status !== 'pending');

    useEffect(() => {
        if (!uid) return;
        const q = query(collection(db, "requests"), where("donorId", "==", uid));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Sort pending first
            setRequests(data);
        });
        return () => unsub();
    }, [uid]);

    const handleDecision = async (id, decision) => {
        if(!window.confirm(`Are you sure you want to ${decision} this request?`)) return;
        
        await updateDoc(doc(db, "requests", id), { status: decision });
        
        if(decision === 'accepted') {
             const req = requests.find(r => r.id === id);
             if(req) {
                 if (req.type === 'fulfillment') {
                     // It was a Public Need (Demand)
                     // Update the status of the Demand to 'fulfilled' so it disappears from Community Board
                     // AND remove/hide other requests for this demand? For now just mark demand as done.
                     if (req.itemId) {
                         try {
                            await updateDoc(doc(db, "recent_demands", req.itemId), { 
                                status: "fulfilled",
                                fulfilledBy: req.donorId,
                                fulfilledByName: req.donorName
                            });
                         } catch (e) {
                             console.log("Error updating demand:", e);
                         }
                     }
                 } else {
                     // It was a Standard Item Donation
                     if(req.itemId) {
                         try {
                            await updateDoc(doc(db, "items", req.itemId), { 
                                status: "assigned",
                                receiverId: req.receiverId,
                                receiverName: req.receiverName
                            });
                         } catch (e) {
                             console.log("Error updating item:", e);
                         }
                     }
                 }
             }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 animate-slideDown">
            <div className="max-w-5xl mx-auto space-y-8">
                
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Requests</h1>
                    <p className="text-gray-500 mt-2">Approve or decline requests for your donated items</p>
                </div>

                {/* PENDING REQUESTS SECTION */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        ⏳ Pending Actions <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{pendingRequests.length}</span>
                    </h2>
                    
                    {pendingRequests.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm text-gray-400">
                            Great! No pending requests.
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg border-l-4 border-l-yellow-400 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-500 uppercase">Item Request</span>
                                            <h3 className="text-lg font-bold text-emerald-700">{req.itemName}</h3>
                                        </div>
                                        
                                        <div className="flex items-start gap-4 mt-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <FaUser />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{req.receiverName || "Unknown User"}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                    {req.phone && <span className="flex items-center gap-1"><FaPhone className="text-xs"/> {req.phone}</span>}
                                                    {req.address && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-xs"/> {req.address}</span>}
                                                </div>
                                                <div className="mt-3 bg-gray-50 p-3 rounded-lg text-gray-700 italic text-sm border border-gray-100">
                                                    "{req.message || "I would really appreciate this item."}"
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                                        <button 
                                            onClick={() => handleDecision(req.id, "accepted")}
                                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-md"
                                        >
                                            <FaCheckCircle /> Accept
                                        </button>
                                        <button 
                                            onClick={() => handleDecision(req.id, "declined")}
                                            className="w-full py-2 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                                        >
                                            <FaTimesCircle /> Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PAST REQUESTS */}
                {pastRequests.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Past History</h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {pastRequests.map((req, idx) => (
                                <div key={req.id} className={`p-4 flex flex-col md:flex-row justify-between items-center gap-4 ${idx !== pastRequests.length -1 ? "border-b border-gray-100" : ""}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                            req.status === 'accepted' ? 'bg-emerald-500' : 'bg-red-400'
                                        }`}>
                                            {req.status === 'accepted' ? '✓' : '✕'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{req.itemName}</p>
                                            <p className="text-xs text-gray-500">Requested by {req.receiverName} • {req.status}</p>
                                        </div>
                                    </div>
                                    
                                    {req.status === 'accepted' && (
                                        <button 
                                            onClick={() => openChat(req.id)}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-100 transition"
                                        >
                                            <FaCommentDots /> Chat
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Requests;
