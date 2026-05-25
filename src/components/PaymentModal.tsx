/**
 * PaymentModal.tsx
 * 付款方式选择弹窗 - WeChat/Alipay/Visa/PayPal/Monster（模拟付款）
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

interface PaymentModalProps {
  open: boolean;
  amount: number;
  onPay: (method: string) => void;
  onCancel: () => void;
}

const methods = [
  {
    key: "wechat",
    label: "微信支付",
    color: "bg-[#07c160] hover:bg-[#06ad56]",
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M8.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM12 2C6.48 2 2 5.92 2 10.73c0 2.65 1.7 4.98 4.25 6.38l-1.07 3.2c-.1.3.22.54.48.35l3.82-2.37c.82.23 1.68.35 2.52.35 5.52 0 10-3.92 10-8.73S17.52 2 12 2z" />
      </svg>
    ),
  },
  {
    key: "alipay",
    label: "支付宝",
    color: "bg-[#1677ff] hover:bg-[#0958d9]",
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
        <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">支</text>
      </svg>
    ),
  },
  {
    key: "visa",
    label: "Visa",
    color: "bg-[#1a1f71] hover:bg-[#1434cb]",
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif">VISA</text>
      </svg>
    ),
  },
  {
    key: "paypal",
    label: "PayPal",
    color: "bg-[#0070ba] hover:bg-[#005ea6]",
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white" fontFamily="sans-serif">PayPal</text>
      </svg>
    ),
  },
  {
    key: "monster",
    label: "Monster",
    color: "bg-[#7c3aed] hover:bg-[#6d28d9]",
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <circle cx="9" cy="9" r="2" />
        <circle cx="15" cy="9" r="2" />
        <path d="M8 14c0 0 1.5 2 4 2s4-2 4-2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="white" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
];

export default function PaymentModal({ open, amount, onPay, onCancel }: PaymentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--g-card)] rounded-[24px] w-[380px] p-6 shadow-2xl">
        <h3 className="text-lg font-semibold mb-1">确认付款</h3>
        <p className="text-sm text-[var(--g-text2)] mb-4">
          任务薪酬 <strong className="text-[var(--g-text)]">&yen;{amount.toFixed(0)}</strong> 将托管至平台
        </p>

        <div className="text-xs font-medium text-[var(--g-text2)] mb-2">选择付款方式</div>
        <div className="flex flex-col gap-2 mb-4">
          {methods.map((m) => (
            <button
              key={m.key}
              onClick={() => onPay(m.key)}
              className={`${m.color} text-white rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors`}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                {m.logo}
              </div>
              <span className="text-sm font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full text-center text-sm text-[var(--g-text2)] hover:text-[var(--g-text)] py-2 cursor-pointer"
        >
          取消
        </button>
      </div>
    </div>
  );
}
