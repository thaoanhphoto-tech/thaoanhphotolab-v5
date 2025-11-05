// components/inventory/OutboundSlipModal.tsx
import React, { useState } from 'react';
import { XIcon } from '../icons/XIcon';
import { Material, InventoryTransaction, TransactionType, Warehouse } from '../../inventoryStore';
import { User } from '../../userStore';
import { useToast } from '../Toast';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface OutboundSlipModalProps {
    materials: Material[];
    currentUser: User;
    onClose: () => void;
    onSave: (transaction: Omit<InventoryTransaction, 'id' | 'timestamp'>) => void;
    warehouses: Warehouse[];
}

interface SlipItem {
    id: number;
    materialId: string;
    quantity: number;
}

const OUTBOUND_TYPES: { id: TransactionType, name: string }[] = [
    { id: 'outbound_production', name: 'Xuất cho Sản xuất' },
    { id: 'outbound_sale', name: 'Xuất Bán' },
    { id: 'outbound_return', name: 'Xuất trả NCC' },
    { id: 'adjustment_destroy', name: 'Hủy hàng' },
];

const OutboundSlipModal: React.FC<OutboundSlipModalProps> = ({ materials, currentUser, onClose, onSave, warehouses }) => {
    const [outboundType, setOutboundType] = useState<TransactionType>('outbound_production');
    const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
    const [items, setItems] = useState<SlipItem[]>([{ id: Date.now(), materialId: '', quantity: 1 }]);
    const [recipientName, setRecipientName] = useState('');
    const [notes, setNotes] = useState('');
    const { showToast } = useToast();

    const handleItemChange = (id: number, field: keyof SlipItem, value: string | number) => {
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
        if (!warehouseId || items.some(item => !item.materialId || item.quantity <= 0)) {
            showToast('Vui lòng chọn Kho xuất, vật tư và nhập số lượng hợp lệ.', 'error');
            return;
        }

        let hasError = false;
        items.forEach(item => {
            const material = materials.find(m => m.id === item.materialId);
            if (!material) {
                showToast(`Không tìm thấy vật tư với ID ${item.materialId}`, 'error');
                hasError = true;
                return;
            }
            const stockInWarehouse = material.stock[warehouseId] || 0;
            if (item.quantity > stockInWarehouse) {
                showToast(`Số lượng xuất "${material.name}" vượt quá tồn kho tại kho đã chọn (${stockInWarehouse}).`, 'error');
                hasError = true;
            }
        });

        if (hasError) return;

        const fullNotes = [
            recipientName ? `Người nhận: ${recipientName}` : '',
            notes
        ].filter(Boolean).join('. ');

        items.forEach(item => {
            const material = materials.find(m => m.id === item.materialId)!;
            onSave({
                materialId: item.materialId,
                type: outboundType,
                quantity: -Math.abs(item.quantity),
                unitPrice: material.unitPrice,
                notes: fullNotes,
                staffId: currentUser.id,
                warehouseId: warehouseId,
            });
        });

        showToast(`Đã tạo phiếu xuất kho với ${items.length} vật tư.`, 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-2xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">Tạo Phiếu Xuất Kho</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5"/></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SelectField label="Lý do xuất" value={outboundType} onChange={setOutboundType} options={OUTBOUND_TYPES.map(t => ({ value: t.id, label: t.name }))} required />
                        <SelectField label="Xuất từ Kho" value={warehouseId} onChange={setWarehouseId} options={warehouses.map(w => ({ value: w.id, label: w.name }))} required />
                        <InputField label="Người nhận" value={recipientName} onChange={setRecipientName} placeholder="VD: Tên nhân viên, khách hàng" />
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Chi tiết Vật tư</h4>
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="grid grid-cols-[3fr_1fr_40px] gap-2 items-end p-2 border rounded-md dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50">
                                    <SelectField 
                                        label="Vật tư" 
                                        value={item.materialId} 
                                        onChange={(val: string) => handleItemChange(item.id, 'materialId', val)} 
                                        options={materials.map(m => ({ value: m.id, label: `${m.name} ${m.size ? `(${m.size})` : ''} (Tồn: ${m.stock[warehouseId] || 0})` }))} 
                                        required 
                                    />
                                    <InputField 
                                        label="Số lượng" 
                                        type="number" 
                                        value={String(item.quantity)} 
                                        onChange={(val: string) => handleItemChange(item.id, 'quantity', Number(val))} 
                                        required 
                                    />
                                    <button onClick={() => removeItem(item.id)} disabled={items.length <= 1} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addItem} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                            <PlusCircleIcon className="w-5 h-5" /> Thêm vật tư
                        </button>
                    </div>

                    <div>
                        <InputField label="Ghi chú thêm" value={notes} onChange={setNotes} />
                    </div>
                </div>
                <footer className="p-4 flex justify-end bg-slate-50 dark:bg-zinc-900/50 rounded-b-lg">
                    <button onClick={handleSubmit} className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600">Lưu Phiếu Xuất</button>
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


export default OutboundSlipModal;