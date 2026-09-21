import React, { useState } from 'react';
import {
  School,
  Users,
  PlusCircle,
  Eye,
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira } from '../utils/formatters';
import { exportToExcel } from '../utils/exportUtils';
import { SchoolSection } from '../types';

interface ClassesViewProps {
  onSelectClassInTable: (classId: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ onSelectClassInTable }) => {
  const {
    classes,
    students,
    addClass,
    activeSession,
    activeTerm,
    getStudentFinancialSummary,
    hasPermission,
    notify,
  } = useApp();

  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newSection, setNewSection] = useState<SchoolSection>('PRIMARY');
  const [newCapacity, setNewCapacity] = useState('35');
  const [newClassTeacher, setNewClassTeacher] = useState('');

  // Class statistics computation
  const classCardsData = classes.map((cls) => {
    const classStudents = students.filter(
      (s) => s.classId === cls.id && s.status === 'Active'
    );

    let totalExpected = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    classStudents.forEach((st) => {
      const fin = getStudentFinancialSummary(st.id, activeSession, activeTerm);
      totalExpected += fin.totalExpected;
      totalPaid += fin.totalPaid;
      if (fin.outstanding > 0) totalOutstanding += fin.outstanding;
    });

    const collectionRate =
      totalExpected > 0 ? Math.min(100, Math.round((totalPaid / totalExpected) * 100)) : 0;

    return {
      cls,
      studentCount: classStudents.length,
      totalExpected,
      totalPaid,
      totalOutstanding,
      collectionRate,
    };
  });

  const filteredClasses = classCardsData.filter((item) => {
    if (selectedSection !== 'ALL' && item.cls.section !== selectedSection) return false;
    return true;
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      notify('Please enter a class name.', 'warning');
      return;
    }

    addClass({
      name: newClassName.trim(),
      section: newSection,
      order: classes.length + 1,
      capacity: parseInt(newCapacity) || 35,
      classTeacher: newClassTeacher.trim() || undefined,
    });

    setShowAddModal(false);
    setNewClassName('');
    setNewClassTeacher('');
  };

  const handleExportClassesSummary = () => {
    const data = classCardsData.map((item) => ({
      Class: item.cls.name,
      Section: item.cls.section,
      'Class Teacher': item.cls.classTeacher || 'Unassigned',
      'Enrolled Students': item.studentCount,
      'Class Capacity': item.cls.capacity,
      'Total Expected (NGN)': item.totalExpected,
      'Total Paid (NGN)': item.totalPaid,
      'Total Outstanding (NGN)': item.totalOutstanding,
      'Collection Rate': `${item.collectionRate}%`,
    }));

    exportToExcel('FLO_Famous_Classes_Financial_Summary', 'Classes', data);
  };

  return (
    <div id="classes-view-container" className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Classes & Sections Administration
              </h2>
              <p className="text-xs text-slate-500">
                Enrollment statistics, class teachers, and live fee collections by class level.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportClassesSummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export Classes XLSX</span>
          </button>

          {hasPermission('manageClasses') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Class</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setSelectedSection('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            selectedSection === 'ALL'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Classes ({classes.length})
        </button>
        <button
          onClick={() => setSelectedSection('PRIMARY')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            selectedSection === 'PRIMARY'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Primary & Nursery
        </button>
        <button
          onClick={() => setSelectedSection('JUNIOR_SECONDARY')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            selectedSection === 'JUNIOR_SECONDARY'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Junior Secondary (JSS)
        </button>
        <button
          onClick={() => setSelectedSection('SENIOR_SECONDARY')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            selectedSection === 'SENIOR_SECONDARY'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Senior Secondary (SS)
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map(({ cls, studentCount, totalExpected, totalPaid, totalOutstanding, collectionRate }) => (
          <div
            key={cls.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-600/40 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {cls.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {cls.section.replace('_', ' ')}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                  {studentCount} / {cls.capacity} Pupils
                </span>
              </div>

              {/* Class Teacher */}
              <div className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400">Class Teacher:</span>
                <span className="font-semibold text-slate-800">{cls.classTeacher || 'Unassigned'}</span>
              </div>

              {/* Financial Metrics */}
              <div className="space-y-2 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Expected:</span>
                  <span className="font-mono font-bold text-slate-900">{formatNaira(totalExpected)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Total Paid:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatNaira(totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-600">Total Outstanding:</span>
                  <span className="font-mono font-bold text-rose-600">{formatNaira(totalOutstanding)}</span>
                </div>

                {/* Progress bar */}
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Collection Progress</span>
                    <span className="font-bold text-emerald-700">{collectionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${collectionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => onSelectClassInTable(cls.id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>View in Spreadsheet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-display">
              Add New Class to School
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a new class section in Nursery, Primary, JSS, or SS.
            </p>

            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Primary 6 Gold, JSS 1 Alpha"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Section *
                </label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value as SchoolSection)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="PRIMARY">Primary & Nursery</option>
                  <option value="JUNIOR_SECONDARY">Junior Secondary (JSS)</option>
                  <option value="SENIOR_SECONDARY">Senior Secondary (SS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Max Student Capacity
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Class Teacher
                </label>
                <input
                  type="text"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  placeholder="e.g. Mr. S. Okoli"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
