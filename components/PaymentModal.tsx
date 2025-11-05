
import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './icons/XIcon';
import { PlanId, BankAccount, BANKS } from '../userStore';
import { VietQRIcon } from './icons/VietQRIcon';
import { PlanDetailsTable } from '../planStore';

interface PaymentModalProps {
    planId: PlanId;
    onClose: () => void;
    onBillSubmit: (planId: PlanId, billUrl: string) => void;
    bankAccounts: BankAccount[];
    plans: PlanDetailsTable;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ planId, onClose, onBillSubmit, bankAccounts, plans }) => {
    const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
    const [defaultBankInfo, setDefaultBankInfo] = useState<BankAccount | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const plan = plans[planId];
    
    useEffect(() => {
        const defaultAccount = bankAccounts.find(acc => acc.isDefault) || bankAccounts[0] || null;
        setDefaultBankInfo(defaultAccount);
    }, [bankAccounts]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleUploadClick = () => {
        if (status !== 'idle') return;
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setStatus('submitting');
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const billUrl = reader.result as string;
                onBillSubmit(planId, billUrl);
                // The parent (App.tsx) will now close the modal and show a toast
            };
            reader.readAsDataURL(file);
        }
    };

    if (!plan) return null;

    const amount = parseInt(plan.price.split('/')[0].replace(/[^0-9]/g, ''), 10);
    const description = encodeURIComponent(`Mua goi ${planId}`);
    const qrCodeUrl = defaultBankInfo
        ? `https://img.vietqr.io/image/${defaultBankInfo.bankBin}-${defaultBankInfo.accountNumber}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${encodeURIComponent(defaultBankInfo.accountName)}`
        : null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg relative text-slate-800 dark:text-zinc-200" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700" aria-label="Đóng"><XIcon className="w-6 h-6 text-slate-500 dark:text-zinc-400" /></button>
                <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold mb-2 text-center">Thanh toán đơn hàng</h2>
                    <p className="text-center text-slate-500 dark:text-zinc-400 mb-6">Hoàn tất thanh toán để kích hoạt gói <span className="font-semibold text-blue-600 dark:text-blue-400">{plan.name}</span>.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-slate-200 dark:border-zinc-700">
                            <h3 className="font-semibold mb-3 text-center flex items-center justify-center gap-2">
                                <VietQRIcon className="w-6 h-6 text-green-600" />
                                Quét mã VietQR để thanh toán
                            </h3>
                            <div className="aspect-square bg-white p-2 rounded-md flex items-center justify-center">
                                {qrCodeUrl ? (
                                     <img src={qrCodeUrl} alt="QR Code Thanh toán" className="w-full h-full object-contain" />
                                ) : (
                                    <p className="text-xs text-center text-red-500">Quản trị viên chưa cài đặt thông tin thanh toán.</p>
                                )}
                            </div>
                            <p className="text-xs text-center mt-2 text-slate-500 dark:text-zinc-400">Sử dụng app ngân hàng hoặc ví điện tử để quét mã.</p>
                        </div>
                        <div className="space-y-4">
                             <div className="text-center md:text-left">
                                <p className="text-sm text-slate-500 dark:text-zinc-400">Tổng thanh toán</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{plan.price.replace('/ năm', '')}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Hoặc chuyển khoản thủ công</h4>
                                <div className="text-sm space-y-1 bg-slate-50 dark:bg-zinc-900/50 p-3 rounded-md border border-slate-200 dark:border-zinc-700">
                                    {defaultBankInfo ? (
                                        <>
                                            <p><strong>Ngân hàng:</strong> {BANKS.find(b => b.bin === defaultBankInfo.bankBin)?.name}</p>
                                            <p><strong>Số tài khoản:</strong> {defaultBankInfo.accountNumber}</p>
                                            <p><strong>Chủ tài khoản:</strong> {defaultBankInfo.accountName}</p>
                                            <p><strong>Nội dung:</strong> Mua goi {planId}</p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-red-500">Thông tin chưa được cấu hình.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-800/50 px-6 py-4 rounded-b-xl border-t border-slate-200 dark:border-zinc-700 space-y-3">
                    <button 
                        onClick={handleUploadClick}
                        disabled={status !== 'idle' || !defaultBankInfo}
                        className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg disabled:bg-green-400/80 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {status === 'submitting' ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-3"></div>
                                Đang gửi...
                            </>
                        ) : (
                            "Tải bill thanh toán thành công"
                        )}
                    </button>
                    <p className="text-xs text-center text-slate-500 dark:text-zinc-400">
                        nếu bạn thanh toán thành công mà chưa kích hoạt hãy gửi bill thanh toán thành công cho chúng tôi
                    </p>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};
