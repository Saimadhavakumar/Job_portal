import React from 'react';
import { X, CheckCircle2, AlertTriangle, Sparkles, Building2, MapPin, Briefcase } from 'lucide-react';

export const MatchReasonModal = ({ isOpen, onClose, job, matchData }) => {
  if (!isOpen || !job || !matchData) return null;

  const { score, matching_skills = [], missing_skills = [], reason } = matchData;

  const getScoreBadgeColor = (s) => {
    if (s >= 80) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    if (s >= 60) return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    return "bg-slate-700/50 text-slate-300 border-slate-600";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 border border-slate-700/80 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getScoreBadgeColor(score)} flex items-center gap-1`}>
                <Sparkles className="w-3 h-3" /> {score}% Match
              </span>
              <span className="text-xs text-slate-400">{job.employment_type}</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{job.title}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {job.company?.name}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location} ({job.work_mode})</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explainable Why Recommended Section */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Why Recommended
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Matching Skills */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Matching Profile Skills ({matching_skills.length})
          </h4>
          {matching_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matching_skills.map((s, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
                  ✓ {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No exact skill matches extracted yet.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing / Recommended Skills ({missing_skills.length})
          </h4>
          {missing_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missing_skills.map((s, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                  ⚠ {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-400 font-medium">Your profile covers all required skills for this job!</p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl gradient-bg text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
