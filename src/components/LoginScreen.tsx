import React, { useState } from 'react';
import {
  School,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const LoginScreen: React.FC = () => {
  const { login, signup, users, notify } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In form fields
  const [signInEmail, setSignInEmail] = useState('flofamous.edu.ng');
  const [signInPassword, setSignInPassword] = useState('Flo1234');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up form fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('Accountant');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      notify('Please enter your staff email.', 'warning');
      return;
    }
    login(signInEmail.trim(), signInPassword);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpName.trim()) {
      notify('Please enter your full name.', 'warning');
      return;
    }
    if (!signUpEmail.trim()) {
      notify('Please enter your email address.', 'warning');
      return;
    }
    if (!signUpPassword) {
      notify('Please create a password.', 'warning');
      return;
    }
    if (signUpPassword.length < 5) {
      notify('Password must be at least 5 characters.', 'warning');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      notify('Passwords do not match. Please verify both fields.', 'error');
      return;
    }

    const success = signup({
      name: signUpName.trim(),
      email: signUpEmail.trim().toLowerCase(),
      password: signUpPassword,
      role: signUpRole,
    });

    if (success) {
      // User is logged in automatically by AppContext
    }
  };

  const handleQuickLogin = (email: string, password = 'Flo1234') => {
    setSignInEmail(email);
    setSignInPassword(password);
    login(email, password);
  };

  return (
    <div
      id="login-screen-container"
      className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* School Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 shadow-xl border-2 border-amber-300">
            <School className="w-9 h-9" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-display">
            FLO FAMOUS SCHOOL
          </h1>
          <p className="text-xs text-amber-300 font-medium">
            Secondary & Primary School, Enugu, Nigeria
          </p>
          <p className="text-xs text-emerald-200/80 max-w-xs mx-auto">
            Spreadsheet-Style Administration & Live Fee Management System
          </p>
        </div>

        {/* Auth Box with Sign In / Sign Up Mode Switcher */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-800/40 space-y-5 text-xs">
          {/* Mode Switch Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              id="tab-btn-signin"
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security Lock & Sign In</span>
            </button>
            <button
              id="tab-btn-signup"
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Register Staff</span>
            </button>
          </div>

          {/* Mode 1: SIGN IN FORM */}
          {mode === 'signin' && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold mb-1.5">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Administrative Security Lock Active</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                  Unlock School Dashboard
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your administrative credentials to unlock and access the system
                </p>
              </div>

              {/* Master Credentials Notice */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Admin Credentials on Page Refresh:</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-emerald-800">
                  <span>Email: <strong className="font-mono text-emerald-950">flofamous.edu.ng</strong></span>
                  <span>Password: <strong className="font-mono text-emerald-950">Flo1234</strong></span>
                </div>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Staff Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-signin-email"
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="flofamous.edu.ng"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Password
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                      Pass: Flo1234
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-signin-password"
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Flo1234"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showSignInPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Unlock Dashboard & Enter System</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick 1-Click Role Logins */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                  Quick 1-Click Unlock Profiles:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('flofamous.edu.ng', 'Flo1234')}
                    className="p-2.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-all cursor-pointer shadow-xs"
                  >
                    <div className="font-black text-emerald-950 text-xs truncate">Admin</div>
                    <div className="text-[10px] text-emerald-700 font-bold">Admin (Primary)</div>
                    <div className="text-[9px] font-mono text-slate-500 truncate mt-0.5">flofamous.edu.ng</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('accounts@flofamous.edu.ng', 'Flo1234')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 text-xs truncate">Accounts</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">Fee & Accounts</div>
                    <div className="text-[9px] font-mono text-slate-500 truncate mt-0.5">accounts@flofamous...</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('cashier@flofamous.edu.ng', 'Flo1234')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 text-xs truncate">Cashier</div>
                    <div className="text-[10px] text-blue-700 font-semibold">Receipts & Cashier</div>
                    <div className="text-[9px] font-mono text-slate-500 truncate mt-0.5">cashier@flofamous...</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('teacher@flofamous.edu.ng', 'Flo1234')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 text-xs truncate">Teacher</div>
                    <div className="text-[10px] text-amber-700 font-semibold">Class Oversight</div>
                    <div className="text-[9px] font-mono text-slate-500 truncate mt-0.5">teacher@flofamous...</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: SIGN UP / REGISTER FORM */}
          {mode === 'signup' && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                  Staff Account Registration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your staff title, email, and password to access your dashboard
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Invited via email?</strong> Use your invited email address to automatically link and activate your staff access.
                </span>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-3">
                {/* Staff Title */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Staff Title *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-signup-name"
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Admin, Accounts, Cashier or Teacher"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Staff Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-signup-email"
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="e.g. accounts@flofamous.edu.ng"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Staff Role */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Role / Title *
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      id="select-signup-role"
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Choose Password * (Min 5 chars)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-signup-password"
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      minLength={5}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-signup-confirm-password"
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-signup-submit"
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Account & Enter Dashboard</span>
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-slate-600 hover:text-emerald-700 font-semibold"
                >
                  Already have an account? <strong className="text-emerald-700 underline">Sign In</strong>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-[11px] text-emerald-300/70">
          FLO Famous Secondary & Primary School © 2026. Secure Educational ERP.
        </div>
      </div>
    </div>
  );
};
