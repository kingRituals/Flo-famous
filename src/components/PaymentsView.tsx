import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  CreditCard,
  Printer,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira, formatDate } from '../utils/formatters';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';
import { PaymentMethod } from '../types';

export const PaymentsView: React.FC = () => {
  const {
    payments,
    activeSession,
    activeTerm,
    openReceipt,
    openRecordPayment,
    openStudentProfile,
    voidPayment,
    hasPermission,
    notify,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [voidModalPaymentId, setVoidModalPaymentId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (selectedMethod !== 'ALL' && p.paymentMethod !== selectedMethod) return false;
      if (selectedCategory !== 'ALL' && p.feeCategory !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.receiptNumber.toLowerCase().includes(q) ||
          p.studentName.toLowerCase().includes(q) ||
          p.studentId.toLowerCase().includes(q) ||
          p.className.toLowerCase().includes(q) ||
          (p.transactionReference && p.transactionReference.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [payments, selectedMethod, selectedCategory, selectedStatus, searchQuery]);

  // Totals for filtered payments
  const totalVolume = filteredPayments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleExportExcel = () => {
    const data = filteredPayments.map((p) => ({
      'Receipt Number': p.receiptNumber,
      'Payment Date': p.paymentDate,
      'Time': p.paymentTime,
      'Student ID': p.studentId,
      'Student Name': p.studentName,
      'Class': p.className,
      'Session': p.academicSession,
      'Term': p.term,
      'Fee Category': p.feeCategory,
      'Amount Paid (NGN)': p.amount,
      'Payment Method': p.paymentMethod,
      'Transaction Ref': p.transactionReference || 'N/A',
      'Recorded By': p.recordedBy,
      'Status': p.status,
      'Void Reason': p.voidReason || '',
    }));

    exportToExcel('FLO_Famous_Payment_Ledger', 'Transactions', data);
  };

  const handleConfirmVoid = () => {
    if (!voidModalPaymentId) return;
    if (!voidReason.trim()) {
      notify('Please provide a reason for voiding this transaction.', 'warning');
      return;
    }
    voidPayment(voidModalPaymentId, voidReason.trim());
    setVoidModalPaymentId(null);
    setVoidReason('');
  };

  return (
    <div id="payments-view-container" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Transactions & Fee Receipts Ledger
              </h2>
              <p className="text-xs text-slate-500">
                Complete payment records, instant receipt verification, and voiding audit control.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export Ledger (XLSX)</span>
          </button>

          {hasPermission('recordPayment') && (
            <button
              onClick={() => openRecordPayment()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record New Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Filtered Completed Transactions:</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {filteredPayments.filter((p) => p.status === 'COMPLETED').length} payments
          </div>
        </div>
        <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 shadow-xs">
          <span className="text-emerald-800 font-bold uppercase text-[10px]">Total Filtered Inflow:</span>
          <div className="text-lg font-black font-mono text-emerald-900 mt-0.5">
            {formatNaira(totalVolume)}
          </div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Voided / Reversed Transactions:</span>
          <div className="text-lg font-black text-rose-600 mt-0.5">
            {filteredPayments.filter((p) => p.status === 'VOIDED').length} voided
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Method Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 font-medium">Method:</span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Methods</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="POS">POS</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online Payment">Online Payment</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="VOIDED">Voided</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt #, student, ref..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-emerald-600 w-56 sm:w-64"
            />
          </div>
        </div>

        <div className="text-slate-500 text-xs font-medium">
          Showing <strong>{filteredPayments.length}</strong> transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="p-3">Receipt No</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Student</th>
                <th className="p-3">Class</th>
                <th className="p-3">Fee Category</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Cashier</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Receipt & Void</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400 font-medium">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isVoided = p.status === 'VOIDED';
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isVoided ? 'bg-rose-50/30 opacity-70' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {p.receiptNumber}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {p.paymentDate} <span className="text-slate-400 font-mono text-[11px]">{p.paymentTime}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => openStudentProfile(p.studentId)}
                          className="hover:text-emerald-700 hover:underline"
                        >
                          {p.studentName}
                        </button>
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{p.className}</td>
                      <td className="p-3 text-slate-700 whitespace-nowrap">{p.feeCategory}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td
                        className={`p-3 text-right font-mono font-bold whitespace-nowrap ${
                          isVoided ? 'line-through text-slate-400' : 'text-emerald-700 text-sm'
                        }`}
                      >
                        {formatNaira(p.amount)}
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">{p.recordedBy}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isVoided
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`btn-view-receipt-${p.id}`}
                            onClick={() => openReceipt(p)}
                            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                            title="View / Print Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          {!isVoided && hasPermission('voidPayment') && (
                            <button
                              id={`btn-void-${p.id}`}
                              onClick={() => {
                                setVoidModalPaymentId(p.id);
                                setVoidReason('');
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Void Transaction (Super Admin/Director)"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Void Confirmation Modal */}
      {voidModalPaymentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 text-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 font-display">
              Void Payment Transaction
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Voiding will reverse the student's payment balance and stamp this receipt as VOIDED in the audit trail.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Voiding *
                </label>
                <textarea
                  required
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Bank transfer bounced, duplicate cashier entry, cashier error..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVoidModalPaymentId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVoid}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm Void
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
