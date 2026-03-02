import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  isLoading: boolean;
  isFirstLogin: boolean;
  setIsFirstLogin: (val: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  setIsAdmin: () => {},
  isLoading: true,
  isFirstLogin: false,
  setIsFirstLogin: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (event === "SIGNED_IN" && session?.user) {
          // Check if user has already used the wheel
          setTimeout(async () => {
            const { data } = await supabase
              .from("user_rewards")
              .select("id")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (!data) {
              setIsFirstLogin(true);
            }
          }, 0);

          // Check admin
          if (session.user.email === "codedbypawan@gmail.com") {
            setIsAdmin(true);
          }
        }

        if (event === "SIGNED_OUT") {
          setIsAdmin(false);
          setIsFirstLogin(false);
        }
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, setIsAdmin, isLoading, isFirstLogin, setIsFirstLogin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
