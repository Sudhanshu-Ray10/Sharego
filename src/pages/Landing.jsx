import { Link } from "react-router-dom";
import hero from "../assets/hero-bg.jpg";
import master from "../assets/master-bg.jpg";
import { useState, useEffect, useRef } from "react";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import logo from "../assets/logo.png";
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaChevronRight } from "react-icons/fa";
import { MdEmail, MdVolunteerActivism, MdLocalShipping, MdGroups, MdVerifiedUser } from "react-icons/md";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // Close on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (menuOpen) setMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // Close if clicked outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <div className="font-sans text-gray-900 antialiased selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled || menuOpen ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="ShareBox logo"
              className="w-10 h-10 object-contain rounded-full shadow-md"
            />
            <span className={`text-2xl font-bold tracking-tight ${scrolled || menuOpen ? "text-emerald-900" : "text-white"}`}>
              ShareBox
            </span>
          </div>

          {/* DESKTOP LINKS */}
          <div className={`hidden md:flex space-x-8 font-medium ${scrolled ? "text-gray-600" : "text-gray-100"}`}>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-emerald-500 transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* DESKTOP BUTTONS */}
          <div className="hidden md:flex space-x-4">
            <Link
              to="/login"
              className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-200 ${
                scrolled
                  ? "text-emerald-700 hover:bg-emerald-50"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-emerald-600/90 text-white rounded-full font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:shadow-emerald-600/40 transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className={`md:hidden text-3xl transition-colors ${scrolled || menuOpen ? "text-gray-800" : "text-white"}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>
        </div>
      </nav>

      {/* MOBILE DROPDOWN */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-2 text-xl font-bold text-emerald-900">
                    <img src={logo} alt="" className="w-8 h-8 rounded-full" />
                    ShareBox
                 </div>
                 <button onClick={() => setMenuOpen(false)} className="text-2xl text-gray-500">
                    <HiX />
                 </button>
            </div>
            
          <div className="space-y-6 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-lg font-medium text-gray-700 hover:text-emerald-600"
              >
                {link.name}
              </a>
            ))}
            <hr className="border-gray-100 my-4" />
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full py-3 text-center text-emerald-700 font-semibold border border-emerald-100 rounded-xl hover:bg-emerald-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="block w-full py-3 text-center bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200"
            >
              Sign Up
            </Link>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; 2026 ShareBox Inc.
          </div>
        </div>
      </div>
      
      {/* DIMMING OVERLAY FOR MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setMenuOpen(false)}></div>
      )}


      {/* HERO SECTION */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0">
            <img 
                src={hero} 
                alt="Community helping" 
                className="w-full h-full object-cover object-center scale-105 animate-[pulse_10s_ease-in-out_infinite]" 
                style={{ animation: 'none' }} // disabling pulse for now, opting for gentle zoom if possible, or static
            />
            {/* Gradient Overlay - Darker for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-transparent"></div>
        </div>

        <div className="relative container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center pt-20">
            <div className="space-y-8 animate-slideDown">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-500/30 backdrop-blur-md text-emerald-100 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Over 5,000 items shared this month
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white tracking-tight">
                    Share What <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                        You Don't Need.
                    </span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-200 max-w-xl leading-relaxed">
                    Join the community-driven movement. Your unused items can become someone else's treasure. 
                    Simple, transparent, and impactful.
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/register"
                        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full shadow-lg shadow-emerald-900/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        Start Donating <FaChevronRight className="text-sm"/>
                    </Link>
                    <a
                        href="#how-it-works"
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-full transition-all duration-300"
                    >
                        How it works
                    </a>
                </div>
                
                {/* Mini Trust Indicators */}
                <div className="pt-8 flex items-center gap-6 text-emerald-100/60 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <MdVerifiedUser className="text-emerald-400 text-lg"/> Verified NGOs
                    </div>
                    <div className="flex items-center gap-2">
                        <MdLocalShipping className="text-emerald-400 text-lg"/> Easy Pickup
                    </div>
                </div>
            </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-10 bg-emerald-50 border-b border-emerald-100">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-emerald-200/50">
              {[
                  { label: "Donors", value: "10k+" },
                  { label: "Items Shared", value: "25k+" },
                  { label: "NGOs Partnered", value: "150+" },
                  { label: "Cities", value: "12" },
              ].map((stat) => (
                  <div key={stat.label} className="p-2">
                      <div className="text-3xl md:text-4xl font-bold text-emerald-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-emerald-700 font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
              ))}
          </div>
      </section>

      {/* MISSION SECTION (ABOUT) */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/50 -skew-x-12 transform translate-x-20"></div>

        <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                        <img 
                            src={master} 
                            alt="Happy children" 
                            className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-105"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                            <p className="text-white font-medium italic text-lg">"The smile on their faces is the only reward we need."</p>
                        </div>
                    </div>
                    {/* Floating Card */}
                    <div className="absolute -bottom-10 -right-10 hidden md:block bg-white p-6 rounded-2xl shadow-xl max-w-xs border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                                <MdVolunteerActivism className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Community First</h4>
                                <p className="text-sm text-gray-500 mt-1">We prioritize local connections to reduce carbon footprint.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-8">
                    <div>
                        <h4 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">Our Mission</h4>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                            Bridging the Gap Between <span className="relative inline-block px-2">
                                <span className="absolute inset-0 bg-emerald-200 transform -skew-y-2 -z-10 rounded-lg"></span>
                                Abundance
                            </span> 
                            and Need.
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            ShareBox isn't just a platform; it's a promise. We believe that every item typically 'discarded' has a second life waiting to happen.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            From vintage books to winter coats, your contributions support families, shelters, and educational programs directly. No middlemen, full transparency.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { title: "Zero Waste", desc: "Keeping usable items out of landfills.", icon: "🌱" },
                            { title: "Direct Impact", desc: "Help real families in your vicinity.", icon: "❤️" },
                        ].map((item) => (
                            <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100">
                                <span className="text-4xl">{item.icon}</span>
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1 leading-snug">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <Link to="/about-us" className="inline-flex items-center text-emerald-700 font-bold hover:text-emerald-800 transition-colors">
                        Read our full story <FaChevronRight className="ml-2 text-sm"/>
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 bg-gray-50 relative">
        <div className="container mx-auto px-6 text-center max-w-6xl">
            <h4 className="text-emerald-600 font-bold uppercase tracking-wider mb-3">What We Do</h4>
             <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-12">
                Simplifying Kindness
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
                {[
                    { 
                        icon: <MdVolunteerActivism />, 
                        title: "Donate Ease", 
                        desc: "List items in seconds. Snap a photo, add a description, and you're done. We handle the listing optimization.",
                        color: "bg-blue-100 text-blue-600"
                    },
                    { 
                        icon: <MdLocalShipping />, 
                        title: "Pickup & Drop", 
                        desc: "Volunteers in your area help transport goods to verified NGOs or directly to beneficiaries.",
                        color: "bg-orange-100 text-orange-600"
                    },
                    { 
                        icon: <MdGroups />, 
                        title: "Community Drives", 
                        desc: "Join seasonal drives (Winter Warmth, Back to School) and amplify your impact with the community.",
                        color: "bg-purple-100 text-purple-600"
                    }
                ].map((service, idx) => (
                    <div key={idx} className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                        <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                            {service.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            {service.desc}
                        </p>
                        <Link to="/services" className="text-sm font-bold text-gray-400 group-hover:text-emerald-600 flex items-center gap-1 transition-colors">
                            Learn more <FaChevronRight/>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      {/* CALL TO ACTION */}
      <section className="py-20 px-6">
          <div className="container mx-auto max-w-5xl bg-emerald-900 rounded-[3rem] overflow-hidden shadow-2xl relative">
               <div className="absolute top-0 right-0 p-20 bg-emerald-800 rounded-full blur-[100px] opacity-50"></div>
               <div className="absolute bottom-0 left-0 p-16 bg-teal-800 rounded-full blur-[80px] opacity-40"></div>
               
               <div className="relative z-10 p-12 md:p-20 text-center text-white">
                   <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to make a difference?</h2>
                   <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                       Your small act of kindness can create a ripple of hope. Join thousands of changemakers today.
                   </p>
                   <div className="flex flex-col sm:flex-row gap-4 justify-center">
                       <Link to="/register" className="px-10 py-4 bg-white text-emerald-900 font-bold rounded-full hover:bg-emerald-50 shadow-lg transition-transform hover:scale-105">
                           Create Account
                       </Link>
                        <Link to="/login" className="px-10 py-4 border border-emerald-500/50 hover:bg-emerald-800/50 text-white font-semibold rounded-full transition-colors">
                           Sign In
                       </Link>
                   </div>
               </div>
          </div>
      </section>

      {/* CONTACT SECTION (Simplified) */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Get in Touch</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                 <a href="mailto:support@sharebox.com" className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all border border-gray-100 flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl group-hover:rotate-12 transition-transform">
                        <MdEmail />
                    </div>
                    <span className="font-semibold text-gray-900">Email Us</span>
                    <span className="text-sm text-gray-500">sudhanshray10@gmail.com</span>
                 </a>
                 <div className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all border border-gray-100 flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl group-hover:rotate-12 transition-transform">
                        <FaFacebook />
                    </div>
                     <span className="font-semibold text-gray-900">Follow Us</span>
                    <span className="text-sm text-gray-500">@ShareBoxIndia</span>
                 </div>
                 <div className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all border border-gray-100 flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xl group-hover:rotate-12 transition-transform">
                         <FaInstagram />
                    </div>
                     <span className="font-semibold text-gray-900">Instagram</span>
                    <span className="text-sm text-gray-500">@ShareBoxLife</span>
                 </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 text-white font-bold text-2xl mb-6">
                     <img src={logo} alt="" className="w-8 h-8 rounded-full grayscale opacity-80" />
                     ShareBox
                </div>
                <p className="text-sm leading-relaxed">
                    Building sustainable communities through shared resources. 
                    <br/><br/>
                    Made with ❤️ in India.
                </p>
            </div>
            
            <div>
                <h3 className="text-white font-bold mb-6">Platform</h3>
                <ul className="space-y-3 text-sm">
                    <li><Link to="/browse-items" className="hover:text-emerald-400 transition-colors">Browse Items</Link></li>
                    <li><Link to="/ask-item" className="hover:text-emerald-400 transition-colors">Request Help</Link></li>
                    <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Register NGO</Link></li>
                </ul>
            </div>
            
            <div>
                 <h3 className="text-white font-bold mb-6">Company</h3>
                <ul className="space-y-3 text-sm">
                    <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                </ul>
            </div>
            
            <div>
                <h3 className="text-white font-bold mb-6">Stay Updated</h3>
                <div className="flex gap-4 mb-6">
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><FaTwitter/></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><FaYoutube/></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><FaInstagram/></a>
                </div>
            </div>
        </div>
        <div className="container mx-auto px-6 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
            © {new Date().getFullYear()} ShareBox. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
