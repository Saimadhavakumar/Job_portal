import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { JobCard } from '../components/JobCard';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Globe, MapPin, Building2, Users, Check, Sparkles, Heart, ShieldCheck } from 'lucide-react';

export const CompanyDirectoryPage = () => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, jobsRes] = await Promise.all([
          api.get('/companies/'),
          api.get('/jobs/')
        ]);

        if (compRes.data.success && compRes.data.companies.length > 0) {
          setCompanies(compRes.data.companies);
          setSelectedCompany(compRes.data.companies[0]);
        }
        if (jobsRes.data.success) {
          setJobs(jobsRes.data.jobs);
        }
      } catch (err) {
        console.error("Company fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const companyJobs = selectedCompany
    ? jobs.filter(j => j.company?.id === selectedCompany.id || j.company?.name === selectedCompany.name)
    : jobs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Verified Company Directory</h1>
        <p className="text-sm text-[#666666]">Explore verified employers hiring candidates across engineering, product, and business.</p>
      </div>

      {/* Main Grid: Company Selector + Detail Profile View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Company List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider px-1">Verified Employers</h3>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-xl h-16 border border-[#E5E5E5] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {companies.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCompany(c)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    selectedCompany?.id === c.id
                      ? "bg-white border-[#2563EB] shadow-xs"
                      : "bg-white border-[#E5E5E5] hover:border-[#D4D4D4]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] flex items-center justify-center font-bold text-[#111111]">
                      {c.name?.[0] || 'C'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111111]">{c.name}</h4>
                      <span className="text-[11px] text-[#666666]">{c.industry || 'Technology'} · {c.location || 'Global'}</span>
                    </div>
                  </div>
                  <VerifiedBadge size="small" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Selected Company Detail Profile */}
        <div className="lg:col-span-8 space-y-6">
          {selectedCompany && (
            <>
              {/* Profile Header */}
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E5] space-y-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-bold text-2xl shrink-0">
                      {selectedCompany.name?.[0] || 'C'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">{selectedCompany.name}</h2>
                        <VerifiedBadge size="small" />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] pt-0.5">
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-[#8A8A8A]" /> {selectedCompany.industry || 'Technology'}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#8A8A8A]" /> {selectedCompany.location || 'Global'}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#8A8A8A]" /> {selectedCompany.size || '100-500 Employees'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedCompany.website && (
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-[#FAFAF9] hover:bg-[#E5E5E5] border border-[#E5E5E5] text-[#111111] font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#666666]" /> Visit Website
                    </a>
                  )}
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-[#E5E5E5] text-xs font-semibold space-x-6 pt-2">
                  {[
                    { id: 'about', label: 'About' },
                    { id: 'positions', label: `Open Positions (${companyJobs.length})` },
                    { id: 'info', label: 'Company Info' },
                    { id: 'culture', label: 'Culture & Values' },
                    { id: 'benefits', label: 'Benefits' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 transition-colors border-b-2 ${
                        activeTab === tab.id
                          ? 'border-[#2563EB] text-[#2563EB]'
                          : 'border-transparent text-[#666666] hover:text-[#111111]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content 1: About */}
              {activeTab === 'about' && (
                <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E5] space-y-4">
                  <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">About {selectedCompany.name}</h3>
                  <p className="text-xs text-[#444444] leading-relaxed">
                    {selectedCompany.description || `${selectedCompany.name} is a verified hiring partner on JobSphere. They build technology solutions and actively recruit top candidates across software development, product design, analytics, and operations.`}
                  </p>
                </div>
              )}

              {/* Tab Content 2: Open Positions */}
              {activeTab === 'positions' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#111111]">Active Verified Listings at {selectedCompany.name}</h3>
                  {companyJobs.length > 0 ? (
                    companyJobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))
                  ) : (
                    <div className="bg-white rounded-xl p-8 border border-[#E5E5E5] text-center text-xs text-[#666666]">
                      No active listings posted right now for this company. Check back soon.
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 3: Company Info */}
              {activeTab === 'info' && (
                <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] space-y-4 text-xs text-[#666666]">
                  <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">Company Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[#8A8A8A] font-medium">Headquarters</span>
                      <span className="block font-semibold text-[#111111] mt-0.5">{selectedCompany.location || 'San Francisco, CA'}</span>
                    </div>
                    <div>
                      <span className="block text-[#8A8A8A] font-medium">Industry Sector</span>
                      <span className="block font-semibold text-[#111111] mt-0.5">{selectedCompany.industry || 'Software & Internet'}</span>
                    </div>
                    <div>
                      <span className="block text-[#8A8A8A] font-medium">Verification Standard</span>
                      <span className="block font-semibold text-[#16A34A] mt-0.5">✓ Admin Authenticated Employer</span>
                    </div>
                    <div>
                      <span className="block text-[#8A8A8A] font-medium">Primary Website</span>
                      <span className="block font-semibold text-[#2563EB] mt-0.5 truncate">{selectedCompany.website || 'https://company.com'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 4: Culture & Values */}
              {activeTab === 'culture' && (
                <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] space-y-4">
                  <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">Culture & Values</h3>
                  <ul className="space-y-2 text-xs text-[#444444]">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A34A]" /> Focus on career mentorship and continuous learning</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A34A]" /> Transparent evaluation & merit-based progression</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A34A]" /> Inclusive, collaborative, and innovation-driven environment</li>
                  </ul>
                </div>
              )}

              {/* Tab Content 5: Benefits */}
              {activeTab === 'benefits' && (
                <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] space-y-4">
                  <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">Perks & Benefits</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs text-[#444444]">
                    <div className="p-3 bg-[#FAFAF9] rounded-lg border border-[#E5E5E5] font-medium">Health & Dental Insurance</div>
                    <div className="p-3 bg-[#FAFAF9] rounded-lg border border-[#E5E5E5] font-medium">Flexible Work & Remote Options</div>
                    <div className="p-3 bg-[#FAFAF9] rounded-lg border border-[#E5E5E5] font-medium">Learning & Stipend Allowance</div>
                    <div className="p-3 bg-[#FAFAF9] rounded-lg border border-[#E5E5E5] font-medium">Paid Time Off & Holidays</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
};
