import { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";

const Cleanup = () => {
  const [logs, setLogs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [orphans, setOrphans] = useState([]);

  const addLog = (msg) => setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const scanDatabase = async () => {
    setScanning(true);
    setLogs([]);
    setOrphans([]);
    addLog("🔍 Starting Scan...");

    try {
      const orphansFound = [];

      // 1. Scan Items
      const itemsSnap = await getDocs(collection(db, "items"));
      addLog(`Found ${itemsSnap.size} items. Checking owners...`);
      
      for (const itemDoc of itemsSnap.docs) {
        const item = itemDoc.data();
        
        if (!item.donorId) {
            addLog(`⚠️ Broken Item Found: "${item.name}" (ID: ${itemDoc.id}) - No 'donorId' field`);
            orphansFound.push({ type: "items", id: itemDoc.id, name: item.name });
            continue;
        }

        const userRef = doc(db, "users", item.donorId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            addLog(`⚠️ Orphan Item Found: "${item.name}" (ID: ${itemDoc.id}) - Owner missing (ID: ${item.donorId})`);
            orphansFound.push({ type: "items", id: itemDoc.id, name: item.name });
        }
      }

      // 2. Scan Recent Demands
      const demandsSnap = await getDocs(collection(db, "recent_demands"));
      addLog(`Found ${demandsSnap.size} demands. Checking owners...`);

      for (const demandDoc of demandsSnap.docs) {
        const demand = demandDoc.data();

        if (!demand.requestedById) {
            addLog(`⚠️ Broken Demand Found: "${demand.name}" (ID: ${demandDoc.id}) - No 'requestedById' field`);
            orphansFound.push({ type: "recent_demands", id: demandDoc.id, name: demand.name });
            continue;
        }

        const userRef = doc(db, "users", demand.requestedById);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
                addLog(`⚠️ Orphan Demand Found: "${demand.name}" (ID: ${demandDoc.id}) - Requester missing`);
                orphansFound.push({ type: "recent_demands", id: demandDoc.id, name: demand.name });
        }
      }

      setOrphans(orphansFound);
      addLog(`✅ Scan Complete. Found ${orphansFound.length} orphan records.`);

    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  const cleanDatabase = async () => {
      if(orphans.length === 0) return alert("Nothing to clean!");
      if(!window.confirm(`Delete ${orphans.length} orphan records? This cannot be undone.`)) return;

      setCleaning(true);
      try {
          for(const orphan of orphans) {
              await deleteDoc(doc(db, orphan.type, orphan.id));
              addLog(`🗑️ Deleted ${orphan.type}: ${orphan.name}`);
          }
          addLog("✨ Cleanup Finished Successfully!");
          setOrphans([]);
      } catch (error) {
          addLog(`❌ Delete Error: ${error.message}`);
      } finally {
          setCleaning(false);
      }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-mono">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Admin Database Cleanup Tool 🧹</h1>
        <p className="mb-6 text-gray-600">Scan for items/demands belonging to deleted users and remove them.</p>
        
        <div className="flex gap-4 mb-6">
            <button 
                onClick={scanDatabase} 
                disabled={scanning || cleaning}
                className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 disabled:bg-gray-400"
            >
                {scanning ? "Scanning..." : "Start Scan 🔍"}
            </button>

            {orphans.length > 0 && (
                <button 
                    onClick={cleanDatabase}
                    disabled={cleaning}
                    className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 disabled:bg-gray-400"
                >
                    {cleaning ? "Deleting..." : `Delete ${orphans.length} Orphans 🗑️`}
                </button>
            )}
        </div>

        <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto text-sm">
            {logs.length === 0 && <p className="text-gray-500">// Logs will appear here...</p>}
            {logs.map((log, i) => (
                <div key={i}>{log}</div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Cleanup;
