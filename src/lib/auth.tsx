"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, phone: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_KEY = "gr-ticket-demo-user";

function demoUserFromEmail(email: string): AppUser {
  const name = email.split("@")[0]?.replace(/[._-]/g, " ") || "Organisateur";
  return {
    id: `demo-${email.toLowerCase()}`,
    email,
    fullName: name.charAt(0).toUpperCase() + name.slice(1),
    phone: "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      try {
        const raw = window.localStorage.getItem(DEMO_KEY);
        if (raw) setUser(JSON.parse(raw) as AppUser);
      } catch {
        // ignore
      }
      setLoading(false);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const sessionUser = data.session?.user;
      if (sessionUser) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? "",
          fullName: String(sessionUser.user_metadata?.full_name ?? ""),
          phone: String(sessionUser.user_metadata?.phone ?? ""),
        });
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      setUser(
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email ?? "",
              fullName: String(sessionUser.user_metadata?.full_name ?? ""),
              phone: String(sessionUser.user_metadata?.phone ?? ""),
            }
          : null
      );
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isDemo: !isSupabaseConfigured,
      signIn: async (email, password) => {
        if (!email.trim() || !password.trim()) throw new Error("Renseignez l'email et le mot de passe.");

        if (!supabase) {
          const next = demoUserFromEmail(email.trim());
          window.localStorage.setItem(DEMO_KEY, JSON.stringify(next));
          setUser(next);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error("Email ou mot de passe incorrect.");
      },
      signUp: async (fullName, phone, email, password) => {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          throw new Error("Renseignez le nom, l'email et le mot de passe.");
        }
        if (password.length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères.");

        if (!supabase) {
          const next = { ...demoUserFromEmail(email.trim()), fullName: fullName.trim(), phone: phone.trim() };
          window.localStorage.setItem(DEMO_KEY, JSON.stringify(next));
          setUser(next);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim(), phone: phone.trim() } },
        });
        if (error) throw new Error(error.message);
        if (data.user && data.session) {
          setUser({
            id: data.user.id,
            email: data.user.email ?? "",
            fullName: fullName.trim(),
            phone: phone.trim(),
          });
        } else {
          throw new Error("Compte créé. Confirmez votre email avant de vous connecter.");
        }
      },
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
        window.localStorage.removeItem(DEMO_KEY);
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
