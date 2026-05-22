import Nav from "@/components/Nav";

export default function MyTasksPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <h2 className="text-lg font-semibold mb-4">我的任务</h2>
        <p className="text-sm text-[#86868b]">我的任务列表待实现</p>
      </main>
    </div>
  );
}
