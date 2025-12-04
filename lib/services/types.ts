// Service Response Types
export interface SearchResult {
  url: string;
  title: string;
  description: string;
  domain: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  viewCount: number;
  thumbnailUrl: string;
  url: string;
}

export interface GeneratedData {
  websiteUrl: string;
  imageUrl: string;
  videoUrl: string;
  description: string;
  category: Category;
  toolType: 'Free' | 'Paid';

  // Enhanced fields (optional - from Futurepedia or AI generation)
  keyFeatures?: string[];
  pros?: string[];
  cons?: string[];
  whoIsUsing?: string[];
  pricingTiers?: {
    name: string;
    price: string;
    features?: string[];
  }[];
  whatMakesUnique?: string;
  ratings?: {
    accuracyReliability?: number;
    easeOfUse?: number;
    functionalityFeatures?: number;
    performanceSpeed?: number;
    customizationFlexibility?: number;
    dataPrivacySecurity?: number;
    supportResources?: number;
    costEfficiency?: number;
    integrationCapabilities?: number;
    overallScore?: number;
  };
  uncommonUseCases?: string[];
  dataSource?: 'futurepedia' | 'api';
}

export type Category =
  | 'Image'
  | 'Text'
  | 'Video'
  | 'Audio'
  | 'Code'
  | 'Productivity'
  | 'Research'
  | 'Marketing'
  | 'AI Tools';

// Verification Types
export interface VerificationResult {
  field: string;
  valid: boolean;
  error?: string;
}

export interface VerificationSummary {
  allValid: boolean;
  results: VerificationResult[];
}

// Quota Types
export interface QuotaStatus {
  service: string;
  usedDaily: number;
  usedMonthly: number;
  limitDaily: number;
  limitMonthly: number;
  percentageUsedDaily: number;
  percentageUsedMonthly: number;
  canUse: boolean;
}

// API Response Types
export interface AutoGenerateResult {
  success: boolean;
  data?: GeneratedData;
  errors?: VerificationResult[];
  partialData?: Partial<GeneratedData>;
  quotas?: QuotaStatus[];
}

// Error Types
export class UnknownToolError extends Error {
  constructor(public toolName: string, public reason: string) {
    super(`Unknown tool: ${toolName}`);
    this.name = 'UnknownToolError';
  }
}

export class QuotaExceededError extends Error {
  constructor(public service: string, public quota: QuotaStatus) {
    super(`Quota exceeded for ${service}`);
    this.name = 'QuotaExceededError';
  }
}

export class VerificationError extends Error {
  constructor(public results: VerificationResult[]) {
    super('Verification failed');
    this.name = 'VerificationError';
  }
}

// Loading States
export interface LoadingStates {
  searchingWebsite: boolean;
  fetchingLogo: boolean;
  generatingDescription: boolean;
  findingVideo: boolean;
  verifying: boolean;
}
