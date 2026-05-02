"use client";

import { CheckCircle2, FileCheck, Shield, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "@/components/aceternity/modal";

export interface VerificationDoc {
  type: "business_registration" | "license" | "insurance" | "tax_certificate";
  verified: boolean;
  verifiedAt?: string;
}

export interface VerificationData {
  /** ISO date string when admin marked the pro as verified. */
  verifiedAt: string | null;
  /** Free-form label for who verified — typically "Glatko Trust Team". */
  verifiedBy: string;
  /** Per-document verification status. */
  documents: VerificationDoc[];
  /** G-PRO-2 Faz 4 tier (basic / business / professional). */
  tier?: "basic" | "business" | "professional";
}

interface Props {
  trigger: React.ReactNode;
  verificationData: VerificationData;
}

/**
 * G-PRO-2 Faz 3 — VerificationProofModal
 *
 * Renders the trust-proof Aceternity Pro Modal pattern
 * (components/aceternity/modal.tsx) when a customer clicks the verified
 * badge on a provider's public profile. Surfaces verification date,
 * who verified, and per-document status — gives customers a concrete
 * answer to "what does verified mean here?"
 *
 * The trigger is whatever the caller supplies (typically the
 * VerifiedBadgeWithProof pill). Modal closes on outside-click or ✕.
 */
export function VerificationProofModal({ trigger, verificationData }: Props) {
  const t = useTranslations("verification");
  const verifiedAtLabel = verificationData.verifiedAt
    ? new Date(verificationData.verifiedAt).toLocaleDateString()
    : "—";

  const docTypes: VerificationDoc["type"][] = [
    "business_registration",
    "license",
    "insurance",
    "tax_certificate",
  ];
  const docMap = new Map<VerificationDoc["type"], VerificationDoc>();
  for (const d of verificationData.documents) docMap.set(d.type, d);

  return (
    <Modal>
      <ModalTrigger className="bg-transparent p-0 inline-flex">
        {trigger}
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-emerald-600" aria-hidden />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("proofTitle")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {t("proofSubtitle")}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/20">
              <div className="mb-2 flex items-center gap-2">
                <Calendar
                  className="h-4 w-4 text-emerald-700 dark:text-emerald-400"
                  aria-hidden
                />
                <span className="font-medium text-emerald-900 dark:text-emerald-300">
                  {t("verifiedAt")}: {verifiedAtLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-emerald-700 dark:text-emerald-400"
                  aria-hidden
                />
                <span className="text-sm text-emerald-800 dark:text-emerald-300">
                  {t("verifiedBy", { admin: verificationData.verifiedBy })}
                </span>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                {t("verifiedDocuments")}
              </h3>
              <div className="space-y-2">
                {docTypes.map((type) => {
                  const doc = docMap.get(type);
                  const verified = Boolean(doc?.verified);
                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-neutral-800"
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck
                          className={
                            verified
                              ? "h-5 w-5 text-emerald-600"
                              : "h-5 w-5 text-gray-400"
                          }
                          aria-hidden
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {t(`documentTypes.${type}`)}
                        </span>
                      </div>
                      {verified ? (
                        <span className="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          ✓ {t("verified")}
                        </span>
                      ) : (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-neutral-800 dark:text-neutral-500">
                          {t("notSubmitted")}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-neutral-800">
              <Link
                href="/how-it-works"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {t("whatIsVerification")} →
              </Link>
            </div>
          </div>
        </ModalContent>
      </ModalBody>
    </Modal>
  );
}
