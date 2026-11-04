import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Building,
  GraduationCap,
  Award,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import OpportunityCard from '../components/OpportunityCard';
import Modal from '../components/Modal';

export const Recommendations = ({ onSelectOpportunity, onNavigateProfile }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, eligible_only, high_match
  const [studentMetrics, setStudentMetrics] = useState(null);
  const [profileComplete, setProfileComplete] = useState(true);

  // Explanation Modal
  const [explainedOpp, setExplainedOpp] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await api.getRecommendations(filterType);
      setRecommendations(data.recommendations || []);
      setStudentMetrics(data.student_metrics);
      setProfileComplete(data.profile_complete);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [filterType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Personalized Opportunity Recommendations
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Engineered transparently using your department, degree program, technical skills, semester, and saved interests.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'all' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setFilterType('eligible_only')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'eligible_only' ? 'bg-white font-bold text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified Eligible
          </button>
          <button
            onClick={() => setFilterType('high_match')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'high_match' ? 'bg-white font-bold text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            High Match (≥50%)
          </button>
        </div>
      </div>

      {/* Transparent Match Score Formula Explainer Banner */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50/50 rounded-2xl border border-red-200/60 p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-red-700" />
              <h3 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                Transparent 100-Point Scoring Algorithm
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every opportunity is evaluated in real-time against your verified Chandigarh University academic profile:
            </p>
          </div>

          {/* Breakdown Pills */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              🏛️ Dept: 25 pts
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              🎓 Degree: 20 pts
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              ⚡ Skills: 25 pts
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              📅 Semester: 15 pts
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              🎯 Interests: 15 pts
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Recommended Opportunities */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Calculating personalized opportunity matches...
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching recommendations found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try switching filter to "All Matches" or add more skills to your academic profile.
          </p>
          <button
            onClick={() => onNavigateProfile && onNavigateProfile()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 cursor-pointer shadow-xs"
          >
            Update Skills in Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map((opp) => {
            const rec = opp.recommendation;
            return (
              <div key={opp.id} className="relative group">
                <OpportunityCard
                  opportunity={opp}
                  onSelect={onSelectOpportunity}
                  showRecommendation={true}
                />
                {/* Explain Match button on each card */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExplainedOpp(opp);
                  }}
                  className="mt-2 w-full text-center text-[11px] font-semibold text-slate-500 hover:text-red-700 py-1 transition-colors cursor-pointer"
                >
                  💡 Why was this recommended? (View Breakdown)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Match Explanation Modal */}
      <Modal
        isOpen={!!explainedOpp}
        onClose={() => setExplainedOpp(null)}
        title="Why This Opportunity Was Recommended"
      >
        {explainedOpp && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{explainedOpp.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{explainedOpp.organization}</p>
            </div>

            {/* Score header */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Overall Match Score</span>
                <span className="text-2xl font-black text-slate-900">
                  {explainedOpp.recommendation?.score} / 100%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Eligibility Status</span>
                <span className={`text-xs font-bold ${
                  explainedOpp.recommendation?.eligibility_status === 'ELIGIBLE' ? 'text-emerald-700' :
                  explainedOpp.recommendation?.eligibility_status === 'POTENTIALLY_ELIGIBLE' ? 'text-amber-700' :
                  'text-slate-600'
                }`}>
                  {explainedOpp.recommendation?.eligibility_label}
                </span>
              </div>
            </div>

            {/* 5-Criteria Breakdown */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                Score Breakdown
              </h5>
              
              {/* Department */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span>Department Alignment (Max 25 pts)</span>
                <span className="font-bold font-mono text-slate-800">
                  {explainedOpp.recommendation?.breakdown?.department_score} / 25
                </span>
              </div>

              {/* Course / Degree */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span>Degree & Course Match (Max 20 pts)</span>
                <span className="font-bold font-mono text-slate-800">
                  {explainedOpp.recommendation?.breakdown?.course_score} / 20
                </span>
              </div>

              {/* Skills */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span>Technical Skills Match (Max 25 pts)</span>
                <span className="font-bold font-mono text-slate-800">
                  {explainedOpp.recommendation?.breakdown?.skills_score} / 25
                </span>
              </div>

              {/* Semester */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span>Current Semester Fit (Max 15 pts)</span>
                <span className="font-bold font-mono text-slate-800">
                  {explainedOpp.recommendation?.breakdown?.semester_score} / 15
                </span>
              </div>

              {/* Interests */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span>Category Interest Alignment (Max 15 pts)</span>
                <span className="font-bold font-mono text-slate-800">
                  {explainedOpp.recommendation?.breakdown?.interest_score} / 15
                </span>
              </div>
            </div>

            {/* Reasons / Explanation List */}
            <div className="space-y-2 pt-2">
              <h5 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                Matching Criteria Reasons
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {explainedOpp.recommendation?.reasons?.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setExplainedOpp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = explainedOpp.id;
                  setExplainedOpp(null);
                  onSelectOpportunity(id);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 cursor-pointer shadow-xs"
              >
                View Opportunity
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Recommendations;
