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

  const { response, data } = await requestBackendApi(
    reviewPath(packageId, request.nextUrl.searchParams),
    {
      method,
      headers,
      ...(method === "GET" || method === "DELETE"
        ? {}
        : { body: await request.text() }),
    },
  );
  if (response.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(data, { status: response.status });
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
