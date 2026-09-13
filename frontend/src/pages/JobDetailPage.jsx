import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SkillBadge } from '../components/SkillBadge';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { MatchReasonModal } from '../components/MatchReasonModal';
import { Bookmark, ArrowLeft, CheckCircle2, ExternalLink, Globe, MapPin, Building2, Users } from 'lucide-react';

export const JobDetailPage = () => {
  const { slug } = useParams();
  const { isAuthenticated, isStudent } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${slug}/`);
        if (res.data.success) {
          setJob(res.data.job);
          setSaved(res.data.job.is_saved || false);
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [slug]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/applications/save/${job.id}/`);
      if (res.data.success) {
        setSaved(res.data.saved);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setErrorMsg('');
    setApplying(true);
    try {
      const res = await api.post(`/applications/apply/${job.id}/`);
      if (res.data.success) {
        setApplySuccess(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || "Failed to submit application. Ensure you have an active resume uploaded.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl h-96 border border-[#E5E5E5] animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-[#111111] text-xl font-bold">Opportunity Not Found</h2>
        <Link to="/jobs" className="text-xs font-semibold text-[#2563EB]">Return to Job Discovery</Link>
      </div>
    );
  }

  const score = job.match_score?.score;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back link */}
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#111111] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E5] space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-bold text-2xl shrink-0">
              {job.company?.name?.[0] || 'C'}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">{job.title}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666]">
                <span className="font-bold text-[#111111]">{job.company?.name}</span>
                <VerifiedBadge size="small" />
                <span>·</span>
                <span>{job.location}</span>
                <span>·</span>
                <span>{job.employment_type}</span>
                <span>·</span>
                <span>{job.work_mode}</span>
                <span>·</span>
                <span className="text-[#8A8A8A]">{job.experience_level || 'Entry Level'}</span>
              </div>

              {score !== undefined && score !== null && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowMatchModal(true)}
                    className="text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-md hover:bg-blue-100/80 transition-colors cursor-pointer"
                  >
                    {score}% AI Match Score (Click to view match breakdown)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            {applySuccess ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#16A34A] font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" /> Application Submitted!
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                {applying ? "Submitting..." : "Apply Now"}
              </button>
            )}

            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-lg border transition-colors ${
                saved
                  ? "bg-blue-50 text-[#2563EB] border-blue-200"
                  : "bg-white text-[#666666] hover:text-[#111111] border-[#E5E5E5] hover:border-[#D4D4D4]"
              }`}
              title={saved ? "Unsave Job" : "Save Job"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-[#2563EB]" : ""}`} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

      </div>

      {/* Grid: Main Details & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Overview */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E5] space-y-4">
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">Overview</h3>
            <div className="text-xs text-[#444444] leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E5] space-y-4">
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">Required & Recommended Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((sk, idx) => (
                  <SkillBadge
                    key={idx}
                    name={sk.name}
                    importance={sk.importance}
                    isMatched={job.match_score?.matching_skills?.includes(sk.name)}
                    isMissing={job.match_score?.missing_skills?.includes(sk.name)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* External URL link */}
          <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] flex items-center justify-between text-xs text-[#666666]">
            <span>Verified External Listing Portal:</span>
            <a
              href={job.application_url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              Open External URL <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Sidebar: About the Company */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] space-y-5">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">About the Company</h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] flex items-center justify-center font-bold text-[#111111] text-sm">
                {job.company?.name?.[0] || 'C'}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111111]">{job.company?.name}</h4>
                <VerifiedBadge size="small" />
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-[#666666]">
              <div className="flex items-center justify-between">
                <span>Location:</span>
                <span className="text-[#111111] font-medium">{job.company?.location || job.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Industry:</span>
                <span className="text-[#111111] font-medium">{job.company?.industry || 'Technology'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Company Size:</span>
                <span className="text-[#111111] font-medium">{job.company?.size || '50-200 employees'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification Status:</span>
                <span className="text-[#16A34A] font-semibold">✓ Verified</span>
              </div>
            </div>

            {job.company?.website && (
              <div className="pt-3 border-t border-[#E5E5E5]">
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] text-[#111111] text-xs font-semibold hover:border-[#D4D4D4] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-[#666666]" /> Visit Company Website
                </a>
              </div>
            )}
          </div>
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

    </div>
  );
};
