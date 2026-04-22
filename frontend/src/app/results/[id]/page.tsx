import { notFound } from "next/navigation";
import { ResultsClient } from "@/components/ResultsClient";
import { fetchBackendData } from "@/lib/backend";
import type { ScanResultPayload } from "@/lib/types";

export const revalidate = 300;

export default async function ResultsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const payload = await fetchBackendData<ScanResultPayload>(`/api/product/${id}`, {
      next: {
        revalidate: 300
      }
    });

    return (
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <ResultsClient payload={payload} />
      </main>
    );
  } catch {
    notFound();
  }
}
