import { Scanner } from "@/components/Scanner";

export default async function ScanPage({
  searchParams
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 md:px-10 md:py-10">
      <Scanner defaultMode={mode === "camera" ? "camera" : "manual"} />
    </main>
  );
}
