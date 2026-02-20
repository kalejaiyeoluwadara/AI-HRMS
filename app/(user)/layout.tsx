import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-[20%] min-w-[200px] shrink-0">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
