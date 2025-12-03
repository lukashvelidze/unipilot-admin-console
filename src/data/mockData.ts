// Mock data for the admin dashboard

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  lastSignIn: string;
  isSuperAdmin: boolean;
  isBanned: boolean;
  subscriptionTier: 'free' | 'premium';
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  countryOrigin: string;
  destinationCountry: string;
  levelOfStudy: string;
  visaType: string;
  subscriptionTier: 'free' | 'premium';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalChecklists: number;
  totalVisaTypes: number;
  totalCountries: number;
}

export interface Country {
  code: string;
  name: string;
  isActive: boolean;
}

export interface VisaType {
  id: string;
  countryCode: string;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
}

export interface Checklist {
  id: string;
  visaTypeCode: string;
  countryCode: string;
  title: string;
  sortOrder: number;
  subscriptionTier: 'free' | 'basic' | 'standard' | 'premium';
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  label: string;
  fieldType: 'checkbox' | 'text' | 'file' | 'date' | 'select';
  sortOrder: number;
  metadata: Record<string, unknown>;
}

export const mockUsers: User[] = [
  { id: '1', email: 'john@example.com', fullName: 'John Smith', createdAt: '2024-01-15', lastSignIn: '2024-12-02', isSuperAdmin: false, isBanned: false, subscriptionTier: 'premium' },
  { id: '2', email: 'jane@example.com', fullName: 'Jane Doe', createdAt: '2024-02-20', lastSignIn: '2024-12-01', isSuperAdmin: false, isBanned: false, subscriptionTier: 'free' },
  { id: '3', email: 'admin@unipilot.com', fullName: 'Admin User', createdAt: '2024-01-01', lastSignIn: '2024-12-03', isSuperAdmin: true, isBanned: false, subscriptionTier: 'premium' },
  { id: '4', email: 'mike@example.com', fullName: 'Mike Wilson', createdAt: '2024-03-10', lastSignIn: '2024-11-28', isSuperAdmin: false, isBanned: true, subscriptionTier: 'free' },
  { id: '5', email: 'sarah@example.com', fullName: 'Sarah Johnson', createdAt: '2024-04-05', lastSignIn: '2024-12-02', isSuperAdmin: false, isBanned: false, subscriptionTier: 'premium' },
];

export const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  activeUsers: 892,
  premiumUsers: 456,
  totalChecklists: 34,
  totalVisaTypes: 12,
  totalCountries: 6,
};

export const mockCountries: Country[] = [
  { code: 'US', name: 'United States', isActive: true },
  { code: 'UK', name: 'United Kingdom', isActive: true },
  { code: 'DE', name: 'Germany', isActive: true },
  { code: 'CA', name: 'Canada', isActive: true },
  { code: 'AU', name: 'Australia', isActive: true },
  { code: 'FR', name: 'France', isActive: false },
];

export const mockVisaTypes: VisaType[] = [
  { id: '1', countryCode: 'US', code: 'F1', title: 'F-1 Student Visa', description: 'For academic studies at US institutions', isActive: true },
  { id: '2', countryCode: 'US', code: 'J1', title: 'J-1 Exchange Visitor', description: 'For exchange programs', isActive: true },
  { id: '3', countryCode: 'UK', code: 'TIER4', title: 'Student Visa (Tier 4)', description: 'For studying in the UK', isActive: true },
  { id: '4', countryCode: 'DE', code: 'STUDY', title: 'German Student Visa', description: 'For studying in Germany', isActive: true },
  { id: '5', countryCode: 'CA', code: 'STUDY_PERMIT', title: 'Study Permit', description: 'For studying in Canada', isActive: true },
  { id: '6', countryCode: 'AU', code: 'SUBCLASS_500', title: 'Student Visa (Subclass 500)', description: 'For studying in Australia', isActive: false },
];

export const mockChecklists: Checklist[] = [
  { id: '1', visaTypeCode: 'F1', countryCode: 'US', title: 'Pre-Application Documents', sortOrder: 1, subscriptionTier: 'free' },
  { id: '2', visaTypeCode: 'F1', countryCode: 'US', title: 'Financial Documents', sortOrder: 2, subscriptionTier: 'basic' },
  { id: '3', visaTypeCode: 'F1', countryCode: 'US', title: 'Interview Preparation', sortOrder: 3, subscriptionTier: 'premium' },
  { id: '4', visaTypeCode: 'TIER4', countryCode: 'UK', title: 'UK Visa Application', sortOrder: 1, subscriptionTier: 'free' },
  { id: '5', visaTypeCode: 'STUDY', countryCode: 'DE', title: 'German Visa Documents', sortOrder: 1, subscriptionTier: 'free' },
];

export const mockChecklistItems: ChecklistItem[] = [
  { id: '1', checklistId: '1', label: 'Valid Passport', fieldType: 'checkbox', sortOrder: 1, metadata: {} },
  { id: '2', checklistId: '1', label: 'I-20 Form', fieldType: 'file', sortOrder: 2, metadata: {} },
  { id: '3', checklistId: '1', label: 'SEVIS Fee Receipt', fieldType: 'file', sortOrder: 3, metadata: {} },
  { id: '4', checklistId: '1', label: 'DS-160 Confirmation', fieldType: 'file', sortOrder: 4, metadata: {} },
  { id: '5', checklistId: '2', label: 'Bank Statements (3 months)', fieldType: 'file', sortOrder: 1, metadata: {} },
  { id: '6', checklistId: '2', label: 'Sponsor Letter', fieldType: 'file', sortOrder: 2, metadata: {} },
  { id: '7', checklistId: '2', label: 'Scholarship Letter', fieldType: 'file', sortOrder: 3, metadata: {} },
  { id: '8', checklistId: '3', label: 'Mock Interview Completed', fieldType: 'checkbox', sortOrder: 1, metadata: {} },
  { id: '9', checklistId: '3', label: 'Common Questions Reviewed', fieldType: 'checkbox', sortOrder: 2, metadata: {} },
  { id: '10', checklistId: '4', label: 'CAS Letter', fieldType: 'file', sortOrder: 1, metadata: {} },
  { id: '11', checklistId: '4', label: 'English Proficiency Test', fieldType: 'file', sortOrder: 2, metadata: {} },
];