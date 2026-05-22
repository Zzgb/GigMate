import Nav from "@/components/Nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
