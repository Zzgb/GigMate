/**
 * page.tsx
 * 管理员任务管理页 - 搜索/分页/排序 + 状态日志 + 交易日志
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Nav from "@/components/Nav";
import SalaryLogModal from "@/components/SalaryLogModal";
import { getAdminTasks } from "@/actions/admin-actions";
import { formatBudget } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string }> = {
  OPEN: { label: "招募中", color: "text-[#f59e0b] bg-[#f59e0b1a]" },
  IN_PROGRESS: { label: "进行中", color: "text-[#007aff] bg-[#007aff1a]" },
  COMPLETED: { label: "已完成", color: "text-[#30d158] bg-[#30d1581a]" },
  CANCELLED: { label: "已取消", color: "text-[var(--g-text2)] bg-[var(--g-input)]" },
};

const salaryLabels: Record<string, string> = {
  "运行中未付款": "text-[#86868b]",
  "部分付款": "text-[#f59e0b]",
  "完全付款": "text-[#007aff]",
  "已完成": "text-[#30d158]",
  "已完成并退款": "text-[#ff3b30]",
  "已完成并转移": "text-[#ff9500]",
  "已关闭": "text-[#86868b]",
};

export default function AdminSalaryPage() {
  const router = useRouter();
  const { isLoggedIn, mounted, roles } = useAuth();
  const [data, setData] = useState<any>({ tasks: [], total: 0, pages: 0, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [logTarget, setLogTarget] = useState<{ taskId: string; mode: "status" | "transaction" } | null>(null);

  const isAdmin = roles.includes("gigmateadmin");

  useEffect(() => {
    if (mounted && !isLoggedIn) { router.replace("/login"); return; }
    if (mounted && !isAdmin) { router.replace("/dashboard"); return; }
  }, [mounted, isLoggedIn, isAdmin, router]);

  const fetchData = useCallback(() => {
    if (!isAdmin) return;
    setLoading(true);
    getAdminTasks({ search, page, pageSize: 20, sortBy, sortDir }).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [isAdmin, search, page, sortBy, sortDir]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const sortArrow = (field: string) => {
    if (sortBy !== field) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  if (!mounted || !isLoggedIn || !isAdmin) return null;

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer"
        >
          &larr; 返回控制台
        </button>
        <h1 className="text-xl font-semibold mb-4">任务管理</h1>

        {/* 搜索 + 排序 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center bg-[var(--g-card)] border border-[var(--g-border)] rounded-xl px-3 py-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--g-text2)] mr-2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="搜索任务名称或 ID..."
              className="bg-transparent text-sm outline-none flex-1"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
          >
            搜索
          </button>
          {search && (
            <button
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
              className="text-sm text-[var(--g-text2)] hover:text-[var(--g-text)] cursor-pointer"
            >
              清除
            </button>
          )}
        </div>

        {/* 表格 */}
        {loading ? (
          <div className="text-sm text-[var(--g-text2)] text-center py-12">加载中...</div>
        ) : data.tasks.length === 0 ? (
          <div className="bg-[var(--g-card)] rounded-2xl p-8 text-center text-sm text-[var(--g-text2)]">
            {search ? "未找到匹配的任务" : "暂无任务数据"}
          </div>
        ) : (
          <>
            <div className="bg-[var(--g-card)] rounded-2xl border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--g-border)] bg-[var(--g-input)]">
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--g-text2)] w-[200px]">任务</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--g-text2)]">雇主</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-[var(--g-text2)]">里程碑</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--g-text2)]">已验收比例</th>
                      <th
                        className="text-right px-4 py-3 text-xs font-medium text-[var(--g-text2)] cursor-pointer hover:text-[var(--g-text)]"
                        onClick={() => toggleSort("budget")}
                      >
                        任务薪酬额{sortArrow("budget")}
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--g-text2)]">薪酬余额</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-[var(--g-text2)]">任务状态</th>
                      <th
                        className="text-center px-4 py-3 text-xs font-medium text-[var(--g-text2)] cursor-pointer hover:text-[var(--g-text)]"
                        onClick={() => toggleSort("status")}
                      >
                        薪酬状态{sortArrow("status")}
                      </th>
                      <th
                        className="text-center px-4 py-3 text-xs font-medium text-[var(--g-text2)] cursor-pointer hover:text-[var(--g-text)]"
                        onClick={() => toggleSort("createdAt")}
                      >
                        创建时间{sortArrow("createdAt")}
                      </th>
                      <th
                        className="text-center px-4 py-3 text-xs font-medium text-[var(--g-text2)] cursor-pointer hover:text-[var(--g-text)]"
                        onClick={() => toggleSort("updatedAt")}
                      >
                        更新时间{sortArrow("updatedAt")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tasks.map((row: any) => {
                      const s = statusLabels[row.status] || { label: row.status, color: "" };
                      const salaryColor = salaryLabels[row.salaryStatus] || "text-[#86868b]";
                      return (
                        <tr key={row.id} className="border-b border-[var(--g-border)] last:border-0 hover:bg-[var(--g-hover)]">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/tasks/${row.id}?from=admin`)}
                              className="text-[#007aff] hover:underline text-left font-medium text-xs"
                            >
                              {row.title}
                            </button>
                            <div className="text-[10px] text-[var(--g-text2)] font-mono">{row.id}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">{row.employerName}</td>
                          <td className="px-4 py-3 text-center text-xs">
                            {row.approvedMilestones}/{row.totalMilestones}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-medium">
                            {row.approvedRatio}%
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-medium">
                            {formatBudget(row.budget, row.budgetMin)}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-medium">
                            &yen;{row.remaining.toFixed(0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setLogTarget({ taskId: row.id, mode: "status" })}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 ${s.color}`}
                              title="点击查看状态日志"
                            >
                              {s.label}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setLogTarget({ taskId: row.id, mode: "transaction" })}
                              className={`text-[10px] font-medium cursor-pointer hover:opacity-80 ${salaryColor}`}
                              title="点击查看交易日志"
                            >
                              {row.salaryStatus}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center text-[10px] text-[var(--g-text2)]">
                            {new Date(row.createdAt).toLocaleDateString("zh-CN")}
                          </td>
                          <td className="px-4 py-3 text-center text-[10px] text-[var(--g-text2)]">
                            {new Date(row.updatedAt).toLocaleDateString("zh-CN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 分页 */}
            {data.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg hover:bg-[var(--g-hover)] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: data.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === data.pages || Math.abs(p - page) <= 2)
                  .map((p, i, arr) => (
                    <span key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="text-[var(--g-text2)] px-1">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium cursor-pointer ${
                          p === page ? "bg-black text-white" : "hover:bg-[var(--g-hover)]"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page >= data.pages}
                  className="p-1.5 rounded-lg hover:bg-[var(--g-hover)] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-[var(--g-text2)] ml-2">
                  共 {data.total} 条，第 {page}/{data.pages} 页
                </span>
              </div>
            )}
          </>
        )}

        {/* Log sidebar */}
        {logTarget && (
          <SalaryLogModal
            taskId={logTarget.taskId}
            mode={logTarget.mode}
            onClose={() => setLogTarget(null)}
          />
        )}
      </main>
    </div>
  );
}
