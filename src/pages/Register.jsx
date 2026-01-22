import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone, FaGoogle } from "react-icons/fa";
import master from "../assets/master-bg.jpg";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { registerUser, createUserProfile, loginWithGoogle } from "../services/auth";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("Google Sign In Failed: " + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const user = await registerUser(formData.email, formData.password);
      await createUserProfile(user.uid, {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        email: formData.email,
        createdAt: new Date(),
      });
      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("Registration Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-white justify-center lg:justify-start">
      {/* Mobile Background Image */}
      <div className="lg:hidden absolute inset-0 z-0">
        <img 
          src={master} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-teal-900/60 backdrop-blur-sm"></div>
      </div>

      {/* LEFT: Image Section (Hidden on mobile) */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden bg-teal-900">
        <div className="absolute inset-0 bg-teal-900/50 mix-blend-multiply z-10"></div>
        <img
          src={master}
          alt="Join Community"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
          <div className="flex items-center gap-3">
             <img src={logo} alt="ShareBox" className="w-8 h-8 rounded-full" />
             <span className="text-xl font-bold">ShareBox</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Start Your Journey <br/> of Kindness.
            </h1>
            <p className="text-emerald-100">
              Join thousands of donors and volunteers making a real difference in their local communities.
            </p>
          </div>

           <div className="space-y-4">
               <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                   <div className="text-2xl">🌱</div>
                   <div>
                       <h4 className="font-bold">Zero Waste</h4>
                       <p className="text-xs text-white/70">Give items a second life.</p>
                   </div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                   <div className="text-2xl">❤️</div>
                   <div>
                       <h4 className="font-bold">Direct Impact</h4>
                       <p className="text-xs text-white/70">Help verified families & NGOs.</p>
                   </div>
               </div>
           </div>
        </div>
      </div>

      {/* RIGHT: Form Section */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 md:p-12 relative z-10 overflow-y-auto">
        
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2 text-white">
           <img src={logo} alt="ShareBox" className="w-8 h-8 rounded-full" />
           <span className="text-xl font-bold">ShareBox</span>
        </div>

        {/* Back to Home Button */}
        <Link 
            to="/" 
            className="absolute top-8 right-8 p-2 rounded-full backdrop-blur-md z-50 transition-colors text-white/80 hover:text-white bg-black/20 hover:bg-black/40 lg:text-gray-500 lg:bg-gray-100 lg:hover:bg-gray-200 lg:hover:text-gray-900"
            title="Back to Home"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </Link>
        <div className="w-full max-w-lg space-y-6 animate-slideDown bg-white/95 lg:bg-white backdrop-blur-md lg:backdrop-blur-none p-6 md:p-8 rounded-3xl shadow-2xl lg:shadow-none border border-white/20 lg:border-none">
           
           <div className="text-center lg:text-left">
             <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
             <p className="text-gray-500 mt-2">
               Already a member?{" "}
               <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                 Sign in
               </Link>
             </p>
           </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="grid md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="relative group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Full Name</label>
                     <div className="flex items-center mt-1">
                        <FaUser className="absolute left-4 text-gray-400 group-focus-within:text-teal-500 transition-colors pointer-events-none"/>
                        <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                        placeholder="John Doe"
                        />
                     </div>
                </div>
                
                 {/* Phone */}
                <div className="relative group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Phone</label>
                     <div className="flex items-center mt-1">
                        <FaPhone className="absolute left-4 text-gray-400 group-focus-within:text-teal-500 transition-colors pointer-events-none"/>
                        <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                        placeholder="+91 9876543210"
                        />
                     </div>
                </div>
            </div>

            {/* Email */}
            <div className="relative group">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                  <div className="flex items-center mt-1">
                    <FaEnvelope className="absolute left-4 text-gray-400 group-focus-within:text-teal-500 transition-colors pointer-events-none"/>
                    <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                    placeholder="john@example.com"
                    />
                 </div>
            </div>
            
             {/* City */}
            <div className="relative group">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">City / Location</label>
                  <div className="flex items-center mt-1">
                    <FaMapMarkerAlt className="absolute left-4 text-gray-400 group-focus-within:text-teal-500 transition-colors pointer-events-none"/>
                    <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                    placeholder="New Delhi, India"
                    />
                 </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                {/* Password */}
                 <div className="relative group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Password</label>
                     <div className="flex items-center mt-1">
                        <FaLock className="absolute left-4 text-gray-400 group-focus-within:text-teal-500 transition-colors pointer-events-none"/>
                        <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                        placeholder="••••••••"
                        />
                     </div>
                </div>
                 {/* Confirm Password */}
                 <div className="relative group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Confirm Password</label>
                     <div className="flex items-center mt-1">
                        <FaLock className="absolute left-4 text-gray-400 group-focus-within:text-teal-500 transition-colors pointer-events-none"/>
                        <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                        placeholder="••••••••"
                        />
                     </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-1 active:scale-95 ${
                    loading ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
                }`}
                >
                {loading ? "Creating Account..." : "Create Account"}
                </button>
            </div>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 mb-6 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-gray-600"
            >
                <FaGoogle className="text-red-500 text-lg" />
                Sign Up with Google
            </button>
            
            <p className="text-xs text-center text-gray-400 max-w-xs mx-auto">
                By registering, you agree to our <a href="#" className="underline hover:text-teal-600">Terms of Service</a> and <a href="#" className="underline hover:text-teal-600">Privacy Policy</a>.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
