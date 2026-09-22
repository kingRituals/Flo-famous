import React, { useState } from 'react';
import {
  X,
  Trash2,
  Eraser,
  AlertTriangle,
  User,
  GraduationCap,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { formatNaira } from '../utils/formatters';

interface ClearOrDeleteStudentModalProps {
  student: Student;
  onClose: () => void;
}

export const ClearOrDeleteStudentModal: React.FC<ClearOrDeleteStudentModalProps> = ({
  student,
  onClose,
}) => {
  const {
    deleteStudent,
    clearStudentName,
    updateStudent,
    getStudentFinancialSummary,
    activeSession,
    activeTerm,
    hasPermission,
    notify,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'clear' | 'delete'>('clear');
  const [replacementFirstName, setReplacementFirstName] = useState('');
  const [replacementLastName, setReplacementLastName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fin = getStudentFinancialSummary(student.id, activeSession, activeTerm);

  const handleClearNameOnly = () => {
    clearStudentName(student.id);
    onClose();
  };

  const handleClearAndReplaceName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementFirstName.trim() || !replacementLastName.trim()) {
      notify('Please provide both first and last name for the student.', 'warning');
      return;
    }
    updateStudent(student.id, {
      firstName: replacementFirstName.trim(),
      lastName: replacementLastName.trim(),
      middleName: '',
      fullName: `${replacementFirstName.trim()} ${replacementLastName.trim()}`,
    });
    notify(`Student name updated to ${replacementFirstName.trim()} ${replacementLastName.trim()}`, 'success');
    onClose();
  };

  const handleDeleteStudentRecord = () => {
    setIsDeleting(true);
    deleteStudent(student.id);
    onClose();
  };

  return (
    <div
      id="clear-or-delete-student-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="clear-or-delete-student-modal"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150 text-xs"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display">
                Clear Name or Delete Student
              </h3>
              <p className="text-[11px] text-slate-300">
                Manage student identity or remove record from the registry
              </p>
            </div>
          </div>
          <button
            id="btn-close-clear-delete-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Target Student Identity Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-200">
                {student.fullName ? student.fullName.charAt(0) : '?'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {student.fullName || '[Name Cleared]'}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span>{student.id}</span>
                  <span>•</span>
                  <span className="font-sans font-medium text-slate-700">{student.className}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  fin.status === 'FULLY PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : fin.status === 'PARTIALLY PAID'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {fin.status}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Paid: {formatNaira(fin.totalPaid)}
              </p>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              id="tab-action-clear-name"
              type="button"
              onClick={() => setActiveTab('clear')}
              className={`pb-2 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 'clear'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eraser className="w-3.5 h-3.5 text-amber-600" />
              <span>Clear / Reset Student Name</span>
            </button>
            <button
              id="tab-action-delete-student"
              type="button"
              onClick={() => setActiveTab('delete')}
              className={`pb-2 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 'delete'
                  ? 'border-rose-600 text-rose-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete Student Record</span>
            </button>
          </div>

          {/* TAB 1: CLEAR NAME */}
          {activeTab === 'clear' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 leading-relaxed text-[11px]">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <Eraser className="w-3.5 h-3.5 text-amber-700" />
                  What happens when you clear the name?
                </p>
                <p className="text-amber-800/90">
                  Clearing the student's name sets the name fields to blank so you can assign or
                  correct the pupil's name. The student ID (<strong>{student.id}</strong>), enrolled
                  class, and financial payment records are safely kept intact.
                </p>
              </div>

              {/* Quick Choice: Just Wipe Name */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">One-Click Clear Name</p>
                  <p className="text-[11px] text-slate-500">
                    Immediately reset name to blank / unassigned
                  </p>
                </div>
                <button
                  id="btn-confirm-clear-student-name"
                  type="button"
                  onClick={handleClearNameOnly}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Clear Name Now</span>
                </button>
              </div>

              {/* Or Replace with New Name */}
              <form onSubmit={handleClearAndReplaceName} className="p-3 bg-white border border-slate-200 rounded-xl space-y-3">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  Or Enter Replacement Name Directly:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      New First Name *
                    </label>
                    <input
                      id="input-replace-first-name"
                      type="text"
                      placeholder="e.g. Chukwudi"
                      value={replacementFirstName}
                      onChange={(e) => setReplacementFirstName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      New Last Name *
                    </label>
                    <input
                      id="input-replace-last-name"
                      type="text"
                      placeholder="e.g. Okonkwo"
                      value={replacementLastName}
                      onChange={(e) => setReplacementLastName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <button
                  id="btn-save-replacement-name"
                  type="submit"
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply New Student Name</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: DELETE STUDENT RECORD */}
          {activeTab === 'delete' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 leading-relaxed text-[11px]">
                <p className="font-semibold mb-1 flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Warning: Irreversible Action
                </p>
                <p className="text-rose-800/90">
                  Deleting student <strong>{student.fullName} ({student.id})</strong> will completely remove
                  their record from the school portal roster, delete their active term fee assignments,
                  and unlink them from parent accounts.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Class:</span>
                  <span className="font-bold text-slate-900">{student.className}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Section:</span>
                  <span className="font-bold text-slate-900">{student.section}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Recorded Payments:</span>
                  <span className="font-bold text-emerald-700">{formatNaira(fin.totalPaid)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  id="btn-cancel-delete"
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete-student"
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteStudentRecord}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Permanently Delete Student'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
