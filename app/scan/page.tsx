import { AppNav } from "@/components/AppNav";
import { Scanner } from "@/components/Scanner";

export const dynamic = "force-dynamic";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <AppNav />
      <main className="flex-1 px-4 pt-24 pb-16 max-w-xl mx-auto w-full space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill-host">NaukaPass · TLS Hotels</span>
            <span className="pill-brand">Boarding check</span>
          </div>
          <h1 className="heading-4 text-accent">Scan boarding pass</h1>
          <p className="body-6 text-ink-muted text-pretty">
            Confirm group details, then mark as boarded. A second scan will show that
            the pass was already scanned.
          </p>
        </header>
        <Scanner initialId={params.id} />
      </main>
    </>
  );
}
