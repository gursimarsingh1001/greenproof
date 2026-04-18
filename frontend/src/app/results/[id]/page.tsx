import { notFound } from "next/navigation";
import { ResultsClient } from "@/components/ResultsClient";
import { fetchBackendData } from "@/lib/backend";
import type { BrandReputationPayload, ScanResultPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const payload = await fetchBackendData<ScanResultPayload>(`/api/product/${id}`);
    const brandReputation = await fetchBackendData<BrandReputationPayload>(`/api/brand/${payload.brand.id}/reputation`);

    return (
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <ResultsClient payload={payload} brandReputation={brandReputation} />
      </main>
    );
  } catch {
    notFound();
  }
}
