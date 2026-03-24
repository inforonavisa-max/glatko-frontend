import { redirect, notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getServiceRequest, getReviewStatus } from "@/lib/supabase/glatko.server";
import { BackgroundGrids } from "@/components/aceternity/background-grids";
import { ReviewForm } from "@/components/glatko/review/ReviewForm";
import { ReviewPending } from "@/components/glatko/review/ReviewPending";
import { ReviewReveal } from "@/components/glatko/review/ReviewReveal";
import { Link } from "@/i18n/navigation";
import type { Review, ReviewerRole } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string; requestId: string }> | { locale: string; requestId: string };
};

interface RawReviewWithReviewer extends Review {
  reviewer: { full_name: string | null; avatar_url: string | null } | null;
}

export default async function ReviewPage({ params }: Props) {
  const { locale, requestId } = await Promise.resolve(params);
  setRequestLocale(locale);

  const t = await getTranslations();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?redirect=/review/${requestId}`);

  const request = await getServiceRequest(requestId);
  if (!request) notFound();

  if (request.status !== "completed" && request.status !== "reviewed") {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]">
          <BackgroundGrids />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 md:py-20">
          <div className="rounded-2xl border border-white/20 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {t("review.notCompleted")}
            </p>
            <Link
              href="/dashboard/requests"
              className="mt-6 inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40"
            >
              {t("review.backToDashboard")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const reviewerRole: ReviewerRole =
    user.id === request.customer_id ? "customer" : "professional";

  const acceptedBid = (request.bids as Array<{ id: string; status: string; professional?: { id: string; business_name: string | null } }>)?.find(
    (b) => b.status === "accepted"
  );

  let revieweeId: string;
  let otherPartyName: string | null = null;
  let otherPartyAvatar: string | null = null;

  if (reviewerRole === "customer") {
    revieweeId = acceptedBid?.professional?.id ?? "";
    otherPartyName = acceptedBid?.professional?.business_name ?? null;
  } else {
    revieweeId = request.customer_id;
    const { data: customerProfile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", request.customer_id)
      .single();
    otherPartyName = customerProfile?.full_name ?? null;
    otherPartyAvatar = customerProfile?.avatar_url ?? null;
  }

  const reviewStatus = await getReviewStatus(requestId, user.id);

  if (reviewStatus.bothPublished) {
    const { data: allReviews } = await supabase
      .from("glatko_reviews")
      .select("*, reviewer:profiles!reviewer_id(full_name, avatar_url)")
      .eq("service_request_id", requestId)
      .eq("is_published", true);

    const rawReviews = (allReviews ?? []) as RawReviewWithReviewer[];
    const mapReview = (r: RawReviewWithReviewer) => ({
      ...r,
      reviewer: r.reviewer
        ? { full_name: r.reviewer.full_name ?? "—", avatar_url: r.reviewer.avatar_url }
        : null,
    });
    const customerReview = rawReviews.find((r) => r.reviewer_role === "customer");
    const proReview = rawReviews.find((r) => r.reviewer_role === "professional");
    const mappedCustomer = customerReview ? mapReview(customerReview) : null;
    const mappedPro = proReview ? mapReview(proReview) : null;

    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]">
          <BackgroundGrids />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 md:py-20">
          <ReviewReveal
            customerReview={mappedCustomer}
            proReview={mappedPro}
            requestTitle={request.title}
          />
        </div>
      </div>
    );
  }

  if (reviewStatus.myReview) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]">
          <BackgroundGrids />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 md:py-20">
          <ReviewPending
            requestTitle={request.title}
            otherHasReviewed={reviewStatus.otherHasReviewed}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]">
        <BackgroundGrids />
      </div>
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 md:py-20">
        <ReviewForm
          serviceRequestId={requestId}
          bidId={acceptedBid?.id ?? ""}
          revieweeId={revieweeId}
          reviewerRole={reviewerRole}
          requestTitle={request.title}
          otherPartyName={otherPartyName}
          otherPartyAvatar={otherPartyAvatar}
        />
      </div>
    </div>
  );
}
