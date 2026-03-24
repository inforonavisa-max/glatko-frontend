export function maskPhone(phone: string): string {
  const raw = String(phone ?? "").trim();
  if (!raw) return "";

  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 4) return hasPlus ? `+${"*".repeat(Math.max(0, digits.length - 2))}${digits.slice(-2)}` : `**${digits.slice(-2)}`;

  const last2 = digits.slice(-2);
  const prefix = digits.slice(0, -2);
  const masked = `${"*".repeat(Math.max(4, prefix.length))}${last2}`;
  return hasPlus ? `+${masked}` : masked;
}

export function maskEmail(email: string): string {
  const raw = String(email ?? "").trim();
  if (!raw) return "";

  const at = raw.indexOf("@");
  if (at <= 0) return "***";
  const local = raw.slice(0, at);
  const domain = raw.slice(at + 1);
  if (!domain) return `${local[0] ?? "*"}***@***`;

  const localMasked =
    local.length <= 2 ? `${local[0] ?? "*"}*` : `${local[0]}${"*".repeat(Math.max(2, local.length - 2))}${local.slice(-1)}`;

  const dot = domain.lastIndexOf(".");
  const domainName = dot > 0 ? domain.slice(0, dot) : domain;
  const tld = dot > 0 ? domain.slice(dot) : "";
  const domainMasked = domainName ? `${domainName[0]}***` : "***";

  return `${localMasked}@${domainMasked}${tld}`;
}
