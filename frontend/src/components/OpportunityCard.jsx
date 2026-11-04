import React, { useState } from 'react';
import { Bookmark, MapPin, Building, Sparkles, ExternalLink, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import DeadlineBadge from './DeadlineBadge';
import StatusBadge from './StatusBadge';
import { api } from '../services/api';

export const OpportunityCard = ({
  opportunity,
  onSelect,
  onSaveToggle,
  showRecommendation = false
}) => {
  const [isSaved, setIsSaved] = useState(opportunity.is_saved || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      const res = await api.toggleSaveOpportunity(opportunity.id);
      setIsSaved(res.is_saved);
      if (onSaveToggle) onSaveToggle(opportunity.id, res.is_saved);
    } catch (err) {
      console.error('Error toggling save:', err);
    } finally {
      setSaving(false);
    }
  };

  const rec = opportunity.recommendation;

  return (
    <div
      onClick={() => onSelect && onSelect(opportunity.id)}
      className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      <div className="p-5">
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
              {opportunity.category_name}
            </span>
            {opportunity.mode && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                {opportunity.mode}
              </span>
            )}
            {opportunity.is_paid && (
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Paid {opportunity.stipend_amount ? `• ${opportunity.stipend_amount}` : ''}
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            title={isSaved ? "Remove from saved" : "Save opportunity"}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSaved
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-red-600' : ''}`} />
          </button>
        </div>

        {/* Title & Organization */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 mb-1">
          {opportunity.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium truncate">{opportunity.organization}</span>
          <span>•</span>
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{opportunity.location || 'Online'}</span>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {opportunity.short_description}
        </p>

        {/* Recommendation Score & Eligibility (if applicable) */}
        {showRecommendation && rec && (
          <div className="mb-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Match Score
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {rec.match_percentage}%
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${
                  rec.match_percentage >= 70
                    ? 'bg-emerald-500'
                    : rec.match_percentage >= 40
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
                style={{ width: `${rec.match_percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className={`inline-flex items-center gap-1 font-semibold ${
                rec.eligibility_status === 'ELIGIBLE'
                  ? 'text-emerald-700'
                  : rec.eligibility_status === 'POTENTIALLY_ELIGIBLE'
                  ? 'text-amber-700'
                  : 'text-slate-600'
              }`}>
                {rec.eligibility_status === 'ELIGIBLE' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                {rec.eligibility_status === 'POTENTIALLY_ELIGIBLE' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                {rec.eligibility_label}
              </span>
              <span className="text-slate-500 truncate max-w-[140px]">
                {rec.reasons?.[0] || ''}
              </span>
            </div>
          </div>
        )}

        {/* Skills chips */}
        {opportunity.skills && opportunity.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {opportunity.skills.slice(0, 3).map((sk) => (
              <span
                key={sk.id}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-normal"
              >
                {sk.name}
              </span>
            ))}
            {opportunity.skills.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[11px] text-slate-400">
                +{opportunity.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <DeadlineBadge
          daysRemaining={opportunity.days_remaining}
          deadlineUrgency={opportunity.deadline_urgency}
          deadlineDate={opportunity.application_deadline}
        />

        <div className="flex items-center gap-2">
          {opportunity.user_application_status ? (
            <StatusBadge status={opportunity.user_application_status} />
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 group-hover:translate-x-0.5 transition-transform">
              View Details
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
