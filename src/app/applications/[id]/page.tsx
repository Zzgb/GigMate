import Nav from "@/components/Nav";
import ApplicantCard from "@/components/ApplicantCard";

const applicants = [
  { name: "李明", experience: "3 年设计经验", message: "我有 3 年 UI 设计经验，熟练使用 Figma，参与过多个产品的设计系统搭建，附上作品集链接供参考。", tags: ["Figma", "Sketch", "设计系统"], rating: 4.8, completed: 12, responseRate: "95%", status: "pending" as const },
  { name: "王小红", experience: "5 年设计经验", message: "资深 UI/UX 设计师，曾为多家互联网公司提供设计服务，擅长从 0 到 1 搭建设计系统。", tags: ["Figma", "UI/UX", "用户研究"], rating: 5.0, completed: 28, responseRate: "98%", status: "approved" as const },
];

export default function ApplicationsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <a href="/dashboard/my-tasks" className="text-sm text-[#86868b] hover:text-[#1d1d1f]">← 返回我的任务</a>
        <div className="flex justify-between items-center mb-6 mt-4">
          <div>
            <h4 className="text-base font-semibold mb-0.5">UI 设计稿更新 · 申请列表</h4>
            <div className="text-xs text-[#86868b]">共 8 人申请 | 招募中</div>
          </div>
          <div className="flex gap-1.5">
            <span className="bg-black text-white px-3.5 py-1 rounded-full text-xs">全部</span>
            <span className="bg-white px-3.5 py-1 rounded-full text-xs text-[#86868b] border border-[rgba(0,0,0,0.06)]">待审核</span>
            <span className="bg-white px-3.5 py-1 rounded-full text-xs text-[#86868b] border border-[rgba(0,0,0,0.06)]">已通过</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {applicants.map((a) => (
            <ApplicantCard key={a.name} {...a} />
          ))}
        </div>
      </main>
    </div>
  );
}
