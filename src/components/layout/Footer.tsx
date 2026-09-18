"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSiteSettingsQuery } from "@/features/site/siteQueries";
import type { CmsLink } from "@/features/site/siteApi";

/** A single footer link. Honours the CMS `open_in_new_tab` flag and routes
 * anchor/external hrefs through a plain <a>, internal paths through <Link>. */
function FooterLink({ link, className }: { link: CmsLink; className: string }) {
  const href = link.href || "";
  const isExternal =
    /^(https?:)?\/\//.test(href) ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");
  const isAnchor = href.startsWith("#");
  const newTab = link.open_in_new_tab || isExternal;

  if (isAnchor || isExternal || newTab) {
    return (
      <a
        href={href}
        className={className}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {link.label}
    </Link>
  );
}

/** Footer — Figma node 73:464 ("Foreground Image"). Forest bg, logo + tagline +
 * socials (left), links (right), and a giant "Lumora Treks" watermark that rises
 * into place on scroll (Figma motion: y 244→0).
 *
 * Description, socials, link columns and copyright all come from
 * `/api/v2/site/` (`FooterSettings`/`BrandSettings`, backend
 * `apps/navigation/models.py`). `FooterSettings.columns` is grouped
 * (heading + links) in the CMS and rendered as grouped columns here; each
 * link honours its `open_in_new_tab` flag (see `FooterLink`). Falls back to
 * minimal built-in copy only while loading, on error, or once empty. */

export default function Footer() {
  const { data: site } = useSiteSettingsQuery();

  const siteName = site?.brand.site_name || "Lumora Treks";
  const description =
    site?.footer?.description ||
    "Your trusted travel partner in Nepal. We curate authentic experiences, breathtaking destinations, and unforgettable memories.";

  const cmsSocials = site?.footer?.socials
    ?.map((s) => ({
      icon: s.value.icon,
      label: s.value.platform,
      href: s.value.url,
    }))
    .filter((s) => s.icon && s.href);
  const socials = cmsSocials?.length
    ? cmsSocials
    : [
        { icon: "mdi:facebook", label: "Facebook", href: "#" },
        { icon: "mdi:instagram", label: "Instagram", href: "#" },
        { icon: "prime:twitter", label: "X", href: "#" },
        { icon: "mdi:whatsapp", label: "WhatsApp", href: "#" },
      ];

  const adminUrl = `${process.env.NEXT_PUBLIC_WAGTAIL_URL || ""}/admin/`;
  const cmsColumns = site?.footer?.columns
    ?.map((c) => ({
      heading: c.value.heading || "",
      links: (c.value.links || []).filter((l) => l.label && l.href),
    }))
    .filter((c) => c.links.length);
  const columns = cmsColumns?.length
    ? cmsColumns
    : [
        {
          heading: "Company",
          links: [
            { label: "Contact Us", href: "/contact" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms & Conditions", href: "/terms" },
            {
              label: "Login to Admin Portal",
              href: adminUrl,
              open_in_new_tab: true,
            },
          ] as CmsLink[],
        },
      ];

  const copyright =
    site?.footer?.copyright_text ||
    `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;

  return (
    <footer className="px-5 pb-5">
      <div className="relative overflow-hidden rounded-[28px]">
        <Image
          src="/images/footer-bg.png"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover"
        />

        {/* Top content */}
        <div className="relative mx-auto flex max-w-[1272px] flex-col gap-10 px-6 pt-8 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-[628px] flex-col gap-6">
            <Link href="/" className="flex items-end gap-[5px]">
              <Image src="/logo.svg" alt={siteName} width={40} height={35} />
              <span className="text-[28px] font-extrabold leading-none tracking-[-0.06em] text-foreground">
                {siteName}
              </span>
            </Link>
            <p className="font-body-alt text-xl tracking-[-0.04em] text-text-secondary">
              {description}
            </p>
            <div className="flex items-center gap-5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  {...(social.href !== "#"
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-foreground transition-transform hover:scale-110"
                >
                  <Icon icon={social.icon} className="size-8" />
                </a>
              ))}
            </div>
          </div>

          <nav className="flex flex-col gap-10 sm:flex-row sm:gap-16 md:justify-end">
            {columns.map((column) => (
              <div key={column.heading} className="flex flex-col gap-3">
                {column.heading && (
                  <h3 className="font-body-alt text-base font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    {column.heading}
                  </h3>
                )}
                {column.links.map((link) => (
                  <FooterLink
                    key={link.label}
                    link={link}
                    className="font-body-alt text-lg tracking-[-0.04em] text-foreground transition-colors hover:text-primary-active"
                  />
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Watermark */}
        <div className="relative mt-6 overflow-hidden">
          <motion.p
            initial={{ y: 160 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="whitespace-nowrap text-center text-[clamp(3.5rem,18vw,210px)] font-bold leading-none tracking-[-0.04em] text-[rgb(245_245_245_/_70%)]"
          >
            {siteName}
          </motion.p>
        </div>

        {/* Copyright */}
        <div className="relative mx-auto max-w-[1272px] px-6 pb-6">
          <p className="font-body-alt text-sm tracking-[-0.02em] text-text-secondary">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
