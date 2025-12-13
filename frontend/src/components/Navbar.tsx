import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

// ============================================
// Navbar Component (Simplified - No Web3)
// ============================================

const Navbar = () => {
  const { isDemoMode, enableDemoMode, disableDemoMode, user } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/rewards", label: "Rewards" },
    { path: "/profile", label: "Profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-4 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between bg-gradient-to-r from-rose-50/95 via-pink-50/95 to-rose-50/95 backdrop-blur-md border border-rose-200/50 rounded-full px-4 py-2 shadow-lg shadow-rose-200/20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-900 to-pink-900 rounded-full flex items-center justify-center group-hover:from-rose-800 group-hover:to-pink-800 transition-all duration-300">
              <span className="text-rose-50 font-bold text-sm">MR</span>
            </div>
            <span className="font-semibold text-rose-900 tracking-tight hidden sm:block group-hover:text-rose-950 transition-colors">
              MonadReview
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm px-3 py-1.5 rounded-full transition-all duration-300 ease-out ${isActive(link.path)
                  ? "bg-rose-100/70 text-rose-900 font-medium"
                  : "text-rose-700 hover:bg-rose-100/50 hover:text-rose-900"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Demo/User Status */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-rose-700 hover:text-rose-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Demo Status Badge */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full hover:shadow-md transition-all ${isDemoMode
                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
                  : "bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200"
                  }`}
              >
                <div className="w-6 h-6 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user.name.charAt(0) || "G"}
                  </span>
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isDemoMode ? "text-amber-700" : "text-rose-700"}`}>
                  {isDemoMode ? "Demo Mode" : user.name || "Guest"}
                </span>
                <svg className={`w-3 h-3 ${isDemoMode ? "text-amber-600" : "text-rose-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden z-50">
                  <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.name.charAt(0) || "G"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-rose-900">{user.name || "Guest User"}</p>
                        <p className="text-xs text-rose-600">
                          {isDemoMode ? "🧪 Demo Mode Active" : "Viewing as guest"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {isDemoMode ? (
                      <button
                        onClick={() => {
                          disableDemoMode();
                          setShowMenu(false);
                        }}
                        className="w-full py-2.5 text-sm bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>🚪</span>
                        Exit Demo Mode
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          enableDemoMode();
                          setShowMenu(false);
                        }}
                        className="w-full py-2.5 text-sm bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>🧪</span>
                        Enter Demo Mode
                      </button>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setShowMenu(false)}
                      className="w-full py-2.5 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Profile
                    </Link>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      {isDemoMode
                        ? "Explore all features with demo data"
                        : "Enable demo mode to explore features"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white/95 backdrop-blur-md border border-rose-200/50 rounded-2xl p-4 shadow-lg">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-sm px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive(link.path)
                    ? "bg-rose-100 text-rose-900 font-medium"
                    : "text-rose-700 hover:bg-rose-50 hover:text-rose-900"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showMenu || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowMenu(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
