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
  USERS: 'flo_famous_users_v2',
  CLASSES: 'flo_famous_classes_v2',
  SESSIONS: 'flo_famous_sessions_v2',
  STUDENTS: 'flo_famous_students_v2',
  PARENTS: 'flo_famous_parents_v2',
  FEE_CATEGORIES: 'flo_famous_fee_categories_v2',
  FEE_ASSIGNMENTS: 'flo_famous_fee_assignments_v2',
  PAYMENTS: 'flo_famous_payments_v2',
  AUDIT_LOGS: 'flo_famous_audit_logs_v2',
  SETTINGS: 'flo_famous_settings_v2',
  CURRENT_USER: 'flo_famous_current_user_v2',
};

// Initial Seed Data
const INITIAL_CLASSES: SchoolClass[] = [
  // Primary section (including Nursery)
  { id: 'cls-n1', name: 'Nursery 1', section: 'PRIMARY', order: 1, capacity: 25, classTeacher: 'Mrs. Patience Obi' },
  { id: 'cls-n2', name: 'Nursery 2', section: 'PRIMARY', order: 2, capacity: 25, classTeacher: 'Mrs. Gloria Danjuma' },
  { id: 'cls-n3', name: 'Nursery 3', section: 'PRIMARY', order: 3, capacity: 25, classTeacher: 'Miss Ngozi Eze' },
  { id: 'cls-p1', name: 'Primary 1', section: 'PRIMARY', order: 4, capacity: 30, classTeacher: 'Mr. Jude Nwachukwu' },
  { id: 'cls-p2', name: 'Primary 2', section: 'PRIMARY', order: 5, capacity: 30, classTeacher: 'Mrs. Funke Adeyemi' },
  { id: 'cls-p3', name: 'Primary 3', section: 'PRIMARY', order: 6, capacity: 30, classTeacher: 'Mr. Emmanuel Okon' },
  { id: 'cls-p4', name: 'Primary 4', section: 'PRIMARY', order: 7, capacity: 30, classTeacher: 'Mrs. Chika Nwonu' },
  { id: 'cls-p5', name: 'Primary 5', section: 'PRIMARY', order: 8, capacity: 30, classTeacher: 'Mr. Kenneth Okafor' },

  // Junior Secondary
  { id: 'cls-j1', name: 'JSS 1', section: 'JUNIOR_SECONDARY', order: 9, capacity: 35, classTeacher: 'Mr. Tunde Bakare' },
  { id: 'cls-j2', name: 'JSS 2', section: 'JUNIOR_SECONDARY', order: 10, capacity: 35, classTeacher: 'Mrs. Amina Bello' },
  { id: 'cls-j3', name: 'JSS 3', section: 'JUNIOR_SECONDARY', order: 11, capacity: 35, classTeacher: 'Mr. Ifeanyi Kalu' },

  // Senior Secondary
  { id: 'cls-s1', name: 'SS 1', section: 'SENIOR_SECONDARY', order: 12, capacity: 35, classTeacher: 'Dr. Samuel Alabi' },
  { id: 'cls-s2', name: 'SS 2', section: 'SENIOR_SECONDARY', order: 13, capacity: 35, classTeacher: 'Mrs. Victoria Ogundimu' },
  { id: 'cls-s3', name: 'SS 3', section: 'SENIOR_SECONDARY', order: 14, capacity: 35, classTeacher: 'Engr. Emeka Nwankwo' },
];

const INITIAL_SESSIONS: AcademicSession[] = [
  {
    id: '2026/2027',
    name: '2026/2027 Academic Session',
    isActive: true,
    terms: [
      { id: 'term-1', name: 'First Term', isActive: true, startDate: '2026-09-07', endDate: '2026-12-18' },
      { id: 'term-2', name: 'Second Term', isActive: false, startDate: '2027-01-11', endDate: '2027-04-09' },
      { id: 'term-3', name: 'Third Term', isActive: false, startDate: '2027-05-03', endDate: '2027-07-23' },
    ],
  },
  {
    id: '2025/2026',
    name: '2025/2026 Academic Session',
    isActive: false,
    terms: [
      { id: 'term-1', name: 'First Term', isActive: false, startDate: '2025-09-08', endDate: '2025-12-19' },
      { id: 'term-2', name: 'Second Term', isActive: false, startDate: '2026-01-12', endDate: '2026-04-10' },
      { id: 'term-3', name: 'Third Term', isActive: false, startDate: '2026-05-04', endDate: '2026-07-24' },
    ],
  },
];

