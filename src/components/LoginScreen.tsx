import React, { useState } from 'react';
import { School, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { login, users, schoolSettings } = useApp();
  const [email, setEmail] = useState('director@flofamous.edu.ng');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email.trim(), password);
  };

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('admin123');
    login(userEmail, 'admin123');
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
            Secondary & Primary School, Nigeria
          </p>
          <p className="text-xs text-emerald-200/80 max-w-xs mx-auto">
            Spreadsheet-Style Administration & Fee Management System
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-800/40 space-y-5 text-xs">
          <div className="text-center border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display">
              Authorized Staff Portal Login
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your verified staff email and password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@flofamous.edu.ng"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Staff Logins */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
              Quick 1-Click Role Login:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('director@flofamous.edu.ng')}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-900 text-[11px] truncate">Dr. F. Okoye</div>
                <div className="text-[10px] text-purple-700 font-semibold">Super Admin (Director)</div>
              </button>

              <button
                onClick={() => handleQuickLogin('bursar@flofamous.edu.ng')}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-900 text-[11px] truncate">Mrs. C. Eze</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Accountant (Bursar)</div>
              </button>

              <button
                onClick={() => handleQuickLogin('registrar@flofamous.edu.ng')}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-900 text-[11px] truncate">Mr. B. Nwachukwu</div>
                <div className="text-[10px] text-blue-700 font-semibold">Registrar</div>
              </button>

              <button
                onClick={() => handleQuickLogin('teacher.pri4@flofamous.edu.ng')}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-900 text-[11px] truncate">Mrs. O. Okafor</div>
                <div className="text-[10px] text-amber-700 font-semibold">Teacher (Primary 4)</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-emerald-300/70">
          FLO Famous Secondary & Primary School © 2026. Secure Educational ERP.
        </div>
      </div>
    </div>
  );
};
