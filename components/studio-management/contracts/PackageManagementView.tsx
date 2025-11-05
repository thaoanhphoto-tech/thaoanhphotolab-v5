import React, { useState } from 'react';
import { ServicePackage } from './types';
import { PlusIcon } from '../../icons/PlusIcon';
import { PencilIcon } from '../../icons/PencilIcon';
import { TrashIcon } from '../../icons/TrashIcon';
import { PackageModal } from './PackageModal';

interface PackageManagementViewProps {
    packages: ServicePackage[];
    onUpdatePackages: (packages: ServicePackage[]) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';

export const PackageManagementView: React.FC<PackageManagementViewProps> = ({ packages, onUpdatePackages }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

    const openAddModal = () => {
        setEditingPackage(null);
        setIsModalOpen(true);
    };

    const openEditModal = (pkg: ServicePackage) => {
        setEditingPackage(pkg);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa gói dịch vụ này?')) {
            onUpdatePackages(packages.filter(p => p.id !== id));
        }
    };

    const handleSave = (pkg: Omit<ServicePackage, 'id'>, id?: string) => {
        if (id) {
            onUpdatePackages(packages.map(p => (p.id === id ? { ...p, ...pkg } : p)));
        } else {
            const newPackage: ServicePackage = { id: `pkg-${Date.now()}`, ...pkg };
            onUpdatePackages([...packages, newPackage]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm">
                    <PlusIcon className="w-5 h-5" /> Thêm Gói mới
                </button>
            </div>
            <div className="space-y-3">
                {packages.map(pkg => (
                    <div key={pkg.id} className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border dark:border-zinc-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold">{pkg.name}</h4>
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(pkg.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openEditModal(pkg)} className="p-1 text-slate-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(pkg.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <ul className="text-xs list-disc list-inside mt-2 text-slate-600 dark:text-zinc-400 space-y-1">
                            {pkg.items.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <PackageModal 
                    pkg={editingPackage}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};