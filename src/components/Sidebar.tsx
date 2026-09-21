import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Table,
  Receipt,
  AlertCircle,
  UserCheck,
  FileBarChart2,
  Calendar,
  ShieldCheck,
  ClipboardList,
  Settings,
  LogOut,
  X,
  School,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActiveNavTab =
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'fees'
  | 'excel-table'
  | 'payments'
  | 'outstanding'
  | 'parents'
  | 'reports'
  | 'sessions'
  | 'users'
  | 'audit-logs'
  | 'settings';

interface SidebarProps {
  currentTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, logout, schoolSettings, activeSession, activeTerm, hasPermission } = useApp();

  const navItems = [
    { id: 'dashboard' as ActiveNavTab, label: 'Dashboard', icon: LayoutDashboard, permitted: true },
    { id: 'excel-table' as ActiveNavTab, label: 'Excel Fee Table', icon: Table, permitted: true, badge: 'Live Excel' },
    { id: 'students' as ActiveNavTab, label: 'Students Directory', icon: GraduationCap, permitted: true },
    { id: 'payments' as ActiveNavTab, label: 'Payments & Receipts', icon: Receipt, permitted: true },
    { id: 'outstanding' as ActiveNavTab, label: 'Outstanding Fees', icon: AlertCircle, permitted: true },
    { id: 'fees' as ActiveNavTab, label: 'Fee Management', icon: CreditCard, permitted: hasPermission('manageFees') },
    { id: 'classes' as ActiveNavTab, label: 'Classes & Sections', icon: School, permitted: true },
    { id: 'parents' as ActiveNavTab, label: 'Parents / Guardians', icon: UserCheck, permitted: true },
    { id: 'reports' as ActiveNavTab, label: 'Financial Reports', icon: FileBarChart2, permitted: hasPermission('viewReports') },
    { id: 'sessions' as ActiveNavTab, label: 'Academic Sessions', icon: Calendar, permitted: hasPermission('manageSessions') || currentUser?.role === 'Super Admin' || currentUser?.role === 'Administrator' },
    { id: 'users' as ActiveNavTab, label: 'Authorized Users', icon: ShieldCheck, permitted: hasPermission('manageUsers') },
    { id: 'audit-logs' as ActiveNavTab, label: 'Audit Trail', icon: ClipboardList, permitted: hasPermission('viewAudit') },
    { id: 'settings' as ActiveNavTab, label: 'School Settings', icon: Settings, permitted: hasPermission('settings') },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="app-main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-emerald-950 text-slate-100 flex flex-col border-r border-emerald-800/60 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* School Crest & Header */}
        <div className="p-4 border-b border-emerald-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-emerald-950 font-extrabold shadow-md border border-amber-300 shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black tracking-wide text-white uppercase truncate font-display">
                FLO FAMOUS SCHOOL
              </h1>
              <p className="text-[11px] text-amber-300 font-medium truncate">
                Secondary & Primary School
              </p>
            </div>
          </div>
          <button
            id="btn-close-mobile-sidebar"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Pill */}
        <div className="px-4 py-3 bg-emerald-900/40 border-b border-emerald-800/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-700 text-amber-300 font-bold flex items-center justify-center text-sm border border-emerald-500/50 shrink-0">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser?.name || 'Authorized Staff'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] font-medium text-emerald-200 uppercase tracking-wider">
                {currentUser?.role || 'Staff'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-emerald-800">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-emerald-400/80 uppercase">
            School Administration
          </div>

          {navItems
            .filter((item) => item.permitted)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-emerald-100/90 hover:bg-emerald-900/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-emerald-300'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-slate-950 text-amber-300'
                          : 'bg-emerald-800 text-amber-300 border border-emerald-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Active Session & Term Indicator */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-emerald-900/60 border border-emerald-800/80 text-[11px]">
          <div className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Active Academic Term</div>
          <div className="text-white font-bold truncate mt-0.5">{activeSession}</div>
          <div className="text-amber-300 text-[11px] font-medium">{activeTerm}</div>
        </div>

        {/* Footer Logout Button */}
        <div className="p-3 border-t border-emerald-800/80">
          <button
            id="btn-sidebar-logout"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-900/40 hover:bg-rose-900/50 hover:text-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out System</span>
          </button>
        </div>
      </aside>
    </>
  );
};
