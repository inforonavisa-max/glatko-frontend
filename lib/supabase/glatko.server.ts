import { createClient, createAdminClient } from "@/supabase/server";
import type {
  ServiceCategory,
  ProfessionalProfile,
  VerificationStatus,
  VerificationDocument,
  ProService,
} from "@/types/glatko";
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("glatko_service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data) return [];

  const rows = data as ServiceCategory[];
  const roots: ServiceCategory[] = [];
  const childMap = new Map<string, ServiceCategory[]>();

  for (const row of rows) {
    if (row.parent_id) {
      const arr = childMap.get(row.parent_id) ?? [];
      arr.push(row);
      childMap.set(row.parent_id, arr);
    } else {
      roots.push(row);
    }
  }

  for (const root of roots) {
    root.children = childMap.get(root.id) ?? [];
  }

  return roots;
}

export async function getProfessionalProfile(
  id: string
): Promise<ProfessionalProfile | null> {
  const supabase = createClient();

  const { data: pro, error } = await supabase
    .from("glatko_professional_profiles")
    .select("*, profiles:id(full_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !pro) return null;

  const { data: services } = await supabase
    .from("glatko_pro_services")
    .select("*, category:category_id(id, slug, name, icon)")
    .eq("professional_id", id);

  return {
    ...pro,
    profile: pro.profiles ?? undefined,
    services: (services as ProService[]) ?? [],
  } as ProfessionalProfile;
}

/** Admin UI only — service role bypasses RLS so pending / inactive rows are visible. */
export async function getProfessionalsByStatus(
  status?: VerificationStatus
): Promise<ProfessionalProfile[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("glatko_professional_profiles")
    .select("*, profiles:id(full_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("verification_status", status);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => ({
    ...row,
    profile: row.profiles ?? undefined,
  })) as ProfessionalProfile[];
}

/** Admin professional detail — bypasses RLS (pending pros, other users’ profiles embed). */
export async function getProfessionalProfileAsAdmin(
  id: string
): Promise<ProfessionalProfile | null> {
  const supabase = createAdminClient();

  const { data: pro, error } = await supabase
    .from("glatko_professional_profiles")
    .select("*, profiles:id(full_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !pro) return null;

  const { data: services } = await supabase
    .from("glatko_pro_services")
    .select("*, category:category_id(id, slug, name, icon)")
    .eq("professional_id", id);

  return {
    ...pro,
    profile: pro.profiles ?? undefined,
    services: (services as ProService[]) ?? [],
  } as ProfessionalProfile;
}

/** Admin document review — bypasses RLS on glatko_verification_documents. */
export async function getVerificationDocumentsAsAdmin(
  professionalId: string
): Promise<VerificationDocument[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("glatko_verification_documents")
    .select("*")
    .eq("professional_id", professionalId)
    .order("created_at");

  if (error || !data) return [];
  return data as VerificationDocument[];
}

interface CreateProfessionalInput {
  userId: string;
  businessName?: string;
  bio?: string;
  phone?: string;
  city?: string;
  languages?: string[];
  yearsExperience?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  categoryIds: string[];
  primaryCategoryId?: string;
}

export async function createProfessionalProfile(
  input: CreateProfessionalInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error: profileError } = await supabase
    .from("glatko_professional_profiles")
    .insert({
      id: input.userId,
      business_name: input.businessName || null,
      bio: input.bio || null,
      phone: input.phone || null,
      location_city: input.city || null,
      languages: input.languages ?? ["en"],
      years_experience: input.yearsExperience ?? null,
      hourly_rate_min: input.hourlyRateMin ?? null,
      hourly_rate_max: input.hourlyRateMax ?? null,
      verification_status: "pending" as const,
    });

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  if (input.categoryIds.length > 0) {
    const services = input.categoryIds.map((catId) => ({
      professional_id: input.userId,
      category_id: catId,
      is_primary: catId === input.primaryCategoryId,
    }));

    const { error: serviceError } = await supabase
      .from("glatko_pro_services")
      .insert(services);

    if (serviceError) {
      return { success: false, error: serviceError.message };
    }
  }

  return { success: true };
}

