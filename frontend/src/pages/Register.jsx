import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    uid: '',
    email: '',
    full_name: '',
    password: '',
    department_id: '',
    course_id: '',
    current_semester: 4,
    academic_year: '2025-2026',
    cgpa: 8.5,
    phone: '',
    skill_ids: [],
    interest_category_ids: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoadingMeta(true);
        const [deptsData, skillsData, catsData] = await Promise.all([
          api.getDepartments(),
          api.getSkills(),
          api.getCategories()
        ]);
        setDepartments(deptsData.departments || []);
        setSkillsList(skillsData.skills || []);
        setCategoriesList(catsData.categories || []);

        // Default to first department and course
        if (deptsData.departments?.length > 0) {
          const firstDept = deptsData.departments[0];
          setFormData((prev) => ({
            ...prev,
            department_id: firstDept.id,
            course_id: firstDept.courses?.[0]?.id || ''
          }));
        }
      } catch (err) {
        console.error('Failed to load registration metadata:', err);
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleUidChange = (e) => {
    const val = e.target.value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      uid: val,
      email: val ? `${val.toLowerCase()}@cuchd.in` : ''
    }));
  };

  const handleDepartmentChange = (e) => {
    const deptId = parseInt(e.target.value);
    const selectedDept = departments.find((d) => d.id === deptId);
    setFormData((prev) => ({
      ...prev,
      department_id: deptId,
      course_id: selectedDept?.courses?.[0]?.id || ''
    }));
  };

  const toggleSkill = (skillId) => {
    setFormData((prev) => {
      const exists = prev.skill_ids.includes(skillId);
      return {
        ...prev,
        skill_ids: exists
          ? prev.skill_ids.filter((id) => id !== skillId)
          : [...prev.skill_ids, skillId]
      };
    });
  };

  const toggleInterest = (catId) => {
    setFormData((prev) => {
      const exists = prev.interest_category_ids.includes(catId);
      return {
        ...prev,
        interest_category_ids: exists
          ? prev.interest_category_ids.filter((id) => id !== catId)
          : [...prev.interest_category_ids, catId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUid = (formData.uid || '').trim().toUpperCase();
    const cleanName = (formData.full_name || '').trim();
    const cleanPass = (formData.password || '').trim();

    if (!cleanUid || !cleanName || !cleanPass) {
      setError('UID, Full Name, and Password are required.');
      return;
    }
    if (cleanPass.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      localStorage.setItem('cu_last_identifier', cleanUid);
      localStorage.setItem('cu_just_registered', cleanUid);
      await register({
        ...formData,
        uid: cleanUid,
        email: formData.email ? formData.email.trim().toLowerCase() : `${cleanUid.toLowerCase()}@cuchd.in`,
        full_name: cleanName,
        password: cleanPass,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        course_id: formData.course_id ? parseInt(formData.course_id) : null,
        current_semester: parseInt(formData.current_semester),
        cgpa: parseFloat(formData.cgpa)
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    if (formData.uid) {
      localStorage.setItem('cu_last_identifier', formData.uid.trim().toUpperCase());
    }
    onSwitchToLogin();
  };

  const currentDept = departments.find((d) => d.id === parseInt(formData.department_id));

  return (
    <div className="min-h-screen bg-slate-100/80 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-700 font-black text-sm">
              CU
            </div>
            <div>
              <h1 className="text-lg font-bold">Chandigarh University Student Registration</h1>
              <p className="text-xs text-red-100">Set up your academic profile for opportunity matching</p>
            </div>
          </div>
          <button
            onClick={handleSwitchToLogin}
            className="text-xs text-red-100 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Identity */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              1. University Identity & Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student UID / Roll Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 25BCS10101 or 25BIT10180"
                  value={formData.uid}
                  onChange={handleUidChange}
                  autoComplete="username"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official College Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  placeholder="25bcs10101@cuchd.in"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (as per CUIMS) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kanishka Giri"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  autoComplete="name"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portal Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password (min 6 chars)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Program */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              2. Academic Department & Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Institute
                </label>
                <select
                  value={formData.department_id}
                  onChange={handleDepartmentChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree Course
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                >
                  {currentDept?.courses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.degree_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Semester
                </label>
                <select
                  value={formData.current_semester}
                  onChange={(e) => setFormData({ ...formData, current_semester: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cumulative CGPA (out of 10.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="10.0"
                  placeholder="8.85"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical Skills */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              3. Technical & Core Skills (Used for AI Match Score)
            </h2>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Select all skills you are proficient in or learning:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((sk) => {
                const isSelected = formData.skill_ids.includes(sk.id);
                return (
                  <button
                    type="button"
                    key={sk.id}
                    onClick={() => toggleSkill(sk.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-700 text-white border-red-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                    {sk.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Category Interests */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              4. Opportunity Preferences & Interests
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {categoriesList.slice(0, 10).map((cat) => {
                const isSelected = formData.interest_category_ids.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleInterest(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSwitchToLogin}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Already registered? Sign In
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
