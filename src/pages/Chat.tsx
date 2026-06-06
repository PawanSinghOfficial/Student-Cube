import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, AlertTriangle, Lock, Loader2, ArrowLeft, Check, CheckCheck, ImageIcon, Tag, CheckCircle2, XCircle, Snowflake, PackageCheck } from "lucide-react";
import { PREDEFINED_CHAT_KEYWORDS } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useChat, Conversation, IMAGE_MSG_PREFIX } from "@/hooks/useChat";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ChatPage = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    conversations,
    activeConversation,
    messages,
    loading: convoLoading,
    messagesLoading,
    otherTyping,
    selectConversation,
    sendMessage,
    sendImageMessage,
    setActiveConversation,
    getOrCreateConversation,
    fetchConversations,
    broadcastTyping,
  } = useChat();

  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [respondingOfferId, setRespondingOfferId] = useState<string | null>(null);
  const [activeListingStatus, setActiveListingStatus] = useState<string | null>(null);
  const [dealActionLoading, setDealActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSellerInActive = !!activeConversation && activeConversation.seller_id === user?.id;
  const isBuyerInActive = !!activeConversation && activeConversation.buyer_id === user?.id;

  // Track the active listing's status (for freeze / complete actions)
  useEffect(() => {
    if (!activeConversation) {
      setActiveListingStatus(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("listings")
      .select("status")
      .eq("id", activeConversation.listing_id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setActiveListingStatus(data?.status ?? null);
      });
    return () => { cancelled = true; };
  }, [activeConversation, messages.length]);

  // Pending freeze request in this conversation (if any)
  const pendingFreeze = (messages as any[]).find(
    (m) => m.message_type === "deal_freeze" && (m.offer_status ?? "pending") === "pending"
  );

  const handleOfferResponse = async (msg: any, accept: boolean) => {
    if (!activeConversation || !user) return;
    setRespondingOfferId(msg.id);
    try {
      const { error: updErr } = await supabase
        .from("messages")
        .update({ offer_status: accept ? "accepted" : "declined" })
        .eq("id", msg.id)
        .eq("offer_status", "pending");
      if (updErr) throw updErr;

      if (accept) {
        const { error: lErr } = await supabase
          .from("listings")
          .update({ status: "sold" })
          .eq("id", activeConversation.listing_id)
          .eq("user_id", user.id);
        if (lErr) throw lErr;
      }

      await supabase.from("messages").insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: accept
          ? `✅ Offer accepted! Sold for ₹${Number(msg.offer_price).toLocaleString()}.`
          : `❌ Offer of ₹${Number(msg.offer_price).toLocaleString()} declined.`,
        message_type: "system",
      } as any);

      toast({ title: accept ? "Offer accepted" : "Offer declined" });
    } catch (e: any) {
      toast({ title: "Action failed", description: e?.message, variant: "destructive" });
    } finally {
      setRespondingOfferId(null);
    }
  };

  const handleRequestFreeze = async () => {
    if (!activeConversation || !user) return;
    setDealActionLoading(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: "❄️ Requested to freeze this deal. Waiting for the other party to confirm.",
        message_type: "deal_freeze",
        offer_status: "pending",
      } as any);
      if (error) throw error;
      toast({ title: "Deal freeze requested", description: "Waiting for the other party to accept." });
    } catch (e: any) {
      toast({ title: "Could not request freeze", description: e?.message, variant: "destructive" });
    } finally {
      setDealActionLoading(false);
    }
  };

  const handleFreezeResponse = async (msg: any, accept: boolean) => {
    if (!activeConversation || !user) return;
    setRespondingOfferId(msg.id);
    try {
      const { error: updErr } = await supabase
        .from("messages")
        .update({ offer_status: accept ? "accepted" : "declined" })
        .eq("id", msg.id)
        .eq("offer_status", "pending");
      if (updErr) throw updErr;

      if (accept) {
        const { error: lErr } = await supabase
          .from("listings")
          .update({ status: "frozen" })
          .eq("id", activeConversation.listing_id);
        if (lErr) throw lErr;
        setActiveListingStatus("frozen");
      }

      await supabase.from("messages").insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: accept
          ? "🔒 Deal frozen by both parties. Listing reserved — buyer can mark it complete once the exchange is done."
          : "❌ Deal freeze request declined.",
        message_type: "system",
      } as any);

      toast({ title: accept ? "Deal frozen" : "Freeze declined" });
    } catch (e: any) {
      toast({ title: "Action failed", description: e?.message, variant: "destructive" });
    } finally {
      setRespondingOfferId(null);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeConversation || !user) return;
    setDealActionLoading(true);
    try {
      const { error: lErr } = await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", activeConversation.listing_id);
      if (lErr) throw lErr;
      setActiveListingStatus("sold");

      await supabase.from("messages").insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: "✅ Deal completed by the buyer. Listing has been removed from the marketplace.",
        message_type: "system",
      } as any);

      toast({ title: "Deal completed", description: "Listing has been marked as sold." });
    } catch (e: any) {
      toast({ title: "Could not complete deal", description: e?.message, variant: "destructive" });
    } finally {
      setDealActionLoading(false);
    }
  };




  // Auto-open conversation from ?listing=<id> URL param
  useEffect(() => {
    const listingId = searchParams.get("listing");
    if (!listingId || !user || initializing) return;

    const init = async () => {
      setInitializing(true);
      try {
        const { data: listing, error } = await supabase
          .from("listings")
          .select("user_id, title")
          .eq("id", listingId)
          .maybeSingle();

        if (error || !listing) {
          toast({ title: "Listing not found", variant: "destructive" });
          setSearchParams({});
          return;
        }
        if (listing.user_id === user.id) {
          toast({ title: "This is your listing", description: "You cannot chat with yourself.", variant: "destructive" });
          setSearchParams({});
          return;
        }

        const convo = await getOrCreateConversation(listingId, listing.user_id);
        if (convo) {
          await fetchConversations();
          // Find enriched copy if present, otherwise use raw
          selectConversation(convo as Conversation);
        }
      } finally {
        setInitializing(false);
        setSearchParams({});
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const handleSend = async (content?: string) => {
    const text = content || messageInput;
    if (!text.trim()) return;
    setSending(true);
    const ok = await sendMessage(text.trim());
    if (ok) setMessageInput("");
    setSending(false);
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please pick an image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    setUploadingImage(true);
    const ok = await sendImageMessage(file);
    setUploadingImage(false);
    if (!ok) toast({ title: "Upload failed", variant: "destructive" });
  };

  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout showFooter={false}>
        <div className="h-[calc(100vh-4rem)] flex">
          <div className="w-80 border-r border-border bg-card hidden md:block">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold text-lg">Messages</h2>
            </div>
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30 p-8">
            <Card className="max-w-md p-8 text-center">
              <Lock className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">Sign in to start chatting with sellers and buyers</p>
              <Link to="/auth">
                <Button variant="accent" className="w-full">Sign In to Chat</Button>
              </Link>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar - conversations list */}
        <div className={cn(
          "w-full md:w-80 border-r border-border bg-card flex flex-col",
          activeConversation ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg">Messages</h2>
          </div>

          {convoLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1">Browse products and click "Chat with Seller" to start</p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              {conversations.map((convo) => (
                <ConversationItem
                  key={convo.id}
                  conversation={convo}
                  isActive={activeConversation?.id === convo.id}
                  currentUserId={user.id}
                  onClick={() => selectConversation(convo)}
                />
              ))}
            </ScrollArea>
          )}
        </div>

        {/* Main Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col bg-secondary/30",
          !activeConversation ? "hidden md:flex" : "flex"
        )}>
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-border bg-card flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setActiveConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                {activeConversation.listing_image && (
                  <img
                    src={activeConversation.listing_image}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/profile/${activeConversation.buyer_id === user.id ? activeConversation.seller_id : activeConversation.buyer_id}`}
                    className="font-semibold text-sm truncate hover:text-primary block"
                  >
                    {activeConversation.other_user_name}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">{activeConversation.listing_title}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageCircle className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm">No messages yet. Send a quick message to start!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg: any) => {
                      const isOwn = msg.sender_id === user.id;

                      // System messages — centered pill
                      if (msg.message_type === "system") {
                        return (
                          <div key={msg.id} className="flex justify-center">
                            <div className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground border border-border">
                              {msg.content}
                            </div>
                          </div>
                        );
                      }

                      // Offer messages — distinct card
                      if (msg.message_type === "offer") {
                        const status = msg.offer_status as string;
                        const statusColor =
                          status === "accepted" ? "success" :
                          status === "declined" ? "destructive" :
                          "secondary";
                        return (
                          <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                            <Card className={cn(
                              "max-w-[85%] p-4 border-2",
                              status === "pending" ? "border-accent/50 bg-accent/5" :
                              status === "accepted" ? "border-success/50 bg-success/5" :
                              "border-destructive/30 bg-destructive/5"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <Tag className="h-4 w-4 text-accent" />
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  {isOwn ? "Your Offer" : "Offer Received"}
                                </span>
                                <Badge variant={statusColor as any} className="ml-auto text-[10px] capitalize">
                                  {status}
                                </Badge>
                              </div>
                              <p className="text-2xl font-bold text-primary mb-1">
                                ₹{Number(msg.offer_price ?? 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground mb-3 truncate">
                                For: {activeConversation?.listing_title}
                              </p>
                              {status === "pending" && isSellerInActive && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    className="flex-1 gap-1"
                                    disabled={respondingOfferId === msg.id}
                                    onClick={() => handleOfferResponse(msg, true)}
                                  >
                                    {respondingOfferId === msg.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 gap-1"
                                    disabled={respondingOfferId === msg.id}
                                    onClick={() => handleOfferResponse(msg, false)}
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Decline
                                  </Button>
                                </div>
                              )}
                              {status === "pending" && !isSellerInActive && (
                                <p className="text-xs text-muted-foreground italic">Waiting for seller's response…</p>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-2 text-right">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </Card>
                          </div>
                        );
                      }

                      const rawIsImage = msg.content.startsWith(IMAGE_MSG_PREFIX);
                      const rawUrl = rawIsImage ? msg.content.slice(IMAGE_MSG_PREFIX.length) : "";
                      const isSafeImageUrl = rawIsImage && /^https:\/\/[^\s]+\/storage\/v1\/object\/public\/chat-images\//i.test(rawUrl);
                      const isImage = isSafeImageUrl;
                      const imageUrl = isSafeImageUrl ? rawUrl : "";
                      return (
                        <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl text-sm overflow-hidden",
                              isImage ? "p-1" : "px-4 py-2",
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-card border border-border rounded-bl-md"
                            )}
                          >
                            {isImage ? (
                              <a href={imageUrl} target="_blank" rel="noreferrer">
                                <img src={imageUrl} alt="Shared" className="rounded-xl max-h-64 object-cover" />
                              </a>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            )}
                            <div className={cn(
                              "flex items-center gap-1 mt-1",
                              isImage ? "px-2 pb-1" : "",
                              isOwn ? "justify-end" : "justify-start"
                            )}>
                              <p className={cn(
                                "text-[10px]",
                                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                              {isOwn && (
                                msg.read_at ? (
                                  <CheckCheck className="h-3 w-3 text-primary-foreground" />
                                ) : (
                                  <Check className="h-3 w-3 text-primary-foreground/70" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {otherTyping && (
                      <div className="flex justify-start">
                        <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex gap-1 items-center">
                            <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Quick keywords + input */}
              <div className="border-t border-border p-3 bg-card">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PREDEFINED_CHAT_KEYWORDS.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleSend(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagePick}
                />
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    title="Send image"
                  >
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      broadcastTyping();
                    }}
                    placeholder="Type a message..."
                    className="bg-secondary/50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="accent"
                    disabled={!messageInput.trim() || sending}
                    onClick={() => handleSend()}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <MessageCircle className="h-16 w-16 text-primary mb-4 opacity-60" />
              <h2 className="text-xl font-bold mb-2">Welcome, {user.email?.split("@")[0]}!</h2>
              <p className="text-muted-foreground text-sm mb-6 text-center">
                Select a conversation or browse products to start chatting with sellers.
              </p>
              <Card className="p-4 bg-accent/10 border-accent/20 max-w-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                  <p className="text-xs text-left text-muted-foreground">
                    Quick tip: Click "Chat with Seller" on any product to start a conversation.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

function ConversationItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  const isBuyer = conversation.buyer_id === currentUserId;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors border-b border-border",
        isActive && "bg-secondary/70"
      )}
    >
      {conversation.listing_image ? (
        <img
          src={conversation.listing_image}
          alt=""
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm truncate">{conversation.other_user_name}</p>
          <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">
            {isBuyer ? "Buying" : "Selling"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{conversation.listing_title}</p>
        {conversation.last_message && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{conversation.last_message}</p>
        )}
      </div>
    </button>
  );
}

export default ChatPage;
