import { inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { listInvites } from "@/server/invites/repository";
import { requireBasicAuth } from "@/server/auth/require-basic";
import { AdminInvitesPanel } from "./panel";

export const dynamic = "force-dynamic";

export default async function AdminInvitesPage() {
  await requireBasicAuth();
  const all = await listInvites({ admin: true });

  const usedByIds = Array.from(
    new Set(all.map((i) => i.usedBy).filter((v): v is string => !!v)),
  );
  const usedByUsers = usedByIds.length
    ? await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(inArray(users.id, usedByIds))
    : [];
  const userMap = new Map(usedByUsers.map((u) => [u.id, u.email]));

  const enriched = all.map((i) => ({
    ...i,
    usedByEmail: i.usedBy ? userMap.get(i.usedBy) ?? null : null,
  }));

  return <AdminInvitesPanel invites={enriched} />;
}