const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-admin',
    name: 'Dr. Florence O. Nwonu',
    email: 'admin@flofamous.edu.ng',
    username: 'director',
    role: 'Super Admin',
    status: 'Active',
    createdAt: '2025-01-10',
    lastLogin: '2026-09-21 08:30:15 AM',
    isMainAdmin: true,
  },
  {
    id: 'usr-bursar',
    name: 'Mr. Chidi Eze',
    email: 'bursar@flofamous.edu.ng',
    username: 'accountant',
    role: 'Accountant',
    status: 'Active',
    createdAt: '2025-02-15',
    lastLogin: '2026-09-21 09:12:00 AM',
  },
  {
    id: 'usr-registrar',
    name: 'Mrs. Blessing Adebayo',
    email: 'registrar@flofamous.edu.ng',
    username: 'registrar',
    role: 'Registrar',
    status: 'Active',
    createdAt: '2025-03-01',
    lastLogin: '2026-09-20 02:45:10 PM',
  },
  {
    id: 'usr-teacher',
    name: 'Mr. Kenneth Okafor',
    email: 'teacher@flofamous.edu.ng',
    username: 'teacher',
    role: 'Teacher',
    status: 'Active',
    createdAt: '2025-04-10',
    lastLogin: '2026-09-19 11:15:30 AM',
  },
];

const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'FLO Famous Secondary and Primary School',
  schoolMotto: 'Excellence in Knowledge, Character and Leadership',
  schoolLogo: '/school_logo.png',
  address: 'Plot 18 FLO Famous Way, New Independence Layout, Enugu State, Nigeria',
  phone: '+234 (0) 803 456 7890 / +234 812 345 6789',
  email: 'admin@flofamous.edu.ng',
  website: 'https://flofamous.edu.ng',
  currencySymbol: '₦',
  currencyCode: 'NGN',
  defaultAcademicSession: '2026/2027',
  currentTerm: 'First Term',
  receiptPrefix: 'FLO-RCP',
  studentIdPrefix: 'FLO',
  reportNote: 'This is an official computer-generated document from the FLO Famous School Management System.',
  authorizedSignatoryName: 'Dr. Florence O. Nwonu',
  authorizedSignatoryTitle: 'School Director & Proprietress',
};

const INITIAL_FEE_CATEGORIES: FeeCategory[] = [
  { id: 'fee-1', name: 'School Fees', description: 'Tuition and instructional fees per term', defaultAmount: 150000 },
  { id: 'fee-2', name: 'Books & Textbooks', description: 'Curriculum books, workbooks & stationary', defaultAmount: 20000 },
  { id: 'fee-3', name: 'Lesson Fee', description: 'After-school preparatory and enrichment lessons', defaultAmount: 10000 },
  { id: 'fee-4', name: 'Uniform & Sportswear', description: 'School uniform sets, cardigans and PE kits', defaultAmount: 15000 },
  { id: 'fee-5', name: 'Examination Fee', description: 'Mid-term and end-of-term standardized tests', defaultAmount: 12000 },
  { id: 'fee-6', name: 'ICT & Computer Lab Fee', description: 'Practical coding, hardware and computer lab access', defaultAmount: 15000 },
  { id: 'fee-7', name: 'PTA Levy', description: 'Parent-Teacher Association termly developmental levy', defaultAmount: 5000 },
  { id: 'fee-8', name: 'Sports Fee', description: 'Inter-house sports and athletics coaching', defaultAmount: 5000 },
  { id: 'fee-9', name: 'Development Levy', description: 'Infrastructure and school development fund', defaultAmount: 10000 },
  { id: 'fee-10', name: 'Graduation Fee', description: 'Graduation ceremonies and yearbook for terminal classes', defaultAmount: 25000, applicableClassId: 'cls-p5' },
  { id: 'fee-11', name: 'Special Lesson', description: 'Targeted coaching for external examinations (WAEC/NECO/BECE)', defaultAmount: 10000, isCustom: true },
];

