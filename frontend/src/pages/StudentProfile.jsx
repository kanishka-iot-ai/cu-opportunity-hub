import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Building,
  Award,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const StudentProfile = () => {
  const { user, updateProfile } = useAuth();
  const profile = user?.profile || {};

  const [departments, setDepartments] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [departmentId, setDepartmentId] = useState(profile.department_id || '');
  const [courseId, setCourseId] = useState(profile.course_id || '');
  const [semester, setSemester] = useState(profile.current_semester || 4);
  const [cgpa, setCgpa] = useState(profile.cgpa || 8.5);
  const [phone, setPhone] = useState(profile.phone || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || '');
  const [githubUrl, setGithubUrl] = useState(profile.github_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolio_url || '');
  const [selectedSkills, setSelectedSkills] = useState(
    profile.skills ? profile.skills.map((s) => s.id) : []
  );
  const [selectedInterests, setSelectedInterests] = useState(
    profile.interests ? profile.interests.map((i) => i.id) : []
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptsRes, skillsRes, catsRes] = await Promise.all([
          api.getDepartments(),
          api.getSkills(),
          api.getCategories()
        ]);
        setDepartments(deptsRes.departments || []);
        setSkillsList(skillsRes.skills || []);
        setCategoriesList(catsRes.categories || []);
      } catch (err) {
        console.error('Failed to load profile metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleToggleSkill = (skillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleToggleInterest = (catId) => {
    setSelectedInterests((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateProfile({
        full_name: fullName,
        department_id: departmentId ? parseInt(departmentId) : null,
        course_id: courseId ? parseInt(courseId) : null,
        current_semester: parseInt(semester),
        cgpa: parseFloat(cgpa),
        phone,
        bio,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        skill_ids: selectedSkills,
        interest_category_ids: selectedInterests
      });
      setSuccessMsg('Academic profile updated successfully! Match scores have refreshed.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const currentDept = departments.find((d) => d.id === parseInt(departmentId));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-red-700" />
          Academic Profile & Preferences
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Keep your academic record and technical stack updated for accurate AI opportunity matching.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
        {/* Section 1: University Identity */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            1. University Enrollment Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Student UID / Roll Number
              </label>
              <input
                type="text"
                value={user?.uid || ''}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official Chandigarh University Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-600 cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Full Legal Name (as registered with Examination Branch) *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Department & Academic Standing */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            2. Academic Department & Performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department / Institute
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setDepartmentId(val);
                  const d = departments.find((x) => x.id === val);
                  if (d?.courses?.length > 0) setCourseId(d.courses[0].id);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Degree Program
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {currentDept?.courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current CGPA (out of 10.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.0"
                max="10.0"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Verified Technical Skills (Score: 25 pts)
            </h2>
            <span className="text-[11px] text-slate-500">
              Selected: <strong className="text-slate-900">{selectedSkills.length}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {skillsList.map((sk) => {
              const isSelected = selectedSkills.includes(sk.id);
              return (
                <button
                  type="button"
                  key={sk.id}
                  onClick={() => handleToggleSkill(sk.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-700 text-white border-red-700 shadow-2xs font-semibold'
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
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Opportunity Preferences (Score: 15 pts)
            </h2>
            <span className="text-[11px] text-slate-500">
              Selected: <strong className="text-slate-900">{selectedInterests.length}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categoriesList.slice(0, 12).map((cat) => {
              const isSelected = selectedInterests.includes(cat.id);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleToggleInterest(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Professional Links & Bio */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            5. Professional Links & Bio
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Short Bio / Career Statement
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. B.Tech IT student at Chandigarh University, passionate about scalable cloud architectures and AI."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Academic Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;
