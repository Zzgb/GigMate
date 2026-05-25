/**
 * ReviewSection.tsx
 * 双向评价展示 + 评价弹窗
 * 修改日期: 2026-05-25
 */

"use client";

import { useState } from "react";

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  reviewerId: string;
  revieweeId: string;
  reviewer: { id: string; name: string | null };
  reviewee: { id: string; name: string | null };
}

export function StarsDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-[#f59e0b] text-xs">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export function StarsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2 justify-center mb-4 text-2xl text-[#f59e0b]">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className="cursor-pointer transition-transform hover:scale-110">
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

interface ReviewPairProps {
  employerName: string;
  freelancerName: string;
  employerId: string;
  freelancerId: string;
  reviews: ReviewItem[];
  currentUserId: string;
  isEmployer: boolean;
  taskId: string;
  onCreateReview: (revieweeId: string) => void;
  compact?: boolean;
}

export function ReviewPair({
  employerName, freelancerName, employerId, freelancerId,
  reviews, currentUserId, isEmployer, taskId, onCreateReview, compact,
}: ReviewPairProps) {
  const employerReview = reviews.find((r) => r.reviewerId === employerId);
  const freelancerReview = reviews.find((r) => r.reviewerId === freelancerId);

  if (compact) {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="text-[10px]">
          <span className="text-[var(--g-text2)]">雇主:{employerName}: </span>
          {employerReview ? <StarsDisplay rating={employerReview.rating} /> : <span className="text-[var(--g-text2)]">未评价</span>}
          {employerReview?.comment && <span className="text-[var(--g-text2)] ml-1">"{employerReview.comment}"</span>}
        </div>
        <div className="text-[10px]">
          <span className="text-[var(--g-text2)]">自由职业者:{freelancerName}: </span>
          {freelancerReview ? <StarsDisplay rating={freelancerReview.rating} /> : <span className="text-[var(--g-text2)]">未评价</span>}
          {freelancerReview?.comment && <span className="text-[var(--g-text2)] ml-1">"{freelancerReview.comment}"</span>}
        </div>
      </div>
    );
  }

  const myReview = reviews.find((r) => r.reviewerId === currentUserId);
  const canReview = !myReview;

  return (
    <div className="border-t border-[var(--g-border)] mt-2 pt-2">
      {/* 雇主评价 */}
      <div className="flex items-center justify-between text-xs py-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[var(--g-text2)]">雇主:{employerName}:</span>
          {employerReview ? (
            <><StarsDisplay rating={employerReview.rating} />
              {employerReview.comment && <span className="text-[var(--g-text2)] text-[10px]">"{employerReview.comment}"</span>}</>
          ) : (
            <span className="text-[var(--g-text2)]">未评价</span>
          )}
        </div>
        {isEmployer && canReview && !employerReview && (
          <button onClick={() => onCreateReview(freelancerId)}
            className="text-[10px] text-[#007aff] hover:opacity-80 cursor-pointer">评价</button>
        )}
      </div>
      {/* 自由职业者评价 */}
      <div className="flex items-center justify-between text-xs py-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[var(--g-text2)]">自由职业者:{freelancerName}:</span>
          {freelancerReview ? (
            <><StarsDisplay rating={freelancerReview.rating} />
              {freelancerReview.comment && <span className="text-[var(--g-text2)] text-[10px]">"{freelancerReview.comment}"</span>}</>
          ) : (
            <span className="text-[var(--g-text2)]">未评价</span>
          )}
        </div>
        {!isEmployer && canReview && !freelancerReview && (
          <button onClick={() => onCreateReview(employerId)}
            className="text-[10px] text-[#007aff] hover:opacity-80 cursor-pointer">评价</button>
        )}
      </div>
    </div>
  );
}

interface ReviewModalProps {
  open: boolean;
  revieweeName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function ReviewModal({ open, revieweeName, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try { await onSubmit(rating, comment.trim()); onClose(); }
    catch (err: any) { alert(err.message || "评价失败"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--g-card)] rounded-[20px] p-6 w-[360px] shadow-[0_8px_40px_var(--g-shadow-lg)]" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-4">评价 {revieweeName}</h3>
        <StarsInput value={rating} onChange={setRating} />
        <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="请填写评价内容..."
          className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none mb-4" />
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 bg-[var(--g-input)] text-[var(--g-text)] py-2.5 rounded-xl text-sm font-medium cursor-pointer">取消</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50">
            {submitting ? "提交中..." : "提交评价"}</button>
        </div>
      </div>
    </div>
  );
}
