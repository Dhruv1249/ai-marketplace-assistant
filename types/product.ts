export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: ProductImage[];
  layout: LayoutConfig;
  seoData: SEOData;
  specifications: Record<string, string>;
  features: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
  isMain: boolean;
}

export interface LayoutConfig {
  type: 'gallery-focused' | 'feature-blocks' | 'single-column' | 'comparison-table';
  sections: LayoutSection[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export interface LayoutSection {
  id: string;
  type: 'hero' | 'gallery' | 'description' | 'features' | 'specifications' | 'cta';
  order: number;
  visible: boolean;
  config: Record<string, any>;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  ogImage?: string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images?: File[];
  aiPrompt?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}