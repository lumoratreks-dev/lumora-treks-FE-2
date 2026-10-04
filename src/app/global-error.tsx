"use client";

import { useEffect } from "react";
import "./globals.css";

/** Last-resort boundary for errors in the root layout itself. It replaces the
 * whole document, so it renders its own <html>/<body> and no providers. */
export default function GlobalError({
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
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-active">
          Lumora Treks
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-lg text-text-secondary">
          Please refresh the page or try again in a moment.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-lg bg-foreground px-5 py-3 font-medium text-background"
          >
            Try again
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the app shell is gone here; a full reload is intended */}
          <a
            href="/"
            className="rounded-lg border border-border px-5 py-3 font-medium text-foreground"
          >
            Return home
          </a>
        </div>
      </body>
    </html>
  );
}
