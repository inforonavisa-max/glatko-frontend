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

export async function getProfessionalsByStatus(
  status?: VerificationStatus
): Promise<ProfessionalProfile[]> {
  const supabase = createClient();

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
       bids:glatko_bids(id, price, price_type, message, status, created_at, estimated_duration_hours, available_date,
         professional:glatko_professional_profiles(id, business_name, avg_rating, total_reviews, completed_jobs, is_verified))`
    )
    .eq("id", requestId)
    .single();

  if (error) return null;
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
