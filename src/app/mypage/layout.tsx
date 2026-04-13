import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="relative flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
