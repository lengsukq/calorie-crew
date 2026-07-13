import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { DiaryContent } from "@/components/diary/DiaryContent";

export default async function DiaryPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  return <DiaryContent />;
}
