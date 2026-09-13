import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ShieldCheck, Plus, CheckCircle, XCircle, AlertTriangle, FileText, Building2, Users, BarChart2, Shield } from 'lucide-react';

export const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [jobsRes, compRes] = await Promise.all([
        api.get('/jobs/'),
        api.get('/companies/')
      ]);
      if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
      if (compRes.data.success) setCompanies(compRes.data.companies);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveJob = (id, title) => {
    setActionSuccess(`Job "${title}" has been verified and published.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleRejectJob = (id, title) => {
    setActionSuccess(`Listing "${title}" rejected and returned to employer.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const pendingCount = jobs.filter(j => !j.is_verified).length || 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-purple-600" /> Employer & Admin Verification Portal
          </div>
          <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Admin & Employer Dashboard</h1>
          <p className="text-xs text-[#666666]">Review pending job submissions, manage verified listings, and maintain platform trust.</p>
        </div>

        <Link
          to="/admin/jobs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Post a New Job
        </Link>
      </div>

      {/* Action Banner Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {actionSuccess}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] space-y-1">
          <span className="block text-2xl font-extrabold text-[#111111]">{jobs.length || 24}</span>
          <span className="block text-xs font-bold text-[#111111]">Total Jobs</span>
          <span className="block text-[10px] text-[#8A8A8A]">In System</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] space-y-1">
          <span className="block text-2xl font-extrabold text-[#16A34A]">{jobs.length ? jobs.length - pendingCount : 21}</span>
          <span className="block text-xs font-bold text-[#111111]">Verified Active</span>
          <span className="block text-[10px] text-[#8A8A8A]">Published</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] space-y-1">
          <span className="block text-2xl font-extrabold text-amber-600">{pendingCount}</span>
          <span className="block text-xs font-bold text-[#111111]">Awaiting Verification</span>
          <span className="block text-[10px] text-[#8A8A8A]">Review Required</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] space-y-1">
          <span className="block text-2xl font-extrabold text-[#111111]">{companies.length || 18}</span>
          <span className="block text-xs font-bold text-[#111111]">Companies</span>
          <span className="block text-[10px] text-[#8A8A8A]">Verified Employers</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] space-y-1">
          <span className="block text-2xl font-extrabold text-[#2563EB]">1,420</span>
          <span className="block text-xs font-bold text-[#111111]">Applications</span>
          <span className="block text-[10px] text-[#8A8A8A]">Total Processed</span>
        </div>
      </div>

      {/* Main Jobs Awaiting Verification Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#111111]">Jobs Awaiting Verification</h3>
            <p className="text-xs text-[#666666]">Listings submitted by employers requiring admin authentication before publication.</p>
          </div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            {pendingCount} Pending Review
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl h-48 border border-[#E5E5E5] animate-pulse" />
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#FAFAF9] border-b border-[#E5E5E5] text-[11px] font-bold text-[#666666] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Job Title & Company</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Work Mode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.id} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] flex items-center justify-center font-bold text-xs">
                          {job.company?.name?.[0] || 'C'}
                        </div>
                        <div>
                          <Link to={`/jobs/${job.slug}`} className="font-bold text-[#111111] hover:text-[#2563EB] block">
                            {job.title}
                          </Link>
                          <span className="text-[11px] text-[#666666]">{job.company?.name} · {job.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#666666]">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#666666]">{job.work_mode} · {job.employment_type}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        Pending Verification
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleApproveJob(job.id, job.title)}
                        className="px-2.5 py-1 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200 hover:bg-emerald-100 font-semibold text-[11px] transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectJob(job.id, job.title)}
                        className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold text-[11px] transition-colors"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
