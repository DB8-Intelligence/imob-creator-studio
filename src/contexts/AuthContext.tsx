import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { saveAttributionRecord, syncLastTouchToDb } from "@/services/analytics/attributionService";
import { trackEvent } from "@/services/analytics/eventTracker";

type Profile = Tables<"profiles">;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; data?: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Only set state if signUp hasn't already initialized it
      if (!initializedRef.current) {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id).then(setProfile);
        }
      }

      initializedRef.current = true;
      setIsLoading(false);
      console.log("[auth] getSession complete:", { hasSession: !!session, userId: session?.user?.id });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.log("[auth] signUp error:", error.message);
      return { error, data: null };
    }

    console.log("[auth] signUp success:", {
      userId: data.user?.id,
      hasSession: !!data.session,
      emailConfirmedAt: data.user?.email_confirmed_at,
    });

    // If Supabase returned a session (email confirmation OFF),
    // set user/session immediately so ProtectedRoute sees it
    // before navigate() fires. onAuthStateChange will also fire,
    // but setting state here avoids the race condition.
    if (data.session) {
      initializedRef.current = true;
      setSession(data.session);
      setUser(data.session.user);
      setIsLoading(false);
      // Fetch profile eagerly
      const profileData = await fetchProfile(data.session.user.id);
      setProfile(profileData);
      console.log("[auth] signUp: user/session set synchronously, isLoading=false");
    }

    // Fire-and-forget: record first-touch UTM attribution
    if (data.user) {
      saveAttributionRecord(data.user.id);
      trackEvent(data.user.id, "signup");
    }

    return { error: null, data };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Fire-and-forget: sync last-touch UTM if user returned via a campaign
    if (data.user) syncLastTouchToDb(data.user.id);

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
