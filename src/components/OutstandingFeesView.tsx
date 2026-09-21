import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Search,
  Filter,
  Download,
  Printer,
  Phone,
  MessageSquare,
  CreditCard,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira } from '../utils/formatters';
import { exportToExcel, generateReportPDF } from '../utils/exportUtils';

export const OutstandingFeesView: React.FC = () => {
  const {
    students,
    classes,
    activeSession,
    activeTerm,
    getStudentFinancialSummary,
    openRecordPayment,
    openStudentProfile,
    schoolSettings,
    currentUser,
    notify,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [minBalance, setMinBalance] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reminderModalStudent, setReminderModalStudent] = useState<any>(null);

  // Filter debtors
  const debtors = useMemo(() => {
    return students
      .filter((s) => s.status === 'Active')
      .map((s) => {
        const fin = getStudentFinancialSummary(s.id, activeSession, activeTerm);
        return {
          student: s,
          financial: fin,
        };
      })
      .filter(({ student, financial }) => {
        if (financial.outstanding <= 0) return false;
        if (selectedClassId !== 'ALL' && student.classId !== selectedClassId) return false;
        if (financial.outstanding < minBalance) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            student.fullName.toLowerCase().includes(q) ||
            student.id.toLowerCase().includes(q) ||
            student.parentName.toLowerCase().includes(q) ||
            student.parentPhone.includes(q) ||
            student.className.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.financial.outstanding - a.financial.outstanding);
  }, [students, selectedClassId, minBalance, searchQuery, activeSession, activeTerm]);

  const totalOutstandingSum = debtors.reduce((sum, d) => sum + d.financial.outstanding, 0);

  // Export Excel
  const handleExportExcel = () => {
    const data = debtors.map(({ student, financial }) => ({
      'Student ID': student.id,
      'Student Name': student.fullName,
      Class: student.className,
      'Parent Name': student.parentName,
      'Parent Phone': student.parentPhone,
      'Total Expected (NGN)': financial.totalExpected,
      'Total Paid (NGN)': financial.totalPaid,
      'Outstanding Balance (NGN)': financial.outstanding,
      'Status': financial.status,
    }));

    exportToExcel('FLO_Famous_Debtors_List', 'Debtors', data);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    const rows = debtors.map(({ student, financial }) => [
      student.id,
      student.fullName,
      student.className,
      `${student.parentName}\n(${student.parentPhone})`,
      formatNaira(financial.totalExpected),
      formatNaira(financial.totalPaid),
      formatNaira(financial.outstanding),
    ]);

    generateReportPDF({
      title: 'Official School Fees Debtors & Outstanding Report',
      subtitle: `Active Term: ${activeSession} - ${activeTerm} | Total Outstanding: ${formatNaira(totalOutstandingSum)}`,
      session: activeSession,
      term: activeTerm,
      generatedBy: currentUser?.name || 'School Bursar',
      headers: ['ID', 'Student Name', 'Class', 'Parent & Phone', 'Expected', 'Paid', 'Outstanding'],
      rows,
      summaryStats: [
        { label: 'Total Debtors', value: `${debtors.length} Students` },
        { label: 'Cumulative Debt', value: formatNaira(totalOutstandingSum) },
      ],
      schoolSettings,
    });
  };

  // WhatsApp / SMS reminder message preview
  const generateReminderText = (debtor: any) => {
    return `Dear ${debtor.student.parentName}, this is a gentle reminder from ${schoolSettings.schoolName}. The outstanding balance for your ward ${debtor.student.fullName} (${debtor.student.className}) for ${activeSession} ${activeTerm} is ${formatNaira(debtor.financial.outstanding)}. Total Expected: ${formatNaira(debtor.financial.totalExpected)}, Amount Paid so far: ${formatNaira(debtor.financial.totalPaid)}. Please make payment to the school bursary or bank account. For inquiries, call ${schoolSettings.phone}. Thank you.`;
  };

  const handleCopyReminder = (debtor: any) => {
    navigator.clipboard.writeText(generateReminderText(debtor));
    notify(`Fee reminder copied to clipboard for ${debtor.student.parentName}!`, 'success');
  };

  const handleSendWhatsApp = (debtor: any) => {
    const text = encodeURIComponent(generateReminderText(debtor));
    const phone = debtor.student.parentPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? '234' + phone.substring(1) : phone;
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div id="outstanding-fees-container" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Outstanding Fees & Debtors Roster
              </h2>
              <p className="text-xs text-slate-500">
                Monitor unpaid balances, send automated fee reminders, and follow up with parents.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Print / PDF Report</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Debtors Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Students with Outstanding Balance:</span>
          <div className="text-xl font-black text-rose-600 mt-0.5">
            {debtors.length} Students
          </div>
        </div>
        <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-rose-800 font-bold uppercase text-[10px]">Total Uncollected Debt:</span>
          <div className="text-xl font-black font-mono text-rose-700 mt-0.5">
            {formatNaira(totalOutstandingSum)}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Average Outstanding per Debtor:</span>
          <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
            {debtors.length > 0 ? formatNaira(Math.round(totalOutstandingSum / debtors.length)) : '₦0'}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 font-medium">Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Min Balance Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 font-medium">Debt Range:</span>
            <select
              value={minBalance}
              onChange={(e) => setMinBalance(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value={0}>All Outstanding (&gt; ₦0)</option>
              <option value={20000}>Above ₦20,000</option>
              <option value={50000}>Above ₦50,000</option>
              <option value={100000}>Above ₦100,000</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search debtor, parent, class..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-emerald-600 w-56 sm:w-64"
            />
          </div>
        </div>

        <div className="text-slate-500 text-xs font-medium">
          Showing <strong>{debtors.length}</strong> debtors
        </div>
      </div>

      {/* Debtors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="p-3">Student ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Parent & Contact</th>
                <th className="p-3 text-right">Expected</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Outstanding Debt</th>
                <th className="p-3 text-center">Remind Parent</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {debtors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                    No outstanding fee balances found for the selected criteria!
                  </td>
                </tr>
              ) : (
                debtors.map(({ student, financial }) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {student.id}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() => openStudentProfile(student.id)}
                        className="font-bold text-slate-900 hover:text-emerald-700 hover:underline text-left"
                      >
                        {student.fullName}
                      </button>
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">{student.className}</td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{student.parentName}</div>
                      <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-700" />
                        <span>{student.parentPhone}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-800 whitespace-nowrap">
                      {formatNaira(financial.totalExpected)}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-700 whitespace-nowrap">
                      {formatNaira(financial.totalPaid)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600 text-sm whitespace-nowrap">
                      {formatNaira(financial.outstanding)}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSendWhatsApp({ student, financial })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Send WhatsApp Reminder to Parent"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleCopyReminder({ student, financial })}
                          className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-medium transition-colors"
                          title="Copy SMS / Notice text"
                        >
                          Copy SMS
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openRecordPayment(student.id)}
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openStudentProfile(student.id)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
