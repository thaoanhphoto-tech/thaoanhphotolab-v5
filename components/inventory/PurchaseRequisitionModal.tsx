

import React, { useState, useEffect, useMemo } from 'react';
import { Material, Supplier, InventoryTransaction, PurchaseOrder } from '../../inventoryStore';
import { XIcon } from '../icons/XIcon';
import { useToast } from '../Toast';
import ZaloIcon from '../icons/ZaloIcon';
import { FacebookIcon } from '../icons/FacebookIcon'; // Using this as a placeholder for Gmail
import { User } from '../../userStore';

interface PurchaseRequisitionModalProps {
    materials: Material[];
    suppliers: Supplier[];
    transactions: InventoryTransaction[];
    onClose: () => void;
    onSave: (orderData: Omit<PurchaseOrder, 'id' | 'timestamp'>) => void;
    currentUser: User;
}

interface RequisitionItem {
    material: Material;
    orderQuantity: number;
    selected: boolean;
    lastSupplierName?: string;
    taxRate: number;
}

const PurchaseRequisitionModal: React.FC<PurchaseRequisitionModalProps> = ({ materials, suppliers, transactions, onClose, onSave, currentUser }) => {
    const [items, setItems] = useState<RequisitionItem[]>([]);
    const { showToast } = useToast();
    const [manualMaterialId, setManualMaterialId] = useState('');
    const [manualQuantity, setManualQuantity] = useState(1);
    const [supplierId, setSupplierId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');

    const handleItemChange = (id: string, field: keyof RequisitionItem, value: boolean | number) => {
        setItems(prev => prev.map(item => item.material.id === id ? { ...item, [field]: value } : item));
    };

    const handleAddManualItem = () => {
        if (!manualMaterialId || manualQuantity <= 0) {
            showToast('Vui lòng chọn vật tư và nhập số lượng hợp lệ.', 'error');
            return;
        }

        const materialToAdd = materials.find(m => m.id === manualMaterialId);
        if (!materialToAdd) return;

        setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.material.id === manualMaterialId);
            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                // Fix: Explicitly cast `orderQuantity` to Number to avoid TypeScript error with `+=` operator.
                newItems[existingItemIndex].orderQuantity = Number(newItems[existingItemIndex].orderQuantity) + manualQuantity;
                newItems[existingItemIndex].selected = true;
                return newItems;
            } else {
                const lastInbound = transactions
                    .filter(t => t.materialId === materialToAdd.id && t.type === 'inbound' && t.supplierId)
                    .sort((a, b) => b.timestamp - a.timestamp)[0];
                const lastSupplier = suppliers.find(s => s.id === lastInbound?.supplierId);
                
                const newItem: RequisitionItem = {
                    material: materialToAdd,
                    orderQuantity: manualQuantity,
                    selected: true,
                    lastSupplierName: lastSupplier?.name,
                    taxRate: 10, // Default tax rate
                };
                return [newItem, ...prevItems];
            }
        });
        
        showToast(`Đã thêm ${materialToAdd.name} vào danh sách.`, 'success');
        setManualMaterialId('');
        setManualQuantity(1);
    };


    const selectedItems = useMemo(() => items.filter(item => item.selected), [items]);

    const generateListText = () => {
        if (selectedItems.length === 0) return '';
        let text = `YÊU CẦU MUA HÀNG - HĐ: ${invoiceNumber || '(Chưa có)'}\nNCC: ${suppliers.find(s=>s.id === supplierId)?.name || 'Chưa chọn'}\n\n`;
        selectedItems.forEach(item => {
            const totalStock = Object.values(item.material.stock || {}).reduce((sum, val) => sum + Number(val), 0);
            text += `- ${item.material.name}: Cần nhập ${item.orderQuantity} ${item.material.unit}. (Tồn: ${totalStock})\n`;
        });
        return text;
    };

    const handleSendGmail = () => {
        const listText = generateListText();
        if (!listText) { showToast('Vui lòng chọn ít nhất một vật tư.', 'info'); return; }
        const subject = encodeURIComponent(`Yêu cầu nhập vật tư - HĐ ${invoiceNumber} - Thảo Anh Photo Lab`);
        const body = encodeURIComponent(listText);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };
    
    const handleSendZalo = () => {
        const listText = generateListText();
        if (!listText) return;
        navigator.clipboard.writeText(listText).then(() => {
            showToast('Đã sao chép danh sách vào clipboard. Vui lòng dán vào Zalo!', 'success');
        });
    };
    
    const handleCreateRequest = () => {
        if (selectedItems.length === 0 || !supplierId) {
            showToast('Vui lòng chọn Nhà cung cấp và ít nhất một vật tư.', 'error');
            return;
        }
        
        // Fix: Add explicit type `: number` to the accumulator `sum` to ensure correct type inference.
        const totalAmount = selectedItems.reduce((sum: number, item) => {
            const price = item.material.unitPrice;
            const taxMultiplier = 1 + (item.taxRate / 100);
            return sum + (item.orderQuantity * price * taxMultiplier);
        }, 0);

        onSave({
            supplierId: supplierId,
            invoiceNumber,
            invoiceDate,
            items: selectedItems.map(item => ({
                materialId: item.material.id,
                quantity: item.orderQuantity,
                unitPrice: item.material.unitPrice,
                taxRate: item.taxRate,
            })),
            totalAmount: totalAmount,
            status: 'pending',
            createdBy: currentUser.id,
        });

        showToast('Đã tạo đơn mua hàng thành công!', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Tạo Đơn Mua Hàng</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-1">
                            <label className="font-semibold text-md mb-2 block">1. Chọn Nhà Cung Cấp *</label>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full p-2 border rounded dark:bg-zinc-700">
                                <option value="">-- Chọn NCC --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className="font-semibold text-md mb-2 block">Số Hóa đơn (Nếu có)</label>
                           <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full p-2 border rounded dark:bg-zinc-700"/>
                        </div>
                         <div>
                           <label className="font-semibold text-md mb-2 block">Ngày Hóa đơn</label>
                           <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full p-2 border rounded dark:bg-zinc-700"/>
                        </div>
                    </div>

                    <div className="mb-6 p-4 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-900/50">
                        <h3 className="font-semibold text-md mb-2">2. Thêm vật tư vào đơn hàng</h3>
                        <div className="flex items-end gap-2">
                            <div className="flex-grow">
                                <label className="text-xs font-medium">Vật tư</label>
                                <select value={manualMaterialId} onChange={e => setManualMaterialId(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700">
                                    <option value="">-- Chọn vật tư --</option>
                                    {materials.map(m => <option key={m.id} value={m.id}>{m.name} {m.size ? `(${m.size})` : ''}</option>)}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="text-xs font-medium">Số lượng</label>
                                <input type="number" value={manualQuantity} onChange={e => setManualQuantity(Number(e.target.value))} min="1" className="w-full mt-1 p-2 border rounded text-center dark:bg-zinc-700"/>
                            </div>
                            <button onClick={handleAddManualItem} className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 text-sm">Thêm</button>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <p className="text-center text-slate-500 py-10">Chưa có vật tư nào trong danh sách.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-left bg-slate-100 dark:bg-zinc-700">
                                <tr>
                                    <th className="p-2 w-8"><input type="checkbox" checked={selectedItems.length === items.length && items.length > 0} onChange={() => {
                                        const allSelected = selectedItems.length === items.length;
                                        setItems(items.map(i => ({...i, selected: !allSelected})));
                                    }}/></th>
                                    <th className="p-2">Vật tư</th>
                                    <th className="p-2 text-center">Tồn kho</th>
                                    <th className="p-2 text-center">Cần nhập</th>
                                    <th className="p-2 text-center">VAT (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => {
                                    const totalStock = Object.values(item.material.stock || {}).reduce((sum, val) => sum + Number(val), 0);
                                    return (
                                        <tr key={item.material.id} className="border-b dark:border-zinc-700">
                                            <td className="p-2"><input type="checkbox" checked={item.selected} onChange={e => handleItemChange(item.material.id, 'selected', e.target.checked)} /></td>
                                            <td className="p-2 font-medium">{item.material.name} <span className="text-slate-500">({item.material.size || 'N/A'})</span></td>
                                            <td className={`p-2 text-center font-bold ${totalStock <= item.material.lowStockThreshold ? 'text-red-500' : ''}`}>{totalStock} {item.material.unit}</td>
                                            <td className="p-2 text-center">
                                                <input type="number" value={item.orderQuantity} onChange={e => handleItemChange(item.material.id, 'orderQuantity', parseInt(e.target.value, 10) || 0)} className="w-20 p-1 border rounded dark:bg-zinc-900 text-center"/>
                                            </td>
                                            <td className="p-2 text-center">
                                                <input type="number" value={item.taxRate} onChange={e => handleItemChange(item.material.id, 'taxRate', parseInt(e.target.value, 10) || 0)} className="w-16 p-1 border rounded dark:bg-zinc-900 text-center"/>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                <footer className="p-4 flex flex-wrap justify-between items-center gap-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl">
                    <div className="flex gap-2">
                         <button onClick={handleSendGmail} className="flex items-center gap-2 px-3 py-2 bg-slate-200 dark:bg-zinc-700 text-sm font-semibold rounded-md hover:bg-slate-300">
                            <FacebookIcon className="w-4 h-4 text-blue-700" /> Gửi Gmail
                        </button>
                         <button onClick={handleSendZalo} className="flex items-center gap-2 px-3 py-2 bg-slate-200 dark:bg-zinc-700 text-sm font-semibold rounded-md hover:bg-slate-300">
                            <ZaloIcon className="w-5 h-5"/> Gửi Zalo
                        </button>
                    </div>
                    <button onClick={handleCreateRequest} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">
                        Tạo Đơn Mua Hàng
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default PurchaseRequisitionModal;
