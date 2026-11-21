import { LoginForm } from "@/components/LoginForm";
import { getLocalCredentials } from "@/lib/local-auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const credentials = getLocalCredentials();
  const showHint = process.env.NODE_ENV !== "production";

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 mb-8 text-center">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="pill-host">TLS Hotels</span>
            <span className="pill-brand">Dev Deepawali</span>
          </div>
          <h1 className="heading-3 brand-gradient max-w-[680px] mx-auto">
            NaukaPass
          </h1>
          <p className="body-3 text-ink-muted max-w-[680px] mx-auto text-pretty">
            Issue and scan boat boarding passes for Dev Deepawali on the Ganges.
          </p>
        </div>
      </div>
      <LoginForm
        next={params.next}
        localHint={showHint ? credentials : null}
      />
    </main>
  );
}
