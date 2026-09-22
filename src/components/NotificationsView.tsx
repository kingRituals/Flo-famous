import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  Download,
  Calendar,
  UserPlus,
  Columns,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  User,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';
import { AuditLog } from '../types';

export const NotificationsView: React.FC = () => {
  const {
    auditLogs,
    unreadLogsCount,
    markLogAsRead,
    markAllLogsAsRead,
    currentUser,
    users,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Extract unique authors from logs
  const authorsList = useMemo(() => {
    const map = new Map<string, { name: string; email?: string }>();
    auditLogs.forEach((log) => {
      const key = log.userEmail || log.user;
      if (!map.has(key)) {
        map.set(key, { name: log.user, email: log.userEmail });
      }
    });
    return Array.from(map.values());
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          log.action.toLowerCase().includes(q) ||
          log.user.toLowerCase().includes(q) ||
          (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
          log.description.toLowerCase().includes(q) ||
          log.affectedRecord.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Unread only
      if (unreadOnly && log.read) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        if (log.category !== selectedCategory) {
          return false;
        }
      }

      // Author filter
      if (selectedAuthor !== 'ALL') {
        const authorMatch =
          log.user === selectedAuthor ||
          log.userEmail === selectedAuthor;
        if (!authorMatch) return false;
      }

      return true;
    });
  }, [auditLogs, searchQuery, unreadOnly, selectedCategory, selectedAuthor]);

  // Export handlers
  const handleExportXLSX = () => {
    const rows = filteredLogs.map((log) => ({
      Timestamp: `${log.date} ${log.time}`,
      'Made By (Name)': log.user,
      'Made By (Email)': log.userEmail || 'N/A',
      'Staff Role': log.userRole,
      Category: log.category || 'SYSTEM',
      Action: log.action,
      'Affected Item': log.affectedRecord,
      Details: log.description,
      Severity: log.severity || 'info',
      Status: log.read ? 'Read' : 'Unread',
    }));

    exportToExcel('FLO_Famous_Change_Notifications', 'ChangeLog', rows);
  };

  const handleExportCSV = () => {
    const rows = filteredLogs.map((log) => ({
      Timestamp: `${log.date} ${log.time}`,
      'Made By': `${log.user} (${log.userEmail || log.userRole})`,
      Category: log.category || 'SYSTEM',
      Action: log.action,
      'Affected Item': log.affectedRecord,
      Details: log.description,
    }));
    exportToCSV(`FLO_Famous_Notifications_${Date.now()}`, rows);
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'USER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <UserPlus className="w-3 h-3" />
            User Management
          </span>
        );
      case 'YEAR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Calendar className="w-3 h-3" />
            Academic Year
          </span>
        );
      case 'COLUMN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Columns className="w-3 h-3" />
            Fee Column
          </span>
        );
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <GraduationCap className="w-3 h-3" />
            Student Record
          </span>
        );
      case 'FINANCIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CreditCard className="w-3 h-3" />
            Financial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldCheck className="w-3 h-3" />
            System
          </span>
        );
    }
  };

  return (
    <div id="notifications-page-container" className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 relative">
              <Bell className="w-6 h-6" />
              {unreadLogsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadLogsCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                  Notifications & System Activity
                </h2>
                {unreadLogsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-xs font-bold">
                    {unreadLogsCount} new
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time log of changes made to users, academic years, fee columns, and students — showing who made each change and when.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {unreadLogsCount > 0 && (
            <button
              onClick={markAllLogsAsRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-700" />
              <span>Mark All as Read</span>
            </button>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleExportXLSX}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              title="Export filtered changes to Excel"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Export XLSX</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              title="Export filtered changes to CSV"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Host Admin Status Notice */}
      <div className="p-3.5 bg-emerald-950 text-emerald-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-emerald-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
            AD
          </div>
          <div>
            <div className="font-semibold text-white">
              Primary System Administrator: Admin ({' '}
              <span className="text-amber-300 font-mono">flofamous.edu.ng</span> )
            </div>
            <div className="text-emerald-300 text-[11px]">
              Full authorization enabled: Add users, create academic sessions, and manage fee records.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-2.5 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-[11px] font-medium border border-emerald-700">
            Live System Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, author, email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          {/* Filter by Category */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium whitespace-nowrap">Change Type:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Changes</option>
              <option value="USER">User Management</option>
              <option value="YEAR">Academic Year / Sessions</option>
              <option value="COLUMN">Fee Columns & Rates</option>
              <option value="STUDENT">Student Records</option>
              <option value="FINANCIAL">Financial Payments</option>
              <option value="SYSTEM">System & Settings</option>
            </select>
          </div>

          {/* Filter by Author / Who made the change */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium whitespace-nowrap">Made By:</span>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Staff</option>
              <option value="Admin">Admin (flofamous.edu.ng)</option>
              {authorsList
                .filter((a) => a.name !== 'Admin')
                .map((a, idx) => (
                  <option key={idx} value={a.email || a.name}>
                    {a.name} {a.email ? `(${a.email})` : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Unread Toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-700">Unread Only</span>
            </label>
            {unreadLogsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                {unreadLogsCount}
              </span>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {(selectedCategory !== 'ALL' || selectedAuthor !== 'ALL' || unreadOnly || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400">Active filters:</span>
            {selectedCategory !== 'ALL' && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-medium flex items-center gap-1">
                Type: {selectedCategory}
                <button onClick={() => setSelectedCategory('ALL')} className="hover:text-emerald-900 font-bold ml-1">×</button>
              </span>
            )}
            {selectedAuthor !== 'ALL' && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-medium flex items-center gap-1">
                Author: {selectedAuthor}
                <button onClick={() => setSelectedAuthor('ALL')} className="hover:text-purple-900 font-bold ml-1">×</button>
              </span>
            )}
            {unreadOnly && (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-medium flex items-center gap-1">
                Unread only
                <button onClick={() => setUnreadOnly(false)} className="hover:text-rose-900 font-bold ml-1">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium flex items-center gap-1">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-slate-900 font-bold ml-1">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedAuthor('ALL');
                setUnreadOnly(false);
                setSearchQuery('');
              }}
              className="text-emerald-700 hover:underline font-semibold ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Notifications / Activity Log Feed */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div className="text-base font-bold text-slate-800">
              No change notifications match your filter
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Every system event — adding users, creating new academic years, adding fee columns, and recording student fees — is tracked here with author details.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isUnread = !log.read;
            return (
              <div
                key={log.id}
                className={`bg-white rounded-xl p-4 border transition-all shadow-xs hover:border-emerald-300 ${
                  isUnread
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left Column: Author and Action */}
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Author Avatar */}
                    <div
                      className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                        log.userRole === 'Super Admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {log.user
                        ? log.user
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                        : 'US'}
                    </div>

                    <div className="min-w-0 space-y-1">
                      {/* Action Header & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {log.action}
                        </span>
                        {getCategoryBadge(log.category)}
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                        )}
                      </div>

                      {/* Affected Item */}
                      <div className="text-xs font-semibold text-emerald-800">
                        Affected: <span className="font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{log.affectedRecord}</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {log.description}
                      </p>

                      {/* Author Details: By Who */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          By: {log.user}
                        </span>
                        {log.userEmail && (
                          <span className="font-mono text-emerald-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {log.userEmail}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {log.userRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Time & Mark as Read */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      <span>
                        {log.date} • {log.time}
                      </span>
                    </div>

                    {isUnread ? (
                      <button
                        onClick={() => markLogAsRead(log.id)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                        title="Mark notification as read"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark read</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <CheckCheck className="w-3 h-3 text-slate-400" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
