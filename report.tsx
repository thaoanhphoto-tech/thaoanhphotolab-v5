
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Corrected imports for bank account information.
import { getPrintRequests, PrintRequest, getBankAccounts, BankAccount, getUsers, User } from './userStore';
import { VietQRIcon } from './components/icons/VietQRIcon';
import { PrinterIcon } from './components/icons/PrinterIcon';
import { CopyIcon } from './components/icons/CopyIcon';
import { loadImageContent } from './contentStore';

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const DebtReportPage: React.FC = () => {
    const [customerName, setCustomerName] = useState('');
    const [customerZalo, setCustomerZalo] = useState('');
    const [debtInvoices, setDebtInvoices] = useState<PrintRequest[]>([]);
    const [totalDebt, setTotalDebt] = useState(0);
    // Fix: Use the correct BankAccount type.
    const [bankInfo, setBankInfo] = useState<BankAccount | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [userPoints, setUserPoints] = useState(0);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const zalo = params.get('customerZalo');
        if (!zalo) return;

        setCustomerZalo(zalo);

        const allUsers = getUsers();
        const allRequests = getPrintRequests();
        const allBankAccounts = getBankAccounts();

        const foundUser = allUsers.find(u => u.zalo === zalo);
        
        const customerInvoices = allRequests.filter(r => 
            r.orderDetails.customerInfo.zalo === zalo &&
            (r.paymentStatus === 'unpaid' || r.paymentStatus === 'partially_paid') &&
            r.workflowStatus !== 'archived' &&
            r.workflowStatus !== 'new'
        );
        
        if (foundUser) {
            setCustomerName(foundUser.fullName);
            setUserPoints(foundUser.points || 0);
        } else if (customerInvoices.length > 0) {
            setCustomerName(customerInvoices[0].orderDetails.customerInfo.fullName);
        }
        
        setDebtInvoices(customerInvoices.sort((a, b) => a.timestamp - b.timestamp));
        
        const debt = customerInvoices.reduce((sum, inv) => sum + ((inv.totalAmount || 0) - (inv.amountPaid || 0)), 0);
        setTotalDebt(debt);

        // Fix: Correctly fetch the default bank account.
        const defaultAccount = allBankAccounts.find(acc => acc.isDefault) || allBankAccounts[0] || null;
        setBankInfo(defaultAccount);

        setLogoUrl(loadImageContent('app_logo', 'https://lh3.googleusercontent.com/d/1SJiuZBOBSX6umhPp7QxbDNXJXsG6SOEL'));
    }, []);

    const qrCodeUrl = bankInfo && totalDebt > 0
    ? `https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.accountNumber}-compact2.png?amount=${totalDebt}&addInfo=${encodeURIComponent(`TT Cong No ${customerName || customerZalo}`)}&accountName=${encodeURIComponent(bankInfo.accountName)}`
    : null;

    const handlePrint = () => window.print();
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Đã sao chép link báo cáo!');
        });
    };

    if (debtInvoices.length === 0) {
        return <div className="p-10 text-center text-slate-700 dark:text-zinc-300">Không tìm thấy công nợ cho khách hàng này.</div>;
    }

    return (
        <>
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none; }
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                }
            `}</style>
            <div className="max-w-4xl mx-auto my-8 p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg text-slate-800 dark:text-zinc-200">
                <div className="no-print mb-6 flex justify-end gap-2">
                    <button onClick={handleCopyLink} className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-zinc-700 text-sm font-semibold rounded hover:bg-slate-300">
                        <CopyIcon className="w-4 h-4" /> Sao chép Link
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">
                        <PrinterIcon className="w-4 h-4" /> In / Lưu PDF
                    </button>
                </div>

                <header className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-200 dark:border-zinc-700">
                    <div className="flex items-center">
                        {logoUrl && <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain mr-4"/>}
                    </div>
                    <div className="text-right text-xs">
                        <h2 className="font-bold text-sm uppercase">TRUNG TÂM IN ẢNH KỸ THUẬT SỐ CÔNG NGHỆ MỚI THẢO ANH PHOTO LAB</h2>
                        <p>CS1: 89b Chi Lăng, cạnh Đại học Hồng Đức</p>
                        <p>CS2: 244 Ngọc Mai, cạnh Đại học Hồng Đức</p>
                        <p>ĐT: 0978983136 - Zalo nhận file: 0396670118</p>
                        <p>Gmail: thaoanhphotolabpro@gmail.com</p>
                    </div>
                </header>

                <section className="my-8">
                    <h1 className="text-2xl font-bold text-center mb-4">BÁO CÁO CÔNG NỢ CHI TIẾT</h1>
                    <div className="text-sm">
                        <p><strong>Khách hàng:</strong> {customerName || 'Khách lẻ'}</p>
                        <p><strong>Zalo:</strong> {customerZalo}</p>
                        <p><strong>Ngày báo cáo:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </section>

                <section>
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-slate-50 dark:bg-zinc-700">
                            <tr>
                                <th className="p-2 border border-slate-300 dark:border-zinc-600 font-semibold text-left">Ngày</th>
                                <th className="p-2 border border-slate-300 dark:border-zinc-600 font-semibold text-left">Mã ĐH</th>
                                <th className="p-2 border border-slate-300 dark:border-zinc-600 font-semibold text-left">Nội dung</th>
                                <th className="p-2 border border-slate-300 dark:border-zinc-600 font-semibold text-right">Phát sinh Nợ</th>
                                <th className="p-2 border border-slate-300 dark:border-zinc-600 font-semibold text-right">Đã thanh toán</th>
                                <th className="p-2 border border-slate-300 dark:border-zinc-600 font-semibold text-right">Dư nợ cuối kỳ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {debtInvoices.map(inv => {
                                const debtAmount = (inv.totalAmount || 0) - (inv.amountPaid || 0);
                                const content = inv.manualOrderItems?.map(i => i.productName).join(', ') || inv.sourceTool;
                                return (
                                <tr key={inv.id}>
                                    <td className="p-2 border border-slate-300 dark:border-zinc-600">{new Date(inv.timestamp).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-2 border border-slate-300 dark:border-zinc-600">#{inv.id.slice(-6)}</td>
                                    <td className="p-2 border border-slate-300 dark:border-zinc-600">{content}</td>
                                    <td className="p-2 border border-slate-300 dark:border-zinc-600 text-right">{formatCurrency(inv.totalAmount || 0)}</td>
                                    <td className="p-2 border border-slate-300 dark:border-zinc-600 text-right">{formatCurrency(inv.amountPaid || 0)}</td>
                                    <td className="p-2 border border-slate-300 dark:border-zinc-600 text-right font-semibold">{formatCurrency(debtAmount)}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </section>

                <section className="grid grid-cols-2 gap-8 mt-8">
                    <div className="flex flex-col justify-end">
                        <div className="text-right border-t border-slate-200 dark:border-zinc-700 pt-4">
                            <p className="font-semibold">TỔNG CÔNG NỢ CUỐI KỲ:</p>
                            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
                        </div>
                    </div>
                     <div className="text-center">
                        {qrCodeUrl ? (
                            <>
                                <img src={qrCodeUrl} alt="QR Code Thanh toán" className="w-40 h-40 object-contain mx-auto" />
                                <p className="text-xs flex items-center justify-center gap-1 mt-2"><VietQRIcon className="w-4 h-4"/> Quét mã để thanh toán toàn bộ công nợ</p>
                            </>
                        ) : (
                            <p className="text-xs text-red-500">Chưa cấu hình thông tin ngân hàng để tạo QR.</p>
                        )}
                     </div>
                </section>

                 <section className="mt-8 pt-6 border-t border-dashed border-slate-300 dark:border-zinc-600 text-center">
                    <h3 className="font-semibold text-sm uppercase text-teal-600 dark:text-teal-400">Thông tin Thành viên Thân thiết</h3>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <p className="text-lg">Điểm tích lũy hiện tại: <strong className="text-2xl text-blue-600">{userPoints} điểm</strong></p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">Bạn có thể dùng điểm để đổi voucher giảm giá hoặc sản phẩm miễn phí tại trang "Tài khoản của tôi".</p>
                </section>

                <footer className="mt-20 pt-10 grid grid-cols-3 gap-8 text-center text-sm font-semibold">
                    <div>
                        <p>Người lập báo cáo</p>
                        <p className="mt-12">(Ký, ghi rõ họ tên)</p>
                    </div>
                     <div>
                        <p>Giám đốc điều hành</p>
                        <p className="mt-12">(Ký, ghi rõ họ tên)</p>
                    </div>
                     <div>
                        <p>Tổng giám đốc</p>
                        <p className="mt-12">(Ký, ghi rõ họ tên)</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DebtReportPage />
  </React.StrictMode>
);
