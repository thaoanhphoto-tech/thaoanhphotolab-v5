// components/inventory/SupplierManagementTab.tsx
import React, { useState, lazy } from 'react';
import { Supplier, InventoryTransaction } from '../../inventoryStore';
import { User } from '../../userStore';
import { XIcon } from '../icons/XIcon';
import { useToast } from '../Toast';

const SupplierPaymentModal = lazy(() => import('./SupplierPaymentModal'));

interface SupplierManagementTabProps {
    suppliers: Supplier[];
    onUpdateSuppliers: (suppliers: Supplier[]) => void;
    onAddTransaction: (transaction: Omit<InventoryTransaction, 'id' | 'timestamp'>) => void;
    currentUser: User;
}

const SupplierManagementTab: React.FC<SupplierManagementTabProps> = ({ suppliers, onUpdateSuppliers, onAddTransaction, currentUser }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);

    const { showToast } = useToast();

    const handleOpenEditModal = (supplier: Supplier | null = null) => {
        setEditingSupplier(supplier);
        setIsEditModalOpen(true);
    };

    const handleOpenPaymentModal = (supplier: Supplier) => {
        setPayingSupplier(supplier);
        setIsPaymentModalOpen(true);
    };

    const handleSave = (supplierData: Omit<Supplier, 'id'>, id?: string) => {
        let updatedSuppliers;
        if (id) {
            updatedSuppliers = suppliers.map(s => s.id === id ? { ...s, ...supplierData } : s);
        } else {
            const newSupplier: Supplier = { id: `sup-${Date.now()}`, ...supplierData };
            updatedSuppliers = [newSupplier, ...suppliers];
        }
        onUpdateSuppliers(updatedSuppliers);
        showToast(id ? 'Cập nhật nhà cung cấp thành công!' : 'Thêm nhà cung cấp mới thành công!', 'success');
        setIsEditModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
            onUpdateSuppliers(suppliers.filter(s => s.id !== id));
            showToast('Đã xóa nhà cung cấp.', 'info');
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border dark:border-zinc-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Danh sách Nhà Cung Cấp</h2>
                <button onClick={() => handleOpenEditModal()} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md text-sm">+ Thêm NCC</button>
            </div>
            {suppliers.length > 0 ? (
                <div className="space-y-3">
                    {suppliers.map(sup => (
                        <div key={sup.id} className="p-3 bg-slate-50 dark:bg-zinc-700/50 rounded-md flex justify-between items-center flex-wrap gap-2">
                            <div>
                                <p className="font-semibold">{sup.name}</p>
                                <p className="text-sm text-slate-500">{sup.phone || 'Chưa có SĐT'}</p>
                                <p className="text-sm font-bold text-red-500">Công nợ: {new Intl.NumberFormat('vi-VN').format(sup.debtAmount)}đ</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenPaymentModal(sup)} className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600">Thanh toán</button>
                                <button onClick={() => handleOpenEditModal(sup)} className="text-xs font-semibold text-blue-600 hover:underline">Sửa</button>
                                <button onClick={() => handleDelete(sup.id)} className="text-xs font-semibold text-red-600 hover:underline">Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500 py-6">Chưa có nhà cung cấp nào.</p>
            )}

            {isEditModalOpen && (
                <SupplierModal supplier={editingSupplier} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} />
            )}
            {isPaymentModalOpen && payingSupplier && (
                 <React.Suspense fallback={<div/>}>
                    <SupplierPaymentModal 
                        supplier={payingSupplier}
                        currentUser={currentUser}
                        onClose={() => setIsPaymentModalOpen(false)}
                        onSave={onAddTransaction}
                    />
                </React.Suspense>
            )}
        </div>
    );
};

const SupplierModal: React.FC<{ supplier: Supplier | null, onClose: () => void, onSave: (data: Omit<Supplier, 'id'>, id?: string) => void }> = ({ supplier, onClose, onSave }) => {
    const [name, setName] = useState(supplier?.name || '');
    const [phone, setPhone] = useState(supplier?.phone || '');
    const [taxCode, setTaxCode] = useState(supplier?.taxCode || '');
    const [debtAmount, setDebtAmount] = useState(supplier?.debtAmount || 0);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave({ name, phone, taxCode, debtAmount }, supplier?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between p-4 border-b"><h3 className="font-semibold">{supplier ? 'Sửa' : 'Thêm'} NCC</h3><button onClick={onClose}><XIcon className="w-5 h-5"/></button></header>
                <div className="p-6 space-y-4">
                    <InputField label="Tên NCC" value={name} onChange={setName} required/>
                    <InputField label="SĐT" value={phone} onChange={setPhone}/>
                    <InputField label="Mã số thuế" value={taxCode} onChange={setTaxCode}/>
                    <InputField label="Công nợ ban đầu" type="number" value={String(debtAmount)} onChange={val => setDebtAmount(Number(val))}/>
                </div>
                <footer className="p-4 flex justify-end"><button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button></footer>
            </div>
        </div>
    );
};

const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}> = ({ label, value, onChange, type = 'text', required = false }) => (
    <div>
        <label className="text-sm font-medium">{label}{required ? <span className="text-red-500">*</span> : ''}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
        />
    </div>
);

export default SupplierManagementTab;