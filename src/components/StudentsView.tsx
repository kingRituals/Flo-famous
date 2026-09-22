import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  PlusCircle,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  CreditCard,
  Edit2,
  Trash2,
  Eraser,
  User,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, SchoolSection, StudentStatus } from '../types';
import { formatNaira, formatDate } from '../utils/formatters';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';
import { ClearOrDeleteStudentModal } from './ClearOrDeleteStudentModal';

interface StudentsViewProps {
  onOpenAddModal: () => void;
  onOpenBulkImport: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onOpenAddModal,
  onOpenBulkImport,
}) => {
  const {
    students,
    classes,
    activeSession,
    activeTerm,
    getStudentFinancialSummary,
    openStudentProfile,
    openRecordPayment,
    updateStudent,
    deleteStudent,
    clearStudentName,
    hasPermission,
    notify,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      if (selectedSection !== 'ALL' && st.section !== selectedSection) return false;
      if (selectedClassId !== 'ALL' && st.classId !== selectedClassId) return false;
      if (selectedStatus !== 'ALL' && st.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          st.fullName.toLowerCase().includes(q) ||
          st.id.toLowerCase().includes(q) ||
          st.parentName.toLowerCase().includes(q) ||
          st.parentPhone.includes(q) ||
          st.className.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, selectedSection, selectedClassId, selectedStatus, searchQuery]);

  const handleExportExcel = () => {
    const data = filteredStudents.map((st) => {
      const fin = getStudentFinancialSummary(st.id, activeSession, activeTerm);
      return {
        'Student ID': st.id,
        'Full Name': st.fullName,
        Class: st.className,
        Section: st.section,
        Gender: st.gender,
        'Parent Name': st.parentName,
        'Parent Phone': st.parentPhone,
        'Total Expected (NGN)': fin.totalExpected,
        'Total Paid (NGN)': fin.totalPaid,
        'Outstanding (NGN)': fin.outstanding,
        'Payment Status': fin.status,
        'Enrollment Status': st.status,
      };
    });

    exportToExcel('FLO_Famous_Students_Directory', 'Students', data);
  };

  const handleExportCSV = () => {
    const data = filteredStudents.map((st) => {
      const fin = getStudentFinancialSummary(st.id, activeSession, activeTerm);
      return {
        'Student ID': st.id,
        'Full Name': st.fullName,
        Class: st.className,
        'Parent Phone': st.parentPhone,
        Expected: fin.totalExpected,
        Paid: fin.totalPaid,
        Outstanding: fin.outstanding,
        Status: fin.status,
      };
    });
    exportToCSV('FLO_Students_Directory', data);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent.id, editingStudent);
    setEditingStudent(null);
  };

  return (
    <div id="students-view-container" className="space-y-4">
      {/* Top Banner & Control Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Student Administration Directory
              </h2>
              <p className="text-xs text-slate-500">
                Manage registered students across Nursery, Primary, JSS, and SS sections.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-students-bulk-import"
            onClick={onOpenBulkImport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Bulk Import CSV/Excel</span>
          </button>

          <button
            id="btn-students-export-excel"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export Excel</span>
          </button>

          {hasPermission('editStudent') && (
            <button
              id="btn-students-add-new"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-Filters & Search Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 font-medium">Section:</span>
            <select
              id="filter-student-section"
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
              id="filter-student-class"
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

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              id="filter-student-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Suspended">Suspended</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="filter-student-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, ID, parent, phone..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-emerald-600 w-56 sm:w-64"
            />
          </div>
        </div>

        <div className="text-slate-500 text-xs font-medium">
          Showing <strong>{filteredStudents.length}</strong> of {students.length} students
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="p-3">Student ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Parent / Phone</th>
                <th className="p-3 text-right">Expected</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3 text-center">Payment Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400 font-medium">
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const fin = getStudentFinancialSummary(st.id, activeSession, activeTerm);
                  const isOverpaid = fin.outstanding < 0;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {st.id}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => openStudentProfile(st.id)}
                          className="font-bold text-slate-900 hover:text-emerald-700 hover:underline text-left flex items-center gap-2"
                        >
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {st.fullName.charAt(0)}
                          </div>
                          <span>{st.fullName}</span>
                        </button>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium">
                          {st.className}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{st.gender}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="text-slate-900 font-medium">{st.parentName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{st.parentPhone}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {formatNaira(fin.totalExpected)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {formatNaira(fin.totalPaid)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold whitespace-nowrap">
                        {isOverpaid ? (
                          <span className="text-blue-700 font-bold">
                            CREDIT: {formatNaira(Math.abs(fin.outstanding))}
                          </span>
                        ) : fin.outstanding === 0 ? (
                          <span className="text-emerald-600">₦0</span>
                        ) : (
                          <span className="text-rose-600">{formatNaira(fin.outstanding)}</span>
                        )}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            fin.status === 'FULLY PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fin.status === 'PARTIALLY PAID'
                              ? 'bg-amber-100 text-amber-800'
                              : fin.status === 'OVERPAID'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {fin.status}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`btn-student-pay-${st.id}`}
                            onClick={() => openRecordPayment(st.id)}
                            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-student-view-${st.id}`}
                            onClick={() => openStudentProfile(st.id)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="View Full Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {hasPermission('editStudent') && (
                            <button
                              id={`btn-student-edit-${st.id}`}
                              onClick={() => setEditingStudent(st)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                              title="Edit Student Information"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasPermission('deleteStudent') && (
                            <button
                              id={`btn-student-clear-delete-${st.id}`}
                              onClick={() => setSelectedStudentForAction(st)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Clear Name or Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-display">
              Edit Student: {editingStudent.fullName}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">{editingStudent.id}</p>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-slate-700">Student Identity Details</span>
                <button
                  type="button"
                  id="btn-edit-clear-name-inputs"
                  onClick={() => {
                    setEditingStudent((prev) =>
                      prev ? { ...prev, firstName: '', middleName: '', lastName: '' } : null
                    );
                    notify('Name fields cleared. You can type a new name below.', 'info');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-colors"
                  title="Clear first, middle and last name inputs"
                >
                  <Eraser className="w-3.5 h-3.5 text-amber-700" />
                  <span>Clear Name Inputs</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.firstName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.lastName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={editingStudent.classId}
                    onChange={(e) => {
                      const c = classes.find((cl) => cl.id === e.target.value);
                      if (c) {
                        setEditingStudent({
                          ...editingStudent,
                          classId: c.id,
                          className: c.name,
                          section: c.section,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as StudentStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="Active">Active</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Withdrawn">Withdrawn</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Phone</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.parentPhone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editingStudent.address}
                  onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={editingStudent.notes || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  id="btn-edit-open-clear-delete"
                  onClick={() => {
                    const target = editingStudent;
                    setEditingStudent(null);
                    setSelectedStudentForAction(target);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Name / Delete Student</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear or Delete Student Modal */}
      {selectedStudentForAction && (
        <ClearOrDeleteStudentModal
          student={selectedStudentForAction}
          onClose={() => setSelectedStudentForAction(null)}
        />
      )}
    </div>
  );
};
