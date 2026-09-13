import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { JobCard } from '../components/JobCard';
import { EmptyState } from '../components/EmptyState';
import { Bookmark } from 'lucide-react';

export const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await api.get('/applications/saved-jobs/');
      if (res.data.success) {
        setSavedJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSaveToggle = (jobId, isSaved) => {
    if (!isSaved) {
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="space-y-1 border-b border-[#E5E5E5] pb-4">
        <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Saved Jobs</h1>
        <p className="text-sm text-[#666666]">Keep track of verified opportunities you plan to revisit or apply for later.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => <div key={n} className="bg-white rounded-xl h-20 border border-[#E5E5E5] animate-pulse" />)}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="space-y-3">
          {savedJobs.map(job => (
            <JobCard key={job.id} job={job} onSaveToggle={handleSaveToggle} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet."
          description="Save opportunities you want to revisit later."
          actionLabel="Browse Jobs"
          actionLink="/jobs"
        />
      )}

    </div>
  );
};
