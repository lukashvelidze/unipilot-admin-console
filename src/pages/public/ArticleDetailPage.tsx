import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Article, ArticleCategory } from '@/types/article';
import { Country, VisaType } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const placeholderImage = '/placeholder.svg';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [destCountries, setDestCountries] = useState<Country[]>([]);
  const [originCountries, setOriginCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [articleCategoryIds, setArticleCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      const [{ data, error: articleError }, destRes, originRes, visaRes, categoriesRes] = await Promise.all([
        supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .eq('access_tier', 'free')
          .single(),
        supabase.from('destination_countries').select('*').eq('is_active', true).order('name'),
        supabase.from('origin_countries').select('*').eq('is_active', true).order('name'),
        supabase.from('visa_types').select('*').eq('is_active', true).order('title'),
        supabase.from('article_categories').select('*').eq('is_active', true).order('sort_order', { ascending: true, nullsFirst: false }).order('title'),
      ]);

      if (articleError) setError(articleError.message);
      else setArticle(data as Article);

      if (!destRes.error) setDestCountries(destRes.data || []);
      if (!originRes.error) setOriginCountries(originRes.data || []);
      if (!visaRes.error) setVisaTypes(visaRes.data || []);
      if (!categoriesRes.error) setCategories(categoriesRes.data || []);

      if (data?.id) {
        const activeCategoryIds = new Set((categoriesRes.data || []).map((c: ArticleCategory) => c.id));
        const { data: mapData } = await supabase
          .from('article_category_map')
          .select('category_id')
          .eq('article_id', data.id);
        setArticleCategoryIds((mapData || []).map((m) => m.category_id).filter((id) => activeCategoryIds.has(id)));
      }
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const getDestinationName = (code: string | null) => destCountries.find((c) => c.code === code)?.name || code || 'Global';
  const getOriginName = (code: string | null) => originCountries.find((c) => c.code === code)?.name || code || 'All origins';
  const getVisaTitle = (code: string) => visaTypes.find((v) => v.code === code)?.title || code;

  const readingTime = useMemo(() => {
    if (!article?.content) return null;
    const words = article.content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [article?.content]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-72 w-full" />
        <div className="container mx-auto px-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!article || error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        This article is unavailable.
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        <img
          src={article.cover_image_url || placeholderImage}
          alt={article.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-24 space-y-6">
        <div className="space-y-4 rounded-xl bg-card/80 backdrop-blur p-6 shadow-lg">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {article.is_global ? 'Global' : getDestinationName(article.destination_country_code)}
            </Badge>
            {article.origin_country_code && (
              <Badge variant="outline">
                Origin: {getOriginName(article.origin_country_code)}
              </Badge>
            )}
            {article.visa_types?.map((code) => (
              <Badge key={code} variant="outline">
                {getVisaTitle(code)}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {new Date(article.updated_at).toLocaleDateString()}
              {readingTime ? ` · ${readingTime} min read` : ''}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">{article.title}</h1>
            {article.summary && <p className="text-lg text-muted-foreground">{article.summary}</p>}
          </div>
        </div>

        <div className="prose prose-neutral max-w-4xl whitespace-pre-wrap leading-relaxed">
          {article.content}
        </div>
      </div>
    </div>
  );
}
