import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

const ADMIN_REALM = 'Basic realm="Admin"';

const { auth: authProxy } = NextAuth(authConfig);

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function basicAuthChallenge() {
  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": ADMIN_REALM },
  });
}

function checkBasicAuth(request: NextRequest): NextResponse | null {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPass = process.env.BASIC_AUTH_PASS;

  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      "BASIC_AUTH_USER and BASIC_AUTH_PASS must be configured to access /admin",
      { status: 500 },
    );
  }

  const header = request.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("basic ")) {
    return basicAuthChallenge();
  }

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return basicAuthChallenge();
  }

  const idx = decoded.indexOf(":");
  if (idx === -1) return basicAuthChallenge();
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  if (
    !timingSafeEqual(user, expectedUser) ||
    !timingSafeEqual(pass, expectedPass)
  ) {
    return basicAuthChallenge();
  }

  return null;
}

export default authProxy((request) => {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const failure = checkBasicAuth(request);
    if (failure) return failure;
    return NextResponse.next();
  }

  if (
    !request.auth &&
    !request.nextUrl.pathname.startsWith("/api/auth") &&
    request.nextUrl.pathname !== "/login" &&
    request.nextUrl.pathname !== "/signup"
  ) {
    const loginUrl = new URL("/login", request.nextUrl);
    if (request.nextUrl.pathname !== "/") {
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
