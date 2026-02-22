import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Scale, LayoutDashboard, Calendar, History, Users, Settings, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CustomTooltip } from "./CustomTooltip";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const role = localStorage.getItem("role");
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Missed Dates", href: "/missed-dates", icon: History },
    { name: "Calendar", href: "/calendar", icon: Calendar },
  ];

  if (role === "SUPER_ADMIN" || role === "ADMIN") {
      navItems.push({ name: "Users", href: "/users", icon: Users });
  }

  if (role === "SUPER_ADMIN") {
      navItems.push({ name: "Dropdowns", href: "/dropdowns", icon: Settings });
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300 border-b",
      scrolled 
        ? "bg-background/80 backdrop-blur-md border-border/50 py-2 shadow-sm" 
        : "bg-background border-transparent py-3"
    )}>
      <div className="flex px-4 md:px-8 items-center justify-between mx-auto max-w-[1600px]">
        {/* Logo Section */}
        <div className="flex items-center gap-2 group">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <Scale className="h-5 w-5 text-primary" />
            </div>
            <Link to="/dashboard" className="text-xl font-black tracking-tight hover:text-primary transition-colors">
                Lawyer<span className="text-primary/70">Hub</span>
            </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-muted/50 rounded-2xl border border-border/50">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                  isActive 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "opacity-60")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-border/50">
            <ModeToggle />
            <CustomTooltip content="Secure Logout" side="bottom">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
              </CustomTooltip>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col h-full w-[300px] p-0 border-l border-border/50">
                    <div className="p-6 border-b border-border/50 flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Scale className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xl font-black">Lawyer<span className="text-primary">Hub</span></span>
                    </div>
                    
                    <div className="flex flex-col gap-1 p-3 flex-1 overflow-auto">
                      {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                              "flex items-center justify-between py-3 px-4 rounded-xl text-md font-bold transition-all",
                              isActive 
                                ? "bg-primary/10 text-primary" 
                                : "text-muted-foreground hover:bg-muted"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "opacity-60")} />
                                {item.name}
                            </div>
                            <ChevronRight className={cn("h-4 w-4 opacity-0 transition-opacity", isActive && "opacity-100")} />
                          </Link>
                        );
                      })}
                    </div>

                    <div className="p-6 border-t border-border/50 mt-auto bg-muted/30 space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 shadow-sm">
                            <span className="text-sm font-bold opacity-60">Appearance</span>
                            <ModeToggle />
                        </div>
                        <Button 
                            variant="destructive" 
                            className="w-full h-12 justify-center gap-2 rounded-xl font-bold shadow-lg shadow-destructive/10" 
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </SheetContent>
              </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
