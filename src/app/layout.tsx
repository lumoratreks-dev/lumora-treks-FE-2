import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/providers/StoreProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { siteSettingsQueryOptions } from "@/features/site/siteQueries";
import AuthProvider from "@/components/auth/AuthProvider";
import OnboardingPrompt from "@/components/auth/OnboardingPrompt";
import { siteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Lumora Treks | Travel Beyond Destinations",
  description:
    "Discover expertly crafted itineraries, local experiences, and seamless bookings that turn every journey into a story worth telling.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(siteSettingsQueryOptions());

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <StoreProvider>
              <AuthProvider>
                {children}
                <OnboardingPrompt />
              </AuthProvider>
            </StoreProvider>
          </HydrationBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
