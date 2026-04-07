/**
 * NotificationBell — Bell icon with dropdown (DEV-36)
 *
 * Shows unread count badge, notification list with mark-read and mark-all.
 * Integrates into AppLayout header.
 */
import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, Sparkles, AlertTriangle, Send, Bot, CreditCard, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type NotificationType } from "@/hooks/useNotifications";

const ICON_MAP: Record<NotificationType, typeof Sparkles> = {
  generation_done: Sparkles,
  generation_error: AlertTriangle,
  publication_done: Send,
  publication_error: AlertTriangle,
  automation_done: Bot,
  automation_error: AlertTriangle,
  credit_low: CreditCard,
  plan_change: CreditCard,
  system: Info,
};

const COLOR_MAP: Record<NotificationType, string> = {
  generation_done: "text-green-500",
  generation_error: "text-red-500",
  publication_done: "text-blue-500",
  publication_error: "text-red-500",
  automation_done: "text-violet-500",
  automation_error: "text-red-500",
  credit_low: "text-amber-500",
  plan_change: "text-accent",
  system: "text-muted-foreground",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function NotificationBell() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
        title="Notificações"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] rounded-xl border bg-card shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="text-[11px] text-accent hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" /> Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = ICON_MAP[n.type] ?? Info;
                const color = COLOR_MAP[n.type] ?? "text-muted-foreground";

                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors hover:bg-muted/30",
                      !n.read && "bg-accent/5"
                    )}
                  >
                    <div className={cn("mt-0.5 shrink-0", color)}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-xs font-semibold truncate", !n.read && "text-foreground", n.read && "text-muted-foreground")}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          title="Marcar como lida"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteNotification(n.id)}
                        className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-red-500"
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
