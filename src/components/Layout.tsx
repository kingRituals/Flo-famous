import React, { useState } from 'react';
import { Sidebar, ActiveNavTab } from './Sidebar';
import { TopNav } from './TopNav';
import { DashboardView } from './DashboardView';
import { ExcelFeeTableView } from './ExcelFeeTableView';
import { StudentsView } from './StudentsView';
import { PaymentsView } from './PaymentsView';
import { OutstandingFeesView } from './OutstandingFeesView';
import { FeeManagementView } from './FeeManagementView';
import { ClassesView } from './ClassesView';
import { ParentsView } from './ParentsView';
import { ReportsView } from './ReportsView';
import { SessionsView } from './SessionsView';
import { UsersView } from './UsersView';
import { NotificationsView } from './NotificationsView';
import { AuditLogsView } from './AuditLogsView';
import { SettingsView } from './SettingsView';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { StudentProfileModal } from './StudentProfileModal';
import { AddStudentModal } from './AddStudentModal';
import { BulkImportModal } from './BulkImportModal';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Layout: React.FC = () => {
  const {
    activeReceiptPayment,
    closeReceipt,
    isRecordPaymentOpen,
    recordPaymentStudentId,
    closeRecordPayment,
    activeStudentProfileId,
    closeStudentProfile,
    openStudentProfile,
    notifications,
    dismissNotification,
  } = useApp();

  const [currentTab, setCurrentTab] = useState<ActiveNavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);

  const handleGlobalSearchSelect = (studentId: string) => {
    openStudentProfile(studentId);
  };

  const handleSelectClassInTable = (classId: string) => {
    setCurrentTab('excel-table');
  };

  return (
    <div id="app-root-layout" className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0 transition-all">
        {/* Top Header Navigation */}
        <TopNav
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onGlobalSearchSelect={handleGlobalSearchSelect}
          onOpenAddStudentModal={() => setIsAddStudentOpen(true)}
          onNavigateToNotifications={() => setCurrentTab('notifications')}
        />

        {/* Dynamic Content View Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView onNavigateToTab={(tab) => setCurrentTab(tab)} />
          )}
          {currentTab === 'excel-table' && <ExcelFeeTableView />}
          {currentTab === 'notifications' && <NotificationsView />}
          {currentTab === 'students' && (
            <StudentsView
              onOpenAddModal={() => setIsAddStudentOpen(true)}
              onOpenBulkImport={() => setIsBulkImportOpen(true)}
            />
          )}
          {currentTab === 'payments' && <PaymentsView />}
          {currentTab === 'outstanding' && <OutstandingFeesView />}
          {currentTab === 'fees' && <FeeManagementView />}
          {currentTab === 'classes' && (
            <ClassesView onSelectClassInTable={handleSelectClassInTable} />
          )}
          {currentTab === 'parents' && <ParentsView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'sessions' && <SessionsView />}
          {currentTab === 'users' && <UsersView />}
          {currentTab === 'audit-logs' && <AuditLogsView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* GLOBAL MODALS */}
      {/* 1. Official Receipt Modal */}
      {activeReceiptPayment && (
        <PaymentReceiptModal
          payment={activeReceiptPayment}
          onClose={closeReceipt}
        />
      )}

      {/* 2. Record Payment Modal */}
      {isRecordPaymentOpen && (
        <RecordPaymentModal
          isOpen={isRecordPaymentOpen}
          onClose={closeRecordPayment}
          preSelectedStudentId={recordPaymentStudentId}
        />
      )}

      {/* 3. Student Dossier / Profile Modal */}
      {activeStudentProfileId && (
        <StudentProfileModal
          studentId={activeStudentProfileId}
          onClose={closeStudentProfile}
        />
      )}

      {/* 4. Register Student Modal */}
      {isAddStudentOpen && (
        <AddStudentModal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
        />
      )}

      {/* 5. Bulk Student Import Modal */}
      {isBulkImportOpen && (
        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
        />
      )}

      {/* Toast Notifications Container */}
      <div
        id="toast-notifications-container"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print"
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200 text-xs ${
              n.type === 'success'
                ? 'bg-emerald-950 text-white border-emerald-700'
                : n.type === 'warning'
                ? 'bg-amber-950 text-white border-amber-600'
                : n.type === 'error'
                ? 'bg-rose-950 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {n.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
              {n.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              {n.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
              <div className="font-medium">{n.message}</div>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
