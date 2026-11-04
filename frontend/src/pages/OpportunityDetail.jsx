import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Clock,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Award,
  AlertTriangle,
  Briefcase,
  Mail,
  GraduationCap,
  Sparkles,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DeadlineBadge from '../components/DeadlineBadge';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export const OpportunityDetail = ({ opportunityId, onBack, onSelectOpportunity }) => {
  const { user, isStudent } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Application Tracking Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [appStatus, setAppStatus] = useState('Planning to Apply');
  const [personalNotes, setPersonalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [updatingApp, setUpdatingApp] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await api.getOpportunity(opportunityId);
      const opp = data.opportunity;
      setOpportunity(opp);
      setIsSaved(opp.is_saved || false);
      if (opp.user_application_status) {
        setAppStatus(opp.user_application_status);
      }
    } catch (err) {
      console.error('Failed to load opportunity detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opportunityId) {
      fetchDetail();
      window.scrollTo(0, 0);
    }
  }, [opportunityId]);

  const handleToggleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await api.toggleSaveOpportunity(opportunity.id);
      setIsSaved(res.is_saved);
    } catch (err) {
      console.error('Error saving opportunity:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApplicationStatus = async (e) => {
    e.preventDefault();
    setUpdatingApp(true);
    try {
      await api.createOrUpdateApplication({
        opportunity_id: opportunity.id,
        status: appStatus,
        personal_notes: personalNotes,
        follow_up_date: followUpDate || null,
        interview_date: interviewDate ? new Date(interviewDate).toISOString() : null
      });
      setIsTrackModalOpen(false);
      setSaveSuccessMsg('Application tracker updated!');
      fetchDetail();
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to track application:', err);
    } finally {
      setUpdatingApp(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading verified opportunity details from Chandigarh University portal...
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-slate-700">Opportunity not found</p>
        <button
          onClick={onBack}
          className="mt-3 text-xs text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to opportunities
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button and Meta header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explorer
        </button>

        <div className="flex items-center gap-2">
          {saveSuccessMsg && (
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {saveSuccessMsg}
            </span>
          )}
          <button
            onClick={handleToggleSave}
            disabled={saving}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSaved
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-700' : ''}`} />
            <span>{isSaved ? 'Saved to Bookmarks' : 'Save Opportunity'}</span>
          </button>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div>
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-100">
              {opportunity.category_name}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
              {opportunity.mode}
            </span>
            {opportunity.is_paid && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Paid {opportunity.stipend_amount ? `• ${opportunity.stipend_amount}` : ''}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              {opportunity.verification_status}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {opportunity.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{opportunity.organization}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{opportunity.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Posted: {new Date(opportunity.published_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Urgent Deadline Alert Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-red-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800">
                Application Deadline: {new Date(opportunity.application_deadline).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-[11px] text-slate-500">
                Official external portals strictly close at 11:59 PM IST on the deadline date.
              </p>
            </div>
          </div>

          <DeadlineBadge
            daysRemaining={opportunity.days_remaining}
            deadlineUrgency={opportunity.deadline_urgency}
          />
        </div>

        {/* Action Buttons: Apply Now & Track Application */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Official Apply Now button */}
          <a
            href={opportunity.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[200px] py-3 px-6 rounded-2xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-sm flex items-center justify-center gap-2 text-center"
          >
            <span>APPLY ON OFFICIAL PORTAL</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Personal Application Tracker Button */}
          {isStudent && (
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="py-3 px-5 rounded-2xl text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-800 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-slate-600" />
              <span>{opportunity.user_application_status ? `Status: ${opportunity.user_application_status}` : 'Add to Application Tracker'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Details Tabs & Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-700" />
              Overview & Detailed Description
            </h2>
            <div className="text-xs text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
              {opportunity.full_description}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Eligibility Criteria
            </h2>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {opportunity.eligibility_criteria}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Minimum CGPA Required</span>
                <span className="font-bold text-slate-800">{opportunity.min_cgpa > 0 ? `${opportunity.min_cgpa.toFixed(1)} / 10.0` : 'No CGPA Cutoff'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Target Semesters</span>
                <span className="font-bold text-slate-800">{opportunity.target_semesters || 'All Semesters'}</span>
              </div>
            </div>
          </div>

          {/* Benefits & Perks */}
          {opportunity.benefits && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Benefits & Rewards
              </h2>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {opportunity.benefits}
              </div>
            </div>
          )}

          {/* Application Procedure & Required Documents */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-700" />
              How to Apply & Required Documents
            </h2>
            <div>
              <h3 className="text-xs font-semibold text-slate-800 mb-1">Application Procedure:</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {opportunity.application_procedure}
              </p>
            </div>
            {opportunity.required_documents && (
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-800 mb-1">Documents to Prepare:</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {opportunity.required_documents}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-6">
          {/* Target Skills */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Relevant Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.skills && opportunity.skills.length > 0 ? (
                opportunity.skills.map((sk) => (
                  <span
                    key={sk.id}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                  >
                    {sk.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Open to all skill profiles</span>
              )}
            </div>
          </div>

          {/* Department & Institution Info */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 text-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Academic Alignment
            </h3>
            <div>
              <span className="text-slate-400 block text-[11px]">Hosting / Target Department:</span>
              <span className="font-semibold text-slate-800">{opportunity.department_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Eligible Degrees:</span>
              <span className="font-semibold text-slate-800">{opportunity.target_degrees || 'All Programs'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Source Verified:</span>
              <span className="font-semibold text-emerald-700">{opportunity.source_name}</span>
            </div>
            {opportunity.contact_email && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href={`mailto:${opportunity.contact_email}`} className="text-red-700 hover:underline">
                  {opportunity.contact_email}
                </a>
              </div>
            )}
          </div>

          {/* Related Opportunities */}
          {opportunity.related_opportunities && opportunity.related_opportunities.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Related in {opportunity.category_name}
              </h3>
              <div className="space-y-2.5">
                {opportunity.related_opportunities.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectOpportunity(rel.id)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-red-50/50 border border-slate-200/60 transition-colors cursor-pointer group"
                  >
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-red-700 line-clamp-1">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{rel.organization}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">
                        Due: {new Date(rel.application_deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="font-bold text-red-700">View →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Track Application Modal */}
      <Modal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        title="Personal Application Tracker"
      >
        <form onSubmit={handleSaveApplicationStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Application Status
            </label>
            <select
              value={appStatus}
              onChange={(e) => setAppStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-medium"
            >
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
              ].map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Follow-up Reminder Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interview / Presentation Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Notes & Application Checklist
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Submitted resume through portal, mentor letter attached, practicing DP and trees."
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTrackModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingApp}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 cursor-pointer disabled:opacity-50"
            >
              {updatingApp ? 'Saving...' : 'Update Tracker'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OpportunityDetail;
