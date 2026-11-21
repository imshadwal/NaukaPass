import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { QrDisplay } from "@/components/QrDisplay";
import { StatusBadge } from "@/components/StatusBadge";
import { getBooking } from "@/lib/bookings-data";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const qrValue = siteUrl
    ? `${siteUrl}/scan?id=${booking.id}`
    : booking.id;

  return (
    <>
      <AppNav />
      <main className="flex-1 px-4 pt-24 pb-16 max-w-3xl mx-auto w-full space-y-8">
        <div className="no-print space-y-3">
          <Link href="/dashboard" className="caption-2 text-accent hover:underline">
            Back to dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="heading-4">{booking.leader_name}</h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="body-6 text-ink-muted">
            {booking.contact_number || "No contact"} · {booking.pax}{" "}
            {booking.pax === 1 ? "passenger" : "passengers"} · boarding pass ready to
            print or download
          </p>
        </div>

        <QrDisplay
          value={qrValue}
          leaderName={booking.leader_name}
          contactNumber={booking.contact_number}
          pax={booking.pax}
          bookingId={booking.id}
        />
      </main>
    </>
  );
}
