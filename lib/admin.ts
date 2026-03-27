const DEFAULT_ADMIN_EMAILS = [
  "rohat@glatko.app",
  "admin@glatko.app",
  "contact@glatko.app",
  "info@ronalegal.com",
];

function parseAdminEmailsFromEnv(): Set<string> | null {
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) return null;
  const emails = raw
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return emails.length > 0 ? new Set(emails) : null;
}

export function getAdminEmails(): Set<string> {
  return parseAdminEmailsFromEnv() ?? new Set(DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()));
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().has(email.trim().toLowerCase());
}
