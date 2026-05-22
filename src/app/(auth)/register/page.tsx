import Nav from "@/components/Nav";

export default function RegisterPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="landing" />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-[20px] p-8 w-[380px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center">
          <h2 className="text-xl font-semibold mb-6">注册</h2>
          <p className="text-sm text-[#86868b]">注册功能待实现</p>
        </div>
      </main>
    </div>
  );
}
