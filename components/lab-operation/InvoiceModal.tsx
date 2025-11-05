import React, { useState, useRef } from 'react';
import { PrintRequest, BankAccount, BANKS, ManualOrderItem, User } from '../../userStore';
import { XIcon } from '../icons/XIcon';
import { PageState } from '../../App';
import { VietQRIcon } from '../icons/VietQRIcon';
import { useToast } from '../Toast';
import { CopyIcon } from '../icons/CopyIcon';
import { PrinterIcon } from '../icons/PrinterIcon';
// Fix: Use default import for ZaloIcon as it is a default export.
import ZaloIcon from '../icons/ZaloIcon';
import { FacebookIcon } from '../icons/FacebookIcon';
import { addMessage } from '../../chatStore';

interface InvoiceModalProps {
  request: PrintRequest;
  onClose: () => void;
  onSave: (updates: Partial<Omit<PrintRequest, 'id'>>) => void;
  view: 'edit' | 'preview'; // Controlled from parent
  onSwitchToPreview: (updates: Partial<Omit<PrintRequest, 'id'>>) => void;
  onApplyVoucher: (requestId: string, voucherCode: string) => Promise<{ success: boolean; message: string; }>;
  bankAccounts: BankAccount[];
  currentUser: User;
  users: User[];
  navigateTo: (state: PageState) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
const parseCurrency = (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ request, onClose, onSave, view, onSwitchToPreview, onApplyVoucher, bankAccounts, currentUser, users, navigateTo }) => {
  const [additionalCosts, setAdditionalCosts] = useState<{ description: string; amount: number }[]>(request.additionalCosts || []);
  const [voucherCode, setVoucherCode] = useState(request.voucherCode || '');
  const [receivingAccountId, setReceivingAccountId] = useState(() => {
    const defaultAccount = bankAccounts.find(acc => acc.isDefault);
    return request.receivingAccountId || defaultAccount?.id || (bankAccounts[0]?.id || '');
  });
  const { showToast } = useToast();
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const baseTotal = request.manualOrderItems 
    ? request.manualOrderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    : (request.orderDetails.totalPrice || 0);
  
  const additionalTotal = additionalCosts.reduce((sum, item) => sum + item.amount, 0);
  const preDiscountTotal = baseTotal + additionalTotal;
  const totalAmount = preDiscountTotal - (request.discountAmount || 0);


  const handleAddCost = () => {
    setAdditionalCosts([...additionalCosts, { description: '', amount: 0 }]);
  };

  const handleCostChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newCosts = [...additionalCosts];
    if (field === 'amount') {
      newCosts[index][field] = typeof value === 'number' ? value : parseCurrency(value as string);
    } else {
      newCosts[index][field] = value as string;
    }
    setAdditionalCosts(newCosts);
  };
  
  const handleRemoveCost = (index: number) => {
      setAdditionalCosts(additionalCosts.filter((_, i) => i !== index));
  };

  const handleApplyVoucherClick = async () => {
    const result = await onApplyVoucher(request.id, voucherCode);
    showToast(result.message, result.success ? 'success' : 'error');
  };

  const handlePreview = () => {
    const invoiceId = request.invoiceId || `inv-${Date.now()}`;
     const updates: Partial<Omit<PrintRequest, 'id'>> = {
      totalAmount: preDiscountTotal, // Save pre-discount total
      additionalCosts: additionalCosts,
      invoiceId: invoiceId,
      receivingAccountId: receivingAccountId
    };
    onSwitchToPreview(updates); // Notify parent to save and switch view
  };

  const handleFinalSave = () => {
    // The final updates, including voucher effects, are already in the request state from the parent
    const updates: Partial<Omit<PrintRequest, 'id'>> = {
      workflowStatus: 'pending_print',
      paymentStatus: 'unpaid',
    };
    onSave(updates);

    // Automatically send QR code image to customer and payment screen
    const customer = users.find(u => u.zalo && u.zalo.trim() !== '' && u.zalo.trim() === request.orderDetails.customerInfo.zalo.trim());
    const paymentScreenUser = users.find(u => u.username === 'manhinhthanhtoan');
    
    if (customer && paymentScreenUser) {
        const bankInfo = bankAccounts.find(acc => acc.id === receivingAccountId);
        const finalTotal = (request.totalAmount || 0) - (request.discountAmount || 0);
        
        if(bankInfo && finalTotal > 0) {
            const qrCodeUrl = `https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.accountNumber}-compact2.png?amount=${finalTotal}&addInfo=${encodeURIComponent(`TT don hang ${request.id.slice(-6)}`)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
            
            const customerMessageContent = {
                text: `Hóa đơn #${request.id.slice(-6)} của bạn đã được tạo. Vui lòng quét mã QR để thanh toán số tiền ${formatCurrency(finalTotal)}đ.`,
                imageUrl: qrCodeUrl,
                invoiceId: request.id,
            };
            addMessage(currentUser.id, customer.id, customerMessageContent);

            const paymentScreenMessageContent = {
                text: `Hóa đơn #${request.id.slice(-6)} (${request.orderDetails.customerInfo.fullName}) | ${formatCurrency(finalTotal)}đ`,
                imageUrl: qrCodeUrl,
                invoiceId: request.id,
            };
            addMessage(currentUser.id, paymentScreenUser.id, paymentScreenMessageContent);
            
            showToast('Đã gửi hóa đơn đến khách hàng và màn hình thanh toán!', 'success');
            
            navigateTo({ page: 'community', selectedUserId: customer.id });
        }
    } else if (customer) { // Fallback if payment screen user is not found
        const bankInfo = bankAccounts.find(acc => acc.id === receivingAccountId);
        const finalTotal = (request.totalAmount || 0) - (request.discountAmount || 0);
        if(bankInfo && finalTotal > 0) {
            const qrCodeUrl = `https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.accountNumber}-compact2.png?amount=${finalTotal}&addInfo=${encodeURIComponent(`TT don hang ${request.id.slice(-6)}`)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
            
            const messageContent = {
                text: `Hóa đơn #${request.id.slice(-6)} của bạn đã được tạo. Vui lòng quét mã QR để thanh toán số tiền ${formatCurrency(finalTotal)}đ.`,
                imageUrl: qrCodeUrl,
                invoiceId: request.id
            };
            addMessage(currentUser.id, customer.id, messageContent);
            showToast('Đã gửi hóa đơn và mã QR qua tin nhắn cho khách hàng!', 'success');
            
            navigateTo({ page: 'community', selectedUserId: customer.id });
        }
    }

    onClose(); 
  };
  
  const getInvoiceLink = () => {
    const invoiceId = request.invoiceId || `inv-${Date.now()}`;
    return `${window.location.origin}${window.location.pathname}?page=invoice&invoiceId=${invoiceId}`;
  };

  const handleCopyLink = () => {
      const invoiceLink = getInvoiceLink();
      navigator.clipboard.writeText(invoiceLink).then(() => {
        showToast('Đã sao chép link hóa đơn!', 'success');
      }).catch(err => {
        console.error('Failed to copy link: ', err);
        showToast('Lỗi khi sao chép link.', 'error');
      });
  };

  const handleShareZalo = () => {
    const invoiceLink = getInvoiceLink();
    const zaloUrl = `https://sp.zalo.me/share_v2?url=${encodeURIComponent(invoiceLink)}`;
    window.open(zaloUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    const invoiceLink = getInvoiceLink();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(invoiceLink)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleDownloadImage = () => {
      const printContent = invoicePreviewRef.current;
      if (printContent) {
          const newWindow = window.open('', '', 'height=800,width=600');
          if (newWindow) {
              newWindow.document.write('<html><head><title>Hóa Đơn</title>');
              newWindow.document.write(`<style> body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #111; } .invoice-header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; } h1 { font-size: 1.5rem; margin: 0; } table { width: 100%; border-collapse: collapse; font-size: 0.9rem; } th, td { border-bottom: 1px solid #eee; padding: 8px; text-align: left; } th { background-color: #f9f9f9; } .total-section { text-align: right; margin-top: 20px; } .qr-section { text-align: center; margin-top: 20px; } img { max-width: 200px; margin: 0 auto; } </style>`);
              newWindow.document.write('</head><body>');
              newWindow.document.write(printContent.innerHTML);
              newWindow.document.write('</body></html>');
              newWindow.document.close();
              newWindow.focus();
              setTimeout(() => { newWindow.print(); }, 500);
          }
      }
  };

  const renderEditView = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">Tạo Hóa đơn cho Yêu cầu #{request.id.slice(-6)}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
        </header>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Chi tiết gốc</h3>
            <ul className="text-sm space-y-2 bg-slate-50 dark:bg-zinc-700/50 p-3 rounded-md">
                {[...(request.manualOrderItems || []), ...(request.freeProductItems || [])].map((item, i) => (
                  <li key={`item-${i}`}>
                    <strong>{item.quantity} x</strong> {item.productName} ({item.size})
                    <span className="text-slate-500"> - @ {formatCurrency(item.unitPrice)}</span>
                  </li>
                ))}
            </ul>
            <p className="text-right font-medium mt-2">Tạm tính: {formatCurrency(baseTotal)}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Chi phí phát sinh</h3>
            <div className="space-y-2">{additionalCosts.map((cost, index) => (<div key={index} className="flex items-center gap-2"><input type="text" placeholder="Mô tả" value={cost.description} onChange={e => handleCostChange(index, 'description', e.target.value)} className="flex-grow p-2 border rounded-md text-sm dark:bg-zinc-700 dark:border-zinc-600" /><input type="text" value={formatCurrency(cost.amount)} onChange={e => handleCostChange(index, 'amount', e.target.value)} className="w-32 p-2 border rounded-md text-sm text-right dark:bg-zinc-700 dark:border-zinc-600" /><button onClick={() => handleRemoveCost(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><XIcon className="w-5 h-5"/></button></div>))}</div>
            <button onClick={handleAddCost} className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">+ Thêm chi phí</button>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Áp dụng Voucher</h3>
            <div className="flex gap-2">
                <input type="text" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} placeholder="Nhập mã voucher..." className="flex-grow p-2 border rounded dark:bg-zinc-700" />
                <button onClick={handleApplyVoucherClick} className="px-4 py-2 bg-slate-200 dark:bg-zinc-600 text-sm font-semibold rounded hover:bg-slate-300">Áp dụng</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tài khoản nhận tiền</h3>
            <select value={receivingAccountId} onChange={e => setReceivingAccountId(e.target.value)} className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
              {bankAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {BANKS.find(b => b.bin === acc.bankBin)?.name} - {acc.accountNumber} {acc.isDefault ? '(Mặc định)' : ''}
                </option>
              ))}
            </select>
          </div>

        </div>

        <footer className="p-4 border-t border-slate-200 dark:border-zinc-700 flex justify-between items-center">
            <div>
                {request.discountAmount && <p className="text-sm text-green-600">Giảm giá: -{formatCurrency(request.discountAmount)}</p>}
                <span className="text-sm">Tổng cộng:</span>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalAmount)}</p>
            </div>
          <button onClick={handlePreview} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Lưu & Xem trước Hóa đơn</button>
        </footer>
      </div>
    </div>
  );

  const renderPreviewView = () => {
    const bankInfo = bankAccounts.find(acc => acc.id === request.receivingAccountId);
    const finalTotal = (request.totalAmount || 0) - (request.discountAmount || 0);
    const qrCodeUrl = bankInfo
        ? `https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.accountNumber}-compact2.png?amount=${finalTotal}&addInfo=${encodeURIComponent(`TT don hang ${request.id.slice(-6)}`)}&accountName=${encodeURIComponent(bankInfo.accountName)}`
        : null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Xem trước & Gửi Hóa đơn</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6 max-h-[70vh] overflow-y-auto" ref={invoicePreviewRef}>
                    <div className="text-center border-b pb-4 mb-4"><h1 className="text-xl font-bold">HÓA ĐƠN</h1><p className="text-sm text-slate-500">Thảo Anh Photo Lab</p><p className="text-xs text-slate-500">Mã YC: #{request.id.slice(-6)}</p></div>
                    <div className="text-sm space-y-1 mb-4"><p><strong>Khách hàng:</strong> {request.orderDetails.customerInfo.fullName}</p><p><strong>Zalo:</strong> {request.orderDetails.customerInfo.zalo}</p></div>
                    <table className="w-full text-sm"><thead><tr className="bg-slate-50 dark:bg-zinc-700"><th className="p-2 font-semibold text-left">Sản phẩm</th><th className="p-2 font-semibold text-right">Thành tiền</th></tr></thead>
                        <tbody>
                            {[...(request.manualOrderItems || []), ...(request.freeProductItems || [])].map((item, i) => (<tr key={`item-${i}`}><td className="p-2">{item.quantity} x {item.productName} ({item.size})</td><td className="p-2 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td></tr>))}
                            {request.additionalCosts?.map((cost, i) => (<tr key={`c-${i}`}><td className="p-2">{cost.description}</td><td className="p-2 text-right">{formatCurrency(cost.amount)}</td></tr>))}
                            {request.discountAmount && <tr><td className="p-2 text-green-600">Voucher giảm giá</td><td className="p-2 text-right text-green-600">-{formatCurrency(request.discountAmount)}</td></tr>}
                        </tbody>
                    </table>
                    <div className="text-right border-t pt-4 mt-4"><p className="text-lg font-bold">TỔNG CỘNG: {formatCurrency(finalTotal)}</p></div>
                    <div className="text-center mt-6">{qrCodeUrl ? (<><img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 mx-auto" /><p className="text-xs flex items-center justify-center gap-1 mt-2"><VietQRIcon className="w-4 h-4"/> Quét mã để thanh toán</p></>) : (<p className="text-xs text-red-500">Chưa cấu hình QR.</p>)}</div>
                </div>
                <footer className="p-4 border-t space-y-3"><div className="grid grid-cols-2 lg:grid-cols-4 gap-2"><button onClick={handleCopyLink} className="w-full py-2 px-3 bg-slate-200 dark:bg-zinc-700 text-sm font-semibold rounded-md hover:bg-slate-300 flex items-center justify-center gap-2"><CopyIcon className="w-4 h-4"/> Link</button><button onClick={handleShareZalo} className="w-full py-2 px-3 bg-[#0068FF] text-white text-sm font-semibold rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"><ZaloIcon className="w-4 h-4"/> Zalo</button><button onClick={handleShareFacebook} className="w-full py-2 px-3 bg-[#1877F2] text-white text-sm font-semibold rounded-md hover:bg-blue-800 flex items-center justify-center gap-2"><FacebookIcon className="w-4 h-4"/> Facebook</button><button onClick={handleDownloadImage} className="w-full py-2 px-3 bg-slate-200 dark:bg-zinc-700 text-sm font-semibold rounded-md hover:bg-slate-300 flex items-center justify-center gap-2"><PrinterIcon className="w-4 h-4"/> Tải/In</button></div><button onClick={handleFinalSave} className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Hoàn tất & Chuyển đến Sản xuất</button></footer>
            </div>
        </div>
    );
  }

  return view === 'preview' ? renderPreviewView() : renderEditView();
};