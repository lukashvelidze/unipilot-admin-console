// Mock data for the admin dashboard - matching Supabase schema

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
  subscriptionTier: 'free' | 'standard' | 'premium';
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

// Matches: public.destination_countries
export interface Country {
  code: string;  // PK
  name: string;
  is_active: boolean;
}

// Matches: public.visa_types
export interface VisaType {
  id: string;  // uuid PK
  country_code: string | null;  // FK to destination_countries.code
  code: string;  // unique
  title: string;
  description: string | null;
  is_active: boolean;
}

// Matches: public.checklists
export interface Checklist {
  id: string;  // uuid PK
  visa_type: string;  // FK to visa_types.code
  title: string;
  sort_order: number;
  country_code: string | null;  // FK to destination_countries.code
  subscription_tier: 'free' | 'basic' | 'standard' | 'premium';
}

// Matches: public.checklist_items
export interface ChecklistItem {
  id: string;  // uuid PK
  checklist_id: string | null;  // FK to checklists.id
  label: string;
  field_type: string;
  metadata: Record<string, unknown>;
  sort_order: number;
  article_id?: string | null;
}

// Matches: public.articles
export interface Article {
  id: string; // uuid PK
  slug: string;
  help_route: string;
  title: string;
  summary: string | null;
  content: string;
  destination_country_code: string | null;
  origin_country_code: string | null;
  visa_types: string[] | null;
  is_global: boolean;
  access_tier: 'free' | 'standard' | 'premium';
  published: boolean;
  reading_time_minutes: number | null;
  created_at: string;
  updated_at: string;
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
  { code: 'US', name: 'United States', is_active: true },
  { code: 'UK', name: 'United Kingdom', is_active: true },
  { code: 'DE', name: 'Germany', is_active: true },
  { code: 'CA', name: 'Canada', is_active: true },
  { code: 'AU', name: 'Australia', is_active: true },
  { code: 'FR', name: 'France', is_active: false },
];

export const mockVisaTypes: VisaType[] = [
  { id: '1', country_code: 'US', code: 'F1', title: 'F-1 Student Visa', description: 'For academic studies at US institutions', is_active: true },
  { id: '2', country_code: 'US', code: 'J1', title: 'J-1 Exchange Visitor', description: 'For exchange programs', is_active: true },
  { id: '3', country_code: 'UK', code: 'TIER4', title: 'Student Visa (Tier 4)', description: 'For studying in the UK', is_active: true },
  { id: '4', country_code: 'DE', code: 'STUDY', title: 'German Student Visa', description: 'For studying in Germany', is_active: true },
  { id: '5', country_code: 'CA', code: 'STUDY_PERMIT', title: 'Study Permit', description: 'For studying in Canada', is_active: true },
  { id: '6', country_code: 'AU', code: 'SUBCLASS_500', title: 'Student Visa (Subclass 500)', description: 'For studying in Australia', is_active: false },
];

export const mockChecklists: Checklist[] = [
  { id: '1', visa_type: 'F1', country_code: 'US', title: 'Pre-Application Documents', sort_order: 1, subscription_tier: 'free' },
  { id: '2', visa_type: 'F1', country_code: 'US', title: 'Financial Documents', sort_order: 2, subscription_tier: 'basic' },
  { id: '3', visa_type: 'F1', country_code: 'US', title: 'Interview Preparation', sort_order: 3, subscription_tier: 'premium' },
  { id: '4', visa_type: 'TIER4', country_code: 'UK', title: 'UK Visa Application', sort_order: 1, subscription_tier: 'free' },
  { id: '5', visa_type: 'STUDY', country_code: 'DE', title: 'German Visa Documents', sort_order: 1, subscription_tier: 'free' },
];

export const mockChecklistItems: ChecklistItem[] = [
  { id: '1', checklist_id: '1', label: 'Valid Passport', field_type: 'checkbox', sort_order: 1, metadata: {}, article_id: null },
  { id: '2', checklist_id: '1', label: 'I-20 Form', field_type: 'file', sort_order: 2, metadata: {}, article_id: null },
  { id: '3', checklist_id: '1', label: 'SEVIS Fee Receipt', field_type: 'file', sort_order: 3, metadata: {}, article_id: null },
  { id: '4', checklist_id: '1', label: 'DS-160 Confirmation', field_type: 'file', sort_order: 4, metadata: {}, article_id: null },
  { id: '5', checklist_id: '2', label: 'Bank Statements (3 months)', field_type: 'file', sort_order: 1, metadata: {}, article_id: null },
  { id: '6', checklist_id: '2', label: 'Sponsor Letter', field_type: 'file', sort_order: 2, metadata: {}, article_id: null },
  { id: '7', checklist_id: '2', label: 'Scholarship Letter', field_type: 'file', sort_order: 3, metadata: {}, article_id: null },
  { id: '8', checklist_id: '3', label: 'Mock Interview Completed', field_type: 'checkbox', sort_order: 1, metadata: {}, article_id: null },
  { id: '9', checklist_id: '3', label: 'Common Questions Reviewed', field_type: 'checkbox', sort_order: 2, metadata: {}, article_id: null },
  { id: '10', checklist_id: '4', label: 'CAS Letter', field_type: 'file', sort_order: 1, metadata: {}, article_id: null },
  { id: '11', checklist_id: '4', label: 'English Proficiency Test', field_type: 'file', sort_order: 2, metadata: {}, article_id: null },
];
