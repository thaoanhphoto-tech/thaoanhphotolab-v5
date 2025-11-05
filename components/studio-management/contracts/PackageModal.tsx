import React, { useState } from 'react';
import { ServicePackage } from './types';
import { XIcon } from '../../icons/XIcon';

interface PackageModalProps {
    pkg: ServicePackage | null;
    onClose: () => void;
    onSave: (pkg: Omit<ServicePackage, 'id'>, id?: string) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
const parseCurrency = (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;

export const PackageModal: React.FC<PackageModalProps> = ({ pkg, onClose, onSave }) => {
    const [name, setName] = useState(pkg?.name || '');
    const [price, setPrice] = useState(pkg?.price || 0);
    const [items, setItems] = useState(pkg?.items.join('\n') || '');

    const handleSave = () => {
        if (!name.trim() || price <= 0) {
            alert('Vui lòng nhập tên và giá hợp lệ.');
            return;
        }
        const itemsArray = items.split('\n').filter(item => item.trim() !== '');
        onSave({ name, price, items: itemsArray }, pkg?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">{pkg ? 'Chỉnh sửa' : 'Tạo'} Gói dịch vụ</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="font-semibold">Tên Gói</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700"/>
                    </div>
                    <div>
                        <label className="font-semibold">Giá (VNĐ)</label>
                        <input type="text" value={formatCurrency(price)} onChange={e => setPrice(parseCurrency(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 text-right"/>
                    </div>
                    <div>
                        <label className="font-semibold">Các hạng mục trong gói</label>
                        <textarea value={items} onChange={e => setItems(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 h-32" placeholder="Mỗi hạng mục trên một dòng..."></textarea>
                    </div>
                </div>
                 <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu Gói</button>
                </footer>
            </div>
        </div>
    );
};