import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Building2, Plus, Globe, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies/');
      if (res.data.success) {
        setCompanies(res.data.companies);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    setSaving(true);

    try {
      const res = await api.post('/admin/companies/', {
        name,
        website,
        location,
        industry,
        description
      });
      if (res.data.success) {
        setMessage("Company created successfully!");
        setName('');
        setWebsite('');
        setLocation('');
        setIndustry('');
        setDescription('');
        fetchCompanies();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || "Failed to create company.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Hiring Companies Manager</h1>
        <p className="text-xs text-slate-400">Create & manage company profiles referenced by curated job listings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Create Company Form */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Plus className="w-4 h-4 text-purple-400" /> Create Company
          </h3>

          {errorMsg && <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs">{errorMsg}</div>}
          {message && <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs">{message}</div>}

          <form onSubmit={handleCreateCompany} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Innovations"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.example.com"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bangalore, India"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="SaaS / Enterprise"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl gradient-bg text-white font-bold text-xs shadow-lg shadow-purple-500/20"
            >
              {saving ? "Creating..." : "Save Company"}
            </button>
          </form>
        </div>

        {/* Existing Companies List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white">Registered Companies ({companies.length})</h3>
          
          {loading ? (
            <div className="space-y-3">{[1, 2].map(n => <div key={n} className="glass-card rounded-2xl h-24 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {companies.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                      {c.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{c.name}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{c.location || 'Remote'}</span>
                        <span>•</span>
                        <span>{c.industry || 'Tech'}</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-semibold">{c.jobs_count} Jobs Posted</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