const INITIAL_PARENTS: ParentGuardian[] = [
  {
    id: 'prt-1',
    name: 'Mr. John Nwonu',
    phone: '08037654321',
    email: 'john.nwonu@yahoo.com',
    address: '14 Presidential Close, Independence Layout, Enugu',
    relationship: 'Father',
    studentIds: ['FLO-2026-0025', 'FLO-2026-0002', 'FLO-2026-0003'],
  },
  {
    id: 'prt-2',
    name: 'Mr. Anthony Okafor',
    phone: '08031234567',
    email: 'anthony.okafor@gmail.com',
    address: 'Plot 12 Independence Layout, Enugu',
    relationship: 'Father',
    studentIds: ['FLO-2026-0004'],
  },
  {
    id: 'prt-3',
    name: 'Alhaji Umar Bello',
    phone: '08029876543',
    email: 'umar.bello@yahoo.com',
    address: '15 Okigwe Road, Owerri',
    relationship: 'Father',
    studentIds: ['FLO-2026-0005'],
  },
  {
    id: 'prt-4',
    name: 'Barrister & Mrs. Michael Adebayo',
    phone: '08055443322',
    email: 'adebayo.legal@gmail.com',
    address: '22 Bisalla Road, Independence Layout, Enugu',
    relationship: 'Guardian',
    studentIds: ['FLO-2026-0006'],
  },
  {
    id: 'prt-5',
    name: 'Mrs. Chinyere Nwosu',
    phone: '08144332211',
    email: 'chinyere.nwosu@hotmail.com',
    address: '8 Ogui Road, Enugu',
    relationship: 'Mother',
    studentIds: ['FLO-2026-0007'],
  },
  {
    id: 'prt-6',
    name: 'Dr. Ibrahim Abubakar',
    phone: '08033322110',
    email: 'abubakar.med@gmail.com',
    address: '5 Golf Course Avenue, GRA, Enugu',
    relationship: 'Father',
    studentIds: ['FLO-2026-0008'],
  },
];

