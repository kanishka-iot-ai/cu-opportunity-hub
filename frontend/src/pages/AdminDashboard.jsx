import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Compass,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#C8102E', '#2563EB', '#D97706', '#10B981', '#8B5CF6', '#EC4899', '#64748B'];

export const AdminDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading university administrative analytics...</div>;
  }

  const overview = data?.overview || {};
  const catData = data?.category_distribution || [];
  const deptData = data?.department_applications || [];
  const statusData = data?.status_distribution || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-700" />
            Chandigarh University Opportunity Administration
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Centralized platform oversight, verification workflows, student participation, and placement metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin_opportunities')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs cursor-pointer"
          >
            Manage Opportunities
          </button>
          <button
            onClick={() => onNavigate('admin_users')}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            Student Directory
          </button>
        </div>
      </div>

      {/* Top 6 Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Registered Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{overview.total_students}</span>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {overview.active_students} Active accounts
          </p>
        </div>

        {/* Opportunities Active */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Opportunities</span>
            <Compass className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{overview.active_opportunities}</span>
          <p className="text-[11px] text-slate-400 mt-1">
            {overview.total_opportunities} total ({overview.expired_opportunities} expired)
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending Approvals</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700">{overview.pending_approvals}</span>
          <p className="text-[11px] text-slate-400 mt-1">
            Faculty submitted
          </p>
        </div>

        {/* Applications Tracked */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Applications</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{overview.total_applications}</span>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {overview.selected_applications} Selections ({overview.success_rate}%)
          </p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Opportunities by Category */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-red-700" />
              Opportunities Distributed by Category
            </h3>
            <span className="text-[11px] text-slate-400">Top 10</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#C8102E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Applications by Department */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Student Applications by Department
            </h3>
            <span className="text-[11px] text-slate-400">Participation Metric</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" angle={-25} textAnchor="end" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Distribution Summary */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Student Application Pipeline Breakdown (10 Stages)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statusData.map((item, idx) => (
            <div key={item.status} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block truncate">{item.status}</span>
              <span className="text-lg font-bold text-slate-900">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
