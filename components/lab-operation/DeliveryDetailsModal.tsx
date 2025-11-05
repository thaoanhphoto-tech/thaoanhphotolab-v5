import React, { useRef } from 'react';
import { PrintRequest } from '../../userStore';
import { XIcon } from '../icons/XIcon';

interface DeliveryDetailsModalProps {
  request: PrintRequest;
  onClose: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';

export const DeliveryDetailsModal: React.FC<DeliveryDetailsModalProps> = ({ request, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const newWindow = window.open('', '', 'height=800,width=800');
      newWindow?.document.write('<html><head><title>Hóa Đơn</title>');
      newWindow?.document.write('<style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } </style>');
      newWindow?.document.write('</head><body>');
      newWindow?.document.write(printContent.innerHTML);
      newWindow?.document.write('</body></html>');
      newWindow?.document.close();
      newWindow?.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">Chi tiết Giao hàng</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
        </header>

        <div className="p-6 max-h-[70vh] overflow-y-auto" ref={printRef}>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-xl mb-2">Hóa đơn #{request.id.slice(-6)}</h3>
              <p className="text-sm">Ngày: {new Date(request.timestamp).toLocaleString('vi-VN')}</p>
            </div>
            
            <div className="border-t border-b py-4 space-y-1">
                <h4 className="font-semibold">Thông tin Người nhận:</h4>
                <p><strong>Tên:</strong> {request.orderDetails.customerInfo.fullName}</p>
                <p><strong>Zalo:</strong> {request.orderDetails.customerInfo.zalo}</p>
                <p><strong>Địa chỉ:</strong> {request.orderDetails.customerInfo.address || 'Chưa cung cấp'}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Chi tiết Đơn hàng:</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-700">
                    <th className="p-2">Sản phẩm</th>
                    <th className="p-2 text-center">SL</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {request.manualOrderItems?.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">{item.productName} ({item.size})</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                   {request.additionalCosts?.map((cost, index) => (
                     <tr key={`cost-${index}`}>
                       <td className="p-2">{cost.description}</td>
                       <td className="p-2 text-center">1</td>
                       <td className="p-2 text-right">{formatCurrency(cost.amount)}</td>
                       <td className="p-2 text-right">{formatCurrency(cost.amount)}</td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>

            <div className="text-right border-t pt-4">
              <p className="text-lg font-bold">TỔNG CỘNG: {formatCurrency(request.totalAmount || 0)}</p>
              <p className={`font-semibold ${request.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                {request.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
              </p>
            </div>

          </div>
        </div>

        <footer className="p-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-md text-sm hover:bg-slate-700"
          >
            In Hóa đơn
          </button>
        </footer>
      </div>
    </div>
  );
};