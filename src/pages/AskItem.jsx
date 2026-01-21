import { useState, useEffect } from "react";
import { auth, db } from "../services/firebaseConfig";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { uploadImageToCloudinary } from "../services/cloudinary";
import { FaHeart, FaUser, FaMapMarkerAlt, FaPhone, FaCloudUploadAlt, FaCamera, FaInfoCircle } from "react-icons/fa";

const AskItem = () => {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    emoji: "🎁",
    fullName: "",
    address: "",
    mobile: "",
    description: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Prefill known user details
  useEffect(() => {
    const fetchUser = async () => {
        if(!uid) return;
        try {
            const ref = doc(db, "users", uid);
            const snap = await getDoc(ref);
            if(snap.exists()){
                const data = snap.data();
                setFormData(prev => ({
                    ...prev,
                    fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                    mobile: data.phone || ''
                }));
            }
        } catch (e) {
            console.error("User fetch error", e);
        }
    }
    fetchUser();
  }, [uid]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    }
  };

  const submitNeed = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.fullName.trim() || !formData.address.trim() || !formData.mobile.trim()) {
        alert("⚠️ Please fill all required fields!");
        return;
    }
    
    if(!imageFile) {
        alert("⚠️ Please upload a reference image or a generic image of what you need.");
        return;
    }

    try {
      setLoading(true);

      const imageUrl = await uploadImageToCloudinary(imageFile);

      await addDoc(collection(db, "recent_demands"), {
        name: formData.name,
        emoji: formData.emoji,
        description: formData.description,
        fullName: formData.fullName,
        address: formData.address,
        mobile: formData.mobile,
        imageUrl,
        fulfilled: false,
        by: auth.currentUser.displayName || formData.fullName || "User",
        requestedById: uid,
        createdAt: serverTimestamp()
      });

      alert("✨ Your request has been posted! Donors can now see it.");
      navigate("/home");

    } catch (err) {
      console.error("Submit error:", err);
      alert("⚠ Something went wrong! " + err.message);
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
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Ask for Help <FaHeart className="text-pink-500"/></h2>
                    <p className="text-gray-500 text-sm mt-1">Let the community know what you need. Someone might have it!</p>
                </div>

                <form onSubmit={submitNeed} className="space-y-6">
                    
                    {/* Item Name & Emoji */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 relative">
                             <input
                                name="name"
                                type="text"
                                placeholder="What do you need? (e.g. Wheelchair)"
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all outline-none"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <select
                            name="emoji"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all outline-none"
                            value={formData.emoji}
                            onChange={handleChange}
                        >
                            <option value="🎁">🎁 General</option>
                            <option value="👕">👕 Clothes</option>
                            <option value="📚">📚 Books</option>
                            <option value="🧸">🧸 Toys</option>
                            <option value="🥫">🥫 Food</option>
                            <option value="🛏️">🛏️ Bedding</option>
                            <option value="💊">💊 Medicine</option>
                            <option value="♿">♿ Medical</option>
                        </select>
                    </div>

                    <textarea
                        name="description"
                        rows="3"
                        placeholder="Describe why you need this or specific details..."
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all outline-none resize-none"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    {/* Image Upload Area */}
                    <div className="group relative w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-white hover:border-pink-500 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400 group-hover:text-pink-500 transition-colors">
                                <FaCloudUploadAlt className="text-4xl mb-2" />
                                <span className="font-semibold text-sm">Upload Reference Image</span>
                            </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                        {preview && (
                             <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-md text-gray-700 hover:text-pink-500 z-10" onClick={(e) => { e.stopPropagation(); setPreview(null); setImageFile(null); }}>
                                 <FaCamera />
                             </div>
                        )}
                    </div>

                    {/* Contact Details Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <FaUser className="absolute left-4 top-3.5 text-gray-400"/>
                                <input
                                    name="fullName"
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all outline-none"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="relative">
                                <FaPhone className="absolute left-4 top-3.5 text-gray-400"/>
                                <input
                                    name="mobile"
                                    type="tel"
                                    placeholder="Mobile Number"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all outline-none"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="relative mt-4">
                            <FaMapMarkerAlt className="absolute left-4 top-3.5 text-gray-400"/>
                             <input
                                name="address"
                                type="text"
                                placeholder="Delivery Address"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all outline-none"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2 ${
                            loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:to-pink-700 shadow-pink-200"
                        }`}
                    >
                        {loading ? "Posting..." : "Submit Request 🚀"}
                    </button>

                </form>
            </div>
        </div>

        {/* RIGHT COLUMN: INFO */}
        <div className="space-y-6">
            <div className="bg-pink-50 rounded-3xl p-6 border border-pink-100">
                <h3 className="font-bold text-pink-800 flex items-center gap-2 mb-3">
                    <FaInfoCircle /> Why ask here?
                </h3>
                <p className="text-sm text-pink-700/80 mb-4 leading-relaxed">
                    By posting a request, you alert all specific donors in your area. They might have exactly what you need gathering dust!
                </p>
                <div className="bg-white/50 rounded-xl p-4 text-xs text-pink-900 font-medium">
                    "I asked for a wheelchair for my grandpa and got one in 2 days!" - Rahul
                </div>
            </div>

             <button
                onClick={() => navigate("/home")}
                className="w-full py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
            >
                Cancel
            </button>
        </div>

      </div>
    </div>
  );
};

export default AskItem;
