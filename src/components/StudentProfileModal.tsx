import React from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Receipt,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira, formatDate } from '../utils/formatters';
import { generateReportPDF } from '../utils/exportUtils';

interface StudentProfileModalProps {
  studentId: string;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ studentId, onClose }) => {
  const {
    students,
    payments,
    activeSession,
    activeTerm,
    getStudentFinancialSummary,
    openReceipt,
    openRecordPayment,
    schoolSettings,
    currentUser,
  } = useApp();

  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const financialSummary = getStudentFinancialSummary(student.id, activeSession, activeTerm);

  // Student's payments in active session/term
  const studentPayments = payments.filter(
    (p) => p.studentId === student.id && p.academicSession === activeSession && p.term === activeTerm
  );

  const isOverpaid = financialSummary.outstanding < 0;

  // Generate student financial statement PDF
  const handleDownloadStatement = () => {
    const feeRows = Object.entries(financialSummary.feeBreakdown).map(([cat, amt]) => [
      cat,
      formatNaira(amt),
    ]);

    const paymentRows = studentPayments.map((p) => [
      p.receiptNumber,
      formatDate(p.paymentDate),
      p.feeCategory,
      p.paymentMethod,
      p.status,
      formatNaira(p.amount),
    ]);

    generateReportPDF({
      title: `Student Financial Dossier & Statement of Account`,
      subtitle: `Student: ${student.fullName} (${student.id}) | Class: ${student.className}`,
      session: activeSession,
      term: activeTerm,
      generatedBy: currentUser?.name || 'School Bursar',
      headers: ['Fee Category / Item', 'Assigned Amount (NGN)'],
      rows: feeRows,
      summaryStats: [
        { label: 'Total Expected', value: formatNaira(financialSummary.totalExpected) },
        { label: 'Total Paid', value: formatNaira(financialSummary.totalPaid) },
        {
          label: isOverpaid ? 'Credit Balance' : 'Outstanding Balance',
          value: isOverpaid ? formatNaira(Math.abs(financialSummary.outstanding)) : formatNaira(financialSummary.outstanding),
        },
        { label: 'Status', value: financialSummary.status },
      ],
      schoolSettings,
    });
  };

  return (
    <div
      id="student-profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 font-black text-xl flex items-center justify-center shadow-md border-2 border-amber-200 shrink-0">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display">
                  {student.fullName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-amber-300 border border-emerald-700 uppercase tracking-wider">
                  {student.status}
                </span>
              </div>
              <div className="text-xs text-emerald-200 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                <span>{student.id}</span>
                <span>•</span>
                <span className="font-sans font-semibold text-white">{student.className}</span>
                <span>•</span>
                <span className="font-sans text-amber-300">{student.section}</span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-student-profile"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
          {/* FINANCIAL SUMMARY CARD (Matching prompt example) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Financial Summary ({activeSession} - {activeTerm})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-profile-statement-pdf"
                  onClick={handleDownloadStatement}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3 h-3 text-emerald-700" />
                  <span>Statement PDF</span>
                </button>
                <button
                  id="btn-profile-record-pay"
                  onClick={() => {
                    onClose();
                    openRecordPayment(student.id);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Record Payment</span>
                </button>
              </div>
            </div>

            {/* Live Financial Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Total Expected</div>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                  {formatNaira(financialSummary.totalExpected)}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-emerald-700 uppercase font-bold">Total Paid</div>
                <div className="text-lg font-black font-mono text-emerald-700 mt-0.5">
                  {formatNaira(financialSummary.totalPaid)}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  {isOverpaid ? 'Credit / Overpayment' : 'Outstanding Balance'}
                </div>
                <div className={`text-lg font-black font-mono mt-0.5 ${isOverpaid ? 'text-blue-700' : financialSummary.outstanding > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isOverpaid ? formatNaira(Math.abs(financialSummary.outstanding)) : formatNaira(financialSummary.outstanding)}
                </div>
              </div>
            </div>

            {/* Fee Breakdown Checklist */}
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-600 uppercase mb-2">
                Fee Items Breakdown:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(financialSummary.feeBreakdown).length === 0 ? (
                  <div className="text-slate-400 col-span-4 text-center py-2">
                    No fees currently assigned for this term.
                  </div>
                ) : (
                  Object.entries(financialSummary.feeBreakdown).map(([category, amt]) => (
                    <div key={category} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[11px] text-slate-500 truncate">{category}</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">{formatNaira(amt)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* INSTALLMENT PAYMENT RECEIPTS HISTORY */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>Payment & Installments History ({studentPayments.length})</span>
              </h3>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Receipt No</th>
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-slate-400">
                        No payments recorded for this student in this term yet.
                      </td>
                    </tr>
                  ) : (
                    studentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-slate-700">
                          {p.receiptNumber}
                        </td>
                        <td className="p-2.5 text-slate-500 whitespace-nowrap">
                          {p.paymentDate} • {p.paymentTime}
                        </td>
                        <td className="p-2.5 text-slate-700">{p.feeCategory}</td>
                        <td className="p-2.5 text-slate-600">{p.paymentMethod}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                          {formatNaira(p.amount)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => openReceipt(p)}
                            className="p-1 rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
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

          {/* STUDENT DOSSIER & PARENT INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Academic Bio */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 uppercase text-[11px]">Academic Records</h4>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Gender:</span>
                <span className="font-medium text-slate-900">{student.gender}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-medium text-slate-900">{formatDate(student.dateOfBirth)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Admission Date:</span>
                <span className="font-medium text-slate-900">{formatDate(student.admissionDate)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Previous School:</span>
                <span className="font-medium text-slate-900">{student.previousSchool || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Notes:</span>
                <span className="font-medium text-slate-900 truncate max-w-[180px]">{student.notes || 'None'}</span>
              </div>
            </div>

            {/* Parent Information */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 uppercase text-[11px]">Parent / Guardian Information</h4>
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>{student.parentName || 'Not recorded'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <a href={`tel:${student.parentPhone}`} className="hover:underline font-mono">
                  {student.parentPhone}
                </a>
              </div>
              {student.parentEmail && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" />
                  <a href={`mailto:${student.parentEmail}`} className="hover:underline truncate">
                    {student.parentEmail}
                  </a>
                </div>
              )}
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>{student.address || 'Enugu, Nigeria'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
