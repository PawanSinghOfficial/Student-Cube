import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (!user) return null;

  const handleClick = async (n: Notification) => {
    if (!n.is_read) await markAsRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              <Check className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-3 py-3 hover:bg-accent/40 transition-colors ${
                      !n.is_read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                        {n.body && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {n.body}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
