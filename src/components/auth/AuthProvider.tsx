"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthUserResponse,
  OnboardingInput,
  TravelerProfile,
} from "@/features/account/types";

type AuthStatus =
  "loading" | "authenticated" | "unauthenticated" | "unavailable";

type AuthContextValue = {
  status: AuthStatus;
  user: TravelerProfile | null;
  isOnboardingOpen: boolean;
  signInWithGoogle: (credential: string) => Promise<TravelerProfile>;
  completeOnboarding: (input: OnboardingInput) => Promise<TravelerProfile>;
  dismissOnboarding: () => void;
  openOnboarding: () => void;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function responseMessage(response: Response) {
  const data: unknown = await response.json().catch(() => null);
  if (data && typeof data === "object") {
    if ("detail" in data && typeof data.detail === "string") return data.detail;

    const findMessage = (value: unknown): string | null => {
      if (typeof value === "string") return value;
      if (Array.isArray(value)) {
        for (const item of value) {
          const message = findMessage(item);
          if (message) return message;
        }
      } else if (value && typeof value === "object") {
        for (const item of Object.values(value as Record<string, unknown>)) {
          const message = findMessage(item);
          if (message) return message;
        }
      }
      return null;
    };

    const message = findMessage(data);
    if (message) {
      return message;
    }
  }
  return "Something went wrong. Please try again.";
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<TravelerProfile | null>(null);
  const [dismissedUserId, setDismissedUserId] = useState<number | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (response.status === 401 || response.status === 403) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }
      if (!response.ok) {
        setStatus("unavailable");
        return;
      }
      const data = (await response.json()) as AuthUserResponse;
      setUser(data.user);
      setStatus("authenticated");
    } catch {
      setStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      if (active) await refreshSession();
    };
    void loadSession();

    return () => {
      active = false;
    };
  }, [refreshSession]);

  const signInWithGoogle = useCallback(async (credential: string) => {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) throw new Error(await responseMessage(response));
    const data = (await response.json()) as AuthUserResponse;
    setDismissedUserId(null);
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const completeOnboarding = useCallback(async (input: OnboardingInput) => {
    const response = await fetch("/api/auth/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const message = await responseMessage(response);
      if (response.status === 401 || response.status === 403) {
        setUser(null);
        setDismissedUserId(null);
        setStatus("unauthenticated");
      }
      throw new Error(message);
    }
    const data = (await response.json()) as AuthUserResponse;
    setUser(data.user);
    setDismissedUserId(null);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" }).catch(
      () => null,
    );
    if (!response?.ok) return;
    setUser(null);
    setDismissedUserId(null);
    setStatus("unauthenticated");
  }, []);

  const dismissOnboarding = useCallback(() => {
    setDismissedUserId(user?.id ?? null);
  }, [user?.id]);

  const openOnboarding = useCallback(() => setDismissedUserId(null), []);
  const isOnboardingOpen = Boolean(
    status === "authenticated" &&
    user &&
    !user.onboarding_complete &&
    dismissedUserId !== user.id,
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isOnboardingOpen,
      signInWithGoogle,
      completeOnboarding,
      dismissOnboarding,
      openOnboarding,
      refreshSession,
      logout,
    }),
    [
      status,
      user,
      isOnboardingOpen,
      signInWithGoogle,
      completeOnboarding,
      dismissOnboarding,
      openOnboarding,
      refreshSession,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
