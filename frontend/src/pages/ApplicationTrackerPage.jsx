import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { StatusTimeline } from '../components/StatusTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { FileText, Building2, MapPin, Calendar, FileCode2, History } from 'lucide-react';

export const ApplicationTrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications/my-applications/');
        if (res.data.success) {
          setApplications(res.data.applications);
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="space-y-1 border-b border-[#E5E5E5] pb-4">
        <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Application Tracker</h1>
        <p className="text-sm text-[#666666]">Track real-time status and timeline updates for all your submitted job applications.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => <div key={n} className="bg-white rounded-xl h-48 border border-[#E5E5E5] animate-pulse" />)}
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-6">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E5] space-y-6">
              
              {/* Application Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-bold text-lg">
                    {app.job?.company?.name?.[0] || 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#111111] tracking-tight">{app.job?.title}</h3>
                      <StatusBadge status={app.status || 'Applied'} />
                    </div>
                    <p className="text-xs text-[#666666] flex items-center gap-2 mt-0.5">
                      <span>{app.job?.company?.name}</span>
                      <span>·</span>
                      <span>{app.job?.location}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1 text-xs text-[#666666]">
                  <span>Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                  {app.resume_version && (
                    <span className="block text-[11px] text-[#2563EB] font-mono">
                      Resume Version v{app.resume_version?.version_number}
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Stage Timeline */}
              <StatusTimeline currentStatus={app.status} />

              {/* Status History Logs */}
              {app.history && app.history.length > 0 && (
                <div className="bg-[#FAFAF9] rounded-lg p-4 border border-[#E5E5E5] space-y-3">
                  <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#2563EB]" /> Status History Log
                  </h4>
                  <div className="space-y-2">
                    {app.history.map(h => (
                      <div key={h.id} className="text-xs flex items-center justify-between border-l-2 border-[#2563EB] pl-3 py-1">
                        <div>
                          <span className="font-semibold text-[#111111]">Status updated to {h.new_status}</span>
                          {h.note && <p className="text-[#666666] text-[11px] mt-0.5">{h.note}</p>}
                        </div>
                        <span className="text-[10px] text-[#8A8A8A]">{new Date(h.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="You haven't applied to any jobs yet."
          description="Explore verified opportunities and submit your application to track its progress."
          actionLabel="Explore Opportunities"
          actionLink="/jobs"
        />
      )}

    </div>
  );
};
