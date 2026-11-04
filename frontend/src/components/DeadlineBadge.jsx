import React from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const DeadlineBadge = ({ daysRemaining, deadlineUrgency, deadlineDate }) => {
  let bgClass = '';
  let textClass = '';
  let borderClass = '';
  let Icon = Clock;
  let label = '';

  const formattedDate = deadlineDate ? new Date(deadlineDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';

  if (deadlineUrgency === 'EXPIRED' || daysRemaining < 0) {
    bgClass = 'bg-slate-100';
    textClass = 'text-slate-600';
    borderClass = 'border-slate-200';
    label = 'Deadline Expired';
    Icon = AlertCircle;
  } else if (deadlineUrgency === 'CRITICAL' || daysRemaining <= 3) {
    // Red: Less than 3 days remaining
    bgClass = 'bg-rose-50';
    textClass = 'text-rose-700 font-semibold';
    borderClass = 'border-rose-200';
    label = daysRemaining === 0 ? 'Closes Today!' : `Closing in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}!`;
    Icon = AlertTriangle;
  } else if (deadlineUrgency === 'WARNING' || daysRemaining <= 7) {
    // Yellow: 3–7 days remaining
    bgClass = 'bg-amber-50';
    textClass = 'text-amber-800 font-medium';
    borderClass = 'border-amber-200';
    label = `${daysRemaining} days left`;
    Icon = Clock;
  } else {
    // Green: More than 7 days remaining
    bgClass = 'bg-emerald-50';
    textClass = 'text-emerald-700 font-medium';
    borderClass = 'border-emerald-200';
    label = `${daysRemaining} days left`;
    Icon = CheckCircle2;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${bgClass} ${textClass} ${borderClass}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
      {formattedDate && <span className="opacity-75">({formattedDate})</span>}
    </div>
  );
};

export default DeadlineBadge;
