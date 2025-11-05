import React, { useState, useEffect } from 'react';
// Fix: Corrected imports for bank account information.
import { getPrintRequests, PrintRequest, getBankAccounts, BankAccount, BANKS } from '../../userStore';
import { VietQRIcon } from '../icons/VietQRIcon';

interface InvoicePageProps {
  invoiceId: string;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';

export const InvoicePage: React.FC<InvoicePageProps> = ({ invoiceId }) => {
  const [request, setRequest] = useState<PrintRequest | null>(null);
  // Fix: Use the correct BankAccount type.
  const [bankInfo, setBankInfo] = useState<BankAccount | null>(null);

  useEffect(() => {
    const allRequests = getPrintRequests();
    const foundRequest = allRequests.find(r => r.invoiceId === invoiceId);
    setRequest(foundRequest || null);
    // Fix: Correctly fetch the default bank account.
    const allBankAccounts = getBankAccounts();
    const defaultAccount = allBankAccounts.find(acc => acc.isDefault) || allBankAccounts[0] || null;
    setBankInfo(defaultAccount);
  }, [invoiceId]);

  if (!request) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold text-red-500">Không tìm thấy hóa đơn</h1>
        <p>Vui lòng kiểm tra lại đường link hoặc liên hệ với Thảo Anh Photo Lab.</p>
      </div>
    );
  }

  const qrCodeUrl = bankInfo
    ? `https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.accountNumber}-compact2.png?amount=${request.totalAmount}&addInfo=${encodeURIComponent(`TT don hang ${request.id.slice(-6)}`)}&accountName=${encodeURIComponent(bankInfo.accountName)}`
    : null;

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">HÓA ĐƠN THANH TOÁN</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Thảo Anh Photo Lab</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <p><strong>Khách hàng:</strong> {request.orderDetails.customerInfo.fullName}</p>
          <p><strong>Zalo:</strong> {request.orderDetails.customerInfo.zalo}</p>
        </div>
        <div className="text-right">
          <p><strong>Mã HĐ:</strong> {request.invoiceId}</p>
          <p><strong>Ngày tạo:</strong> {new Date(request.timestamp).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Chi tiết đơn hàng:</h3>
        <ul className="text-sm space-y-2 bg-slate-50 dark:bg-zinc-700/50 p-3 rounded-md">
          {request.manualOrderItems ? (
            request.manualOrderItems.map((item, i) => (
              <li key={i}>
                <strong>{item.quantity} x</strong> {item.productName} ({item.size})
                <span className="text-slate-500"> - @ {formatCurrency(item.unitPrice)}</span>
              </li>
            ))
          ) : (
            request.orderDetails.layouts?.map((l, i) => (
              <li key={i}><strong>{l.quantity} x</strong> {l.customDescription || l.type}</li>
            ))
          )}
          {request.additionalCosts?.map((c, i) => (
            <li key={`c-${i}`}><strong>1 x</strong> {c.description} ({formatCurrency(c.amount)})</li>
          ))}
        </ul>
      </div>

      <div className="text-center p-6 bg-slate-100 dark:bg-zinc-700 rounded-lg">
        <p className="text-lg">Tổng thanh toán</p>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 my-2">{formatCurrency(request.totalAmount || 0)}</p>
        
        {qrCodeUrl ? (
          <>
            <img src={qrCodeUrl} alt="QR Code Thanh toán" className="w-48 h-48 object-contain mx-auto my-4" />
            <p className="text-sm flex items-center justify-center gap-2"><VietQRIcon className="w-5 h-5"/> Quét mã để thanh toán</p>
          </>
        ) : (
          <p className="text-sm text-red-500">Không thể tạo mã QR. Vui lòng liên hệ Lab.</p>
        )}
      </div>

       <div className="mt-6 text-xs text-center text-slate-500 dark:text-zinc-400">
        Cảm ơn bạn đã sử dụng dịch vụ của Thảo Anh Photo Lab!
      </div>
    </div>
  );
};
