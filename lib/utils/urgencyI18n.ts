/** DB / zod values → keys under request.step3.urgency.* in dictionaries */
const URGENCY_TO_STEP3_KEY: Record<string, string> = {
  asap: "urgent48h",
  this_week: "thisWeek",
  flexible: "flexible",
  specific_date: "specificDate",
};

export function urgencyToStep3Key(urgency: string): string {
  return URGENCY_TO_STEP3_KEY[urgency] ?? "flexible";
}
