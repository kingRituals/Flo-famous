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
  UserRole,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'flo_famous_clean_v1_users',
  CLASSES: 'flo_famous_clean_v1_classes',
  SESSIONS: 'flo_famous_clean_v1_sessions',
  STUDENTS: 'flo_famous_clean_v1_students',
  PARENTS: 'flo_famous_clean_v1_parents',
  FEE_CATEGORIES: 'flo_famous_clean_v1_fee_categories',
  FEE_ASSIGNMENTS: 'flo_famous_clean_v1_fee_assignments',
  CLASS_FEE_PRICINGS: 'flo_famous_clean_v1_class_fee_pricings',
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

// Authorized Staff Profiles - Strictly Titles: Admin, Accounts, Cashier, Teacher
const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-admin',
    name: 'Admin',
    email: 'flofamous.edu.ng',
    username: 'admin',
    role: 'Admin',
    status: 'Active',
    password: 'Flo1234',
    createdAt: '2026-09-21',
    lastLogin: '2026-09-21 09:00:00 AM',
    isMainAdmin: true,
  },
  {
    id: 'usr-accounts',
    name: 'Accounts',
    email: 'accounts@flofamous.edu.ng',
    username: 'accounts',
    role: 'Accounts',
    status: 'Active',
    password: 'Flo1234',
    createdAt: '2026-09-21',
  },
  {
    id: 'usr-cashier',
    name: 'Cashier',
    email: 'cashier@flofamous.edu.ng',
    username: 'cashier',
    role: 'Cashier',
    status: 'Active',
    password: 'Flo1234',
    createdAt: '2026-09-21',
  },
  {
    id: 'usr-teacher',
    name: 'Teacher',
    email: 'teacher@flofamous.edu.ng',
    username: 'teacher',
    role: 'Teacher',
    status: 'Active',
    password: 'Flo1234',
    createdAt: '2026-09-21',
  },
];

const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'FLO Famous Secondary and Primary School',
  schoolMotto: 'Excellence in Knowledge, Character and Leadership',
  schoolLogo: '/school_logo.png',
  address: 'Plot 18 FLO Famous Way, New Independence Layout, Enugu State, Nigeria',
  phone: '+234 (0) 803 456 7890 / +234 812 345 6789',
  email: 'flofamous.edu.ng',
  website: 'https://flofamous.edu.ng',
  currencySymbol: '₦',
  currencyCode: 'NGN',
  defaultAcademicSession: '2026/2027',
  currentTerm: 'First Term',
  receiptPrefix: 'FLO-RCP',
  studentIdPrefix: 'FLO',
  reportNote: 'This is an official computer-generated document from the FLO Famous School Management System.',
  authorizedSignatoryName: 'Admin',
  authorizedSignatoryTitle: 'Administrator',
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

