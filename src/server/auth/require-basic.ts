import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function requireBasicAuth(): Promise<void> {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPass = process.env.BASIC_AUTH_PASS;
  if (!expectedUser || !expectedPass) {
    throw new Error("BASIC_AUTH_USER and BASIC_AUTH_PASS must be configured");
  }

  const header = (await headers()).get("authorization");
  if (!header || !header.toLowerCase().startsWith("basic ")) {
    unauthorized();
  }

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    unauthorized();
  }

  const idx = decoded.indexOf(":");
  if (idx === -1) unauthorized();
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  if (
    !timingSafeEqual(user, expectedUser) ||
    !timingSafeEqual(pass, expectedPass)
  ) {
    unauthorized();
  }
}
