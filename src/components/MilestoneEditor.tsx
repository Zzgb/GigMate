/**
 * MilestoneEditor.tsx
 * 里程碑编辑器 - 动态增删行、拖拽排序、比例校验、实时金额计算
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

export interface MilestoneRow {
  key: string; // 临时唯一标识（非 DB id）
  name: string;
  criteria: string;
  ratio: number;
}

interface MilestoneEditorProps {
  milestones: MilestoneRow[];
  onChange: (milestones: MilestoneRow[]) => void;
  budget: number;
  readOnly?: boolean;
}

let rowCounter = 0;
function nextKey() {
  return `ms-${Date.now()}-${++rowCounter}`;
}

export default function MilestoneEditor({
  milestones,
  onChange,
  budget,
  readOnly,
}: MilestoneEditorProps) {
  const dragIdx = useRef<number | null>(null);

  const totalRatio = milestones.reduce((sum, m) => sum + (m.ratio || 0), 0);
  const remaining = Math.round((100 - totalRatio) * 10) / 10;

  const update = (idx: number, field: keyof MilestoneRow, value: string | number) => {
    const next = milestones.map((m, i) => {
      if (i !== idx) return m;
      const ratio = field === "ratio" ? Number(value) || 0 : m.ratio;
      return { ...m, [field]: value, ratio };
    });
    onChange(next);
  };

  const add = () => {
    onChange([...milestones, { key: nextKey(), name: "", criteria: "", ratio: 0 }]);
  };

  const remove = (idx: number) => {
    if (milestones.length <= 1) return;
    onChange(milestones.filter((_, i) => i !== idx));
  };

  const calcAmount = (ratio: number) =>
    Math.round((ratio / 100) * budget * 100) / 100;

  // HTML5 拖拽
  const onDragStart = (e: React.DragEvent, idx: number) => {
    dragIdx.current = idx;
    (e.currentTarget as HTMLElement).style.opacity = "0.4";
  };

  const onDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    dragIdx.current = null;
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === dropIdx) return;
    const next = [...milestones];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(dropIdx, 0, moved);
    onChange(next);
  };

  return (
    <div className="bg-[var(--g-card)] rounded-[20px] p-5 shadow-[0_2px_20px_var(--g-shadow)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">验收里程碑</span>
          <span className={`text-xs ${remaining < 0 ? "text-[#ff3b30]" : remaining === 0 ? "text-[#30d158]" : "text-[var(--g-text2)]"}`}>
            剩余：{remaining}%
          </span>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1 text-xs text-[#007aff] hover:opacity-80 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            添加节点
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {milestones.map((m, i) => (
          <div
            key={m.key}
            draggable={!readOnly}
            onDragStart={(e) => onDragStart(e, i)}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, i)}
            className="flex items-start gap-2 bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl p-3 group"
          >
            {/* 拖拽手柄 */}
            {!readOnly && (
              <div className="mt-2 cursor-grab active:cursor-grabbing text-[var(--g-text2)] hover:text-[var(--g-text)] flex-shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>
            )}

            {/* 序号 */}
            <div className="w-6 h-6 rounded-full bg-[var(--g-card)] flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1.5">
              {i + 1}
            </div>

            {/* 节点名称 */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <input
                type="text"
                value={m.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="节点名称"
                readOnly={readOnly}
                className="bg-transparent text-sm outline-none placeholder:text-[var(--g-text2)] w-full"
              />
              <textarea
                value={m.criteria}
                onChange={(e) => update(i, "criteria", e.target.value)}
                placeholder="验收条件"
                readOnly={readOnly}
                rows={2}
                className="bg-transparent text-xs outline-none placeholder:text-[var(--g-text2)] w-full resize-none"
              />
            </div>

            {/* 比例 + 金额 */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <input
                type="number"
                min="0"
                max="100"
                value={m.ratio || ""}
                onChange={(e) => update(i, "ratio", e.target.value)}
                placeholder="0"
                readOnly={readOnly}
                className="w-14 bg-[var(--g-card)] rounded-lg px-2 py-1.5 text-xs text-right outline-none"
              />
              <span className="text-xs text-[var(--g-text2)]">%</span>
              <span className="text-xs text-[var(--g-text2)] w-16 text-right">
                ¥{calcAmount(m.ratio).toFixed(0)}
              </span>
            </div>

            {/* 删除 */}
            {!readOnly && milestones.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[var(--g-text2)] hover:text-[#ff3b30] cursor-pointer flex-shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
