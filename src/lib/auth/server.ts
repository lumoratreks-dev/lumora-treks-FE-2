import "server-only";

import type { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "lumora_session";

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function backendBaseUrl() {
  return (
    process.env.WAGTAIL_URL ||
    process.env.NEXT_PUBLIC_WAGTAIL_URL ||
    "http://localhost:8000"
  ).replace(/\/$/, "");
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get("host")?.trim();
    const allowedHosts = new Set(
      [requestHost, request.nextUrl.host].filter(Boolean),
    );

    const forwardedProtocol = request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      ?.trim()
      .replace(/:$/, "");
    const allowedProtocols = new Set(
      [forwardedProtocol, request.nextUrl.protocol.replace(/:$/, "")].filter(
        Boolean,
      ),
    );

    return (
      allowedHosts.has(originUrl.host) &&
      allowedProtocols.has(originUrl.protocol.replace(/:$/, ""))
    );
  } catch {
    return false;
  }
}

export async function requestAccountsApi(path: string, init: RequestInit = {}) {
  const response = await fetch(`${backendBaseUrl()}/api/v2/auth/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  const data: unknown = await response.json().catch(() => ({
    detail: "The account service returned an invalid response.",
  }));

  return { response, data };
}

export async function requestBackendApi(path: string, init: RequestInit = {}) {
  const response = await fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  const data: unknown =
    response.status === 204
      ? null
      : await response.json().catch(() => ({
          detail: "The service returned an invalid response.",
        }));
  return { response, data };
}

export function accountServiceUnavailable() {
  return {
    detail: "We could not reach the account service. Please try again.",
  };
}
