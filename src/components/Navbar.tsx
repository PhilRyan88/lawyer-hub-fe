import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut } from "lucide-react";
import { CustomTooltip } from "./CustomTooltip";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const role = localStorage.getItem("role");
  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Missed Adv. Dates", href: "/missed-dates" },
    { name: "Calendar", href: "/calendar" },
  ];

  if (role === "SUPER_ADMIN" || role === "ADMIN") {
      navItems.push({ name: "Users", href: "/users" });
  }

  if (role === "SUPER_ADMIN") {
      navItems.push({ name: "Dropdowns", href: "/dropdowns" });
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-8 justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
            <Scale className="h-6 w-6" />
            <Link to="/dashboard" className="text-xl font-bold">Lawyer Hub</Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
          <ModeToggle />
          <CustomTooltip content="Logout" side="bottom">
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </CustomTooltip>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col h-full w-[300px] sm:w-[540px]">
                <div className="flex items-center gap-2 mb-8 border-b pb-4">
                    <Scale className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">Lawyer Hub</span>
                </div>
                
                <div className="flex flex-col gap-2 flex-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="text-lg font-medium py-3 px-4 rounded-md hover:bg-muted transition-colors flex items-center gap-3"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="border-t pt-4 mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-medium">Theme</span>
                        <ModeToggle />
                    </div>
                    <Button 
                        variant="destructive" 
                        className="w-full justify-start gap-2" 
                        onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                        }}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
