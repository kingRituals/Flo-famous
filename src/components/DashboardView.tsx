import React from 'react';
import {
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Receipt,
  TrendingUp,
  Banknote,
  School,
  ArrowUpRight,
  Eye,
  FileText,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira, formatDate } from '../utils/formatters';

interface DashboardViewProps {
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTab }) => {
  const {
    currentUser,
    students,
    classes,
    payments,
    schoolFinancials,
    activeSession,
    activeTerm,
    openReceipt,
    openRecordPayment,
    openStudentProfile,
  } = useApp();

  // Recent completed transactions (last 6)
  const recentTransactions = payments
    .filter((p) => p.status === 'COMPLETED')
    .slice(0, 6);

  // Section collections comparison
  const sectionBreakdown = [
    {
      name: 'Primary & Nursery',
      studentsCount: schoolFinancials.primaryCount,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      name: 'Junior Secondary (JSS)',
      studentsCount: schoolFinancials.jssCount,
      color: 'bg-blue-600',
      textColor: 'text-blue-700',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      name: 'Senior Secondary (SS)',
      studentsCount: schoolFinancials.ssCount,
      color: 'bg-purple-600',
      textColor: 'text-purple-700',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  ];

  // Payment methods distribution
  const paymentMethodCounts = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce<Record<string, { count: number; total: number }>>((acc, p) => {
      const method = p.paymentMethod || 'Other';
      if (!acc[method]) acc[method] = { count: 0, total: 0 };
      acc[method].count += 1;
      acc[method].total += p.amount;
      return acc;
    }, {});

  const totalCollectedAll = schoolFinancials.totalPaid || 1;
  const collectionRate = schoolFinancials.totalExpected > 0
    ? Math.min(100, Math.round((schoolFinancials.totalPaid / schoolFinancials.totalExpected) * 100))
    : 0;

  return (
    <div id="dashboard-view-container" className="space-y-6">
      {/* Welcome & Session Banner with Logged-in Staff Name */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <School className="w-3.5 h-3.5" />
              <span>FLO Famous Secondary and Primary School, Nigeria</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live System Connected</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white font-display">
            Welcome, {currentUser?.name || 'Admin'}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl">
            Logged in as <strong className="text-white font-semibold">{currentUser?.name || 'Admin'}</strong> ({currentUser?.role || 'Admin'}). Active session: <strong className="text-amber-300">{activeSession}</strong> ({activeTerm}). All financial computations, student fees, and ledger records reflect live entries in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-dash-open-table"
            onClick={() => onNavigateToTab('excel-table')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Excel Fee Table</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            id="btn-dash-record-payment"
            onClick={() => openRecordPayment()}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-emerald-300" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Staff Live Status & Quick Action Ribbon */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-emerald-500/20 shrink-0">
            {currentUser?.name
              ? currentUser.name === 'Admin'
                ? 'AD'
                : currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
              : 'AD'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                {currentUser?.name || 'Admin'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {currentUser?.role || 'Admin'}
              </span>
              {currentUser?.isMainAdmin && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Primary Admin
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
              <span>{currentUser?.email || 'flofamous.edu.ng'}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Session Active (Live Dashboard)
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigateToTab('students')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Students ({students.length})</span>
          </button>
          <button
            onClick={() => onNavigateToTab('outstanding')}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Debtors ({schoolFinancials.notPaidCount + schoolFinancials.partiallyPaidCount})</span>
          </button>
          <button
            onClick={() => onNavigateToTab('payments')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Payments ({payments.length})</span>
          </button>
          <button
            onClick={() => onNavigateToTab('excel-table')}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Live Spreadsheet Grid</span>
          </button>
        </div>
      </div>

      {/* TODAY'S ACTIVITY BAR */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Today's Collections (21 Sep 2026)
            </div>
            <div className="text-lg font-black font-mono text-slate-950">
              {formatNaira(schoolFinancials.todayTotal)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold divide-x divide-amber-300">
          <div>
            <span className="text-amber-700">Transactions Today: </span>
            <span className="font-bold text-slate-900">{schoolFinancials.todayTransactionsCount}</span>
          </div>
          <div className="pl-4">
            <span className="text-amber-700">Term Collection Rate: </span>
            <span className="font-bold text-emerald-800">{collectionRate}%</span>
          </div>
        </div>
      </div>

      {/* FINANCIAL STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Expected Fees */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expected Fees</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatNaira(schoolFinancials.totalExpected)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {students.length} active registered students
          </div>
        </div>

        {/* Total Collected / Paid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Amount Paid</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700">
            {formatNaira(schoolFinancials.totalPaid)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-700 shrink-0">{collectionRate}%</span>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Outstanding</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-600">
            {formatNaira(schoolFinancials.totalOutstanding)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
            <span>Unpaid / partial balances</span>
            <button
              onClick={() => onNavigateToTab('outstanding')}
              className="font-semibold text-rose-600 hover:underline"
            >
              View Debtors &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* STUDENT DISTRIBUTION CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Students</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">{students.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Enrolled FLO Famous</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Primary & Nursery</div>
          <div className="text-xl font-black text-emerald-800 mt-0.5">{schoolFinancials.primaryCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Nursery 1 - Primary 5</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Junior Secondary (JSS)</div>
          <div className="text-xl font-black text-blue-800 mt-0.5">{schoolFinancials.jssCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">JSS 1 - JSS 3</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase">Senior Secondary (SS)</div>
          <div className="text-xl font-black text-purple-800 mt-0.5">{schoolFinancials.ssCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">SS 1 - SS 3</div>
        </div>
      </div>

      {/* CHARTS & COMPARISONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payment Status Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Student Fee Payment Status
            </h3>
            <span className="text-xs text-slate-500 font-medium">Current Term</span>
          </div>

          <div className="space-y-3">
            {/* Fully Paid */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Fully Paid
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {schoolFinancials.fullyPaidCount} Students ({students.length > 0 ? Math.round((schoolFinancials.fullyPaidCount / students.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full"
                  style={{ width: `${students.length > 0 ? (schoolFinancials.fullyPaidCount / students.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Partially Paid */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Partially Paid (Installments Active)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {schoolFinancials.partiallyPaidCount} Students ({students.length > 0 ? Math.round((schoolFinancials.partiallyPaidCount / students.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{ width: `${students.length > 0 ? (schoolFinancials.partiallyPaidCount / students.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Not Paid */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  Not Paid (Zero Payments)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {schoolFinancials.notPaidCount} Students ({students.length > 0 ? Math.round((schoolFinancials.notPaidCount / students.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-2.5 rounded-full"
                  style={{ width: `${students.length > 0 ? (schoolFinancials.notPaidCount / students.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Channels / Methods */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Payment Methods Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-medium">Recorded Volume</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(paymentMethodCounts).map(([method, data]) => (
              <div key={method} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="text-[11px] font-bold text-slate-500 uppercase">{method}</div>
                <div className="text-base font-black font-mono text-slate-900 mt-1">
                  {formatNaira(data.total)}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                  {data.count} transaction{data.count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Recent Fee Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Latest recorded payments with official receipt generation.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('payments')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            <span>View All Payments</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Receipt No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Fee Category</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-700">
                      {payment.receiptNumber}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      <button
                        onClick={() => openStudentProfile(payment.studentId)}
                        className="hover:text-emerald-700 hover:underline"
                      >
                        {payment.studentName}
                      </button>
                    </td>
                    <td className="p-3 text-slate-600">{payment.className}</td>
                    <td className="p-3 text-slate-600">{payment.feeCategory}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      {formatNaira(payment.amount)}
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {formatDate(payment.paymentDate)} • {payment.paymentTime}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        id={`btn-dash-receipt-${payment.id}`}
                        onClick={() => openReceipt(payment)}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                        title="View Official Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    </td>
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
