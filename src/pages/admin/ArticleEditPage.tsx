import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Article } from '@/types/article';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ArticleEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).single();

      if (error) {
        toast({ title: 'Article not found', description: error.message, variant: 'destructive' });
      } else {
        setArticle(data as Article);
        if (data?.id) {
          const { data: mapData } = await supabase
            .from('article_category_map')
            .select('category_id')
            .eq('article_id', data.id);
          setCategoryIds((mapData || []).map((m) => m.category_id));
        }
      }
      setLoading(false);
    };

    fetchArticle();
  }, [slug, toast]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Article</h1>
            <p className="text-muted-foreground">Update content, metadata, and publish state.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/articles')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-lg border border-border py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading article...
          </div>
        ) : article ? (
          <ArticleForm
            article={article}
            initialCategoryIds={categoryIds}
            onSuccess={(saved) => {
              setArticle(saved);
              navigate('/admin/articles');
            }}
          />
        ) : (
          <div className="rounded-lg border border-border bg-muted/20 p-6 text-muted-foreground">
            Article not found.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
