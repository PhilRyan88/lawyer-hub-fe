import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-muted/40 pb-10">
      <Navbar />
      <div className="container mx-auto ">
        <Outlet />
      </div>
    </div>
  );
}
