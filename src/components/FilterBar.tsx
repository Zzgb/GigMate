"use client";

import { useState, useRef, useEffect } from "react";

interface FilterBarProps {
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

const filterDefs = [
  { key: "全部", type: "reset" as const },
  { key: "任务类型", type: "dropdown" as const, options: ["全部类型", "设计", "翻译", "摄影", "服务"] },
  { key: "专业领域", type: "dropdown" as const, options: ["全部领域", "Figma", "UI/UX", "英文", "摄影", "咖啡"] },
  { key: "工作地点", type: "dropdown" as const, options: ["全部地点", "线上", "深圳", "北京朝阳"] },
  { key: "预算范围", type: "dropdown" as const, options: ["全部预算", "¥50-100", "¥100-300", "¥300-500", "¥500+"] },
  { key: "排序", type: "dropdown" as const, options: ["最新发布", "价格从高到低", "价格从低到高"] },
];

const filterKeyMap: Record<string, string> = {
  "任务类型": "category",
  "专业领域": "field",
  "工作地点": "location",
  "预算范围": "budget",
  "排序": "sort",
};

export default function FilterBar({ activeFilters, onFilterChange, onReset }: FilterBarProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenFilter(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handlePillClick = (key: string) => {
    if (key === "全部") {
      onReset();
      setOpenFilter(null);
      return;
    }
    setOpenFilter(openFilter === key ? null : key);
  };

  const handleOptionSelect = (filterKey: string, option: string) => {
    const dataKey = filterKeyMap[filterKey];
    if (!dataKey) return;
    if (option.startsWith("全部")) {
      onFilterChange(dataKey, "");
    } else {
      onFilterChange(dataKey, option);
    }
    setOpenFilter(null);
  };

  const isActive = (key: string) => {
    if (key === "全部") {
      const hasAnyFilter = Object.values(activeFilters).some((v) => v !== "");
      return !hasAnyFilter;
    }
    const dataKey = filterKeyMap[key];
    return dataKey && activeFilters[dataKey] && activeFilters[dataKey] !== "";
  };

  return (
    <div ref={ref} className="flex gap-2 flex-wrap mb-6 relative">
      {filterDefs.map((item) => {
        const active = isActive(item.key);
        return (
          <div key={item.key} className="relative">
            <button
              onClick={() => handlePillClick(item.key)}
              className={`px-4 py-1.5 rounded-full text-sm cursor-pointer ${
                active ? "bg-black text-white" : "bg-white text-[#86868b] border border-[rgba(0,0,0,0.06)]"
              }`}
            >
              {item.key}
              {item.type === "dropdown" && <span className="text-xs ml-0.5">▼</span>}
            </button>
            {item.type === "dropdown" && openFilter === item.key && (
              <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] min-w-[150px] py-1 z-50">
                {item.options!.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(item.key, opt)}
                    className="w-full text-left px-4 py-2 text-xs text-[#1d1d1f] hover:bg-[#f5f5f7] cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