export async function updateVerificationStatus(
  professionalId: string,
  status: VerificationStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  const updates: Record<string, unknown> = {
    verification_status: status,
    updated_at: new Date().toISOString(),
  };

  if (status === "approved") {
    updates.is_verified = true;
    updates.verified_at = new Date().toISOString();
  }

  if (status === "rejected" && reason) {
    updates.rejection_reason = reason;
  }

  const { error } = await admin
    .from("glatko_professional_profiles")
    .update(updates)
    .eq("id", professionalId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getVerificationDocuments(
  professionalId: string
): Promise<VerificationDocument[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("glatko_verification_documents")
    .select("*")
    .eq("professional_id", professionalId)
    .order("created_at");

  if (error || !data) return [];
  return data as VerificationDocument[];
}

export async function getCustomerRequests(customerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("glatko_service_requests")
    .select(
      "*, category:glatko_service_categories(id, slug, name, icon)"
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getServiceRequest(requestId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("glatko_service_requests")
    .select(
      `*, category:glatko_service_categories(id, slug, name, icon, parent_id),
       bids:glatko_bids!glatko_bids_service_request_id_fkey(id, price, price_type, message, status, created_at, estimated_duration_hours, available_date,
         professional:glatko_professional_profiles(id, business_name, avg_rating, total_reviews, completed_jobs, is_verified))`
    )
    .eq("id", requestId)
    .single();

  if (error) {
    console.error("getServiceRequest error:", error, "requestId:", requestId);
    return null;
  }
  return data;
}

interface CreateServiceRequestInput {
  customer_id: string;
  category_id: string;
  title: string;
  description?: string;
  details: Record<string, unknown>;
  municipality: string;
  address?: string;
  budget_min?: number;
  budget_max?: number;
  urgency: string;
  preferred_date_start?: string;
  preferred_date_end?: string;
  photos: string[];
}

export async function createServiceRequest(
  input: CreateServiceRequestInput
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("glatko_service_requests")
    .insert({ ...input, status: "published" })
    .select()
    .single();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, requestId: data.id as string };
}

export async function cancelServiceRequest(
  requestId: string,
  userId: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_service_requests")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("customer_id", userId);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

// ─── G3: Bidding System ───

export async function getMatchingRequests(professionalId: string) {
  const supabase = createClient();

  const { data: proServices } = await supabase
    .from("glatko_pro_services")
    .select("category_id")
    .eq("professional_id", professionalId);

  const categoryIds = proServices?.map((s) => s.category_id) || [];
  if (categoryIds.length === 0) return [];

  const { data, error } = await supabase
    .from("glatko_service_requests")
    .select(
      `*, category:glatko_service_categories(id, slug, name, icon),
       customer:profiles!customer_id(full_name, avatar_url)`
    )
    .in("category_id", categoryIds)
    .in("status", ["published", "bidding"])
    .lt("bid_count", 4)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const { data: existingBids } = await supabase
    .from("glatko_bids")
    .select("service_request_id")
    .eq("professional_id", professionalId);

  const biddedIds = new Set(
    existingBids?.map((b) => b.service_request_id) || []
  );

  return (data || []).filter((r) => !biddedIds.has(r.id));
}

export async function createBid(data: {
  service_request_id: string;
  professional_id: string;
  price: number;
  price_type: "fixed" | "hourly" | "estimate";
  message: string;
  estimated_duration_hours?: number;
  available_date?: string;
}) {
  const supabase = createClient();
  const { data: bid, error } = await supabase
    .from("glatko_bids")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return bid;
}

export async function getProfessionalBids(professionalId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("glatko_bids")
    .select(
      `*, service_request:glatko_service_requests(
        id, title, status, municipality, urgency,
        budget_min, budget_max, created_at, photos,
        category:glatko_service_categories(id, slug, name, icon),
        customer:profiles!customer_id(full_name, avatar_url)
      )`
    )
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function acceptBid(
  bidId: string,
  requestId: string,
  customerId: string
) {
  const supabase = createClient();

  const { data: request } = await supabase
    .from("glatko_service_requests")
    .select("customer_id")
    .eq("id", requestId)
    .single();

  if (request?.customer_id !== customerId) {
    throw new Error("Unauthorized");
  }

  const { error: bidError } = await supabase
    .from("glatko_bids")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", bidId);

  if (bidError) throw bidError;

  const { error: rejectError } = await supabase
    .from("glatko_bids")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("service_request_id", requestId)
    .neq("id", bidId)
    .eq("status", "pending");

  if (rejectError) throw rejectError;

  const { error: requestError } = await supabase
    .from("glatko_service_requests")
    .update({
      status: "assigned",
      assigned_bid_id: bidId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (requestError) throw requestError;
}

export async function withdrawBid(bidId: string, professionalId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_bids")
    .update({ status: "withdrawn", updated_at: new Date().toISOString() })
    .eq("id", bidId)
    .eq("professional_id", professionalId)
    .eq("status", "pending");

  if (error) throw error;
}

// ─── G4: Messaging ───

export async function getUserConversations(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("glatko_conversations")
    .select(`
      *,
      service_request:glatko_service_requests(id, title, status,
        category:glatko_service_categories(name, icon)),
      customer:profiles!customer_id(id, full_name, avatar_url),
      professional:profiles!professional_id(id, full_name, avatar_url),
      last_message:glatko_messages(
        content, content_type, sender_id, created_at, read_at
      )
    `)
    .or(`customer_id.eq.${userId},professional_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((conv) => ({
    ...conv,
    last_message: conv.last_message?.[0] || null,
  }));
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  limit = 50,
  before?: string
) {
  const supabase = createClient();

  const { data: conv } = await supabase
    .from("glatko_conversations")
    .select("customer_id, professional_id")
    .eq("id", conversationId)
    .single();

  if (
    !conv ||
    (conv.customer_id !== userId && conv.professional_id !== userId)
  ) {
    throw new Error("Unauthorized");
  }

  let query = supabase
    .from("glatko_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reverse();
}

export async function sendMessage(data: {
  conversation_id: string;
  sender_id: string;
  content: string;
  content_type?: "text" | "image" | "file";
  file_url?: string;
}) {
  const supabase = createClient();

  const { data: message, error } = await supabase
    .from("glatko_messages")
    .insert({
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      content: data.content,
      content_type: data.content_type || "text",
      file_url: data.file_url,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from("glatko_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", data.conversation_id);

  return message;
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) throw error;
}

export async function getOrCreateConversation(data: {
  service_request_id: string;
  bid_id?: string;
  customer_id: string;
  professional_id: string;
}) {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("glatko_conversations")
    .select("*")
    .eq("service_request_id", data.service_request_id)
    .eq("customer_id", data.customer_id)
    .eq("professional_id", data.professional_id)
    .single();

  if (existing) return existing;

  const { data: conversation, error } = await supabase
    .from("glatko_conversations")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return conversation;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { data: convs } = await supabase
    .from("glatko_conversations")
    .select("id")
    .or(`customer_id.eq.${userId},professional_id.eq.${userId}`);

  if (!convs || convs.length === 0) return 0;

  const convIds = convs.map((c) => c.id);

  const { count, error } = await supabase
    .from("glatko_messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", convIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) return 0;
  return count || 0;
}

// ─── G5: Review + Trust ───

export async function startJob(requestId: string, professionalId: string) {
  const supabase = createClient();

  const { data: request } = await supabase
    .from("glatko_service_requests")
    .select("assigned_bid_id, status")
    .eq("id", requestId)
    .single();

  if (!request || request.status !== "assigned") {
    throw new Error("Invalid request status");
  }

  const { data: bid } = await supabase
    .from("glatko_bids")
    .select("professional_id")
    .eq("id", request.assigned_bid_id)
    .single();

  if (bid?.professional_id !== professionalId) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("glatko_service_requests")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;
}

export async function completeJob(requestId: string, professionalId: string) {
  const supabase = createClient();

  const { data: request } = await supabase
    .from("glatko_service_requests")
    .select("assigned_bid_id, status")
    .eq("id", requestId)
    .single();

  if (!request || request.status !== "in_progress") {
    throw new Error("Invalid request status");
  }

  const { data: bid } = await supabase
    .from("glatko_bids")
    .select("professional_id")
    .eq("id", request.assigned_bid_id)
    .single();

  if (bid?.professional_id !== professionalId) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("glatko_service_requests")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;
}

export async function createReview(data: {
  service_request_id: string;
  bid_id: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewer_role: "customer" | "professional";
  overall_rating: number;
  quality_rating?: number;
  communication_rating?: number;
  punctuality_rating?: number;
  review_text?: string;
  photos?: string[];
}) {
  const supabase = createClient();
  const { data: review, error } = await supabase
    .from("glatko_reviews")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return review;
}

export async function getReviewStatus(requestId: string, userId: string) {
  const supabase = createClient();

  const { data: myReview } = await supabase
    .from("glatko_reviews")
    .select("*")
    .eq("service_request_id", requestId)
    .eq("reviewer_id", userId)
    .single();

  const { data: otherReview } = await supabase
    .from("glatko_reviews")
    .select("id, is_published")
    .eq("service_request_id", requestId)
    .neq("reviewer_id", userId)
    .single();

  return {
    myReview: myReview || null,
    otherHasReviewed: !!otherReview,
    bothPublished: myReview?.is_published === true,
  };
}

export async function getPublishedReviews(
  professionalId: string,
  limit = 10,
  offset = 0
) {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from("glatko_reviews")
    .select(
      `*,
      reviewer:profiles!reviewer_id(full_name, avatar_url),
      service_request:glatko_service_requests(
        title,
        category:glatko_service_categories(name, icon)
      )`,
      { count: "exact" }
    )
    .eq("reviewee_id", professionalId)
    .eq("reviewer_role", "customer")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { reviews: data || [], total: count || 0 };
}

export async function calculateTrustBadges(
  professionalId: string
): Promise<string[]> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("glatko_professional_profiles")
    .select(
      "is_verified, avg_rating, total_reviews, completed_jobs, created_at"
    )
    .eq("id", professionalId)
    .single();

  if (!profile) return [];

  const badges: string[] = [];

  if (profile.is_verified) badges.push("verified");

  if (profile.avg_rating >= 4.8 && profile.completed_jobs >= 10) {
    badges.push("top_pro");
  }

  if (profile.completed_jobs >= 20) badges.push("experienced");

  const createdAt = new Date(profile.created_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  if (createdAt > thirtyDaysAgo && profile.total_reviews === 0) {
    badges.push("new_pro");
  }

  return badges;
}

// ─── G6: Notifications ───

export async function createNotification(data: {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_notifications")
    .insert(data);
  if (error) throw error;
}

export async function getUserNotifications(
  userId: string,
  limit = 20,
  unreadOnly = false
) {
  const supabase = createClient();
  let query = supabase
    .from("glatko_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.is("read_at", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
  if (error) throw error;
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("glatko_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  if (error) return 0;
  return count || 0;
}

// ─── G7: Search + Discovery ───

export async function searchProfessionals(params: {
  locale: string;
  categorySlug?: string;
  city?: string;
  minRating?: number;
  languages?: string[];
  query?: string;
  sortBy?: "rating" | "reviews" | "newest" | "jobs";
  page?: number;
  limit?: number;
}) {
  const supabase = createClient();
  const { page = 1, limit = 12 } = params;
  const offset = (page - 1) * limit;

  let q = supabase
    .from("glatko_professional_profiles")
    .select(
      `*,
      profile:profiles!id(full_name, avatar_url),
      services:glatko_pro_services(
        category:glatko_service_categories(id, slug, name, icon)
      )`,
      { count: "exact" }
    )
    .eq("is_active", true)
    .eq("is_verified", true);

  if (params.categorySlug) {
    const { data: cat } = await supabase
      .from("glatko_service_categories")
      .select("id")
      .eq("slug", params.categorySlug)
      .single();

    if (cat) {
      const { data: proIds } = await supabase
        .from("glatko_pro_services")
        .select("professional_id")
        .eq("category_id", cat.id);

      if (proIds && proIds.length > 0) {
        q = q.in(
          "id",
          proIds.map((p) => p.professional_id)
        );
      } else {
        return { professionals: [], total: 0, page, totalPages: 0 };
      }
    }
  }

  if (params.city) {
    q = q.eq("location_city", params.city);
  }

  if (params.minRating) {
    q = q.gte("avg_rating", params.minRating);
  }

  if (params.languages && params.languages.length > 0) {
    q = q.overlaps("languages", params.languages);
  }

  switch (params.sortBy) {
    case "rating":
      q = q.order("avg_rating", { ascending: false });
      break;
    case "reviews":
      q = q.order("total_reviews", { ascending: false });
      break;
    case "jobs":
      q = q.order("completed_jobs", { ascending: false });
      break;
    case "newest":
    default:
      q = q.order("created_at", { ascending: false });
      break;
  }

  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw error;

  return {
    professionals: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getCategoryWithStats(slug: string) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from("glatko_service_categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) return null;

  const { data: children } = await supabase
    .from("glatko_service_categories")
    .select("*")
    .eq("parent_id", category.id)
    .eq("is_active", true)
    .order("sort_order");

  const { count: proCount } = await supabase
    .from("glatko_pro_services")
    .select("professional_id", { count: "exact", head: true })
    .eq("category_id", category.id);

  return {
    ...category,
    children: children || [],
    proCount: proCount || 0,
  };
}

export async function getSearchSuggestions(searchQuery: string, locale: string) {
  const supabase = createClient();
  const results: { type: string; label: string; slug: string }[] = [];

  const { data: categories } = await supabase
    .from("glatko_service_categories")
    .select("slug, name")
    .eq("is_active", true);

  if (categories) {
    for (const cat of categories) {
      const nameObj = cat.name as Record<string, string> | null;
      const name = nameObj?.[locale] || nameObj?.["en"] || "";
      if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ type: "category", label: name, slug: cat.slug });
      }
    }
  }

  const { data: pros } = await supabase
    .from("glatko_professional_profiles")
    .select("id, business_name, profile:profiles!id(full_name)")
    .eq("is_active", true)
    .eq("is_verified", true)
    .limit(5);

  if (pros) {
    for (const pro of pros) {
      const profileData = pro.profile as unknown as { full_name: string } | null;
      const name = pro.business_name || profileData?.full_name || "";
      if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ type: "professional", label: name, slug: pro.id });
      }
    }
  }

  return results.slice(0, 8);
}

// ─── G8: Pro Dashboard Analytics ───

export async function getProAnalytics(professionalId: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("glatko_professional_profiles")
    .select("avg_rating, total_reviews, completed_jobs, created_at")
    .eq("id", professionalId)
    .single();

  const { data: acceptedBids } = await supabase
    .from("glatko_bids")
    .select("price, price_type, created_at")
    .eq("professional_id", professionalId)
    .eq("status", "accepted");

  const totalEarnings = (acceptedBids || []).reduce(
    (sum, bid) => sum + Number(bid.price),
    0
  );

  const monthlyEarnings: { month: string; earnings: number; jobs: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthBids = (acceptedBids || []).filter((b) => {
      const d = new Date(b.created_at);
      return d >= date && d < nextDate;
    });
    monthlyEarnings.push({
      month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
      earnings: monthBids.reduce((s, b) => s + Number(b.price), 0),
      jobs: monthBids.length,
    });
  }

  const { count: pendingBids } = await supabase
    .from("glatko_bids")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", professionalId)
    .eq("status", "pending");

  const { count: activeJobs } = await supabase
    .from("glatko_bids")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", professionalId)
    .eq("status", "accepted");

  const { data: recentReviews } = await supabase
    .from("glatko_reviews")
    .select("overall_rating, created_at")
    .eq("reviewee_id", professionalId)
    .eq("reviewer_role", "customer")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    profile,
    totalEarnings,
    monthlyEarnings,
    pendingBids: pendingBids || 0,
    activeJobs: activeJobs || 0,
    recentReviews: recentReviews || [],
  };
}

export async function getProAvailability(professionalId: string) {
  const supabase = createClient();

  const { data: weekly } = await supabase
    .from("glatko_availability")
    .select("*")
    .eq("professional_id", professionalId)
    .order("day_of_week");

  const { data: exceptions } = await supabase
    .from("glatko_availability_exceptions")
    .select("*")
    .eq("professional_id", professionalId)
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date");

  return { weekly: weekly || [], exceptions: exceptions || [] };
}

export async function updateProAvailability(
  professionalId: string,
  day: number,
  startTime: string,
  endTime: string,
  isAvailable: boolean
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_availability")
    .upsert(
      {
        professional_id: professionalId,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable,
      },
      { onConflict: "professional_id,day_of_week" }
    );
  if (error) throw error;
}

export async function upsertAvailabilityException(
  professionalId: string,
  date: string,
  isAvailable: boolean,
  note?: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_availability_exceptions")
    .upsert(
      { professional_id: professionalId, date, is_available: isAvailable, note },
      { onConflict: "professional_id,date" }
    );
  if (error) throw error;
}

export async function getProPackages(professionalId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("glatko_service_packages")
    .select(
      `*, category:glatko_service_categories(id, slug, name, icon)`
    )
    .eq("professional_id", professionalId)
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function createProPackage(data: {
  professional_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  price_type: "fixed" | "starting_at";
  estimated_duration_hours?: number;
  includes?: string[];
}) {
  const supabase = createClient();
  const { data: pkg, error } = await supabase
    .from("glatko_service_packages")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return pkg;
}

export async function updateProPackage(
  packageId: string,
  professionalId: string,
  updates: Partial<{
    name: string;
    description: string;
    price: number;
    price_type: string;
    estimated_duration_hours: number;
    includes: string[];
    is_active: boolean;
    sort_order: number;
  }>
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_service_packages")
    .update(updates)
    .eq("id", packageId)
    .eq("professional_id", professionalId);
  if (error) throw error;
}

export async function deleteProPackage(
  packageId: string,
  professionalId: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_service_packages")
    .update({ is_active: false })
    .eq("id", packageId)
    .eq("professional_id", professionalId);
  if (error) throw error;
}

export async function getProfileCompleteness(
  professionalId: string
): Promise<{ score: number; missing: string[] }> {
  const supabase = createClient();
  const { data: pro } = await supabase
    .from("glatko_professional_profiles")
    .select("*")
    .eq("id", professionalId)
    .single();

  if (!pro) return { score: 0, missing: ["profile"] };

  const checks = [
    { field: "bio", label: "bio" },
    { field: "phone", label: "phone" },
    { field: "location_city", label: "city" },
    { field: "years_experience", label: "experience" },
    { field: "hourly_rate_min", label: "rate" },
  ];

  const missing: string[] = [];
  let filled = 0;

  for (const check of checks) {
    if (pro[check.field as keyof typeof pro]) {
      filled++;
    } else {
      missing.push(check.label);
    }
  }

  if (pro.portfolio_images && (pro.portfolio_images as string[]).length > 0) {
    filled++;
  } else {
    missing.push("portfolio");
  }

  if (pro.languages && (pro.languages as string[]).length > 1) {
    filled++;
  } else {
    missing.push("languages");
  }

  const total = checks.length + 2;
  return { score: Math.round((filled / total) * 100), missing };
}

export async function updateProfessionalProfile(
  professionalId: string,
  updates: Partial<{
    business_name: string;
    bio: string;
    phone: string;
    location_city: string;
    languages: string[];
    years_experience: number;
    hourly_rate_min: number;
    hourly_rate_max: number;
    portfolio_images: string[];
  }>
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("glatko_professional_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", professionalId);
  if (error) throw error;
}
