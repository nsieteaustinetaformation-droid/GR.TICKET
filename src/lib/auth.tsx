"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_USER_STORAGE_KEY } from "@/lib/auth/constants";
import { normalizeRole, type AccountRole } from "@/lib/auth/roles";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: AccountRole;
}

export interface ProfileUpdate {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, phone: string, email: string, password: string) => Promise<void>;
  updateProfile: (patch: ProfileUpdate) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Enregistre aussi une session signée lisible par le serveur (voir /api/v1/auth/demo). */
async function syncDemoCookie(user: AppUser | null): Promise<void> {
  if (user) {
    await fetch("/api/v1/auth/demo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      }),
    });
  } else {
    await fetch("/api/v1/auth/demo", { method: "DELETE" });
  }
}

function demoUserFromEmail(email: string): AppUser {
  const name = email.split("@")[0]?.replace(/[._-]/g, " ") || "Organisateur";
  return {
    id: `demo-${email.toLowerCase()}`,
    email,
    fullName: name.charAt(0).toUpperCase() + name.slice(1),
    phone: "",
    avatarUrl: "",
    role: "organizer",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      // Différé d'un tick : évite un setState synchrone dans l'effet.
      // La session signée du serveur est la source de vérité : un simple
      // localStorage ne suffit pas à accéder aux espaces privés.
      const timer = window.setTimeout(() => {
        void (async () => {
          try {
            const res = await fetch("/api/v1/auth/session");
            if (res.ok) {
              const data = (await res.json()) as { user: AppUser };
              setUser(data.user);
              window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(data.user));
            } else {
              window.localStorage.removeItem(DEMO_USER_STORAGE_KEY);
            }
          } catch {
            try {
              const raw = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
              if (raw) {
                const restored = JSON.parse(raw) as AppUser;
                setUser(restored);
                void syncDemoCookie(restored);
              }
            } catch {
              // ignore
            }
          } finally {
            setLoading(false);
          }
        })();
      }, 0);
      return () => window.clearTimeout(timer);
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
          avatarUrl: String(sessionUser.user_metadata?.avatar_url ?? ""),
          role: normalizeRole(sessionUser.app_metadata?.role ?? sessionUser.user_metadata?.role),
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
              avatarUrl: String(sessionUser.user_metadata?.avatar_url ?? ""),
              role: normalizeRole(sessionUser.app_metadata?.role ?? sessionUser.user_metadata?.role),
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
          window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(next));
          await syncDemoCookie(next);
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
          window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(next));
          await syncDemoCookie(next);
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
            avatarUrl: "",
            role: "organizer",
          });
        } else {
          throw new Error("Compte créé. Confirmez votre email avant de vous connecter.");
        }
      },
      updateProfile: async (patch) => {
        if (!user) throw new Error("Connectez-vous pour modifier votre profil.");
        const next: AppUser = {
          ...user,
          fullName: patch.fullName?.trim() ?? user.fullName,
          phone: patch.phone?.trim() ?? user.phone,
          avatarUrl: patch.avatarUrl ?? user.avatarUrl,
        };

        if (!supabase) {
          window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(next));
          await syncDemoCookie(next);
          setUser(next);
          return;
        }

        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: next.fullName, phone: next.phone, avatar_url: next.avatarUrl },
        });
        if (authError) throw new Error(authError.message);

        const { error: profileError } = await supabase.from("profiles").upsert({
          id: next.id,
          full_name: next.fullName,
          avatar_url: next.avatarUrl,
          updated_at: new Date().toISOString(),
        });
        if (profileError) throw new Error(profileError.message);
        setUser(next);
      },
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
        window.localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        await syncDemoCookie(null);
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
