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
