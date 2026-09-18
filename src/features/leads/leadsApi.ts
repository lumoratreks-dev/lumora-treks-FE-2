import { apiSlice } from "@/store/api/apiSlice";

/**
 * `POST /api/v2/leads/` (backend `apps/core/api/views.py::LeadCreateView`).
 * `name`/`email`/`phone`/`message` become first-class `LeadSubmission`
 * fields; any other key (e.g. `destination`, `travel_date`) is stored as-is
 * in `LeadSubmission.data` — so form-specific fields don't need backend
 * changes, just pass them through. Requires an email OR a phone number.
 */
export type SubmitLeadInput = {
  form_key: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source_url?: string;
  page_id?: number;
  package_id?: number;
  consent: boolean;
  form_started_at?: number;
  [extraField: string]: unknown;
};

export type SubmitLeadResult = {
  ok: boolean;
  id?: number;
  errors?: Record<string, string>;
};

export const leadsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitLead: builder.mutation<SubmitLeadResult, SubmitLeadInput>({
      query: (body) => ({ url: "leads/", method: "POST", body }),
    }),
  }),
});

export const { useSubmitLeadMutation } = leadsApi;
