import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [tab, setTab] = useState(initialTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // UI Flow states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (res.error?.email_verified === false) {
          setShowOtpModal(true);
          setErrorMsg("Your email is unverified. Please enter the verification code sent to your email.");
        } else {
          setErrorMsg(res.error?.message || "Invalid credentials.");
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || err.response?.data?.detail || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const res = await signup(email, password, firstName, lastName);
      if (res.success) {
        if (res.demo_code) setDemoCode(res.demo_code);
        setShowOtpModal(true);
      } else {
        setErrorMsg("Signup failed. Please check input fields.");
      }
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.error?.message || "Registration failed.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await verifyEmail(email, otpCode);
      if (res.success) {
        setShowOtpModal(false);
        if (res.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(res.error?.message || "Invalid verification code.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    alert("Google Sign-In integration point. Connecting OAuth provider...");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-[#E5E5E5] shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Column: Editorial Brand Headline */}
        <div className="p-8 sm:p-12 bg-[#FAFAF9] border-b md:border-b-0 md:border-r border-[#E5E5E5] flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <Link to="/" className="inline-block font-extrabold text-2xl text-[#111111] tracking-tight">
              JobSphere<span className="text-[#2563EB]">.</span>
            </Link>

            <div className="space-y-4 pt-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight leading-tight">
                Your next opportunity is closer than you think.
              </h1>
              <p className="text-sm text-[#666666] leading-relaxed">
                Connect with hiring teams offering verified internships, entry-level, and senior positions with zero recruitment noise.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-[#111111] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> 100% Admin-Verified Opportunities
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#111111] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Transparent Real-Time Application Tracking
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#111111] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Direct Recruiter & Hiring Manager Connections
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E5E5E5] text-xs text-[#8A8A8A]">
            Trusted by over 100K+ professionals and 5K+ companies.
          </div>
        </div>

        {/* Right Column: Split-screen Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#111111] tracking-tight">
              {tab === 'login' ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-xs text-[#666666]">
              {tab === 'login' ? "Welcome back. Enter your credentials below." : "Start exploring verified opportunities today."}
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Social Auth Option */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-2.5 px-4 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#D4D4D4] text-[#111111] text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.0 10.05.0 12s.47 3.8 1.29 5.42l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24.0 12 .0 7.31.0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[11px] text-[#8A8A8A]">
            <div className="flex-1 h-[1px] bg-[#E5E5E5]" />
            <span>or sign in with email</span>
            <div className="flex-1 h-[1px] bg-[#E5E5E5]" />
          </div>

          {/* Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] text-xs placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#111111]">Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-medium text-[#2563EB] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] text-xs placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-0"
                />
                <label htmlFor="remember" className="text-xs text-[#666666]">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] text-xs placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Morgan"
                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] text-xs placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] text-xs placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] text-xs placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] text-xs placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#2563EB] focus:ring-0"
                />
                <label htmlFor="terms" className="text-[11px] text-[#666666] leading-tight">
                  I agree to the <span className="text-[#111111] underline cursor-pointer">Terms of Service</span> and <span className="text-[#111111] underline cursor-pointer">Privacy Policy</span>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Toggle bottom link */}
          <div className="pt-2 text-center text-xs text-[#666666]">
            {tab === 'login' ? (
              <span>Don't have an account? <button onClick={() => { setTab('signup'); setErrorMsg(''); }} className="font-semibold text-[#2563EB] hover:underline">Sign up</button></span>
            ) : (
              <span>Already have an account? <button onClick={() => { setTab('login'); setErrorMsg(''); }} className="font-semibold text-[#2563EB] hover:underline">Sign in</button></span>
            )}
          </div>

        </div>

      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl p-6 border border-[#E5E5E5] shadow-xl space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] mx-auto flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">Verify Email Code</h3>
              <p className="text-xs text-[#666666]">
                Enter the 6-digit code sent to <span className="text-[#111111] font-semibold">{email}</span>
              </p>
            </div>

            {demoCode && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] text-xs text-center font-mono">
                🔑 Test OTP: <span className="font-bold text-[#111111] text-sm">{demoCode}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full tracking-widest text-center text-lg font-mono py-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full text-center text-xs text-[#8A8A8A] hover:text-[#111111]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
