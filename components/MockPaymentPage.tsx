


import React, { useState, useEffect } from 'react';
import type { PlanId } from '../userStore';
// Fix: Use loadPlans from planStore instead of the non-existent PLAN_DETAILS from userStore.
import { loadPlans } from '../planStore';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface MockPaymentPageProps {
  planId: PlanId | null;
  onPaymentSuccess: (planId: PlanId) => void;
  onClose: () => void;
}

export const MockPaymentPage: React.FC<MockPaymentPageProps> = ({ planId, onPaymentSuccess, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const plans = loadPlans();
  const plan = planId ? plans[planId] : null;

  useEffect(() => {
    // Fix: Replace NodeJS.Timeout with number for browser compatibility.
    let timer: number;
    if (isProcessing) {
      timer = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (planId) {
              onPaymentSuccess(planId);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isProcessing, onPaymentSuccess, planId, onClose]);

  const handlePay = () => {
    setIsProcessing(true);
  };

  if (!plan) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-800/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Xác nhận Thanh toán</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-zinc-400">Gói dịch vụ:</span>
            <span className="font-semibold">{plan.name}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="text-slate-500 dark:text-zinc-400">Tổng cộng:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{plan.price}</span>
          </div>
          <div className="pt-4">
            <p className="text-sm text-slate-500 dark:text-zinc-400">Đây là trang thanh toán giả lập. Nhấn "Thanh toán" để kích hoạt gói ngay lập tức.</p>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-zinc-700/50 rounded-b-lg">
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
          >
            {isProcessing ? `Đang xử lý... ${countdown}` : "Thanh toán ngay"}
          </button>
          <button onClick={onClose} disabled={isProcessing} className="w-full mt-2 text-sm text-center text-slate-500 dark:text-zinc-400 hover:underline">Hủy</button>
          <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 mt-4">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Thanh toán an toàn</span>
          </div>
        </div>
      </div>
    </div>
  );
};