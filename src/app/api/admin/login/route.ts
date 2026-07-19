import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const isValid = await verifyCredentials(username, password);
    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url), {
        status: 303,
      });
    }

    const token = await createSessionToken();
    const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url), {
      status: 303,
    });
  }
}
