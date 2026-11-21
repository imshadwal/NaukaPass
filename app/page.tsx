import { redirect } from "next/navigation";
import { getLocalSession } from "@/lib/local-auth";

export default async function HomePage() {
  const session = await getLocalSession();
  redirect(session ? "/dashboard" : "/login");
}
