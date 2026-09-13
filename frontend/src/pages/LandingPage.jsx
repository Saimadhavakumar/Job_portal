import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { JobCard } from '../components/JobCard';

export const LandingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs/');
        if (res.data.success) {
          setJobs(res.data.jobs.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch landing page jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/jobs?${params.toString()}`);
  };

  const handlePopularClick = (term) => {
    navigate(`/jobs?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="space-y-24 py-12">
      
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 pt-8 space-y-6">
        
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#111111] tracking-tight leading-[1.15]">
          Work on what matters to you.
        </h1>

        <p className="text-base sm:text-lg text-[#666666] max-w-2xl mx-auto leading-relaxed">
          Discover verified opportunities from companies looking for people like you.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/jobs"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            Find Jobs <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#D4D4D4] text-[#111111] font-semibold text-sm transition-colors flex items-center justify-center"
          >
            For Employers
          </Link>
        </div>

        {/* Search Bar Interface */}
        <div className="pt-6 max-w-3xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-xl p-2 border border-[#E5E5E5] shadow-xs flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
              <Search className="w-4 h-4 text-[#8A8A8A] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, skills, or companies"
                className="w-full bg-transparent text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none"
              />
            </div>

            <div className="h-6 w-[1px] bg-[#E5E5E5] hidden sm:block" />

            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
              <MapPin className="w-4 h-4 text-[#8A8A8A] shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location (e.g. Remote, Hyderabad)"
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

          {/* Popular searches chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs text-[#666666]">
            <span className="text-[#8A8A8A]">Popular:</span>
            {[
              'Software Engineer',
              'Data Analyst',
              'Frontend Developer',
              'Backend Developer',
              'Product Manager',
              'Remote Jobs',
              'Internships'
            ].map((term) => (
              <button
                key={term}
                onClick={() => handlePopularClick(term)}
                className="px-2.5 py-1 rounded-md bg-white border border-[#E5E5E5] hover:border-[#D4D4D4] hover:text-[#111111] transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* Trust Metrics Section */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-y border-[#E5E5E5]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <span className="block text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">10K+</span>
            <span className="text-xs font-medium text-[#666666]">Active Jobs</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">5K+</span>
            <span className="text-xs font-medium text-[#666666]">Hiring Companies</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">100K+</span>
            <span className="text-xs font-medium text-[#666666]">Professionals</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">95%</span>
            <span className="text-xs font-medium text-[#666666]">Success Rate</span>
          </div>
        </div>

        {/* Trusted Companies */}
        <div className="pt-10 text-center space-y-4">
          <span className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider">
            Trusted by innovative companies
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all text-xs font-bold text-[#111111]">
            <span className="tracking-tighter text-sm">GOOGLE</span>
            <span className="tracking-tight text-sm">MICROSOFT</span>
            <span className="tracking-wider text-sm">STRIPE</span>
            <span className="tracking-widest text-sm">VERCEL</span>
            <span className="tracking-tight text-sm">AMAZON</span>
          </div>
        </div>
      </section>

      {/* Featured Opportunities Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#111111] tracking-tight">Featured Opportunities</h2>
            <p className="text-xs text-[#666666] mt-0.5">Handpicked, admin-verified job listings directly from top employers.</p>
          </div>

          <Link to="/jobs" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
            View all jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-xl h-20 border border-[#E5E5E5] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
