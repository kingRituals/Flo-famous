import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Download,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/exportUtils';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.user.toLowerCase().includes(q) ||
          log.description.toLowerCase().includes(q) ||
          log.affectedRecord.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, searchQuery]);

  const handleExportLogs = () => {
    const data = filteredLogs.map((log) => ({
      Timestamp: `${log.date} ${log.time}`,
      User: `${log.user} (${log.userRole})`,
      Action: log.action,
      'Affected Record': log.affectedRecord,
      Description: log.description,
      Severity: log.severity || 'info',
    }));

    exportToExcel('FLO_Famous_Audit_Trail', 'AuditLogs', data);
  };

  return (
    <div id="audit-logs-container" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Immutable System Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Tamper-evident logs of all financial transactions, student alterations, fee changes, and system events.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Export Audit Log (XLSX)</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
        <span>
          <strong>Audit Immutability Enforced:</strong> All logged records are cryptographically timestamped and cannot be deleted or purged by regular staff users.
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="FINANCIAL">Financial Payments & Voids</option>
              <option value="STUDENT">Student Management</option>
              <option value="FEE">Fee Configuration</option>
              <option value="AUTH">Authentication & Users</option>
              <option value="SYSTEM">System & Settings</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, user, student ID, details..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-emerald-600 w-56 sm:w-72"
            />
          </div>
        </div>

        <div className="text-slate-500 text-xs font-medium">
          Showing <strong>{filteredLogs.length}</strong> log entries
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Authorized User</th>
                <th className="p-3">Category</th>
                <th className="p-3">Action</th>
                <th className="p-3">Student Ref</th>
                <th className="p-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                    No audit records matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                      {log.date}{' '}
                      <span className="text-slate-400">{log.time}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.user}</div>
                      <div className="text-[10px] text-slate-500">{log.userRole}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                      {log.affectedRecord || '-'}
                    </td>
                    <td className="p-3 text-slate-700 max-w-md">{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
