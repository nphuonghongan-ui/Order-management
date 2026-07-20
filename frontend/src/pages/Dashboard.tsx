import { Outlet } from "react-router";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Dashboard() {
  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
