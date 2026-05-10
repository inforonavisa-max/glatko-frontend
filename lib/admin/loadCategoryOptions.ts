import { createAdminClient } from "@/supabase/server";
import type { CategoryOption } from "@/components/admin/providers/ProviderCategorySelect";

/**
 * Load all active categories (parents + subs) for the admin
 * provider-create form. Joins parent name/slug onto each sub via an
 * in-memory lookup. Result is suitable for direct prop into
 * ProviderCategorySelect.
 */
export async function loadCategoryOptions(): Promise<CategoryOption[]> {
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from("glatko_service_categories")
    .select("id, slug, name, parent_id, is_active")
    .eq("is_active", true);

  if (!rows) return [];

  const parents = new Map<string, { slug: string; name_tr: string }>();
  for (const r of rows) {
    if (!r.parent_id) {
      const name = (r.name as Record<string, string>)?.tr ?? r.slug;
      parents.set(r.id as string, {
        slug: r.slug as string,
        name_tr: name,
      });
    }
  }

  const result: CategoryOption[] = rows.map((r) => {
    const name = r.name as Record<string, string>;
    const parent = r.parent_id ? parents.get(r.parent_id as string) ?? null : null;
    return {
      id: r.id as string,
      slug: r.slug as string,
      name_tr: name?.tr ?? (r.slug as string),
      name_me: name?.me ?? name?.en ?? "",
      parent_id: (r.parent_id as string | null) ?? null,
      parent_slug: parent?.slug ?? null,
      parent_name_tr: parent?.name_tr ?? null,
    };
  });

  return result;
}
