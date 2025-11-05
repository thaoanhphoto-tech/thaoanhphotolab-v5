import React, { useState } from 'react';
import { XIcon } from '../icons/XIcon';
import { Material, Warehouse } from '../../inventoryStore';
import { User } from '../../userStore';
import { useToast } from '../Toast';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface WarehouseTransferModalProps {
    materials: Material[];
    warehouses: Warehouse[];
    currentUser: User;
    onClose: () => void;
    onSave: (transferData: Omit<any, 'id' | 'timestamp' | 'status'>) => void;
}

interface TransferItem {
    id: number;
    materialId: string;
    quantity: number;
}

const WarehouseTransferModal: React.FC<WarehouseTransferModalProps> = ({ materials, warehouses, currentUser, onClose, onSave }) => {
    const [fromWarehouseId, setFromWarehouseId] = useState('');
    const [toWarehouseId, setToWarehouseId] = useState('');
    const [items, setItems] = useState<TransferItem[]>([{ id: Date.now(), materialId: '', quantity: 1 }]);
    const [notes, setNotes] = useState('');
    const { showToast } = useToast();

    const handleItemChange = (id: number, field: keyof TransferItem, value: string | number) => {
        setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), materialId: '', quantity: 1 }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleSubmit = () => {
        if (!fromWarehouseId || !toWarehouseId || fromWarehouseId === toWarehouseId) {
            showToast('Vui lòng chọn kho đi và kho đến hợp lệ.', 'error');
            return;
        }
        if (items.some(item => !item.materialId || item.quantity <= 0)) {
            showToast('Vui lòng chọn vật tư và nhập số lượng hợp lệ.', 'error');
            return;
        }

        let hasError = false;
        items.forEach(item => {
            const material = materials.find(m => m.id === item.materialId);
            const stockInSource = material?.stock[fromWarehouseId] || 0;
            if (item.quantity > stockInSource) {
                showToast(`Số lượng chuyển "${material?.name}" vượt quá tồn kho tại kho đi (${stockInSource}).`, 'error');
                hasError = true;
            }
        });
        if (hasError) return;
        
        onSave({
            fromWarehouseId,
            toWarehouseId,
            items: items.map(({ materialId, quantity }) => ({ materialId, quantity })),
            notes,
            staffId: currentUser.id,
        });

        showToast('Đã tạo lệnh chuyển kho thành công!', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-2xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">Tạo Phiếu Chuyển Kho</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5"/></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="Từ Kho" value={fromWarehouseId} onChange={setFromWarehouseId} options={warehouses.map(w => ({ value: w.id, label: w.name }))} required />
                        <SelectField label="Đến Kho" value={toWarehouseId} onChange={setToWarehouseId} options={warehouses.map(w => ({ value: w.id, label: w.name }))} required />
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Chi tiết Vật tư Chuyển</h4>
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="grid grid-cols-[3fr_1fr_40px] gap-2 items-end p-2 border rounded-md">
                                    <SelectField 
                                        label="Vật tư" 
                                        value={item.materialId} 
                                        onChange={(val: string) => handleItemChange(item.id, 'materialId', val)} 
                                        options={materials.map(m => ({ value: m.id, label: `${m.name} (Tồn: ${m.stock[fromWarehouseId] || 0})` }))} 
                                        required 
                                        disabled={!fromWarehouseId}
                                    />
                                    <InputField 
                                        label="Số lượng" 
                                        type="number" 
                                        value={String(item.quantity)} 
                                        onChange={(val: string) => handleItemChange(item.id, 'quantity', Number(val))} 
                                        required 
                                    />
                                    <button onClick={() => removeItem(item.id)} disabled={items.length <= 1} className="p-2 text-red-500 rounded-full disabled:opacity-30">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addItem} className="mt-3 text-sm font-semibold text-blue-600"><PlusCircleIcon className="w-5 h-5 inline mr-1"/>Thêm vật tư</button>
                    </div>
                    <InputField label="Ghi chú" value={notes} onChange={setNotes} />
                </div>
                <footer className="p-4 flex justify-end bg-slate-50 rounded-b-lg">
                    <button onClick={handleSubmit} className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg">Tạo Lệnh Chuyển</button>
                </footer>
            </div>
        </div>
    );
};

const InputField: React.FC<any> = ({ label, onChange, ...props }) => (
    <div><label className="text-xs font-medium">{label}</label><input {...props} onChange={e => onChange(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700"/></div>
);
const SelectField: React.FC<any> = ({ label, options, onChange, ...props }) => (
    <div><label className="text-xs font-medium">{label}</label><select {...props} onChange={e => onChange(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700"><option value="">-- Chọn --</option>{options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
);

export default WarehouseTransferModal;