import React, { useState, useRef } from 'react';
import { XIcon } from '../icons/XIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { Loader } from '../Loader';
import { Material, Supplier, InventoryTransaction, Warehouse } from '../../inventoryStore';
import { User } from '../../userStore';
import { useToast } from '../Toast';
import { analyzeInvoiceForStockIn } from '../../services/geminiService';

interface AiInboundSlipModalProps {
    materials: Material[];
    suppliers: Supplier[];
    currentUser: User;
    onClose: () => void;
    onUpdateSuppliers: (suppliers: Supplier[]) => void;
    onAddTransaction: (transaction: Omit<InventoryTransaction, 'id' | 'timestamp'>) => void;
    warehouses: Warehouse[];
}

interface AnalyzedItem {
    materialName: string;
    quantity: number;
    unitPrice: number;
}

interface VerifiedItem extends AnalyzedItem {
    id: string; // unique id for react key
    materialId: string; // linked material in system
}

type ModalPhase = 'upload' | 'processing' | 'verification';

export const AiInboundSlipModal: React.FC<AiInboundSlipModalProps> = (props) => {
    const { materials, suppliers, currentUser, onClose, onUpdateSuppliers, onAddTransaction } = props;
    const [phase, setPhase] = useState<ModalPhase>('upload');
    const [invoiceImage, setInvoiceImage] = useState<File | null>(null);
    const [invoiceImageUrl, setInvoiceImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processingMessage, setProcessingMessage] = useState('');
    const { showToast } = useToast();

    // Verification state
    const [supplierName, setSupplierName] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [verifiedItems, setVerifiedItems] = useState<VerifiedItem[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setInvoiceImage(file);
            setInvoiceImageUrl(URL.createObjectURL(file));
            handleAnalyze(file);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) handleFileSelect(e.target.files[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if(e.dataTransfer.files) handleFileSelect(e.dataTransfer.files[0]);
    };

    const handleAnalyze = async (file: File) => {
        setPhase('processing');
        setError(null);
        
        try {
            setProcessingMessage('AI đang đọc hóa đơn...');
            const result = await analyzeInvoiceForStockIn(file);
            setProcessingMessage('Đang đối chiếu dữ liệu...');

            setSupplierName(result.supplierName || '');
            setInvoiceDate(result.invoiceDate || '');

            const mappedItems: VerifiedItem[] = (result.items || []).map((item: AnalyzedItem) => {
                // Smart matching logic
                const lowerCaseName = item.materialName.toLowerCase();
                const matchedMaterial = materials.find(m => m.name.toLowerCase().includes(lowerCaseName) || lowerCaseName.includes(m.name.toLowerCase()));

                return {
                    id: `item-${Date.now()}-${Math.random()}`,
                    ...item,
                    materialId: matchedMaterial?.id || '',
                };
            });
            setVerifiedItems(mappedItems);
            setPhase('verification');

        } catch(err: any) {
            setError(err.message || "Đã xảy ra lỗi khi phân tích.");
            setPhase('upload'); // Go back to upload screen
        }
    };
    
    const handleItemChange = (itemId: string, field: keyof VerifiedItem, value: any) => {
        setVerifiedItems(prev => prev.map(item => item.id === itemId ? {...item, [field]: value} : item));
    };

    const handleRemoveItem = (itemId: string) => {
        setVerifiedItems(prev => prev.filter(item => item.id !== itemId));
    };
    
    const handleConfirm = () => {
        let supplier = suppliers.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
        if (!supplier && supplierName.trim()) {
            const newSupplier: Supplier = {
                id: `sup-${Date.now()}`,
                name: supplierName.trim(),
                debtAmount: 0,
            };
            onUpdateSuppliers([newSupplier, ...suppliers]);
            supplier = newSupplier;
            showToast(`Đã tự động thêm nhà cung cấp mới: ${supplier.name}`, 'info');
        }

        if (!supplier) {
            showToast('Không thể xác định nhà cung cấp. Vui lòng kiểm tra lại.', 'error');
            return;
        }

        let itemsAdded = 0;
        for (const item of verifiedItems) {
            if (item.materialId && item.quantity > 0) {
                onAddTransaction({
                    materialId: item.materialId,
                    type: 'inbound',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    supplierId: supplier.id,
                    notes: `Nhập từ hóa đơn ngày ${invoiceDate || '(không rõ)'}`,
                    staffId: currentUser.id,
                });
                itemsAdded++;
            }
        }
        
        showToast(`Đã nhập thành công ${itemsAdded} loại vật tư từ hóa đơn.`, 'success');
        onClose();
    };

    const renderContent = () => {
        switch (phase) {
            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center p-8 h-64">
                        <Loader />
                        <p className="mt-4 font-semibold">{processingMessage}</p>
                    </div>
                );
            case 'verification':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-sm mb-2">Ảnh hóa đơn gốc</h3>
                            <img src={invoiceImageUrl!} alt="Invoice" className="w-full h-auto rounded-md border" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold">Nhà cung cấp</label>
                                <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} className="w-full p-2 border rounded dark:bg-zinc-700"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold">Ngày hóa đơn</label>
                                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full p-2 border rounded dark:bg-zinc-700"/>
                            </div>
                            <div className="space-y-2">
                                {verifiedItems.map(item => (
                                    <div key={item.id} className="p-2 bg-slate-50 dark:bg-zinc-900/50 rounded border dark:border-zinc-700">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-semibold">{item.materialName}</p>
                                            <button onClick={() => handleRemoveItem(item.id)}><XIcon className="w-4 h-4 text-red-500"/></button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            <select value={item.materialId} onChange={e => handleItemChange(item.id, 'materialId', e.target.value)} className={`w-full col-span-3 p-1.5 border rounded text-sm dark:bg-zinc-700 ${!item.materialId ? 'bg-yellow-100 border-yellow-400' : ''}`}>
                                                <option value="">-- Chọn vật tư trong hệ thống --</option>
                                                {materials.map(m => <option key={m.id} value={m.id}>{m.name} {m.size ? `(${m.size})` : ''}</option>)}
                                            </select>
                                            <div>
                                                <label className="text-xs">Số lượng</label>
                                                <input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))} className="w-full p-1.5 border rounded text-sm dark:bg-zinc-700"/>
                                            </div>
                                            <div>
                                                <label className="text-xs">Đơn giá</label>
                                                <input type="number" value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', Number(e.target.value))} className="w-full p-1.5 border rounded text-sm dark:bg-zinc-700"/>
                                            </div>
                                             <div>
                                                <label className="text-xs">Thành tiền</label>
                                                <input type="text" value={new Intl.NumberFormat('vi-VN').format(item.quantity * item.unitPrice)} readOnly className="w-full p-1.5 border rounded text-sm bg-slate-200 dark:bg-zinc-800 font-semibold" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'upload':
            default:
                return (
                     <div
                        onDragOver={e => {e.preventDefault(); e.stopPropagation();}}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="p-12 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                    >
                        <UploadIcon className="w-12 h-12 mx-auto text-slate-400 mb-2"/>
                        <p className="font-semibold">Kéo và thả ảnh hóa đơn vào đây</p>
                        <p className="text-sm text-slate-500">hoặc</p>
                        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                            Chọn tệp từ máy tính
                        </span>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    </div>
                );
        }
    };


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Nhập kho bằng AI</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {renderContent()}
                </div>
                {phase === 'verification' && (
                    <footer className="p-4 flex justify-end bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl">
                        <button onClick={handleConfirm} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Xác nhận & Nhập kho</button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default AiInboundSlipModal;
