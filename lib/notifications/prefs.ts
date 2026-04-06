/**
 * Email / push notification preferences stored in profiles.notification_prefs (jsonb).
 */

export type NotificationEmailPrefKey =
  | "email_new_bid"
  | "email_new_message"
  | "email_new_review"
  | "email_new_request_match"
  | "email_status_change"
  /** Pro: bid accepted / not selected emails */
  | "email_pro_bid_outcome"
  /** Customer: future bid-outcome emails; reserved (dispatch may ignore until templates exist) */
  | "email_customer_bid_events"
  /** Pro: verification approved / rejected */
  | "email_verification";

export type NotificationPrefsRow = Partial<
  Record<NotificationEmailPrefKey, boolean>
> & {
  push_enabled?: boolean;
};

export const NOTIFICATION_EMAIL_PREF_KEYS: readonly NotificationEmailPrefKey[] =
  [
    "email_new_bid",
    "email_new_message",
    "email_new_review",
    "email_new_request_match",
    "email_status_change",
    "email_pro_bid_outcome",
    "email_customer_bid_events",
    "email_verification",
  ];

export const DEFAULT_NOTIFICATION_PREFS: Required<
  Pick<
    NotificationPrefsRow,
    | "email_new_bid"
    | "email_new_message"
    | "email_new_review"
    | "email_new_request_match"
    | "email_status_change"
    | "email_pro_bid_outcome"
    | "email_customer_bid_events"
    | "email_verification"
  >
> = {
  email_new_bid: true,
  email_new_message: true,
  email_new_review: true,
  email_new_request_match: true,
  email_status_change: true,
  email_pro_bid_outcome: true,
  email_customer_bid_events: true,
  email_verification: true,
};

export function normalizeNotificationPrefs(
  raw: unknown,
): Required<
  Pick<
    NotificationPrefsRow,
    | "email_new_bid"
    | "email_new_message"
    | "email_new_review"
    | "email_new_request_match"
    | "email_status_change"
    | "email_pro_bid_outcome"
    | "email_customer_bid_events"
    | "email_verification"
  >
> & { push_enabled: boolean } {
  const o =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const emailNewBid = o.email_new_bid !== false;
  const emailNewMessage = o.email_new_message !== false;
  return {
    email_new_bid: emailNewBid,
    email_new_message: emailNewMessage,
    email_new_review: o.email_new_review !== false,
    email_new_request_match: o.email_new_request_match !== false,
    email_status_change:
      o.email_status_change !== undefined
        ? o.email_status_change !== false
        : emailNewBid,
    email_pro_bid_outcome:
      o.email_pro_bid_outcome !== undefined
        ? o.email_pro_bid_outcome !== false
        : emailNewMessage,
    email_customer_bid_events: o.email_customer_bid_events !== false,
    email_verification:
      o.email_verification !== undefined
        ? o.email_verification !== false
        : emailNewBid,
    push_enabled: o.push_enabled === true,
  };
}

export type NormalizedNotificationPrefs = ReturnType<
  typeof normalizeNotificationPrefs
>;

export function mergeNotificationPrefs(
  current: unknown,
  patch: Partial<NotificationPrefsRow>,
): NotificationPrefsRow {
  const n = normalizeNotificationPrefs(current);
  return {
    email_new_bid: patch.email_new_bid ?? n.email_new_bid,
    email_new_message: patch.email_new_message ?? n.email_new_message,
    email_new_review: patch.email_new_review ?? n.email_new_review,
    email_new_request_match:
      patch.email_new_request_match ?? n.email_new_request_match,
    email_status_change: patch.email_status_change ?? n.email_status_change,
    email_pro_bid_outcome: patch.email_pro_bid_outcome ?? n.email_pro_bid_outcome,
    email_customer_bid_events:
      patch.email_customer_bid_events ?? n.email_customer_bid_events,
    email_verification: patch.email_verification ?? n.email_verification,
    push_enabled: patch.push_enabled ?? n.push_enabled,
  };
}
