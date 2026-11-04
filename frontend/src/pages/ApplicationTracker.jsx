import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  ExternalLink,
  History,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DeadlineBadge from '../components/DeadlineBadge';
import Modal from '../components/Modal';

export const ApplicationTracker = ({ onSelectOpportunity }) => {
  const [applications, setApplications] = useState([]);
  const [validStatuses, setValidStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Edit / Update Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editFollowUp, setEditFollowUp] = useState('');
  const [editInterview, setEditInterview] = useState('');
  const [updating, setUpdating] = useState(false);

  // History Timeline Modal
  const [historyApp, setHistoryApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        q: search,
        status: selectedStatus
      };
      const data = await api.getApplications(params);
      setApplications(data.applications || []);
      setValidStatuses(data.valid_statuses || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, selectedStatus]);

  const handleOpenEdit = (app) => {
    setSelectedApp(app);
    setEditStatus(app.current_status);
    setEditNotes(app.personal_notes || '');
    setEditFollowUp(app.follow_up_date || '');
    setEditInterview(app.interview_date ? app.interview_date.slice(0, 16) : '');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setUpdating(true);
    try {
      await api.updateApplication(selectedApp.id, {
        status: editStatus,
        personal_notes: editNotes,
        follow_up_date: editFollowUp || null,
        interview_date: editInterview ? new Date(editInterview).toISOString() : null,
        remarks: `Manual status change by student to ${editStatus}`
      });
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      console.error('Failed to update application:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this application from tracking?')) return;
    try {
      await api.deleteApplication(id);
      fetchApplications();
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  // Group applications by status counts
  const statusCounts = applications.reduce((acc, a) => {
    acc[a.current_status] = (acc[a.current_status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-red-700" />
            My Application Tracker
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Track, update, and manage your academic opportunities across all 10 standard progress stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            Total Tracked: <span className="font-bold text-slate-900">{applications.length}</span>
          </span>
        </div>
      </div>

      {/* Status Filter Chips (10 Statuses) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            selectedStatus === 'ALL'
              ? 'bg-red-700 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Stages ({applications.length})
        </button>

        {[
          'Interested',
          'Saved',
          'Planning to Apply',
          'Applied',
          'Under Review',
          'Shortlisted',
          'Interview Scheduled',
          'Selected',
          'Rejected',
          'Withdrawn'
        ].map((st) => {
          const count = statusCounts[st] || 0;
          const isSelected = selectedStatus === st;
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(isSelected ? 'ALL' : st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-red-700 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{st}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applications tracked in this status</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Visit the Opportunity Explorer to discover new programs and add them to your tracker.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <StatusBadge status={app.current_status} />
                  {app.opportunity?.category_name && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                      {app.opportunity.category_name}
                    </span>
                  )}
                  {app.opportunity?.is_paid && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                      Paid
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => onSelectOpportunity(app.opportunity_id)}
                  className="text-sm md:text-base font-bold text-slate-900 hover:text-red-700 transition-colors cursor-pointer line-clamp-1"
                >
                  {app.opportunity?.title || 'Opportunity'}
                </h3>

                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {app.opportunity?.organization}
                </p>

                {/* Personal Notes */}
                {app.personal_notes && (
                  <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                    "{app.personal_notes}"
                  </p>
                )}

                {/* Date info row */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                  <span>Applied: <strong className="font-mono text-slate-700">{app.application_date}</strong></span>
                  {app.follow_up_date && (
                    <span>Follow-up: <strong className="font-mono text-amber-700">{app.follow_up_date}</strong></span>
                  )}
                  {app.interview_date && (
                    <span>Interview: <strong className="font-mono text-teal-700">{new Date(app.interview_date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></span>
                  )}
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                <button
                  onClick={() => handleOpenEdit(app)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer w-full justify-center"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Status</span>
                </button>

                <button
                  onClick={() => setHistoryApp(app)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer w-full justify-center"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Timeline</span>
                </button>

                <button
                  onClick={() => handleDelete(app.id)}
                  title="Remove from tracker"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Application Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Update Application Stage & Details"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Application Progress Stage
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-medium"
            >
              {validStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Follow-up Reminder Date
            </label>
            <input
              type="date"
              value={editFollowUp}
              onChange={(e) => setEditFollowUp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interview / Presentation Date
            </label>
            <input
              type="datetime-local"
              value={editInterview}
              onChange={(e) => setEditInterview(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Notes & Preparations
            </label>
            <textarea
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="e.g. Cleared round 1 technical screen, interview with Lead Engineer on Monday."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedApp(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 cursor-pointer disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Save Stage Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Timeline Modal */}
      <Modal
        isOpen={!!historyApp}
        onClose={() => setHistoryApp(null)}
        title="Application Status Transition History"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Audit history of status changes for <strong className="text-slate-800">{historyApp?.opportunity?.title}</strong>:
          </p>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {historyApp?.history && historyApp.history.length > 0 ? (
              historyApp.history.map((h, i) => (
                <div key={h.id || i} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white" />
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={h.new_status} />
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.changed_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {h.previous_status && (
                      <p className="text-[11px] text-slate-500">
                        Transitioned from: <span className="font-semibold">{h.previous_status}</span>
                      </p>
                    )}
                    {h.remarks && (
                      <p className="text-xs text-slate-700 italic">
                        "{h.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No transition history recorded yet.</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setHistoryApp(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              Close Timeline
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationTracker;
