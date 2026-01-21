import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { HiMenuAlt3, HiX, HiBell, HiChat, HiUser, HiLogout } from "react-icons/hi";
import logo from "../assets/logo.png";
import { FaChevronDown } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

    const { user, logout } = useAuth();
  const { toggleChat, unreadCount } = useChat(); // Use Chat Context
  const userName = user?.displayName || user?.email?.split('@')[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  
  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Browse", path: "/browse-items" },
    { name: "Needs", path: "/community-needs" },
    { name: "Donate", path: "/add-item" },
    { name: "Requests", path: "/requests" },
  ];

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img src={logo} alt="ShareBox" className="w-9 h-9 relative z-10 rounded-full object-cover" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-emerald-900 tracking-tight">
              ShareBox
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-gray-500 hover:text-emerald-600 hover:bg-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Chat Icon - Toggles Widget */}
            <button 
                onClick={toggleChat}
                className="relative p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                title="Chat"
            >
              <HiChat className="text-2xl" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                  {userInitial}
                </div>
                <FaChevronDown className={`text-xs text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}/>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-slideDown overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <HiUser className="text-lg" /> My Profile
                  </Link>
                   <Link
                    to="/my-requests"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <HiBell className="text-lg" /> Notifications
                  </Link>
                  <div className="border-t border-gray-50 my-1"></div>
                  <button
                    onClick={() => {
                        logout();
                        setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                  >
                    <HiLogout className="text-lg" /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <HiX className="text-2xl" /> : <HiMenuAlt3 className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

       {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl z-30 animate-slideDown">
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
