import { useState, useEffect } from "react";
import { db, auth } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { uploadImageToCloudinary } from "../services/cloudinary";
import { FaCloudUploadAlt, FaCamera, FaMapMarkerAlt, FaTag, FaInfoCircle } from "react-icons/fa";

const AddItem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const demandId = searchParams.get("demand");
  const uid = auth.currentUser?.uid;

  const [formData, setFormData] = useState({
      name: "",
      description: "",
      category: "",
      location: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myItems, setMyItems] = useState([]);

  // Fetch previous items slightly differently - maybe just a summary or simple list
  const fetchMyItems = async () => {
    if (!uid) return;
    try {
      const q = query(collection(db, "items"), where("donorId", "==", uid));
      const snap = await getDocs(q);
      setMyItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log("Error fetching items:", err);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, [uid]);

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setImageFile(file);
          setPreview(URL.createObjectURL(file));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, description, category, location } = formData;
    
    if (!name || !description || !category || !imageFile || !location) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    try {
      setLoading(true);
      const donorName = auth.currentUser.displayName || auth.currentUser.email.split('@')[0];
      const imageUrl = await uploadImageToCloudinary(imageFile);

      await addDoc(collection(db, "items"), {
        name,
        description,
        category,
        location,
        donorId: uid,
        donorName,
        imageUrl,
        status: "available",
        createdAt: serverTimestamp(),
      });

      if (demandId) {
        await updateDoc(doc(db, "recent_demands", demandId), { fulfilled: true });
      }

      alert("🎉 Item added successfully!");
      setFormData({ name: "", description: "", category: "", location: "" });
      setImageFile(null);
      setPreview(null);
      fetchMyItems();
      navigate("/items"); // Redirect to My Donations page

    } catch (err) {
      console.error(err);
      alert("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 animate-slideDown">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Donate an Item 🎁</h2>
                    <p className="text-gray-500 text-sm mt-1">Share the joy of giving. Please provide details.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Image Upload Area */}
                    <div className="group relative w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-white hover:border-emerald-500 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                                <FaCloudUploadAlt className="text-5xl mb-2" />
                                <span className="font-semibold">Click to Upload Image</span>
                                <span className="text-xs mt-1">Supports JPG, PNG</span>
                            </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                        {preview && (
                             <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-md text-gray-700 hover:text-red-500 z-10" onClick={(e) => { e.stopPropagation(); setPreview(null); setImageFile(null); }}>
                                 <FaCamera />
                             </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <input 
                                name="name"
                                type="text" 
                                placeholder="Item Name" 
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative">
                             <div className="absolute right-4 top-3.5 text-gray-400 pointer-events-none">
                                 <FaTag />
                             </div>
                            <select 
                                name="category"
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                <option value="Clothes">Clothes</option>
                                <option value="Books">Books</option>
                                <option value="Toys">Toys</option>
                                <option value="Shoes">Shoes</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Kitchenware">Kitchenware</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <textarea 
                        name="description"
                        rows="3" 
                        placeholder="Description (Condition, Size, Age...)" 
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none resize-none"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <div className="relative">
                         <FaMapMarkerAlt className="absolute left-4 top-3.5 text-gray-400" />
                        <input 
                            name="location"
                            type="text" 
                            placeholder="Pickup Location (City, Area)" 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>

                    <button 
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2 ${
                            loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200"
                        }`}
                    >
                        {loading ? "Uploading..." : "Publish Donation"}
                    </button>

                </form>
            </div>
        </div>

        {/* RIGHT COLUMN: TIPS & PREVIEW */}
        <div className="space-y-6">
            
            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-3">
                    <FaInfoCircle /> Posting Tips
                </h3>
                <ul className="space-y-2 text-sm text-blue-700/80 list-disc list-inside">
                    <li>Take clear, bright photos.</li>
                    <li>Mention functionality issues if any.</li>
                    <li>Clean items before donating.</li>
                    <li>Be responsive in chat.</li>
                </ul>
            </div>

            {/* My Recent Donations Widget */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-900">Your Recent items</h3>
                     <button onClick={() => navigate('/items')} className="text-xs text-emerald-600 font-bold hover:underline">View All</button>
                </div>
                
                {myItems.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No donations yet.</p>
                ) : (
                    <div className="space-y-3">
                        {myItems.slice(0, 3).map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                                <img src={item.imageUrl} className="w-10 h-10 rounded-md object-cover bg-gray-100" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
};

export default AddItem;
