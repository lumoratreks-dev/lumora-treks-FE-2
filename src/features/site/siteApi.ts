import { apiSlice } from "@/store/api/apiSlice";

/**
 * `GET /api/v2/site/` (backend `apps/core/api/views.py::SiteSettingsView`) —
 * brand, navigation, footer, theme and integrations in one call. `items`,
 * `cta_button`, `columns`, `socials` are Wagtail StreamFields, so each comes
 * back as a list of `{type, value, id}` blocks (see `apps/navigation/models.py`
 * — `NavItemBlock`/`ButtonBlock`/`FooterColumnBlock`/`SocialLinkBlock`, all
 * built on the shared `LinkBlock`, whose `value` always includes a resolved
 * `href`).
 */
export type CmsLink = {
  label?: string;
  href?: string | null;
  icon?: string;
  open_in_new_tab?: boolean;
};

export type CmsNavItem = CmsLink & {
  children?: CmsLink[];
  highlight?: boolean;
};

export type SiteSettings = {
  brand: {
    site_name: string;
    tagline: string;
    logo: { url: string; alt?: string } | null;
    contact: {
      email: string;
      phone: string;
      whatsapp: string;
      address: string;
    };
  };
  navigation: {
    sticky: boolean;
    announcement: { text: string; link: string } | null;
    items: { type: string; value: CmsNavItem; id: string }[];
    cta_button: { type: string; value: CmsLink; id: string }[];
  };
  footer: {
    description: string;
    columns: {
      type: string;
      value: { heading: string; links: CmsLink[] };
      id: string;
    }[];
    socials: {
      type: string;
      value: { platform: string; icon: string; url: string };
      id: string;
    }[];
    copyright_text: string;
  };
};

export const siteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSiteSettings: builder.query<SiteSettings, void>({
      query: () => "site/",
      providesTags: ["Site"],
    }),
  }),
});

export const { useGetSiteSettingsQuery } = siteApi;
