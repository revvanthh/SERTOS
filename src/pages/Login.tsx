import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Radio,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { ENV_CONFIG } from '../config/env';
import { useSertos } from '../context/SertosContext';
import { authService } from '../services/auth/authService';
import { BengaluruPoliceEmblem, SertosLogo } from '../components/common/BrandLogos';

export const Login: React.FC = () => {
  const { isAuthenticated, login, appMode, logoutNotice, clearLogoutNotice } = useSertos();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(() => authService.getRememberedIdentifier());
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(authService.getRememberedIdentifier()));
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    clearLogoutNotice();
    if (!identifier.trim()) {
      setError('Please enter your Officer ID or official BTP email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login({ identifier, password, rememberMe });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setIdentifier(ENV_CONFIG.demoCredentials.officerId);
    setPassword(ENV_CONFIG.demoCredentials.passcode);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#020B18] text-[#F1F5F9] flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl rounded-2xl bg-[#061326] border border-[#1D3552] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Branding & Emergency Network Visual */}
          <div className="lg:col-span-6 relative p-7 sm:p-10 bg-gradient-to-br from-[#081A33] via-[#061326] to-[#020B18] border-b lg:border-b-0 lg:border-r border-[#1D3552] flex flex-col justify-between overflow-hidden">
            {/* Subtle emergency corridor network SVG background */}
            <svg
              viewBox="0 0 400 320"
              className="pointer-events-none absolute inset-0 w-full h-full opacity-20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 260 L110 180 L210 210 L320 95 L385 60"
                stroke="#24A8FF"
                strokeWidth="2.5"
              />
              <path
                d="M40 90 L150 130 L260 115 L360 220"
                stroke="#20E39A"
                strokeWidth="1.8"
                strokeDasharray="5 5"
              />
              <circle cx="110" cy="180" r="5" fill="#20E39A" />
              <circle cx="210" cy="210" r="5" fill="#24A8FF" />
              <circle cx="320" cy="95" r="6" fill="#EF4444" />
            </svg>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <BengaluruPoliceEmblem className="w-12 h-12 shrink-0" />
                <div>
                  <p className="text-sm font-bold tracking-wider text-[#F1F5F9]">
                    BENGALURU TRAFFIC POLICE
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    Emergency Corridor Operations Command
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1D3552]/80">
                <SertosLogo />
              </div>

              <div className="space-y-3 pt-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] leading-snug text-balance">
                  Protecting Bengaluru. Clearing the Way.
                </h1>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Real-time emergency corridor coordination connecting ambulance dispatch, traffic signal operations, hospital receiving teams, and field patrol units across Bengaluru.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-5 border-t border-[#1D3552]/80 flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5 text-[#20E39A] font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Role-Protected Command Portal</span>
              </span>
              <span className="font-mono-tabular">IST (UTC+05:30)</span>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="lg:col-span-6 p-7 sm:p-10 bg-[#0A1729] flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#F1F5F9]">Officer Sign In</h2>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Authenticate to access SERTOS Traffic Control
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                    appMode === 'DEMO'
                      ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/35'
                      : 'bg-[#00D084]/15 text-[#20E39A] border-[#00D084]/35'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>{appMode === 'DEMO' ? 'DEMO MODE' : 'LIVE AUTH'}</span>
                </span>
              </div>

              {logoutNotice && (
                <div
                  className="rounded-xl bg-[#00D084]/12 border border-[#00D084]/35 px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-[#20E39A]"
                  role="status"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{logoutNotice}</span>
                </div>
              )}

              {error && (
                <div
                  className="rounded-xl bg-[#EF4444]/12 border border-[#EF4444]/40 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-[#FCA5A5]"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Demo Mode Credentials Card — displayed ONLY when DEMO MODE is enabled */}
              {appMode === 'DEMO' && (
                <div className="rounded-xl bg-[#0D1D32] border border-[#1D3552] p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#F59E0B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Demo Mode Officer Credentials</span>
                    </span>
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#24A8FF]/15 hover:bg-[#24A8FF]/25 border border-[#24A8FF]/40 text-[11px] font-semibold text-[#38BDF8] transition-colors"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Auto-fill</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-tabular">
                    <div>
                      <span className="text-[#94A3B8] block">Officer ID / Email</span>
                      <span className="text-[#F1F5F9] font-semibold">
                        {ENV_CONFIG.demoCredentials.officerId}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block">Passcode</span>
                      <span className="text-[#F1F5F9] font-semibold">
                        {ENV_CONFIG.demoCredentials.passcode}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Simulated command session only — not connected to live production Django authentication.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label
                    htmlFor="officer-identifier"
                    className="block text-xs font-semibold text-[#CBD5E1] mb-1.5"
                  >
                    Email or Officer ID
                  </label>
                  <input
                    id="officer-identifier"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g., BTP-4021 or inspector.kumar@btp.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061326] border border-[#1D3552] focus:border-[#24A8FF] focus:outline-none text-sm text-[#F1F5F9] placeholder:text-[#64748B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="officer-password"
                    className="block text-xs font-semibold text-[#CBD5E1] mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="officer-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your passcode"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#061326] border border-[#1D3552] focus:border-[#24A8FF] focus:outline-none text-sm text-[#F1F5F9] placeholder:text-[#64748B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#94A3B8] hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 text-[#CBD5E1] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#1D3552] bg-[#061326] text-[#00D084] focus:ring-[#00D084]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-[#24A8FF] hover:text-[#38BDF8] font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00D084] hover:bg-[#20E39A] disabled:opacity-60 text-[#020B18] font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#020B18]/30 border-t-[#020B18] rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In to SERTOS Control</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#94A3B8]">
                <Lock className="w-3.5 h-3.5 text-[#20E39A]" />
                <span>
                  {appMode === 'DEMO'
                    ? 'Demo Session Guard Active · Ready for JWT Backend'
                    : 'Encrypted JWT Session Protected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-[#1D3552]/60 text-center text-xs text-[#64748B]">
        Authorized Personnel Only · Bengaluru Traffic Police Emergency Control
      </footer>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020B18]/80 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-[#0A1729] border border-[#1D3552] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#061326] border-b border-[#1D3552]">
              <h3 className="text-sm font-bold text-[#F1F5F9]">Credential Recovery</h3>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="p-1 rounded text-[#94A3B8] hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-[#CBD5E1] leading-relaxed">
              <p>
                In production, password resets must be verified by the Bengaluru Traffic Police IT Command Desk with your badge number.
              </p>
              {appMode === 'DEMO' && (
                <div className="rounded-lg bg-[#0D1D32] border border-[#1D3552] p-3 text-[#94A3B8]">
                  In <strong className="text-[#F59E0B]">Demo Mode</strong>, use Officer ID{' '}
                  <strong className="text-white font-mono-tabular">
                    {ENV_CONFIG.demoCredentials.officerId}
                  </strong>{' '}
                  and passcode{' '}
                  <strong className="text-white font-mono-tabular">
                    {ENV_CONFIG.demoCredentials.passcode}
                  </strong>
                  .
                </div>
              )}
            </div>
            <div className="px-5 py-3 bg-[#061326] border-t border-[#1D3552] flex justify-end">
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
