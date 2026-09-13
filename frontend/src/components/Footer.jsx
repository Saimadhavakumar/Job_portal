import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#E5E5E5] text-[#666666] text-xs mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-block font-extrabold text-lg text-[#111111] tracking-tight">
              JobSphere<span className="text-[#2563EB]">.</span>
            </Link>
            <p className="text-xs text-[#666666] max-w-sm leading-relaxed">
              A modern, verified job platform designed for students, freshers, and experienced professionals. Zero spam, zero unreliable listings.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-semibold text-[#111111] uppercase tracking-wider text-[11px] mb-3">Job Seekers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jobs" className="hover:text-[#111111] transition-colors">Find Jobs</Link></li>
              <li><Link to="/companies" className="hover:text-[#111111] transition-colors">Explore Companies</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#111111] transition-colors">AI Match Score</Link></li>
              <li><Link to="/applications" className="hover:text-[#111111] transition-colors">Application Tracker</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-semibold text-[#111111] uppercase tracking-wider text-[11px] mb-3">Employers</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#111111] cursor-pointer transition-colors">Post a Job</span></li>
              <li><span className="hover:text-[#111111] cursor-pointer transition-colors">Verification Process</span></li>
              <li><span className="hover:text-[#111111] cursor-pointer transition-colors">Hiring Solutions</span></li>
              <li><span className="hover:text-[#111111] cursor-pointer transition-colors">Employer Dashboard</span></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="font-semibold text-[#111111] uppercase tracking-wider text-[11px] mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#111111] cursor-pointer transition-colors">About Us</span></li>
              <li><span className="hover:text-[#111111] cursor-pointer transition-colors">Verification Philosophy</span></li>
              <li><span className="hover:text-[#111111] cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-[#111111] cursor-pointer transition-colors">Terms of Service</span></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8A8A8A]">
          <span>&copy; {new Date().getFullYear()} JobSphere Inc. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#666666] cursor-pointer">Privacy</span>
            <span className="hover:text-[#666666] cursor-pointer">Terms</span>
            <span className="hover:text-[#666666] cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
