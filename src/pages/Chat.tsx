import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, AlertTriangle, Lock } from "lucide-react";
import { PREDEFINED_CHAT_KEYWORDS } from "@/data/mockData";

const ChatPage = () => {
  return (
    <Layout showFooter={false}>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card hidden md:block">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg">Messages</h2>
          </div>
          <div className="p-4 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start browsing products to chat with sellers</p>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30 p-8">
          <Card className="max-w-md p-8 text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">Sign in to start chatting with sellers and buyers</p>
            
            <Card className="p-4 bg-accent/10 border-accent/20 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                <p className="text-xs text-left text-muted-foreground">
                  Until you pay the ₹5 listing fee, you can only use predefined keywords to chat.
                </p>
              </div>
            </Card>

            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Available Quick Messages:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {PREDEFINED_CHAT_KEYWORDS.slice(0, 6).map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">{keyword}</Badge>
                ))}
              </div>
            </div>

            <Button variant="accent" className="w-full">Sign In to Chat</Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
