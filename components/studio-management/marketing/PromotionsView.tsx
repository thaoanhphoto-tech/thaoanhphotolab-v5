
import React, { useState } from 'react';
import { Voucher } from '../../../loyaltyStore';
import { PlusIcon } from '../../icons/PlusIcon';
import { PromotionModal } from './PromotionModal';

interface PromotionsViewProps {
    vouchers: Voucher[];
    onAddVoucher: (voucher: Omit<Voucher, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
}

export const PromotionsView: React.FC<PromotionsViewProps> = ({ vouchers, onAddVoucher }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const promotionalVouchers = vouchers.filter(v => v.source === 'promo_campaign');

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm"
                >
                    <PlusIcon className="w-5 h-5" /> Tạo Khuyến mãi mới
                </button>
            </div>
            <div className="space-y-3">
                {promotionalVouchers.map(voucher => (
                    <div key={voucher.id} className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border dark:border-zinc-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-mono text-sm font-bold bg-slate-200 dark:bg-zinc-700 px-2 py-0.5 rounded inline-block">{voucher.code}</p>
                                <p className="font-semibold mt-1">{voucher.description}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${voucher.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                {voucher.status === 'active' ? 'Hoạt động' : 'Đã dùng'}
                            </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                            <span>
                                {voucher.discountType === 'fixed_amount' ? `Giảm ${new Intl.NumberFormat('vi-VN').format(voucher.discountValue || 0)}đ` : `Giảm ${voucher.discountValue}%`}
                            </span>
                            {voucher.expiresAt && <span className="ml-4">Hết hạn: {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}</span>}
                        </div>
                    </div>
                ))}
                {promotionalVouchers.length === 0 && (
                    <p className="text-center text-slate-500 py-8">Chưa có chương trình khuyến mãi nào.</p>
                )}
            </div>

            {isModalOpen && (
                <PromotionModal 
                    onClose={() => setIsModalOpen(false)}
                    onSave={(data) => {
                        onAddVoucher(data);
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};
