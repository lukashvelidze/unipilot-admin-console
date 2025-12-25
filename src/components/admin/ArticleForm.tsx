import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Article } from '@/types/article';
import { Country, VisaType } from '@/data/mockData';
import { ArticleCategory } from '@/types/article';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';

type ArticleFormValues = {
  title: string;
  slug: string;
  cover_image_url: string;
  summary: string;
  content: string;
  destination_country_code: string;
  origin_country_code: string;
  visa_types: string[];
  categories: string[];
  access_tier: string;
  published: boolean;
};

interface ArticleFormProps {
  article?: Article;
  onSuccess?: (article: Article) => void;
  initialCategoryIds?: string[];
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const DEST_GLOBAL = '__global__';
const ORIGIN_ALL = '__all__';
const accessTierOptions = ['free', 'standard', 'premium'];

export function ArticleForm({ article, onSuccess, initialCategoryIds = [] }: ArticleFormProps) {
  const [destCountries, setDestCountries] = useState<Country[]>([]);
  const [originCountries, setOriginCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);
  const { toast } = useToast();

  const [formValues, setFormValues] = useState<ArticleFormValues>({
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    cover_image_url: article?.cover_image_url ?? '',
    summary: article?.summary ?? '',
    content: article?.content ?? '',
    destination_country_code: article?.is_global ? DEST_GLOBAL : (article?.destination_country_code ?? ''),
    origin_country_code: article?.origin_country_code ?? ORIGIN_ALL,
    visa_types: article?.visa_types ?? [],
    categories: initialCategoryIds,
    access_tier: article?.access_tier ?? accessTierOptions[0],
    published: article?.published ?? false,
  });

  useEffect(() => {
    const fetchMeta = async () => {
      setLoadingMeta(true);
      const [destRes, originRes, visaRes, categoryRes] = await Promise.all([
        supabase.from('destination_countries').select('*').eq('is_active', true).order('name'),
        supabase.from('origin_countries').select('*').eq('is_active', true).order('name'),
        supabase.from('visa_types').select('*').eq('is_active', true).order('title'),
        supabase.from('article_categories').select('*').eq('is_active', true).order('sort_order', { ascending: true, nullsFirst: false }).order('title'),
      ]);

      if (destRes.error) {
        toast({ title: 'Error loading destinations', description: destRes.error.message, variant: 'destructive' });
      } else {
        setDestCountries(destRes.data || []);
      }

      if (originRes.error) {
        toast({ title: 'Error loading origins', description: originRes.error.message, variant: 'destructive' });
      } else {
        setOriginCountries(originRes.data || []);
      }

      if (visaRes.error) {
        toast({ title: 'Error loading visa types', description: visaRes.error.message, variant: 'destructive' });
      } else {
        setVisaTypes(visaRes.data || []);
      }

      if (categoryRes.error) {
        toast({ title: 'Error loading categories', description: categoryRes.error.message, variant: 'destructive' });
      } else {
        setCategories(categoryRes.data || []);
      }
      setLoadingMeta(false);
    };

    fetchMeta();
  }, [toast]);

  useEffect(() => {
    setFormValues((prev) => ({ ...prev, categories: initialCategoryIds }));
  }, [initialCategoryIds]);

  useEffect(() => {
    if (!slugDirty) {
      setFormValues((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formValues.title, slugDirty]);

  useEffect(() => {
    if (!formValues.destination_country_code || loadingMeta) return;
    const relevantCodes =
      formValues.destination_country_code === DEST_GLOBAL
        ? visaTypes.map((v) => v.code)
        : visaTypes.filter((v) => v.country_code === formValues.destination_country_code).map((v) => v.code);

    setFormValues((prev) => ({
      ...prev,
      visa_types: prev.visa_types.filter((code) => relevantCodes.includes(code)),
    }));
  }, [formValues.destination_country_code, loadingMeta, visaTypes]);

  const relevantVisaTypes = useMemo(() => {
    if (formValues.destination_country_code === DEST_GLOBAL) return visaTypes;
    if (!formValues.destination_country_code) return [];
    return visaTypes.filter((v) => v.country_code === formValues.destination_country_code);
  }, [formValues.destination_country_code, visaTypes]);

  const toggleVisaType = (code: string) => {
    setFormValues((prev) => ({
      ...prev,
      visa_types: prev.visa_types.includes(code)
        ? prev.visa_types.filter((v) => v !== code)
        : [...prev.visa_types, code],
    }));
  };

  const toggleCategory = (id: string) => {
    setFormValues((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((cat) => cat !== id)
        : [...prev.categories, id],
    }));
  };

  const handleImageUpload = async (file: File) => {
    const baseSlug = (formValues.slug || slugify(formValues.title) || 'article').toLowerCase();
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `articles/${baseSlug}-${Date.now()}.${ext}`;

    setUploadingImage(true);
    const { error: uploadError } = await supabase.storage.from('article-images').upload(filePath, file);

    if (uploadError) {
      toast({ title: 'Image upload failed', description: uploadError.message, variant: 'destructive' });
      setUploadingImage(false);
      return;
    }

    const { data } = supabase.storage.from('article-images').getPublicUrl(filePath);
    setFormValues((prev) => ({ ...prev, cover_image_url: data.publicUrl }));
    setUploadingImage(false);
    toast({ title: 'Image uploaded' });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (uploadingImage) {
      toast({ title: 'Please wait for the image to finish uploading', variant: 'destructive' });
      return;
    }

    if (!formValues.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    if (!formValues.destination_country_code) {
      toast({ title: 'Destination country is required', variant: 'destructive' });
      return;
    }

    setSaving(true);

    const normalizedSlug = (formValues.slug || slugify(formValues.title)).toLowerCase();
    const isGlobal = formValues.destination_country_code === DEST_GLOBAL;
    const destinationCode = isGlobal ? null : formValues.destination_country_code;
    const originCode = formValues.origin_country_code === ORIGIN_ALL ? null : formValues.origin_country_code || null;
    const visas = formValues.visa_types.length ? formValues.visa_types : null;
    const timestamp = new Date().toISOString();

    const payload = {
      ...(article?.id ? { id: article.id } : {}),
      title: formValues.title.trim(),
      slug: normalizedSlug,
      cover_image_url: formValues.cover_image_url || null,
      summary: formValues.summary || null,
      content: formValues.content || null,
      destination_country_code: destinationCode,
      origin_country_code: originCode,
      visa_types: visas,
      is_global: isGlobal,
      access_tier: formValues.access_tier || null,
      published: formValues.published,
      updated_at: timestamp,
      ...(article?.created_at ? { created_at: article.created_at } : { created_at: timestamp }),
    };

    const { data, error } = await supabase
      .from('articles')
      .upsert(payload, { onConflict: 'slug' })
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast({ title: 'Failed to save article', description: error.message, variant: 'destructive' });
      setSaving(false);
      return;
    }

    const savedArticle = data as Article;

    const { error: mapDeleteError } = await supabase
      .from('article_category_map')
      .delete()
      .eq('article_id', savedArticle.id);

    if (mapDeleteError) {
      toast({ title: 'Failed to update categories', description: mapDeleteError.message, variant: 'destructive' });
      setSaving(false);
      return;
    }

    if (formValues.categories.length > 0) {
      const { error: mapInsertError } = await supabase
        .from('article_category_map')
        .insert(formValues.categories.map((categoryId) => ({ article_id: savedArticle.id, category_id: categoryId })));

      if (mapInsertError) {
        toast({ title: 'Failed to update categories', description: mapInsertError.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    toast({ title: 'Article saved' });
    onSuccess?.(savedArticle);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card>
        <CardContent className="grid gap-6 pt-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formValues.title}
              onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="A clear, compelling headline"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formValues.slug}
              onChange={(e) => {
                setSlugDirty(true);
                setFormValues((prev) => ({ ...prev, slug: slugify(e.target.value) }));
              }}
              placeholder="article-slug"
            />
            <p className="text-xs text-muted-foreground">Auto-generated from the title but editable.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cover">Cover image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleImageUpload(file);
                  }
                }}
              />
              {uploadingImage && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
            {formValues.cover_image_url && (
              <div className="overflow-hidden rounded-md border border-border">
                <img
                  src={formValues.cover_image_url}
                  alt="Cover preview"
                  className="h-32 w-full object-cover"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">Upload from your computer; stored in Supabase article-images.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formValues.summary}
              onChange={(e) => setFormValues((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="One-line summary readers will see in feeds."
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formValues.content}
              onChange={(e) => setFormValues((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Write in Markdown or plain text. No live preview is needed."
              rows={10}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Destination country</Label>
              <Select
                value={formValues.destination_country_code}
                onValueChange={(value) => setFormValues((prev) => ({ ...prev, destination_country_code: value }))}
                disabled={loadingMeta}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEST_GLOBAL}>All destinations (global)</SelectItem>
                  {destCountries.map((country) => (
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
                value={formValues.origin_country_code}
                onValueChange={(value) => setFormValues((prev) => ({ ...prev, origin_country_code: value }))}
                disabled={loadingMeta}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All origins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ORIGIN_ALL}>All origins</SelectItem>
                  {originCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Categories (optional)</Label>
            <Card className="border-dashed">
              <CardContent className="p-4">
                {loadingMeta ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories available yet.</p>
                ) : (
                  <ScrollArea className="h-40">
                    <div className="grid gap-2">
                      {categories.map((category) => {
                        const selected = formValues.categories.includes(category.id);
                        return (
                          <button
                            type="button"
                            key={category.id}
                            onClick={() => toggleCategory(category.id)}
                            className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-sm">{category.title}</p>
                              <p className="text-xs text-muted-foreground">{category.slug}</p>
                            </div>
                            {selected && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
                {formValues.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formValues.categories.map((id) => (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {categories.find((c) => c.id === id)?.title || id}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3">
            <Label>Visa types (optional)</Label>
            <Card className="border-dashed">
              <CardContent className="p-4">
                {loadingMeta ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading visa types...
                  </div>
                ) : relevantVisaTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Select a destination to see visa types.</p>
                ) : (
                  <ScrollArea className="h-40">
                    <div className="grid gap-2">
                      {relevantVisaTypes.map((visa) => {
                        const selected = formValues.visa_types.includes(visa.code);
                        return (
                          <button
                            type="button"
                            key={visa.code}
                            onClick={() => toggleVisaType(visa.code)}
                            className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-sm">{visa.title}</p>
                              <p className="text-xs text-muted-foreground">{visa.code}</p>
                            </div>
                            {selected && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
                {formValues.visa_types.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formValues.visa_types.map((code) => (
                      <Badge key={code} variant="secondary" className="text-xs">
                        {code}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Access tier</Label>
              <Select
                value={formValues.access_tier}
                onValueChange={(value) => setFormValues((prev) => ({ ...prev, access_tier: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accessTierOptions.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Toggle to publish immediately.</p>
              </div>
              <Switch
                checked={formValues.published}
                onCheckedChange={(checked) => setFormValues((prev) => ({ ...prev, published: checked }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="submit" disabled={saving || loadingMeta || uploadingImage}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save article
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
