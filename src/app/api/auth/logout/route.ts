import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  isSameOrigin,
  requestAccountsApi,
} from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { detail: "Invalid request origin." },
      { status: 403 },
    );
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let backendFailed = false;
  if (token) {
    try {
      const { response: backendResponse } = await requestAccountsApi(
        "logout/",
        {
          method: "POST",
          headers: { Authorization: `Token ${token}` },
        },
      );
      backendFailed = !backendResponse.ok && backendResponse.status !== 401;
    } catch {
      backendFailed = true;
    }
  }

  // Always end the session in this browser, even if the backend could not
  // revoke the token (it still expires server-side).
  const response = NextResponse.json({ ok: true, revoked: !backendFailed });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
