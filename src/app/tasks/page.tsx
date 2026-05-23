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

  useEffect(() => {
    if (mounted && !isLoggedIn) router.replace("/login");
  }, [mounted, isLoggedIn, router]);

  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  const handleSearch = async () => {
    const result = await getTasks({
      search: searchQuery || undefined,
      category: activeFilters.category !== "全部类型" ? activeFilters.category : undefined,
      sort: activeFilters.sort === "最新发布" ? undefined
        : activeFilters.sort === "价格从高到低" ? "budget_desc"
        : activeFilters.sort === "价格从低到高" ? "budget_asc"
        : undefined,
    });
    setTasks(result);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    // 即时查询（搜索框除外）
    getTasks({
      search: searchQuery || undefined,
      category: newFilters.category !== "全部类型" ? newFilters.category : undefined,
      sort: newFilters.sort === "最新发布" ? undefined
        : newFilters.sort === "价格从高到低" ? "budget_desc"
        : newFilters.sort === "价格从低到高" ? "budget_asc"
        : undefined,
    }).then(setTasks);
  };

  const handleReset = () => {
    setActiveFilters({});
    setSearchQuery("");
    getTasks().then(setTasks);
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
            className="flex-1 bg-white rounded-xl px-4 py-2.5 border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)] text-sm text-[#1d1d1f] dark:text-white outline-none focus:border-[#007aff] placeholder:text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]"
          />
          <button
            onClick={handleSearch}
            className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
          >
            搜索
          </button>
          <div className="flex bg-white rounded-xl p-1 border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
            <button
              onClick={() => setViewMode("single")}
              className={`px-2 py-1 rounded-lg text-xs cursor-pointer ${viewMode === "single" ? "bg-black text-white" : "text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]"}`}
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode("double")}
              className={`px-2 py-1 rounded-lg text-xs cursor-pointer ${viewMode === "double" ? "bg-black text-white" : "text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]"}`}
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
            <div className="col-span-full text-center py-10 text-sm text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">没有找到匹配的任务</div>
          )}
        </div>
      </main>
    </div>
  );
}
