import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ArticleCategory } from '@/types/article';
import { Loader2, Pencil, RefreshCw, Trash2 } from 'lucide-react';

type CategoryFormState = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  sort_order: string;
  is_active: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export default function ArticleCategoriesPage() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState<CategoryFormState>({
    title: '',
    slug: '',
    description: '',
    sort_order: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!slugDirty) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugDirty]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('article_categories')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('title');

    if (error) {
      toast({ title: 'Error loading categories', description: error.message, variant: 'destructive' });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      description: '',
      sort_order: '',
      is_active: true,
    });
    setSlugDirty(false);
  };

  const handleEdit = (category: ArticleCategory) => {
    setForm({
      id: category.id,
      title: category.title,
      slug: category.slug,
      description: category.description ?? '',
      sort_order: category.sort_order?.toString() ?? '',
      is_active: category.is_active,
    });
    setSlugDirty(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    const normalizedSlug = (form.slug || slugify(form.title)).toLowerCase();
    const sortOrder = form.sort_order ? Number(form.sort_order) : null;

    setSaving(true);

    // Uniqueness check
    const { data: existing, error: existingError } = await supabase
      .from('article_categories')
      .select('id')
      .eq('slug', normalizedSlug)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      toast({ title: 'Failed to validate slug', description: existingError.message, variant: 'destructive' });
      setSaving(false);
      return;
    }

    if (existing && existing.id !== form.id) {
      toast({ title: 'Slug already exists', description: 'Please choose a unique slug.', variant: 'destructive' });
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: normalizedSlug,
      description: form.description || null,
      sort_order: sortOrder,
      is_active: form.is_active,
    };

    let error;
    if (form.id) {
      ({ error } = await supabase.from('article_categories').update(payload).eq('id', form.id));
    } else {
      ({ error } = await supabase.from('article_categories').insert(payload));
    }

    if (error) {
      toast({ title: 'Failed to save category', description: error.message, variant: 'destructive' });
      setSaving(false);
      return;
    }

    toast({ title: 'Category saved' });
    resetForm();
    await fetchCategories();
    setSaving(false);
  };

  const handleDelete = async (category: ArticleCategory) => {
    const { count, error: mapError } = await supabase
      .from('article_category_map')
      .select('article_id', { count: 'exact', head: true })
      .eq('category_id', category.id);

    if (mapError) {
      toast({ title: 'Failed to check links', description: mapError.message, variant: 'destructive' });
      return;
    }

    const message =
      count && count > 0
        ? `This category is linked to ${count} article(s). Are you sure you want to delete it?`
        : `Delete category "${category.title}"?`;

    const confirmed = window.confirm(message);
    if (!confirmed) return;

    const { error: mapDeleteError } = await supabase
      .from('article_category_map')
      .delete()
      .eq('category_id', category.id);

    if (mapDeleteError) {
      toast({ title: 'Failed to remove category links', description: mapDeleteError.message, variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('article_categories').delete().eq('id', category.id);
    if (error) {
      toast({ title: 'Failed to delete category', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Category deleted' });
    if (form.id === category.id) {
      resetForm();
    }
    fetchCategories();
  };

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (cat) =>
          cat.title.toLowerCase().includes(search.toLowerCase()) ||
          cat.slug.toLowerCase().includes(search.toLowerCase())
      ),
    [categories, search]
  );

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'slug', header: 'Slug' },
    {
      key: 'sort_order',
      header: 'Order',
      render: (cat: ArticleCategory) => (cat.sort_order ?? '—'),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (cat: ArticleCategory) => (
        <StatusBadge status={cat.is_active ? 'success' : 'default'}>
          {cat.is_active ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (cat: ArticleCategory) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} aria-label="Edit category">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(cat)}
            aria-label="Delete category"
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
            <h1 className="text-2xl font-bold text-foreground">Article Categories</h1>
            <p className="text-muted-foreground">Manage editorial categories for articles.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCategories}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{form.id ? 'Edit Category' : 'Create Category'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="cat-title">Title *</Label>
                  <Input
                    id="cat-title"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Housing, Scholarships"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-slug">Slug *</Label>
                  <Input
                    id="cat-slug"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugDirty(true);
                      setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                    }}
                    placeholder="housing"
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated from title; must be unique.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-description">Description</Label>
                  <Input
                    id="cat-description"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional short description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-order">Sort order</Label>
                  <Input
                    id="cat-order"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
                    placeholder="e.g., 1"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Inactive categories are hidden from selection.</p>
                  </div>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading categories...
                </div>
              ) : (
                <DataTable columns={columns} data={filteredCategories} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
