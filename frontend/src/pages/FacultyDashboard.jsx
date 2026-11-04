import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  PlusCircle,
  Megaphone,
  Briefcase,
  Users,
  Building,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export const FacultyDashboard = ({ onSelectOpportunity }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Post Announcement Modal
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [submittingAnn, setSubmittingAnn] = useState(false);

  // Submit Opportunity Modal
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [oppTitle, setOppTitle] = useState('');
  const [oppOrg, setOppOrg] = useState('');
  const [oppCategory, setOppCategory] = useState(1);
  const [oppDeadline, setOppDeadline] = useState('');
  const [oppDesc, setOppDesc] = useState('');
  const [oppUrl, setOppUrl] = useState('');
  const [submittingOpp, setSubmittingOpp] = useState(false);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const [facRes, catsRes] = await Promise.all([
        api.getFacultyDashboard(),
        api.getCategories()
      ]);
      setData(facRes);
      setCategories(catsRes.categories || []);
    } catch (err) {
      console.error('Failed to load faculty portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setSubmittingAnn(true);
    try {
      await api.postAnnouncement({
        title: annTitle,
        content: annContent,
        is_pinned: annPinned,
        target_audience: 'STUDENTS'
      });
      setIsAnnounceModalOpen(false);
      setAnnTitle('');
      setAnnContent('');
      fetchFacultyData();
    } catch (err) {
      alert(err.message || 'Error posting notice');
    } finally {
      setSubmittingAnn(false);
    }
  };

  const handlePostOpportunity = async (e) => {
    e.preventDefault();
    setSubmittingOpp(true);
    try {
      await api.createOpportunity({
        title: oppTitle,
        organization: oppOrg,
        category_id: parseInt(oppCategory),
        department_id: data?.department?.id || null,
        application_deadline: oppDeadline,
        short_description: oppDesc.slice(0, 150),
        full_description: oppDesc,
        eligibility_criteria: 'Open to departmental students',
        official_url: oppUrl || 'https://www.cuchd.in',
        source_name: `Department of ${data?.department?.code || 'CSE'}`,
        verification_status: 'Verified'
      });
      setIsOppModalOpen(false);
      setOppTitle('');
      setOppOrg('');
      setOppDesc('');
      setOppUrl('');
      fetchFacultyData();
    } catch (err) {
      alert(err.message || 'Error submitting opportunity');
    } finally {
      setSubmittingOpp(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading department coordinator workspace...</div>;
  }

  const stats = data?.stats || {};
  const myOpps = data?.my_opportunities || [];
  const announcements = data?.announcements || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-red-700" />
            Department Coordinator Workspace
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {data?.department?.name || 'Department of Computer Science'} • {data?.faculty?.full_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAnnounceModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-red-700" />
            <span>Post Department Notice</span>
          </button>

          <button
            onClick={() => setIsOppModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Academic Opportunity</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">My Submitted Opportunities</span>
          <span className="text-2xl font-black text-slate-900">{stats.submitted_opportunities || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Department Opportunities</span>
          <span className="text-2xl font-black text-red-700">{stats.department_opportunities || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Department Students</span>
          <span className="text-2xl font-black text-blue-600">{stats.department_students || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Student Applications</span>
          <span className="text-2xl font-black text-emerald-600">{stats.department_applications || 0}</span>
        </div>
      </div>

      {/* Two columns: Opportunities Submitted & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Opportunities */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-red-700" />
            Opportunities Submitted by You
          </h3>

          {myOpps.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No opportunities submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {myOpps.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity(opp.id)}
                  className="py-3 first:pt-0 last:pb-0 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-red-700">{opp.category_name}</span>
                    <span className="font-mono text-slate-400">Due: {opp.application_deadline}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1">
                    {opp.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opp.organization}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Department Announcements */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-blue-600" />
            Active Department Notices
          </h3>

          {announcements.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No notices published yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{a.title}</h4>
                    {a.is_pinned && (
                      <span className="px-2 py-0.2 rounded text-[10px] bg-red-100 text-red-800 font-bold">
                        PINNED
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-2">
                    {a.content}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                    Posted by: {a.author_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Notice Modal */}
      <Modal
        isOpen={isAnnounceModalOpen}
        onClose={() => setIsAnnounceModalOpen(false)}
        title="Publish Departmental Announcement"
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Announcement Title *</label>
            <input
              type="text"
              placeholder="e.g. Schedule for Tier-1 Tech Hackathon Internal Evaluation"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Content *</label>
            <textarea
              rows={4}
              placeholder="Enter full notice text for students..."
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinNotice"
              checked={annPinned}
              onChange={(e) => setAnnPinned(e.target.checked)}
              className="rounded text-red-700 focus:ring-red-600"
            />
            <label htmlFor="pinNotice" className="text-slate-700 font-medium">
              Pin to top of student dashboards
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAnnounceModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAnn}
              className="px-5 py-2 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 cursor-pointer disabled:opacity-50"
            >
              {submittingAnn ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Opportunity Modal */}
      <Modal
        isOpen={isOppModalOpen}
        onClose={() => setIsOppModalOpen(false)}
        title="Submit New Academic Opportunity"
      >
        <form onSubmit={handlePostOpportunity} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              placeholder="e.g. Winter Research Assistantship in Robotics"
              value={oppTitle}
              onChange={(e) => setOppTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization / Lab *</label>
              <input
                type="text"
                placeholder="e.g. CU AI Lab & Texas Instruments"
                value={oppOrg}
                onChange={(e) => setOppOrg(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={oppCategory}
                onChange={(e) => setOppCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Deadline *</label>
              <input
                type="date"
                value={oppDeadline}
                onChange={(e) => setOppDeadline(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Portal URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={oppUrl}
                onChange={(e) => setOppUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Requirements *</label>
            <textarea
              rows={3}
              placeholder="Eligibility, scope of research, required skills, and benefits..."
              value={oppDesc}
              onChange={(e) => setOppDesc(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOppModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingOpp}
              className="px-5 py-2 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 cursor-pointer disabled:opacity-50"
            >
              {submittingOpp ? 'Submitting...' : 'Submit Opportunity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyDashboard;
