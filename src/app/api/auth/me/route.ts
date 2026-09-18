import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  accountServiceUnavailable,
  requestAccountsApi,
} from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not signed in." }, { status: 401 });
  }

  try {
    const { response, data } = await requestAccountsApi("me/", {
      headers: { Authorization: `Token ${token}` },
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
