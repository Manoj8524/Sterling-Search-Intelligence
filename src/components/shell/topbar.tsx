import { useState } from "react";
import { Bell, CalendarDays, Menu, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { resorts } from "@/data/resorts";
import { useApp } from "@/context/app-context";
import { Sidebar } from "./sidebar";
import { GlobalSearch } from "./global-search";
import { toast } from "sonner";

const dateRanges = ["Last 7 days", "Last 28 days", "Last 12 weeks", "Last 6 months", "Year to date"];

const notifications = [
  { title: "Citation gap detected", body: "Ooty family queries now cite competitors only." },
  { title: "42 new keyword opportunities", body: "South region resorts, detected this morning." },
  { title: "Crawl completed", body: "1,284 pages processed across 75 resorts." },
];

export function Topbar() {
  const { resortId, setResortId, dateRange, setDateRange } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-md lg:px-6">
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[264px] border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setMobileNav(false)} />
        </SheetContent>
      </Sheet>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 md:max-w-md"
      >
        <Search className="size-4" />
        <span className="truncate">Search resorts, keywords, questions, AI queries…</span>
        <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium md:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Select value={resortId} onValueChange={setResortId}>
          <SelectTrigger className="hidden h-9 w-[200px] bg-background md:flex">
            <SelectValue placeholder="All Resorts" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectItem value="all">All Resorts</SelectItem>
            {resorts.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="hidden h-9 w-[152px] bg-background lg:flex">
            <CalendarDays className="size-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRanges.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="hidden items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground xl:flex">
          <RefreshCw className="size-3.5" />
          Last crawled 2 hours ago
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.title} className="flex-col items-start gap-0.5 py-2.5">
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.body}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded-full" aria-label="Account">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-navy text-xs font-semibold text-navy-foreground">AR</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span>Ananya Rao</span>
              <span className="text-xs font-normal text-muted-foreground">Digital Marketing, Sterling</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast("Profile is not available in this demo")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Signed out (demo only)")}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
