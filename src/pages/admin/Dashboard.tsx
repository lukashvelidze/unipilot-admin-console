import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  buildCountryOptions,
  buildJourneyDraft,
  CountryRecord,
  EDUCATION_LEVEL_OPTIONS,
  EducationLevel,
  getEducationLevelLabel,
  ChecklistItemRecord,
  ChecklistRecord,
  VisaTypeRecord,
} from '@/lib/journeyGenerator';
import { Globe, CheckSquare, Stamp, Loader2, FileText, Compass } from 'lucide-react';

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

interface ArticleCategoryRecord {
  id: string;
  slug: string;
  title: string;
  is_active: boolean;
}

const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ');

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCountries: 0,
    totalVisaTypes: 0,
    totalChecklists: 0,
  });
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [destinationCountries, setDestinationCountries] = useState<CountryRecord[]>([]);
  const [originCountries, setOriginCountries] = useState<CountryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingJourney, setGeneratingJourney] = useState(false);
  const [lastGeneratedSummary, setLastGeneratedSummary] = useState<string | null>(null);
  const [routeForm, setRouteForm] = useState({
    destinationCountryCode: '',
    originCountryCode: '',
    educationLevel: 'masters' as EducationLevel,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const destinationOptions = useMemo(
    () => buildCountryOptions(destinationCountries),
    [destinationCountries]
  );

  const originOptions = useMemo(() => buildCountryOptions(originCountries), [originCountries]);

  const selectedDestination = useMemo(
    () => destinationOptions.find((country) => country.code === routeForm.destinationCountryCode) || null,
    [destinationOptions, routeForm.destinationCountryCode]
  );

  const selectedOrigin = useMemo(
    () => originOptions.find((country) => country.code === routeForm.originCountryCode) || null,
    [originOptions, routeForm.originCountryCode]
  );

  const fetchDashboardData = async () => {
    setLoading(true);

    const [countriesRes, visaTypesRes, checklistsRes, profilesRes, destinationRes, originRes] = await Promise.all([
      supabase.from('destination_countries').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('visa_types').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('checklists').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id, full_name, email, subscription_tier, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('destination_countries').select('code, name, is_active').order('name'),
      supabase.from('origin_countries').select('code, name, is_active').order('name'),
    ]);

    setStats({
      totalCountries: countriesRes.count || 0,
      totalVisaTypes: visaTypesRes.count || 0,
      totalChecklists: checklistsRes.count || 0,
    });

    setRecentProfiles(profilesRes.data || []);
    setDestinationCountries(destinationRes.data || []);
    setOriginCountries(originRes.data || []);
    setLoading(false);
  };

  const handleGenerateJourney = async () => {
    if (!selectedDestination || !selectedOrigin) {
      toast({
        title: 'Missing route details',
        description: 'Choose both an origin country and a destination country before generating the journey.',
        variant: 'destructive',
      });
      return;
    }

    if (normalizeText(selectedDestination.name) === normalizeText(selectedOrigin.name)) {
      toast({
        title: 'Invalid route',
        description: 'Origin and destination cannot be the same country.',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingJourney(true);

    try {
      const [visaRes, checklistRes, checklistItemRes, categoryRes] = await Promise.all([
        supabase
          .from('visa_types')
          .select('code, country_code, title, description, is_active')
          .order('title'),
        supabase
          .from('checklists')
          .select('id, visa_type, title, sort_order, country_code, subscription_tier')
          .order('sort_order'),
        supabase
          .from('checklist_items')
          .select('id, checklist_id, label, field_type, metadata, sort_order')
          .order('sort_order'),
        supabase
          .from('article_categories')
          .select('id, slug, title, is_active')
          .eq('is_active', true)
          .order('title'),
      ]);

      if (visaRes.error || checklistRes.error || checklistItemRes.error || categoryRes.error) {
        toast({
          title: 'Could not load journey templates',
          description:
            visaRes.error?.message ||
            checklistRes.error?.message ||
            checklistItemRes.error?.message ||
            categoryRes.error?.message ||
            'Unknown error',
          variant: 'destructive',
        });
        return;
      }

      const draft = buildJourneyDraft({
        destination: selectedDestination,
        origin: selectedOrigin,
        educationLevel: routeForm.educationLevel,
        visaTypes: (visaRes.data || []) as VisaTypeRecord[],
        checklists: (checklistRes.data || []) as ChecklistRecord[],
        checklistItems: (checklistItemRes.data || []) as ChecklistItemRecord[],
      });

      const [destinationUpsertRes, originUpsertRes] = await Promise.all([
        supabase
          .from('destination_countries')
          .upsert(
            {
              code: selectedDestination.code,
              name: selectedDestination.name,
              is_active: true,
            },
            { onConflict: 'code' }
          ),
        supabase
          .from('origin_countries')
          .upsert(
            {
              code: selectedOrigin.code,
              name: selectedOrigin.name,
              is_active: true,
            },
            { onConflict: 'code' }
          ),
      ]);

      if (destinationUpsertRes.error || originUpsertRes.error) {
        toast({
          title: 'Country sync failed',
          description: destinationUpsertRes.error?.message || originUpsertRes.error?.message || 'Unknown error',
          variant: 'destructive',
        });
        return;
      }

      const { error: visaUpsertError } = await supabase.from('visa_types').upsert(
        {
          code: draft.routeVisaCode,
          country_code: selectedDestination.code,
          title: draft.routeVisaTitle,
          description: draft.routeVisaDescription,
          is_active: true,
        },
        { onConflict: 'code' }
      );

      if (visaUpsertError) {
        toast({
          title: 'Visa type sync failed',
          description: visaUpsertError.message,
          variant: 'destructive',
        });
        return;
      }

      const { data: existingRouteChecklists, error: existingRouteChecklistsError } = await supabase
        .from('checklists')
        .select('id')
        .eq('visa_type', draft.routeVisaCode);

      if (existingRouteChecklistsError) {
        toast({
          title: 'Checklist refresh failed',
          description: existingRouteChecklistsError.message,
          variant: 'destructive',
        });
        return;
      }

      const existingRouteChecklistIds = (existingRouteChecklists || []).map((checklist) => checklist.id);

      if (existingRouteChecklistIds.length > 0) {
        const { error: deleteItemsError } = await supabase
          .from('checklist_items')
          .delete()
          .in('checklist_id', existingRouteChecklistIds);

        if (deleteItemsError) {
          toast({
            title: 'Checklist refresh failed',
            description: deleteItemsError.message,
            variant: 'destructive',
          });
          return;
        }

        const { error: deleteChecklistsError } = await supabase
          .from('checklists')
          .delete()
          .eq('visa_type', draft.routeVisaCode);

        if (deleteChecklistsError) {
          toast({
            title: 'Checklist refresh failed',
            description: deleteChecklistsError.message,
            variant: 'destructive',
          });
          return;
        }
      }

      const { data: insertedChecklists, error: insertChecklistsError } = await supabase
        .from('checklists')
        .insert(
          draft.checklists.map((checklist) => ({
            visa_type: draft.routeVisaCode,
            country_code: selectedDestination.code,
            title: checklist.title,
            sort_order: checklist.sort_order,
            subscription_tier: checklist.subscription_tier,
          }))
        )
        .select('id, title');

      if (insertChecklistsError) {
        toast({
          title: 'Checklist creation failed',
          description: insertChecklistsError.message,
          variant: 'destructive',
        });
        return;
      }

      const insertedChecklistByTitle = new Map((insertedChecklists || []).map((checklist) => [checklist.title, checklist.id]));
      const checklistItemPayload = draft.checklists.flatMap((checklist) => {
        const insertedChecklistId = insertedChecklistByTitle.get(checklist.title);
        if (!insertedChecklistId) return [];

        return checklist.items.map((item) => ({
          checklist_id: insertedChecklistId,
          label: item.label,
          field_type: item.field_type,
          metadata: item.metadata,
          sort_order: item.sort_order,
        }));
      });

      if (checklistItemPayload.length > 0) {
        const { error: insertItemsError } = await supabase.from('checklist_items').insert(checklistItemPayload);

        if (insertItemsError) {
          toast({
            title: 'Checklist item creation failed',
            description: insertItemsError.message,
            variant: 'destructive',
          });
          return;
        }
      }

      const categories = (categoryRes.data || []) as ArticleCategoryRecord[];
      const timestamp = new Date().toISOString();

      for (const article of draft.articles) {
        const { data: savedArticle, error: articleUpsertError } = await supabase
          .from('articles')
          .upsert(
            {
              slug: article.slug,
              title: article.title,
              summary: article.summary,
              content: article.content,
              cover_image_url: article.coverImageUrl,
              destination_country_code: selectedDestination.code,
              origin_country_code: selectedOrigin.code,
              visa_types: [draft.routeVisaCode],
              is_global: false,
              access_tier: 'free',
              published: true,
              updated_at: timestamp,
            },
            { onConflict: 'slug' }
          )
          .select('id')
          .single();

        if (articleUpsertError || !savedArticle) {
          toast({
            title: 'Article creation failed',
            description: articleUpsertError?.message || 'Failed to save a generated article.',
            variant: 'destructive',
          });
          return;
        }

        const categoryId = resolveCategoryId(article.categoryKey, categories);
        const { error: deleteCategoryMapError } = await supabase
          .from('article_category_map')
          .delete()
          .eq('article_id', savedArticle.id);

        if (deleteCategoryMapError) {
          toast({
            title: 'Article category sync failed',
            description: deleteCategoryMapError.message,
            variant: 'destructive',
          });
          return;
        }

        if (categoryId) {
          const { error: insertCategoryMapError } = await supabase.from('article_category_map').insert({
            article_id: savedArticle.id,
            category_id: categoryId,
          });

          if (insertCategoryMapError) {
            toast({
              title: 'Article category sync failed',
              description: insertCategoryMapError.message,
              variant: 'destructive',
            });
            return;
          }
        }
      }

      await fetchDashboardData();

      const summary = `${selectedOrigin.name} to ${selectedDestination.name} for ${getEducationLevelLabel(
        routeForm.educationLevel
      )}: ${draft.checklists.length} checklists, ${checklistItemPayload.length} checklist items, ${draft.articles.length} articles. ${draft.sourceSummary}`;

      setLastGeneratedSummary(summary);
      toast({
        title: 'Journey generated',
        description: summary,
      });
    } catch (error) {
      toast({
        title: 'Journey generation failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setGeneratingJourney(false);
    }
  };

  const userColumns = [
    {
      key: 'full_name',
      header: 'Name',
      render: (user: RecentProfile) => user.full_name || 'N/A',
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: RecentProfile) => user.email || 'N/A',
    },
    {
      key: 'subscription_tier',
      header: 'Tier',
      render: (user: RecentProfile) => (
        <StatusBadge status={user.subscription_tier === 'premium' ? 'success' : 'default'}>
          {user.subscription_tier || 'free'}
        </StatusBadge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user: RecentProfile) => new Date(user.created_at).toLocaleDateString(),
    },
  ];

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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Users</h2>
            </div>
            {recentProfiles.length > 0 ? (
              <DataTable columns={userColumns} data={recentProfiles} />
            ) : (
              <div className="rounded-lg border py-8 text-center text-muted-foreground">
                No users found
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Generate Route Journey</CardTitle>
                    <CardDescription>
                      Create a route-specific visa type, detailed checklists, and articles using your current database examples as the base.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destination-country">Destination country</Label>
                    <Select
                      value={routeForm.destinationCountryCode}
                      onValueChange={(value) =>
                        setRouteForm((prev) => ({ ...prev, destinationCountryCode: value }))
                      }
                    >
                      <SelectTrigger id="destination-country">
                        <SelectValue placeholder="Select destination country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {destinationOptions.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origin-country">Origin country</Label>
                    <Select
                      value={routeForm.originCountryCode}
                      onValueChange={(value) =>
                        setRouteForm((prev) => ({ ...prev, originCountryCode: value }))
                      }
                    >
                      <SelectTrigger id="origin-country">
                        <SelectValue placeholder="Select origin country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {originOptions.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education-level">Education level</Label>
                    <Select
                      value={routeForm.educationLevel}
                      onValueChange={(value) =>
                        setRouteForm((prev) => ({ ...prev, educationLevel: value as EducationLevel }))
                      }
                    >
                      <SelectTrigger id="education-level">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  The generator will create one route-specific visa type, rebuild the checklist flow for that route, and publish route-specific visa, housing, flights, and scholarship articles.
                </div>

                {lastGeneratedSummary ? (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
                    {lastGeneratedSummary}
                  </div>
                ) : null}

                <Button
                  type="button"
                  onClick={handleGenerateJourney}
                  disabled={generatingJourney}
                  className="w-full"
                >
                  {generatingJourney ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Generate journey
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
              </div>
              <div className="grid gap-3">
                <Link
                  to="/admin/checklists"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Manage Checklists</p>
                    <p className="text-sm text-muted-foreground">Add or edit visa checklists and items</p>
                  </div>
                </Link>
                <Link
                  to="/admin/visa-types"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <Stamp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Manage Visa Types</p>
                    <p className="text-sm text-muted-foreground">Configure visa types per country</p>
                  </div>
                </Link>
                <Link
                  to="/admin/articles"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Manage Articles</p>
                    <p className="text-sm text-muted-foreground">Create, edit, and publish guidance</p>
                  </div>
                </Link>
                <Link
                  to="/admin/countries"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
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
      </div>
    </AdminLayout>
  );
}

const resolveCategoryId = (
  categoryKey: 'visa' | 'housing' | 'flights' | 'scholarships',
  categories: ArticleCategoryRecord[]
) => {
  const matches = {
    visa: ['visa'],
    housing: ['housing'],
    flights: ['flights', 'flight'],
    scholarships: ['scholarships', 'scholarship'],
  }[categoryKey];

  return (
    categories.find((category) => {
      const title = normalizeText(category.title);
      const slug = normalizeText(category.slug);
      return matches.some((match) => title.includes(match) || slug.includes(match));
    })?.id || null
  );
};
