import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { AdviceHistoryContent } from "@/components/advice-history/AdviceHistoryContent";

export default async function AdviceHistoryPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  return <AdviceHistoryContent />;
}
