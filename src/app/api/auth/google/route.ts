import { NextRequest, NextResponse } from "next/server";
import {
  accountServiceUnavailable,
  AUTH_COOKIE_NAME,
  authCookieOptions,
  isSameOrigin,
  requestAccountsApi,
} from "@/lib/auth/server";
import type { AuthUserResponse } from "@/features/account/types";

type GoogleAuthResponse = AuthUserResponse & { token: string };

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { detail: "Invalid request origin." },
      { status: 403 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const credential =
    body && typeof body === "object" && "credential" in body
      ? (body as { credential?: unknown }).credential
      : null;

  if (typeof credential !== "string" || !credential.trim()) {
    return NextResponse.json(
      { detail: "A Google sign-in credential is required." },
      { status: 400 },
    );
  }

  try {
    const { response, data } = await requestAccountsApi("google/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const result = data as Partial<GoogleAuthResponse>;
    if (!result.token || !result.user) {
      return NextResponse.json(
        {
          detail:
            "The account service returned an incomplete sign-in response.",
        },
        { status: 502 },
      );
    }

    const nextResponse = NextResponse.json<AuthUserResponse>({
      user: result.user,
    });
    nextResponse.cookies.set(AUTH_COOKIE_NAME, result.token, authCookieOptions);
    return nextResponse;
  } catch {
    return NextResponse.json(accountServiceUnavailable(), { status: 502 });
  }
}
