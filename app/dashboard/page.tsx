import { AppNav } from "@/components/AppNav";
import { BookingList } from "@/components/BookingList";
import { BulkImportForm } from "@/components/BulkImportForm";
import { CreateBookingForm } from "@/components/CreateBookingForm";
import { listBookings } from "@/lib/bookings-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const bookings = await listBookings();
  const pending = bookings.filter((b) => b.status === "pending").length;
  const scanned = bookings.filter((b) => b.status === "scanned").length;

  return (
    <>
      <AppNav />
      <main className="flex-1 px-4 pt-24 pb-16 max-w-4xl mx-auto w-full space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill-host">NaukaPass · TLS Hotels</span>
            <span className="pill-brand">Dev Deepawali on the Ganges</span>
          </div>
          <h1 className="heading-4 text-balance text-accent">Group bookings</h1>
          <p className="body-6 text-ink-muted text-pretty">
            Create a pass for each group, then scan at boarding.
          </p>
          {bookings.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center rounded-lg bg-pending-soft px-3 py-1 caption-3 text-accent">
                {pending} pending
              </span>
              <span className="inline-flex items-center rounded-lg bg-success-soft px-3 py-1 caption-3 text-success">
                {scanned} scanned
              </span>
              <span className="inline-flex items-center rounded-lg bg-lamp-soft px-3 py-1 caption-3 text-lamp-deep">
                {bookings.length} total
              </span>
            </div>
          ) : null}
        </header>

        <CreateBookingForm />
        <BookingList bookings={bookings} />
        <BulkImportForm />
      </main>
    </>
  );
}