const INITIAL_STUDENTS: Student[] = [
  // Child 1 of John Nwonu
  {
    id: 'FLO-2026-0025',
    firstName: 'John',
    middleName: 'David',
    lastName: 'Nwonu',
    fullName: 'John David Nwonu',
    gender: 'Male',
    dateOfBirth: '2015-06-14',
    parentName: 'Mr. John Nwonu',
    parentPhone: '08037654321',
    parentEmail: 'john.nwonu@yahoo.com',
    address: '14 Presidential Close, Independence Layout, Enugu',
    section: 'PRIMARY',
    classId: 'cls-p4',
    className: 'Primary 4',
    academicSession: '2026/2027',
    admissionDate: '2023-09-10',
    status: 'Active',
    previousSchool: 'Springfield Academy',
    notes: 'Well behaved, class representative',
  },
  // Child 2 of John Nwonu
  {
    id: 'FLO-2026-0002',
    firstName: 'Mary',
    middleName: 'Chiamaka',
    lastName: 'Nwonu',
    fullName: 'Mary Chiamaka Nwonu',
    gender: 'Female',
    dateOfBirth: '2013-02-18',
    parentName: 'Mr. John Nwonu',
    parentPhone: '08037654321',
    parentEmail: 'john.nwonu@yahoo.com',
    address: '14 Presidential Close, Independence Layout, Enugu',
    section: 'JUNIOR_SECONDARY',
    classId: 'cls-j2',
    className: 'JSS 2',
    academicSession: '2026/2027',
    admissionDate: '2024-09-09',
    status: 'Active',
    notes: 'Member of Drama and Debate Society',
  },
  // Child 3 of John Nwonu
  {
    id: 'FLO-2026-0003',
    firstName: 'Sarah',
    middleName: 'Oluchi',
    lastName: 'Nwonu',
    fullName: 'Sarah Oluchi Nwonu',
    gender: 'Female',
    dateOfBirth: '2021-04-22',
    parentName: 'Mr. John Nwonu',
    parentPhone: '08037654321',
    parentEmail: 'john.nwonu@yahoo.com',
    address: '14 Presidential Close, Independence Layout, Enugu',
    section: 'PRIMARY',
    classId: 'cls-n3',
    className: 'Nursery 3',
    academicSession: '2026/2027',
    admissionDate: '2025-09-08',
    status: 'Active',
    notes: 'Enjoys arts and rhymes',
  },
  // Other students
  {
    id: 'FLO-2026-0004',
    firstName: 'Emeka',
    middleName: 'Victor',
    lastName: 'Okafor',
    fullName: 'Emeka Victor Okafor',
    gender: 'Male',
    dateOfBirth: '2014-05-12',
    parentName: 'Mr. Anthony Okafor',
    parentPhone: '08031234567',
    parentEmail: 'anthony.okafor@gmail.com',
    address: 'Plot 12 Independence Layout, Enugu',
    section: 'PRIMARY',
    classId: 'cls-p5',
    className: 'Primary 5',
    academicSession: '2026/2027',
    admissionDate: '2022-09-12',
    status: 'Active',
    notes: 'Graduating class prefect',
  },
  {
    id: 'FLO-2026-0005',
    firstName: 'Amina',
    middleName: 'Zainab',
    lastName: 'Bello',
    fullName: 'Amina Zainab Bello',
    gender: 'Female',
    dateOfBirth: '2012-08-20',
    parentName: 'Alhaji Umar Bello',
    parentPhone: '08029876543',
    parentEmail: 'umar.bello@yahoo.com',
    address: '15 Okigwe Road, Owerri',
    section: 'JUNIOR_SECONDARY',
    classId: 'cls-j1',
    className: 'JSS 1',
    academicSession: '2026/2027',
    admissionDate: '2026-09-01',
    status: 'Active',
    previousSchool: 'Federal Staff Primary School',
  },
  {
    id: 'FLO-2026-0006',
    firstName: 'Tunde',
    middleName: 'Michael',
    lastName: 'Adebayo',
    fullName: 'Tunde Michael Adebayo',
    gender: 'Male',
    dateOfBirth: '2009-11-03',
    parentName: 'Barrister & Mrs. Michael Adebayo',
    parentPhone: '08055443322',
    parentEmail: 'adebayo.legal@gmail.com',
    address: '22 Bisalla Road, Independence Layout, Enugu',
    section: 'SENIOR_SECONDARY',
    classId: 'cls-s2',
    className: 'SS 2',
    academicSession: '2026/2027',
    admissionDate: '2023-09-11',
    status: 'Active',
    notes: 'Science department head student',
  },
  {
    id: 'FLO-2026-0007',
    firstName: 'Chinelo',
    middleName: 'Grace',
    lastName: 'Nwosu',
    fullName: 'Chinelo Grace Nwosu',
    gender: 'Female',
    dateOfBirth: '2016-09-30',
    parentName: 'Mrs. Chinyere Nwosu',
    parentPhone: '08144332211',
    parentEmail: 'chinyere.nwosu@hotmail.com',
    address: '8 Ogui Road, Enugu',
    section: 'PRIMARY',
    classId: 'cls-p3',
    className: 'Primary 3',
    academicSession: '2026/2027',
    admissionDate: '2024-09-10',
    status: 'Active',
  },
  {
    id: 'FLO-2026-0008',
    firstName: 'Fatima',
    middleName: 'Hauwa',
    lastName: 'Abubakar',
    fullName: 'Fatima Hauwa Abubakar',
    gender: 'Female',
    dateOfBirth: '2008-03-15',
    parentName: 'Dr. Ibrahim Abubakar',
    parentPhone: '08033322110',
    parentEmail: 'abubakar.med@gmail.com',
    address: '5 Golf Course Avenue, GRA, Enugu',
    section: 'SENIOR_SECONDARY',
    classId: 'cls-s3',
    className: 'SS 3',
    academicSession: '2026/2027',
    admissionDate: '2021-09-13',
    status: 'Active',
    notes: 'Senior Girl Prefect, preparing for WAEC/NECO',
  },
  {
    id: 'FLO-2026-0009',
    firstName: 'Daniel',
    middleName: 'Chukwudi',
    lastName: 'Eze',
    fullName: 'Daniel Chukwudi Eze',
    gender: 'Male',
    dateOfBirth: '2018-07-09',
    parentName: 'Engr. Festus Eze',
    parentPhone: '08066554433',
    address: '30 Zik Avenue, Uwani, Enugu',
    section: 'PRIMARY',
    classId: 'cls-p1',
    className: 'Primary 1',
    academicSession: '2026/2027',
    admissionDate: '2025-09-08',
    status: 'Active',
  },
  {
    id: 'FLO-2026-0010',
    firstName: 'Kemi',
    middleName: 'Folake',
    lastName: 'Adeleke',
    fullName: 'Kemi Folake Adeleke',
    gender: 'Female',
    dateOfBirth: '2011-12-05',
    parentName: 'Mr. Wale Adeleke',
    parentPhone: '08077889900',
    address: '10 Chime Avenue, New Haven, Enugu',
    section: 'JUNIOR_SECONDARY',
    classId: 'cls-j3',
    className: 'JSS 3',
    academicSession: '2026/2027',
    admissionDate: '2024-09-09',
    status: 'Active',
    notes: 'Junior Prefect',
  },
];

