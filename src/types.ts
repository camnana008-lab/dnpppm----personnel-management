export type UserRole = 'Super Admin' | 'Admin' | 'Super User' | 'Edit' | 'User';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
  photoUrl?: string;
}

export type Gender = 'Male' | 'Female' | 'ប្រុស' | 'ស្រី';

export interface StaffHistoryItem {
  id: string;
  docNumber: string;
  date: string;
  status: string;
  note: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  major: string;
  school: string;
  year: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface WorkHistoryItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface StaffProfile {
  id: string;
  staffId: string;
  nameKh: string;
  nameEn: string;
  gender: Gender;
  dob: string;
  position: string;
  title: string;
  phone: string;
  address: string;
  photoUrl: string;
  institution: {
    ministry: string;
    generalDept: string;
    department: string;
    office: string;
  };
  employmentHistory: StaffHistoryItem[];
  educationHistory: EducationItem[];
  positionHistory: StaffHistoryItem[];
  titleHistory: StaffHistoryItem[];
  awardsHistory: StaffHistoryItem[];
  disciplineHistory: StaffHistoryItem[];
  workHistory: WorkHistoryItem[];
}
