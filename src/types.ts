export type SchoolSection = 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY';

export type Gender = 'Male' | 'Female';

export type AcademicTerm = 'First Term' | 'Second Term' | 'Third Term' | string;

export type StudentStatus = 'Active' | 'Graduated' | 'Withdrawn' | 'Suspended' | 'Archived';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'POS' | 'Card' | 'Online Payment' | 'Other';

export type PaymentStatus = 'NOT PAID' | 'PARTIALLY PAID' | 'FULLY PAID' | 'OVERPAID';

export type UserRole =
  | 'Admin'
  | 'Accounts'
  | 'Cashier'
  | 'Teacher'
  | 'Super Admin'
  | 'Administrator'
  | 'Accountant'
  | 'Registrar'
  | 'Viewer';

export type UserStatus = 'Active' | 'Disabled' | 'Inactive';

export interface UserPermission {
  canManageUsers: boolean;
  canManageClasses: boolean;
  canManageSessions: boolean;
  canManageFees: boolean;
  canEditStudent: boolean;
  canDeleteStudent: boolean;
  canRecordPayment: boolean;
  canVoidPayment: boolean;
  canViewReports: boolean;
  canViewAuditLogs: boolean;
  canManageSettings: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
  isMainAdmin?: boolean;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g., 'Primary 4', 'JSS 1', 'SS 2'
  section: SchoolSection;
  order: number;
  classTeacher?: string;
  capacity?: number;
}

export interface AcademicSession {
  id: string; // e.g., '2026/2027'
  name: string;
  isActive: boolean;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
  terms: {
    id: string;
    name: 'First Term' | 'Second Term' | 'Third Term' | string;
    isActive: boolean;
    startDate: string;
    endDate: string;
  }[];
}

export interface Student {
  id: string; // e.g., 'FLO-2026-0001'
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  photoUrl?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address: string;
  section: SchoolSection;
  classId: string;
  className: string;
  academicSession: string; // e.g., '2026/2027'
  admissionDate: string;
  status: StudentStatus;
  previousSchool?: string;
  notes?: string;
}

export interface ParentGuardian {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  relationship: string; // Father, Mother, Guardian
  studentIds: string[];
}

export interface FeeCategory {
  id: string;
  name: string; // e.g. "School Fees", "Books", "Uniform", "Lesson Fee"
  description?: string;
  isCustom?: boolean;
  defaultAmount: number;
  applicableSection?: SchoolSection | 'ALL';
  applicableSections?: SchoolSection[];
  applicableClassId?: string | 'ALL';
}

export interface ClassFeePricing {
  id: string; // e.g. `${classId}_${academicSession}_${term || 'ALL'}`
  classId: string;
  className: string;
  section: SchoolSection;
  academicSession: string; // e.g. '2026/2027'
  term?: string; // 'First Term' | 'Second Term' | 'Third Term' | 'ALL'
  tuitionFee: number; // Base School Fees / Tuition amount
  otherFees?: { [feeCategoryId: string]: number };
  totalFee: number;
  lastUpdated?: string;
}

export interface StudentFeeAssignment {
  id: string;
  studentId: string;
  academicSession: string;
  term: string;
  feeCategoryId: string;
  feeCategoryName: string;
  amount: number;
  dueDate?: string;
  isCustom?: boolean;
}

export interface PaymentTransaction {
  id: string; // e.g., 'FLO-RCP-20260921-0001'
  receiptNumber: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  academicSession: string;
  term: string;
  feeCategory: string; // or 'General School Fees & Levies'
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  paymentDate: string; // YYYY-MM-DD
  paymentTime: string; // HH:MM:SS
  recordedBy: string; // User Name
  recordedByUserId: string;
  notes?: string;
  status: 'COMPLETED' | 'VOIDED';
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  previousBalance: number;
  newBalance: number;
}

export interface AuditLog {
  id: string;
  timestamp: string | { date: string; time: string }; // ISO string or split
  date: string;
  time: string;
  user: string;
  userName?: string;
  userEmail?: string;
  userId: string;
  userRole: UserRole;
  action: string;
  affectedRecord: string;
  studentId?: string;
  description: string;
  details?: string;
  category?: 'FINANCIAL' | 'STUDENT' | 'FEE' | 'AUTH' | 'SYSTEM' | 'USER' | 'YEAR' | 'COLUMN' | string;
  ipAddress?: string;
  severity?: 'info' | 'warning' | 'critical';
  read?: boolean;
}

export interface SchoolSettings {
  schoolName: string;
  schoolMotto: string;
  schoolLogo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currencySymbol: string; // ₦
  currencyCode: string; // NGN
  currency?: string;
  defaultAcademicSession: string;
  currentTerm: string;
  receiptPrefix: string; // FLO-RCP
  studentIdPrefix: string; // FLO
  reportNote: string;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  receiptFooterText?: string;
}

export interface StudentFinancialSummary {
  studentId: string;
  totalExpected: number;
  totalPaid: number;
  outstanding: number;
  percentagePaid: number;
  status: PaymentStatus;
  feeBreakdown: { [categoryName: string]: number };
}