// Seed Fee Assignments matching prompt's exact example:
// John David (FLO-2026-0025, Primary 4):
// School Fees: ₦150,000 | Books: ₦20,000 | Lesson Fee: ₦10,000 | Uniform: ₦15,000 -> Total Expected: ₦195,000
const INITIAL_FEE_ASSIGNMENTS: StudentFeeAssignment[] = [
  // John David (Primary 4)
  { id: 'fa-1', studentId: 'FLO-2026-0025', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-1', feeCategoryName: 'School Fees', amount: 150000 },
  { id: 'fa-2', studentId: 'FLO-2026-0025', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-2', feeCategoryName: 'Books', amount: 20000 },
  { id: 'fa-3', studentId: 'FLO-2026-0025', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-3', feeCategoryName: 'Lesson Fee', amount: 10000 },
  { id: 'fa-4', studentId: 'FLO-2026-0025', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-4', feeCategoryName: 'Uniform', amount: 15000 },

  // Mary Chiamaka (JSS 2)
  { id: 'fa-5', studentId: 'FLO-2026-0002', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-1', feeCategoryName: 'School Fees', amount: 180000 },
  { id: 'fa-6', studentId: 'FLO-2026-0002', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-2', feeCategoryName: 'Books', amount: 25000 },
  { id: 'fa-7', studentId: 'FLO-2026-0002', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-3', feeCategoryName: 'Lesson Fee', amount: 15000 },
  { id: 'fa-8', studentId: 'FLO-2026-0002', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-6', feeCategoryName: 'ICT & Computer Lab Fee', amount: 15000 },

  // Sarah Oluchi (Nursery 3)
  { id: 'fa-9', studentId: 'FLO-2026-0003', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-1', feeCategoryName: 'School Fees', amount: 130000 },
  { id: 'fa-10', studentId: 'FLO-2026-0003', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-2', feeCategoryName: 'Books', amount: 15000 },
  { id: 'fa-11', studentId: 'FLO-2026-0003', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-4', feeCategoryName: 'Uniform', amount: 12000 },

  // Emeka Victor Okafor (Primary 5) - Includes Graduation Fee (Prompt example)
  { id: 'fa-12', studentId: 'FLO-2026-0004', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-1', feeCategoryName: 'School Fees', amount: 150000 },
  { id: 'fa-13', studentId: 'FLO-2026-0004', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-2', feeCategoryName: 'Books', amount: 20000 },
  { id: 'fa-14', studentId: 'FLO-2026-0004', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-3', feeCategoryName: 'Lesson Fee', amount: 10000 },
  { id: 'fa-15', studentId: 'FLO-2026-0004', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-10', feeCategoryName: 'Graduation Fee', amount: 25000 },

  // Amina Zainab Bello (JSS 1)
  { id: 'fa-16', studentId: 'FLO-2026-0005', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-1', feeCategoryName: 'School Fees', amount: 180000 },
  { id: 'fa-17', studentId: 'FLO-2026-0005', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-2', feeCategoryName: 'Books', amount: 25000 },
  { id: 'fa-18', studentId: 'FLO-2026-0005', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-4', feeCategoryName: 'Uniform', amount: 20000 },

  // Tunde Adebayo (SS 2)
  { id: 'fa-19', studentId: 'FLO-2026-0006', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-1', feeCategoryName: 'School Fees', amount: 210000 },
  { id: 'fa-20', studentId: 'FLO-2026-0006', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-2', feeCategoryName: 'Books', amount: 30000 },
  { id: 'fa-21', studentId: 'FLO-2026-0006', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-3', feeCategoryName: 'Lesson Fee', amount: 15000 },
  { id: 'fa-22', studentId: 'FLO-2026-0006', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-6', feeCategoryName: 'ICT & Computer Lab Fee', amount: 15000 },

  // Chinelo Grace Nwosu (Primary 3)
  { id: 'fa-23', studentId: 'FLO-2026-0007', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-1', feeCategoryName: 'School Fees', amount: 150000 },
  { id: 'fa-24', studentId: 'FLO-2026-0007', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-2', feeCategoryName: 'Books', amount: 20000 },

  // Fatima Abubakar (SS 3)
  { id: 'fa-25', studentId: 'FLO-2026-0008', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-1', feeCategoryName: 'School Fees', amount: 220000 },
  { id: 'fa-26', studentId: 'FLO-2026-0008', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-5', feeCategoryName: 'Examination Fee', amount: 45000 },
  { id: 'fa-27', studentId: 'FLO-2026-0008', academicSession: '2026/2027', term: 'First Term', feeCategoryId: 'fee-11', feeCategoryName: 'Special Lesson', amount: 20000 },
];

// Seed Payments matching prompt's exact example:
// John David: Total Expected: ₦195,000 | Total Paid: ₦120,000 | Outstanding: ₦75,000
// Via installments: ₦50,000 + ₦40,000 + ₦30,000 = ₦120,000!
const INITIAL_PAYMENTS: PaymentTransaction[] = [
  // John David Installment 1: ₦50,000
  {
    id: 'pay-1',
    receiptNumber: 'FLO-RCP-20260908-0001',
    studentId: 'FLO-2026-0025',
    studentName: 'John David Nwonu',
    classId: 'cls-p4',
    className: 'Primary 4',
    academicSession: '2026/2027',
    term: 'First Term',
    feeCategory: 'School Fees (Part 1)',
    amount: 50000,
    paymentMethod: 'Bank Transfer',
    transactionReference: 'TRX-ZEN-88492019',
    paymentDate: '2026-09-08',
    paymentTime: '09:15:22 AM',
    recordedBy: 'Mr. Chidi Eze',
    recordedByUserId: 'usr-bursar',
    notes: 'First installment paid via Zenith Bank transfer',
    status: 'COMPLETED',
    previousBalance: 195000,
    newBalance: 145000,
  },
  // John David Installment 2: ₦40,000
  {
    id: 'pay-2',
    receiptNumber: 'FLO-RCP-20260914-0002',
    studentId: 'FLO-2026-0025',
    studentName: 'John David Nwonu',
    classId: 'cls-p4',
    className: 'Primary 4',
    academicSession: '2026/2027',
    term: 'First Term',
    feeCategory: 'Books & School Fees',
    amount: 40000,
    paymentMethod: 'POS',
    transactionReference: 'POS-GTB-553210',
    paymentDate: '2026-09-14',
    paymentTime: '11:42:05 AM',
    recordedBy: 'Mr. Chidi Eze',
    recordedByUserId: 'usr-bursar',
    notes: 'Paid at school bursary POS counter',
    status: 'COMPLETED',
    previousBalance: 145000,
    newBalance: 105000,
  },
  // John David Installment 3: ₦30,000 -> Total Paid: ₦120,000; Balance: ₦75,000
  {
    id: 'pay-3',
    receiptNumber: 'FLO-RCP-20260921-0003',
    studentId: 'FLO-2026-0025',
    studentName: 'John David Nwonu',
    classId: 'cls-p4',
    className: 'Primary 4',
    academicSession: '2026/2027',
    term: 'First Term',
    feeCategory: 'Lesson & Uniform Fee',
    amount: 30000,
    paymentMethod: 'Cash',
    transactionReference: 'CSH-REC-0025',
    paymentDate: '2026-09-21',
    paymentTime: '08:45:10 AM',
    recordedBy: 'Mr. Chidi Eze',
    recordedByUserId: 'usr-bursar',
    notes: 'Cash payment from father',
    status: 'COMPLETED',
    previousBalance: 105000,
    newBalance: 75000,
  },

  // Mary Chiamaka: Full payment ₦235,000
  {
    id: 'pay-4',
    receiptNumber: 'FLO-RCP-20260910-0004',
    studentId: 'FLO-2026-0002',
    studentName: 'Mary Chiamaka Nwonu',
    classId: 'cls-j2',
    className: 'JSS 2',
    academicSession: '2026/2027',
    term: 'First Term',
    feeCategory: 'Full Term Tuition & Levies',
    amount: 235000,
    paymentMethod: 'Bank Transfer',
    transactionReference: 'TRX-FBN-9031244',
    paymentDate: '2026-09-10',
    paymentTime: '10:05:40 AM',
    recordedBy: 'Mr. Chidi Eze',
    recordedByUserId: 'usr-bursar',
    notes: 'Paid in full for 1st Term',
    status: 'COMPLETED',
    previousBalance: 235000,
    newBalance: 0,
  },

  // Sarah Oluchi (Nursery 3): ₦157,000 full
  {
    id: 'pay-5',
    receiptNumber: 'FLO-RCP-20260910-0005',
    studentId: 'FLO-2026-0003',
    studentName: 'Sarah Oluchi Nwonu',
    classId: 'cls-n3',
    className: 'Nursery 3',
    academicSession: '2026/2027',
    term: 'First Term',
    feeCategory: 'Comprehensive Nursery Fee',
    amount: 157000,
    paymentMethod: 'Bank Transfer',
    transactionReference: 'TRX-FBN-9031245',
    paymentDate: '2026-09-10',
    paymentTime: '10:12:15 AM',
    recordedBy: 'Mr. Chidi Eze',
    recordedByUserId: 'usr-bursar',
    notes: 'Paid in full together with sister Mary',
    status: 'COMPLETED',
    previousBalance: 157000,
    newBalance: 0,
  },

  // Emeka Victor Okafor (Primary 5): Expected ₦205,000 | Paid ₦100,000 | Balance ₦105,000
  {
    id: 'pay-6',
    receiptNumber: 'FLO-RCP-20260912-0006',
    studentId: 'FLO-2026-0004',
    studentName: 'Emeka Victor Okafor',
    classId: 'cls-p5',
    className: 'Primary 5',
    academicSession: '2026/2027',
    term: 'First Term',
    feeCategory: 'Tuition Deposit',
    amount: 100000,
    paymentMethod: 'Bank Transfer',
    transactionReference: 'TRX-UBA-1123490',
    paymentDate: '2026-09-12',
    paymentTime: '01:20:00 PM',
    recordedBy: 'Mr. Chidi Eze',
    recordedByUserId: 'usr-bursar',
    notes: 'Deposit; balance to be paid before mid-term',
    status: 'COMPLETED',
    previousBalance: 205000,
    newBalance: 105000,
  },

  // Amina Zainab Bello (JSS 1): Expected ₦225,000 | Paid ₦225,000
  {
    id: 'pay-7',
    receiptNumber: 'FLO-RCP-20260915-0007',
    studentId: 'FLO-2026-0005',
    studentName: 'Amina Zainab Bello',
    classId: 'cls-j1',
    className: 'JSS 1',
    academicSession: '2026/2027',
    term: 'First Term',
    feeCategory: 'JSS 1 Admission Package',
    amount: 225000,
    paymentMethod: 'Card',
    transactionReference: 'CRD-ACC-774921',
    paymentDate: '2026-09-15',
    paymentTime: '02:18:45 PM',
    recordedBy: 'Mrs. Blessing Adebayo',
    recordedByUserId: 'usr-registrar',
    notes: 'Online card payment confirmed by registrar',
    status: 'COMPLETED',
    previousBalance: 225000,
    newBalance: 0,
  },

  // Today's payment: Chinelo Grace Nwosu (Primary 3): ₦80,000
  {
    id: 'pay-8',
    receiptNumber: 'FLO-RCP-20260921-0008',
    studentId: 'FLO-2026-0007',
    studentName: 'Chinelo Grace Nwosu',
    classId: 'cls-p3',
    className: 'Primary 3',
    academicSession: '2026/2027',
    term: 'First Term',
    feeCategory: 'School Fees Part Payment',
    amount: 80000,
    paymentMethod: 'POS',
    transactionReference: 'POS-OPAY-44120',
    paymentDate: '2026-09-21',
    paymentTime: '09:30:18 AM',
    recordedBy: 'Mr. Chidi Eze',
    recordedByUserId: 'usr-bursar',
    notes: 'POS payment this morning',
    status: 'COMPLETED',
    previousBalance: 170000,
    newBalance: 90000,
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-07T08:00:00Z',
    date: '2026-09-07',
    time: '08:00:00 AM',
    user: 'Dr. Florence O. Nwonu',
    userId: 'usr-admin',
    userRole: 'Super Admin',
    action: 'Session Activated',
    affectedRecord: '2026/2027 First Term',
    description: 'Activated 2026/2027 academic session and First Term for the new school year.',
    severity: 'info',
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-08T09:15:22Z',
    date: '2026-09-08',
    time: '09:15:22 AM',
    user: 'Mr. Chidi Eze',
    userId: 'usr-bursar',
    userRole: 'Accountant',
    action: 'Payment Recorded',
    affectedRecord: 'FLO-RCP-20260908-0001 (John David Nwonu)',
    description: 'Recorded installment payment of ₦50,000 for John David Nwonu via Bank Transfer.',
    severity: 'info',
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-12T14:10:00Z',
    date: '2026-09-12',
    time: '02:10:00 PM',
    user: 'Dr. Florence O. Nwonu',
    userId: 'usr-admin',
    userRole: 'Super Admin',
    action: 'Fee Category Created',
    affectedRecord: 'Graduation Fee',
    description: 'Created custom fee category "Graduation Fee" (₦25,000) for Primary 5 and SS 3.',
    severity: 'info',
  },
  {
    id: 'aud-4',
    timestamp: '2026-09-21T08:45:10Z',
    date: '2026-09-21',
    time: '08:45:10 AM',
    user: 'Mr. Chidi Eze',
    userId: 'usr-bursar',
    userRole: 'Accountant',
    action: 'Payment Recorded',
    affectedRecord: 'FLO-RCP-20260921-0003 (John David Nwonu)',
    description: 'Recorded installment payment of ₦30,000 for John David Nwonu via Cash.',
    severity: 'info',
  },
  {
    id: 'aud-5',
    timestamp: '2026-09-21T09:30:18Z',
    date: '2026-09-21',
    time: '09:30:18 AM',
    user: 'Mr. Chidi Eze',
    userId: 'usr-bursar',
    userRole: 'Accountant',
    action: 'Payment Recorded',
    affectedRecord: 'FLO-RCP-20260921-0008 (Chinelo Grace Nwosu)',
    description: 'Recorded installment payment of ₦80,000 for Chinelo Grace Nwosu via POS.',
    severity: 'info',
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
