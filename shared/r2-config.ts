// Shared R2 Configuration for v2u Workspace
// Used by both website and upload tools

export interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string;
}

export interface AssetManifest {
  version: string;
  timestamp: string;
  assets: {
    [key: string]: {
      r2Path: string;
      publicUrl: string;
      hash: string;
      size: number;
      contentType: string;
      uploadDate: string;
    };
  };
}

// Environment configuration
export function getR2Config(): R2Config {
  const config = {
    endpoint: process.env.R2_ENDPOINT || '',
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_KEY || '',
    bucket: process.env.R2_BUCKET || 'v2u-private',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  };

  // Validate required fields
  const required = ['endpoint', 'accessKeyId', 'secretAccessKey'];
  const missing = required.filter(key => !config[key as keyof R2Config]);
  
  if (missing.length > 0) {
    throw new Error(`Missing R2 configuration: ${missing.join(', ')}`);
  }

  return config;
}

// Asset URL generation with cache busting
export function generateAssetUrl(path: string, hash?: string): string {
  const config = getR2Config();
  const basePath = config.publicUrl || `${config.endpoint}/${config.bucket}`;
  const cacheBuster = hash ? `?v=${hash}` : `?t=${Date.now()}`;
  return `${basePath}/${path}${cacheBuster}`;
}

// Content type mapping
export const CONTENT_TYPES = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.txt': 'text/plain',
} as const;

// Directory structure constants
export const DIRECTORIES = {
  PUBLIC: {
    DAILY: {
      PORTRAIT: 'public/daily/portrait',
      LANDSCAPE: 'public/daily/landscape',
    },
    PROMOS: 'public/promos',
  },
  PRIVATE: {
    EDUCATE: {
      BEGINNER: 'private/educate/beginner',
      INTERMEDIATE: 'private/educate/intermediate',
      ADVANCED: 'private/educate/advanced',
    },
    REVIEWS: {
      WEEKLY: 'private/reviews/weekly',
      MONTHLY: 'private/reviews/monthly',
      YEARLY: 'private/reviews/yearly',
    },
    PROJECTS: {
      SAFESHIPPING: 'private/projects/safeshipping',
      TRAFFICJAMZ: 'private/projects/trafficjamz',
      MEALSONDEMAND: 'private/projects/mealsondemand',
    },
    CATEGORIES: {
      COMMERCIAL: 'private/categories/commercial',
      CONCEPTUAL: 'private/categories/conceptual',
    },
  },
} as const;