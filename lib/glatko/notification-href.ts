export type NotificationLike = {
  type: string;
  data: Record<string, unknown> | null;
};

export function requestIdFromNotificationData(
  d: Record<string, unknown> | null | undefined,
): string {
  if (!d) return "";
  const a = d.requestId;
  const b = d.request_id;
  if (typeof a === "string" && a) return a;
  if (typeof b === "string" && b) return b;
  return "";
}

export function conversationIdFromNotificationData(
  d: Record<string, unknown> | null | undefined,
): string {
  if (!d) return "";
  const a = d.conversationId;
  const b = d.conversation_id;
  if (typeof a === "string" && a) return a;
  if (typeof b === "string" && b) return b;
  return "";
}

/** Locale-prefixed paths for `useRouter` / `Link` from next-intl (no `/${locale}` prefix). */
export function getNotificationHref(n: NotificationLike): string {
  const d = n.data ?? undefined;
  const req = requestIdFromNotificationData(d);
  const conv = conversationIdFromNotificationData(d);

  switch (n.type) {
    case "new_bid":
    case "status_change":
      return req ? `/dashboard/requests/${req}` : "/dashboard";
    case "bid_accepted":
    case "bid_rejected":
      return "/pro/dashboard/bids";
    case "message":
      return conv ? `/inbox/${conv}` : "/inbox";
    case "review":
      return "/pro/dashboard";
    case "verification_approved":
      return "/pro/dashboard";
    case "verification_rejected":
      return "/pro/dashboard/profile";
    case "new_request_match":
      return req ? `/pro/dashboard/requests/${req}` : "/pro/dashboard/requests";
    default:
      return "/notifications";
  }
}
