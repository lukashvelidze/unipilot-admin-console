import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Article, ArticleCategory } from '@/types/article';
import { Country, VisaType } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [destCountries, setDestCountries] = useState<Country[]>([]);
  const [originCountries, setOriginCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [articleCategoryMap, setArticleCategoryMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState('all');
  const [visaFilter, setVisaFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [articlesRes, destRes, originRes, visaRes, categoriesRes, mapRes] = await Promise.all([
        supabase.from('articles').select('*').order('updated_at', { ascending: false }),
        supabase.from('destination_countries').select('*').eq('is_active', true).order('name'),
        supabase.from('origin_countries').select('*').eq('is_active', true).order('name'),
        supabase.from('visa_types').select('*').eq('is_active', true).order('title'),
        supabase.from('article_categories').select('*').eq('is_active', true).order('sort_order', { ascending: true, nullsFirst: false }).order('title'),
        supabase.from('article_category_map').select('article_id, category_id'),
      ]);

      if (articlesRes.error) {
        toast({ title: 'Error loading articles', description: articlesRes.error.message, variant: 'destructive' });
      } else {
        setArticles(articlesRes.data || []);
      }

      if (destRes.error) {
        toast({ title: 'Error loading destination countries', description: destRes.error.message, variant: 'destructive' });
      } else {
        setDestCountries(destRes.data || []);
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

      if (categoriesRes.error) {
        toast({ title: 'Error loading categories', description: categoriesRes.error.message, variant: 'destructive' });
      } else {
        setCategories(categoriesRes.data || []);
      }

      if (mapRes.error) {
        toast({ title: 'Error loading category assignments', description: mapRes.error.message, variant: 'destructive' });
      } else {
        const activeCategoryIds = new Set((categoriesRes.data || []).map((c: ArticleCategory) => c.id));
        const grouped = (mapRes.data || []).reduce<Record<string, string[]>>((acc, row: { article_id: string; category_id: string }) => {
          if (!activeCategoryIds.has(row.category_id)) return acc;
          acc[row.article_id] = acc[row.article_id] ? [...acc[row.article_id], row.category_id] : [row.category_id];
          return acc;
        }, {});
        setArticleCategoryMap(grouped);
      }

      setLoading(false);
    };

    fetchData();
  }, [toast]);

  const getDestinationName = (code: string | null) =>
    destCountries.find((c) => c.code === code)?.name || code || 'Global';
  const getOriginName = (code: string | null) =>
    originCountries.find((c) => c.code === code)?.name || code || 'All origins';

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.summary || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDestination =
        destinationFilter === 'all' ||
        article.is_global ||
        article.destination_country_code === destinationFilter;

      const matchesOrigin =
        originFilter === 'all' ||
        article.origin_country_code === null ||
        article.origin_country_code === originFilter;

      const matchesVisa =
        visaFilter === 'all' ||
        article.visa_types === null ||
        article.visa_types.length === 0 ||
        article.visa_types.includes(visaFilter);

      const matchesCategory =
        categoryFilter === 'all' ||
        (articleCategoryMap[article.id] || []).includes(categoryFilter);

      const matchesPublished =
        publishedFilter === 'all' ||
        (publishedFilter === 'published' ? article.published : !article.published);

      return matchesSearch && matchesDestination && matchesOrigin && matchesVisa && matchesCategory && matchesPublished;
    });
  }, [articles, destinationFilter, originFilter, visaFilter, categoryFilter, publishedFilter, searchQuery, articleCategoryMap]);

  const handleDelete = async (article: Article) => {
    const confirmed = window.confirm(`Delete article "${article.title}"?`);
    if (!confirmed) return;

    await supabase.from('article_category_map').delete().eq('article_id', article.id);

    const { error } = await supabase.from('articles').delete().eq('id', article.id);
    if (error) {
      toast({ title: 'Error deleting article', description: error.message, variant: 'destructive' });
    } else {
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      setArticleCategoryMap((prev) => {
        const copy = { ...prev };
        delete copy[article.id];
        return copy;
      });
      toast({ title: 'Article deleted' });
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    {
      key: 'destination',
      header: 'Destination',
      render: (article: Article) => (article.is_global ? 'Global' : getDestinationName(article.destination_country_code)),
    },
    {
      key: 'origin',
      header: 'Origin',
      render: (article: Article) => (article.origin_country_code ? getOriginName(article.origin_country_code) : 'All origins'),
    },
    {
      key: 'access_tier',
      header: 'Access Tier',
      render: (article: Article) => article.access_tier || '—',
    },
    {
      key: 'categories',
      header: 'Categories',
      render: (article: Article) => {
        const ids = articleCategoryMap[article.id] || [];
        if (ids.length === 0) return '—';
        const titles = ids
          .map((id) => categories.find((c) => c.id === id)?.title)
          .filter(Boolean)
          .join(', ');
        return titles || '—';
      },
    },
    {
      key: 'published',
      header: 'Published',
      render: (article: Article) => (
        <StatusBadge status={article.published ? 'success' : 'default'}>
          {article.published ? 'Published' : 'Not published'}
        </StatusBadge>
      ),
    },
    {
      key: 'updated_at',
      header: 'Last Updated',
      render: (article: Article) =>
        article.updated_at ? new Date(article.updated_at).toLocaleString() : '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (article: Article) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/articles/${article.slug}`);
            }}
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(article);
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
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
            <p className="text-muted-foreground">Manage all published and draft articles.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/article-categories')}>
              Manage Categories
            </Button>
            <Button onClick={() => navigate('/admin/articles/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Input
            placeholder="Search title or summary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={destinationFilter} onValueChange={setDestinationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All destinations</SelectItem>
              {destCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={originFilter} onValueChange={setOriginFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Origin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All origins</SelectItem>
              {originCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={visaFilter} onValueChange={setVisaFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Visa type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All visas</SelectItem>
              {visaTypes.map((visa) => (
                <SelectItem key={visa.code} value={visa.code}>
                  {visa.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={publishedFilter} onValueChange={(value: 'all' | 'published' | 'draft') => setPublishedFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Published state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Not published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-lg border border-border py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No articles found. Create your first one to get started.
          </Card>
        ) : (
          <DataTable columns={columns} data={filteredArticles} onRowClick={(article) => navigate(`/admin/articles/${article.slug}`)} />
        )}
      </div>
    </AdminLayout>
  );
}
