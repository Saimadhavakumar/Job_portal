import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight, MapPin } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { MatchReasonModal } from './MatchReasonModal';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const JobCard = ({ job, onSaveToggle }) => {
  const { isAuthenticated, isStudent } = useAuth();
  const [saved, setSaved] = useState(job.is_saved || false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await api.post(`/applications/save/${job.id}/`);
      if (res.data.success) {
        setSaved(res.data.saved);
        if (onSaveToggle) onSaveToggle(job.id, res.data.saved);
      }
    } catch (err) {
      console.error("Save job toggle error:", err);
    }
  };

  const score = job.match_score?.score;

  return (
    <>
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5E5E5] hover:border-[#D4D4D4] hover:shadow-xs transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left: Company logo & Job summary */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          
          {/* Logo */}
          <div className="w-11 h-11 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-bold text-base shrink-0 group-hover:border-[#2563EB]/40 transition-colors">
            {job.company?.name?.[0] || 'C'}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/jobs/${job.slug}`} className="font-bold text-base text-[#111111] hover:text-[#2563EB] transition-colors leading-snug truncate">
                {job.title}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#666666]">
              <span className="font-semibold text-[#111111]">{job.company?.name}</span>
              <span>·</span>
              <span>{job.location}</span>
              <span>·</span>
              <span>{job.work_mode}</span>
              <span>·</span>
              <span>{job.employment_type}</span>
              <span>·</span>
              <span className="text-[#8A8A8A]">{job.experience_level || 'Entry Level'}</span>
            </div>

            {/* Sub-bar: Verified Badge & AI Match Score */}
            <div className="flex items-center gap-2.5 pt-1">
              <VerifiedBadge size="small" />

              {isStudent && score !== undefined && score !== null && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMatchModal(true);
                  }}
                  className="text-[11px] font-semibold text-[#2563EB] bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md hover:bg-blue-100/80 transition-colors cursor-pointer"
                >
                  {score}% Match
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Bookmark & Arrow indicator */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <button
            onClick={handleSave}
            className={`p-2 rounded-lg border transition-colors ${
              saved
                ? "bg-blue-50 text-[#2563EB] border-blue-200"
                : "bg-[#FAFAF9] text-[#8A8A8A] hover:text-[#111111] border-[#E5E5E5] hover:border-[#D4D4D4]"
            }`}
            title={saved ? "Unsave job" : "Save job"}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-[#2563EB]" : ""}`} />
          </button>

          <Link
            to={`/jobs/${job.slug}`}
            className="w-9 h-9 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] flex items-center justify-center text-[#666666] group-hover:text-[#2563EB] group-hover:border-[#2563EB]/40 group-hover:bg-white transition-all"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>

      {/* Explainable Match Modal */}
      {showMatchModal && job.match_score && (
        <MatchReasonModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          job={job}
          matchData={job.match_score}
        />
      )}
    </>
  );
};
