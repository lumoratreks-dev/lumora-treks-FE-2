/**
 * Turn a failed `submitLead` (RTK Query) into a message a visitor can act on.
 * The backend (`LeadCreateView`) answers validation problems with
 * `{ ok: false, errors: { field: "message" } }` and throttling with HTTP 429.
 */
export function leadErrorMessage(error: unknown): string {
  const fallback = "Something went wrong — please try again.";
  if (!error || typeof error !== "object" || !("status" in error)) {
    return fallback;
  }
  const { status, data } = error as { status: unknown; data?: unknown };

  if (status === 429) {
    return "Too many submissions — please try again later.";
  }
  if (status === "FETCH_ERROR") {
    return "We couldn't reach our server — please check your connection and try again.";
  }
  if (data && typeof data === "object") {
    const { errors, detail } = data as { errors?: unknown; detail?: unknown };
    if (errors && typeof errors === "object") {
      const first = Object.values(errors).find(
        (value) => typeof value === "string" && value,
      );
      if (typeof first === "string") return first;
    }
    if (typeof detail === "string" && detail) return detail;
  }
  return fallback;
}
