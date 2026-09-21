import React, { useState } from 'react';
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Filter,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira, formatDate, getCurrentNigeriaDateTime } from '../utils/formatters';
import { exportToExcel, exportToCSV, generateReportPDF } from '../utils/exportUtils';

export const ReportsView: React.FC = () => {
  const {
    students,
    classes,
    payments,
    feeCategories,
    activeSession,
    activeTerm,
    getStudentFinancialSummary,
    schoolSettings,
    currentUser,
  } = useApp();

  const [reportType, setReportType] = useState<string>('term_summary');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  const { date: todayDate } = getCurrentNigeriaDateTime();

  // 1. Daily Collection Report
  const handleGenerateDailyReport = () => {
    const todayPayments = payments.filter((p) => p.paymentDate === todayDate && p.status === 'COMPLETED');
    const totalToday = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    const rows = todayPayments.map((p) => [
      p.receiptNumber,
      p.paymentTime,
      p.studentName,
      p.className,
      p.feeCategory,
      p.paymentMethod,
      formatNaira(p.amount),
    ]);

    generateReportPDF({
      title: 'Daily Fee Collection Audit Report',
      subtitle: `Date: ${formatDate(todayDate)} | Total Cashier Inflow: ${formatNaira(totalToday)}`,
      session: activeSession,
      term: activeTerm,
      generatedBy: currentUser?.name || 'School Bursar',
      headers: ['Receipt #', 'Time', 'Student', 'Class', 'Category', 'Method', 'Amount'],
      rows,
      summaryStats: [
        { label: 'Transactions Count', value: `${todayPayments.length} Payments` },
        { label: 'Total Inflow', value: formatNaira(totalToday) },
      ],
      schoolSettings,
    });
  };

  // 2. Class by Class Financial Report
  const handleGenerateClassReport = () => {
    let grandExpected = 0;
    let grandPaid = 0;
    let grandOutstanding = 0;

    const rows = classes.map((c) => {
      const classStudents = students.filter((s) => s.classId === c.id && s.status === 'Active');
      let exp = 0;
      let paid = 0;
      let out = 0;

      classStudents.forEach((st) => {
        const fin = getStudentFinancialSummary(st.id, activeSession, activeTerm);
        exp += fin.totalExpected;
        paid += fin.totalPaid;
        if (fin.outstanding > 0) out += fin.outstanding;
      });

      grandExpected += exp;
      grandPaid += paid;
      grandOutstanding += out;

      const rate = exp > 0 ? `${Math.round((paid / exp) * 100)}%` : '0%';

      return [
        c.name,
        c.section.replace('_', ' '),
        `${classStudents.length} Students`,
        formatNaira(exp),
        formatNaira(paid),
        formatNaira(out),
        rate,
      ];
    });

    generateReportPDF({
      title: 'Class-by-Class Comprehensive Financial Report',
      subtitle: `Academic Session: ${activeSession} | Term: ${activeTerm}`,
      session: activeSession,
      term: activeTerm,
      generatedBy: currentUser?.name || 'School Bursar',
      headers: ['Class', 'Section', 'Enrollment', 'Expected', 'Paid', 'Outstanding', 'Rate'],
      rows,
      summaryStats: [
        { label: 'Total Expected', value: formatNaira(grandExpected) },
        { label: 'Total Collected', value: formatNaira(grandPaid) },
        { label: 'Total Outstanding', value: formatNaira(grandOutstanding) },
      ],
      schoolSettings,
    });
  };

  // 3. Fee Category Breakdown Report
  const handleGenerateCategoryReport = () => {
    const categoryTotals: Record<string, number> = {};
    payments
      .filter((p) => p.academicSession === activeSession && p.term === activeTerm && p.status === 'COMPLETED')
      .forEach((p) => {
        categoryTotals[p.feeCategory] = (categoryTotals[p.feeCategory] || 0) + p.amount;
      });

    const rows = Object.entries(categoryTotals).map(([cat, total]) => [
      cat,
      formatNaira(total),
      `${Math.round((total / (Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1)) * 100)}%`,
    ]);

    generateReportPDF({
      title: 'Fee Category & Revenue Source Breakdown',
      subtitle: `Academic Session: ${activeSession} | Term: ${activeTerm}`,
      session: activeSession,
      term: activeTerm,
      generatedBy: currentUser?.name || 'School Bursar',
      headers: ['Fee Category / Item', 'Collected Revenue (NGN)', 'Share of Inflow'],
      rows,
      summaryStats: [
        {
          label: 'Total Category Inflow',
          value: formatNaira(Object.values(categoryTotals).reduce((a, b) => a + b, 0)),
        },
      ],
      schoolSettings,
    });
  };

  // 4. Excel Export of Master Ledger
  const handleExportFullMasterExcel = () => {
    const data = students.map((st) => {
      const fin = getStudentFinancialSummary(st.id, activeSession, activeTerm);
      return {
        'Student ID': st.id,
        'Student Name': st.fullName,
        Class: st.className,
        Section: st.section,
        'Parent Name': st.parentName,
        'Parent Phone': st.parentPhone,
        'Total Expected (NGN)': fin.totalExpected,
        'Total Paid (NGN)': fin.totalPaid,
        'Outstanding (NGN)': fin.outstanding > 0 ? fin.outstanding : 0,
        'Credit (NGN)': fin.outstanding < 0 ? Math.abs(fin.outstanding) : 0,
        'Status': fin.status,
      };
    });

    exportToExcel(
      `FLO_Famous_Master_Report_${activeSession.replace('/', '-')}_${activeTerm.replace(/\s+/g, '')}`,
      'MasterFinancials',
      data
    );
  };

  return (
    <div id="reports-view-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileBarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Financial Reports & Audit Statements
              </h2>
              <p className="text-xs text-slate-500">
                Generate official executive reports, PDF ledgers, and spreadsheet exports for the school board.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportFullMasterExcel}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Master Financials (Excel)</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Daily Collection Report Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Daily Collection Audit
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Itemized cashier collection ledger for today ({formatDate(todayDate)}). Complete with cashier names, payment methods, and timestamps.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleGenerateDailyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Daily PDF</span>
            </button>
          </div>
        </div>

        {/* Class-by-Class Financial Report Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Class-by-Class Financials
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Class-level breakdown comparing total expected fee targets against real collections and remaining debt across all classes.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleGenerateClassReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Class PDF</span>
            </button>
          </div>
        </div>

        {/* Fee Category Revenue Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Category Revenue Share
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Breakdown of collections across School Fees, Books, Lesson Fees, Uniforms, and Custom Charges.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleGenerateCategoryReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Category PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
