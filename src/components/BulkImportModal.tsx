import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { SchoolSection, Gender } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  firstName: string;
  lastName: string;
  gender: Gender;
  className: string;
  section: SchoolSection;
  parentName: string;
  parentPhone: string;
  address?: string;
  isValid: boolean;
  error?: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const { classes, addStudent, activeSession, notify } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'First Name': 'Chiemezie',
        'Last Name': 'Eze',
        Gender: 'Male',
        Class: 'Primary 4',
        Section: 'PRIMARY',
        'Parent Name': 'Barrister & Mrs Eze',
        'Parent Phone': '08031234567',
        Address: 'Independence Layout, Enugu',
      },
      {
        'First Name': 'Amarachi',
        'Last Name': 'Nnamani',
        Gender: 'Female',
        Class: 'JSS 2',
        Section: 'JUNIOR_SECONDARY',
        'Parent Name': 'Dr. Nnamani',
        'Parent Phone': '08029876543',
        Address: 'New Haven, Enugu',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students_Template');
    XLSX.writeFile(wb, 'FLO_Famous_Students_Template.xlsx');
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        const processed: ParsedRow[] = rawData.map((row) => {
          const firstName = (row['First Name'] || row['firstName'] || row['Firstname'] || '').toString().trim();
          const lastName = (row['Last Name'] || row['lastName'] || row['Surname'] || '').toString().trim();
          const rawGender = (row['Gender'] || 'Male').toString().trim();
          const gender: Gender = rawGender.toLowerCase().startsWith('f') ? 'Female' : 'Male';
          const className = (row['Class'] || row['className'] || 'Primary 1').toString().trim();
          const rawSection = (row['Section'] || '').toString().trim().toUpperCase();
          const parentName = (row['Parent Name'] || row['parentName'] || 'Guardian').toString().trim();
          const parentPhone = (row['Parent Phone'] || row['parentPhone'] || '08000000000').toString().trim();
          const address = (row['Address'] || 'Enugu, Nigeria').toString().trim();

          let section: SchoolSection = 'PRIMARY';
          if (rawSection.includes('JSS') || rawSection.includes('JUNIOR')) {
            section = 'JUNIOR_SECONDARY';
          } else if (rawSection.includes('SS') || rawSection.includes('SENIOR')) {
            section = 'SENIOR_SECONDARY';
          }

          const isValid = Boolean(firstName && lastName && parentPhone);
          return {
            firstName,
            lastName,
            gender,
            className,
            section,
            parentName,
            parentPhone,
            address,
            isValid,
            error: isValid ? undefined : 'Missing required fields (First name, Last name, or Phone)',
          };
        });

        setParsedRows(processed);
      } catch (err) {
        notify('Failed to parse file. Please verify valid Excel or CSV formatting.', 'error');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleCommitImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      notify('No valid student rows to import.', 'warning');
      return;
    }

    let count = 0;
    validRows.forEach((row) => {
      const matchedClass = classes.find(
        (c) => c.name.toLowerCase() === row.className.toLowerCase()
      ) || classes[0];

      addStudent({
        firstName: row.firstName,
        lastName: row.lastName,
        gender: row.gender,
        dateOfBirth: '2014-06-01',
        section: matchedClass ? matchedClass.section : row.section,
        classId: matchedClass ? matchedClass.id : 'cls-pri-1',
        className: matchedClass ? matchedClass.name : row.className,
        parentName: row.parentName,
        parentPhone: row.parentPhone,
        address: row.address || 'Enugu, Nigeria',
        academicSession: activeSession,
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
      count += 1;
    });

    notify(`Successfully imported ${count} students into system!`, 'success');
    onClose();
  };

  return (
    <div
      id="bulk-import-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        <div className="p-4 sm:p-5 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-800 text-amber-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display">Bulk Student Import</h3>
              <p className="text-xs text-emerald-300">Import student roster from Excel (.xlsx) or CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Step 1: Download Template */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">Download Official Template</div>
              <div className="text-[11px] text-slate-500">
                Pre-formatted spreadsheet with matching columns and sample data.
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download Excel Template</span>
            </button>
          </div>

          {/* Step 2: Upload File Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <FileSpreadsheet className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
            <div className="font-semibold text-slate-800">
              {fileName ? `Selected: ${fileName}` : 'Click or Drag & Drop Excel / CSV file here'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Supports .xlsx, .xls, and .csv files
            </div>
          </div>

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Preview Rows ({parsedRows.length} total, {parsedRows.filter((r) => r.isValid).length} valid)
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Class</th>
                      <th className="p-2">Parent</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, idx) => (
                      <tr key={idx} className={r.isValid ? '' : 'bg-rose-50/70'}>
                        <td className="p-2 font-medium">
                          {r.firstName} {r.lastName}
                        </td>
                        <td className="p-2">{r.className}</td>
                        <td className="p-2">{r.parentName}</td>
                        <td className="p-2 font-mono">{r.parentPhone}</td>
                        <td className="p-2 text-center">
                          {r.isValid ? (
                            <span className="text-emerald-700 font-semibold">Valid</span>
                          ) : (
                            <span className="text-rose-600 font-semibold" title={r.error}>
                              Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              disabled={parsedRows.filter((r) => r.isValid).length === 0}
              onClick={handleCommitImport}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {parsedRows.filter((r) => r.isValid).length} Students</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
