import React from 'react';
import { WarehouseTransfer, Warehouse, Material } from '../../inventoryStore';

interface WarehouseTransfersTabProps {
    transfers: WarehouseTransfer[];
    warehouses: Warehouse[];
    materials: Material[];
    onCompleteTransfer: (transferId: string) => void;
}

const WarehouseTransfersTab: React.FC<WarehouseTransfersTabProps> = ({ transfers, warehouses, materials, onCompleteTransfer }) => {
    
    const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || 'Không rõ';

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Lịch sử Chuyển kho</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left bg-slate-50 dark:bg-zinc-700/50">
                        <tr>
                            <th className="p-3">Mã Lệnh</th>
                            <th className="p-3">Ngày</th>
                            <th className="p-3">Từ Kho</th>
                            <th className="p-3">Đến Kho</th>
                            <th className="p-3">Chi tiết</th>
                            <th className="p-3 text-center">Trạng thái</th>
                            <th className="p-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transfers.map(t => (
                            <tr key={t.id} className="border-t dark:border-zinc-700">
                                <td className="p-3 font-mono text-xs">{t.id.slice(-8)}</td>
                                <td className="p-3">{new Date(t.timestamp).toLocaleDateString('vi-VN')}</td>
                                <td className="p-3 font-medium">{getWarehouseName(t.fromWarehouseId)}</td>
                                <td className="p-3 font-medium">{getWarehouseName(t.toWarehouseId)}</td>
                                <td className="p-3 text-xs">
                                    {t.items.map(item => {
                                        const material = materials.find(m => m.id === item.materialId);
                                        return <div key={item.materialId}>{item.quantity} x {material?.name || 'N/A'}</div>;
                                    })}
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${t.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {t.status === 'pending' ? 'Đang chuyển' : 'Hoàn thành'}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    {t.status === 'pending' && (
                                        <button onClick={() => onCompleteTransfer(t.id)} className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                                            Nhận hàng
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transfers.length === 0 && <p className="text-center text-slate-500 py-8">Chưa có lệnh chuyển kho nào.</p>}
            </div>
        </div>
    );
};

export default WarehouseTransfersTab;