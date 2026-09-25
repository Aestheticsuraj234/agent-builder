import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/actions";

export default async function HomePage() {
  await requireAuth();
  redirect("/agents");
}
