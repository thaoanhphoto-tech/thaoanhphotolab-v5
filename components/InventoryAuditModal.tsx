import React, { useState } from 'react';
import { Material, Warehouse } from '../inventoryStore';
import { XIcon } from './icons/XIcon';

interface InventoryAuditModalProps {
    materials: Material[];
    warehouses: Warehouse[];
    onClose: () => void;
    onApply: (updatedMaterials: { id: string; newStock: number, warehouseId: string }[], notes: string, warehouseId: string) => void;
}

export const InventoryAuditModal: React.FC<InventoryAuditModalProps> = ({ materials, warehouses, onClose, onApply }) => {
    const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
    const [updatedStocks, setUpdatedStocks] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState('');

    const handleStockChange = (id: string, newStock: string) => {
        const parsedStock = parseInt(newStock, 10);
        if (!isNaN(parsedStock)) {
            setUpdatedStocks(prev => ({ ...prev, [id]: parsedStock }));
        } else if (newStock === '') {
            setUpdatedStocks(prev => {
                const { [id]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleSubmit = () => {
        if (!warehouseId) {
            alert('Vui lòng chọn một kho để kiểm kê.');
            return;
        }
        const updatedMaterials = Object.entries(updatedStocks).map(([id, newStock]) => ({ id, newStock, warehouseId }));
        if (updatedMaterials.length === 0 && !notes.trim()) {
            onClose(); 
            return;
        }
        onApply(updatedMaterials, notes, warehouseId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Báo cáo Kiểm kê Kho</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Chọn Kho để Kiểm kê</label>
                        <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700">
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left bg-slate-100 dark:bg-zinc-700">
                                <tr>
                                    <th className="p-2">Vật tư</th>
                                    <th className="p-2 text-center">Tồn kho Hệ thống</th>
                                    <th className="p-2 text-center">Tồn kho Thực tế</th>
                                    <th className="p-2 text-center">Chênh lệch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map(mat => {
                                    const stockInSystem = mat.stock[warehouseId] || 0;
                                    const newStock = updatedStocks[mat.id];
                                    const difference = newStock !== undefined ? newStock - stockInSystem : 0;
                                    return (
                                        <tr key={mat.id} className="border-b dark:border-zinc-700">
                                            <td className="p-2 font-medium">{mat.name} ({mat.size || 'N/A'})</td>
                                            <td className="p-2 text-center">{stockInSystem} {mat.unit}</td>
                                            <td className="p-2 text-center">
                                                <input 
                                                    type="number" 
                                                    placeholder={String(stockInSystem)}
                                                    onChange={e => handleStockChange(mat.id, e.target.value)}
                                                    className="w-24 p-1 border rounded dark:bg-zinc-900 text-center"
                                                />
                                            </td>
                                            <td className={`p-2 text-center font-bold ${difference > 0 ? 'text-green-500' : difference < 0 ? 'text-red-500' : ''}`}>
                                                {difference > 0 ? `+${difference}` : difference}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Ghi chú kiểm kê</label>
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)}
                            className="w-full mt-1 p-2 border rounded dark:bg-zinc-900 dark:border-zinc-600"
                            rows={3}
                            placeholder="VD: Hỏng hóc, thất thoát..."
                        />
                    </div>
                </div>
                <footer className="p-4 flex justify-end bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Áp dụng Kết quả & Đóng</button>
                </footer>
            </div>
        </div>
    );
};

export default InventoryAuditModal;