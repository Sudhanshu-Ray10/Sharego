import { Link } from "react-router-dom";
import { FaBoxOpen, FaHandHoldingHeart, FaLeaf, FaArrowRight, FaClock } from "react-icons/fa";
import { MdVolunteerActivism, MdVerifiedUser } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, query, where, getDocs, limit, orderBy, onSnapshot } from "firebase/firestore";
import IncomingRequestsWidget from "../components/IncomingRequestsWidget";

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || "User";
  
  const [stats, setStats] = useState([
    { label: "Items Donated", value: 0, icon: <FaBoxOpen />, color: "bg-blue-100 text-blue-600" },
    { label: "Requests Made", value: 0, icon: <FaHandHoldingHeart />, color: "bg-pink-100 text-pink-600" },
    { label: "Pending", value: 0, icon: <FaLeaf />, color: "bg-green-100 text-green-600" },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [rawItems, setRawItems] = useState([]);
  const [rawRequests, setRawRequests] = useState([]); // Requests received (My Orders)
  const [rawFulfillments, setRawFulfillments] = useState([]); // Requests sent (My Donations/Fulfillments)

  // Data Fetching
  useEffect(() => {
      if(!user) return;
      
      // 1. Items I uploaded for donation
      const unsubscribeItems = onSnapshot(query(collection(db, "items"), where("donorId", "==", user.uid)), (snap) => {
          const items = snap.docs.map(d => ({id: d.id, ...d.data(), type: 'Donation', date: d.data().createdAt?.toDate() || new Date()}));
          setRawItems(items);
      });

      // 2. Requests I RECEIVED (People asking me for items) - Not used for stats directly but maybe activity? 
      // Actually Recent Activity uses requests I MADE (My Orders). 
      // Wait, "Requests Made" stat implies requests *I* made (where I am receiver). 
      // "Requests" collection: donorId = donor, receiverId = requester.
      // So "My Requests" = where receiverId == Me.
      const unsubscribeRequests = onSnapshot(query(collection(db, "requests"), where("receiverId", "==", user.uid)), (snap) => {
          const reqs = snap.docs.map(d => ({id: d.id, ...d.data(), type: 'Request', date: d.data().createdAt?.toDate() || new Date()}));
          setRawRequests(reqs);
      });

      // 3. Requests I SENT as a DONOR (Fulfilling Public Needs)
      // These are requests where I am the donorId, but they might not be linked to an 'item' in 'items' collection if it was a public need.
      // OR even if they are linked, this collection tracks the *transaction*.
      const unsubscribeFulfillments = onSnapshot(query(collection(db, "requests"), where("donorId", "==", user.uid)), (snap) => {
          const fulfills = snap.docs.map(d => ({id: d.id, ...d.data(), type: 'Fulfillment', date: d.data().createdAt?.toDate() || new Date()}));
          setRawFulfillments(fulfills);
      });

      return () => { unsubscribeItems(); unsubscribeRequests(); unsubscribeFulfillments(); };
  }, [user]);

  useEffect(() => {
      // items where status is completed
      const completedItems = rawItems.filter(i => i.status === 'completed').length;
      // fulfillments where status is completed (Public Needs I fulfilled)
      // Note: If I uploaded an item and someone requested it, a request exists where I am donorId.
      // We don't want to double count.
      // Standard Flow: Item (in items) -> Request (in requests).
      // Public Flow: No Item (in items) -> Request (in requests) with type='fulfillment'.
      // So we should count 'fulfillment' type requests that are completed.
      const completedFulfillments = rawFulfillments.filter(f => f.type === 'fulfillment' && f.status === 'completed').length;
      
      const totalCompletedDonations = completedItems + completedFulfillments;

      // Pending: Items assigned OR Fulfillments pending/accepted
      const pendingItems = rawItems.filter(i => i.status === 'assigned').length;
      const pendingFulfillments = rawFulfillments.filter(f => f.type === 'fulfillment' && (f.status === 'pending' || f.status === 'accepted')).length;
      
      const pendingRequests = rawRequests.filter(r => r.status === 'pending').length;

      setStats([
          { label: "Donations Completed", value: totalCompletedDonations, icon: <FaBoxOpen />, color: "bg-blue-100 text-blue-600" },
          { label: "Requests Made", value: rawRequests.length, icon: <FaHandHoldingHeart />, color: "bg-pink-100 text-pink-600" },
          { label: "Pending Actions", value: pendingItems + pendingFulfillments + pendingRequests, icon: <FaClock />, color: "bg-yellow-100 text-yellow-600" },
      ]);

      // Activity Feed
      // We want to show:
      // 1. Items I uploaded (Donation)
      // 2. Requests I made (Request)
      // 3. Fulfillments I offered (Fulfillment) - explicitly showing "You donated to X"
      
      // Filter rawFulfillments to only show 'fulfillment' type (Public Needs) to avoid duplicate showing of standard items?
      // Actually standard items show up as "Items" when uploaded. When accepted/completed, they update.
      // But "Fulfillment" records are the interaction.
      // Users want to see "Donated [Item] to [Person]".
      // For standard items: We have the Item record. It has receiverName (added in previous step).
      // For public needs: We have the Fulfillment record. It has receiverName.
      
      const relevantFulfillments = rawFulfillments.filter(f => f.type === 'fulfillment');
      
      const combined = [...rawItems, ...rawRequests, ...relevantFulfillments]
          .sort((a,b) => b.date - a.date)
          .slice(0, 5);
      
      const enhancedActivity = combined.map(item => {
          if(item.type === 'Donation') {
               if(item.status === 'completed') {
                    return { ...item, name: `Donated: ${item.name} (To ${item.receiverName?.split(' ')[0] || 'Someone'})`, icon: <FaBoxOpen /> };
               }
               if(item.status === 'assigned') {
                    return { ...item, name: `Promised: ${item.name} (To ${item.receiverName?.split(' ')[0] || 'Someone'})` };
               }
               return { ...item, name: `Listed: ${item.name}` };
          }
          if(item.type === 'Fulfillment') {
              return { 
                  ...item, 
                  name: `Donated: ${item.itemName} (To ${item.receiverName?.split(' ')[0] || 'User'})`,
                  icon: <FaBoxOpen /> // Use box icon for donations
              };
          }
          if(item.type === 'Request') {
               return { ...item, name: `Requested: ${item.itemName || item.name}` };
          }
          return item;
      });

      setRecentActivity(enhancedActivity);
      setLoading(false);

  }, [rawItems, rawRequests, rawFulfillments]);

  /* Skipping the fetch logic block I was replacing */


  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-slideDown pb-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-emerald-700">{userName}!</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's the summary of your kindness journey.</p>
        </div>
        <Link
          to="/add-item"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1"
        >
           <MdVolunteerActivism className="text-xl" /> Donate New Item
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        

        {/* INCOMING REQUESTS WIDGET - NEW */}
        <div className="lg:col-span-3">
             <IncomingRequestsWidget uid={user.uid} />
             
             {/* QUICK HELP CTA */}
             <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100 flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                     <span className="text-2xl">🤝</span>
                     <div>
                         <h3 className="font-bold text-pink-900">Want to help others?</h3>
                         <p className="text-xs text-pink-700">See what people in your community need right now.</p>
                     </div>
                 </div>
                 <Link to="/community-needs" className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl font-bold text-sm transition shadow-md shadow-pink-200">
                     View Needs
                 </Link>
             </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
             <Link to="/items" className="text-emerald-600 font-semibold text-sm hover:underline">View All</Link>
           </div>
           
           <div className="space-y-4">
             {loading && <p className="text-gray-400 text-center py-10">Loading activity...</p>}
             
             {!loading && recentActivity.length === 0 && (
                 <div className="text-center py-10 text-gray-400">
                     <p>No account activity yet.</p>
                     <Link to="/add-item" className="text-emerald-600 text-sm hover:underline">Start donating now</Link>
                 </div>
             )}

             {recentActivity.map((item) => (
               <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${item.type === 'Donation' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                        {item.type === 'Donation' ? <FaBoxOpen /> : <FaHandHoldingHeart />}
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {item.name || "Untitled Item"}
                        </h4>
                        <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                           <span>{item.type} • {item.date?.toLocaleDateString()}</span>
                           {/* Show who accepted the request */}
                           {item.type === 'Request' && item.acceptedBy && (
                                <span className="text-emerald-600 font-medium">Accepted by: {item.acceptedBy}</span>
                           )}
                           {item.type === 'Request' && item.status === 'pending' && (
                               <span className="text-yellow-600">Waiting for approval</span>
                           )}
                        </div>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      item.status === 'completed' || item.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                      item.status === 'assigned' || item.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                      {item.status || 'Pending'}
                  </span>
               </div>
             ))}
           </div>
        </div>

        {/* My Orders / Requests Status */}
        <div className="space-y-6">
            
            {/* My Orders Card (Replacing Impact Card) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MdVerifiedUser className="text-emerald-500"/> My Orders
                 </h3>
                 <p className="text-gray-500 text-sm mb-4">
                     Track the status of items you have requested.
                 </p>
                 
                {!loading && recentActivity.filter(i => i.type === 'Request').length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-400">
                        No active orders.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentActivity.filter(i => i.type === 'Request').slice(0, 3).map(req => (
                            <div key={req.id} className="flex items-center justify-between text-sm">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-700 truncate w-32">{req.itemName || req.name}</span>
                                    {req.acceptedBy && <span className="text-[10px] text-gray-400">by {req.acceptedBy}</span>}
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    req.status === 'accepted' || req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {req.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                 <div className="mt-6 pt-4 border-t border-gray-50">
                    <Link to="/my-requests" className="w-full block text-center text-emerald-600 text-sm font-bold hover:bg-emerald-50 py-2 rounded-lg transition-colors">
                        View All Orders
                    </Link>
                 </div>
            </div>

            {/* Help Card */}
            <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Need something?</h3>
                <p className="text-orange-800/70 text-sm mb-4">
                    Don't hesitate to ask. The community is here to help you.
                </p>
                <Link to="/ask-item" className="inline-flex items-center text-orange-700 font-bold hover:text-orange-800">
                    Request an Item <FaArrowRight className="ml-2 text-sm" />
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}
