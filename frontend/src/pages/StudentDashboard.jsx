import React, { useState, useEffect } from 'react';
import {
  Compass,
  Bookmark,
  Briefcase,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  User,
  ExternalLink,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import OpportunityCard from '../components/OpportunityCard';
import DeadlineBadge from '../components/DeadlineBadge';

export const StudentDashboard = ({ onNavigate, onSelectOpportunity }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAvailable: 0,
    newCount: 0,
    savedCount: 0,
    applicationsCount: 0,
    upcomingDeadlinesCount: 0,
    selectedCount: 0
  });

  const [recommended, setRecommended] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [oppsRes, recsRes, savedRes, appsRes, annRes] = await Promise.all([
          api.getOpportunities({ per_page: 8, sort_by: 'newest' }),
          api.getRecommendations('all'),
          api.getSavedOpportunities(),
          api.getApplications(),
          api.getAnnouncements(user?.profile?.department_id)
        ]);

        const allOpps = oppsRes.opportunities || [];
        const savedList = savedRes.saved_opportunities || [];
        const appsList = appsRes.applications || [];
        const recsList = recsRes.recommendations || [];

        // Count upcoming deadlines within 7 days
        const urgentCount = allOpps.filter(
          (o) => o.days_remaining >= 0 && o.days_remaining <= 7
        ).length;

        // Selected / Successful applications
        const selectedApps = appsList.filter((a) => a.current_status === 'Selected').length;

        setStats({
          totalAvailable: oppsRes.total || allOpps.length,
          newCount: allOpps.length,
          savedCount: savedList.length,
          applicationsCount: appsList.length,
          upcomingDeadlinesCount: urgentCount,
          selectedCount: selectedApps
        });

        setRecommended(recsList.slice(0, 4));
        setRecentOpportunities(allOpps.slice(0, 4));

        // Deadlines sorted ascending
        const deadlinesSorted = [...allOpps]
          .filter((o) => o.days_remaining >= 0)
          .sort((a, b) => a.days_remaining - b.days_remaining)
          .slice(0, 4);
        setUpcomingDeadlines(deadlinesSorted);

        setAnnouncements(annRes.announcements || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const profile = user?.profile || {};

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md border border-red-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-600/40 text-red-200 border border-red-500/30">
                Chandigarh University
              </span>
              <span className="text-xs text-slate-300 font-mono">
                UID: {user?.uid || '25BIT10180'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
              Explore curated academic opportunities, track active applications, and stay ahead of deadlines across all university departments.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                <Building className="w-3.5 h-3.5 text-red-400" />
                <span>{profile.department_code || 'AIT-CSE'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                <GraduationCap className="w-3.5 h-3.5 text-red-400" />
                <span>Semester {profile.current_semester || 4}</span>
              </div>
              {profile.cgpa > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>CGPA: {profile.cgpa.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 flex flex-col gap-2 min-w-[200px]">
            <span className="text-[11px] font-bold text-red-200 uppercase tracking-wider">
              Quick Actions
            </span>
            <button
              onClick={() => onNavigate('explore')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-red-700 hover:bg-red-800 text-white flex items-center justify-between transition-colors cursor-pointer shadow-xs"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('applications')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>My Applications</span>
              <Briefcase className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('reminders')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>My Reminders</span>
              <Clock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Announcements Ticker (if present) */}
      {announcements.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Department Announcement:
              </span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {announcements[0].title}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 line-clamp-1">
              {announcements[0].content}
            </p>
          </div>
          <button
            onClick={() => onNavigate('announcements')}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 shrink-0 cursor-pointer"
          >
            View Notice →
          </button>
        </div>
      )}

      {/* 3. Dashboard Statistics Cards (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* Total Available */}
        <div
          onClick={() => onNavigate('explore')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats.totalAvailable}</span>
          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">Total Available</p>
        </div>

        {/* New Opportunities */}
        <div
          onClick={() => onNavigate('explore')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats.newCount}</span>
          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">New This Week</p>
        </div>

        {/* Saved Opportunities */}
        <div
          onClick={() => onNavigate('saved')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Bookmark className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats.savedCount}</span>
          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">Saved Items</p>
        </div>

        {/* Applications Submitted */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats.applicationsCount}</span>
          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">Tracked Apps</p>
        </div>

        {/* Upcoming Deadlines */}
        <div
          onClick={() => onNavigate('reminders')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-rose-600">{stats.upcomingDeadlinesCount}</span>
          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">Urgent Deadlines</p>
        </div>

        {/* Successfully Completed / Selected */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-emerald-600">{stats.selectedCount}</span>
          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">Selections</p>
        </div>
      </div>

      {/* 4. Two Columns: Recommended For You & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended For You (Takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Recommended For You</h2>
              <span className="text-xs text-slate-500 hidden sm:inline">• Matched with your profile</span>
            </div>
            <button
              onClick={() => onNavigate('recommendations')}
              className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
            >
              See All Recommendations <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommended.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onSelect={onSelectOpportunity}
                showRecommendation={true}
              />
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines Widget (Takes 1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Approaching Deadlines</h2>
            </div>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs font-semibold text-red-700 hover:text-red-800 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 divide-y divide-slate-100 shadow-2xs">
            {upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No approaching deadlines right now.
              </div>
            ) : (
              upcomingDeadlines.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity(opp.id)}
                  className="py-3 first:pt-0 last:pb-0 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-red-700 line-clamp-1">
                      {opp.category_name}
                    </span>
                    <DeadlineBadge
                      daysRemaining={opp.days_remaining}
                      deadlineUrgency={opp.deadline_urgency}
                    />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2">
                    {opp.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>{opp.organization}</span>
                    <span>•</span>
                    <span>{opp.mode}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Recently Added Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Recently Published Opportunities</h2>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
          >
            Explore All 20 Categories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              showRecommendation={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
