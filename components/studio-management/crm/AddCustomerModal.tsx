
import React, { useState } from 'react';
import { Customer } from './types';
import { User, StudioStaff } from '../../../userStore';
import { XIcon } from '../../icons/XIcon';

interface AddCustomerModalProps {
    onClose: () => void;
    onSave: (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions'>) => void;
    studioStaff: StudioStaff[];
}

const CUSTOMER_SOURCES = ['Facebook Ads', 'Zalo', 'TikTok', 'Giới thiệu', 'Khách vãng lai'];

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose, onSave, studioStaff }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [zalo, setZalo] = useState('');
    const [source, setSource] = useState(CUSTOMER_SOURCES[0]);
    const [assignedTo, setAssignedTo] = useState('');

    const handleSubmit = () => {
        if (!name.trim() || !phone.trim()) {
            alert('Vui lòng nhập Tên và Số điện thoại.');
            return;
        }
        onSave({
            name,
            phone,
            zalo: zalo || phone,
            source,
            assignedTo,
            status: 'new'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Thêm Khách hàng mới</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 space-y-4">
                    <InputField label="Tên Khách hàng" value={name} onChange={setName} required />
                    <InputField label="Số Điện thoại" value={phone} onChange={setPhone} required />
                    <InputField label="Zalo (nếu khác SĐT)" value={zalo} onChange={setZalo} />
                    <InputField label="Nguồn Khách hàng" as="select" value={source} onChange={setSource}>
                        {CUSTOMER_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </InputField>
                    <InputField label="Gán cho Nhân viên" as="select" value={assignedTo} onChange={setAssignedTo}>
                        <option value="">-- Chưa gán --</option>
                        {studioStaff.map(u => (
                            <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                    </InputField>
                </div>
                <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu Khách hàng</button>
                </footer>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void, required?: boolean, as?: 'input' | 'select', children?: React.ReactNode }> = 
({ label, value, onChange, required, as='input', children }) => (
    <div>
        <label className="block text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
        {as === 'input' ? (
             <input type="text" value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"/>
        ) : (
             <select value={value} onChange={e => onChange(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                {children}
            </select>
        )}
    </div>
);