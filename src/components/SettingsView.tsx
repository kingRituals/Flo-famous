import React, { useState, useEffect } from 'react';
import {
  Settings,
  School,
  Building,
  CreditCard,
  CheckCircle2,
  Save,
  Phone,
  Mail,
  Globe,
  MapPin,
  GraduationCap,
  Calendar,
  Coins,
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AcademicSession } from '../types';
import { formatNaira, formatNumber } from '../utils/formatters';

export const SettingsView: React.FC = () => {
  const {
    schoolSettings,
    updateSchoolSettings,
    classes,
    sessions,
    activeSession,
    activeTerm,
    addSession,
    students,
    classFeePricings,
    getClassFeePrice,
    setClassFeePrice,
    batchSetClassFeePrices,
    notify,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'fees' | 'general' | 'sessions'>('fees');

  // General Settings Form
  const [formData, setFormData] = useState({ ...schoolSettings });

  // Class Fee Pricing State
  const [targetSession, setTargetSession] = useState<string>(activeSession);
  const [targetTerm, setTargetTerm] = useState<string>('ALL');
  const [filterSection, setFilterSection] = useState<string>('ALL');
  const [syncWithEnrolled, setSyncWithEnrolled] = useState<boolean>(true);

  // Local state for class fee prices inputs (classId -> price string)
  const [feeInputs, setFeeInputs] = useState<{ [classId: string]: string }>({});
  const [savedClassIds, setSavedClassIds] = useState<{ [classId: string]: boolean }>({});

  // Section batch preset states
  const [nurseryPreset, setNurseryPreset] = useState<string>('120000');
  const [primaryPreset, setPrimaryPreset] = useState<string>('145000');
  const [jssPreset, setJssPreset] = useState<string>('175000');
  const [sssPreset, setSssPreset] = useState<string>('195000');

  // New session input
  const [showNewSessionInput, setShowNewSessionInput] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  // Synchronize inputs when targetSession, targetTerm, or classFeePricings change
  useEffect(() => {
    const initialMap: { [classId: string]: string } = {};
    classes.forEach((c) => {
      const price = getClassFeePrice(c.id, targetSession, targetTerm);
      initialMap[c.id] = price.toString();
    });
    setFeeInputs(initialMap);
  }, [classes, targetSession, targetTerm, classFeePricings]);

  // Handle general settings submission
  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolSettings(formData);
  };

  // Handle saving an individual class fee price
  const handleSaveIndividualClassPrice = (classId: string) => {
    const rawVal = feeInputs[classId];
    const numericAmount = parseInt(rawVal, 10);
    if (isNaN(numericAmount) || numericAmount < 0) {
      notify('Please enter a valid positive number for school fees.', 'warning');
      return;
    }
    setClassFeePrice(classId, targetSession, numericAmount, targetTerm, syncWithEnrolled);
    setSavedClassIds((prev) => ({ ...prev, [classId]: true }));
    setTimeout(() => {
      setSavedClassIds((prev) => ({ ...prev, [classId]: false }));
    }, 2500);
  };

  // Quick adjust (+/-)
  const handleQuickAdjust = (classId: string, delta: number) => {
    const current = parseInt(feeInputs[classId] || '0', 10) || 0;
    const nextVal = Math.max(0, current + delta);
    setFeeInputs((prev) => ({ ...prev, [classId]: nextVal.toString() }));
  };

  // Batch save all displayed classes
  const handleSaveAllClassPrices = () => {
    const pricesToSave: { classId: string; amount: number; term?: string }[] = [];
    classes.forEach((c) => {
      const rawVal = feeInputs[c.id];
      const numericAmount = parseInt(rawVal, 10);
      if (!isNaN(numericAmount) && numericAmount >= 0) {
        pricesToSave.push({
          classId: c.id,
          amount: numericAmount,
          term: targetTerm,
        });
      }
    });

    if (pricesToSave.length === 0) {
      notify('No valid fee amounts found to save.', 'warning');
      return;
    }

    batchSetClassFeePrices(targetSession, pricesToSave, syncWithEnrolled);
  };

  // Apply section-wide presets to input fields
  const handleApplySectionPresets = () => {
    const updated = { ...feeInputs };
    classes.forEach((c) => {
      if (c.name.startsWith('Nursery')) {
        const val = parseInt(nurseryPreset, 10);
        if (!isNaN(val)) updated[c.id] = val.toString();
      } else if (c.section === 'PRIMARY') {
        const val = parseInt(primaryPreset, 10);
        if (!isNaN(val)) updated[c.id] = val.toString();
      } else if (c.section === 'JUNIOR_SECONDARY') {
        const val = parseInt(jssPreset, 10);
        if (!isNaN(val)) updated[c.id] = val.toString();
      } else if (c.section === 'SENIOR_SECONDARY') {
        const val = parseInt(sssPreset, 10);
        if (!isNaN(val)) updated[c.id] = val.toString();
      }
    });
    setFeeInputs(updated);
    notify('Applied standard presets across all class inputs. Click "Save All Class Prices" to confirm.', 'info');
  };

  // Handle adding a new academic session
  const handleCreateNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    addSession(newSessionName.trim());
    setTargetSession(newSessionName.trim());
    setNewSessionName('');
    setShowNewSessionInput(false);
  };

  // Filter classes by section
  const displayedClasses = classes.filter((c) => {
    if (filterSection === 'ALL') return true;
    if (filterSection === 'NURSERY') return c.name.startsWith('Nursery');
    if (filterSection === 'PRIMARY') return c.section === 'PRIMARY' && !c.name.startsWith('Nursery');
    if (filterSection === 'JUNIOR_SECONDARY') return c.section === 'JUNIOR_SECONDARY';
    if (filterSection === 'SENIOR_SECONDARY') return c.section === 'SENIOR_SECONDARY';
    return true;
  });

  return (
    <div id="settings-view-container" className="space-y-6 max-w-5xl">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              School Settings & Bursary Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Manage school fees pricing per class/session, institution identity, and bank deposit accounts.
            </p>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            id="tab-settings-fees"
            onClick={() => setActiveTab('fees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'fees'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Class Fees Pricing</span>
          </button>
          <button
            id="tab-settings-general"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>School & Bank Details</span>
          </button>
          <button
            id="tab-settings-sessions"
            onClick={() => setActiveTab('sessions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sessions'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Academic Sessions</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CLASS SCHOOL FEES PRICING PER SESSION (USER FOCUS) */}
      {/* ========================================================= */}
      {activeTab === 'fees' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-700" />
                  <span>Manually Set School Fees Prices for Each Class</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set tuition amounts for each class and academic session. Newly enrolled students
                  and existing fee assignments will inherit these values.
                </p>
              </div>

              {/* Session and Term Selectors */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600">Session:</span>
                  <select
                    id="select-pricing-session"
                    value={targetSession}
                    onChange={(e) => setTargetSession(e.target.value)}
                    className="bg-transparent font-bold text-emerald-900 focus:outline-hidden cursor-pointer"
                  >
                    {sessions.map((s: AcademicSession) => (
                      <option key={s.id} value={s.id}>
                        {s.id} {s.id === activeSession ? '(Active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600">Term:</span>
                  <select
                    id="select-pricing-term"
                    value={targetTerm}
                    onChange={(e) => setTargetTerm(e.target.value)}
                    className="bg-transparent font-bold text-emerald-900 focus:outline-hidden cursor-pointer"
                  >
                    <option value="ALL">All Terms (Annual Default)</option>
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>

                <button
                  id="btn-open-new-session"
                  type="button"
                  onClick={() => setShowNewSessionInput(!showNewSessionInput)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-semibold flex items-center gap-1 transition-colors"
                  title="Add a new academic session"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Session</span>
                </button>
              </div>
            </div>

            {/* Optional New Session Creator Form */}
            {showNewSessionInput && (
              <form
                onSubmit={handleCreateNewSession}
                className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in duration-100 text-xs"
              >
                <div className="font-semibold text-emerald-950 shrink-0">Create Academic Session:</div>
                <input
                  type="text"
                  placeholder="e.g. 2027/2028"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold w-36"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg transition-colors"
                >
                  Add Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSessionInput(false)}
                  className="px-2 py-1.5 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Quick Presets by Section */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Quick Section Rate Presets (NGN ₦)</span>
                </span>
                <button
                  id="btn-apply-presets"
                  type="button"
                  onClick={handleApplySectionPresets}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Populate Presets Below</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                    Nursery / Early Years
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">₦</span>
                    <input
                      type="number"
                      value={nurseryPreset}
                      onChange={(e) => setNurseryPreset(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                    Primary Section
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">₦</span>
                    <input
                      type="number"
                      value={primaryPreset}
                      onChange={(e) => setPrimaryPreset(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                    Junior Secondary (JSS)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">₦</span>
                    <input
                      type="number"
                      value={jssPreset}
                      onChange={(e) => setJssPreset(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                    Senior Secondary (SSS)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">₦</span>
                    <input
                      type="number"
                      value={sssPreset}
                      onChange={(e) => setSssPreset(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Section Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Filter:</span>
                {(
                  [
                    { id: 'ALL', label: 'All Classes' },
                    { id: 'NURSERY', label: 'Nursery' },
                    { id: 'PRIMARY', label: 'Primary' },
                    { id: 'JUNIOR_SECONDARY', label: 'JSS' },
                    { id: 'SENIOR_SECONDARY', label: 'SSS' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    id={`btn-filter-class-${s.id}`}
                    type="button"
                    onClick={() => setFilterSection(s.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      filterSection === s.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Synchronize checkbox */}
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={syncWithEnrolled}
                  onChange={(e) => setSyncWithEnrolled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-[11px]">
                  Synchronize with currently enrolled students' fee records
                </span>
              </label>
            </div>
          </div>

          {/* Classes Fee Price Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3.5">Class Name</th>
                    <th className="p-3.5">Section</th>
                    <th className="p-3.5 text-center">Enrolled Pupils</th>
                    <th className="p-3.5 min-w-[220px]">
                      School Fees / Tuition Amount (NGN ₦)
                    </th>
                    <th className="p-3.5 text-center">Quick Adjust</th>
                    <th className="p-3.5 text-center min-w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedClasses.map((cls) => {
                    const studentCount = students.filter(
                      (s) => s.classId === cls.id && s.status === 'Active'
                    ).length;
                    const val = feeInputs[cls.id] || '0';
                    const numVal = parseInt(val, 10) || 0;
                    const isSaved = savedClassIds[cls.id];
                    const isNursery = cls.name.startsWith('Nursery');

                    return (
                      <tr
                        key={cls.id}
                        id={`row-class-fee-${cls.id}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-3.5 font-bold text-slate-900 font-display">
                          {cls.name}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isNursery
                                ? 'bg-amber-100 text-amber-800'
                                : cls.section === 'PRIMARY'
                                ? 'bg-blue-100 text-blue-800'
                                : cls.section === 'JUNIOR_SECONDARY'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isNursery ? 'NURSERY' : cls.section}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono">
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span>{studentCount}</span>
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="relative w-44">
                              <span className="absolute left-3 top-2 text-slate-400 font-bold">
                                ₦
                              </span>
                              <input
                                id={`input-class-fee-${cls.id}`}
                                type="number"
                                min="0"
                                step="1000"
                                value={val}
                                onChange={(e) =>
                                  setFeeInputs({
                                    ...feeInputs,
                                    [cls.id]: e.target.value,
                                  })
                                }
                                className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 shrink-0">
                              ({formatNaira(numVal)})
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-semibold">
                            <button
                              type="button"
                              onClick={() => handleQuickAdjust(cls.id, -5000)}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                              title="Decrease by ₦5,000"
                            >
                              -5k
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjust(cls.id, 5000)}
                              className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md transition-colors"
                              title="Increase by ₦5,000"
                            >
                              +5k
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjust(cls.id, 10000)}
                              className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-md transition-colors"
                              title="Increase by ₦10,000"
                            >
                              +10k
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            id={`btn-save-class-fee-${cls.id}`}
                            type="button"
                            onClick={() => handleSaveIndividualClassPrice(cls.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto ${
                              isSaved
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Bulk Save Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-600">
                Editing session: <strong className="text-slate-900 font-mono">{targetSession}</strong>
                {' • '}
                Term: <strong className="text-slate-900 font-mono">{targetTerm}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-save-all-class-fees"
                  type="button"
                  onClick={handleSaveAllClassPrices}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Class Fee Prices for {targetSession}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: GENERAL SCHOOL INFO & BANK ACCOUNTS                */}
      {/* ========================================================= */}
      {activeTab === 'general' && (
        <form onSubmit={handleGeneralSubmit} className="space-y-6 text-xs animate-in fade-in duration-150">
          {/* School Identity */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm font-display">
              <School className="w-4 h-4 text-emerald-700" />
              <span>School Identification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official School Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  School Motto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolMotto}
                  onChange={(e) => setFormData({ ...formData, schoolMotto: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 italic"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Telephone Contact
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Campus Physical Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Bank Details for Fees */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm font-display">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>School Bank Account for Fee Deposits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.accountName || ''}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Number (NUBAN)
                </label>
                <input
                  type="text"
                  value={formData.accountNumber || ''}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Receipt Formatting */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm font-display">
              <Building className="w-4 h-4 text-emerald-700" />
              <span>Receipt & Billing Preferences</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol || '₦'}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Receipt Footer Notice
                </label>
                <input
                  type="text"
                  value={formData.receiptFooterText || formData.reportNote || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      receiptFooterText: e.target.value,
                      reportNote: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button
              id="btn-save-school-settings"
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save School Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ACADEMIC SESSIONS & TERM MANAGEMENT                */}
      {/* ========================================================= */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Academic Sessions Directory</span>
              </h3>
              <p className="text-xs text-slate-500">
                School sessions registered for fee accounting, invoicing, and student tracking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewSessionInput(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Session</span>
            </button>
          </div>

          {showNewSessionInput && (
            <form
              onSubmit={handleCreateNewSession}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3"
            >
              <h4 className="font-bold text-emerald-950">Add New Academic Session</h4>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="e.g. 2027/2028"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shrink-0"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSessionInput(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sessions.map((ses: AcademicSession) => {
              const isCurrent = ses.id === activeSession;
              const countPriced = classFeePricings.filter(
                (p) => p.academicSession === ses.id
              ).length;

              return (
                <div
                  key={ses.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-slate-900">{ses.id}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                        ACTIVE SESSION
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {countPriced > 0
                      ? `${countPriced} class fee prices configured`
                      : 'Default tier rates applied'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetSession(ses.id);
                        setActiveTab('fees');
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Configure Fees</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
