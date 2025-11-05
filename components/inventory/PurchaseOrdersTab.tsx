import React, { useState } from 'react';
import { PurchaseOrder, Supplier, Material } from '../../inventoryStore';

interface PurchaseOrdersTabProps {
    purchaseOrders: PurchaseOrder[];
    suppliers: Supplier[];
    materials: Material[];
    onReceive: (po: PurchaseOrder) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';

const PurchaseOrdersTab: React.FC<PurchaseOrdersTabProps> = ({ purchaseOrders, suppliers, materials, onReceive }) => {
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Danh sách Đơn Mua Hàng</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left bg-slate-50 dark:bg-zinc-700/50">
                        <tr>
                            <th className="p-3">Mã ĐH</th>
                            <th className="p-3">Ngày tạo</th>
                            <th className="p-3">Nhà Cung Cấp</th>
                            <th className="p-3 text-right">Tổng tiền</th>
                            <th className="p-3 text-center">Trạng thái</th>
                            <th className="p-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrders.map(po => {
                            const supplier = suppliers.find(s => s.id === po.supplierId);
                            const isExpanded = expandedRowId === po.id;
                            return (
                                <React.Fragment key={po.id}>
                                    <tr 
                                        className="border-t dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer"
                                        onClick={() => setExpandedRowId(isExpanded ? null : po.id)}
                                    >
                                        <td className="p-3 font-mono text-xs">{po.id.slice(-8)}</td>
                                        <td className="p-3">{new Date(po.timestamp).toLocaleDateString('vi-VN')}</td>
                                        <td className="p-3 font-medium">{supplier?.name || 'Không rõ'}</td>
                                        <td className="p-3 text-right font-bold text-blue-600">{formatCurrency(po.totalAmount)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${po.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                {po.status === 'pending' ? 'Chờ nhận hàng' : 'Đã nhận'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            {po.status === 'pending' && (
                                                <button onClick={(e) => { e.stopPropagation(); onReceive(po); }} className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700">
                                                    Nhận hàng
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-100 dark:bg-zinc-900/50">
                                            <td colSpan={6} className="p-3">
                                                <h4 className="text-xs font-bold mb-2">Chi tiết đơn hàng:</h4>
                                                <ul className="text-xs space-y-1 pl-4">
                                                    {po.items.map((item, index) => {
                                                        const material = materials.find(m => m.id === item.materialId);
                                                        return (
                                                            <li key={index} className="flex justify-between">
                                                                <span>{item.quantity} x {material?.name || 'Vật tư không xác định'}</span>
                                                                <span>@ {formatCurrency(item.unitPrice)}đ</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {purchaseOrders.length === 0 && <p className="text-center text-slate-500 py-8">Chưa có đơn mua hàng nào.</p>}
            </div>
        </div>
    );
};

export default PurchaseOrdersTab;
