import { createClient } from "@/supabase/server";
import { redirect, notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getServiceRequest, getProfessionalProfile, getProfessionalBids } from "@/lib/supabase/glatko.server";
import { ProRequestDetail } from "@/components/glatko/pro/ProRequestDetail";

type Props = {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string };
};

export default async function ProRequestDetailPage({ params }: Props) {
  const { locale, id } = await Promise.resolve(params);
  setRequestLocale(locale);

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?redirect=/pro/dashboard/requests/${id}`);

  const [request, profile, myBids] = await Promise.all([
    getServiceRequest(id),
    getProfessionalProfile(user.id),
    getProfessionalBids(user.id),
  ]);

  if (!request) notFound();
  if (!profile || profile.verification_status !== "approved") {
    redirect(`/${locale}/pro/dashboard`);
  }

  const alreadyBid = myBids.some((b) => b.service_request_id === id);
  const maxBidsReached = (request.bid_count ?? 0) >= (request.max_bids ?? 4);

  return (
    <ProRequestDetail
      request={JSON.parse(JSON.stringify(request))}
      professionalId={user.id}
      alreadyBid={alreadyBid}
      maxBidsReached={maxBidsReached}
      locale={locale}
    />
  );
}
