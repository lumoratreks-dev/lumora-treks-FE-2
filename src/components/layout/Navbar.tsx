"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { useUIStore } from "@/store/useUIStore";
import { useSiteSettingsQuery } from "@/features/site/siteQueries";
import AuthNavAction from "@/components/auth/AuthNavAction";


/** Navbar — Figma node 69:873.
 *
 * Nav links and the brand name come from
 * `/api/v2/site/` (`NavigationSettings`/`BrandSettings`, backend
 * `apps/navigation/models.py`) when available; falls back to the original
 * Figma copy while loading, on error, or once the query resolves empty (a
 * fresh CMS with no nav items configured yet). Logo mark stays the static
 * `/logo.svg` asset either way (see Hero's mountain-cutout note — swapping
 * to a CMS-uploaded raster logo needs its own treatment). The final navbar
 * action is account-owned rather than CMS-owned: Join Lumora when signed out,
 * and the traveler menu when signed in. */

export default function Navbar() {
  const pathname = usePathname();
  // Only the landing page's Hero is a full-bleed photo the pill nav can float
  // over (Figma: nav absolute over hero). Every other page's hero sits on a
  // plain background, so the same negative-margin overlap trick there just
  // covers the page title/search bar — keep the navbar in normal flow there.
  const isFloating = pathname === "/";
  const isMobileNavOpen = useUIStore((s) => s.isMobileNavOpen);
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);
  const closeMobileNav = useUIStore((s) => s.closeMobileNav);
  const { data: site, isLoading } = useSiteSettingsQuery();

  const siteName = site?.brand.site_name || "Lumora Treks";
  const cmsLinks =
    site?.navigation.items
      .map((item) => ({ label: item.value.label || "", href: item.value.href || "" }))
      .filter((link) => link.label && link.href);
  const links = cmsLinks?.length ? cmsLinks : [
    { label: "Home", href: "/" },
    { label: "Packages", href: "/packages" },
    { label: "Destinations", href: "/destinations" },
    { label: "Contact Us", href: "/contact" },
  ];
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);


  return (
    <header
      className={clsx(
        "relative z-50 flex w-full items-center justify-between border-b border-border/40 px-8 py-4 sm:px-12 lg:px-16",
        isFloating && "top-10 -mb-[73px] sm:-mb-[81px] lg:-mb-[88px]"
      )}
    >
      <div className="mx-auto w-full flex max-w-[1440px] items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-end gap-[5px]">
          <Image src="/logo.svg" alt={siteName} width={34} height={30} priority />
          <span className="text-2xl font-extrabold leading-none tracking-[-0.06em] text-foreground">
            {siteName}
          </span>
        </Link>

        {/* Desktop nav pill */}
        <nav className="hidden items-center gap-8 rounded-full bg-background px-6 py-3 lg:flex">
          {isLoading ? (
            <div className="flex items-center gap-6 animate-pulse">
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          ) : (
            links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href} className="flex items-center gap-1">
                  {active && (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary-accent" />
                  )}
                  <span
                    className={clsx(
                      "text-base text-foreground",
                      active
                        ? "font-extrabold tracking-[-0.04em]"
                        : "font-semibold tracking-[-0.06em]"
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })
          )}
        </nav>


        {/* Traveler account action (desktop) */}
        <AuthNavAction />

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={toggleMobileNav}
          aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileNavOpen}
          className="flex size-11 items-center justify-center rounded-full bg-background text-foreground lg:hidden"
        >
          <Icon icon={isMobileNavOpen ? "iconoir:xmark" : "iconoir:menu"} className="size-6" />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto mt-3 flex max-w-[1440px] flex-col gap-1 rounded-2xl bg-background p-4 lg:hidden"
          >
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileNav}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                >
                  {active && (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary-accent" />
                  )}
                  <span
                    className={clsx(
                      "text-lg text-foreground",
                      active ? "font-extrabold" : "font-semibold"
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
            <AuthNavAction mobile onAction={closeMobileNav} />
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
