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
  if (token) {
    try {
      const { response: backendResponse, data } = await requestAccountsApi(
        "logout/",
        {
          method: "POST",
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (!backendResponse.ok && backendResponse.status !== 401) {
        return NextResponse.json(data, { status: backendResponse.status });
      }
    } catch {
      return NextResponse.json(
        { detail: "Sign out could not be completed. Please try again." },
        { status: 502 },
      );
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
