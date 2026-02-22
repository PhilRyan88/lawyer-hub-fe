import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
