import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  listing_image?: string;
  other_user_name?: string;
  last_message?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: convos, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !convos) {
      setLoading(false);
      return;
    }

    // Enrich with listing and user info
    const enriched: Conversation[] = await Promise.all(
      convos.map(async (c) => {
        const otherUserId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;

        const [listingRes, profileRes, lastMsgRes] = await Promise.all([
          supabase.from("listings").select("title, image_urls").eq("id", c.listing_id).maybeSingle(),
          supabase.from("profiles").select("first_name, username").eq("user_id", otherUserId).maybeSingle(),
          supabase.from("messages").select("content").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);

        return {
          ...c,
          listing_title: listingRes.data?.title || "Unknown Listing",
          listing_image: listingRes.data?.image_urls?.[0] || "",
          other_user_name: profileRes.data?.first_name || profileRes.data?.username || "User",
          last_message: lastMsgRes.data?.content || "",
        };
      })
    );

    setConversations(enriched);
    setLoading(false);
  }, [user]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setMessagesLoading(false);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !activeConversation) return false;

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConversation.id,
      sender_id: user.id,
      content,
    });

    return !error;
  }, [user, activeConversation]);

  // Create or get conversation
  const getOrCreateConversation = useCallback(async (listingId: string, sellerId: string) => {
    if (!user) return null;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (existing) return existing;

    // Create new conversation
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
      })
      .select()
      .single();

    if (error) return null;
    return created;
  }, [user]);

  // Set active and load messages
  const selectConversation = useCallback((convo: Conversation) => {
    setActiveConversation(convo);
    fetchMessages(convo.id);
  }, [fetchMessages]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!activeConversation) return;

    const channel = supabase
      .channel(`messages-${activeConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates (sender already added optimistically or via insert response)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    messagesLoading,
    selectConversation,
    sendMessage,
    getOrCreateConversation,
    fetchConversations,
    setActiveConversation,
  };
}
