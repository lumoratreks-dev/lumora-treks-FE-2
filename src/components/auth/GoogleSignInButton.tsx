"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/components/auth/AuthProvider";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    itp_support?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "large";
      text: "continue_with";
      shape: "pill";
      logo_alignment: "left";
      width: number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

export default function GoogleSignInButton({
  onAuthenticated,
}: {
  onAuthenticated?: () => void;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const containerRef = useRef<HTMLDivElement>(null);
  const { signInWithGoogle } = useAuth();
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.accounts.id),
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError(
          "Google did not return a sign-in credential. Please try again.",
        );
        return;
      }

      setError("");
      setIsSigningIn(true);
      try {
        await signInWithGoogle(response.credential);
        onAuthenticated?.();
      } catch (signInError) {
        setError(
          signInError instanceof Error
            ? signInError.message
            : "Google sign-in could not be completed.",
        );
      } finally {
        setIsSigningIn(false);
      }
    },
    [onAuthenticated, signInWithGoogle],
  );

  useEffect(() => {
    const googleIdentity = window.google?.accounts.id;
    const container = containerRef.current;
    if (!scriptReady || !googleIdentity || !container || !clientId) return;

    googleIdentity.initialize({
      client_id: clientId,
      callback: handleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });
    const renderButton = () => {
      const availableWidth = Math.floor(
        container.getBoundingClientRect().width,
      );
      container.replaceChildren();
      googleIdentity.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: Math.min(340, Math.max(240, availableWidth || 340)),
      });
    };

    renderButton();
    const resizeObserver = new ResizeObserver(renderButton);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [clientId, handleCredential, scriptReady]);

  return (
    <div className="flex w-full max-w-[340px] flex-col gap-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
        onError={() =>
          setError("Google sign-in could not be loaded. Check your connection.")
        }
      />

      {clientId ? (
        <div className="relative min-h-11 w-full">
          <div
            ref={containerRef}
            className={isSigningIn ? "pointer-events-none opacity-50" : ""}
          />
          {isSigningIn && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-surface/90 font-body-alt text-sm font-semibold text-foreground">
              <Icon icon="svg-spinners:ring-resize" className="mr-2 size-5" />
              Joining Lumora…
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 font-body-alt text-sm leading-relaxed text-amber-900">
          Google sign-in needs a client ID. Add
          <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID
          </code>
          to your frontend environment.
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="font-body-alt text-sm font-medium leading-relaxed text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
