import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, School, Phone, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SchoolSection, Gender } from '../types';
import { getCurrentNigeriaDateTime } from '../utils/formatters';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const { classes, addStudent, activeSession, feeCategories, setStudentFeeAmount, notify } = useApp();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('2014-05-12');
  const [section, setSection] = useState<SchoolSection>('PRIMARY');
  const [classId, setClassId] = useState(classes[2]?.id || 'cls-pri-2');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const [admissionDate, setAdmissionDate] = useState(getCurrentNigeriaDateTime().date);
  const [previousSchool, setPreviousSchool] = useState('');
  const [notes, setNotes] = useState('');
  const [autoAssignFees, setAutoAssignFees] = useState(true);

  if (!isOpen) return null;

  const handleSectionChange = (newSec: SchoolSection) => {
    setSection(newSec);
    const firstInSec = classes.find((c) => c.section === newSec);
    if (firstInSec) setClassId(firstInSec.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !parentName.trim() || !parentPhone.trim()) {
      notify('Please fill in all mandatory fields.', 'warning');
      return;
    }

    const selectedClass = classes.find((c) => c.id === classId);

    const newStudent = addStudent({
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      gender,
      dateOfBirth,
      section,
      classId,
      className: selectedClass?.name || 'Class',
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim() || undefined,
      address: address.trim() || 'Enugu, Nigeria',
      academicSession: activeSession,
      admissionDate,
      previousSchool: previousSchool.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'Active',
    });

    // Auto-assign default fees if toggled
    if (autoAssignFees && newStudent) {
      feeCategories.forEach((fc) => {
        const sections = fc.applicableSections || (fc.applicableSection ? [fc.applicableSection] : []);
        if (sections.includes(section) || sections.length === 0 || sections.includes('ALL' as any)) {
          setStudentFeeAmount(newStudent.id, fc.id, fc.defaultAmount);
        }
      });
    }

    onClose();
  };

  return (
    <div
      id="add-student-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-800 text-amber-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display">
                Register New Student
              </h3>
              <p className="text-xs text-emerald-300">
                Enroll student into FLO Famous Secondary & Primary School
              </p>
            </div>
          </div>
          <button
            id="btn-close-add-student"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs max-h-[78vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
          {/* Student Names */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Chukwudi"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="e.g. David"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Last / Surname *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Okafor"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Gender & Birth Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Academic Section & Class */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="font-bold text-slate-800 uppercase text-[11px]">Academic Placement</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  School Section *
                </label>
                <select
                  value={section}
                  onChange={(e) => handleSectionChange(e.target.value as SchoolSection)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-semibold"
                >
                  <option value="PRIMARY">Primary & Nursery</option>
                  <option value="JUNIOR_SECONDARY">Junior Secondary School (JSS)</option>
                  <option value="SENIOR_SECONDARY">Senior Secondary School (SS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Class *
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-semibold"
                >
                  {classes
                    .filter((c) => c.section === section)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.capacity} Max)
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parent / Guardian Contact Details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="font-bold text-slate-800 uppercase text-[11px]">Parent / Guardian Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Chief & Mrs. C. Okafor"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Parent Phone (WhatsApp / SMS) *
                </label>
                <input
                  type="text"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="e.g. 08034567890"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Parent Email (Optional)
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="e.g. parent@gmail.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Independence Layout, Enugu"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Auto Assign Standard Term Fees Checkbox */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-emerald-950 text-xs">
                Automatically Assign Standard Term Fees
              </div>
              <div className="text-[11px] text-emerald-800">
                Populates School Fees, Books, Lesson, Uniform, and standard charges automatically.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoAssignFees}
              onChange={(e) => setAutoAssignFees(e.target.checked)}
              className="w-5 h-5 accent-emerald-700 rounded-md cursor-pointer"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Register & Generate Student ID</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
