






import React, { useState } from 'react';
import { Material, Warehouse } from '../../inventoryStore';
import { MaterialModal } from './MaterialModal';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface StockLevelsTabProps {
    materials: Material[];
    onUpdateMaterials: (materials: Material[]) => void;
    sizes: string[];
    warehouses: Warehouse[];
}

const StockLevelsTab: React.FC<StockLevelsTabProps> = ({ materials, onUpdateMaterials, sizes, warehouses }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    const handleOpenModal = (material: Material | null) => {
        setEditingMaterial(material);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMaterial(null);
    };

    const handleSave = (materialData: Omit<Material, 'id' | 'stock'>, id?: string) => {
        let updatedMaterials;
        if (id) {
            updatedMaterials = materials.map(m => m.id === id ? { ...m, ...materialData } : m);
        } else {
            const newMaterial: Material = {
                id: `mat-${Date.now()}`,
                ...materialData,
                stock: {}, // New materials start with empty stock object
            };
            updatedMaterials = [newMaterial, ...materials];
        }
        onUpdateMaterials(updatedMaterials);
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa vật tư này? Thao tác này không thể hoàn tác.')) {
            onUpdateMaterials(materials.filter(m => m.id !== id));
        }
    };
    
    const toggleRow = (id: string) => {
        setExpandedRowId(prevId => (prevId === id ? null : id));
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border dark:border-zinc-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tình trạng Tồn kho</h2>
                <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm">+ Thêm Vật tư mới</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-700/50 text-left">
                        <tr>
                            <th className="p-3">Vật tư</th>
                            <th className="p-3">Kích thước</th>
                            <th className="p-3 text-right">Tổng Tồn</th>
                            <th className="p-3 text-right">Ngưỡng báo</th>
                            <th className="p-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(mat => {
                            // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'. Cast value to Number.
                            const totalStock = Object.values(mat.stock || {}).reduce((sum, val) => sum + Number(val), 0);
                            const isExpanded = expandedRowId === mat.id;
                            return (
                                <React.Fragment key={mat.id}>
                                    <tr className="border-t dark:border-zinc-700">
                                        <td className="p-3 font-semibold cursor-pointer" onClick={() => toggleRow(mat.id)}>{mat.name}</td>
                                        <td className="p-3">{mat.size || 'N/A'}</td>
                                        <td className={`p-3 text-right font-bold ${totalStock <= mat.lowStockThreshold ? 'text-red-500' : ''}`}>{totalStock} {mat.unit}</td>
                                        <td className="p-3 text-right text-slate-500">{mat.lowStockThreshold}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => handleOpenModal(mat)} className="p-1 text-slate-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(mat.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-50 dark:bg-zinc-700/30">
                                            <td colSpan={5} className="p-3">
                                                <h4 className="text-xs font-bold mb-1">Chi tiết tồn kho:</h4>
                                                <ul className="text-xs list-disc list-inside pl-4">
                                                    {warehouses.map(w => (
                                                        <li key={w.id}>{w.name}: <span className="font-semibold">{mat.stock[w.id] || 0} {mat.unit}</span></li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <MaterialModal
                    material={editingMaterial}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    sizes={sizes}
                />
            )}
        </div>
    );
};

export default StockLevelsTab;