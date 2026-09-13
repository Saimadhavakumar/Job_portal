import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { JobCard } from '../components/JobCard';
import { Search, Filter, X, RefreshCw } from 'lucide-react';

export const JobDiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [workMode, setWorkMode] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (workMode) params.append('work_mode', workMode);
      if (employmentType) params.append('employment_type', employmentType);
      if (experienceLevel) params.append('experience_level', experienceLevel);

      const res = await api.get(`/jobs/?${params.toString()}`);
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workMode, employmentType, experienceLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setWorkMode('');
    setEmploymentType('');
    setExperienceLevel('');
    setSearchParams({});
    setTimeout(fetchJobs, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Find your next opportunity.</h1>
        <p className="text-sm text-[#666666]">Explore verified opportunities from companies actively hiring.</p>
      </div>

      {/* Search Bar Top */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-xl p-2 border border-[#E5E5E5] shadow-xs flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
          <Search className="w-4 h-4 text-[#8A8A8A] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job title, skills, or companies..."
            className="w-full bg-transparent text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none"
          />
        </div>

        <div className="h-6 w-[1px] bg-[#E5E5E5] hidden sm:block" />

        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, state, or Remote"
            className="w-full bg-transparent text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] space-y-6 sticky top-20">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#2563EB]" /> Filters
              </h3>
              {(workMode || employmentType || experienceLevel || search || location) && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-medium text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Work Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#111111] uppercase tracking-wider text-[11px]">Work Mode</label>
              <div className="space-y-1.5 text-xs">
                {[
                  { key: '', label: 'All Modes' },
                  { key: 'REMOTE', label: 'Remote' },
                  { key: 'HYBRID', label: 'Hybrid' },
                  { key: 'ONSITE', label: 'Onsite' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setWorkMode(item.key)}
                    className={`w-full text-left px-3 py-1.5 rounded-md transition-colors ${
                      workMode === item.key
                        ? "bg-[#2563EB] text-white font-semibold"
                        : "text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#111111] uppercase tracking-wider text-[11px]">Job Type</label>
              <div className="space-y-1.5 text-xs">
                {[
                  { key: '', label: 'All Types' },
                  { key: 'FULL_TIME', label: 'Full-time' },
                  { key: 'INTERNSHIP', label: 'Internship' },
                  { key: 'PART_TIME', label: 'Part-time' },
                  { key: 'CONTRACT', label: 'Contract' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setEmploymentType(item.key)}
                    className={`w-full text-left px-3 py-1.5 rounded-md transition-colors ${
                      employmentType === item.key
                        ? "bg-[#2563EB] text-white font-semibold"
                        : "text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#111111] uppercase tracking-wider text-[11px]">Experience Level</label>
              <div className="space-y-1.5 text-xs">
                {[
                  { key: '', label: 'All Levels' },
                  { key: 'ENTRY', label: 'Entry Level / Fresher' },
                  { key: 'MID', label: 'Mid Level' },
                  { key: 'SENIOR', label: 'Senior Level' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setExperienceLevel(item.key)}
                    className={`w-full text-left px-3 py-1.5 rounded-md transition-colors ${
                      experienceLevel === item.key
                        ? "bg-[#2563EB] text-white font-semibold"
                        : "text-[#666666] hover:bg-[#FAFAF9] hover:text-[#111111]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Top Sort & Count Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] text-xs text-[#666666]">
            <span>Showing <strong className="text-[#111111] font-bold">{jobs.length}</strong> verified opportunities</span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#E5E5E5] rounded-md px-2 py-1 text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="latest">Latest</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>
          </div>

          {/* Job Rows */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white rounded-xl h-20 border border-[#E5E5E5] animate-pulse" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center space-y-3 border border-[#E5E5E5]">
              <h3 className="text-base font-bold text-[#111111]">No jobs found matching your criteria</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto">
                Try clearing your search terms or selecting different filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#FAFAF9] text-[#111111] hover:bg-[#E5E5E5] border border-[#E5E5E5] rounded-lg text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
