import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";
import master from "../assets/master-bg.jpg";
import logo from "../assets/logo.png";

import { loginUser, loginWithGoogle } from "../services/auth";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("Login Failed: " + error.message);
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
        <div className="absolute inset-0 bg-emerald-900/70 backdrop-blur-sm"></div>
      </div>

      {/* LEFT: Image Section (Hidden on mobile) - Desktop Only */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply z-10"></div>
        <img
          src={master}
          alt="Community Support"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white">
          <div className="flex items-center gap-3">
             <img src={logo} alt="ShareBox" className="w-10 h-10 rounded-full" />
             <span className="text-2xl font-bold">ShareBox</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Welcome Back to the <br /> 
              <span className="text-emerald-300">Circle of Giving.</span>
            </h1>
            <p className="text-lg text-emerald-100 max-w-md">
              Your small contributions have already helped over 500 families. 
              Let's keep the momentum going.
            </p>
          </div>

          <div className="text-sm text-emerald-200/60">
            © 2026 ShareBox. Making the world kinder.
          </div>
        </div>
      </div>

      {/* RIGHT: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 relative z-10">
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

        <div className="w-full max-w-md space-y-8 animate-slideDown bg-white/95 lg:bg-white backdrop-blur-md lg:backdrop-blur-none p-8 rounded-3xl shadow-2xl lg:shadow-none border border-white/20 lg:border-none">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-500 mt-2">
              New here?{" "}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 font-medium text-gray-800 placeholder-gray-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
               <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                    Forgot Password?
                  </Link>
               </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <FaLock />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 font-medium text-gray-800 placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-1 active:scale-95 ${
                  loading ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? "Signing in..." : "Sign In to Account"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleSignIn}
                type="button"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <FaGoogle className="text-red-500 text-lg"/>
                  <span className="font-semibold text-gray-600">Google</span>
              </button>
               {/* Placeholder for another auth provider */}
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <span className="font-semibold text-gray-600">Apple</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
