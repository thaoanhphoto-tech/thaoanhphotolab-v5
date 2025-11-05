
import React, { useState } from 'react';
import { Voucher } from '../../../loyaltyStore';
import { XIcon } from '../../icons/XIcon';

interface PromotionModalProps {
    onClose: () => void;
    onSave: (voucher: Omit<Voucher, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ onClose, onSave }) => {
    const [code, setCode] = useState(Math.random().toString(36).substring(2, 10).toUpperCase());
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('fixed_amount');
    const [discountValue, setDiscountValue] = useState(0);
    const [expiresAt, setExpiresAt] = useState('');

    const handleSubmit = () => {
        if (!code.trim() || !description.trim() || discountValue <= 0) {
            alert('Vui lòng điền đủ thông tin.');
            return;
        }
        onSave({
            code,
            description,
            discountType,
            discountValue,
            expiresAt: expiresAt || undefined,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Tạo Khuyến mãi mới</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 space-y-4">
                    <InputField label="Mã Khuyến mãi" value={code} onChange={setCode} required />
                    <InputField label="Mô tả" value={description} onChange={setDescription} required placeholder="VD: Giảm giá nhân dịp 2/9" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Loại giảm giá</label>
                            <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full p-2 mt-1 border rounded dark:bg-zinc-700">
                                <option value="fixed_amount">Số tiền cố định</option>
                                <option value="percentage">Phần trăm</option>
                            </select>
                        </div>
                        <InputField 
                            label={`Giá trị (${discountType === 'fixed_amount' ? 'VNĐ' : '%'})`} 
                            type="number" 
                            value={String(discountValue)} 
                            onChange={val => setDiscountValue(Number(val))} 
                            required 
                        />
                    </div>
                    <InputField label="Ngày hết hạn (Tùy chọn)" type="date" value={expiresAt} onChange={setExpiresAt} />
                </div>
                <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu</button>
                </footer>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void, type?: string, required?: boolean, placeholder?: string }> = 
({ label, value, onChange, type = 'text', required = false, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
    </div>
);
