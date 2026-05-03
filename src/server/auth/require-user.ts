import { cache } from "react";
import { unauthorized } from "next/navigation";
import { auth } from "@/auth";

export const requireUserId = cache(async (): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) {
    unauthorized();
  }
  return session.user.id;
});
