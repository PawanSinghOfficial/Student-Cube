import { useState, useEffect, useCallback, useRef } from "react";
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
  read_at: string | null;
}

export const IMAGE_MSG_PREFIX = "[img]";

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef<number>(0);

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
    const enriched: Conversation[] = await Promise.all(
      convos.map(async (c) => {
        const otherUserId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
        const [listingRes, profileRes, lastMsgRes] = await Promise.all([
          supabase.from("listings").select("title, image_urls").eq("id", c.listing_id).maybeSingle(),
          supabase.from("profiles").select("first_name, username").eq("user_id", otherUserId).maybeSingle(),
          supabase.from("messages").select("content").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);
        const lastRaw = lastMsgRes.data?.content || "";
        return {
          ...c,
          listing_title: listingRes.data?.title || "Unknown Listing",
          listing_image: listingRes.data?.image_urls?.[0] || "",
          other_user_name: profileRes.data?.username || "User",
          last_message: lastRaw.startsWith(IMAGE_MSG_PREFIX) ? "📷 Photo" : lastRaw,
        };
      })
    );
    setConversations(enriched);
    setLoading(false);
  }, [user]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (!error && data) setMessages(data);
    setMessagesLoading(false);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !activeConversation) return false;
    const { data, error } = await supabase.from("messages").insert({
      conversation_id: activeConversation.id,
      sender_id: user.id,
      content,
    }).select().single();
    if (!error && data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
    }
    return !error;
  }, [user, activeConversation]);

  const sendImageMessage = useCallback(async (file: File) => {
    if (!user || !activeConversation) return false;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${activeConversation.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("chat-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) return false;
    const { data: pub } = supabase.storage.from("chat-images").getPublicUrl(path);
    return await sendMessage(`${IMAGE_MSG_PREFIX}${pub.publicUrl}`);
  }, [user, activeConversation, sendMessage]);

  const getOrCreateConversation = useCallback(async (listingId: string, sellerId: string) => {
    if (!user) return null;
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .maybeSingle();
    if (existing) return existing;
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ listing_id: listingId, buyer_id: user.id, seller_id: sellerId })
      .select()
      .single();
    if (error) return null;
    return created;
  }, [user]);

  const markConversationRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null)
      .select();
    if (data && data.length > 0) {
      setMessages((prev) =>
        prev.map((m) => (data.find((d) => d.id === m.id) ? { ...m, read_at: data[0].read_at } : m))
      );
    }
  }, [user]);

  const selectConversation = useCallback((convo: Conversation) => {
    setActiveConversation(convo);
    setOtherTyping(false);
    fetchMessages(convo.id).then(() => markConversationRead(convo.id));
  }, [fetchMessages, markConversationRead]);

  // Typing indicator broadcast channel per active conversation
  useEffect(() => {
    if (!user || !activeConversation) {
      setOtherTyping(false);
      return;
    }
    const ch = supabase.channel(`typing-${activeConversation.id}`, {
      config: { broadcast: { self: false } },
    });
    ch.on("broadcast", { event: "typing" }, (payload) => {
      if (payload.payload?.user_id && payload.payload.user_id !== user.id) {
        setOtherTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000);
      }
    });
    ch.on("broadcast", { event: "stop_typing" }, (payload) => {
      if (payload.payload?.user_id && payload.payload.user_id !== user.id) {
        setOtherTyping(false);
      }
    });
    ch.subscribe();
    typingChannelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      typingChannelRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [user, activeConversation]);

  const broadcastTyping = useCallback(() => {
    if (!user || !typingChannelRef.current) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) return;
    lastTypingSentRef.current = now;
    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user.id },
    });
  }, [user]);

  // Global realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`user-messages-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as Message;
        const isActive = newMsg.conversation_id === activeConversation?.id;
        if (isActive) {
          setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
          if (newMsg.sender_id !== user.id) markConversationRead(newMsg.conversation_id);
        }
        const preview = newMsg.content.startsWith(IMAGE_MSG_PREFIX) ? "📷 Photo" : newMsg.content;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === newMsg.conversation_id
              ? { ...c, last_message: preview, updated_at: newMsg.created_at }
              : c
          )
        );
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
        const updated = payload.new as Message;
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConversation, markConversationRead]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    messagesLoading,
    otherTyping,
    selectConversation,
    sendMessage,
    sendImageMessage,
    getOrCreateConversation,
    fetchConversations,
    setActiveConversation,
    broadcastTyping,
  };
}
