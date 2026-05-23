/**
 * page.tsx
 * 任务浏览页 - 搜索框 + 筛选栏（类型/领域/地点/预算/排序）+ 单双列视图切换
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import FilterBar from "@/components/FilterBar";
import TaskCard from "@/components/TaskCard";
import { useAuth } from "@/lib/auth-context";
import { getTasks } from "@/actions/task-actions";

function formatPrice(budget: number): string {
 return `¥${budget}`;
}

function formatTime(date: Date): string {
 const diff = Date.now() - new Date(date).getTime();
 const days = Math.floor(diff / 86400000);
 if (days === 0) return "今天";
 if (days === 1) return "1天前";
 if (days < 7) return `${days}天前`;
 if (days < 30) return `${Math.floor(days / 7)}周前`;
 return `${Math.floor(days / 30)}个月前`;
}

export default function TasksPage() {
 const router = useRouter();
 const { isLoggedIn, mounted } = useAuth();
 const [searchQuery, setSearchQuery] = useState("");
 const [tasks, setTasks] = useState<any[]>([]);
 const [viewMode, setViewMode] = useState<"double" | "single">("double");
 const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const doFetch = (p = 1) => {
    return getTasks({
      search: searchQuery || undefined,
      category: activeFilters.category !== "全部类型" ? activeFilters.category : undefined,
      sort: activeFilters.sort === "最新发布" ? undefined
        : activeFilters.sort === "价格从高到低" ? "budget_desc"
        : activeFilters.sort === "价格从低到高" ? "budget_asc"
        : undefined,
      page: p,
      pageSize: 10,
    });
  };

 useEffect(() => {
  if (mounted && !isLoggedIn) router.replace("/login");
 }, [mounted, isLoggedIn, router]);

 useEffect(() => { doFetch(1).then((r: any) => { setTasks(r.tasks); setTotalPages(r.pages); setPage(r.page); }); }, []);

 const handleSearch = () => doFetch(1).then((r: any) => { setTasks(r.tasks); setTotalPages(r.pages); setPage(r.page); });

 const handleFilterChange = (key: string, value: string) => {
  const newFilters = { ...activeFilters, [key]: value };
  setActiveFilters(newFilters);
  doFetch(1).then((r: any) => { setTasks(r.tasks); setTotalPages(r.pages); setPage(1); });
 };

 const handleReset = () => {
  setActiveFilters({});
  setSearchQuery("");
  doFetch(1).then((r: any) => { setTasks(r.tasks); setTotalPages(r.pages); setPage(r.page); });
 };

 if (!mounted || !isLoggedIn) return null;

 return (
  <div className="flex flex-col flex-1">
   <Nav variant="dashboard" />
   <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
    <div className="flex gap-3 items-center mb-4">
     <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      placeholder="搜索任务名称、关键词..."
      className="flex-1 bg-[var(--g-card)] rounded-xl px-4 py-2.5 border border-[var(--g-border3)] text-sm text-[var(--g-text)] outline-none focus:border-[#007aff] placeholder:text-[var(--g-text2)] dark:text-[#98989d]"
     />
     <button
      onClick={handleSearch}
      className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
     >
      搜索
     </button>
     <div className="flex bg-[var(--g-card)] rounded-xl p-1 border border-[var(--g-border3)]">
      <button
       onClick={() => setViewMode("single")}
       className={`px-2 py-1 rounded-lg text-xs cursor-pointer ${viewMode === "single" ? "bg-black text-white" : "text-[var(--g-text2)] dark:text-[#98989d]"}`}
      >
       ☰
      </button>
      <button
       onClick={() => setViewMode("double")}
       className={`px-2 py-1 rounded-lg text-xs cursor-pointer ${viewMode === "double" ? "bg-black text-white" : "text-[var(--g-text2)] dark:text-[#98989d]"}`}
      >
       ▦
      </button>
     </div>
    </div>

    <FilterBar
     activeFilters={activeFilters}
     onFilterChange={handleFilterChange}
     onReset={handleReset}
    />

    <div className={viewMode === "double" ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
     {tasks.map((t) => (
      <TaskCard
       key={t.id}
       id={t.id}
       title={t.title}
       category={t.category || ""}
       location="线上"
       time={formatTime(t.createdAt)}
       description={t.description}
       tags={t.skills || []}
       price={formatPrice(t.budget)}
      />
     ))}
     {tasks.length === 0 && (
      <div className="col-span-full text-center py-10 text-sm text-[var(--g-text2)] dark:text-[#98989d]">没有找到匹配的任务</div>
     )}
    </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button onClick={() => doFetch(page - 1).then((r: any) => { setTasks(r.tasks); setTotalPages(r.pages); setPage(r.page); })} disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs cursor-pointer bg-[var(--g-card)] text-[var(--g-text)] disabled:opacity-30 hover:bg-[var(--g-hover)]">上一页</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => doFetch(p).then((r: any) => { setTasks(r.tasks); setTotalPages(r.pages); setPage(r.page); })} 
                className={`w-8 h-8 rounded-lg text-xs cursor-pointer ${p === page ? "bg-black text-white" : "bg-[var(--g-card)] text-[var(--g-text)] hover:bg-[var(--g-hover)]"}`}>{p}</button>
            ))}
            <button onClick={() => doFetch(page + 1).then((r: any) => { setTasks(r.tasks); setTotalPages(r.pages); setPage(r.page); })} disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg text-xs cursor-pointer bg-[var(--g-card)] text-[var(--g-text)] disabled:opacity-30 hover:bg-[var(--g-hover)]">下一页</button>
          </div>
        )}
   </main>
  </div>
 );
}
