
// Input/File Types
export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'analyzing' | 'done' | 'error';
}

// Gemini Response Schema Types
export interface BatchSummary {
  detected_platforms?: string[];
  primary_category?: string;
  preset: string;
}

export interface DetectedAttributes {
  product_type?: string;
  category?: string;
  material?: string;
  color?: string;
  style?: string;
  gender?: string;
  use_case?: string;
  keywords?: string[];
}

export interface SEOMetadata {
  seo_filename: string;
  alt_text: string;
  title?: string;
  description?: string; // Meta Description
  product_description?: string; // Full Product Description
  tags?: string[];
  focus_keywords?: string[];
}

export interface ShopifyMetafield {
  key: string;
  value: string;
}

export interface ShopifyData {
  handle?: string;
  alt_text?: string;
  metafields?: ShopifyMetafield[];
}

export interface EtsyData {
  seo_title?: string;
  description?: string;
  tags_13?: string[];
}

export interface AmazonData {
  title?: string;
  bullet_points?: string[];
  search_terms_keywords?: string[];
  main_features?: string[];
}

export interface ImageResult {
  input_filename: string;
  variant_group_id?: string;
  variant_role?: string;
  detected?: DetectedAttributes;
  seo: SEOMetadata;
  shopify?: ShopifyData;
  etsy?: EtsyData;
  amazon?: AmazonData;
}

export interface AnalysisResult {
  batch_summary: BatchSummary;
  images: ImageResult[];
}

// App Logic Types
export type Platform = 'general' | 'shopify' | 'etsy' | 'amazon';
