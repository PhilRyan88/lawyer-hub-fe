import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Login from "@/pages/Login/Login";
import Dashboard from "@/pages/Dashboard/Dashboard";
// Toaster not installed yet

import { ProtectedRoute } from "@/components/ProtectedRoute";
import UserListing from "@/pages/UserListing/UserListing";
import CaseDetails from "@/pages/CaseDetails/CaseDetails";
import MissedDate from "@/pages/MissedDate/MissedDate";
import CalendarPage from "@/pages/Calendar/CalendarPage";
import DropdownsPage from "@/pages/Dropdowns/DropdownsPage";

import { Toaster } from "@/components/ui/sonner";

import { MainLayout } from "@/layouts/MainLayout";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="lawyer-hub-theme">
      <Router>
        <Toaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/missed-dates" element={<MissedDate />} />
            <Route path="/cases/:id" element={<CaseDetails />} />
            <Route path="/calendar" element={<CalendarPage />} />
            
            <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]} />}>
              <Route path="/users" element={<UserListing />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
                <Route path="/dropdowns" element={<DropdownsPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
