
import React, { useState } from 'react';
import { Customer } from '../crm/types';
import { XIcon } from '../../icons/XIcon';

interface RentalModalProps {
    customers: Customer[];
    onClose: () => void;
    onSave: (customerId: string, returnDate: string) => void;
}

export const RentalModal: React.FC<RentalModalProps> = ({ customers, onClose, onSave }) => {
    const [customerId, setCustomerId] = useState('');
    const [returnDate, setReturnDate] = useState('');

    const handleSave = () => {
        if (!customerId || !returnDate) {
            alert('Vui lòng chọn khách hàng và ngày dự kiến trả.');
            return;
        }
        onSave(customerId, returnDate);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Cho thuê Tài sản</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Khách hàng thuê</label>
                        <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 text-slate-800 dark:text-zinc-200">
                            <option value="">-- Chọn khách hàng --</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Ngày dự kiến trả</label>
                        <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
                    </div>
                </div>
                <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Xác nhận cho thuê</button>
                </footer>
            </div>
        </div>
    );
};