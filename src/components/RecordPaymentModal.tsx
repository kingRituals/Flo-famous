import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2, User, Building, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira, getCurrentNigeriaDateTime } from '../utils/formatters';
import { PaymentMethod } from '../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedStudentId?: string | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preSelectedStudentId,
}) => {
  const {
    students,
    feeCategories,
    activeSession,
    activeTerm,
    getStudentFinancialSummary,
    recordPayment,
    openReceipt,
    currentUser,
    notify,
  } = useApp();

  const [studentId, setStudentId] = useState<string>('');
  const [feeCategory, setFeeCategory] = useState<string>('School Fees');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (preSelectedStudentId) {
      setStudentId(preSelectedStudentId);
    } else if (students.length > 0 && !studentId) {
      setStudentId(students[0].id);
    }
  }, [preSelectedStudentId, students]);

  if (!isOpen) return null;

  const selectedStudent = students.find((s) => s.id === studentId);
  const financialSummary = selectedStudent
    ? getStudentFinancialSummary(selectedStudent.id, activeSession, activeTerm)
    : null;

  const { date: todayDate, time: currentTime } = getCurrentNigeriaDateTime();

  const handlePayFull = () => {
    if (financialSummary && financialSummary.outstanding > 0) {
      setAmount(financialSummary.outstanding.toString());
    }
  };

  const handlePayHalf = () => {
    if (financialSummary && financialSummary.outstanding > 0) {
      setAmount(Math.round(financialSummary.outstanding / 2).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      notify('Please enter a valid payment amount.', 'warning');
      return;
    }
    if (!studentId) {
      notify('Please select a student.', 'warning');
      return;
    }

    const payment = recordPayment({
      studentId,
      amount: parsedAmount,
      feeCategory,
      paymentMethod,
      transactionReference: transactionReference.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (payment) {
      onClose();
      openReceipt(payment);
    }
  };

  return (
    <div
      id="record-payment-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-800 text-amber-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-display">
                Record Fee Payment
              </h3>
              <p className="text-[11px] text-emerald-300">
                {activeSession} • {activeTerm}
              </p>
            </div>
          </div>
          <button
            id="btn-close-record-payment"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Student Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Student *
            </label>
            <select
              id="select-payment-student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.id}) — {st.className}
                </option>
              ))}
            </select>
          </div>

          {/* Student Balance Card */}
          {financialSummary && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Student ID: <strong className="text-slate-800 font-mono">{financialSummary.studentId}</strong></span>
                <span className="text-slate-500">Class: <strong className="text-slate-800">{selectedStudent?.className}</strong></span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200 font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 font-sans">Total Expected</div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">
                    {formatNaira(financialSummary.totalExpected)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-sans">Already Paid</div>
                  <div className="font-bold text-emerald-700 text-xs mt-0.5">
                    {formatNaira(financialSummary.totalPaid)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-rose-600 font-sans">Current Balance</div>
                  <div className="font-bold text-rose-600 text-xs mt-0.5">
                    {financialSummary.outstanding < 0
                      ? `${formatNaira(Math.abs(financialSummary.outstanding))} (CREDIT)`
                      : formatNaira(financialSummary.outstanding)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fee Category */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Payment Category / Item *
            </label>
            <select
              id="select-payment-category"
              value={feeCategory}
              onChange={(e) => setFeeCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            >
              <option value="School Fees">School Fees (Tuition)</option>
              {feeCategories.map((fc) => (
                <option key={fc.id} value={fc.name}>
                  {fc.name}
                </option>
              ))}
              <option value="Full Comprehensive Fee Package">Full Comprehensive Fee Package</option>
              <option value="Other School Charges">Other School Charges</option>
            </select>
          </div>

          {/* Payment Amount & Quick-fill */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Amount Paid (₦ NGN) *
              </label>
              {financialSummary && financialSummary.outstanding > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePayHalf}
                    className="text-[10px] font-semibold text-emerald-700 hover:underline"
                  >
                    50% ({formatNaira(Math.round(financialSummary.outstanding / 2))})
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handlePayFull}
                    className="text-[10px] font-bold text-emerald-800 hover:underline"
                  >
                    Full ({formatNaira(financialSummary.outstanding)})
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                ₦
              </span>
              <input
                id="input-payment-amount"
                type="number"
                required
                min="100"
                step="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Method *
              </label>
              <select
                id="select-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="POS">POS Terminal</option>
                <option value="Cash">Cash (Bursary Desk)</option>
                <option value="Card">Debit / ATM Card</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transaction Reference / Bank
              </label>
              <input
                id="input-payment-reference"
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="e.g. TRX-ZEN-981240"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Internal Notes / Remarks
            </label>
            <input
              id="input-payment-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid by father, partial installment 1"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Automatic Metadata Notice */}
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 flex items-center justify-between">
            <div>
              <span>Recorded By: <strong>{currentUser?.name || 'Bursar'}</strong></span>
            </div>
            <div>
              <span>Date & Time: <strong>{todayDate} • {currentTime}</strong></span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              id="btn-submit-payment"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record & Generate Official Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
