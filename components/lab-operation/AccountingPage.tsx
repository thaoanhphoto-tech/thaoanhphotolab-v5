import React, { useState, useMemo, lazy, Suspense } from 'react';
import { PrintRequest, User, OrderSourceChannel, ManualOrderItem, addPrintRequest, PaymentStatus, BankAccount, getUsers, OPERATIONAL_ROLE_NAMES } from '../../userStore';
import { PageState } from '../../App';
import { InvoiceModal } from './InvoiceModal';
import { CreateOrderModal } from './CreateOrderModal';
import { PricingTable } from '../../pricingStore';
import { PaymentVerificationModal } from './PaymentVerificationModal';
import { Product } from '../../productStore';
import { loadImageContent } from '../../contentStore';
import { addMessage } from '../../chatStore';
import { CalculatorIcon } from '../icons/CalculatorIcon';
import { Loader } from '../Loader';
import { Expense } from '../../expenseStore';
import { Material, ProductBOM } from '../../inventoryStore';

const TaxAiAssistant = lazy(() => import('./TaxAiAssistant'));


interface AccountingPageProps {
  currentUser: User;
  requests: PrintRequest[];
  onUpdateRequest: (requestId: string, updates: Partial<Omit<PrintRequest, 'id'>>, actionDescription: string) => void;
  navigateTo: (state: PageState) => void;
  onRefreshRequests: () => void;
  prices: PricingTable;
  users: User[];
  products: Product[];
  onApplyVoucher: (requestId: string, voucherCode: string) => Promise<{ success: boolean; message: string; }>;
  bankAccounts: BankAccount[];
  expenses: Expense[];
  materials: Material[];
  productBOMs: ProductBOM[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

type FilterType = 'today' | 'this_week' | 'this_month' | 'custom';

// New function to generate the entire report HTML dynamically
const generateReportHTML = (
    customer: User | { fullName: string, zalo: string, points?: number }, 
    invoices: PrintRequest[], 
    allUsers: User[],
    logoUrl: string | null,
    allBankAccounts: BankAccount[]
): string => {
    const totalDebt = invoices.reduce((sum, inv) => sum + ((inv.totalAmount || 0) - (inv.amountPaid || 0)), 0);
    const bankInfo = allBankAccounts.find(acc => acc.isDefault) || allBankAccounts[0] || null;
    
    const qrCodeUrl = bankInfo && totalDebt > 0
    ? `https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.accountNumber}-compact2.png?amount=${totalDebt}&addInfo=${encodeURIComponent(`TT Cong No ${customer.fullName || customer.zalo}`)}&accountName=${encodeURIComponent(bankInfo.accountName)}`
    : null;

    const findUserByRole = (role: string) => allUsers.find(u => u.operationalRole === role);
    const keToan = findUserByRole('ke_to_an');
    const giamDoc = findUserByRole('giam_doc');
    const tongGiamDoc = findUserByRole('tong_giam_doc');


    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Báo Cáo Công Nợ - ${customer.fullName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');
            body { font-family: 'Roboto', sans-serif; background-color: #f1f5f9; color: #1e293b; }
            .report-container { max-width: 800px; margin: 2rem auto; padding: 2.5rem; background-color: white; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); border-radius: 0.5rem; position: relative; overflow: hidden; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); opacity: 0.08; pointer-events: none; width: 60%; z-index: 0; }
            table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
            th, td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; }
            thead { background-color: #f1f5f9; }
            .content-wrapper { position: relative; z-index: 1; }
            .no-print { display: block; }
            @media print {
                body { background-color: white; }
                .report-container { margin: 0; padding: 0; box-shadow: none; border-radius: 0; }
                .no-print { display: none; }
                @page { size: A4; margin: 20mm; }
            }
        </style>
    </head>
    <body>
        <div class="report-container">
            ${logoUrl ? `<img src="${logoUrl}" alt="Watermark" class="watermark" />` : ''}
             <div class="no-print mb-6 flex justify-end gap-2">
                 <button onclick="window.print()" class="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">In / Lưu PDF</button>
             </div>
             <div class="content-wrapper">
                <header class="pb-4 mb-6 border-b">
                    <div class="flex justify-between items-start">
                        <div class="w-1/4">
                            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="w-28 h-28 object-contain"/>` : ''}
                        </div>
                        <div class="w-3/4 text-center">
                            <h2 class="font-black text-lg uppercase tracking-wide">TRUNG TÂM IN ẢNH KỸ THUẬT SỐ CÔNG NGHỆ MỚI<br/>THẢO ANH PHOTO LAB</h2>
                            <div class="text-xs mt-2 text-left inline-block">
                                <p><strong>CS1:</strong> 89b Chi Lăng, cạnh Đại học Hồng Đức</p>
                                <p><strong>CS2:</strong> 244 Ngọc Mai, cạnh Đại học Hồng Đức</p>
                                <p><strong>ĐT:</strong> 0978983136 - <strong>Zalo nhận file:</strong> 0396670118</p>
                                <p><strong>Gmail:</strong> thaoanhphotolabpro@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </header>
                <section class="my-8">
                    <h1 class="text-3xl font-black text-center mb-6">BÁO CÁO CÔNG NỢ CHI TIẾT</h1>
                    <div class="text-sm">
                        <p><strong>Khách hàng:</strong> ${customer.fullName || 'Khách lẻ'}</p>
                        <p><strong>Zalo:</strong> ${customer.zalo}</p>
                        <p><strong>Ngày báo cáo:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </section>
                <section>
                    <table>
                        <thead><tr><th>Ngày</th><th>Mã ĐH</th><th>Nội dung</th><th class="text-right">Phát sinh Nợ</th><th class="text-right">Đã thanh toán</th><th class="text-right">Dư nợ cuối kỳ</th></tr></thead>
                        <tbody>
                            ${invoices.map(inv => {
                                const debt = (inv.totalAmount || 0) - (inv.amountPaid || 0);
                                const content = inv.manualOrderItems?.map(i => `${i.quantity}x ${i.productName}`).join(', ') || inv.sourceTool;
                                return `<tr>
                                    <td>${new Date(inv.timestamp).toLocaleDateString('vi-VN')}</td>
                                    <td>#${inv.id.slice(-6)}</td>
                                    <td>${content}</td>
                                    <td class="text-right">${formatCurrency(inv.totalAmount || 0)}</td>
                                    <td class="text-right">${formatCurrency(inv.amountPaid || 0)}</td>
                                    <td class="text-right font-semibold">${formatCurrency(debt)}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </section>
                <section class="grid grid-cols-2 gap-8 mt-8">
                    <div class="flex flex-col justify-end">
                        <div class="text-left pt-4">
                            <p class="font-semibold text-lg">TỔNG CÔNG NỢ CUỐI KỲ:</p>
                            <p class="text-4xl font-black text-red-600">${formatCurrency(totalDebt)}</p>
                        </div>
                    </div>
                    <div class="text-center">${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR Code" class="w-40 h-40 object-contain mx-auto" /><p class="text-xs mt-2">Quét mã để thanh toán toàn bộ công nợ</p>` : ''}</div>
                </section>
                <section class="mt-8 pt-6 border-t border-dashed text-center">
                     <h3 class="font-semibold text-sm uppercase text-teal-600">Thông tin Thành viên Thân thiết</h3>
                     <p class="mt-2 text-lg">Điểm tích lũy hiện tại: <strong class="text-2xl text-blue-600">${customer.points || 0} điểm</strong></p>
                     <p class="text-xs text-slate-500 mt-2">Bạn có thể dùng điểm để đổi voucher giảm giá hoặc sản phẩm miễn phí tại trang "Tài khoản của tôi".</p>
                </section>
                <footer class="mt-20 pt-10 grid grid-cols-3 gap-8 text-center text-sm font-semibold">
                    <div><p>Kế toán</p><p class="mt-1 text-xs">(Ký, ghi rõ họ tên)</p><p class="mt-12 font-bold">${keToan?.fullName || '....................'}</p></div>
                    <div><p>Giám đốc điều hành</p><p class="mt-1 text-xs">(Ký, ghi rõ họ tên)</p><p class="mt-12 font-bold">${giamDoc?.fullName || '....................'}</p></div>
                    <div><p>Tổng giám đốc</p><p class="mt-1 text-xs">(Ký, ghi rõ họ tên)</p><p class="mt-12 font-bold">${tongGiamDoc?.fullName || '....................'}</p></div>
                </footer>
            </div>
        </div>
    </body>
    </html>
    `;
};


export const AccountingPage: React.FC<AccountingPageProps> = ({ currentUser, requests, onUpdateRequest, navigateTo, onRefreshRequests, prices, users, products, onApplyVoucher, bankAccounts, expenses, materials, productBOMs }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tax_ai'>('overview');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceModalView, setInvoiceModalView] = useState<'edit' | 'preview'>('edit');
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PrintRequest | null>(null);
  
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verifyingRequest, setVerifyingRequest] = useState<PrintRequest | null>(null);

  const [filterType, setFilterType] = useState<FilterType>('this_month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [debtSearchTerm, setDebtSearchTerm] = useState('');

  const filteredInvoices = useMemo(() => {
    const allInvoices = requests.filter(r => r.workflowStatus !== 'new');
    const now = new Date();
    
    let startTime = 0;
    let endTime = Infinity;

    switch (filterType) {
        case 'today':
            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            break;
        case 'this_week':
            const firstDayOfWeek = now.getDate() - now.getDay();
            startTime = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek).getTime();
            break;
        case 'this_month':
            startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            break;
        case 'custom':
            if (customRange.start) {
                startTime = new Date(customRange.start).getTime();
            }
            if (customRange.end) {
                endTime = new Date(customRange.end).setHours(23, 59, 59, 999);
            }
            break;
    }
    return allInvoices.filter(r => r.timestamp >= startTime && r.timestamp <= endTime);
  }, [requests, filterType, customRange]);

  const summary = useMemo(() => {
    const revenue = filteredInvoices
        .filter(r => r.paymentStatus === 'paid' && r.workflowStatus === 'archived')
        .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    const debt = filteredInvoices
        .filter(r => (r.paymentStatus === 'unpaid' || r.paymentStatus === 'partially_paid') && r.workflowStatus !== 'archived')
        .reduce((sum, r) => sum + ((r.totalAmount || 0) - (r.amountPaid || 0)), 0);
        
    return {
        revenue,
        debt,
        orderCount: filteredInvoices.length,
    };
  }, [filteredInvoices]);

  const debtByCustomer = useMemo(() => {
    const debtMap = new Map<string, { totalDebt: number; invoices: PrintRequest[], customer: User | {fullName: string, zalo: string, points?: number} }>();

    filteredInvoices
        .filter(r => (r.paymentStatus === 'unpaid' || r.paymentStatus === 'partially_paid') && r.workflowStatus !== 'archived')
        .forEach(invoice => {
            const customerZalo = invoice.orderDetails.customerInfo.zalo;
            if (!debtMap.has(customerZalo)) {
                const user = users.find(u => u.zalo === customerZalo);
                debtMap.set(customerZalo, { totalDebt: 0, invoices: [], customer: user || invoice.orderDetails.customerInfo });
            }
            const customerData = debtMap.get(customerZalo)!;
            const debtAmount = (invoice.totalAmount || 0) - (invoice.amountPaid || 0);
            customerData.totalDebt += debtAmount;
            customerData.invoices.push(invoice);
        });

    return Array.from(debtMap.values())
        .filter(c => c.customer.fullName.toLowerCase().includes(debtSearchTerm.toLowerCase()))
        .sort((a, b) => b.totalDebt - a.totalDebt);

  }, [filteredInvoices, debtSearchTerm, users]);

  const newRequests = useMemo(() => requests.filter(r => r.workflowStatus === 'new'), [requests]);

  const handleCreateInvoice = (request: PrintRequest) => {
    setSelectedRequest(request);
    setInvoiceModalView('edit');
    setIsInvoiceModalOpen(true);
  };
  
  const handleOpenVerification = (request: PrintRequest) => {
    setVerifyingRequest(request);
    setIsVerificationModalOpen(true);
  };

  const handleVerificationConfirm = (requestId: string, amountPaid: number) => {
      const requestToUpdate = requests.find(r => r.id === requestId);
      if (requestToUpdate) {
          let newStatus: PaymentStatus = 'paid';
          let newAmountPaid = (requestToUpdate.amountPaid || 0) + amountPaid;
          const totalAmount = requestToUpdate.totalAmount || 0;

          if (newAmountPaid < totalAmount) {
              newStatus = 'partially_paid';
          } else {
              newAmountPaid = totalAmount; // Cap at total amount
          }
          
          const updates: Partial<Omit<PrintRequest, 'id'>> = { 
              paymentStatus: newStatus, 
              amountPaid: newAmountPaid 
          };
          
          onUpdateRequest(
              requestId, 
              updates,
              `Xác thực thanh toán: ${formatCurrency(amountPaid)}đ`
          );
      }
      setIsVerificationModalOpen(false);
      setVerifyingRequest(null);
  };
  
  const handleCreateManualOrder = (
    customerInfo: { fullName: string; zalo: string; address?: string },
    sourceChannel: OrderSourceChannel,
    items: ManualOrderItem[],
    notes: string,
    files: string[],
    fileStorageLocation: string,
    referringEmployeeId?: string
  ) => {
    addPrintRequest({
        username: currentUser.username,
        sourceTool: 'Thủ công',
        sourceChannel,
        orderDetails: { customerInfo, notes },
        manualOrderItems: items,
        customerFileUrls: files,
        fileStorageLocation: fileStorageLocation,
        totalAmount: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        referringEmployeeId: referringEmployeeId,
    });
    onRefreshRequests(); 
    setIsCreateOrderModalOpen(false);
  };
  
  const handleInvoiceSaveAndPreview = (updates: Partial<Omit<PrintRequest, 'id'>>) => {
      if (!selectedRequest) return;

      onUpdateRequest(selectedRequest.id, updates, "Đã tạo Hóa đơn");
      
      const updatedRequest = { ...selectedRequest, ...updates };
      setSelectedRequest(updatedRequest); 
      setInvoiceModalView('preview');

      // Send invoice message to customer
      const customer = users.find(u => u.zalo && u.zalo.trim() !== '' && u.zalo.trim() === updatedRequest.orderDetails.customerInfo.zalo.trim());
      if(customer) {
        const totalAmount = (updatedRequest.totalAmount || 0) - (updatedRequest.discountAmount || 0);
        const messageText = `[Hóa đơn mới] Chào ${customer.fullName}, hóa đơn #${updatedRequest.id.slice(-6)} với tổng số tiền ${formatCurrency(totalAmount)}đ đã được tạo cho bạn.`;
        addMessage(currentUser.id, customer.id, { text: messageText });
      }
  };

  const handleExportReport = (customer: User | { fullName: string, zalo: string, points?: number }, invoices: PrintRequest[]) => {
    const logoUrl = loadImageContent('app_logo', 'https://lh3.googleusercontent.com/d/1SJiuZBOBSX6umhPp7QxbDNXJXsG6SOEL');
    const reportHTML = generateReportHTML(customer, invoices, users, logoUrl, bankAccounts);
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(reportHTML);
        newWindow.document.close();
    }
  };


