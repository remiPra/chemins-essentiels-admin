import { Outlet } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#0a1027]">
        <Sidebar />
        <main className="flex-1 p-10 text-white overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
