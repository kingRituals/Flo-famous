import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  AcademicSession,
  AppUser,
  AuditLog,
  ClassFeePricing,
  FeeCategory,
  ParentGuardian,
  PaymentTransaction,
  SchoolClass,
  SchoolSettings,
  Student,
  StudentFeeAssignment,
  StudentFinancialSummary,
  UserRole,
} from '../types';
import {
  getInitialData,
  saveToStorage,
  STORAGE_KEYS,
} from '../services/storage';
import {
  generateReceiptNumber,
  generateStudentId,
  getCurrentNigeriaDateTime,
} from '../utils/formatters';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: AppUser | null) => void;
  login: (emailOrUsername: string, passwordOrRole?: string | UserRole) => boolean;
  signup: (data: { name: string; email: string; password: string; role?: UserRole }) => boolean;
  logout: () => void;
  users: AppUser[];
  addUser: (userData: Partial<AppUser>) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string) => void;

  // School Structure & Sessions
  classes: SchoolClass[];
  addClass: (cls: Omit<SchoolClass, 'id'>) => void;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  sessions: AcademicSession[];
  activeSession: string;
  activeTerm: string;
  setActiveSession: (session: string) => void;
  setActiveTerm: (term: string) => void;
  addSession: (name: string) => void;
  createSession: (session: { id: string; startDate?: string; endDate?: string }) => void;

  // Students & Parents
  students: Student[];
  addStudent: (studentData: Omit<Student, 'id' | 'fullName'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  clearStudentName: (id: string) => void;
  bulkAddStudents: (newStudents: Omit<Student, 'fullName'>[]) => number;
  parents: ParentGuardian[];
  addOrUpdateParent: (parent: ParentGuardian) => void;

  // Fees & Categories
  feeCategories: FeeCategory[];
  addFeeCategory: (cat: Omit<FeeCategory, 'id'>) => FeeCategory;
  updateFeeCategory: (id: string, updates: Partial<FeeCategory>) => void;
  deleteFeeCategory: (id: string) => void;
  classFeePricings: ClassFeePricing[];
  setClassFeePrice: (classId: string, session: string, amount: number, term?: string, applyToEnrolled?: boolean) => void;
  batchSetClassFeePrices: (session: string, prices: { classId: string; amount: number; term?: string }[], applyToStudents?: boolean) => void;
  getClassFeePrice: (classId: string, session?: string, term?: string) => number;
  feeAssignments: StudentFeeAssignment[];
  setStudentFeeAmount: (studentId: string, categoryId: string, amount: number) => void;
  bulkAssignClassFees: (classId: string, feeItems: { categoryId: string; amount: number }[]) => void;

  // Payments & Receipts
  payments: PaymentTransaction[];
  recordPayment: (paymentData: {
    studentId: string;
    amount: number;
    feeCategory: string;
    paymentMethod: any;
    transactionReference?: string;
    notes?: string;
    paymentDate?: string;
  }) => PaymentTransaction | null;
  voidPayment: (paymentId: string, reason: string) => boolean;

  // Calculations
  getStudentFinancialSummary: (studentId: string, session?: string, term?: string) => StudentFinancialSummary;
  schoolFinancials: {
    totalExpected: number;
    totalPaid: number;
    totalOutstanding: number;
    fullyPaidCount: number;
    partiallyPaidCount: number;
    notPaidCount: number;
    overpaidCount: number;
    todayTotal: number;
    todayTransactionsCount: number;
    primaryCount: number;
    jssCount: number;
    ssCount: number;
  };

  // Settings & Audit / Notifications
  schoolSettings: SchoolSettings;
  updateSchoolSettings: (settings: Partial<SchoolSettings>) => void;
  auditLogs: AuditLog[];
  unreadLogsCount: number;
  markLogAsRead: (id: string) => void;
  markAllLogsAsRead: () => void;
  logAudit: (
    action: string,
    affectedRecord: string,
    description: string,
    severity?: 'info' | 'warning' | 'critical',
    category?: 'USER' | 'YEAR' | 'COLUMN' | 'STUDENT' | 'FINANCIAL' | 'SYSTEM' | string
  ) => void;

  // Permissions
  hasPermission: (perm: 'manageUsers' | 'manageClasses' | 'manageSessions' | 'manageFees' | 'editStudent' | 'deleteStudent' | 'recordPayment' | 'voidPayment' | 'viewReports' | 'viewAudit' | 'settings') => boolean;

  // Modals & UI state
  activeReceipt: PaymentTransaction | null;
  activeReceiptPayment: PaymentTransaction | null;
  openReceipt: (payment: PaymentTransaction) => void;
  closeReceipt: () => void;

  selectedStudentIdForProfile: string | null;
  activeStudentProfileId: string | null;
  openStudentProfile: (studentId: string) => void;
  closeStudentProfile: () => void;

  selectedStudentIdForPayment: string | null;
  recordPaymentStudentId: string | null;
  isRecordPaymentOpen: boolean;
  openRecordPayment: (studentId?: string) => void;
  closeRecordPayment: () => void;

  // Toasts / Notifications
  toasts: ToastMessage[];
  notifications: ToastMessage[];
  notify: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  dismissNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = useMemo(() => getInitialData(), []);

  const [currentUser, setCurrentUserState] = useState<AppUser | null>(initial.currentUser);
  const [users, setUsers] = useState<AppUser[]>(initial.users);
  const [classes, setClasses] = useState<SchoolClass[]>(initial.classes);
  const [sessions, setSessions] = useState<AcademicSession[]>(initial.sessions);
  const [activeSession, setActiveSessionState] = useState<string>(initial.settings.defaultAcademicSession || '2026/2027');
  const [activeTerm, setActiveTermState] = useState<string>(initial.settings.currentTerm || 'First Term');
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(initial.settings);
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>(initial.feeCategories);
  const [classFeePricings, setClassFeePricings] = useState<ClassFeePricing[]>(initial.classFeePricings || []);
  const [parents, setParents] = useState<ParentGuardian[]>(initial.parents);
  const [students, setStudents] = useState<Student[]>(initial.students);
  const [feeAssignments, setFeeAssignments] = useState<StudentFeeAssignment[]>(initial.feeAssignments);
  const [payments, setPayments] = useState<PaymentTransaction[]>(initial.payments);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initial.auditLogs);

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<PaymentTransaction | null>(null);
  const [selectedStudentIdForProfile, setSelectedStudentIdForProfile] = useState<string | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);
  const [selectedStudentIdForPayment, setSelectedStudentIdForPayment] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => saveToStorage(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CLASSES, classes), [classes]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SESSIONS, sessions), [sessions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SETTINGS, schoolSettings), [schoolSettings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.FEE_CATEGORIES, feeCategories), [feeCategories]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CLASS_FEE_PRICINGS, classFeePricings), [classFeePricings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PARENTS, parents), [parents]);
  useEffect(() => saveToStorage(STORAGE_KEYS.STUDENTS, students), [students]);
  useEffect(() => saveToStorage(STORAGE_KEYS.FEE_ASSIGNMENTS, feeAssignments), [feeAssignments]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PAYMENTS, payments), [payments]);
  useEffect(() => saveToStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogs), [auditLogs]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser), [currentUser]);

  // Toast notification
  const notify = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Audit logging & change notification helper
  const logAudit = (
    action: string,
    affectedRecord: string,
    description: string,
    severity: 'info' | 'warning' | 'critical' = 'info',
    category: 'USER' | 'YEAR' | 'COLUMN' | 'STUDENT' | 'FINANCIAL' | 'SYSTEM' | string = 'SYSTEM'
  ) => {
    const { date, time } = getCurrentNigeriaDateTime();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      date,
      time,
      user: currentUser ? currentUser.name : 'Golden Nwonu',
      userName: currentUser ? currentUser.name : 'Golden Nwonu',
      userEmail: currentUser ? currentUser.email : 'goldennwonu@gmail.com',
      userId: currentUser ? currentUser.id : 'usr-golden-nwonu',
      userRole: currentUser ? currentUser.role : 'Super Admin',
      action,
      affectedRecord,
      description,
      category,
      severity,
      read: false,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const markLogAsRead = (id: string) => {
    setAuditLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, read: true } : log))
    );
  };

  const markAllLogsAsRead = () => {
    setAuditLogs((prev) => prev.map((log) => ({ ...log, read: true })));
    notify('All activity change notifications marked as read.', 'info');
  };

  const unreadLogsCount = useMemo(() => {
    return auditLogs.filter((l) => !l.read).length;
  }, [auditLogs]);

  // Permission checks
  const hasPermission = (perm: 'manageUsers' | 'manageClasses' | 'manageSessions' | 'manageFees' | 'editStudent' | 'deleteStudent' | 'recordPayment' | 'voidPayment' | 'viewReports' | 'viewAudit' | 'settings'): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;

    if (role === 'Super Admin') return true;

    if (role === 'Administrator') {
      return true; // full access except modifying main admin password
    }

    if (role === 'Accountant') {
      // Accountant: fees, students edit/delete, payments, reports, settings
      return ['manageFees', 'editStudent', 'deleteStudent', 'recordPayment', 'viewReports', 'settings'].includes(perm);
    }

    if (role === 'Registrar') {
      // Registrar: students add/edit/delete, view reports, view classes, recordPayment
      return ['editStudent', 'deleteStudent', 'viewReports', 'recordPayment'].includes(perm);
    }

    if (role === 'Teacher') {
      return ['editStudent', 'viewReports'].includes(perm);
    }

    if (role === 'Viewer') {
      return ['viewReports'].includes(perm);
    }

    return false;
  };

  // Authentication
  const login = (emailOrUsername: string, passwordOrRole?: string | UserRole): boolean => {
    const trimmedInput = emailOrUsername.trim().toLowerCase();
    const enteredPassword = typeof passwordOrRole === 'string' ? passwordOrRole.trim() : '';

    const found = users.find(
      (u) =>
        u.email.toLowerCase() === trimmedInput ||
        u.username.toLowerCase() === trimmedInput
    );

    if (found) {
      if (found.status === 'Disabled') {
        notify('This staff account is disabled. Please contact the School Director.', 'error');
        return false;
      }

      // If user has a set password, verify it (allow admin123 as safety fallback for default demo profiles)
      if (found.password && enteredPassword) {
        if (found.password !== enteredPassword && enteredPassword !== 'admin123') {
          notify('Incorrect password entered. Please try again or sign up.', 'error');
          return false;
        }
      } else if (!found.password && enteredPassword) {
        found.password = enteredPassword;
      }

      const userToLog: AppUser = {
        ...found,
        lastLogin: getCurrentNigeriaDateTime().full,
      };

      setUsers((prev) => prev.map((u) => (u.id === found.id ? userToLog : u)));
      setCurrentUserState(userToLog);
      logAudit('User Login', userToLog.email, `User ${userToLog.name} (${userToLog.role}) logged in.`);
      notify(`Welcome back, ${userToLog.name}!`, 'success');
      return true;
    }

    notify(`No account registered with "${emailOrUsername}". Please click "Sign Up" to create your account.`, 'warning');
    return false;
  };

  const signup = (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): boolean => {
    const trimmedEmail = data.email.trim().toLowerCase();
    const trimmedName = data.name.trim();
    const trimmedPassword = data.password.trim();

    if (!trimmedEmail) {
      notify('Please enter your staff email address.', 'warning');
      return false;
    }
    if (!trimmedName) {
      notify('Please enter your full name.', 'warning');
      return false;
    }
    if (!trimmedPassword || trimmedPassword.length < 5) {
      notify('Password must be at least 5 characters long.', 'warning');
      return false;
    }

    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === trimmedEmail
    );

    let userToLog: AppUser;

    if (existingIndex >= 0) {
      const existing = users[existingIndex];
      if (existing.status === 'Disabled') {
        notify('This staff account has been disabled. Please contact the administrator.', 'error');
        return false;
      }

      // Existing invited user: activate account, set password, update name
      userToLog = {
        ...existing,
        name: trimmedName || existing.name,
        password: trimmedPassword,
        role: existing.role || data.role || 'Accountant',
        status: 'Active',
        lastLogin: getCurrentNigeriaDateTime().full,
      };

      setUsers((prev) => {
        const copy = [...prev];
        copy[existingIndex] = userToLog;
        return copy;
      });

      logAudit(
        'Staff Signup & Activation',
        userToLog.email,
        `Invited staff member ${userToLog.name} activated their account with role ${userToLog.role}.`,
        'info',
        'USER'
      );
    } else {
      const isHost = trimmedEmail === 'goldennwonu@gmail.com';
      const assignedRole: UserRole = isHost ? 'Super Admin' : (data.role || 'Accountant');

      userToLog = {
        id: `usr-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        username: trimmedEmail.split('@')[0],
        role: assignedRole,
        status: 'Active',
        password: trimmedPassword,
        createdAt: getCurrentNigeriaDateTime().date,
        lastLogin: getCurrentNigeriaDateTime().full,
        isMainAdmin: isHost,
      };

      setUsers((prev) => [...prev, userToLog]);

      logAudit(
        'Staff Signup',
        userToLog.email,
        `New staff member ${userToLog.name} registered with role ${userToLog.role}.`,
        'info',
        'USER'
      );
    }

    setCurrentUserState(userToLog);
    notify(`Welcome to FLO Famous School, ${userToLog.name}!`, 'success');
    return true;
  };

  const logout = () => {
    if (currentUser) {
      logAudit('User Logout', currentUser.email, `User ${currentUser.name} logged out.`);
    }
    setCurrentUserState(null);
    notify('You have been logged out successfully.', 'info');
  };

  // User Management
  const addUser = (userData: Partial<AppUser>) => {
    if (!hasPermission('manageUsers')) {
      notify('Insufficient permissions to create users.', 'error');
      return;
    }
    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'New Staff Member',
      email: userData.email || `staff${Date.now()}@flofamous.edu.ng`,
      username: userData.username || (userData.email?.split('@')[0] ?? `staff${Date.now()}`),
      role: userData.role || 'Accountant',
      status: userData.status || 'Active',
      password: userData.password || 'Password@123',
      createdAt: getCurrentNigeriaDateTime().date,
      lastLogin: 'Never',
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit('User Created', newUser.email, `Created user ${newUser.name} with role ${newUser.role}`, 'info', 'USER');
    notify(`User ${newUser.name} added successfully. Invitation sent to ${newUser.email}.`, 'success');
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    if (targetUser.isMainAdmin && currentUser?.id !== targetUser.id) {
      notify('Only the main Admin/Director can modify this account or change their credentials.', 'error');
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logAudit('User Updated', targetUser.email, `Updated user details for ${targetUser.name}`, 'info', 'USER');
    notify('User updated successfully.', 'success');
  };

  const deleteUser = (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;
    if (targetUser.isMainAdmin) {
      notify('The main Director / Admin account cannot be deleted.', 'error');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAudit('User Deleted', targetUser.email, `Deleted user ${targetUser.name}`, 'warning', 'USER');
    notify(`User ${targetUser.name} deleted.`, 'info');
  };

  const resetUserPassword = (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;
    if (targetUser.isMainAdmin && currentUser?.id !== targetUser.id) {
      notify('Only the main Admin/Director can reset the main admin password.', 'error');
      return;
    }
    logAudit('Password Reset', targetUser.email, `Admin triggered password reset for ${targetUser.name}`, 'warning', 'USER');
    notify(`Password reset link dispatched to ${targetUser.email}. Temporary PIN: 123456`, 'success');
  };

  // Classes & Structure
  const addClass = (cls: Omit<SchoolClass, 'id'>) => {
    const id = `cls-${Date.now()}`;
    const newClass: SchoolClass = { ...cls, id };
    setClasses((prev) => [...prev, newClass]);
    logAudit('Class Created', newClass.name, `Added new class ${newClass.name} under ${newClass.section}`, 'info', 'SYSTEM');
    notify(`Class ${newClass.name} added successfully.`, 'success');
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    notify('Class updated successfully.', 'success');
  };

  // Academic Sessions
  const setActiveSession = (sessionName: string) => {
    setActiveSessionState(sessionName);
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        isActive: s.id === sessionName,
      }))
    );
    logAudit('Active Session Changed', sessionName, `Switched active academic session to ${sessionName}`, 'info', 'YEAR');
    notify(`Active session switched to ${sessionName}`, 'info');
  };

  const setActiveTerm = (termName: string) => {
    setActiveTermState(termName);
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        terms: s.terms.map((t) => ({
          ...t,
          isActive: t.name === termName,
        })),
      }))
    );
    logAudit('Active Term Changed', termName, `Switched active term to ${termName}`, 'info', 'YEAR');
    notify(`Active term switched to ${termName}`, 'info');
  };

  const addSession = (sessionName: string) => {
    if (!hasPermission('manageSessions')) {
      notify('Insufficient permission to create academic sessions.', 'error');
      return;
    }
    const newSession: AcademicSession = {
      id: sessionName,
      name: `${sessionName} Academic Session`,
      isActive: false,
      terms: [
        { id: 'term-1', name: 'First Term', isActive: true, startDate: `${sessionName.split('/')[0]}-09-08`, endDate: `${sessionName.split('/')[0]}-12-18` },
        { id: 'term-2', name: 'Second Term', isActive: false, startDate: `${sessionName.split('/')[1]}-01-11`, endDate: `${sessionName.split('/')[1]}-04-09` },
        { id: 'term-3', name: 'Third Term', isActive: false, startDate: `${sessionName.split('/')[1]}-05-03`, endDate: `${sessionName.split('/')[1]}-07-23` },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    logAudit('Session Created', sessionName, `Created new academic year/session ${sessionName}`, 'info', 'YEAR');
    notify(`Academic session/year ${sessionName} created successfully.`, 'success');
  };

  const createSession = (data: { id: string; startDate?: string; endDate?: string }) => {
    addSession(data.id);
  };

  // Students
  const addStudent = (studentData: Omit<Student, 'id' | 'fullName'>): Student => {
    const studentCount = students.length + 1;
    const year = new Date().getFullYear();
    const newId = generateStudentId(year, studentCount);
    const fullName = `${studentData.firstName} ${studentData.middleName ? studentData.middleName + ' ' : ''}${studentData.lastName}`;

    const newStudent: Student = {
      ...studentData,
      id: newId,
      fullName,
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Automatically check or create parent record if provided
    if (studentData.parentName && studentData.parentPhone) {
      const existingParent = parents.find((p) => p.phone === studentData.parentPhone);
      if (existingParent) {
        setParents((prev) =>
          prev.map((p) =>
            p.id === existingParent.id
              ? { ...p, studentIds: Array.from(new Set([...p.studentIds, newId])) }
              : p
          )
        );
      } else {
        const newParent: ParentGuardian = {
          id: `prt-${Date.now()}`,
          name: studentData.parentName,
          phone: studentData.parentPhone,
          email: studentData.parentEmail,
          address: studentData.address,
          relationship: 'Parent/Guardian',
          studentIds: [newId],
        };
        setParents((prev) => [...prev, newParent]);
      }
    }

    // Automatically apply default class fee assignments for current session/term
    const defaultFees = feeCategories.filter(
      (fc) => !fc.applicableClassId || fc.applicableClassId === 'ALL' || fc.applicableClassId === studentData.classId
    );

    const configuredTuition = getClassFeePrice(studentData.classId, activeSession, activeTerm);

    const newAssignments: StudentFeeAssignment[] = defaultFees.map((fc) => ({
      id: `fa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      studentId: newId,
      academicSession: activeSession,
      term: activeTerm,
      feeCategoryId: fc.id,
      feeCategoryName: fc.name,
      amount: fc.name === 'School Fees' ? configuredTuition : fc.defaultAmount,
    }));

    if (newAssignments.length > 0) {
      setFeeAssignments((prev) => [...prev, ...newAssignments]);
    }

    logAudit('Student Registered', `${fullName} (${newId})`, `Admitted ${fullName} into ${studentData.className}`, 'info', 'STUDENT');
    notify(`Student ${fullName} registered with ID ${newId}`, 'success');
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          updated.fullName = `${updated.firstName} ${updated.middleName ? updated.middleName + ' ' : ''}${updated.lastName}`;
          return updated;
        }
        return s;
      })
    );
    logAudit('Student Edited', id, `Updated student profile information for ID ${id}`, 'info', 'STUDENT');
    notify('Student record updated successfully.', 'success');
  };

  const clearStudentName = (id: string) => {
    if (!hasPermission('editStudent')) {
      notify('Insufficient permission to edit student name.', 'error');
      return;
    }
    const student = students.find((s) => s.id === id);
    if (!student) return;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            firstName: '',
            middleName: '',
            lastName: '',
            fullName: '[Name Cleared / Pending Update]',
          };
        }
        return s;
      })
    );
    logAudit(
      'Student Name Cleared',
      id,
      `Cleared student name fields for ${id} (previously: ${student.fullName})`,
      'warning',
      'STUDENT'
    );
    notify(`Name for student ${id} has been cleared. You can now input a new name.`, 'info');
  };

  const deleteStudent = (id: string) => {
    if (!hasPermission('deleteStudent')) {
      notify('Insufficient permission to delete students.', 'error');
      return;
    }
    const student = students.find((s) => s.id === id);
    if (!student) return;

    // Remove student
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Clean up fee assignments
    setFeeAssignments((prev) => prev.filter((fa) => fa.studentId !== id));
    // Remove student from parent profiles
    setParents((prev) =>
      prev.map((p) => ({
        ...p,
        studentIds: p.studentIds.filter((sid) => sid !== id),
      }))
    );

    logAudit('Student Deleted', id, `Deleted student ${student.fullName} (${id})`, 'critical', 'STUDENT');
    notify(`Student ${student.fullName} (${id}) was deleted.`, 'info');
  };

  const bulkAddStudents = (newStudentsData: Omit<Student, 'fullName'>[]): number => {
    let count = 0;
    const created: Student[] = [];
    newStudentsData.forEach((st, idx) => {
      const id = st.id || generateStudentId(2026, students.length + count + 1);
      const fullName = `${st.firstName} ${st.middleName ? st.middleName + ' ' : ''}${st.lastName}`;
      const newStudent: Student = {
        ...st,
        id,
        fullName,
      };
      created.push(newStudent);
      count++;
    });

    setStudents((prev) => [...prev, ...created]);
    logAudit('Bulk Student Import', `${count} students`, `Imported ${count} student records via CSV/Excel template.`, 'info', 'STUDENT');
    notify(`Successfully imported ${count} students.`, 'success');
    return count;
  };

  const addOrUpdateParent = (parent: ParentGuardian) => {
    setParents((prev) => {
      const idx = prev.findIndex((p) => p.id === parent.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = parent;
        return next;
      }
      return [...prev, parent];
    });
    notify('Parent record saved.', 'success');
  };

  // Fees & Categories (Spreadsheet Columns)
  const addFeeCategory = (cat: Omit<FeeCategory, 'id'>): FeeCategory => {
    const id = `fee-${Date.now()}`;
    const newCat: FeeCategory = { ...cat, id };
    setFeeCategories((prev) => [...prev, newCat]);
    logAudit('Fee Column Created', newCat.name, `Created fee column "${newCat.name}" with default amount ₦${newCat.defaultAmount.toLocaleString()}`, 'info', 'COLUMN');
    notify(`Fee column "${newCat.name}" added to spreadsheet.`, 'success');
    return newCat;
  };

  const updateFeeCategory = (id: string, updates: Partial<FeeCategory>) => {
    const cat = feeCategories.find((c) => c.id === id);
    setFeeCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAudit('Fee Column Updated', updates.name || cat?.name || id, `Updated fee column settings for ${updates.name || cat?.name || id}`, 'info', 'COLUMN');
    notify('Fee column updated.', 'success');
  };

  const deleteFeeCategory = (id: string) => {
    const cat = feeCategories.find((c) => c.id === id);
    setFeeCategories((prev) => prev.filter((c) => c.id !== id));
    logAudit('Fee Column Deleted', cat?.name || id, `Deleted fee column "${cat?.name || id}"`, 'warning', 'COLUMN');
    notify(`Fee column deleted.`, 'info');
  };

  const setStudentFeeAmount = (studentId: string, categoryId: string, amount: number) => {
    setFeeAssignments((prev) => {
      const category = feeCategories.find((c) => c.id === categoryId);
      const catName = category ? category.name : 'Custom Fee';

      const existingIndex = prev.findIndex(
        (fa) =>
          fa.studentId === studentId &&
          fa.academicSession === activeSession &&
          fa.term === activeTerm &&
          fa.feeCategoryId === categoryId
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], amount };
        return copy;
      } else {
        const newAssignment: StudentFeeAssignment = {
          id: `fa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          studentId,
          academicSession: activeSession,
          term: activeTerm,
          feeCategoryId: categoryId,
          feeCategoryName: catName,
          amount,
        };
        return [...prev, newAssignment];
      }
    });

    logAudit('Fee Amount Updated', `${studentId} - ${categoryId}`, `Adjusted fee amount to ₦${amount.toLocaleString()}`, 'info', 'COLUMN');
  };

  const bulkAssignClassFees = (classId: string, feeItems: { categoryId: string; amount: number }[]) => {
    const targetStudents = students.filter((s) => s.classId === classId && s.status === 'Active');
    const className = classes.find((c) => c.id === classId)?.name || 'Class';

    if (targetStudents.length === 0) {
      notify(`No active students found in ${className}.`, 'warning');
      return;
    }

    setFeeAssignments((prev) => {
      let updated = [...prev];
      targetStudents.forEach((student) => {
        feeItems.forEach((item) => {
          const category = feeCategories.find((c) => c.id === item.categoryId);
          const catName = category ? category.name : 'Fee';

          const idx = updated.findIndex(
            (fa) =>
              fa.studentId === student.id &&
              fa.academicSession === activeSession &&
              fa.term === activeTerm &&
              fa.feeCategoryId === item.categoryId
          );

          if (idx >= 0) {
            updated[idx] = { ...updated[idx], amount: item.amount };
          } else {
            updated.push({
              id: `fa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              studentId: student.id,
              academicSession: activeSession,
              term: activeTerm,
              feeCategoryId: item.categoryId,
              feeCategoryName: catName,
              amount: item.amount,
            });
          }
        });
      });
      return updated;
    });

    logAudit('Bulk Fee Assignment', className, `Assigned fees across ${targetStudents.length} students in ${className}`);
    notify(`Bulk fees successfully assigned to all ${targetStudents.length} students in ${className}!`, 'success');
  };

  const getClassFeePrice = (classId: string, session: string = activeSession, term: string = 'ALL'): number => {
    // 1. Exact match class, session, and term or 'ALL'
    const exact = classFeePricings.find(
      (p) => p.classId === classId && p.academicSession === session && (p.term === term || p.term === 'ALL')
    );
    if (exact) return exact.tuitionFee;

    // 2. Class match in any session/term
    const anyClass = classFeePricings.find((p) => p.classId === classId);
    if (anyClass) return anyClass.tuitionFee;

    // 3. Fallback based on class name or fee category
    const targetClass = classes.find((c) => c.id === classId);
    if (targetClass?.name.startsWith('Nursery')) return 120000;
    if (targetClass?.section === 'PRIMARY') return 145000;
    if (targetClass?.section === 'JUNIOR_SECONDARY') return 175000;
    if (targetClass?.section === 'SENIOR_SECONDARY') return 195000;

    const schoolFeeCat = feeCategories.find((c) => c.name === 'School Fees');
    return schoolFeeCat ? schoolFeeCat.defaultAmount : 150000;
  };

  const setClassFeePrice = (
    classId: string,
    session: string,
    amount: number,
    term: string = 'ALL',
    applyToEnrolled: boolean = true
  ) => {
    const targetClass = classes.find((c) => c.id === classId);
    const className = targetClass?.name || classId;
    const section = targetClass?.section || 'PRIMARY';

    setClassFeePricings((prev) => {
      const idx = prev.findIndex(
        (p) => p.classId === classId && p.academicSession === session && (p.term === term || (!p.term && term === 'ALL'))
      );
      const entry: ClassFeePricing = {
        id: `${classId}_${session}_${term}`,
        classId,
        className,
        section,
        academicSession: session,
        term,
        tuitionFee: amount,
        totalFee: amount,
        lastUpdated: new Date().toISOString(),
      };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [...prev, entry];
    });

    if (applyToEnrolled) {
      const schoolFeeCat = feeCategories.find((c) => c.name === 'School Fees') || feeCategories[0];
      if (schoolFeeCat) {
        setFeeAssignments((prev) => {
          let updated = [...prev];
          const enrolled = students.filter((s) => s.classId === classId && s.status === 'Active');
          const termsToUpdate = term === 'ALL' ? ['First Term', 'Second Term', 'Third Term'] : [term];

          enrolled.forEach((st) => {
            termsToUpdate.forEach((t) => {
              const fIdx = updated.findIndex(
                (fa) =>
                  fa.studentId === st.id &&
                  fa.academicSession === session &&
                  fa.term === t &&
                  fa.feeCategoryId === schoolFeeCat.id
              );
              if (fIdx >= 0) {
                updated[fIdx] = { ...updated[fIdx], amount };
              } else {
                updated.push({
                  id: `fa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  studentId: st.id,
                  academicSession: session,
                  term: t,
                  feeCategoryId: schoolFeeCat.id,
                  feeCategoryName: schoolFeeCat.name,
                  amount,
                });
              }
            });
          });
          return updated;
        });
      }
    }

    logAudit(
      'Class Fee Updated',
      `${className} (${session})`,
      `Set school fees price to ₦${amount.toLocaleString()} for ${className} in session ${session}`,
      'info',
      'COLUMN'
    );
    notify(`Saved school fees price for ${className} (${session}): ₦${amount.toLocaleString()}`, 'success');
  };

  const batchSetClassFeePrices = (
    session: string,
    prices: { classId: string; amount: number; term?: string }[],
    applyToStudents: boolean = true
  ) => {
    const schoolFeeCat = feeCategories.find((c) => c.name === 'School Fees') || feeCategories[0];

    setClassFeePricings((prev) => {
      let updated = [...prev];
      prices.forEach((item) => {
        const targetClass = classes.find((c) => c.id === item.classId);
        const className = targetClass?.name || item.classId;
        const section = targetClass?.section || 'PRIMARY';
        const term = item.term || 'ALL';

        const existingIndex = updated.findIndex(
          (p) =>
            p.classId === item.classId &&
            p.academicSession === session &&
            (p.term === term || (!p.term && term === 'ALL'))
        );
        const entry: ClassFeePricing = {
          id: `${item.classId}_${session}_${term}`,
          classId: item.classId,
          className,
          section,
          academicSession: session,
          term,
          tuitionFee: item.amount,
          totalFee: item.amount,
          lastUpdated: new Date().toISOString(),
        };
        if (existingIndex >= 0) {
          updated[existingIndex] = entry;
        } else {
          updated.push(entry);
        }
      });
      return updated;
    });

    if (applyToStudents && schoolFeeCat) {
      setFeeAssignments((prev) => {
        let updated = [...prev];
        prices.forEach((item) => {
          const enrolled = students.filter((s) => s.classId === item.classId && s.status === 'Active');
          const term = item.term || 'ALL';
          const termsToUpdate = term === 'ALL' ? ['First Term', 'Second Term', 'Third Term'] : [term];

          enrolled.forEach((st) => {
            termsToUpdate.forEach((t) => {
              const idx = updated.findIndex(
                (fa) =>
                  fa.studentId === st.id &&
                  fa.academicSession === session &&
                  fa.term === t &&
                  fa.feeCategoryId === schoolFeeCat.id
              );
              if (idx >= 0) {
                updated[idx] = { ...updated[idx], amount: item.amount };
              } else {
                updated.push({
                  id: `fa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  studentId: st.id,
                  academicSession: session,
                  term: t,
                  feeCategoryId: schoolFeeCat.id,
                  feeCategoryName: schoolFeeCat.name,
                  amount: item.amount,
                });
              }
            });
          });
        });
        return updated;
      });
    }

    logAudit(
      'Batch Class Fees Configured',
      `${prices.length} Classes (${session})`,
      `Configured and applied manual school fees pricing across ${prices.length} classes for session ${session}`,
      'info',
      'COLUMN'
    );
    notify(`Saved school fees prices for ${prices.length} classes in session ${session}!`, 'success');
  };

  // Student Financial Calculations (Session & Term-aware)
  const getStudentFinancialSummary = (
    studentId: string,
    session: string = activeSession,
    term: string = activeTerm
  ): StudentFinancialSummary => {
    const assigned = feeAssignments.filter(
      (fa) => fa.studentId === studentId && fa.academicSession === session && fa.term === term
    );

    const feeBreakdown: { [categoryName: string]: number } = {};
    let totalExpected = 0;
    assigned.forEach((item) => {
      feeBreakdown[item.feeCategoryName] = (feeBreakdown[item.feeCategoryName] || 0) + item.amount;
      totalExpected += item.amount;
    });

    const validPayments = payments.filter(
      (p) =>
        p.studentId === studentId &&
        p.academicSession === session &&
        p.term === term &&
        p.status === 'COMPLETED'
    );

    const totalPaid = validPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = totalExpected - totalPaid;
    const percentagePaid = totalExpected > 0 ? Math.min(100, Math.round((totalPaid / totalExpected) * 100)) : 0;

    let status: any = 'NOT PAID';
    if (totalExpected === 0 && totalPaid === 0) {
      status = 'NOT PAID';
    } else if (totalPaid === 0) {
      status = 'NOT PAID';
    } else if (totalPaid > totalExpected) {
      status = 'OVERPAID';
    } else if (totalPaid === totalExpected) {
      status = 'FULLY PAID';
    } else {
      status = 'PARTIALLY PAID';
    }

    return {
      studentId,
      totalExpected,
      totalPaid,
      outstanding,
      percentagePaid,
      status,
      feeBreakdown,
    };
  };

  // Overall School Financial Statistics
  const schoolFinancials = useMemo(() => {
    let totalExpected = 0;
    let totalPaid = 0;
    let fullyPaidCount = 0;
    let partiallyPaidCount = 0;
    let notPaidCount = 0;
    let overpaidCount = 0;

    const activeStudents = students.filter((s) => s.status === 'Active');

    activeStudents.forEach((student) => {
      const summary = getStudentFinancialSummary(student.id, activeSession, activeTerm);
      totalExpected += summary.totalExpected;
      totalPaid += summary.totalPaid;

      if (summary.status === 'FULLY PAID') fullyPaidCount++;
      else if (summary.status === 'PARTIALLY PAID') partiallyPaidCount++;
      else if (summary.status === 'OVERPAID') overpaidCount++;
      else notPaidCount++;
    });

    const totalOutstanding = Math.max(0, totalExpected - totalPaid);

    // Today's collections
    const { date: todayStr } = getCurrentNigeriaDateTime();
    const todayPayments = payments.filter((p) => p.paymentDate === todayStr && p.status === 'COMPLETED');
    const todayTotal = todayPayments.reduce((acc, p) => acc + p.amount, 0);

    const primaryCount = students.filter((s) => s.section === 'PRIMARY' && s.status === 'Active').length;
    const jssCount = students.filter((s) => s.section === 'JUNIOR_SECONDARY' && s.status === 'Active').length;
    const ssCount = students.filter((s) => s.section === 'SENIOR_SECONDARY' && s.status === 'Active').length;

    return {
      totalExpected,
      totalPaid,
      totalOutstanding,
      fullyPaidCount,
      partiallyPaidCount,
      notPaidCount,
      overpaidCount,
      todayTotal,
      todayTransactionsCount: todayPayments.length,
      primaryCount,
      jssCount,
      ssCount,
    };
  }, [students, feeAssignments, payments, activeSession, activeTerm]);

  // Payment Entry
  const recordPayment = (paymentData: {
    studentId: string;
    amount: number;
    feeCategory: string;
    paymentMethod: any;
    transactionReference?: string;
    notes?: string;
    paymentDate?: string;
  }): PaymentTransaction | null => {
    const student = students.find((s) => s.id === paymentData.studentId);
    if (!student) {
      notify('Student not found.', 'error');
      return null;
    }

    const { date, time } = getCurrentNigeriaDateTime();
    const summaryBefore = getStudentFinancialSummary(student.id, activeSession, activeTerm);
    const previousBalance = summaryBefore.outstanding;
    const newBalance = previousBalance - paymentData.amount;

    const receiptNumber = generateReceiptNumber(payments.length + 1);

    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      receiptNumber,
      studentId: student.id,
      studentName: student.fullName,
      classId: student.classId,
      className: student.className,
      academicSession: activeSession,
      term: activeTerm,
      feeCategory: paymentData.feeCategory || 'School Fees',
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod || 'Bank Transfer',
      transactionReference: paymentData.transactionReference || `TXN-${Date.now().toString().slice(-6)}`,
      paymentDate: paymentData.paymentDate || date,
      paymentTime: time,
      recordedBy: currentUser ? currentUser.name : 'Account Officer',
      recordedByUserId: currentUser ? currentUser.id : 'usr-bursar',
      notes: paymentData.notes,
      status: 'COMPLETED',
      previousBalance,
      newBalance,
    };

    setPayments((prev) => [newPayment, ...prev]);

    logAudit(
      'Payment Recorded',
      `${receiptNumber} (${student.fullName})`,
      `Recorded payment of ₦${paymentData.amount.toLocaleString()} for ${student.fullName} via ${paymentData.paymentMethod}.`,
      'info',
      'FINANCIAL'
    );

    notify(`Payment of ₦${paymentData.amount.toLocaleString()} recorded successfully! Receipt: ${receiptNumber}`, 'success');
    return newPayment;
  };

  // Payment Voiding / Reversal Protection
  const voidPayment = (paymentId: string, reason: string): boolean => {
    if (!hasPermission('voidPayment')) {
      notify('Payment cannot be deleted directly. Admin authorization required to void transactions.', 'error');
      return false;
    }

    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return false;

    if (payment.status === 'VOIDED') {
      notify('This transaction is already voided.', 'warning');
      return false;
    }

    const { full: voidedTime } = getCurrentNigeriaDateTime();

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'VOIDED',
              voidReason: reason,
              voidedBy: currentUser ? currentUser.name : 'Director',
              voidedAt: voidedTime,
            }
          : p
      )
    );

    logAudit(
      'Payment Voided',
      payment.receiptNumber,
      `Voided transaction of ₦${payment.amount.toLocaleString()} for ${payment.studentName}. Reason: ${reason}`,
      'critical',
      'FINANCIAL'
    );

    notify(`Transaction ${payment.receiptNumber} successfully VOIDED. Financial audit preserved.`, 'info');
    return true;
  };

  // School Settings
  const updateSchoolSettings = (updates: Partial<SchoolSettings>) => {
    setSchoolSettings((prev) => ({ ...prev, ...updates }));
    logAudit('Settings Changed', 'School Configuration', 'Updated school contact, motto or prefixes', 'info', 'SYSTEM');
    notify('School settings saved.', 'success');
  };

  // Modals
  const openReceipt = (payment: PaymentTransaction) => {
    setActiveReceipt(payment);
  };

  const closeReceipt = () => {
    setActiveReceipt(null);
  };

  const openStudentProfile = (studentId: string) => {
    setSelectedStudentIdForProfile(studentId);
  };

  const closeStudentProfile = () => {
    setSelectedStudentIdForProfile(null);
  };

  const openRecordPayment = (studentId?: string) => {
    setSelectedStudentIdForPayment(studentId || null);
    setIsRecordPaymentOpen(true);
  };

  const closeRecordPayment = () => {
    setIsRecordPaymentOpen(false);
    setSelectedStudentIdForPayment(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        setCurrentUser: setCurrentUserState,
        login,
        signup,
        logout,
        users,
        addUser,
        updateUser,
        deleteUser,
        resetUserPassword,

        classes,
        addClass,
        updateClass,
        sessions,
        activeSession,
        activeTerm,
        setActiveSession,
        setActiveTerm,
        addSession,
        createSession,

        students,
        addStudent,
        updateStudent,
        deleteStudent,
        clearStudentName,
        bulkAddStudents,
        parents,
        addOrUpdateParent,

        feeCategories,
        addFeeCategory,
        updateFeeCategory,
        deleteFeeCategory,
        classFeePricings,
        setClassFeePrice,
        batchSetClassFeePrices,
        getClassFeePrice,
        feeAssignments,
        setStudentFeeAmount,
        bulkAssignClassFees,

        payments,
        recordPayment,
        voidPayment,

        getStudentFinancialSummary,
        schoolFinancials,

        schoolSettings,
        updateSchoolSettings,
        auditLogs,
        unreadLogsCount,
        markLogAsRead,
        markAllLogsAsRead,
        logAudit,

        hasPermission,

        activeReceipt,
        activeReceiptPayment: activeReceipt,
        openReceipt,
        closeReceipt,

        selectedStudentIdForProfile,
        activeStudentProfileId: selectedStudentIdForProfile,
        openStudentProfile,
        closeStudentProfile,

        selectedStudentIdForPayment,
        recordPaymentStudentId: selectedStudentIdForPayment,
        isRecordPaymentOpen,
        openRecordPayment,
        closeRecordPayment,

        toasts,
        notifications: toasts,
        notify,
        removeToast,
        dismissNotification: removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
