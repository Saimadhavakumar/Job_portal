import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { JobCard } from '../components/JobCard';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { LayoutDashboard, FileText, Bookmark, Sparkles, User, Bell, Settings, ArrowRight, ExternalLink } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsRes, savedRes, recRes] = await Promise.all([
          api.get('/applications/my-applications/'),
          api.get('/applications/saved-jobs/'),
          api.get('/jobs/')
        ]);

        if (appsRes.data.success) setApplications(appsRes.data.applications);
        if (savedRes.data.success) setSavedJobs(savedRes.data.jobs);
        if (recRes.data.success) setRecommendedJobs(recRes.data.jobs.slice(0, 4));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Applications', count: applications.length || 12, sub: 'Submitted' },
    { label: 'Saved Jobs', count: savedJobs.length || 5, sub: 'Bookmarked' },
    { label: 'Interviews', count: 2, sub: 'Scheduled' },
    { label: 'Offers', count: 1, sub: 'Received' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] space-y-1 sticky top-20">
            
            <div className="px-3 py-2 border-b border-[#E5E5E5] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Candidate Portal</span>
              <h3 className="text-sm font-bold text-[#111111] truncate">{user?.first_name || 'Candidate'} {user?.last_name || ''}</h3>
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'dashboard' ? 'bg-[#2563EB] text-white' : 'text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'applications' ? 'bg-[#2563EB] text-white' : 'text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111]'
              }`}
            >
              <FileText className="w-4 h-4" /> My Applications
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'saved' ? 'bg-[#2563EB] text-white' : 'text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111]'
              }`}
            >
              <Bookmark className="w-4 h-4" /> Saved Jobs
            </button>

            <button
              onClick={() => setActiveTab('recommended')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'recommended' ? 'bg-[#2563EB] text-white' : 'text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111]'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Recommended Jobs
            </button>

            <div className="pt-2 border-t border-[#E5E5E5] space-y-1">
              <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111] transition-colors">
                <User className="w-4 h-4" /> Profile & Resume
              </Link>
              <Link to="/notifications" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111] transition-colors">
                <Bell className="w-4 h-4" /> Notifications
              </Link>
              <span className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111] transition-colors cursor-pointer">
                <Settings className="w-4 h-4" /> Settings
              </span>
            </div>

          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              Welcome back, {user?.first_name || 'Candidate'}.
            </h1>
            <p className="text-xs text-[#666666]">Track your applications, interview invites, and recommended jobs.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((st, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-[#E5E5E5] space-y-1">
                <span className="block text-2xl font-black text-[#111111] tracking-tight">{st.count}</span>
                <span className="block text-xs font-bold text-[#111111]">{st.label}</span>
                <span className="block text-[10px] text-[#8A8A8A]">{st.sub}</span>
              </div>
            ))}
          </div>

          {/* Tab 1: Recent Applications Table */}
          {(activeTab === 'dashboard' || activeTab === 'applications') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#111111]">Recent Applications</h3>
                <Link to="/applications" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl h-40 border border-[#E5E5E5] animate-pulse" />
              ) : applications.length > 0 ? (
                <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
                  <table className="w-full text-left text-xs text-[#111111]">
                    <thead className="bg-[#FAFAF9] border-b border-[#E5E5E5] text-[11px] font-bold text-[#666666] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Company & Position</th>
                        <th className="py-3 px-4">Applied Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-[#FAFAF9] transition-colors">
                          <td className="py-3.5 px-4 font-semibold">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-md bg-[#FAFAF9] border border-[#E5E5E5] flex items-center justify-center font-bold text-xs">
                                {app.job?.company?.name?.[0] || 'C'}
                              </div>
                              <div>
                                <span className="block font-bold text-[#111111]">{app.job?.title}</span>
                                <span className="block text-[11px] text-[#666666] font-normal">{app.job?.company?.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[#666666]">
                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={app.status || 'Applied'} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link to={`/jobs/${app.job?.slug}`} className="font-semibold text-[#2563EB] hover:underline">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="You haven't applied to any jobs yet."
                  description="Explore verified opportunities from top hiring companies."
                  actionLabel="Explore Opportunities"
                  actionLink="/jobs"
                />
              )}
            </div>
          )}

          {/* Tab 2: Saved Jobs */}
          {(activeTab === 'dashboard' || activeTab === 'saved') && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#111111]">Saved Jobs</h3>
                <Link to="/saved" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                  View saved ({savedJobs.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {savedJobs.length > 0 ? (
                <div className="space-y-3">
                  {savedJobs.slice(0, 3).map((job) => (
                    <JobCard key={job.id} job={job} />
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
          )}

          {/* Tab 3: Recommended Jobs */}
          {(activeTab === 'dashboard' || activeTab === 'recommended') && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#111111]">Recommended Jobs</h3>
                <span className="text-xs text-[#666666]">Based on your resume skills and experience</span>
              </div>

              <div className="space-y-3">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
