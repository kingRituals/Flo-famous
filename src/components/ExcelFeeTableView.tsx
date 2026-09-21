import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CreditCard,
  Eye,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira, formatNumber } from '../utils/formatters';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';

export const ExcelFeeTableView: React.FC = () => {
  const {
    students,
    classes,
    feeCategories,
    addFeeCategory,
    feeAssignments,
    setStudentFeeAmount,
    getStudentFinancialSummary,
    activeSession,
    activeTerm,
    openRecordPayment,
    openStudentProfile,
    hasPermission,
    notify,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newColName, setNewColName] = useState<string>('');
  const [newColAmount, setNewColAmount] = useState<string>('15000');
  const [showAddColModal, setShowAddColModal] = useState<boolean>(false);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (s.status !== 'Active') return false;
      if (selectedSection !== 'ALL' && s.section !== selectedSection) return false;
      if (selectedClassId !== 'ALL' && s.classId !== selectedClassId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, selectedSection, selectedClassId, searchQuery]);

  // Primary active fee columns to show in spreadsheet
  const activeFeeColumns = useMemo(() => {
    // Show popular categories or all categories
    return feeCategories;
  }, [feeCategories]);

  // Helper to fetch cell value
  const getStudentFeeValue = (studentId: string, categoryId: string): number => {
    const assignment = feeAssignments.find(
      (fa) =>
        fa.studentId === studentId &&
        fa.academicSession === activeSession &&
        fa.term === activeTerm &&
        fa.feeCategoryId === categoryId
    );
    return assignment ? assignment.amount : 0;
  };

  // Handle cell edit live
  const handleCellChange = (studentId: string, categoryId: string, valueStr: string) => {
    const parsed = parseFloat(valueStr.replace(/[^0-9.]/g, '')) || 0;
    setStudentFeeAmount(studentId, categoryId, parsed);
  };

  // Create new custom fee category column
  const handleCreateNewColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) {
      notify('Please enter a column title.', 'warning');
      return;
    }
    const defaultAmount = parseFloat(newColAmount) || 0;
    addFeeCategory({
      name: newColName.trim(),
      defaultAmount,
      isCustom: true,
      description: 'Custom fee column added from live spreadsheet table',
    });
    setShowAddColModal(false);
    setNewColName('');
  };

  // Excel / CSV export handler
  const handleExportXLSX = () => {
    const rows = filteredStudents.map((st) => {
      const summary = getStudentFinancialSummary(st.id, activeSession, activeTerm);
      const rowData: Record<string, any> = {
        'Student ID': st.id,
        'Student Name': st.fullName,
        Class: st.className,
        Section: st.section,
      };

      activeFeeColumns.forEach((fc) => {
        rowData[fc.name] = getStudentFeeValue(st.id, fc.id);
      });

      rowData['Total Expected (NGN)'] = summary.totalExpected;
      rowData['Total Paid (NGN)'] = summary.totalPaid;
      rowData['Outstanding (NGN)'] = summary.outstanding > 0 ? summary.outstanding : 0;
      rowData['Credit/Overpayment (NGN)'] = summary.outstanding < 0 ? Math.abs(summary.outstanding) : 0;
      rowData['Status'] = summary.status;

      return rowData;
    });

    exportToExcel(
      `FLO_Famous_Fee_Spreadsheet_${activeSession.replace('/', '-')}_${activeTerm.replace(/\s+/g, '')}`,
      'FeeSpreadsheet',
      rows
    );
  };

  const handleExportCSV = () => {
    const rows = filteredStudents.map((st) => {
      const summary = getStudentFinancialSummary(st.id, activeSession, activeTerm);
      const rowData: Record<string, any> = {
        'Student ID': st.id,
        'Student Name': st.fullName,
        Class: st.className,
      };

      activeFeeColumns.forEach((fc) => {
        rowData[fc.name] = getStudentFeeValue(st.id, fc.id);
      });

      rowData['Total Expected'] = summary.totalExpected;
      rowData['Total Paid'] = summary.totalPaid;
      rowData['Balance'] = summary.outstanding;
      rowData['Status'] = summary.status;

      return rowData;
    });

    exportToCSV(`FLO_Fee_Table_${Date.now()}`, rows);
  };

  // Column totals calculation
  const columnTotals = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    activeFeeColumns.forEach((c) => {
      categoryTotals[c.id] = 0;
    });

    let grandExpected = 0;
    let grandPaid = 0;
    let grandOutstanding = 0;

    filteredStudents.forEach((st) => {
      const summary = getStudentFinancialSummary(st.id, activeSession, activeTerm);
      grandExpected += summary.totalExpected;
      grandPaid += summary.totalPaid;
      if (summary.outstanding > 0) {
        grandOutstanding += summary.outstanding;
      }

      activeFeeColumns.forEach((fc) => {
        categoryTotals[fc.id] += getStudentFeeValue(st.id, fc.id);
      });
    });

    return {
      categoryTotals,
      grandExpected,
      grandPaid,
      grandOutstanding,
    };
  }, [filteredStudents, activeFeeColumns, feeAssignments, activeSession, activeTerm]);

  return (
    <div id="excel-fee-table-container" className="space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Excel-Style Live Fee Table
              </h2>
              <p className="text-xs text-slate-500">
                Direct spreadsheet editing with real-time recalculation of expected fees, payments, and balances.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasPermission('manageFees') && (
            <button
              id="btn-add-fee-column"
              onClick={() => setShowAddColModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Add Fee Column</span>
            </button>
          )}

          <button
            id="btn-export-excel-table"
            onClick={handleExportXLSX}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel (XLSX)</span>
          </button>

          <button
            id="btn-export-csv-table"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Live Info Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 font-medium">Section:</span>
            <select
              id="filter-excel-section"
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedClassId('ALL');
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Sections</option>
              <option value="PRIMARY">Primary & Nursery</option>
              <option value="JUNIOR_SECONDARY">Junior Secondary (JSS)</option>
              <option value="SENIOR_SECONDARY">Senior Secondary (SS)</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 font-medium">Class:</span>
            <select
              id="filter-excel-class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {classes
                .filter((c) => selectedSection === 'ALL' || c.section === selectedSection)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="filter-excel-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student in table..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-emerald-600 w-48 sm:w-56"
            />
          </div>
        </div>

        {/* Live Calculation Reminder */}
        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin-reverse" />
          <span>Live Formulas Active: Recalculates immediately on input</span>
        </div>
      </div>

      {/* Spreadsheet Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-left text-xs border-collapse font-sans">
            {/* Header Row */}
            <thead className="sticky top-0 z-20 bg-emerald-950 text-white select-none shadow-xs">
              <tr className="divide-x divide-emerald-800/60">
                <th className="p-3 font-bold sticky left-0 z-30 bg-emerald-950 min-w-[110px]">
                  Student ID
                </th>
                <th className="p-3 font-bold sticky left-[110px] z-30 bg-emerald-950 min-w-[180px]">
                  Student Name
                </th>
                <th className="p-3 font-bold min-w-[100px]">Class</th>

                {/* Dynamic Fee Categories Columns */}
                {activeFeeColumns.map((fc) => (
                  <th
                    key={fc.id}
                    className="p-3 font-bold min-w-[125px] text-right bg-emerald-900/60 text-emerald-100"
                    title={fc.description}
                  >
                    <div>{fc.name}</div>
                    <div className="text-[10px] font-normal text-emerald-300">₦ (NGN)</div>
                  </th>
                ))}

                {/* Formula Output Columns */}
                <th className="p-3 font-extrabold min-w-[130px] text-right bg-emerald-900 text-amber-300">
                  Total Expected
                </th>
                <th className="p-3 font-extrabold min-w-[120px] text-right bg-emerald-900 text-emerald-300">
                  Total Paid
                </th>
                <th className="p-3 font-extrabold min-w-[130px] text-right bg-emerald-900 text-white">
                  Balance / Credit
                </th>
                <th className="p-3 font-bold min-w-[110px] text-center bg-emerald-950">
                  Status
                </th>
                <th className="p-3 font-bold min-w-[90px] text-center bg-emerald-950">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeFeeColumns.length + 8}
                    className="text-center py-12 text-slate-400 font-medium"
                  >
                    No matching students found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const summary = getStudentFinancialSummary(st.id, activeSession, activeTerm);
                  const isOverpaid = summary.outstanding < 0;

                  return (
                    <tr
                      key={st.id}
                      className={`divide-x divide-slate-100 hover:bg-emerald-50/40 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      {/* Sticky Student ID */}
                      <td className="p-2.5 font-mono text-[11px] font-bold text-slate-700 sticky left-0 z-10 bg-inherit whitespace-nowrap">
                        {st.id}
                      </td>

                      {/* Sticky Student Name */}
                      <td className="p-2.5 font-medium text-slate-900 sticky left-[110px] z-10 bg-inherit whitespace-nowrap">
                        <button
                          onClick={() => openStudentProfile(st.id)}
                          className="text-left font-semibold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1.5"
                        >
                          <span>{st.fullName}</span>
                        </button>
                      </td>

                      {/* Class */}
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {st.className}
                        </span>
                      </td>

                      {/* Editable Fee Category Cells */}
                      {activeFeeColumns.map((fc) => {
                        const cellVal = getStudentFeeValue(st.id, fc.id);
                        return (
                          <td key={fc.id} className="p-1 text-right">
                            <input
                              type="number"
                              min="0"
                              step="500"
                              defaultValue={cellVal || ''}
                              key={`${st.id}-${fc.id}-${cellVal}`}
                              onBlur={(e) => handleCellChange(st.id, fc.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                              className="w-full text-right py-1.5 px-2 font-mono text-xs rounded-lg border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 transition-all"
                              placeholder="0"
                              title="Click to edit fee value directly"
                            />
                          </td>
                        );
                      })}

                      {/* LIVE CALCULATED: Total Expected */}
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900 bg-amber-50/40 whitespace-nowrap">
                        {formatNaira(summary.totalExpected)}
                      </td>

                      {/* LIVE CALCULATED: Total Paid */}
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700 bg-emerald-50/40 whitespace-nowrap">
                        {formatNaira(summary.totalPaid)}
                      </td>

                      {/* LIVE CALCULATED: Balance or Credit */}
                      <td className="p-2.5 text-right font-mono font-bold whitespace-nowrap">
                        {isOverpaid ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
                            CREDIT: {formatNaira(Math.abs(summary.outstanding))}
                          </span>
                        ) : summary.outstanding === 0 ? (
                          <span className="text-emerald-600">₦0</span>
                        ) : (
                          <span className="text-rose-600 font-bold">{formatNaira(summary.outstanding)}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-2 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            summary.status === 'FULLY PAID'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : summary.status === 'PARTIALLY PAID'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : summary.status === 'OVERPAID'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {summary.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`btn-table-pay-${st.id}`}
                            onClick={() => openRecordPayment(st.id)}
                            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                            title="Record Payment for Student"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-table-view-${st.id}`}
                            onClick={() => openStudentProfile(st.id)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="View Student Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Bottom Totals Row (SUM Formulated) */}
            <tfoot className="sticky bottom-0 z-20 bg-emerald-950 text-white font-mono text-xs shadow-md">
              <tr className="divide-x divide-emerald-800">
                <td className="p-3 font-bold sticky left-0 z-30 bg-emerald-950">
                  TOTALS
                </td>
                <td className="p-3 font-bold sticky left-[110px] z-30 bg-emerald-950">
                  {filteredStudents.length} Students
                </td>
                <td className="p-3 text-emerald-300">-</td>

                {/* Subtotals per category */}
                {activeFeeColumns.map((fc) => (
                  <td key={fc.id} className="p-3 text-right font-bold text-emerald-200">
                    {formatNaira(columnTotals.categoryTotals[fc.id] || 0)}
                  </td>
                ))}

                {/* Grand Total Expected */}
                <td className="p-3 text-right font-extrabold text-amber-300 bg-emerald-900">
                  {formatNaira(columnTotals.grandExpected)}
                </td>

                {/* Grand Total Paid */}
                <td className="p-3 text-right font-extrabold text-emerald-300 bg-emerald-900">
                  {formatNaira(columnTotals.grandPaid)}
                </td>

                {/* Grand Total Outstanding */}
                <td className="p-3 text-right font-extrabold text-white bg-emerald-900">
                  {formatNaira(columnTotals.grandOutstanding)}
                </td>

                <td className="p-3 text-center text-emerald-300">-</td>
                <td className="p-3 text-center text-emerald-300">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Custom Fee Column Modal */}
      {showAddColModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-display">
              Add Custom Fee Column to Spreadsheet
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add custom payment charges like "Computer Lab Fee", "Excursion", "Special Lesson", "Graduation Fee", etc.
            </p>

            <form onSubmit={handleCreateNewColumn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Column / Fee Name *
                </label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Computer Lab Fee, Excursion, Special Lesson"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Amount (₦ NGN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={newColAmount}
                  onChange={(e) => setNewColAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddColModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  Add to Spreadsheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
