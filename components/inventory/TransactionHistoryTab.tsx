// components/inventory/TransactionHistoryTab.tsx
import React from 'react';
// Fix: Import User from userStore, not inventoryStore
import { InventoryTransaction, Material, Supplier } from '../../inventoryStore';
import { User } from '../../userStore';

interface TransactionHistoryTabProps {
    transactions: InventoryTransaction[];
    materials: Material[];
    suppliers: Supplier[];
    users: User[]; // All users in the system
}

const getTransactionTypeName = (type: InventoryTransaction['type']) => {
    switch (type) {
        case 'inbound': return 'Nhập kho';
        case 'outbound_production': return 'Xuất sản xuất';
        case 'outbound_sale': return 'Xuất Bán';
        case 'outbound_return': return 'Xuất trả NCC';
        case 'adjustment_audit': return 'Điều chỉnh kiểm kê';
        case 'adjustment_destroy': return 'Hủy hàng';
        case 'outbound_payment': return 'Thanh toán NCC';
        case 'transfer_in': return 'Nhận chuyển kho';
        case 'transfer_out': return 'Xuất chuyển kho';
        default: return 'Giao dịch khác';
    }
};

const TransactionHistoryTab: React.FC<TransactionHistoryTabProps> = ({ transactions, materials, suppliers, users }) => {
    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Lịch sử Giao dịch</h2>
            <div className="max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-700/50 text-left sticky top-0">
                        <tr>
                            <th className="p-2">Thời gian</th>
                            <th className="p-2">Đối tượng</th>
                            <th className="p-2">Loại GD</th>
                            <th className="p-2 text-right">Số lượng / Giá trị</th>
                            <th className="p-2">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(trans => {
                            if (trans.type === 'outbound_payment') {
                                const supplier = suppliers.find(s => s.id === trans.supplierId);
                                const paymentAmount = trans.quantity * trans.unitPrice;
                                return (
                                    <tr key={trans.id} className="border-t dark:border-zinc-700">
                                        <td className="p-2 text-xs text-slate-500">{new Date(trans.timestamp).toLocaleString('vi-VN')}</td>
                                        <td className="p-2 font-medium">{supplier?.name || 'Thanh toán'}</td>
                                        <td className="p-2 text-xs font-semibold text-green-700">{getTransactionTypeName(trans.type)}</td>
                                        <td className="p-2 text-right font-bold text-green-600">-{new Intl.NumberFormat('vi-VN').format(paymentAmount)}đ</td>
                                        <td className="p-2 text-xs text-slate-500">{trans.notes}</td>
                                    </tr>
                                );
                            }
                            
                            const material = materials.find(m => m.id === trans.materialId);
                            const isOut = trans.quantity < 0;
                            return (
                                <tr key={trans.id} className="border-t dark:border-zinc-700">
                                    <td className="p-2 text-xs text-slate-500">{new Date(trans.timestamp).toLocaleString('vi-VN')}</td>
                                    <td className="p-2 font-medium">{material?.name || 'N/A'} {material?.size ? `(${material.size})` : ''}</td>
                                    <td className="p-2 text-xs font-semibold">{getTransactionTypeName(trans.type)}</td>
                                    <td className={`p-2 text-right font-bold ${isOut ? 'text-red-500' : 'text-green-500'}`}>{trans.quantity} {material?.unit}</td>
                                    <td className="p-2 text-xs text-slate-500">{trans.notes}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {transactions.length === 0 && <p className="text-center text-slate-500 py-8">Chưa có giao dịch nào.</p>}
            </div>
        </div>
    );
};

export default TransactionHistoryTab;
