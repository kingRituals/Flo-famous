import {
  AcademicSession,
  AppUser,
  AuditLog,
  FeeCategory,
  ParentGuardian,
  PaymentTransaction,
  SchoolClass,
  SchoolSettings,
  Student,
  StudentFeeAssignment,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'flo_famous_clean_v1_users',
  CLASSES: 'flo_famous_clean_v1_classes',
  SESSIONS: 'flo_famous_clean_v1_sessions',
  STUDENTS: 'flo_famous_clean_v1_students',
  PARENTS: 'flo_famous_clean_v1_parents',
  FEE_CATEGORIES: 'flo_famous_clean_v1_fee_categories',
  FEE_ASSIGNMENTS: 'flo_famous_clean_v1_fee_assignments',
  PAYMENTS: 'flo_famous_clean_v1_payments',
  AUDIT_LOGS: 'flo_famous_clean_v1_audit_logs',
  SETTINGS: 'flo_famous_clean_v1_settings',
  CURRENT_USER: 'flo_famous_clean_v1_current_user',
};

// Initial Seed Data: Clean Slate Structure
const INITIAL_CLASSES: SchoolClass[] = [
  // Primary section (including Nursery)
  { id: 'cls-n1', name: 'Nursery 1', section: 'PRIMARY', order: 1, capacity: 25 },
  { id: 'cls-n2', name: 'Nursery 2', section: 'PRIMARY', order: 2, capacity: 25 },
  { id: 'cls-n3', name: 'Nursery 3', section: 'PRIMARY', order: 3, capacity: 25 },
  { id: 'cls-p1', name: 'Primary 1', section: 'PRIMARY', order: 4, capacity: 30 },
  { id: 'cls-p2', name: 'Primary 2', section: 'PRIMARY', order: 5, capacity: 30 },
  { id: 'cls-p3', name: 'Primary 3', section: 'PRIMARY', order: 6, capacity: 30 },
  { id: 'cls-p4', name: 'Primary 4', section: 'PRIMARY', order: 7, capacity: 30 },
  { id: 'cls-p5', name: 'Primary 5', section: 'PRIMARY', order: 8, capacity: 30 },

  // Junior Secondary
  { id: 'cls-j1', name: 'JSS 1', section: 'JUNIOR_SECONDARY', order: 9, capacity: 35 },
  { id: 'cls-j2', name: 'JSS 2', section: 'JUNIOR_SECONDARY', order: 10, capacity: 35 },
  { id: 'cls-j3', name: 'JSS 3', section: 'JUNIOR_SECONDARY', order: 11, capacity: 35 },

  // Senior Secondary
  { id: 'cls-s1', name: 'SS 1', section: 'SENIOR_SECONDARY', order: 12, capacity: 35 },
  { id: 'cls-s2', name: 'SS 2', section: 'SENIOR_SECONDARY', order: 13, capacity: 35 },
  { id: 'cls-s3', name: 'SS 3', section: 'SENIOR_SECONDARY', order: 14, capacity: 35 },
];

const INITIAL_SESSIONS: AcademicSession[] = [
  {
    id: '2026/2027',
    name: '2026/2027 Academic Session',
    isActive: true,
    startDate: '2026-09-07',
    endDate: '2027-07-23',
    terms: [
      { id: 'term-1', name: 'First Term', isActive: true, startDate: '2026-09-07', endDate: '2026-12-18' },
      { id: 'term-2', name: 'Second Term', isActive: false, startDate: '2027-01-11', endDate: '2027-04-09' },
      { id: 'term-3', name: 'Third Term', isActive: false, startDate: '2027-05-03', endDate: '2027-07-23' },
    ],
  },
];

// Host Admin & Authorized Staff
const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-golden-nwonu',
    name: 'Golden Nwonu',
    email: 'goldennwonu@gmail.com',
    username: 'goldennwonu',
    role: 'Super Admin',
    status: 'Active',
    password: 'admin123',
    createdAt: '2026-09-21',
    lastLogin: '2026-09-21 09:00:00 AM',
    isMainAdmin: true,
  },
  {
    id: 'usr-bursar',
    name: 'Mrs. Chioma Eze',
    email: 'bursar@flofamous.edu.ng',
    username: 'bursar',
    role: 'Accountant',
    status: 'Active',
    password: 'admin123',
    createdAt: '2026-09-21',
  },
  {
    id: 'usr-registrar',
    name: 'Mr. Babatunde Nwachukwu',
    email: 'registrar@flofamous.edu.ng',
    username: 'registrar',
    role: 'Registrar',
    status: 'Active',
    password: 'admin123',
    createdAt: '2026-09-21',
  },
  {
    id: 'usr-teacher-pri4',
    name: 'Mrs. Oluchi Okafor',
    email: 'teacher.pri4@flofamous.edu.ng',
    username: 'teacher.pri4',
    role: 'Teacher',
    status: 'Active',
    password: 'admin123',
    createdAt: '2026-09-21',
  },
];

