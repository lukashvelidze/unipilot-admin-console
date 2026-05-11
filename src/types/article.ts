export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  cover_image_url: string | null;
  destination_country_code: string | null;
  origin_country_code: string | null;
  visa_types: string[] | null;
  is_global: boolean;
  access_tier: string | null;
  published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleCategory {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
}
