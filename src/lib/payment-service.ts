/**
 * payment-service.ts
 * 支付服务接口层 - 模拟实现，预留真实支付 API 替换点
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PaymentService {
  /** 雇主付款到平台托管 */
  deposit(taskId: string, amount: number, payerId: string): Promise<PaymentResult>;
  /** 平台打款给自由职业者（扣 5% 手续费） */
  payout(taskId: string, milestoneId: string, amount: number, payeeId: string): Promise<PaymentResult>;
  /** 退款给雇主 */
  refund(taskId: string, amount: number, payeeId: string, reason: string): Promise<PaymentResult>;
}

export class MockPaymentService implements PaymentService {
  async deposit(_taskId: string, _amount: number, _payerId: string): Promise<PaymentResult> {
    return { success: true, transactionId: `mock-deposit-${Date.now()}` };
  }

  async payout(_taskId: string, _milestoneId: string, _amount: number, _payeeId: string): Promise<PaymentResult> {
    return { success: true, transactionId: `mock-payout-${Date.now()}` };
  }

  async refund(_taskId: string, _amount: number, _payeeId: string, _reason: string): Promise<PaymentResult> {
    return { success: true, transactionId: `mock-refund-${Date.now()}` };
  }
}

let instance: PaymentService;

export function getPaymentService(): PaymentService {
  if (!instance) instance = new MockPaymentService();
  return instance;
}
