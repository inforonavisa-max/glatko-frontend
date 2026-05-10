import type { Locale } from "@/i18n/routing";

export type MultiLangText = Partial<Record<Locale, string>>;

export interface ServiceCategory {
  id: string;
  parent_id: string | null;
  slug: string;
  name: MultiLangText;
  description: MultiLangText | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  children?: ServiceCategory[];
}

export type VerificationStatus = "pending" | "in_review" | "approved" | "rejected";
export type InsuranceStatus = "none" | "self_reported" | "verified";

export interface ProfessionalProfile {
  id: string;
  slug: string;
  business_name: string | null;
  bio: string | null;
  phone: string | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  years_experience: number | null;
  location_city: string | null;
  service_radius_km: number;
  languages: string[];
  is_verified: boolean;
  verified_at: string | null;
  is_active: boolean;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  avg_rating: number;
  total_reviews: number;
  completed_jobs: number;
  response_time_minutes: number | null;
  insurance_status: InsuranceStatus;
  portfolio_images: string[];
  created_at: string;
  updated_at: string;
  is_founding_provider?: boolean;
  founding_provider_number?: number | null;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  services?: ProService[];
}

export interface ProService {
  id: string;
  professional_id: string;
  category_id: string;
  is_primary: boolean;
  custom_rate_min: number | null;
  custom_rate_max: number | null;
  category?: ServiceCategory;
}

export type RequestStatus = "draft" | "published" | "bidding" | "assigned" |
  "in_progress" | "completed" | "reviewed" | "closed" | "expired" | "cancelled";
export type Urgency = "asap" | "this_week" | "flexible" | "specific_date";

export interface ServiceRequest {
  id: string;
  customer_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  details: Record<string, unknown>;
  address: string | null;
  municipality: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date_start: string | null;
  preferred_date_end: string | null;
  urgency: Urgency;
  photos: string[];
  status: RequestStatus;
  max_bids: number;
  bid_count: number;
  assigned_bid_id: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  category?: ServiceCategory;
  customer?: { full_name: string | null; avatar_url: string | null };
  bids?: Bid[];
}

export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn" | "expired";
export type PriceType = "fixed" | "hourly" | "estimate";

export interface Bid {
  id: string;
  service_request_id: string;
  professional_id: string;
  price: number;
  price_type: PriceType;
  message: string | null;
  estimated_duration_hours: number | null;
  available_date: string | null;
  status: BidStatus;
  created_at: string;
  updated_at: string;
  professional?: ProfessionalProfile;
}

export type ReviewerRole = "customer" | "professional";

export interface Review {
  id: string;
  service_request_id: string;
  bid_id: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewer_role: ReviewerRole;
  overall_rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  punctuality_rating: number | null;
  review_text: string | null;
  photos: string[];
  is_published: boolean;
  created_at: string;
}

export type DocumentType = "id_card" | "business_license" | "certificate" | "insurance" | "other";
export type DocumentStatus = "pending" | "approved" | "rejected";

export interface VerificationDocument {
  id: string;
  professional_id: string;
  document_type: DocumentType;
  file_path: string;
  status: DocumentStatus;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export type NotificationType = "new_bid" | "bid_accepted" | "bid_rejected" |
  "message" | "status_change" | "review" |
  "verification_approved" | "verification_rejected" | "new_request_match";

export interface GlatkoNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// G-CAT-3: Premium hybrid search

export type SearchResultType = "category" | "professional";
export type SearchMatchType = "direct" | "synonym";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  heroImageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  city: string | null;
  similarityScore: number;
  matchType: SearchMatchType;
  isFoundingProvider?: boolean;
  foundingProviderNumber?: number | null;
}

export interface SearchResponse {
  categories: SearchResult[];
  professionals: SearchResult[];
}

export interface TrendingCategory {
  id: string;
  slug: string;
  title: string;
  heroImageUrl: string | null;
  badgePriority: number | null;
}

export type RecentSearchClickType = SearchResultType;

export interface RecentSearch {
  id: string;
  query: string;
  locale: string;
  resultClicked: RecentSearchClickType | null;
  resultSlug: string | null;
  searchedAt: string;
}
