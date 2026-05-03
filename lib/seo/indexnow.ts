/**
 * IndexNow notification client.
 *
 * IndexNow is the protocol Bing, Yandex, Seznam, and Naver use to receive
 * push notifications when content changes. A single POST to one endpoint
 * is forwarded to all participating engines, but we fan out to three for
 * redundancy and faster propagation.
 *
 * The verification endpoint at `/{INDEXNOW_KEY}.txt` is handled by middleware
 * (see middleware.ts). This module is for OUTGOING notifications: telling
 * the engines that URLs have been added/updated/removed.
 *
 * Spec: https://www.indexnow.org/documentation
 *
 * Usage:
 *   import { notifyIndexNow } from "@/lib/seo/indexnow";
 *   await notifyIndexNow(["/me/services/garden-pool", "/tr/services/boat-services"]);
 *
 * Or trigger the admin endpoint:
 *   curl -X POST https://glatko.app/api/indexnow \
 *     -H "Authorization: Bearer $ADMIN_API_KEY" \
 *     -H "Content-Type: application/json" \
 *     -d '{"urls": ["/me", "/me/services"]}'
 */

const SITE_HOST = "glatko.app";
const SITE_ORIGIN = `https://${SITE_HOST}`;

const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
] as const;

export interface IndexNowResult {
  success: boolean;
  reason?: string;
  endpoints?: Array<{
    endpoint: string;
    status: number | "rejected";
    ok: boolean;
  }>;
  urlCount?: number;
}

function normalizeUrl(input: string): string {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  if (input.startsWith("/")) {
    return `${SITE_ORIGIN}${input}`;
  }
  return `${SITE_ORIGIN}/${input}`;
}

export async function notifyIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return { success: false, reason: "no_key" };
  }
  if (urls.length === 0) {
    return { success: false, reason: "empty_urls" };
  }
  // IndexNow protocol limit per request.
  if (urls.length > 10000) {
    return { success: false, reason: "too_many_urls" };
  }

  const normalized = urls.map(normalizeUrl);

  // Reject any URL that doesn't belong to our host. IndexNow rejects mixed-host
  // payloads, and silently sending a foreign URL would burn credibility.
  const wrongHost = normalized.find((u) => {
    try {
      return new URL(u).host !== SITE_HOST;
    } catch {
      return true;
    }
  });
  if (wrongHost) {
    return { success: false, reason: `url_not_on_host:${wrongHost}` };
  }

  const payload = {
    host: SITE_HOST,
    key,
    keyLocation: `${SITE_ORIGIN}/${key}.txt`,
    urlList: normalized,
  };

  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map((endpoint) =>
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    ),
  );

  const endpoints = results.map((r, i) => {
    if (r.status === "fulfilled") {
      return {
        endpoint: INDEXNOW_ENDPOINTS[i],
        status: r.value.status,
        // IndexNow returns 200 (accepted) or 202 (accepted, processing). Both fine.
        // 422/400 means malformed; 403 means key invalid.
        ok: r.value.ok || r.value.status === 202,
      };
    }
    return { endpoint: INDEXNOW_ENDPOINTS[i], status: "rejected" as const, ok: false };
  });

  return {
    success: endpoints.some((e) => e.ok),
    endpoints,
    urlCount: normalized.length,
  };
}
