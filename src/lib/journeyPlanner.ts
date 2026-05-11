import { supabase } from '@/lib/supabase';
import {
  JourneyPlan,
  JourneyPlannerOptions,
  JourneyPlannerRequest,
} from '@/types/journeyPlanner';

type ChecklistRow = {
  id: string;
  title: string;
  sort_order: number;
  subscription_tier: 'free' | 'basic' | 'standard' | 'premium';
};

type ChecklistItemRow = {
  id: string;
  checklist_id: string | null;
  label: string;
  sort_order: number;
  metadata: Record<string, unknown>;
};

type ArticleSourceRow = {
  id: string;
  title: string;
  slug: string;
  updated_at: string;
};

const sanitizeText = (value: string, maxLength = 400) =>
  value
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>"'`]/g, '')
    .trim()
    .slice(0, maxLength);

const normalizeTextList = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? sanitizeText(entry, 280) : ''))
    .filter(Boolean);
};

const normalizeAiPlan = (data: unknown): JourneyPlan | null => {
  if (!data || typeof data !== 'object') return null;
  const payload = data as Partial<JourneyPlan> & { status?: string; generationMode?: string };

  if (!Array.isArray(payload.checklistGroups) || !Array.isArray(payload.procedures)) {
    return null;
  }

  return {
    id: typeof payload.id === 'string' && payload.id ? payload.id : crypto.randomUUID(),
    status:
      payload.status === 'approved' || payload.status === 'visible' || payload.status === 'draft'
        ? payload.status
        : 'draft',
    generatedAt: typeof payload.generatedAt === 'string' ? payload.generatedAt : new Date().toISOString(),
    lastUpdatedAt: typeof payload.lastUpdatedAt === 'string' ? payload.lastUpdatedAt : new Date().toISOString(),
    generationMode: payload.generationMode === 'ai' ? 'ai' : 'fallback',
    procedures: payload.procedures
      .map((procedure, index) => ({
        id: procedure.id || `proc-${index + 1}`,
        title: sanitizeText(procedure.title || `Step ${index + 1}`, 120),
        description: sanitizeText(procedure.description || '', 600),
        sortOrder: Number.isFinite(procedure.sortOrder) ? procedure.sortOrder : index + 1,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    checklistGroups: payload.checklistGroups
      .map((group, index) => ({
        id: group.id || `group-${index + 1}`,
        title: sanitizeText(group.title || `Checklist ${index + 1}`, 120),
        subscriptionTier:
          group.subscriptionTier === 'basic' ||
          group.subscriptionTier === 'standard' ||
          group.subscriptionTier === 'premium'
            ? group.subscriptionTier
            : 'free',
        sortOrder: Number.isFinite(group.sortOrder) ? group.sortOrder : index + 1,
        items: Array.isArray(group.items)
          ? group.items
              .map((item, itemIndex) => ({
                id: item.id || `item-${index + 1}-${itemIndex + 1}`,
                label: sanitizeText(item.label || `Item ${itemIndex + 1}`, 180),
                details: item.details ? sanitizeText(item.details, 400) : undefined,
                required: item.required !== false,
                sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : itemIndex + 1,
              }))
              .sort((a, b) => a.sortOrder - b.sortOrder)
          : [],
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    deadlines: normalizeTextList(payload.deadlines),
    notes: normalizeTextList(payload.notes),
    sources: Array.isArray(payload.sources)
      ? payload.sources
          .map((source, index) => ({
            id: source.id || `source-${index + 1}`,
            label: sanitizeText(source.label || 'Reference', 120),
            url: source.url ? sanitizeText(source.url, 500) : undefined,
            lastUpdatedAt: typeof source.lastUpdatedAt === 'string' ? source.lastUpdatedAt : undefined,
          }))
          .filter((source) => source.label)
      : [],
  };
};

const buildFallbackPlan = (
  request: JourneyPlannerRequest,
  checklists: ChecklistRow[],
  checklistItems: ChecklistItemRow[],
  articleSources: ArticleSourceRow[]
): JourneyPlan => {
  const itemMap = checklistItems.reduce<Record<string, ChecklistItemRow[]>>((acc, item) => {
    if (!item.checklist_id) return acc;
    if (!acc[item.checklist_id]) acc[item.checklist_id] = [];
    acc[item.checklist_id].push(item);
    return acc;
  }, {});

  const checklistGroups = checklists
    .map((checklist, checklistIndex) => ({
      id: checklist.id,
      title: checklist.title,
      subscriptionTier: checklist.subscription_tier,
      sortOrder: checklist.sort_order ?? checklistIndex + 1,
      items: (itemMap[checklist.id] || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item, itemIndex) => ({
          id: item.id,
          label: sanitizeText(item.label, 180),
          details:
            item.metadata && typeof item.metadata.note === 'string'
              ? sanitizeText(item.metadata.note, 300)
              : undefined,
          required: true,
          sortOrder: item.sort_order ?? itemIndex + 1,
        })),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const procedures = [
    {
      id: 'procedure-1',
      title: 'Confirm route and visa path',
      description: `Finalize your origin (${request.originCountryCode}) and destination (${request.destinationCountryCode}) details, then confirm the visa category that fits your study plan.`,
      sortOrder: 1,
    },
    {
      id: 'procedure-2',
      title: 'Prepare core documentation',
      description: 'Complete the checklist groups below and gather any supporting financial, identity, and education evidence before filing.',
      sortOrder: 2,
    },
    {
      id: 'procedure-3',
      title: 'Submit, monitor, and travel prep',
      description: 'Submit your application, track appointment/interview steps, and prepare final travel and arrival tasks after approval.',
      sortOrder: 3,
    },
  ];

  return {
    id: crypto.randomUUID(),
    status: 'draft',
    generatedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    generationMode: 'fallback',
    procedures,
    checklistGroups,
    deadlines: [
      'Track your intake/semester start date and work backward for visa processing time.',
      'Book visa appointments early during high-demand periods.',
    ],
    notes: [
      'Requirements may vary by embassy or consulate.',
      'Always verify final requirements with official government channels.',
    ],
    sources: articleSources.map((source) => ({
      id: source.id,
      label: source.title,
      url: `/articles/${source.slug}`,
      lastUpdatedAt: source.updated_at,
    })),
  };
};

export async function fetchJourneyPlannerOptions(): Promise<JourneyPlannerOptions> {
  const [originRes, destinationRes, visaRes] = await Promise.all([
    supabase.from('origin_countries').select('code, name').eq('is_active', true).order('name'),
    supabase.from('destination_countries').select('code, name').eq('is_active', true).order('name'),
    supabase.from('visa_types').select('code, title, country_code').eq('is_active', true).order('title'),
  ]);

  if (originRes.error) throw new Error(originRes.error.message);
  if (destinationRes.error) throw new Error(destinationRes.error.message);
  if (visaRes.error) throw new Error(visaRes.error.message);

  return {
    originCountries: originRes.data || [],
    destinationCountries: destinationRes.data || [],
    visaTypes: visaRes.data || [],
  };
}

export async function generateJourneyPlan(request: JourneyPlannerRequest): Promise<JourneyPlan> {
  const safeRequest: JourneyPlannerRequest = {
    originCountryCode: sanitizeText(request.originCountryCode, 8).toUpperCase(),
    destinationCountryCode: sanitizeText(request.destinationCountryCode, 8).toUpperCase(),
    visaTypeCode: request.visaTypeCode ? sanitizeText(request.visaTypeCode, 60) : undefined,
    levelOfStudy: request.levelOfStudy ? sanitizeText(request.levelOfStudy, 60) : undefined,
  };

  const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-journey-plan', {
    body: safeRequest,
  });

  if (!aiError) {
    const normalized = normalizeAiPlan(aiData);
    if (normalized) {
      return {
        ...normalized,
        generationMode: 'ai',
        status: normalized.status || 'draft',
      };
    }
  }

  const checklistQuery = supabase
    .from('checklists')
    .select('id, title, sort_order, subscription_tier')
    .eq('country_code', safeRequest.destinationCountryCode)
    .order('sort_order');

  if (safeRequest.visaTypeCode) {
    checklistQuery.eq('visa_type', safeRequest.visaTypeCode);
  }

  const { data: checklistsData, error: checklistError } = await checklistQuery;

  if (checklistError) {
    const aiFailureReason = aiError?.message
      ? `AI generation failed (${aiError.message})`
      : 'AI generation unavailable';
    throw new Error(`${aiFailureReason}; checklist retrieval failed (${checklistError.message})`);
  }

  const checklistIds = (checklistsData || []).map((checklist) => checklist.id);
  const { data: itemsData, error: itemError } = checklistIds.length
    ? await supabase
        .from('checklist_items')
        .select('id, checklist_id, label, sort_order, metadata')
        .in('checklist_id', checklistIds)
        .order('sort_order')
    : { data: [], error: null };

  if (itemError) {
    throw new Error(itemError.message);
  }

  const { data: sourcesData } = await supabase
    .from('articles')
    .select('id, title, slug, updated_at')
    .eq('published', true)
    .eq('access_tier', 'free')
    .or(`destination_country_code.eq.${safeRequest.destinationCountryCode},is_global.eq.true`)
    .order('updated_at', { ascending: false })
    .limit(3);

  return buildFallbackPlan(
    safeRequest,
    (checklistsData || []) as ChecklistRow[],
    (itemsData || []) as ChecklistItemRow[],
    (sourcesData || []) as ArticleSourceRow[]
  );
}
