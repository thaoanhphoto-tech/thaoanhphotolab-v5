import React, { useState, useEffect } from 'react';
import { User, PrintOrderDetails, PrintRequest, getPrintRequests, PrintLayoutDetail, getPrintPrices } from '../userStore';
import type { PageState } from '../App';
import { XIcon } from './icons/XIcon';
import { useToast } from './Toast';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface PrintOrderPageProps {
  // For modal mode (user submission)
  imageUrl?: string;
  sourceTool?: string;
  currentUser?: User | null;
  onClose?: () => void;
  onSubmit?: (orderDetails: PrintOrderDetails) => void;

  // For page mode (admin view)
  requestId?: string;
  navigateTo?: (state: PageState) => void;
}

export const PrintOrderPage: React.FC<PrintOrderPageProps> = ({
  imageUrl,
  sourceTool,
  currentUser,
  onClose,
  onSubmit,
  requestId,
  navigateTo,
}) => {
  const { showToast } = useToast();
  const [layouts, setLayouts] = useState<PrintLayoutDetail[]>([{ type: '4x6_sheet', quantity: 1, customDescription: '' }]);
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerZalo, setCustomerZalo] = useState(currentUser?.zalo || '');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [prices] = useState(getPrintPrices());

  const [request, setRequest] = useState<PrintRequest | null>(null);

  useEffect(() => {
    if (requestId) {
      const requests = getPrintRequests();
      const foundRequest = requests.find(r => r.id === requestId);
      if (foundRequest) {
        setRequest(foundRequest);
      }
    }
  }, [requestId]);

  const handleLayoutChange = (index: number, field: keyof PrintLayoutDetail, value: string | number) => {
    const newLayouts = [...layouts];
    (newLayouts[index] as any)[field] = value;
    setLayouts(newLayouts);
  };

  const addLayout = () => {
    setLayouts([...layouts, { type: 'custom', quantity: 1, customDescription: '' }]);
  };

  const removeLayout = (index: number) => {
    if (layouts.length > 1) {
      setLayouts(layouts.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return layouts.reduce((total, layout) => {
      const price = prices[layout.type] || 0;
      return total + (price * layout.quantity);
    }, 0);
  };

  const handleSubmit = () => {
    if (!customerName || !customerZalo) {
      showToast('Vui lòng nhập họ tên và Zalo.', 'error');
      return;
    }
    const orderDetails: PrintOrderDetails = {
      customerInfo: {
        fullName: customerName,
        zalo: customerZalo,
        address: address,
      },
      layouts,
      notes,
      totalPrice: calculateTotal(),
    };
    if (onSubmit) {
      onSubmit(orderDetails);
    }
  };

  // Admin page view
  if (requestId) {
    if (!request) {
      return (
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-red-600">Không tìm thấy yêu cầu in</h2>
          <button onClick={() => navigateTo && navigateTo({ page: 'print_queue' })} className="mt-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Quay lại Hàng đợi
          </button>
        </div>
      );
    }
    return (
      <main className="container mx-auto px-4 py-12">
        <button
          onClick={() => navigateTo && navigateTo({ page: 'print_queue' })}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Quay lại Hàng đợi
        </button>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-4">Chi tiết Yêu cầu In</h1>
                <img src={request.imageUrl} alt="Print request" className="w-full h-auto object-cover rounded-md mb-4" />
            </div>
            <div className="space-y-4">
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Thông tin khách hàng</h3>
                    <div className="text-sm space-y-1 bg-slate-50 dark:bg-zinc-700/50 p-3 rounded-md">
                        <p><strong>Khách hàng:</strong> {request.orderDetails.customerInfo.fullName}</p>
                        <p><strong>Zalo:</strong> {request.orderDetails.customerInfo.zalo}</p>
                        <p><strong>Địa chỉ:</strong> {request.orderDetails.customerInfo.address || 'Chưa cung cấp'}</p>
                        <p><strong>Từ công cụ:</strong> {request.sourceTool}</p>
                        <p><strong>Ngày gửi:</strong> {new Date(request.timestamp).toLocaleString('vi-VN')}</p>
                    </div>
                 </div>
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Quy cách in</h3>
                    <ul className="text-sm space-y-2 bg-slate-50 dark:bg-zinc-700/50 p-3 rounded-md">
                        {request.orderDetails.layouts.map((l, i) => (
                             <li key={i}>
                                <strong>{l.quantity} x</strong> {
                                    l.type === '4x6_sheet' ? 'Tờ 4x6 (4 ảnh 4x6)' :
                                    l.type === '3x4_sheet' ? 'Tờ 3x4 (9 ảnh 3x4)' :
                                    `Khác: ${l.customDescription}`
                                }
                            </li>
                        ))}
                    </ul>
                 </div>
                 {request.orderDetails.notes && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Ghi chú</h3>
                         <p className="text-sm bg-slate-50 dark:bg-zinc-700/50 p-3 rounded-md whitespace-pre-wrap">{request.orderDetails.notes}</p>
                      </div>
                 )}
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Thanh toán</h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('vi-VN').format(request.orderDetails.totalPrice || 0)}đ</p>
                 </div>
            </div>
        </div>
      </main>
    );
  }

  // User submission modal view
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl relative text-slate-800 dark:text-zinc-200" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700" aria-label="Đóng"><XIcon className="w-6 h-6 text-slate-500 dark:text-zinc-400" /></button>
        <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Gửi Yêu cầu In ảnh</h2>
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                     <img src={imageUrl} alt="Ảnh cần in" className="w-full h-auto object-contain rounded-md border border-slate-200 dark:border-zinc-700"/>
                     <h3 className="font-semibold">Thông tin khách hàng</h3>
                     <div>
                        <label className="text-sm font-medium">Họ và Tên <span className="text-red-500">*</span></label>
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600" />
                     </div>
                     <div>
                        <label className="text-sm font-medium">Số Zalo <span className="text-red-500">*</span></label>
                        <input type="text" value={customerZalo} onChange={e => setCustomerZalo(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600" />
                     </div>
                     <div>
                        <label className="text-sm font-medium">Địa chỉ Giao hàng (Tùy chọn)</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600" placeholder="Nhập địa chỉ của bạn..."/>
                     </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold">Quy cách in</h3>
                    {layouts.map((layout, index) => (
                        <div key={index} className="flex items-end gap-2 p-3 bg-slate-50 dark:bg-zinc-700/50 rounded-md border border-slate-200 dark:border-zinc-700">
                             <div className="flex-grow">
                                <label className="text-xs font-medium">Loại</label>
                                <select value={layout.type} onChange={e => handleLayoutChange(index, 'type', e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-600 text-sm">
                                    <option value="4x6_sheet">Tờ 4x6 (4 ảnh 4x6)</option>
                                    <option value="3x4_sheet">Tờ 3x4 (9 ảnh 3x4)</option>
                                    <option value="custom">Khác</option>
                                </select>
                             </div>
                             <div className="w-20">
                                 <label className="text-xs font-medium">Số lượng</label>
                                 <input type="number" min="1" value={layout.quantity} onChange={e => handleLayoutChange(index, 'quantity', parseInt(e.target.value, 10))} className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-600 text-sm" />
                             </div>
                             <button onClick={() => removeLayout(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md" disabled={layouts.length <= 1}>
                                <XIcon className="w-5 h-5"/>
                             </button>
                        </div>
                    ))}
                    {layouts.some(l => l.type === 'custom') && (
                        <div>
                             <label className="text-sm font-medium">Mô tả quy cách 'Khác'</label>
                             <textarea value={layouts.find(l => l.type === 'custom')?.customDescription || ''} onChange={e => handleLayoutChange(layouts.findIndex(l => l.type === 'custom'), 'customDescription', e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600" rows={2} placeholder="Ví dụ: in 1 ảnh 20x30cm ép gỗ"></textarea>
                        </div>
                    )}
                    <button onClick={addLayout} className="text-sm font-semibold text-blue-600 hover:underline">+ Thêm quy cách</button>

                     <div>
                        <label className="text-sm font-medium">Ghi chú thêm</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600" rows={3} placeholder="Ví dụ: Chỉnh ảnh sáng hơn một chút..."></textarea>
                     </div>
                     <div className="pt-4 border-t border-slate-200 dark:border-zinc-700">
                         <p className="text-sm">Tổng cộng (ước tính):</p>
                         <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('vi-VN').format(calculateTotal())}đ</p>
                         <p className="text-xs text-slate-500">(Giá chính xác sẽ được báo lại qua Zalo)</p>
                     </div>
                </div>
             </div>
        </div>
        <div className="bg-slate-50 dark:bg-zinc-800/50 px-6 py-4 rounded-b-xl border-t border-slate-200 dark:border-zinc-700">
            <button onClick={handleSubmit} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                Gửi Yêu Cầu In
            </button>
        </div>
      </div>
    </div>
  );
};