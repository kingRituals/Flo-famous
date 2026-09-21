import React from 'react';
import { X, Printer, Download, CheckCircle, AlertTriangle, School } from 'lucide-react';
import { PaymentTransaction, Student } from '../types';
import { useApp } from '../context/AppContext';
import { formatNaira, amountInWords, formatDate } from '../utils/formatters';
import { generateReceiptPDF } from '../utils/exportUtils';

interface PaymentReceiptModalProps {
  payment: PaymentTransaction;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ payment, onClose }) => {
  const { students, schoolSettings } = useApp();

  const student = students.find((s) => s.id === payment.studentId);
  const isOverpaid = payment.newBalance < 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateReceiptPDF(payment, student, schoolSettings);
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Official Receipt Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-receipt"
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              id="btn-download-pdf-receipt"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              id="btn-close-receipt"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div id="printable-receipt-card" className="p-6 sm:p-8 bg-white relative print-card">
          {/* Decorative Border */}
          <div className="border-2 border-emerald-800 p-1 rounded-xl">
            <div className="border border-amber-600/60 p-5 rounded-lg">
              {/* Receipt Header Banner */}
              <div className="text-center pb-4 border-b-2 border-emerald-800/20">
                <div className="flex items-center justify-center gap-2 text-emerald-900 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
                    <School className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black tracking-wider uppercase font-display text-emerald-950">
                    {schoolSettings.schoolName}
                  </h2>
                </div>
                <p className="text-[11px] font-semibold text-amber-700 italic">
                  "{schoolSettings.schoolMotto}"
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {schoolSettings.address} | Tel: {schoolSettings.phone}
                </p>
                <p className="text-[10px] text-slate-500">
                  Email: {schoolSettings.email} | Web: {schoolSettings.website}
                </p>

                {/* Ribbon */}
                <div className="mt-3 inline-block px-4 py-1 rounded-full bg-emerald-900 text-white text-[11px] font-bold uppercase tracking-widest">
                  OFFICIAL FEE PAYMENT RECEIPT
                </div>
              </div>

              {/* Void Warning Stamp if Voided */}
              {payment.status === 'VOIDED' && (
                <div className="my-3 p-2 bg-rose-100 border border-rose-300 rounded-lg text-rose-800 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>TRANSACTION VOIDED: {payment.voidReason || 'Admin reversal'} (Voided by {payment.voidedBy})</span>
                </div>
              )}

              {/* Meta: Receipt Number & Date */}
              <div className="flex flex-wrap items-center justify-between text-xs py-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500">Receipt No: </span>
                  <span className="font-mono font-bold text-slate-900">{payment.receiptNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Date & Time: </span>
                  <span className="font-semibold text-slate-900">{payment.paymentDate} • {payment.paymentTime}</span>
                </div>
              </div>

              {/* Student Dossier Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-3.5 bg-slate-50/80 -mx-5 px-5 my-2 border-y border-slate-200/80">
                <div>
                  <span className="text-slate-500">Student Name: </span>
                  <span className="font-bold text-slate-950">{payment.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Student ID: </span>
                  <span className="font-mono font-bold text-slate-900">{payment.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Class & Term: </span>
                  <span className="font-semibold text-slate-800">
                    {payment.className} ({payment.academicSession} - {payment.term})
                  </span>
                </div>
                {student?.parentName && (
                  <div>
                    <span className="text-slate-500">Parent / Guardian: </span>
                    <span className="font-medium text-slate-800">
                      {student.parentName} ({student.parentPhone})
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Details Table */}
              <div className="my-3 overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-950 text-white font-semibold">
                    <tr>
                      <th className="p-2.5">Item / Fee Category</th>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Transaction Ref</th>
                      <th className="p-2.5 text-right">Amount (NGN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">{payment.feeCategory}</td>
                      <td className="p-2.5 text-slate-700">{payment.paymentMethod}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">
                        {payment.transactionReference || 'N/A'}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700 text-sm">
                        {formatNaira(payment.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount In Words */}
              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs mb-3">
                <div className="text-[10px] font-bold uppercase text-emerald-900">Amount In Words:</div>
                <div className="font-medium text-emerald-950 italic mt-0.5">
                  {amountInWords(payment.amount)}
                </div>
              </div>

              {/* Balance Summary Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100/80 rounded-lg text-center text-xs font-mono mb-4">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-sans">Previous Balance</div>
                  <div className="font-bold text-slate-800 mt-0.5">{formatNaira(payment.previousBalance)}</div>
                </div>
                <div className="border-x border-slate-300">
                  <div className="text-[10px] text-emerald-700 uppercase font-sans font-semibold">Amount Paid</div>
                  <div className="font-black text-emerald-700 mt-0.5">{formatNaira(payment.amount)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-sans">New Balance</div>
                  <div className={`font-black mt-0.5 ${isOverpaid ? 'text-blue-700' : payment.newBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {isOverpaid ? `${formatNaira(Math.abs(payment.newBalance))} (CREDIT)` : formatNaira(payment.newBalance)}
                  </div>
                </div>
              </div>

              {/* Signatures and Bursar stamp */}
              <div className="flex items-end justify-between pt-4 mt-4 border-t border-slate-200 text-xs text-slate-600">
                <div>
                  <div className="text-[11px] text-slate-500">Cashier / Recorded By:</div>
                  <div className="font-bold text-slate-900 mt-0.5">{payment.recordedBy}</div>
                  <div className="text-[10px] text-slate-400">FLO Famous School Bursary</div>
                </div>
                <div className="text-right">
                  <div className="w-36 border-b border-slate-400 pb-8 text-center text-[10px] text-slate-400">
                    Official Stamp & Signature
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Authorized School Signatory</div>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-400 mt-4 border-t border-slate-100 pt-2">
                Fees paid are non-refundable. Please retain this original receipt for all school administrative clearances.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
