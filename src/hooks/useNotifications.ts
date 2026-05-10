import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setNotifications((data as Notification[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotifications()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchNotifications };
}
