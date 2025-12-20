import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen((s) => !s);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNavLinkClass = ({ isActive }) => {
    const commonClasses =
      "px-5 py-3 rounded-xl transition-all duration-200 font-semibold text-base flex items-center gap-2";
    return isActive
      ? `${commonClasses} text-white bg-gradient-to-r from-[#3e6268] to-[#4a7680] shadow-md`
      : `${commonClasses} text-gray-600 hover:text-[#3e6268] hover:bg-gray-50`;
  };

  return (
    <nav
      ref={navRef}
      className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/50"
    >
      <div className="max-w-full px-4 sm:px-6 lg:px-12">
        <div className="relative flex justify-between items-center h-20">
          {/* Left:ss Logo */}
          <div className="flex-shrink-0 flex items-center">
            <NavLink to="/" className="flex items-center gap-2 group">
              <img
                src="/attendancenine-color.png"
                alt="Logo"
                className="h-14 w-auto transition-transform group-hover:scale-105"
              />
            </NavLink>
          </div>

          {/* Right: Links - using ml-auto to push them right */}
          <div className="hidden md:flex ml-auto"> {/* MODIFIED HERE */}
            <div className="flex items-center gap-2 bg-gray-50/50 rounded-2xl p-2">

              <NavLink to="/employees" className={getNavLinkClass}>
                <span>Employees</span>
              </NavLink>
              <NavLink to="/attendance" className={getNavLinkClass}>
                <span>Attendance</span>
              </NavLink>
              <NavLink to="/top" className={getNavLinkClass}>
                <span>Top Performers</span>
              </NavLink>
              <NavLink to="/register" className={getNavLinkClass}>
                <span>Add Employee</span>
              </NavLink>
            </div>
          </div>

          {/* Right: Mobile Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-3.5 rounded-xl text-gray-600 hover:text-[#3e6268] hover:bg-gray-50 focus:outline-none transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (remains as is, with updated NavLink content) */}
      <div
        className={`md:hidden absolute w-full bg-white/95 backdrop-blur-lg shadow-xl border-t border-gray-200/50 transform transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >

        <div className="px-4 pt-3 pb-4 space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block px-5 py-4 text-lg font-medium rounded-xl transition-all duration-200 flex items-center gap-3 ${
                isActive
                  ? "text-white bg-gradient-to-r from-[#3e6268] to-[#4a7680] shadow-md"
                  : "text-gray-600 hover:text-[#3e6268] hover:bg-gray-50"
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/employees" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span>Employees</span>
          </NavLink>
          <NavLink to="/attendance" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Attendance</span>
          </NavLink>
          <NavLink to="/top" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16v4m-2-2h4m5 10v4m-2-2h4M17 3l-1.17.585A2 2 0 0115 5.414V6a2 2 0 01-2 2v0a2 2 0 01-2-2V5.414a2 2 0 01.83-1.585L13 3m-4 0l1.17.585A2 2 0 0011 5.414V6a2 2 0 002 2v0a2 2 0 002-2V5.414a2 2 0 00-.83-1.585L13 3m-4 0h4" /></svg>
            <span>Top Performers</span>
          </NavLink>
          <NavLink to="/register" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            <span>Add Employee</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

const getMobileNavLinkClass = ({ isActive }) =>
  `block px-5 py-4 text-lg font-medium rounded-xl transition-all duration-200 flex items-center gap-3 ${
    isActive
      ? "text-white bg-gradient-to-r from-[#3e6268] to-[#4a7680] shadow-md"
      : "text-gray-600 hover:text-[#3e6268] hover:bg-gray-50"
  }`;

export default Navbar;