import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

const STAGES = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SCREENING', label: 'Screening' },
  { key: 'ASSESSMENT', label: 'Assessment' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'OFFER', label: 'Offer' }
];

export const StatusTimeline = ({ currentStatus }) => {
  if (currentStatus === 'REJECTED') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
        <XCircle className="w-4 h-4" /> Application Status: Rejected
      </div>
    );
  }

  if (currentStatus === 'WITHDRAWN') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
        <XCircle className="w-4 h-4" /> Application Status: Withdrawn
      </div>
    );
  }

  const currentIdx = STAGES.findIndex(s => s.key === currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
        
        {STAGES.map((stage, idx) => {
          const isPassed = currentIdx >= 0 && idx <= currentIdx;
          const isCurrent = currentIdx === idx;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCurrent
                    ? "gradient-bg text-white ring-4 ring-indigo-500/20 scale-110 shadow-lg shadow-indigo-500/30"
                    : isPassed
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-900 border border-slate-700 text-slate-500"
                }`}
              >
                {isPassed ? "✓" : idx + 1}
              </div>
              <span className={`text-[11px] mt-2 font-medium ${isCurrent ? "text-indigo-400 font-bold" : isPassed ? "text-slate-200" : "text-slate-500"}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
