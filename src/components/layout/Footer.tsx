"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSiteSettingsQuery } from "@/features/site/siteQueries";

/** Footer — Figma node 73:464 ("Foreground Image"). Forest bg, logo + tagline +
 * socials (left), links (right), and a giant "Lumora Treks" watermark that rises
 * into place on scroll (Figma motion: y 244→0).
 *
 * Socials, links and copyright come from `/api/v2/site/`
 * (`FooterSettings`/`BrandSettings`, backend `apps/navigation/models.py`);
 * falls back to the original Figma copy while loading, on error, or once
 * empty. `FooterSettings.columns` is grouped (heading + links) in the CMS,
 * but this design only has one flat link list — columns are flattened,
 * headings dropped, matching the current single-column layout. */

export default function Footer() {
  const { data: site } = useSiteSettingsQuery();

  const siteName = site?.brand.site_name || "Lumora Treks";
  const description =
    site?.footer?.description ||
    "Your trusted travel partner in Nepal. We curate authentic experiences, breathtaking destinations, and unforgettable memories.";

  const cmsSocials =
    site?.footer?.socials
      ?.map((s) => ({ icon: s.value.icon, label: s.value.platform, href: s.value.url }))
      .filter((s) => s.icon && s.href);
  const socials = cmsSocials?.length ? cmsSocials : [
        { icon: "mdi:facebook", label: "Facebook", href: "#" },
        { icon: "mdi:instagram", label: "Instagram", href: "#" },
        { icon: "prime:twitter", label: "X", href: "#" },
        { icon: "mdi:whatsapp", label: "WhatsApp", href: "#" },
      ];

  const cmsLinks =
    site?.footer?.columns
      ?.flatMap((c) => c.value.links)
      .map((l) => ({ label: l.label || "", href: l.href || "" }))
      .filter((l) => l.label && l.href);
  const links = cmsLinks?.length ? cmsLinks : [
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Login to Admin Portal", href: "/admin" },
      ];

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
                  className="text-foreground transition-transform hover:scale-110"
                >
                  <Icon icon={social.icon} className="size-8" />
                </a>
              ))}
            </div>
          </div>

          <nav className="flex flex-col gap-3 md:items-end md:text-right">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-body-alt text-lg tracking-[-0.04em] text-foreground transition-colors hover:text-primary-active"
              >
                {link.label}
              </Link>
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
      </div>
    </footer>
  );
}
