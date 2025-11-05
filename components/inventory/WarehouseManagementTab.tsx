import React, { useState } from 'react';
import { Warehouse } from '../../inventoryStore';
import { XIcon } from '../icons/XIcon';
import { useToast } from '../Toast';

interface WarehouseManagementTabProps {
    warehouses: Warehouse[];
    onUpdateWarehouses: (warehouses: Warehouse[]) => void;
}

const WarehouseManagementTab: React.FC<WarehouseManagementTabProps> = ({ warehouses, onUpdateWarehouses }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const { showToast } = useToast();

    const handleOpenModal = (warehouse: Warehouse | null = null) => {
        setEditingWarehouse(warehouse);
        setIsModalOpen(true);
    };

    const handleSave = (warehouseData: Omit<Warehouse, 'id'>, id?: string) => {
        let updatedWarehouses;
        if (id) {
            updatedWarehouses = warehouses.map(w => w.id === id ? { ...w, ...warehouseData } : w);
        } else {
            const newWarehouse: Warehouse = { id: `wh-${Date.now()}`, ...warehouseData };
            updatedWarehouses = [...warehouses, newWarehouse];
        }
        onUpdateWarehouses(updatedWarehouses);
        showToast(id ? 'Cập nhật kho thành công!' : 'Thêm kho mới thành công!', 'success');
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (warehouses.length <= 1) {
            showToast('Không thể xóa kho cuối cùng.', 'error');
            return;
        }
        if (window.confirm('Bạn có chắc muốn xóa kho này? Toàn bộ tồn kho trong kho này sẽ bị mất.')) {
            onUpdateWarehouses(warehouses.filter(w => w.id !== id));
            showToast('Đã xóa kho.', 'info');
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border dark:border-zinc-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Quản lý các Kho</h2>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md text-sm">+ Thêm Kho mới</button>
            </div>
            <div className="space-y-3">
                {warehouses.map(wh => (
                    <div key={wh.id} className="p-3 bg-slate-50 dark:bg-zinc-700/50 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{wh.name}</p>
                            <p className="text-sm text-slate-500">{wh.address || 'Chưa có địa chỉ'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleOpenModal(wh)} className="text-xs font-semibold text-blue-600 hover:underline">Sửa</button>
                            <button onClick={() => handleDelete(wh.id)} className="text-xs font-semibold text-red-600 hover:underline">Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <WarehouseModal warehouse={editingWarehouse} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
            )}
        </div>
    );
};

const WarehouseModal: React.FC<{ warehouse: Warehouse | null, onClose: () => void, onSave: (data: Omit<Warehouse, 'id'>, id?: string) => void }> = ({ warehouse, onClose, onSave }) => {
    const [name, setName] = useState(warehouse?.name || '');
    const [address, setAddress] = useState(warehouse?.address || '');

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave({ name, address }, warehouse?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between p-4 border-b"><h3 className="font-semibold">{warehouse ? 'Sửa' : 'Thêm'} Kho</h3><button onClick={onClose}><XIcon className="w-5 h-5"/></button></header>
                <div className="p-6 space-y-4">
                    <InputField label="Tên Kho" value={name} onChange={setName} required/>
                    <InputField label="Địa chỉ (Tùy chọn)" value={address} onChange={setAddress}/>
                </div>
                <footer className="p-4 flex justify-end"><button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button></footer>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, value: string, onChange: (val: string) => void, required?: boolean}> = 
({ label, value, onChange, required }) => (
    <div>
        <label className="text-sm font-medium">{label}{required && <span className="text-red-500">*</span>}</label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
        />
    </div>
);

export default WarehouseManagementTab;