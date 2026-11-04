import React from 'react';
import { Search, Menu, User, LogOut, ChevronDown, GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export const Navbar = ({ onToggleSidebar, onSearch, currentSearch = '' }) => {
  const { user, logout, isStudent, isAdmin, isFaculty } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Chandigarh University Opportunity Hub Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-white shadow-xs font-black text-sm tracking-tighter shrink-0 border border-red-800">
            CU
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                CU OPPORTUNITY HUB
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-red-100 text-red-800 uppercase tracking-wider">
                Official
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Chandigarh University • Academic & Career Tracker
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search internships, hackathons, scholarships, conferences..."
            value={currentSearch}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {user && <NotificationDropdown />}

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
              {user.full_name?.charAt(0) || 'U'}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user.full_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-500 font-mono">
                  {user.uid || user.email}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isAdmin ? 'bg-purple-100 text-purple-700' :
                  isFaculty ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href="#login"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              Sign In
            </a>
            <a
              href="#register"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-xl transition-colors shadow-xs"
            >
              Register
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
