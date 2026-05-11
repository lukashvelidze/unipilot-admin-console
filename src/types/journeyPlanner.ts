export interface JourneyPlannerRequest {
  originCountryCode: string;
  destinationCountryCode: string;
  visaTypeCode?: string;
  levelOfStudy?: string;
}

export interface JourneyProcedure {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
}

export interface JourneyChecklistItem {
  id: string;
  label: string;
  details?: string;
  required: boolean;
  sortOrder: number;
}

export interface JourneyChecklistGroup {
  id: string;
  title: string;
  subscriptionTier: 'free' | 'basic' | 'standard' | 'premium';
  sortOrder: number;
  items: JourneyChecklistItem[];
}

export interface JourneyPlanSource {
  id: string;
  label: string;
  url?: string;
  lastUpdatedAt?: string;
}

export interface JourneyPlan {
  id: string;
  status: 'draft' | 'approved' | 'visible';
  generatedAt: string;
  lastUpdatedAt: string;
  generationMode: 'ai' | 'fallback';
  procedures: JourneyProcedure[];
  checklistGroups: JourneyChecklistGroup[];
  deadlines: string[];
  notes: string[];
  sources: JourneyPlanSource[];
}

export interface JourneyPlannerOptions {
  originCountries: Array<{ code: string; name: string }>;
  destinationCountries: Array<{ code: string; name: string }>;
  visaTypes: Array<{ code: string; title: string; country_code: string | null }>;
}
