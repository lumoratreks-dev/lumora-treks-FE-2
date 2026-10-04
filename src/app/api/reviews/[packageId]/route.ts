import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  isSameOrigin,
  requestBackendApi,
} from "@/lib/auth/server";

type Context = { params: Promise<{ packageId: string }> };

function reviewPath(packageId: string, searchParams: URLSearchParams) {
  const params = new URLSearchParams({ package: packageId });
  for (const key of ["limit", "offset"]) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }
  return `/api/v2/reviews/?${params.toString()}`;
}

async function proxy(request: NextRequest, context: Context) {
  const { packageId } = await context.params;
  const method = request.method;
  if (method !== "GET" && !isSameOrigin(request)) {
    return NextResponse.json(
      { detail: "Invalid request origin." },
      { status: 403 },
    );
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Token ${token}`;
  if (method !== "GET") headers["Content-Type"] = "application/json";
  const path = reviewPath(packageId, request.nextUrl.searchParams);
  const body =
    method === "GET" || method === "DELETE" ? undefined : await request.text();

  try {
    let { response, data } = await requestBackendApi(path, {
      method,
      headers,
      ...(body === undefined ? {} : { body }),
    });

    // Reading reviews is public, but the backend rejects a revoked/expired
    // token even there. Retry anonymously and drop the dead session cookie
    // so the list still loads.
    let clearSession = false;
    if (method === "GET" && token && response.status === 401) {
      ({ response, data } = await requestBackendApi(path, {
        method,
        headers: {},
      }));
      clearSession = true;
    }

    const result =
      response.status === 204
        ? new NextResponse(null, { status: 204 })
        : NextResponse.json(data, { status: response.status });
    if (clearSession) result.cookies.delete(AUTH_COOKIE_NAME);
    return result;
  } catch {
    return NextResponse.json(
      { detail: "We could not reach the reviews service. Please try again." },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: Context) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: Context) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: Context) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: Context) {
  return proxy(request, context);
}
