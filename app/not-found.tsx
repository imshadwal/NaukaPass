import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center space-y-4">
      <p className="caption-3 text-ink-muted">NaukaPass · TLS Hotels</p>
      <h1 className="heading-4">Page not found</h1>
      <p className="body-6 text-ink-muted">
        That page is missing. Return to the dashboard or sign in.
      </p>
      <Link href="/dashboard" className="btn-primary">
        Go to dashboard
      </Link>
    </main>
  );
}
