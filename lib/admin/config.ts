import { getSiteUrl } from "@/lib/email/resend";

export const ADMIN_LOCALE = "tr" as const;

export function getAdminUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${getSiteUrl()}/${ADMIN_LOCALE}/admin${cleanPath}`;
}

export function getAdminRequestsUrl(requestId?: string): string {
  return requestId
    ? getAdminUrl(`/requests/${requestId}`)
    : getAdminUrl("/requests");
}

export function getAdminProfessionalsUrl(proId?: string): string {
  return proId
    ? getAdminUrl(`/professionals/${proId}`)
    : getAdminUrl("/professionals");
}

export function getAdminUsersUrl(userId?: string): string {
  return userId ? getAdminUrl(`/users/${userId}`) : getAdminUrl("/users");
}
