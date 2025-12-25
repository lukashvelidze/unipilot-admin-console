import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Article, ArticleCategory } from '@/types/article';
import { Country, VisaType } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const placeholderImage = '/placeholder.svg';

export function ArticlesFeedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [articleCategoryMap, setArticleCategoryMap] = useState<Record<string, string[]>>({});
  const [destCountries, setDestCountries] = useState<Country[]>([]);
  const [originCountries, setOriginCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [destinationFilter, setDestinationFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState('all');
  const [visaFilter, setVisaFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [articlesRes, destRes, originRes, visaRes, categoriesRes, mapRes] = await Promise.all([
        supabase.from('articles').select('*').eq('published', true).order('updated_at', { ascending: false }),
        supabase.from('destination_countries').select('*').eq('is_active', true).order('name'),
        supabase.from('origin_countries').select('*').eq('is_active', true).order('name'),
        supabase.from('visa_types').select('*').eq('is_active', true).order('title'),
        supabase.from('article_categories').select('*').eq('is_active', true).order('sort_order', { ascending: true, nullsFirst: false }).order('title'),
        supabase.from('article_category_map').select('article_id, category_id'),
      ]);

      if (articlesRes.error) setError(articlesRes.error.message);
      else setArticles(articlesRes.data || []);

      if (!destRes.error) setDestCountries(destRes.data || []);
      if (!originRes.error) setOriginCountries(originRes.data || []);
      if (!visaRes.error) setVisaTypes(visaRes.data || []);
      if (!categoriesRes.error) setCategories(categoriesRes.data || []);
      if (!mapRes.error) {
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
  }, []);

  const getDestinationName = (code: string | null) => destCountries.find((c) => c.code === code)?.name || code || 'Global';
  const getOriginName = (code: string | null) => originCountries.find((c) => c.code === code)?.name || code || 'All origins';
  const getVisaTitle = (code: string) => visaTypes.find((v) => v.code === code)?.title || code;

  const filteredArticles = useMemo(
    () =>
      articles.filter((article) => {
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
          (article.visa_types && article.visa_types.includes(visaFilter));

        const matchesCategory =
          categoryFilter === 'all' ||
          (articleCategoryMap[article.id] || []).includes(categoryFilter);

        return matchesDestination && matchesOrigin && matchesVisa && matchesCategory;
      }),
    [articles, destinationFilter, originFilter, visaFilter, categoryFilter, articleCategoryMap]
  );

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">Articles</p>
          <h1 className="text-4xl md:text-5xl font-bold">Guides for every visa journey</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Curated articles to help you plan, prepare, and stay on track with your study visa.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
              categoryFilter === 'all'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilter(category.id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
                categoryFilter === category.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Destination</p>
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All destinations" />
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
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Origin</p>
            <Select value={originFilter} onValueChange={setOriginFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All origins" />
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
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Visa type</p>
            <Select value={visaFilter} onValueChange={setVisaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All visas" />
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
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive">
            Failed to load articles: {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link key={article.id} to={`/articles/${article.slug}`} className="group">
                <Card className="overflow-hidden h-full transition-transform duration-200 group-hover:-translate-y-1">
                  <div className="relative">
                    <AspectRatio ratio={16 / 9}>
                      <img
                        src={article.cover_image_url || placeholderImage}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    </AspectRatio>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[11px]">
                        {article.is_global ? 'Global' : getDestinationName(article.destination_country_code)}
                      </Badge>
                      {article.visa_types?.slice(0, 2).map((code) => (
                        <Badge key={code} variant="outline" className="text-[11px]">
                          {getVisaTitle(code)}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold leading-tight line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{article.summary || 'Read more'}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(article.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {!loading && filteredArticles.length === 0 && (
              <Card className="p-6 text-center text-muted-foreground col-span-full">
                No articles match these filters yet.
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
