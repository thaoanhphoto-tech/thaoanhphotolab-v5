import React, { useState, useEffect } from 'react';
import { getPrintRequests, savePrintRequests, PrintRequest } from '../userStore';
import type { PageState } from '../App';
import { EyeIcon } from './icons/EyeIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface PrintQueuePageProps {
  navigateTo: (state: PageState) => void;
}

export const PrintQueuePage: React.FC<PrintQueuePageProps> = ({ navigateTo }) => {
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'viewed' | 'completed'>('new');

  useEffect(() => {
    const allRequests = getPrintRequests();
    // Mark new requests as viewed when the page is loaded
    const updatedRequests = allRequests.map(req => {
        if (req.status === 'new') {
            return { ...req, status: 'viewed' as PrintRequest['status'] };
        }
        return req;
    });
    setRequests(updatedRequests);
    savePrintRequests(updatedRequests);
}, []);

  const handleStatusChange = (id: string, newStatus: PrintRequest['status']) => {
    const updatedRequests = requests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
    savePrintRequests(updatedRequests);
  };

  const handleDownload = (req: PrintRequest) => {
    if (!req.imageUrl) return;

    // Sanitize filename parts to be URL-friendly
    const customerName = (req.orderDetails?.customerInfo.fullName || 'khach_hang').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const zaloNumber = req.orderDetails?.customerInfo.zalo || 'khong_co_sdt';
    
    const filename = `${customerName}_${zaloNumber}.png`;

    const link = document.createElement('a');
    link.href = req.imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const filteredRequests = requests.filter(req => filter === 'all' || req.status === filter);

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-zinc-100 mb-6">Hàng đợi In ảnh</h1>

      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-zinc-700 pb-4">
        <FilterButton active={filter === 'new'} onClick={() => setFilter('new')}>Mới ({requests.filter(r => r.status === 'new').length})</FilterButton>
        <FilterButton active={filter === 'viewed'} onClick={() => setFilter('viewed')}>Đã xem</FilterButton>
        <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')}>Đã hoàn thành</FilterButton>
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Tất cả</FilterButton>
      </div>

      <div className="space-y-4">
        {filteredRequests.length > 0 ? filteredRequests.map(req => (
          <div key={req.id} className="grid grid-cols-1 md:grid-cols-[10rem_1fr_12rem] gap-4 items-start bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700">
            <img src={req.imageUrl} alt="Print request" className="w-full md:w-40 h-40 object-cover rounded-md" />
            
            <div className="text-sm space-y-1">
              <p className="font-semibold text-slate-800 dark:text-zinc-100">{req.orderDetails?.customerInfo.fullName || req.username}</p>
              <p className="text-slate-500 dark:text-zinc-400"><strong>Zalo:</strong> {req.orderDetails?.customerInfo.zalo}</p>
              <p className="text-slate-500 dark:text-zinc-400"><strong>Tool:</strong> {req.sourceTool}</p>
              <p className="text-slate-500 dark:text-zinc-400"><strong>Ngày:</strong> {new Date(req.timestamp).toLocaleString('vi-VN')}</p>
              <p className={`font-bold text-xs inline-block px-2 py-0.5 rounded-full ${
                req.status === 'new' ? 'bg-red-100 text-red-800' :
                req.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>{req.status.toUpperCase()}</p>

              {req.orderDetails && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-zinc-700 text-xs text-slate-500 dark:text-zinc-400">
                    <p className="font-semibold text-slate-600 dark:text-zinc-300">Quy cách:</p>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                        {req.orderDetails.layouts?.map((l, i) => (
                             <li key={i}>
                                <strong>{l.quantity} x</strong> {
                                    l.type === '4x6_sheet' ? '1 sheet (tờ giấy) = (4 ảnh 4x6)' :
                                    l.type === '3x4_sheet' ? '1 sheet (tờ giấy) = (9 ảnh 3x4)' :
                                    `Khác: ${l.customDescription}`
                                }
                            </li>
                        ))}
                    </ul>
                    {req.orderDetails.notes && <p className="mt-1 truncate"><strong>Ghi chú:</strong> {req.orderDetails.notes}</p>}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigateTo({ page: 'print_order', requestId: req.id })}
                className="w-full px-3 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm hover:bg-blue-700"
              >
                Xem chi tiết
              </button>
               <button
                onClick={() => handleDownload(req)}
                className="w-full px-3 py-2 bg-green-600 text-white font-semibold rounded-md text-sm hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" /> Tải về in
              </button>
              {req.status === 'new' && (
                <button 
                  onClick={() => handleStatusChange(req.id, 'viewed')}
                  className="w-full px-3 py-2 bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-200 font-semibold rounded-md text-sm hover:bg-slate-300 flex items-center justify-center gap-2"
                >
                  <EyeIcon className="w-4 h-4" /> Đánh dấu đã xem
                </button>
              )}
               {req.status === 'viewed' && (
                <button 
                  onClick={() => handleStatusChange(req.id, 'completed')}
                  className="w-full px-3 py-2 bg-purple-500 text-white font-semibold rounded-md text-sm hover:bg-purple-600 flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-4 h-4" /> Hoàn thành
                </button>
              )}
            </div>
          </div>
        )) : (
          <p className="text-center py-10 text-slate-500 dark:text-zinc-400">Không có yêu cầu nào trong mục này.</p>
        )}
      </div>
    </main>
  );
};

const FilterButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
            active 
            ? 'bg-blue-600 text-white' 
            : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
        }`}
    >
        {children}
    </button>
);