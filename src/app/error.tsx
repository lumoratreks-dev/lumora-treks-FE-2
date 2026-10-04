"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/** Route-level error boundary: keeps the site chrome and offers a retry
 * instead of Next's bare "Application error" screen. */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-active">
          Lumora Treks
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="text-lg text-text-secondary">
          We couldn&apos;t load this page right now. Please try again in a
          moment.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-lg bg-foreground px-5 py-3 font-medium text-background"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border px-5 py-3 font-medium text-foreground"
          >
            Return home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
