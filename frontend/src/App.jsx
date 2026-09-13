import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { JobDiscoveryPage } from './pages/JobDiscoveryPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { CompanyDirectoryPage } from './pages/CompanyDirectoryPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { SavedJobsPage } from './pages/SavedJobsPage';
import { ApplicationTrackerPage } from './pages/ApplicationTrackerPage';
import { ResumeManagerPage } from './pages/ResumeManagerPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';

import { AdminDashboard } from './pages/AdminDashboard';
import { AdminJobFormPage } from './pages/AdminJobFormPage';
import { AdminCompaniesPage } from './pages/AdminCompaniesPage';
import { AdminApplicationsPage } from './pages/AdminApplicationsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#111111] font-sans selection:bg-[#2563EB] selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/jobs" element={<JobDiscoveryPage />} />
              <Route path="/jobs/:slug" element={<JobDetailPage />} />
              <Route path="/companies" element={<CompanyDirectoryPage />} />

              {/* Student Candidate Routes */}
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/saved" element={<SavedJobsPage />} />
              <Route path="/applications" element={<ApplicationTrackerPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resume" element={<ResumeManagerPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Admin Portal Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/jobs" element={<AdminJobFormPage />} />
              <Route path="/admin/jobs/new" element={<AdminJobFormPage />} />
              <Route path="/admin/jobs/:id/edit" element={<AdminJobFormPage />} />
              <Route path="/admin/companies" element={<AdminCompaniesPage />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
