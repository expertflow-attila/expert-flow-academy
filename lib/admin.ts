// Admin gating — ADMIN_EMAILS env változó vesszővel elválasztott email lista.
// Példa: ADMIN_EMAILS=hello@expertflow.hu,attila@solobusiness.hu

import { auth } from "./auth";

const adminList = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminList.includes(email.toLowerCase());
}

export async function requireAdmin(): Promise<{ email: string; userId: string }> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email || !isAdminEmail(session.user.email)) {
    throw new Error("Admin hozzáférés szükséges");
  }
  return { email: session.user.email, userId: session.user.id };
}

export async function isAdminSession(): Promise<boolean> {
  const session = await auth();
  return Boolean(session?.user?.email && isAdminEmail(session.user.email));
}
