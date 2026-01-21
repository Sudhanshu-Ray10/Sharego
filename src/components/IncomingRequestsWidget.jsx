import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/firebaseConfig";
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";
import { FaUser, FaCheck, FaTimes } from "react-icons/fa";

const IncomingRequestsWidget = ({ uid }) => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (!uid) return;
        
        // Listen for PENDING requests on MY items
        const q = query(
            collection(db, "requests"), 
            where("donorId", "==", uid), 
            where("status", "==", "pending"),
            limit(3)
        );

        const unsub = onSnapshot(q, (snap) => {
            setRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });

        return () => unsub();
    }, [uid]);

    if (requests.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6 mb-8 animate-slideDown">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-orange-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-200 text-xs">!</span>
                    Requests for your items
                </h3>
                <Link to="/requests" className="text-sm font-semibold text-orange-700 hover:text-orange-900 transition">
                    Review All ({requests.length})
                </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                                    <FaUser />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-800">{req.receiverName || "Someone"}</p>
                                    <p className="text-xs text-gray-500">wants "{req.itemName}"</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 italic mb-3">"{req.message || "I need this item..."}"</p>
                        </div>
                        
                        <div className="flex gap-2 mt-auto">
                            <Link 
                                to="/requests" 
                                className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold py-2 rounded-lg text-center transition"
                            >
                                Review Request
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IncomingRequestsWidget;
