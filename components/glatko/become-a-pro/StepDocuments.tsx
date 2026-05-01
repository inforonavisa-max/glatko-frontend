"use client";

import { ShieldCheck } from "lucide-react";
import {
  DocumentsUploader,
  type ProDocument,
} from "./DocumentsUploader";

interface Props {
  userId: string;
  documents: ProDocument[];
  setDocuments: (docs: ProDocument[]) => void;
  t: (key: string) => string;
}

/**
 * G-PRO-1 Faz 4 — StepDocuments: company documents upload (PDF or image
 * for license/insurance/tax_cert/id_proof). Optional but boosts profile
 * completion score significantly. Files go to private pro-documents
 * bucket; signed URLs are stored alongside path so admins can re-render
 * a fresh preview from the path.
 */
export function StepDocuments({ userId, documents, setDocuments, t }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
          {t("becomePro.steps.documents")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-white/50">
          {t("becomePro.documents.subtitle")}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100/80 bg-white/40 p-5 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck
            className="h-5 w-5 text-teal-600 dark:text-teal-400"
            aria-hidden
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t("becomePro.documents.uploadTitle")}
          </h3>
        </div>
        <DocumentsUploader
          userId={userId}
          documents={documents}
          onChange={setDocuments}
        />
      </div>

      <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
        {t("becomePro.documents.privacyNote")}
      </div>
    </div>
  );
}
