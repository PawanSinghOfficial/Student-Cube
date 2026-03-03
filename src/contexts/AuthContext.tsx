import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isFirstLogin: boolean;
  setIsFirstLogin: (val: boolean) => void;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  isFirstLogin: false,
  setIsFirstLogin: () => {},
  signOut: async () => {},
  checkAdminStatus: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-admin");
      if (!error && data?.isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (event === "SIGNED_IN" && session?.user) {
          // Check first login (reward wheel)
          setTimeout(async () => {
            const { data } = await supabase
              .from("user_rewards")
              .select("id")
              .eq("user_id", session.user.id)
              .maybeSingle();
            if (!data) setIsFirstLogin(true);
          }, 0);

          // Check admin role
          setTimeout(() => checkAdminStatus(), 0);
        }

        if (event === "SIGNED_OUT") {
          setIsAdmin(false);
          setIsFirstLogin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user) {
        checkAdminStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, isFirstLogin, setIsFirstLogin, signOut, checkAdminStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
