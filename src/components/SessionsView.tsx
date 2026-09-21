import React, { useState } from 'react';
import {
  Calendar,
  PlusCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AcademicTerm } from '../types';

export const SessionsView: React.FC = () => {
  const {
    sessions,
    activeSession,
    activeTerm,
    setActiveSession,
    setActiveTerm,
    createSession,
    hasPermission,
    notify,
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionId, setNewSessionId] = useState('2027/2028');
  const [startDate, setStartDate] = useState('2027-09-15');
  const [endDate, setEndDate] = useState('2028-07-25');

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionId.trim()) {
      notify('Please enter a session year string (e.g. 2027/2028).', 'warning');
      return;
    }

    createSession({
      id: newSessionId.trim(),
      startDate,
      endDate,
    });

    setShowCreateModal(false);
  };

  return (
    <div id="sessions-view-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Academic Sessions & Term Calendar
              </h2>
              <p className="text-xs text-slate-500">
                Switch active school terms, create new sessions, and preserve permanent historical ledgers.
              </p>
            </div>
          </div>
        </div>

        {hasPermission('manageSessions') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Session</span>
          </button>
        )}
      </div>

      {/* Active Session & Term Selector Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-2xl p-6 text-white shadow-md border border-emerald-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-800">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Current Live Operating Context
            </div>
            <div className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
              {activeSession} — {activeTerm}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200 bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-700">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Historical fee records remain permanently locked & safe</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-emerald-200 font-semibold mb-1">
              Switch Active Session:
            </label>
            <select
              value={activeSession}
              onChange={(e) => setActiveSession(e.target.value)}
              className="w-full px-3 py-2.5 bg-emerald-900/90 border border-emerald-700 rounded-xl text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  Academic Session {s.id} {s.isActive ? '(Active Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-emerald-200 font-semibold mb-1">
              Switch Active Term:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['First Term', 'Second Term', 'Third Term'] as AcademicTerm[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTerm(t)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTerm === t
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Sessions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            All Academic Sessions
          </h3>
          <p className="text-xs text-slate-500">
            Sessions record student enrollments, fee structures, and payments independently per term.
          </p>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {sessions.map((s) => {
            const isLive = s.id === activeSession;
            return (
              <div
                key={s.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-display text-slate-900">
                      Session {s.id}
                    </span>
                    {s.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Default Session
                      </span>
                    )}
                    {isLive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Active in Workspace
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Duration: {s.startDate || s.terms?.[0]?.startDate || 'September'} &rarr;{' '}
                    {s.endDate || s.terms?.[2]?.endDate || 'July'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSession(s.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                      isLive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isLive ? 'Currently Active' : 'Switch to This Session'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-display">
              Create New Academic Session
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the academic year format, for example "2027/2028".
            </p>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Session Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={newSessionId}
                  onChange={(e) => setNewSessionId(e.target.value)}
                  placeholder="e.g. 2027/2028"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
