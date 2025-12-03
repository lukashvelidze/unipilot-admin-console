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

export interface Document {
  id: string;
  userId: string;
  userName: string;
  categoryName: string;
  originalName: string;
  isVerified: boolean;
  isRejected: boolean;
  adminNotes: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  pendingDocuments: number;
  totalDocuments: number;
  totalCountries: number;
}

export const mockUsers: User[] = [
  { id: '1', email: 'john@example.com', fullName: 'John Smith', createdAt: '2024-01-15', lastSignIn: '2024-12-02', isSuperAdmin: false, isBanned: false, subscriptionTier: 'premium' },
  { id: '2', email: 'jane@example.com', fullName: 'Jane Doe', createdAt: '2024-02-20', lastSignIn: '2024-12-01', isSuperAdmin: false, isBanned: false, subscriptionTier: 'free' },
  { id: '3', email: 'admin@unipilot.com', fullName: 'Admin User', createdAt: '2024-01-01', lastSignIn: '2024-12-03', isSuperAdmin: true, isBanned: false, subscriptionTier: 'premium' },
  { id: '4', email: 'mike@example.com', fullName: 'Mike Wilson', createdAt: '2024-03-10', lastSignIn: '2024-11-28', isSuperAdmin: false, isBanned: true, subscriptionTier: 'free' },
  { id: '5', email: 'sarah@example.com', fullName: 'Sarah Johnson', createdAt: '2024-04-05', lastSignIn: '2024-12-02', isSuperAdmin: false, isBanned: false, subscriptionTier: 'premium' },
  { id: '6', email: 'alex@example.com', fullName: 'Alex Brown', createdAt: '2024-05-12', lastSignIn: '2024-11-30', isSuperAdmin: false, isBanned: false, subscriptionTier: 'free' },
  { id: '7', email: 'emma@example.com', fullName: 'Emma Davis', createdAt: '2024-06-18', lastSignIn: '2024-12-01', isSuperAdmin: false, isBanned: false, subscriptionTier: 'premium' },
  { id: '8', email: 'chris@example.com', fullName: 'Chris Miller', createdAt: '2024-07-22', lastSignIn: '2024-11-25', isSuperAdmin: false, isBanned: false, subscriptionTier: 'free' },
];

export const mockProfiles: Profile[] = [
  { id: '1', userId: '1', fullName: 'John Smith', email: 'john@example.com', countryOrigin: 'United States', destinationCountry: 'Germany', levelOfStudy: 'masters', visaType: 'student', subscriptionTier: 'premium', createdAt: '2024-01-15' },
  { id: '2', userId: '2', fullName: 'Jane Doe', email: 'jane@example.com', countryOrigin: 'Canada', destinationCountry: 'United Kingdom', levelOfStudy: 'bachelors', visaType: 'student', subscriptionTier: 'free', createdAt: '2024-02-20' },
  { id: '3', userId: '5', fullName: 'Sarah Johnson', email: 'sarah@example.com', countryOrigin: 'India', destinationCountry: 'Australia', levelOfStudy: 'phd', visaType: 'student', subscriptionTier: 'premium', createdAt: '2024-04-05' },
  { id: '4', userId: '6', fullName: 'Alex Brown', email: 'alex@example.com', countryOrigin: 'Brazil', destinationCountry: 'Canada', levelOfStudy: 'bachelors', visaType: 'student', subscriptionTier: 'free', createdAt: '2024-05-12' },
  { id: '5', userId: '7', fullName: 'Emma Davis', email: 'emma@example.com', countryOrigin: 'Australia', destinationCountry: 'United States', levelOfStudy: 'masters', visaType: 'work', subscriptionTier: 'premium', createdAt: '2024-06-18' },
];

export const mockDocuments: Document[] = [
  { id: '1', userId: '1', userName: 'John Smith', categoryName: 'Passport', originalName: 'passport_scan.pdf', isVerified: false, isRejected: false, adminNotes: null, createdAt: '2024-12-01' },
  { id: '2', userId: '2', userName: 'Jane Doe', categoryName: 'Transcript', originalName: 'academic_transcript.pdf', isVerified: true, isRejected: false, adminNotes: 'Verified successfully', createdAt: '2024-11-28' },
  { id: '3', userId: '5', userName: 'Sarah Johnson', categoryName: 'Visa Application', originalName: 'visa_form_filled.pdf', isVerified: false, isRejected: false, adminNotes: null, createdAt: '2024-12-02' },
  { id: '4', userId: '6', userName: 'Alex Brown', categoryName: 'Bank Statement', originalName: 'bank_statement_nov.pdf', isVerified: false, isRejected: true, adminNotes: 'Document expired, please upload recent statement', createdAt: '2024-11-25' },
  { id: '5', userId: '7', userName: 'Emma Davis', categoryName: 'Letter of Recommendation', originalName: 'recommendation_letter.pdf', isVerified: false, isRejected: false, adminNotes: null, createdAt: '2024-12-03' },
  { id: '6', userId: '1', userName: 'John Smith', categoryName: 'Health Insurance', originalName: 'insurance_policy.pdf', isVerified: true, isRejected: false, adminNotes: 'Valid coverage', createdAt: '2024-11-30' },
];

export const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  activeUsers: 892,
  premiumUsers: 456,
  pendingDocuments: 23,
  totalDocuments: 3891,
  totalCountries: 45,
};

export const mockCountries = [
  { code: 'US', name: 'United States', isActive: true },
  { code: 'UK', name: 'United Kingdom', isActive: true },
  { code: 'DE', name: 'Germany', isActive: true },
  { code: 'CA', name: 'Canada', isActive: true },
  { code: 'AU', name: 'Australia', isActive: true },
  { code: 'FR', name: 'France', isActive: false },
];