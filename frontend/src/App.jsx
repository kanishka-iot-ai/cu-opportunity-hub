import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import OpportunityExplorer from './pages/OpportunityExplorer';
import OpportunityDetail from './pages/OpportunityDetail';
import ApplicationTracker from './pages/ApplicationTracker';
import Recommendations from './pages/Recommendations';
import SavedOpportunities from './pages/SavedOpportunities';
import Reminders from './pages/Reminders';
import StudentProfile from './pages/StudentProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminOpportunities from './pages/AdminOpportunities';
import AdminUsers from './pages/AdminUsers';
import FacultyDashboard from './pages/FacultyDashboard';
import { Megaphone, ExternalLink, Calendar } from 'lucide-react';
import { api } from './services/api';

function MainApp() {
  const { user, loading, isStudent, isAdmin, isFaculty } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [announcements, setAnnouncements] = useState([]);

  // Adjust default tab based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setActiveTab('admin_dashboard');
      } else if (user.role === 'FACULTY') {
        setActiveTab('faculty_dashboard');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  // Load announcements for students
  useEffect(() => {
    if (user) {
      api.getAnnouncements(user?.profile?.department_id)
        .then((res) => setAnnouncements(res.announcements || []))
        .catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-black text-2xl border border-red-500/40 shadow-xl mb-4 animate-bounce">
          CU
        </div>
        <h2 className="text-base font-bold tracking-tight">CU OPPORTUNITY HUB</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Chandigarh University portal...</p>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  const handleSelectOpportunity = (id) => {
    setSelectedOpportunityId(id);
    setActiveTab('opportunity_detail');
  };

  const handleGlobalSearch = (q) => {
    setSearchQuery(q);
    if (activeTab !== 'explore') {
      setActiveTab('explore');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearch={handleGlobalSearch}
        currentSearch={searchQuery}
      />

      <div className="flex-1 flex max-w-full">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'opportunity_detail') {
              setSelectedOpportunityId(null);
            }
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <StudentDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectOpportunity={handleSelectOpportunity}
            />
          )}

          {activeTab === 'explore' && (
            <OpportunityExplorer
              onSelectOpportunity={handleSelectOpportunity}
              initialSearch={searchQuery}
            />
          )}

          {activeTab === 'opportunity_detail' && (
            <OpportunityDetail
              opportunityId={selectedOpportunityId}
              onBack={() => setActiveTab('explore')}
              onSelectOpportunity={handleSelectOpportunity}
            />
          )}

          {activeTab === 'recommendations' && (
            <Recommendations
              onSelectOpportunity={handleSelectOpportunity}
              onNavigateProfile={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'saved' && (
            <SavedOpportunities
              onSelectOpportunity={handleSelectOpportunity}
              onNavigateExplore={() => setActiveTab('explore')}
            />
          )}

          {activeTab === 'applications' && (
            <ApplicationTracker
              onSelectOpportunity={handleSelectOpportunity}
            />
          )}

          {activeTab === 'reminders' && <Reminders />}

          {activeTab === 'profile' && <StudentProfile />}

          {activeTab === 'announcements' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-red-700" />
                  Official Department & University Announcements
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Notices and directives from Chandigarh University academic affairs, DCPD, and faculty coordinators.
                </p>
              </div>

              {announcements.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                  No active notices published at this moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-red-700">
                            {a.department_code || 'All Chandigarh University'}
                          </span>
                          {a.is_pinned && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-red-100 text-red-800">
                              PINNED
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(a.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{a.title}</h3>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {a.content}
                      </p>

                      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Issued by: <strong className="text-slate-600">{a.author_name}</strong></span>
                        <span className="text-red-700 font-semibold">CU Verified Notice</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'admin_dashboard' && (
            <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'admin_opportunities' && (
            <AdminOpportunities onSelectOpportunity={handleSelectOpportunity} />
          )}

          {activeTab === 'admin_users' && <AdminUsers />}

          {activeTab === 'faculty_dashboard' && (
            <FacultyDashboard onSelectOpportunity={handleSelectOpportunity} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
