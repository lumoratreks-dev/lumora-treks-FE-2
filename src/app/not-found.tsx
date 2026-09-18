import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-active">
        Lumora Treks
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="text-lg text-text-secondary">
        We couldn&apos;t find the travel page or package you requested.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-foreground px-5 py-3 font-medium text-background"
      >
        Return home
      </Link>
    </main>
  );
}
