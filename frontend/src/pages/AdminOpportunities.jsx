import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export const AdminOpportunities = ({ onSelectOpportunity }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vStatus, setVStatus] = useState('ALL');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    category_id: 1,
    department_id: '',
    short_description: '',
    full_description: '',
    eligibility_criteria: '',
    min_cgpa: 6.5,
    target_semesters: 'ALL',
    target_degrees: 'ALL',
    benefits: '',
    required_documents: 'Resume, CU Student ID',
    application_procedure: 'Apply on official link',
    official_url: '',
    contact_email: 'placements@cuchd.in',
    location: 'Chandigarh University / Online',
    mode: 'Online',
    is_paid: false,
    stipend_amount: '',
    application_deadline: '',
    verification_status: 'Verified',
    source_name: 'Chandigarh University Placement Cell',
    skill_ids: []
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminOpportunities({
        q: search,
        verification_status: vStatus
      });
      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catsRes, deptsRes, skillsRes] = await Promise.all([
          api.getCategories(),
          api.getDepartments(),
          api.getSkills()
        ]);
        setCategories(catsRes.categories || []);
        setDepartments(deptsRes.departments || []);
        setSkillsList(skillsRes.skills || []);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [search, vStatus]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      title: '',
      organization: '',
      category_id: categories[0]?.id || 1,
      department_id: '',
      short_description: '',
      full_description: '',
      eligibility_criteria: '',
      min_cgpa: 6.5,
      target_semesters: 'ALL',
      target_degrees: 'ALL',
      benefits: '',
      required_documents: 'Resume, CU Student ID Card',
      application_procedure: 'Apply via official portal link',
      official_url: '',
      contact_email: 'placements@cuchd.in',
      location: 'Chandigarh University / Online',
      mode: 'Online',
      is_paid: false,
      stipend_amount: '',
      application_deadline: '',
      verification_status: 'Verified',
      source_name: 'Chandigarh University Placement Cell',
      skill_ids: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (opp) => {
    setIsEditing(true);
    setCurrentId(opp.id);
    setFormData({
      title: opp.title,
      organization: opp.organization,
      category_id: opp.category_id,
      department_id: opp.department_id || '',
      short_description: opp.short_description,
      full_description: opp.full_description,
      eligibility_criteria: opp.eligibility_criteria,
      min_cgpa: opp.min_cgpa || 0.0,
      target_semesters: opp.target_semesters || 'ALL',
      target_degrees: opp.target_degrees || 'ALL',
      benefits: opp.benefits || '',
      required_documents: opp.required_documents || '',
      application_procedure: opp.application_procedure || '',
      official_url: opp.official_url,
      contact_email: opp.contact_email || '',
      location: opp.location || 'Online',
      mode: opp.mode || 'Online',
      is_paid: Boolean(opp.is_paid),
      stipend_amount: opp.stipend_amount || '',
      application_deadline: opp.application_deadline ? opp.application_deadline.slice(0, 10) : '',
      verification_status: opp.verification_status || 'Verified',
      source_name: opp.source_name || '',
      skill_ids: opp.skills ? opp.skills.map((s) => s.id) : []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        min_cgpa: parseFloat(formData.min_cgpa || 0),
        is_paid: Boolean(formData.is_paid)
      };

      if (isEditing) {
        await api.updateOpportunity(currentId, payload);
      } else {
        await api.createOpportunity(payload);
      }

      setIsModalOpen(false);
      fetchOpportunities();
    } catch (err) {
      alert(err.message || 'Error saving opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await api.verifyOpportunity(id, status);
      fetchOpportunities();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await api.deleteOpportunity(id);
      fetchOpportunities();
    } catch (err) {
      alert(err.message || 'Error deleting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-700" />
            Opportunity Management & Approval
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Publish, edit, review, and approve departmental submissions across Chandigarh University.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, organization, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs"
          />
        </div>

        <select
          value={vStatus}
          onChange={(e) => setVStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium w-full sm:w-auto"
        >
          <option value="ALL">All Verification Statuses</option>
          <option value="Verified">Verified Only</option>
          <option value="Pending Verification">Pending Approvals</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Title & Organization</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Department</th>
                <th className="py-3.5 px-3">Deadline</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading opportunities...
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching opportunities found.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onSelectOpportunity(opp.id)}
                        className="font-bold text-slate-900 hover:text-red-700 cursor-pointer line-clamp-1"
                      >
                        {opp.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {opp.organization} • {opp.location}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-50 text-red-700 border border-red-100">
                        {opp.category_name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {opp.department_code || 'ALL'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {opp.application_deadline}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          opp.verification_status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : opp.verification_status === 'Pending Verification'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {opp.verification_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {opp.verification_status === 'Pending Verification' && (
                          <button
                            onClick={() => handleVerify(opp.id, 'Verified')}
                            title="Approve for public listing"
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(opp)}
                          title="Edit"
                          className="p-1 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(opp.id)}
                          title="Delete"
                          className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Opportunity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Academic Opportunity' : 'Post New Academic Opportunity'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g. Google Summer Internship 2026"
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization *</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                required
                placeholder="e.g. Google India / DRDO"
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category (All 20) *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="">All Departments (University-wide)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mode & Location</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Deadline *</label>
              <input
                type="date"
                value={formData.application_deadline}
                onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0.0"
                max="10.0"
                value={formData.min_cgpa}
                onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Application URL *</label>
            <input
              type="url"
              value={formData.official_url}
              onChange={(e) => setFormData({ ...formData, official_url: e.target.value })}
              required
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Short Summary (2-3 sentences) *</label>
            <textarea
              rows={2}
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Complete Description & Scope *</label>
            <textarea
              rows={4}
              value={formData.full_description}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Eligibility Criteria *</label>
            <textarea
              rows={2}
              value={formData.eligibility_criteria}
              onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Opportunity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminOpportunities;
