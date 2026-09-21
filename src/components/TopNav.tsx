import React, { useState } from 'react';
import {
  Menu,
  Search,
  PlusCircle,
  CreditCard,
  ChevronDown,
  Calendar,
  UserCircle2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface TopNavProps {
  onOpenMobileSidebar: () => void;
  onGlobalSearchSelect: (studentId: string) => void;
  onOpenAddStudentModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenMobileSidebar,
  onGlobalSearchSelect,
  onOpenAddStudentModal,
}) => {
  const {
    currentUser,
    users,
    setCurrentUser,
    sessions,
    activeSession,
    activeTerm,
    setActiveSession,
    setActiveTerm,
    students,
    openRecordPayment,
    hasPermission,
    notify,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Global search filtering
  const matchingStudents = searchQuery.trim()
    ? students
        .filter((s) => {
          const q = searchQuery.toLowerCase();
          return (
            s.fullName.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.className.toLowerCase().includes(q) ||
            s.parentName.toLowerCase().includes(q) ||
            s.parentPhone.includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const handleSelectStudent = (id: string) => {
    onGlobalSearchSelect(id);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleSwitchUserRole = (targetRole: UserRole) => {
    const existing = users.find((u) => u.role === targetRole);
    if (existing) {
      setCurrentUser(existing);
      notify(`Switched session to: ${existing.name} (${existing.role})`, 'info');
    }
    setIsRoleDropdownOpen(false);
  };

  return (
    <header
      id="app-top-nav"
      className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs"
    >
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          id="btn-open-mobile-sidebar"
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search student, ID (FLO-2026-...), parent, phone, class..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && matchingStudents.length > 0 && (
            <div
              id="global-search-results"
              className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100"
            >
              <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Matching Students ({matchingStudents.length})
              </div>
              {matchingStudents.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleSelectStudent(st.id)}
                  className="w-full px-4 py-2.5 text-left hover:bg-emerald-50/70 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">
                      {st.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {st.id} • {st.className} • Parent: {st.parentName} ({st.parentPhone})
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    View Dossier
                  </span>
                </button>
              ))}
            </div>
          )}

          {isSearchOpen && searchQuery.trim() && matchingStudents.length === 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center text-xs text-slate-500 z-50">
              No students found matching "{searchQuery}".
            </div>
          )}
        </div>
      </div>

      {/* Right: Session Switcher & Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Academic Session Switcher */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/90 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <select
            id="select-top-session"
            value={activeSession}
            onChange={(e) => setActiveSession(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}
              </option>
            ))}
          </select>
          <span className="text-slate-300">|</span>
          <select
            id="select-top-term"
            value={activeTerm}
            onChange={(e) => setActiveTerm(e.target.value)}
            className="bg-transparent font-medium text-emerald-800 text-xs focus:outline-hidden cursor-pointer"
          >
            <option value="First Term">First Term</option>
            <option value="Second Term">Second Term</option>
            <option value="Third Term">Third Term</option>
          </select>
        </div>

        {/* Quick Record Payment Button */}
        {hasPermission('recordPayment') && (
          <button
            id="btn-top-record-payment"
            onClick={() => openRecordPayment()}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Record</span> Payment
          </button>
        )}

        {/* Quick Add Student Button */}
        {hasPermission('editStudent') && (
          <button
            id="btn-top-add-student"
            onClick={onOpenAddStudentModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>Add Student</span>
          </button>
        )}

        {/* Role Switcher Demo Dropdown */}
        <div className="relative">
          <button
            id="btn-top-role-switch"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            title="Switch User Role for Testing"
          >
            <UserCircle2 className="w-4 h-4 text-emerald-800" />
            <span className="hidden md:inline">{currentUser?.role || 'Switch Role'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div
              id="role-switch-menu"
              className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs"
            >
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Switch Staff Role</span>
                <RefreshCw className="w-3 h-3" />
              </div>
              <button
                onClick={() => handleSwitchUserRole('Super Admin')}
                className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-slate-800 font-semibold flex items-center justify-between"
              >
                <span>Super Admin (Director)</span>
                {currentUser?.role === 'Super Admin' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                )}
              </button>
              <button
                onClick={() => handleSwitchUserRole('Accountant')}
                className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-slate-800 flex items-center justify-between"
              >
                <span>Accountant (Bursar)</span>
                {currentUser?.role === 'Accountant' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                )}
              </button>
              <button
                onClick={() => handleSwitchUserRole('Registrar')}
                className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-slate-800 flex items-center justify-between"
              >
                <span>Registrar</span>
                {currentUser?.role === 'Registrar' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                )}
              </button>
              <button
                onClick={() => handleSwitchUserRole('Teacher')}
                className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-slate-800 flex items-center justify-between"
              >
                <span>Teacher / Class Head</span>
                {currentUser?.role === 'Teacher' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
