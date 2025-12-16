import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Article, Country, VisaType } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Filter,
  ChevronDown,
} from 'lucide-react';

interface ArticleFormState {
  title: string;
  slug: string;
  help_route: string;
  summary: string;
  content: string;
  destination_country_code: string;
  origin_country_code: string;
  visa_types: string[];
  is_global: boolean;
  access_tier: Article['access_tier'];
  published: boolean;
  reading_time_minutes: string;
}

const emptyForm: ArticleFormState = {
  title: '',
  slug: '',
  help_route: '',
  summary: '',
  content: '',
  destination_country_code: '',
  origin_country_code: '',
  visa_types: [],
  is_global: false,
  access_tier: 'free',
  published: true,
  reading_time_minutes: '',
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [originCountries, setOriginCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | Article['access_tier']>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<ArticleFormState>(emptyForm);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [articleRes, destRes, originRes, visaRes] = await Promise.all([
      supabase.from('articles').select('*').order('updated_at', { ascending: false }),
      supabase.from('destination_countries').select('*').eq('is_active', true).order('name'),
      supabase.from('origin_countries').select('*').eq('is_active', true).order('name'),
      supabase.from('visa_types').select('*').eq('is_active', true).order('title'),
    ]);

    if (articleRes.error) {
      toast({ title: 'Error loading articles', description: articleRes.error.message, variant: 'destructive' });
    } else {
      setArticles(articleRes.data || []);
    }

    if (destRes.error) {
      toast({ title: 'Error loading destination countries', description: destRes.error.message, variant: 'destructive' });
    } else {
      setCountries(destRes.data || []);
    }

    if (originRes.error) {
      toast({ title: 'Error loading origin countries', description: originRes.error.message, variant: 'destructive' });
    } else {
      setOriginCountries(originRes.data || []);
    }

    if (visaRes.error) {
      toast({ title: 'Error loading visa types', description: visaRes.error.message, variant: 'destructive' });
    } else {
      setVisaTypes(visaRes.data || []);
    }

    setLoading(false);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.help_route.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && article.published) ||
      (statusFilter === 'draft' && !article.published);

    const matchesTier =
      tierFilter === 'all' || article.access_tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingArticle(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      help_route: article.help_route,
      summary: article.summary || '',
      content: article.content,
      destination_country_code: article.destination_country_code || '',
      origin_country_code: article.origin_country_code || '',
      visa_types: article.visa_types || [],
      is_global: article.is_global,
      access_tier: article.access_tier,
      published: article.published,
      reading_time_minutes: article.reading_time_minutes?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const toggleVisaType = (code: string) => {
    setFormData((prev) => {
      const exists = prev.visa_types.includes(code);
      const visa_types = exists
        ? prev.visa_types.filter((v) => v !== code)
        : [...prev.visa_types, code];
      return { ...prev, visa_types };
    });
  };

  const getCountryName = (code: string | null, list: Country[]) =>
    list.find((c) => c.code === code)?.name || code || '-';

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.help_route || !formData.content) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const readingTime = formData.reading_time_minutes
      ? parseInt(formData.reading_time_minutes, 10)
      : null;

    if (formData.reading_time_minutes && Number.isNaN(readingTime)) {
      toast({ title: 'Reading time must be a number', variant: 'destructive' });
      return;
    }

    const payload = {
      slug: formData.slug.trim(),
      help_route: formData.help_route.trim(),
      title: formData.title.trim(),
      summary: formData.summary || null,
      content: formData.content,
      destination_country_code: formData.destination_country_code || null,
      origin_country_code: formData.origin_country_code || null,
      visa_types: formData.visa_types.length ? formData.visa_types : null,
      is_global: formData.is_global,
      access_tier: formData.access_tier,
      published: formData.published,
      reading_time_minutes: readingTime,
      updated_at: new Date().toISOString(),
    };

    setSubmitting(true);

    if (editingArticle) {
      const { data, error } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', editingArticle.id)
        .select()
        .single();

      if (error) {
        toast({ title: 'Error updating article', description: error.message, variant: 'destructive' });
      } else if (data) {
        setArticles((prev) => prev.map((a) => (a.id === editingArticle.id ? data : a)));
        toast({ title: 'Article updated' });
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from('articles')
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        toast({ title: 'Error creating article', description: error.message, variant: 'destructive' });
      } else if (data) {
        setArticles((prev) => [data, ...prev]);
        toast({ title: 'Article created' });
        setIsDialogOpen(false);
        resetForm();
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this article? This cannot be undone.');
    if (!confirmed) return;

    const { error } = await supabase.from('articles').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting article', description: error.message, variant: 'destructive' });
    } else {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Article deleted' });
    }
  };

  const tierColors: Record<Article['access_tier'], 'default' | 'warning' | 'success'> = {
    free: 'default',
    standard: 'warning',
    premium: 'success',
  };

  const columns = [
    {
      key: 'title',
      header: 'Article',
      render: (article: Article) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{article.title}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            /{article.help_route} • {article.slug}
          </p>
        </div>
      ),
    },
    {
      key: 'destination_country_code',
      header: 'Destination',
      render: (article: Article) =>
        article.is_global ? (
          <StatusBadge status="info">Global</StatusBadge>
        ) : (
          <span>{getCountryName(article.destination_country_code, countries)}</span>
        ),
    },
    {
      key: 'visa_types',
      header: 'Visa Types',
      render: (article: Article) => (
        <div className="flex flex-wrap gap-1 max-w-[260px]">
          {article.visa_types?.length ? (
            article.visa_types.map((code) => (
              <Badge key={code} variant="secondary">
                {code}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">All</span>
          )}
        </div>
      ),
    },
    {
      key: 'access_tier',
      header: 'Tier',
      render: (article: Article) => (
        <StatusBadge status={tierColors[article.access_tier]}>
          {article.access_tier}
        </StatusBadge>
      ),
    },
    {
      key: 'published',
      header: 'Status',
      render: (article: Article) => (
        <StatusBadge status={article.published ? 'success' : 'warning'}>
          {article.published ? 'Published' : 'Draft'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (article: Article) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(article);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(article.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Articles</h1>
            <p className="text-muted-foreground">Add and edit knowledge base articles.</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Article
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, slug, or route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as typeof tierFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredArticles} onRowClick={openEditDialog} />
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Add Article'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., How to prepare your visa interview"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="visa-interview-guide"
                />
              </div>
              <div className="space-y-2">
                <Label>Help Route *</Label>
                <Input
                  value={formData.help_route}
                  onChange={(e) => setFormData((f) => ({ ...f, help_route: e.target.value }))}
                  placeholder="help/visa/interview"
                />
              </div>
              <div className="space-y-2">
                <Label>Reading Time (minutes)</Label>
                <Input
                  type="number"
                  value={formData.reading_time_minutes}
                  onChange={(e) => setFormData((f) => ({ ...f, reading_time_minutes: e.target.value }))}
                  placeholder="5"
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData((f) => ({ ...f, summary: e.target.value }))}
                placeholder="Short description shown in lists"
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData((f) => ({ ...f, content: e.target.value }))}
                placeholder="Full article content..."
                className="min-h-[160px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Destination Country</Label>
                <Select
                  value={formData.destination_country_code}
                  onValueChange={(v) => setFormData((f) => ({ ...f, destination_country_code: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Origin Country</Label>
                <Select
                  value={formData.origin_country_code}
                  onValueChange={(v) => setFormData((f) => ({ ...f, origin_country_code: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {originCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Access Tier</Label>
                <Select
                  value={formData.access_tier}
                  onValueChange={(v) => setFormData((f) => ({ ...f, access_tier: v as Article['access_tier'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visa Types</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate">
                      {formData.visa_types.length
                        ? `${formData.visa_types.length} selected`
                        : 'All visa types'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[320px]">
                  {visaTypes.map((visa) => (
                    <DropdownMenuCheckboxItem
                      key={visa.code}
                      checked={formData.visa_types.includes(visa.code)}
                      onCheckedChange={() => toggleVisaType(visa.code)}
                    >
                      {visa.title} ({visa.code})
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {formData.visa_types.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.visa_types.map((code) => (
                    <Badge key={code} variant="secondary">
                      {code}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Published</p>
                  <p className="text-xs text-muted-foreground">Visible to users</p>
                </div>
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, published: checked }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Global Article</p>
                  <p className="text-xs text-muted-foreground">Applies to all destinations</p>
                </div>
                <Switch
                  checked={formData.is_global}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, is_global: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingArticle ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
