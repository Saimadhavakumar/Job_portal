import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, Shield, Sparkles, Bookmark, FileText } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) =>
    `text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-[#2563EB] font-semibold'
        : 'text-[#666666] hover:text-[#111111]'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <span className="font-extrabold text-xl text-[#111111] tracking-tight">
              JobSphere<span className="text-[#2563EB]">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/jobs" className={navLinkStyle('/jobs')}>
              Jobs
            </Link>
            <Link to="/companies" className={navLinkStyle('/companies')}>
              Companies
            </Link>
            <span className="text-sm font-medium text-[#666666] hover:text-[#111111] cursor-pointer">
              Resources
            </span>
            <span className="text-sm font-medium text-[#666666] hover:text-[#111111] cursor-pointer">
              Career Tips
            </span>
            <span className="text-sm font-medium text-[#666666] hover:text-[#111111] cursor-pointer">
              About
            </span>

            {isStudent && (
              <>
                <Link to="/dashboard" className={navLinkStyle('/dashboard')}>
                  AI Matches
                </Link>
                <Link to="/applications" className={navLinkStyle('/applications')}>
                  Applications
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-md border border-purple-200 flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" /> Admin Portal
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/profile"}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] text-[#111111] hover:border-[#D4D4D4] transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
                    {user.first_name?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate">{user.first_name || 'Account'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-[#FAFAF9] text-[#666666] hover:text-[#111111] border border-[#E5E5E5] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#111111] hover:text-[#2563EB] px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#111111] hover:bg-[#FAFAF9] border border-[#E5E5E5]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5E5E5] space-y-3">
            <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-[#111111] py-1">
              Jobs
            </Link>
            <Link to="/companies" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-[#111111] py-1">
              Companies
            </Link>
            <span className="block text-sm font-medium text-[#666666] py-1">
              Resources
            </span>
            <span className="block text-sm font-medium text-[#666666] py-1">
              Career Tips
            </span>
            <span className="block text-sm font-medium text-[#666666] py-1">
              About
            </span>

            {isStudent && (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-[#2563EB] py-1">
                  AI Matches
                </Link>
                <Link to="/applications" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-[#111111] py-1">
                  Applications
                </Link>
              </>
            )}

            {isAdmin && (
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold text-purple-700 bg-purple-50 p-2 rounded-md">
                Admin Portal
              </Link>
            )}
          </div>
        )}

      </div>
    </nav>
  );
};
