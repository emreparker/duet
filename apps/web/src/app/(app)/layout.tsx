import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="duet-app flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
