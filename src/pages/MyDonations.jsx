import { useState, useEffect } from "react";
import { auth, db } from "../services/firebaseConfig";
import { doc, updateDoc, query, where, onSnapshot, collection, getDocs, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { uploadImageToCloudinary } from "../services/cloudinary";

const MyDonations = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const uid = auth.currentUser?.uid;

  // 🎯 REALTIME LISTENER
  useEffect(() => {
    if (!uid) return;

    const q = query(collection(db, "items"), where("donorId", "==", uid));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
    });

    return () => unsub();
  }, [uid]);

  const markDelivered = async (item) => {
    try {
      // Update item status
      await updateDoc(doc(db, "items", item.id), {
        status: "completed"
      });

      // Update accepted request status
      const q = query(
        collection(db, "requests"),
        where("itemId", "==", item.id),
        where("status", "==", "accepted")
      );

      const snap = await getDocs(q);
      snap.forEach(async (reqDoc) => {
        await updateDoc(doc(db, "requests", reqDoc.id), {
          status: "completed"
        });
      });

      alert("🎉 Donation marked as delivered!");
    } catch (err) {
      console.error("Delivery marking error:", err);
      alert("❌ Something went wrong");
    }
  };

  const handleDelete = async (itemId) => {
      if(!window.confirm("⚠️ Are you sure you want to delete this item?")) return;
      try {
          await deleteDoc(doc(db, "items", itemId));
          alert("🗑️ Item deleted successfully.");
      } catch (error) {
          console.error("Delete error:", error);
          alert("❌ Failed to delete item.");
      }
  }

  const handleEditClick = (item) => {
      setEditingItem(item);
      setEditForm({
          name: item.name,
          category: item.category,
          description: item.description,
          location: item.location || "",
          imageUrl: item.imageUrl
      });
  }

  const handleEditChange = (e) => {
      setEditForm({...editForm, [e.target.name]: e.target.value});
  }

  const handleEditImage = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      setUploading(true);
      try {
          const url = await uploadImageToCloudinary(file);
          setEditForm(prev => ({...prev, imageUrl: url}));
      } catch (error) {
          alert("Image upload failed");
      } finally {
          setUploading(false);
      }
  }

  const handleEditSave = async () => {
      try {
          await updateDoc(doc(db, "items", editingItem.id), {
              name: editForm.name,
              category: editForm.category,
              description: editForm.description,
              location: editForm.location,
              imageUrl: editForm.imageUrl
          });
          setEditingItem(null);
          alert("✅ Item updated successfully!");
      } catch (error) {
          console.error("Update error:", error);
          alert("❌ Failed to update item.");
      }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl space-y-6 border border-gray-200 relative">
        <h2 className="text-3xl font-extrabold text-green-700 text-center">
          My Donations 📦
        </h2>
        <p className="text-gray-600 text-center">
          Items you have shared to help others 💚
        </p>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="flex flex-col items-center p-10">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
              className="w-40 opacity-70"
            />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">
              You haven't donated yet!
            </h3>
            <p className="text-gray-500 mt-1">
              Start by adding your first item.
            </p>

            <button
              onClick={() => navigate("/add-item")}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-xl"
            >
              ➕ Donate an Item
            </button>
          </div>
        )}

        {/* Items Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-50 flex items-center justify-center p-4">
                     <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
                      />
                     
                     {/* Edit Actions Overlay */}
                     {item.status === 'available' && (
                         <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditClick(item)}
                                className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-emerald-600 hover:scale-110 transition"
                                title="Edit"
                              >
                                  ✏️
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-red-500 hover:scale-110 transition"
                                title="Delete"
                              >
                                  🗑️
                              </button>
                         </div>
                     )}

                     <div className="absolute bottom-3 left-3">
                         <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                             item.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 
                             item.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                         }`}>
                             {item.status}
                         </span>
                     </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                {item.name}
                             </h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 truncate">📍 {item.location || "Unknown Location"}</p>
                        
                        {item.status === "assigned" && (
                             <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 mt-2">
                                 <p className="text-xs text-yellow-800 font-semibold mb-2">Item requested!</p>
                                 <button
                                    onClick={() => markDelivered(item)}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black/80 font-bold py-1.5 rounded-md text-xs transition"
                                 >
                                    Mark Delivered ✔
                                 </button>
                             </div>
                        )}
                         {item.status === "completed" && (
                             <p className="text-xs text-blue-600 font-semibold mt-2 flex items-center gap-1">
                                 ✨ Donated & Delivered
                             </p>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="w-full mt-6 py-3 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
        >
          ⬅ Back to Home
        </button>

        {/* --- EDIT MODAL --- */}
        {editingItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold text-green-700 mb-4">Edit Item ✏️</h3>
                    
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-2 mb-4">
                            <img src={editForm.imageUrl} className="h-24 w-24 object-cover rounded-lg border"/>
                            <label className="text-blue-600 text-sm cursor-pointer hover:underline">
                                Change Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleEditImage} />
                            </label>
                            {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
                        </div>

                        <input 
                            name="name" 
                            value={editForm.name} 
                            onChange={handleEditChange} 
                            placeholder="Item Name" 
                            className="w-full border p-2 rounded-lg"
                        />
                        <select 
                            name="category" 
                            value={editForm.category} 
                            onChange={handleEditChange} 
                            className="w-full border p-2 rounded-lg"
                        >
                            <option value="Clothes">Clothes</option>
                            <option value="Books">Books</option>
                            <option value="Toys">Toys</option>
                            <option value="Shoes">Shoes</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Kitchenware">Kitchenware</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Other">Other</option>
                        </select>
                        <textarea 
                            name="description" 
                            value={editForm.description} 
                            onChange={handleEditChange} 
                            placeholder="Description" 
                            rows="3" 
                            className="w-full border p-2 rounded-lg"
                        />
                        <input 
                            name="location" 
                            value={editForm.location} 
                            onChange={handleEditChange} 
                            placeholder="Pickup Location" 
                            className="w-full border p-2 rounded-lg"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button 
                            onClick={() => setEditingItem(null)}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleEditSave}
                            disabled={uploading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default MyDonations;
