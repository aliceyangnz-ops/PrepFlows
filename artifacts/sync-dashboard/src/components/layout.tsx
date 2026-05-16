import { Link, useLocation } from "wouter";
import { 
  Activity, 
  ArrowRightLeft, 
  Cable, 
  LayoutDashboard, 
  Settings, 
  Webhook
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

function NavItem({ href, icon: Icon, label }: NavItemProps) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href}>
      <div 
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
          isActive 
            ? "bg-primary text-primary-foreground font-medium" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-mono dark">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-6 w-6" />
            <span className="font-bold tracking-tight">KitchenCommand</span>
          </div>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/connectors" icon={Cable} label="Connectors" />
          <NavItem href="/sync" icon={ArrowRightLeft} label="Sync History" />
          <NavItem href="/webhooks" icon={Webhook} label="Webhooks" />
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span>v1.0.0-rc.2</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            {/* Live SSE indicator will go here in pages that need it, or globally */}
            <div className="flex items-center gap-2 text-xs font-medium text-accent">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              SYSTEM ONLINE
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date().toISOString().split('T')[0]}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