// Initial Class Fee Pricing matrix (Session 2026/2027)
const INITIAL_CLASS_FEE_PRICINGS: ClassFeePricing[] = INITIAL_CLASSES.map((cls) => {
  let tuition = 150000;
  if (cls.name.startsWith('Nursery')) tuition = 120000;
  else if (cls.section === 'PRIMARY') tuition = 145000;
  else if (cls.section === 'JUNIOR_SECONDARY') tuition = 175000;
  else if (cls.section === 'SENIOR_SECONDARY') tuition = 195000;

  return {
    id: `${cls.id}_2026/2027_ALL`,
    classId: cls.id,
    className: cls.name,
    section: cls.section,
    academicSession: '2026/2027',
    term: 'ALL',
    tuitionFee: tuition,
    totalFee: tuition,
  };
});

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-clean-slate-init',
    timestamp: new Date().toISOString(),
    date: '2026-09-21',
    time: '09:00:00 AM',
    user: 'Admin',
    userEmail: 'flofamous.edu.ng',
    userId: 'usr-admin',
    userRole: 'Admin',
    action: 'System Initialized',
    affectedRecord: 'FLO Famous Portal Clean Slate',
    description: 'System initialized. Primary Administrator set to Admin (flofamous.edu.ng). Security lock configured.',
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
  // Load users and ensure Title-based users (Admin, Accounts, Cashier, Teacher)
  const storedUsers = loadFromStorage<AppUser[]>(STORAGE_KEYS.USERS, INITIAL_USERS);

  // Normalize all users to purely Title-based names and roles
  const normalizedUsers: AppUser[] = (storedUsers && storedUsers.length > 0 ? storedUsers : INITIAL_USERS).map((u) => {
    let name = u.name;
    let role = u.role as UserRole;
    let username = u.username;
    let email = u.email;

    if (
      name.toLowerCase().includes('chioma') ||
      username === 'bursar' ||
      role === 'Accountant' ||
      role === 'Accounts' ||
      name === 'Accounts'
    ) {
      name = 'Accounts';
      role = 'Accounts';
      username = 'accounts';
      email = email.includes('flofamous') ? 'accounts@flofamous.edu.ng' : email;
    } else if (
      name.toLowerCase().includes('nwachukwu') ||
      username === 'registrar' ||
      role === 'Registrar' ||
      role === 'Cashier' ||
      name === 'Cashier'
    ) {
      name = 'Cashier';
      role = 'Cashier';
      username = 'cashier';
      email = email.includes('flofamous') ? 'cashier@flofamous.edu.ng' : email;
    } else if (
      name.toLowerCase().includes('oluchi') ||
      name.toLowerCase().includes('okafor') ||
      role === 'Teacher' ||
      name === 'Teacher'
    ) {
      name = 'Teacher';
      role = 'Teacher';
      username = 'teacher';
      email = email.includes('flofamous') ? 'teacher@flofamous.edu.ng' : email;
    } else {
      name = 'Admin';
      role = 'Admin';
      username = 'admin';
      email = 'flofamous.edu.ng';
    }

    return {
      ...u,
      name,
      role,
      username,
      email,
      password: u.password || 'Flo1234',
    };
  });

  // Guarantee standard title profiles exist
  const standardTitleProfiles: { id: string; name: string; email: string; username: string; role: UserRole; isMainAdmin?: boolean }[] = [
    { id: 'usr-admin', name: 'Admin', email: 'flofamous.edu.ng', username: 'admin', role: 'Admin', isMainAdmin: true },
    { id: 'usr-accounts', name: 'Accounts', email: 'accounts@flofamous.edu.ng', username: 'accounts', role: 'Accounts' },
    { id: 'usr-cashier', name: 'Cashier', email: 'cashier@flofamous.edu.ng', username: 'cashier', role: 'Cashier' },
    { id: 'usr-teacher', name: 'Teacher', email: 'teacher@flofamous.edu.ng', username: 'teacher', role: 'Teacher' },
  ];

  const finalUsers: AppUser[] = [...normalizedUsers];
  for (const profile of standardTitleProfiles) {
    if (!finalUsers.some((u) => u.name === profile.name)) {
      finalUsers.push({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        username: profile.username,
        role: profile.role,
        status: 'Active',
        password: 'Flo1234',
        createdAt: '2026-09-21',
        isMainAdmin: profile.isMainAdmin,
      });
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(finalUsers));
  } catch {
    // Ignore storage quota
  }

  return {
    classes: loadFromStorage<SchoolClass[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES),
    sessions: loadFromStorage<AcademicSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS),
    users: finalUsers,
    settings: loadFromStorage<SchoolSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
    feeCategories: loadFromStorage<FeeCategory[]>(STORAGE_KEYS.FEE_CATEGORIES, INITIAL_FEE_CATEGORIES),
    classFeePricings: loadFromStorage<ClassFeePricing[]>(STORAGE_KEYS.CLASS_FEE_PRICINGS, INITIAL_CLASS_FEE_PRICINGS),
    parents: loadFromStorage<ParentGuardian[]>(STORAGE_KEYS.PARENTS, INITIAL_PARENTS),
    students: loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
    feeAssignments: loadFromStorage<StudentFeeAssignment[]>(STORAGE_KEYS.FEE_ASSIGNMENTS, INITIAL_FEE_ASSIGNMENTS),
    payments: loadFromStorage<PaymentTransaction[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
    auditLogs: loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
    // Crucial: on page refresh, currentUser is always null so the email/password lock screen is displayed!
    currentUser: null as AppUser | null,
  };
};

export const resetToFactoryDefaults = () => {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.FEE_CATEGORIES, JSON.stringify(INITIAL_FEE_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.CLASS_FEE_PRICINGS, JSON.stringify(INITIAL_CLASS_FEE_PRICINGS));
  localStorage.setItem(STORAGE_KEYS.PARENTS, JSON.stringify(INITIAL_PARENTS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.FEE_ASSIGNMENTS, JSON.stringify(INITIAL_FEE_ASSIGNMENTS));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.location.reload();
};

export { STORAGE_KEYS };
