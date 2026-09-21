import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CreditCard,
  Eye,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira } from '../utils/formatters';
import { exportToExcel } from '../utils/exportUtils';

export const ParentsView: React.FC = () => {
  const {
    students,
    activeSession,
    activeTerm,
    getStudentFinancialSummary,
    openStudentProfile,
    schoolSettings,
    notify,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Group students by parent phone/name
  const parentGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        parentName: string;
        parentPhone: string;
        parentEmail?: string;
        address?: string;
        wards: Array<{
          id: string;
          name: string;
          className: string;
          outstanding: number;
        }>;
        totalExpected: number;
        totalPaid: number;
        totalOutstanding: number;
      }
    >();

    students.forEach((st) => {
      const fin = getStudentFinancialSummary(st.id, activeSession, activeTerm);
      const key = st.parentPhone || st.parentName;

      if (!map.has(key)) {
        map.set(key, {
          parentName: st.parentName,
          parentPhone: st.parentPhone,
          parentEmail: st.parentEmail,
          address: st.address,
          wards: [],
          totalExpected: 0,
          totalPaid: 0,
          totalOutstanding: 0,
        });
      }

      const entry = map.get(key)!;
      entry.wards.push({
        id: st.id,
        name: st.fullName,
        className: st.className,
        outstanding: fin.outstanding,
      });
      entry.totalExpected += fin.totalExpected;
      entry.totalPaid += fin.totalPaid;
      if (fin.outstanding > 0) entry.totalOutstanding += fin.outstanding;
    });

    return Array.from(map.values()).filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.parentName.toLowerCase().includes(q) ||
          p.parentPhone.includes(q) ||
          p.wards.some((w) => w.name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [students, activeSession, activeTerm, searchQuery]);

  const handleSendWhatsApp = (parent: any) => {
    const text = encodeURIComponent(
      `Dear ${parent.parentName}, this is a message from ${schoolSettings.schoolName}. You currently have ${parent.wards.length} registered ward(s) with us. Total outstanding fee balance for ${activeSession} ${activeTerm} is ${formatNaira(parent.totalOutstanding)}. Thank you.`
    );
    const phone = parent.parentPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? '234' + phone.substring(1) : phone;
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleExportExcel = () => {
    const data = parentGroups.map((p) => ({
      'Parent Name': p.parentName,
      'Phone Number': p.parentPhone,
      'Email': p.parentEmail || 'N/A',
      'Address': p.address || 'N/A',
      'Number of Wards': p.wards.length,
      'Wards List': p.wards.map((w) => `${w.name} (${w.className})`).join(', '),
      'Total Expected (NGN)': p.totalExpected,
      'Total Paid (NGN)': p.totalPaid,
      'Total Outstanding (NGN)': p.totalOutstanding,
    }));

    exportToExcel('FLO_Famous_Parents_Directory', 'Parents', data);
  };

  return (
    <div id="parents-view-container" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Parents & Guardians Roster
              </h2>
              <p className="text-xs text-slate-500">
                Contact database, family ward linkages, and combined household fee liabilities.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Export Parents (XLSX)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parent by name, phone, or ward's name..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="text-slate-500 text-xs font-medium">
          Total Families: <strong>{parentGroups.length}</strong>
        </div>
      </div>

      {/* Parents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parentGroups.map((p, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-600/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {p.parentName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {p.wards.length} Ward{p.wards.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Contacts */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <a href={`tel:${p.parentPhone}`} className="font-mono font-medium hover:underline">
                    {p.parentPhone}
                  </a>
                </div>
                {p.parentEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <a href={`mailto:${p.parentEmail}`} className="truncate hover:underline">
                      {p.parentEmail}
                    </a>
                  </div>
                )}
                {p.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="truncate">{p.address}</span>
                  </div>
                )}
              </div>

              {/* Wards list */}
              <div className="mb-3">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                  Children / Wards Enrolled:
                </div>
                <div className="space-y-1">
                  {p.wards.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <button
                          onClick={() => openStudentProfile(w.id)}
                          className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline"
                        >
                          {w.name}
                        </button>
                        <span className="text-slate-500 text-[11px] ml-1.5">({w.className})</span>
                      </div>
                      <span className={`font-mono text-[11px] font-bold ${w.outstanding > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {w.outstanding > 0 ? formatNaira(w.outstanding) : 'Cleared'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Balance & Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Combined Outstanding</div>
                <div className={`font-mono font-bold text-sm ${p.totalOutstanding > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatNaira(p.totalOutstanding)}
                </div>
              </div>
              <button
                onClick={() => handleSendWhatsApp(p)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold transition-colors"
                title="Send WhatsApp update"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
