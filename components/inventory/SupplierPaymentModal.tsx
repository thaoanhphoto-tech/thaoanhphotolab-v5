// components/inventory/SupplierPaymentModal.tsx
import React, { useState } from 'react';
import { XIcon } from '../icons/XIcon';
import { Supplier, InventoryTransaction } from '../../inventoryStore';
import { User } from '../../userStore';
import { useToast } from '../Toast';

interface SupplierPaymentModalProps {
    supplier: Supplier;
    currentUser: User;
    onClose: () => void;
    onSave: (transaction: Omit<InventoryTransaction, 'id' | 'timestamp'>) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
const parseCurrency = (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;

export const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = ({ supplier, currentUser, onClose, onSave }) => {
    const [amount, setAmount] = useState(0);
    const [notes, setNotes] = useState('');
    const { showToast } = useToast();

    const handleSubmit = () => {
        if (amount <= 0) {
            showToast('Vui lòng nhập số tiền thanh toán hợp lệ.', 'error');
            return;
        }

        onSave({
            type: 'outbound_payment',
            supplierId: supplier.id,
            quantity: 1, // Represents one payment transaction
            unitPrice: amount, // The actual payment amount
            notes,
            staffId: currentUser.id,
        });

        showToast('Đã ghi nhận thanh toán thành công!', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Thanh toán cho {supplier.name}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-slate-500">Công nợ hiện tại:</p>
                        <p className="text-2xl font-bold text-red-500">{formatCurrency(supplier.debtAmount)}đ</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Số tiền thanh toán</label>
                        <input
                            type="text"
                            value={formatCurrency(amount)}
                            onChange={e => setAmount(parseCurrency(e.target.value))}
                            required
                            className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Ghi chú</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="VD: Chuyển khoản, thanh toán đợt 1..."
                            className="w-full mt-1 p-2 border rounded dark:bg-zinc-700"
                            rows={3}
                        />
                    </div>
                </div>
                <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu Thanh toán</button>
                </footer>
            </div>
        </div>
    );
};

export default SupplierPaymentModal;