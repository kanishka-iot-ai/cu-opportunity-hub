import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Bookmark,
  Briefcase,
  Bell,
  Clock,
  Megaphone,
  User,
  ShieldCheck,
  PlusCircle,
  Users,
  Settings,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, onSelectTab, isOpen, onClose }) => {
  const { user, isAdmin, isFaculty, isStudent } = useAuth();

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explore', label: 'Explore Opportunities', icon: Compass },
    { id: 'recommendations', label: 'Recommended For You', icon: Sparkles, badge: 'Smart' },
    { id: 'saved', label: 'Saved Opportunities', icon: Bookmark },
    { id: 'applications', label: 'My Applications', icon: Briefcase },
    { id: 'reminders', label: 'My Reminders', icon: Clock },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'profile', label: 'Academic Profile', icon: User }
  ];

  const adminNavItems = [
    { id: 'admin_dashboard', label: 'Admin Analytics', icon: LayoutDashboard },
    { id: 'admin_opportunities', label: 'Opportunity Control', icon: ShieldCheck },
    { id: 'admin_users', label: 'Student Directory', icon: Users },
    { id: 'explore', label: 'Browse Public View', icon: Compass }
  ];

  const facultyNavItems = [
    { id: 'faculty_dashboard', label: 'Faculty Coordinator', icon: LayoutDashboard },
    { id: 'explore', label: 'Explore Opportunities', icon: Compass },
    { id: 'announcements', label: 'Department Notices', icon: Megaphone }
  ];

  const navItems = isAdmin
    ? adminNavItems
    : isFaculty
    ? facultyNavItems
    : studentNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 z-40 h-full lg:h-[calc(100vh-57px)] w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto flex-1">
          {/* Role Identifier Header */}
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-red-700 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.role === 'STUDENT' ? 'Student Workspace' : user?.role === 'ADMIN' ? 'Administrator Panel' : 'Faculty Portal'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.profile?.department_name || 'Chandigarh University'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose && onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-red-700 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* University Info Card Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">Chandigarh University</span>
              <span className="font-bold text-red-700">NAAC A+</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Centralized Academic & Placement Opportunity Network
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <a
                href="https://uims.cuchd.in"
                target="_blank"
                rel="noreferrer"
                className="text-red-700 hover:underline flex items-center gap-1 font-medium"
              >
                CUIMS Portal <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span className="text-slate-400">v1.0.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
