// components/inventory/InboundSlipModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { XIcon } from '../icons/XIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { Material, Supplier, InventoryTransaction, PurchaseOrder, Warehouse } from '../../inventoryStore';
import { User } from '../../userStore';
import { useToast } from '../Toast';

interface InboundSlipModalProps {
    materials: Material[];
    suppliers: Supplier[];
    currentUser: User;
    onClose: () => void;
    onSave: (transaction: Omit<InventoryTransaction, 'id' | 'timestamp'>) => void;
    onUpdateSuppliers: (suppliers: Supplier[]) => void;
    purchaseOrder?: PurchaseOrder | null;
    onUpdatePurchaseOrder?: (orderId: string, updates: Partial<PurchaseOrder>) => void;
    warehouses: Warehouse[];
}

interface SlipItem {
    id: number;
    materialId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number; // as percentage
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
const parseCurrency = (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;


const InboundSlipModal: React.FC<InboundSlipModalProps> = (props) => {
    const { materials, suppliers, currentUser, onClose, onSave, onUpdateSuppliers, purchaseOrder, onUpdatePurchaseOrder, warehouses } = props;
    const [supplierId, setSupplierId] = useState(purchaseOrder?.supplierId || '');
    const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
    const [items, setItems] = useState<SlipItem[]>([{ id: Date.now(), materialId: '', quantity: 1, unitPrice: 0, taxRate: 10 }]);
    const [amountPaid, setAmountPaid] = useState(0);
    const [notes, setNotes] = useState(purchaseOrder ? `Nhập hàng theo ĐH #${purchaseOrder.id.slice(-8)}` : '');
    const [invoiceNumber, setInvoiceNumber] = useState(purchaseOrder?.invoiceNumber || '');
    const [invoiceDate, setInvoiceDate] = useState(purchaseOrder?.invoiceDate || new Date().toISOString().split('T')[0]);
    const { showToast } = useToast();

    useEffect(() => {
        if (purchaseOrder) {
            setSupplierId(purchaseOrder.supplierId);
            setItems(purchaseOrder.items.map(item => ({
                id: Date.now() + Math.random(),
                materialId: item.materialId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate || 10,
            })));
            setInvoiceNumber(purchaseOrder.invoiceNumber || '');
            setInvoiceDate(purchaseOrder.invoiceDate || new Date().toISOString().split('T')[0]);
        }
    }, [purchaseOrder]);

    const { subtotal, totalVat, grandTotal, remainingDebt } = useMemo(() => {
        let subtotal = 0;
        let totalVat = 0;
        items.forEach(item => {
            const itemTotal = item.quantity * item.unitPrice;
            subtotal += itemTotal;
            totalVat += itemTotal * ((item.taxRate || 0) / 100);
        });
        const grandTotal = subtotal + totalVat;
        const remainingDebt = grandTotal - amountPaid;
        return { subtotal, totalVat, grandTotal, remainingDebt };
    }, [items, amountPaid]);

    const handleItemChange = (id: number, field: keyof SlipItem, value: string | number) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'materialId' && !purchaseOrder) {
                    const material = materials.find(m => m.id === value);
                    if (material) updatedItem.unitPrice = material.unitPrice;
                }
                if (field === 'unitPrice') {
                    updatedItem.unitPrice = typeof value === 'string' ? parseCurrency(value) : value;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), materialId: '', quantity: 1, unitPrice: 0, taxRate: 10 }]);
    };
    
    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };
    
    const handleSubmit = () => {
        if (!supplierId || !warehouseId || items.some(item => !item.materialId || item.quantity <= 0)) {
            showToast('Vui lòng chọn NCC, Kho và điền đủ thông tin vật tư.', 'error');
            return;
        }

        items.forEach(item => {
            onSave({
                materialId: item.materialId,
                type: 'inbound',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                supplierId,
                notes,
                staffId: currentUser.id,
                warehouseId,
                invoiceNumber,
                invoiceDate,
                taxRate: item.taxRate,
            });
        });

        const supplier = suppliers.find(s => s.id === supplierId);
        if (supplier) {
            const updatedDebtAmount = supplier.debtAmount + remainingDebt;
            const updatedSupplier = { ...supplier, debtAmount: updatedDebtAmount };
            const updatedSuppliersList = suppliers.map(s => s.id === supplierId ? updatedSupplier : s);
            onUpdateSuppliers(updatedSuppliersList);
        }
        
        if (purchaseOrder && onUpdatePurchaseOrder) {
            onUpdatePurchaseOrder(purchaseOrder.id, { status: 'received' });
        }

        showToast('Đã tạo phiếu nhập kho thành công!', 'success');
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-4xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">Tạo Phiếu Nhập Kho</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5"/></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SelectField label="Nhà cung cấp" value={supplierId} onChange={setSupplierId} options={suppliers.map(s => ({ value: s.id, label: s.name }))} required disabled={!!purchaseOrder} />
                        <SelectField label="Nhập vào Kho" value={warehouseId} onChange={setWarehouseId} options={warehouses.map(w => ({ value: w.id, label: w.name }))} required />
                        <InputField label="Số Hóa đơn" value={invoiceNumber} onChange={setInvoiceNumber} />
                        <InputField label="Ngày Hóa đơn" type="date" value={invoiceDate} onChange={setInvoiceDate} />
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Chi tiết Vật tư</h4>
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="grid grid-cols-[2.5fr_1fr_1fr_0.7fr_40px] gap-2 items-end p-2 border rounded-md dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50">
                                    <SelectField label="Vật tư" value={item.materialId} onChange={(val: string) => handleItemChange(item.id, 'materialId', val)} options={materials.map(m => ({ value: m.id, label: `${m.name} ${m.size ? `(${m.size})` : ''}` }))} required disabled={!!purchaseOrder} />
                                    <InputField label="Số lượng" type="number" value={String(item.quantity)} onChange={(val: string) => handleItemChange(item.id, 'quantity', Number(val))} required />
                                    <InputField label="Đơn giá (trước VAT)" type="text" value={formatCurrency(item.unitPrice)} onChange={(val: string) => handleItemChange(item.id, 'unitPrice', val)} disabled={!!purchaseOrder} />
                                    <InputField label="VAT (%)" type="number" value={String(item.taxRate)} onChange={(val: string) => handleItemChange(item.id, 'taxRate', Number(val))} />
                                    {!purchaseOrder && <button onClick={() => removeItem(item.id)} disabled={items.length <= 1} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"><TrashIcon className="w-5 h-5"/></button>}
                                </div>
                            ))}
                        </div>
                         {!purchaseOrder && <button onClick={addItem} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"><PlusCircleIcon className="w-5 h-5" /> Thêm vật tư</button>}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                         <InputField label="Ghi chú" value={notes} onChange={setNotes} placeholder="VD: Nhập hàng đợt 1"/>
                         <InputField label="Số tiền đã thanh toán (VNĐ)" type="text" value={formatCurrency(amountPaid)} onChange={(val: string) => setAmountPaid(parseCurrency(val))} />
                    </div>

                </div>
                <footer className="p-4 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50 rounded-b-lg">
                    <div className="text-sm">
                        <p>Tiền hàng: <span className="font-semibold">{formatCurrency(subtotal)}đ</span></p>
                        <p>Tiền thuế: <span className="font-semibold">{formatCurrency(totalVat)}đ</span></p>
                        <p className="font-bold">Tổng cộng: <span className="font-bold text-blue-600">{formatCurrency(grandTotal)}đ</span></p>
                        <p className="font-bold">Công nợ còn lại: <span className="font-bold text-red-500">{formatCurrency(remainingDebt)}đ</span></p>
                    </div>
                    <button onClick={handleSubmit} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg">Lưu Phiếu</button>
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

export default InboundSlipModal;