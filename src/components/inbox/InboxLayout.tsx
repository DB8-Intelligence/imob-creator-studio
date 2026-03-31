import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  FileText,
  Send,
  LayoutGrid,
  Settings,
  Menu,
  X,
  Building2,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Inbox, label: "Inbox", path: "/inbox" },
  { icon: Send, label: "Publicações", path: "/posts" },
  { icon: LayoutGrid, label: "Templates", path: "/brand-templates" },
  { icon: FileText, label: "Biblioteca", path: "/library" },
  { icon: CreditCard, label: "Plano", path: "/plano" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

interface InboxLayoutProps {
  children: ReactNode;
}

const InboxLayout = ({ children }: InboxLayoutProps) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50 flex items-center px-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <Link to="/inbox" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground text-sm">
            DB8 <span className="text-primary">Intelligence</span>
          </span>
        </Link>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/40 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-14 left-0 bottom-0 w-56 bg-card border-r border-border z-50 transform transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-end p-2 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-56 pt-14 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default InboxLayout;