  const FilterButton: React.FC<{ type: FilterType, children: React.ReactNode }> = ({ type, children }) => (
    <button onClick={() => setFilterType(type)} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${filterType === type ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300'}`}>{children}</button>
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
        <div className="flex border-b border-slate-200 dark:border-zinc-700">
            <TabButton name="Tổng quan" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <TabButton name="Báo cáo Thuế (AI)" icon={<CalculatorIcon className="w-5 h-5 mr-2"/>} isActive={activeTab === 'tax_ai'} onClick={() => setActiveTab('tax_ai')} />
        </div>
        
        {activeTab === 'overview' && (
            <>
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <FilterButton type="today">Hôm nay</FilterButton>
                  <FilterButton type="this_week">Tuần này</FilterButton>
                  <FilterButton type="this_month">Tháng này</FilterButton>
                  <FilterButton type="custom">Tùy chọn</FilterButton>
                  {filterType === 'custom' && (
                    <div className="flex items-center gap-2 text-sm">
                      <input type="date" value={customRange.start} onChange={e => setCustomRange(p => ({...p, start: e.target.value}))} className="p-1 border rounded dark:bg-zinc-700"/>
                      <span>-</span>
                      <input type="date" value={customRange.end} onChange={e => setCustomRange(p => ({...p, end: e.target.value}))} className="p-1 border rounded dark:bg-zinc-700"/>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard title="Tổng Doanh thu" value={formatCurrency(summary.revenue)} color="text-green-600 dark:text-green-400" />
                    <SummaryCard title="Tổng Công nợ" value={formatCurrency(summary.debt)} color="text-red-600 dark:text-red-400" />
                    <SummaryCard title="Số đơn hàng" value={summary.orderCount.toString()} color="text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Yêu cầu in Mới ({newRequests.length})</h2>
                      <button onClick={() => setIsCreateOrderModalOpen(true)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md text-sm hover:bg-green-700">Tạo Đơn Hàng Mới</button>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden max-h-96 overflow-y-auto">
                      {newRequests.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-zinc-700">
                          {newRequests.map(req => (
                            <li key={req.id} className="p-3 flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{req.orderDetails.customerInfo.fullName}</p>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">Từ: {req.sourceChannel || req.sourceTool} - {new Date(req.timestamp).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <button onClick={() => handleCreateInvoice(req)} className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-md text-xs hover:bg-blue-700">Tạo Hóa đơn</button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="p-4 text-center text-slate-500 dark:text-zinc-400">Không có yêu cầu mới.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-4">Công nợ Chi tiết ({debtByCustomer.length})</h2>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow max-h-96 overflow-y-auto">
                        <input type="search" placeholder="Tìm khách hàng..." value={debtSearchTerm} onChange={e => setDebtSearchTerm(e.target.value)} className="w-full p-2 border-b dark:bg-zinc-800 dark:border-zinc-700" />
                        {debtByCustomer.length > 0 ? (
                            <ul className="divide-y divide-slate-200 dark:divide-zinc-700">
                                {debtByCustomer.map(customerData => (
                                     <li key={customerData.customer.zalo} className="p-3">
                                        <details>
                                            <summary className="font-semibold cursor-pointer flex justify-between items-center">
                                                <span>{customerData.customer.fullName}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-red-500">{formatCurrency(customerData.totalDebt)}đ</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleExportReport(customerData.customer, customerData.invoices);
                                                        }}
                                                        className="text-xs font-semibold bg-slate-200 dark:bg-zinc-600 text-slate-700 dark:text-slate-200 px-2 py-1 rounded hover:bg-slate-300"
                                                    >
                                                        Xuất Báo Cáo
                                                    </button>
                                                </div>
                                            </summary>
                                            <ul className="mt-2 pl-4 text-xs space-y-1">
                                                {customerData.invoices.map(inv => (
                                                    <li key={inv.id} className="flex justify-between">
                                                        <span>HĐ #{inv.id.slice(-6)} - {new Date(inv.timestamp).toLocaleDateString('vi-VN')}</span>
                                                        <span>{formatCurrency((inv.totalAmount || 0) - (inv.amountPaid || 0))}đ</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="p-4 text-center text-slate-500 dark:text-zinc-400">Không có công nợ.</p>}
                    </div>
                  </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Lịch sử Giao dịch</h2>
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-700/50">
                      <tr>
                        <th className="p-3">Khách hàng</th>
                        <th className="p-3">Thành tiền</th>
                        <th className="p-3">Trạng thái TT</th>
                        <th className="p-3">Ngày</th>
                        <th className="p-3">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                      {filteredInvoices.map(inv => (
                        <tr key={inv.id}>
                          <td className="p-3 font-medium">{inv.orderDetails.customerInfo.fullName}</td>
                          <td className="p-3 font-bold">{formatCurrency(inv.totalAmount || 0)}đ</td>
                          <td className="p-3">
                            {inv.paymentStatus === 'paid' && <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">Đã thanh toán</span>}
                            {inv.paymentStatus === 'unpaid' && <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">Chưa thanh toán</span>}
                            {inv.paymentStatus === 'partially_paid' && <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">Thiếu: {formatCurrency((inv.totalAmount || 0) - (inv.amountPaid || 0))}đ</span>}
                          </td>
                          <td className="p-3">{new Date(inv.timestamp).toLocaleDateString('vi-VN')}</td>
                          <td className="p-3">
                            {(inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'partially_paid') && (
                                <button onClick={() => handleOpenVerification(inv)} className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">Xác thực TT</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                   {filteredInvoices.length === 0 && <tbody><tr><td colSpan={5}><p className="p-4 text-center text-slate-500 dark:text-zinc-400">Không có giao dịch nào trong khoảng thời gian này.</p></td></tr></tbody>}
                </table>
                </div>
              </div>
            </>
        )}

        {activeTab === 'tax_ai' && (
             <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader /></div>}>
                <TaxAiAssistant
                    requests={requests}
                    expenses={expenses}
                    products={products}
                    materials={materials}
                    productBOMs={productBOMs}
                />
            </Suspense>
        )}

      {isInvoiceModalOpen && selectedRequest && (
        <InvoiceModal
          request={selectedRequest}
          view={invoiceModalView}
          onClose={() => setIsInvoiceModalOpen(false)}
          onSave={(updates) => onUpdateRequest(selectedRequest.id, updates, "Hoàn tất Hóa đơn & Chuyển sản xuất")}
          onSwitchToPreview={handleInvoiceSaveAndPreview}
          onApplyVoucher={onApplyVoucher}
          bankAccounts={bankAccounts}
          currentUser={currentUser}
          users={users}
          navigateTo={navigateTo}
        />
      )}
      {isCreateOrderModalOpen && (
        <CreateOrderModal
            onClose={() => setIsCreateOrderModalOpen(false)}
            onSave={handleCreateManualOrder}
            currentUser={currentUser}
            prices={prices}
            users={users}
            products={products}
        />
      )}
       {isVerificationModalOpen && verifyingRequest && (
        <PaymentVerificationModal
          request={verifyingRequest}
          onClose={() => setIsVerificationModalOpen(false)}
          onConfirm={handleVerificationConfirm}
        />
      )}
    </div>
  );
};

const TabButton: React.FC<{ name: string, icon?: React.ReactNode, isActive: boolean, onClick: () => void }> = ({ name, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-3 text-sm font-semibold transition-colors flex items-center ${isActive ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'}`}>
        {icon} {name}
    </button>
);


const SummaryCard: React.FC<{title: string, value: string, color: string}> = ({ title, value, color }) => (
    <div className="bg-slate-50 dark:bg-zinc-700/50 p-4 rounded-md">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{title}</h3>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
);