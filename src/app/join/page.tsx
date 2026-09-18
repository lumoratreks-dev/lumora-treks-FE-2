import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JoinExperience from "@/components/auth/JoinExperience";

export const metadata: Metadata = {
  title: "Join Lumora | Lumora Treks",
  description: "Sign in with Google and create your Lumora traveler profile.",
};

function safeCallbackUrl(value: string | string[] | undefined) {
  if (
    typeof value !== "string" ||
    !value ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    return "/";
  }

  try {
    const base = new URL("https://lumora.local");
    const resolved = new URL(value, base);
    if (resolved.origin !== base.origin) return "/";
    if (resolved.pathname === "/join" || resolved.pathname.startsWith("/api/"))
      return "/";
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return "/";
  }
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <>
      <main className="flex-1">
        <Navbar />
        <JoinExperience callbackUrl={safeCallbackUrl(callbackUrl)} />
      </main>
      <Footer />
    </>
  );
}
