import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 animate-slideDown">
        
        <div className="text-center mb-8">
            <img src={logo} alt="ShareBox" className="w-12 h-12 rounded-full mx-auto mb-4 shadow-sm" />
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                No worries! Enter your email address below and we'll send you a link to reset your password.
            </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
            >
              Send Reset Link
            </button>
          </form>
        ) : (
            <div className="text-center bg-emerald-50 p-6 rounded-xl border border-emerald-100 animate-slideDown">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                    ✨
                </div>
                <h3 className="font-bold text-emerald-800 mb-1">Check your inbox</h3>
                <p className="text-sm text-emerald-700">
                    We've sent a password reset link to <span className="font-semibold">{email}</span>.
                </p>
                 <button 
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-emerald-600 font-semibold underline mt-4 hover:text-emerald-800"
                 >
                    Try another email
                 </button>
            </div>
        )}

        <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                <FaArrowLeft className="mr-2 text-xs" /> Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
}
