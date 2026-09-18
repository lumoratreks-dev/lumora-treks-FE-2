import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  accountServiceUnavailable,
  isSameOrigin,
  requestAccountsApi,
} from "@/lib/auth/server";

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { detail: "Invalid request origin." },
      { status: 403 },
    );
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { detail: "Sign in to save your profile." },
      { status: 401 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { detail: "Invalid profile data." },
      { status: 400 },
    );
  }

  try {
    const { response, data } = await requestAccountsApi("onboarding/", {
      method: "PATCH",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const nextResponse = NextResponse.json(data, { status: response.status });

    if (response.status === 401 || response.status === 403) {
      nextResponse.cookies.delete(AUTH_COOKIE_NAME);
    }

    return nextResponse;
  } catch {
    return NextResponse.json(accountServiceUnavailable(), { status: 502 });
  }
}
