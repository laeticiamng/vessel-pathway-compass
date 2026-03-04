import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { useState } from "react";

export function AppLayout() {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b px-4 glass sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 text-muted-foreground h-9 w-64"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="text-sm">Search or command...</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
