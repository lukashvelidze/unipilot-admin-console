import { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { supabase } from '@/lib/supabase';
import { Users, Globe, CheckSquare, Stamp, Loader2, FileText, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardStats {
  totalCountries: number;
  totalVisaTypes: number;
  totalChecklists: number;
}

interface RecentProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  subscription_tier: string | null;
  created_at: string;
}

interface AutoCountry {
  code: string;
  name: string;
  is_active: boolean;
}

interface AutoChecklist {
  id: string;
  visa_type: string;
  title: string;
  sort_order: number;
  country_code: string | null;
  subscription_tier: 'free' | 'basic' | 'standard' | 'premium';
}

interface AutoChecklistItem {
  id: string;
  checklist_id: string | null;
  label: string;
  field_type: string;
  metadata: Record<string, unknown>;
  sort_order: number;
}

interface AutoVisaType {
  code: string;
  country_code: string | null;
  title: string;
  description: string | null;
  is_active: boolean;
}

interface EducationOption {
  value: string;
  label: string;
  slug: string;
  matchers: string[];
}

const AUTO_VISA_PREFIX = 'AUTO_STUDENT_';
const KEY_SEPARATOR = '::';
const makeChecklistKey = (visaType: string, title: string) =>
  `${encodeURIComponent(visaType)}${KEY_SEPARATOR}${encodeURIComponent(title)}`;
const makeChecklistItemKey = (checklistId: string | null, label: string, sortOrder: number) =>
  `${encodeURIComponent(checklistId || '')}${KEY_SEPARATOR}${encodeURIComponent(label)}${KEY_SEPARATOR}${sortOrder}`;

const EDUCATION_LEVELS: EducationOption[] = [
  { value: 'general', label: 'All education levels', slug: 'GENERAL', matchers: [] },
  { value: 'undergraduate', label: 'Undergraduate', slug: 'UNDERGRAD', matchers: ['undergraduate', 'bachelor', 'bachelors', 'bsc', 'ba'] },
  { value: 'graduate', label: 'Graduate', slug: 'GRAD', matchers: ['graduate', 'master', 'masters', 'msc', 'ma', 'mba', 'postgraduate'] },
  { value: 'doctorate', label: 'Doctorate / PhD', slug: 'PHD', matchers: ['phd', 'doctorate', 'doctoral', 'dphil'] },
];
const DEFAULT_EDUCATION_LEVEL = EDUCATION_LEVELS[0]?.value ?? 'general';

const getAllCountryCodes = () => {
  const supportedValuesOf = Reflect.get(Intl, 'supportedValuesOf');

  if (typeof supportedValuesOf !== 'function') return [];

  return supportedValuesOf.call(Intl, 'region').filter((code: string) => /^[A-Z]{2}$/.test(code));
};

const getAllDestinationCountries = (): AutoCountry[] => {
  const countryCodes = getAllCountryCodes();
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

  return countryCodes
    .map((code) => ({ code, name: regionNames.of(code) || code, is_active: true }))
    .filter((country) => country.name !== country.code)
    .sort((a, b) => a.name.localeCompare(b.name));
};

const normalizeText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const buildAutoVisaCode = (countryCode: string, educationSlug: string, originCode?: string | null) => {
  const segments = [educationSlug];
  if (originCode) segments.push(originCode);
  segments.push(countryCode);
  return `${AUTO_VISA_PREFIX}${segments.join('_')}`;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCountries: 0,
    totalVisaTypes: 0,
    totalChecklists: 0,
  });
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [automating, setAutomating] = useState(false);
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  const [automationForm, setAutomationForm] = useState({
    destinationCountry: 'all',
    originCountry: 'all',
    educationLevel: DEFAULT_EDUCATION_LEVEL,
  });
  const [destinationOptions, setDestinationOptions] = useState<AutoCountry[]>([]);
  const [originOptions, setOriginOptions] = useState<AutoCountry[]>([]);
  const fallbackCountries = useMemo(() => getAllDestinationCountries(), []);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    const [
      countriesRes,
      visaTypesRes,
      checklistsRes,
      profilesRes,
      destinationsRes,
      originsRes,
    ] = await Promise.all([
      supabase.from('destination_countries').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('visa_types').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('checklists').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('id, full_name, email, subscription_tier, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('destination_countries').select('*').eq('is_active', true).order('name'),
      supabase.from('origin_countries').select('*').eq('is_active', true).order('name'),
    ]);

    setStats({
      totalCountries: countriesRes.count || 0,
      totalVisaTypes: visaTypesRes.count || 0,
      totalChecklists: checklistsRes.count || 0,
    });

    setRecentProfiles(profilesRes.data || []);

    if (destinationsRes.error) {
      toast({ title: 'Error loading destination countries', description: destinationsRes.error.message, variant: 'destructive' });
    } else {
      setDestinationOptions(destinationsRes.data || []);
    }

    if (originsRes.error) {
      toast({ title: 'Error loading origin countries', description: originsRes.error.message, variant: 'destructive' });
    } else {
      setOriginOptions(originsRes.data || []);
    }

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const runAutomatedBackfill = async () => {
    setAutomating(true);

    const destinationChoices = destinationOptions.length > 0 ? destinationOptions : fallbackCountries;
    const originChoices = originOptions.length > 0 ? originOptions : fallbackCountries;

    if (destinationChoices.length === 0) {
      toast({
        title: 'Automation unavailable',
        description: 'Unable to resolve a destination country list in this browser.',
        variant: 'destructive'
      });
      setAutomating(false);
      return;
    }

    const targetCountries = automationForm.destinationCountry === 'all'
      ? destinationChoices
      : destinationChoices.filter((country) => country.code === automationForm.destinationCountry);

    if (targetCountries.length === 0) {
      toast({
        title: 'Automation blocked',
        description: 'The selected destination country is not available.',
        variant: 'destructive'
      });
      setAutomating(false);
      return;
    }

    const selectedEducation = EDUCATION_LEVELS.find((level) => level.value === automationForm.educationLevel)
      || EDUCATION_LEVELS.find((level) => level.value === DEFAULT_EDUCATION_LEVEL)
      || EDUCATION_LEVELS[0];
    const originCode = automationForm.originCountry === 'all' ? null : automationForm.originCountry;
    const originName = originCode
      ? originChoices.find((country) => country.code === originCode)?.name || originCode
      : null;
    const educationLabel = selectedEducation.label;
    const educationDescriptor = selectedEducation.value === 'general'
      ? 'student'
      : educationLabel.toLowerCase();

    const getDestinationName = (code: string) =>
      destinationChoices.find((country) => country.code === code)?.name || code;

    const [visaRes, checklistRes, itemRes] = await Promise.all([
      supabase.from('visa_types').select('code, country_code, title, description, is_active'),
      supabase.from('checklists').select('id, visa_type, title, sort_order, country_code, subscription_tier'),
      supabase.from('checklist_items').select('id, checklist_id, label, field_type, metadata, sort_order')
    ]);

    if (visaRes.error || checklistRes.error || itemRes.error) {
      toast({
        title: 'Backfill failed',
        description: visaRes.error?.message || checklistRes.error?.message || itemRes.error?.message || 'Unknown error',
        variant: 'destructive'
      });
      setAutomating(false);
      return;
    }

    const visas = (visaRes.data || []) as AutoVisaType[];
    const checklists = (checklistRes.data || []) as AutoChecklist[];
    const checklistItems = (itemRes.data || []) as AutoChecklistItem[];

    const manualVisas = visas.filter((visa) => !visa.code.startsWith(AUTO_VISA_PREFIX));
    if (manualVisas.length === 0) {
      toast({
        title: 'Backfill blocked',
        description: 'No manual visa types found to use as a template.',
        variant: 'destructive'
      });
      setAutomating(false);
      return;
    }

    if (checklists.length === 0) {
      toast({
        title: 'Backfill blocked',
        description: 'No checklists found in the database to use as procedures template.',
        variant: 'destructive'
      });
      setAutomating(false);
      return;
    }

    const checklistCounts = new Map<string, number>();
    checklists.forEach((checklist) => {
      checklistCounts.set(checklist.visa_type, (checklistCounts.get(checklist.visa_type) || 0) + 1);
    });

    const educationMatchedVisas = selectedEducation.value === 'general'
      ? manualVisas
      : manualVisas.filter((visa) => {
        const haystack = normalizeText(`${visa.title} ${visa.code} ${visa.description || ''}`);
        return selectedEducation.matchers.some((matcher) => haystack.includes(matcher));
      });

    if (selectedEducation.value !== 'general' && educationMatchedVisas.length === 0) {
      toast({
        title: 'Education match not found',
        description: 'No manual visa types matched the selected education level. Using the most complete template instead.',
      });
    }

    const candidateVisas = educationMatchedVisas.length > 0 ? educationMatchedVisas : manualVisas;
    const templateVisa = candidateVisas.reduce<AutoVisaType | null>((best, visa) => {
      if (!best) return visa;
      return (checklistCounts.get(visa.code) || 0) > (checklistCounts.get(best.code) || 0) ? visa : best;
    }, null);

    const templateVisaCodeWithMostChecklists = templateVisa?.code;

    if (!templateVisaCodeWithMostChecklists) {
      toast({
        title: 'Backfill blocked',
        description: 'Unable to determine a checklist template visa type.',
        variant: 'destructive'
      });
      setAutomating(false);
      return;
    }

    const templateChecklists = checklists
      .filter((checklist) => checklist.visa_type === templateVisaCodeWithMostChecklists)
      .sort((a, b) => a.sort_order - b.sort_order);

    if (templateChecklists.length === 0) {
      toast({
        title: 'Backfill blocked',
        description: 'The selected template visa has no checklist procedures.',
        variant: 'destructive'
      });
      setAutomating(false);
      return;
    }

    const templateItemsByChecklistId = new Map<string, AutoChecklistItem[]>();
    checklistItems.forEach((item) => {
      if (!item.checklist_id) return;
      if (!templateChecklists.some((checklist) => checklist.id === item.checklist_id)) return;

      const existing = templateItemsByChecklistId.get(item.checklist_id) || [];
      existing.push(item);
      templateItemsByChecklistId.set(item.checklist_id, existing);
    });

    const templateItemsByChecklistTitle = new Map<string, AutoChecklistItem[]>();
    templateChecklists.forEach((checklist) => {
      const templateItems = (templateItemsByChecklistId.get(checklist.id) || [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order);
      templateItemsByChecklistTitle.set(checklist.title, templateItems);
    });

    const { error: countriesUpsertError } = await supabase
      .from('destination_countries')
      .upsert(targetCountries, { onConflict: 'code' });

    if (countriesUpsertError) {
      toast({ title: 'Country sync failed', description: countriesUpsertError.message, variant: 'destructive' });
      setAutomating(false);
      return;
    }

    const planTitle = selectedEducation.value === 'general'
      ? 'Student Visa Plan'
      : `${educationLabel} Student Visa Plan`;

    const autoVisaPayload = targetCountries.map((country) => {
      const destinationName = getDestinationName(country.code);
      const routeLabel = originName ? `${originName} to ${destinationName}` : destinationName;
      return {
        code: buildAutoVisaCode(country.code, selectedEducation.slug, originCode),
        country_code: country.code,
        title: planTitle,
        description: `Auto-generated ${educationDescriptor} visa plan for ${routeLabel} based on your base procedures.`,
        is_active: true
      };
    });

    const targetVisaCodes = autoVisaPayload.map((payload) => payload.code);

    const { error: visasUpsertError } = await supabase
      .from('visa_types')
      .upsert(autoVisaPayload, { onConflict: 'code' });

    if (visasUpsertError) {
      toast({ title: 'Visa sync failed', description: visasUpsertError.message, variant: 'destructive' });
      setAutomating(false);
      return;
    }

    const { data: existingAutoChecklists, error: existingAutoChecklistsError } = await supabase
      .from('checklists')
      .select('id, visa_type, title')
      .in('visa_type', targetVisaCodes);

    if (existingAutoChecklistsError) {
      toast({
        title: 'Checklist sync failed',
        description: existingAutoChecklistsError.message,
        variant: 'destructive'
      });
      setAutomating(false);
      return;
    }

    const initialAutoChecklists = existingAutoChecklists || [];
    const existingChecklistKeys = new Set(initialAutoChecklists.map((checklist) => makeChecklistKey(checklist.visa_type, checklist.title)));

    const missingChecklistPayload = targetCountries.flatMap((country) => {
      const visaCode = buildAutoVisaCode(country.code, selectedEducation.slug, originCode);
      return templateChecklists
        .filter((templateChecklist) => !existingChecklistKeys.has(makeChecklistKey(visaCode, templateChecklist.title)))
        .map((templateChecklist) => ({
          visa_type: visaCode,
          country_code: country.code,
          title: templateChecklist.title,
          subscription_tier: templateChecklist.subscription_tier,
          sort_order: templateChecklist.sort_order
        }));
    });

    if (missingChecklistPayload.length > 0) {
      const { error: insertChecklistsError } = await supabase
        .from('checklists')
        .insert(missingChecklistPayload);

      if (insertChecklistsError) {
        toast({ title: 'Checklist sync failed', description: insertChecklistsError.message, variant: 'destructive' });
        setAutomating(false);
        return;
      }
    }

    let allAutoChecklists: Array<{ id: string; title: string }> = initialAutoChecklists.map((checklist) => ({
      id: checklist.id,
      title: checklist.title
    }));

    if (missingChecklistPayload.length > 0) {
      const { data: refreshedAutoChecklists, error: refreshedAutoChecklistsError } = await supabase
        .from('checklists')
        .select('id, title')
        .in('visa_type', targetVisaCodes);

      if (refreshedAutoChecklistsError) {
        toast({
          title: 'Checklist item sync failed',
          description: refreshedAutoChecklistsError.message,
          variant: 'destructive'
        });
        setAutomating(false);
        return;
      }

      allAutoChecklists = refreshedAutoChecklists || [];
    }

    const autoChecklistIds = allAutoChecklists.map((checklist) => checklist.id);
    const destinationSummary = automationForm.destinationCountry === 'all'
      ? `${targetCountries.length} destinations`
      : getDestinationName(automationForm.destinationCountry);
    const educationSummary = selectedEducation.value === 'general'
      ? 'all education levels'
      : selectedEducation.label;
    const originSummary = originName ? ` from ${originName}` : '';

    if (autoChecklistIds.length === 0) {
      await fetchDashboardData();
      toast({
        title: 'Automated backfill complete',
        description: `Visa plans were synced for ${destinationSummary}${originSummary} (${educationSummary}). No checklist procedures required updates.`
      });
      setAutomating(false);
      setAutomationDialogOpen(false);
      return;
    }

    const { data: existingAutoItems, error: existingAutoItemsError } = await supabase
      .from('checklist_items')
      .select('checklist_id, label, sort_order')
      .in('checklist_id', autoChecklistIds);

    if (existingAutoItemsError) {
      toast({
        title: 'Checklist item sync failed',
        description: existingAutoItemsError.message,
        variant: 'destructive'
      });
      setAutomating(false);
      return;
    }

    const existingItemKeys = new Set(
      (existingAutoItems || []).map((item) => makeChecklistItemKey(item.checklist_id, item.label, item.sort_order))
    );

    const missingItemsPayload = allAutoChecklists.flatMap((checklist) => {
      const templateItems = templateItemsByChecklistTitle.get(checklist.title) || [];
      return templateItems
        .filter((item) => !existingItemKeys.has(makeChecklistItemKey(checklist.id, item.label, item.sort_order)))
        .map((item) => ({
          checklist_id: checklist.id,
          label: item.label,
          field_type: item.field_type,
          metadata: item.metadata,
          sort_order: item.sort_order
        }));
    });

    if (missingItemsPayload.length > 0) {
      const { error: insertItemsError } = await supabase
        .from('checklist_items')
        .insert(missingItemsPayload);

      if (insertItemsError) {
        toast({ title: 'Checklist item sync failed', description: insertItemsError.message, variant: 'destructive' });
        setAutomating(false);
        return;
      }
    }

    await fetchDashboardData();
    toast({
      title: 'Automated backfill complete',
      description: `Checklist procedures were synced for ${destinationSummary}${originSummary} (${educationSummary}).`
    });
    setAutomating(false);
    setAutomationDialogOpen(false);
  };

  const userColumns = [
    {
      key: 'full_name',
      header: 'Name',
      render: (user: RecentProfile) => user.full_name || 'N/A'
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: RecentProfile) => user.email || 'N/A'
    },
    {
      key: 'subscription_tier',
      header: 'Tier',
      render: (user: RecentProfile) => (
        <StatusBadge status={user.subscription_tier === 'premium' ? 'success' : 'default'}>
          {user.subscription_tier || 'free'}
        </StatusBadge>
      )
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user: RecentProfile) => new Date(user.created_at).toLocaleDateString()
    },
  ];

  const destinationChoices = destinationOptions.length > 0 ? destinationOptions : fallbackCountries;
  const originChoices = originOptions.length > 0 ? originOptions : fallbackCountries;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your UniPilot platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Countries"
            value={stats.totalCountries}
            icon={<Globe className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Visa Types"
            value={stats.totalVisaTypes}
            icon={<Stamp className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Checklists"
            value={stats.totalChecklists}
            icon={<CheckSquare className="h-5 w-5 text-primary" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Users</h2>
            </div>
            {recentProfiles.length > 0 ? (
              <DataTable columns={userColumns} data={recentProfiles} />
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                No users found
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            </div>
            <Button
              type="button"
              onClick={() => setAutomationDialogOpen(true)}
              disabled={automating}
              className="w-full justify-start gap-3 h-auto p-4"
            >
              {automating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bot className="h-5 w-5" />}
              <div className="text-left">
                <p className="font-medium">Generate Country Checklists</p>
                <p className="text-sm opacity-90">Pick origin, destination, and education level to auto-create procedures.</p>
              </div>
            </Button>
            <div className="grid gap-3">
              <Link
                to="/admin/checklists"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
              >
                <CheckSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Manage Checklists</p>
                  <p className="text-sm text-muted-foreground">Add or edit visa checklists and items</p>
                </div>
              </Link>
              <Link
                to="/admin/visa-types"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
              >
                <Stamp className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Manage Visa Types</p>
                  <p className="text-sm text-muted-foreground">Configure visa types per country</p>
                </div>
              </Link>
              <Link
                to="/admin/articles"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Manage Articles</p>
                  <p className="text-sm text-muted-foreground">Create, edit, and publish guidance</p>
                </div>
              </Link>
              <Link
                to="/admin/countries"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
              >
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Manage Countries</p>
                  <p className="text-sm text-muted-foreground">Add or edit destination countries</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={automationDialogOpen} onOpenChange={setAutomationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate country checklists</DialogTitle>
            <DialogDescription>
              Choose the destination, education level, and optionally an origin country to auto-create visa plans and procedures.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Destination country</Label>
              <Select
                value={automationForm.destinationCountry}
                onValueChange={(value) => setAutomationForm((prev) => ({ ...prev, destinationCountry: value }))}
                disabled={automating || destinationChoices.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All destinations</SelectItem>
                  {destinationChoices.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Origin country (optional)</Label>
              <Select
                value={automationForm.originCountry}
                onValueChange={(value) => setAutomationForm((prev) => ({ ...prev, originCountry: value }))}
                disabled={automating || originChoices.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All origins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All origins</SelectItem>
                  {originChoices.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Education level</Label>
              <Select
                value={automationForm.educationLevel}
                onValueChange={(value) => setAutomationForm((prev) => ({ ...prev, educationLevel: value }))}
                disabled={automating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {destinationChoices.length === 0 && (
              <p className="text-sm text-destructive">No destination countries are available for automation.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutomationDialogOpen(false)} disabled={automating}>
              Cancel
            </Button>
            <Button onClick={runAutomatedBackfill} disabled={automating || destinationChoices.length === 0}>
              {automating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
