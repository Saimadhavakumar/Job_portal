import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/');
        if (res.data.success) {
          const p = res.data.data.profile;
          setHeadline(p.headline || '');
          setBio(p.bio || '');
          setPhone(p.phone || '');
          setLocation(p.location || '');
          setGithubUrl(p.github_url || '');
          setLinkedinUrl(p.linkedin_url || '');
          setPortfolioUrl(p.portfolio_url || '');
        }
      } catch (err) {
        console.error("Failed to fetch candidate profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    setSaving(true);

    try {
      const res = await api.put('/profile/', {
        headline,
        bio,
        phone,
        location,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl
      });
      if (res.data.success) {
        setMessage("Profile updated successfully!");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl h-96 border border-[#E5E5E5] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="space-y-1 border-b border-[#E5E5E5] pb-4">
        <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Candidate Profile</h1>
        <p className="text-sm text-[#666666]">Manage your candidate details, portfolio links, and preferences.</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {message && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E5] space-y-6">
        
        {/* User Identity Info */}
        <div className="flex items-center gap-4 border-b border-[#E5E5E5] pb-6">
          <div className="w-14 h-14 rounded-xl bg-[#2563EB] text-white font-bold text-xl flex items-center justify-center shadow-xs">
            {user?.first_name?.[0] || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111111]">{user?.full_name || 'Candidate Name'}</h3>
            <p className="text-xs text-[#666666] flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-[#8A8A8A]" /> {user?.email}
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] text-[10px] font-semibold border border-emerald-200">VERIFIED</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#111111] mb-1">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Computer Science Graduate & Full Stack Engineer"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0192"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">GitHub URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#111111] mb-1">Portfolio / Personal Website</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://alexdev.com"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#111111] mb-1">Bio / Summary</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your technical experience, career background, and projects..."
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

      </form>

    </div>
  );
};
