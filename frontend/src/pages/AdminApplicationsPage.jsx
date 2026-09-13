import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { FileText, User, Building2, ExternalLink, Edit3, CheckCircle2, X } from 'lucide-react';

export const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('SCREENING');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admin/applications/');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error("Failed to fetch admin applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setUpdating(true);

    try {
      const res = await api.post(`/admin/applications/${selectedApp.id}/status/`, {
        status: newStatus,
        note
      });
      if (res.data.success) {
        setSelectedApp(null);
        setNote('');
        fetchApplications();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Applicant Management</h1>
        <p className="text-xs text-slate-400">Review candidate submissions, inspect exact resume version snapshots, and update lifecycle stage status.</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(n => <div key={n} className="glass-card rounded-2xl h-28 animate-pulse" />)}</div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                    {app.user?.first_name?.[0] || 'A'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{app.user?.first_name} {app.user?.last_name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{app.user?.email}</span>
                      <span>•</span>
                      <span className="text-indigo-300 font-semibold">{app.job?.title} at {app.job?.company?.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {app.status}
                  </span>

                  {app.resume_version?.file_url && (
                    <a
                      href={app.resume_version.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1"
                    >
                      Resume v{app.resume_version.version_number} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setNewStatus(app.status);
                    }}
                    className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
                    title="Change Status"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-500 text-xs">No candidate applications submitted yet.</div>
      )}

      {/* Change Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Update Status for {selectedApp.user?.first_name}</h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Stage Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                >
                  <option value="APPLIED">APPLIED</option>
                  <option value="SCREENING">SCREENING</option>
                  <option value="ASSESSMENT">ASSESSMENT</option>
                  <option value="INTERVIEW">INTERVIEW</option>
                  <option value="OFFER">OFFER</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Note (Visible in timeline history)</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Scheduled for technical assessment..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedApp(null)} className="px-4 py-2 text-xs text-slate-400">
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="px-5 py-2 rounded-xl gradient-bg text-white text-xs font-bold">
                  {updating ? "Saving..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
