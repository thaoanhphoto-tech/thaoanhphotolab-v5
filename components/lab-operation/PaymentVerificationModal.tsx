import React, { useState } from 'react';
import { PrintRequest } from '../../userStore';
import { XIcon } from '../icons/XIcon';

interface PaymentVerificationModalProps {
  request: PrintRequest;
  onClose: () => void;
  onConfirm: (requestId: string, amountPaid: number) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
const parseCurrency = (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;


export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({ request, onClose, onConfirm }) => {
  const [amountPaid, setAmountPaid] = useState('');

  const handleSubmit = () => {
    let amountToConfirm = parseCurrency(amountPaid);
    
    // If the input is empty, assume the user wants to confirm the full remaining amount.
    if (amountToConfirm === 0 && amountPaid.trim() === '') {
        const totalAmount = request.totalAmount || 0;
        const alreadyPaid = request.amountPaid || 0;
        amountToConfirm = totalAmount - alreadyPaid;
    }
    
    onConfirm(request.id, amountToConfirm);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">Xác thực Thanh toán</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
        </header>

        <div className="p-6 space-y-4">
          <p className="text-sm">Xác nhận thanh toán cho hóa đơn <span className="font-bold">#{request.id.slice(-6)}</span> của khách <span className="font-bold">{request.orderDetails.customerInfo.fullName}</span>.</p>
          <div>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Tổng tiền hóa đơn:</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(request.totalAmount || 0)}đ</p>
          </div>
           {request.paymentStatus === 'partially_paid' && (
             <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Số tiền đã thanh toán:</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(request.amountPaid || 0)}đ</p>
                 <p className="text-sm text-slate-500 dark:text-zinc-400">Còn lại:</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency((request.totalAmount || 0) - (request.amountPaid || 0))}đ</p>
            </div>
           )}
          <div>
            <label htmlFor="amountPaid" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Nhập số tiền thực nhận (trong lần này)</label>
            <input
              id="amountPaid"
              type="text"
              value={amountPaid}
              onChange={e => setAmountPaid(formatCurrency(parseCurrency(e.target.value)))}
              placeholder="Để trống nếu thanh toán đủ"
              className="w-full mt-1 p-2 border border-slate-300 dark:border-zinc-600 rounded-md text-right font-semibold text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-700"
            />
            <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ tự động cập nhật công nợ nếu tổng số tiền đã trả nhỏ hơn tổng hóa đơn.</p>
          </div>
        </div>

        <footer className="p-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Xác nhận
          </button>
        </footer>
      </div>
    </div>
  );
};