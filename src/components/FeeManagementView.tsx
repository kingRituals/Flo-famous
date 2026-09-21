import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  CheckCircle,
  Trash2,
  Edit2,
  RefreshCw,
  School,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FeeCategory, SchoolSection } from '../types';
import { formatNaira } from '../utils/formatters';

export const FeeManagementView: React.FC = () => {
  const {
    feeCategories,
    addFeeCategory,
    updateFeeCategory,
    deleteFeeCategory,
    classes,
    students,
    activeSession,
    activeTerm,
    setStudentFeeAmount,
    hasPermission,
    notify,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSections, setNewCatSections] = useState<SchoolSection[]>([
    'PRIMARY',
    'JUNIOR_SECONDARY',
    'SENIOR_SECONDARY',
  ]);

  // Bulk Apply Fee state
  const [selectedFeeCategory, setSelectedFeeCategory] = useState<string>(
    feeCategories[0]?.id || ''
  );
  const [targetClassId, setTargetClassId] = useState<string>('ALL');
  const [bulkAmount, setBulkAmount] = useState<string>('20000');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      notify('Please specify a fee category name.', 'warning');
      return;
    }

    addFeeCategory({
      name: newCatName.trim(),
      defaultAmount: parseFloat(newCatAmount) || 0,
      description: newCatDesc.trim() || undefined,
      applicableSection: 'ALL',
      applicableSections: newCatSections,
      isCustom: true,
    });

    setShowAddModal(false);
    setNewCatName('');
    setNewCatAmount('');
    setNewCatDesc('');
  };

  const handleApplyToClass = () => {
    const category = feeCategories.find((fc) => fc.id === selectedFeeCategory);
    if (!category) return;
    const amountNum = parseFloat(bulkAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      notify('Please enter a valid amount.', 'warning');
      return;
    }

    const targetStudents = students.filter((s) => {
      if (s.status !== 'Active') return false;
      if (targetClassId !== 'ALL' && s.classId !== targetClassId) return false;
      return true;
    });

    targetStudents.forEach((st) => {
      setStudentFeeAmount(st.id, category.id, amountNum);
    });

    notify(
      `Successfully applied ${category.name} (${formatNaira(amountNum)}) to ${targetStudents.length} students for ${activeSession} ${activeTerm}!`,
      'success'
    );
  };

  return (
    <div id="fee-management-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Fee Categories & Billing Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Configure standard tuition, books, uniform, and custom charges per class and academic section.
              </p>
            </div>
          </div>
        </div>

        {hasPermission('manageFees') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Fee Category</span>
          </button>
        )}
      </div>

      {/* Bulk Fee Assignment Tool */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <Layers className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Batch Assign Fee to Class / Section ({activeSession} - {activeTerm})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Fee Category
            </label>
            <select
              value={selectedFeeCategory}
              onChange={(e) => {
                setSelectedFeeCategory(e.target.value);
                const found = feeCategories.find((fc) => fc.id === e.target.value);
                if (found) setBulkAmount(found.defaultAmount.toString());
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              {feeCategories.map((fc) => (
                <option key={fc.id} value={fc.id}>
                  {fc.name} (Default: {formatNaira(fc.defaultAmount)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target Class / Level
            </label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">Entire School (All Enrolled Classes)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assigned Amount (₦ NGN)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={bulkAmount}
              onChange={(e) => setBulkAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            One-click update will automatically recalculate every student's Total Expected fee.
          </span>
          <button
            onClick={handleApplyToClass}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Apply Fee to Target Students</span>
          </button>
        </div>
      </div>

      {/* Fee Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feeCategories.map((fc) => (
          <div
            key={fc.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  {fc.name}
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                  {fc.isCustom ? 'Custom Charge' : 'Standard Fee'}
                </span>
              </div>

              <div className="text-xl font-black font-mono text-emerald-800 mb-2">
                {formatNaira(fc.defaultAmount)}
              </div>

              <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                {fc.description || 'Standard educational fee item assigned to pupils.'}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {(fc.applicableSections || (fc.applicableSection ? [fc.applicableSection] : ['ALL'])).map((sec) => (
                  <span
                    key={sec}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Active Category</span>
              {fc.isCustom && hasPermission('manageFees') && (
                <button
                  onClick={() => {
                    if (confirm(`Delete fee category "${fc.name}"?`)) {
                      deleteFeeCategory(fc.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  title="Delete Custom Fee Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Fee Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-display">
              Create New Fee Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add payment categories such as WAEC Fee, Excursion, Computer Lab, or Graduation.
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. WAEC Registration, ICT Laboratory"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Benchmark Amount (₦ NGN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={newCatAmount}
                  onChange={(e) => setNewCatAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description / Remarks
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="e.g. Mandatory external examination levy"
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