const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'FLO Famous Secondary and Primary School',
  schoolMotto: 'Excellence in Knowledge, Character and Leadership',
  schoolLogo: '/school_logo.png',
  address: 'Plot 18 FLO Famous Way, New Independence Layout, Enugu State, Nigeria',
  phone: '+234 (0) 803 456 7890 / +234 812 345 6789',
  email: 'goldennwonu@gmail.com',
  website: 'https://flofamous.edu.ng',
  currencySymbol: '₦',
  currencyCode: 'NGN',
  defaultAcademicSession: '2026/2027',
  currentTerm: 'First Term',
  receiptPrefix: 'FLO-RCP',
  studentIdPrefix: 'FLO',
  reportNote: 'This is an official computer-generated document from the FLO Famous School Management System.',
  authorizedSignatoryName: 'Golden Nwonu',
  authorizedSignatoryTitle: 'Host Administrator & Director',
  bankName: 'First Bank of Nigeria',
  accountName: 'FLO Famous School Ltd',
  accountNumber: '2034981122',
  receiptFooterText: 'Thank you for your prompt fee payment. Excellence in character and learning.',
};

// Initial Fee Columns (can be added/managed by the admin)
const INITIAL_FEE_CATEGORIES: FeeCategory[] = [
  { id: 'fee-1', name: 'School Fees', description: 'Tuition and instructional fees per term', defaultAmount: 150000, applicableSection: 'ALL' },
  { id: 'fee-2', name: 'Books & Textbooks', description: 'Curriculum books, workbooks & stationary', defaultAmount: 20000, applicableSection: 'ALL' },
  { id: 'fee-3', name: 'Lesson Fee', description: 'After-school preparatory lessons', defaultAmount: 10000, applicableSection: 'ALL' },
  { id: 'fee-4', name: 'Uniform & Sportswear', description: 'School uniform sets and PE sportswear', defaultAmount: 15000, applicableSection: 'ALL' },
  { id: 'fee-5', name: 'Examination Fee', description: 'Mid-term and end-of-term standardized assessments', defaultAmount: 12000, applicableSection: 'ALL' },
  { id: 'fee-6', name: 'ICT & Lab Levy', description: 'Practical coding, STEM and computer laboratory', defaultAmount: 15000, applicableSection: 'ALL' },
  { id: 'fee-7', name: 'PTA Levy', description: 'Parent-Teacher Association termly developmental levy', defaultAmount: 5000, applicableSection: 'ALL' },
  { id: 'fee-8', name: 'Sports Fee', description: 'Inter-house sports and physical training', defaultAmount: 5000, applicableSection: 'ALL' },
  { id: 'fee-9', name: 'Development Levy', description: 'School infrastructure and facilities fund', defaultAmount: 10000, applicableSection: 'ALL' },
];

// CLEAN SLATE: Zero records added
const INITIAL_PARENTS: ParentGuardian[] = [];
const INITIAL_STUDENTS: Student[] = [];
const INITIAL_FEE_ASSIGNMENTS: StudentFeeAssignment[] = [];
const INITIAL_PAYMENTS: PaymentTransaction[] = [];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-clean-slate-init',
    timestamp: new Date().toISOString(),
    date: '2026-09-21',
    time: '09:00:00 AM',
    user: 'Golden Nwonu',
    userEmail: 'goldennwonu@gmail.com',
    userId: 'usr-golden-nwonu',
    userRole: 'Super Admin',
    action: 'System Initialized',
    affectedRecord: 'FLO Famous Portal Clean Slate',
    description: 'System initialized to clean slate. Host Admin set to Golden Nwonu (goldennwonu@gmail.com). No students or payment records pre-loaded.',
    category: 'SYSTEM',
    severity: 'info',
    read: false,
  },
];

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from storage, using fallback`, err);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage`, err);
  }
};

export const getInitialData = () => {
  return {
    classes: loadFromStorage<SchoolClass[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES),
    sessions: loadFromStorage<AcademicSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS),
    users: loadFromStorage<AppUser[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
    settings: loadFromStorage<SchoolSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
    feeCategories: loadFromStorage<FeeCategory[]>(STORAGE_KEYS.FEE_CATEGORIES, INITIAL_FEE_CATEGORIES),
    parents: loadFromStorage<ParentGuardian[]>(STORAGE_KEYS.PARENTS, INITIAL_PARENTS),
    students: loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
    feeAssignments: loadFromStorage<StudentFeeAssignment[]>(STORAGE_KEYS.FEE_ASSIGNMENTS, INITIAL_FEE_ASSIGNMENTS),
    payments: loadFromStorage<PaymentTransaction[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
    auditLogs: loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
    currentUser: loadFromStorage<AppUser>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]),
  };
};

export const resetToFactoryDefaults = () => {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.FEE_CATEGORIES, JSON.stringify(INITIAL_FEE_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.PARENTS, JSON.stringify(INITIAL_PARENTS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.FEE_ASSIGNMENTS, JSON.stringify(INITIAL_FEE_ASSIGNMENTS));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  window.location.reload();
};

export { STORAGE_KEYS };
