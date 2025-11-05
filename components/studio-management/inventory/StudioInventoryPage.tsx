

import React, { useState, useMemo } from 'react';
import { StudioAsset, AssetCategory, AssetStatus, ASSET_CATEGORIES, ASSET_STATUSES, AssetLog } from './types';
import { Customer } from '../crm/types';
import { AssetCard } from './AssetCard';
import { AssetDetailModal } from './AssetDetailModal';
import { AssetModal } from './AssetModal';
import { PlusIcon } from '../../icons/PlusIcon';

interface StudioInventoryPageProps {
    assets: StudioAsset[];
    customers: Customer[];
    onUpdateAsset: (asset: StudioAsset) => void;
    onAddLog: (assetId: string, log: Omit<AssetLog, 'timestamp'>) => void;
}

const StudioInventoryPage: React.FC<StudioInventoryPageProps> = ({ assets, customers, onUpdateAsset, onAddLog }) => {
    const [filterCategory, setFilterCategory] = useState<AssetCategory | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<AssetStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedAsset, setSelectedAsset] = useState<StudioAsset | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const matchCategory = filterCategory === 'all' || asset.category === filterCategory;
            const matchStatus = filterStatus === 'all' || asset.status === filterStatus;
            const matchSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.code.toLowerCase().includes(searchTerm.toLowerCase());
            return matchCategory && matchStatus && matchSearch;
        });
    }, [assets, filterCategory, filterStatus, searchTerm]);
    
    const handleSaveAsset = (data: Omit<StudioAsset, 'id' | 'history' | 'status'>, id?: string) => {
        if (id) {
            const existingAsset = assets.find(a => a.id === id);
            if (existingAsset) onUpdateAsset({ ...existingAsset, ...data });
        } else {
            const newAsset: StudioAsset = {
                ...data,
                id: `asset-${Date.now()}`,
                status: 'Sẵn sàng',
                history: [{ timestamp: Date.now(), action: 'Tạo mới' }]
            };
            onUpdateAsset(newAsset); // This will add it via the App component logic
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h1 className="text-xl font-bold">Quản lý Kho</h1>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm">
                    <PlusIcon className="w-5 h-5" /> Thêm Tài sản
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-4 p-3 bg-white dark:bg-zinc-800 rounded-md border dark:border-zinc-700">
                <input type="search" placeholder="Tìm theo tên, mã..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border rounded dark:bg-zinc-700 flex-grow" />
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as any)} className="p-2 border rounded dark:bg-zinc-700">
                    <option value="all">Tất cả Danh mục</option>
                    {ASSET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="p-2 border rounded dark:bg-zinc-700">
                    <option value="all">Tất cả Trạng thái</option>
                    {ASSET_STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAssets.map(asset => (
                        <AssetCard key={asset.id} asset={asset} onClick={() => setSelectedAsset(asset)} />
                    ))}
                </div>
                {filteredAssets.length === 0 && <p className="text-center text-slate-500 py-10">Không có tài sản nào khớp.</p>}
            </div>

            {selectedAsset && (
                <AssetDetailModal 
                    asset={selectedAsset}
                    customers={customers}
                    onClose={() => setSelectedAsset(null)}
                    onUpdateAsset={onUpdateAsset}
                    onAddLog={onAddLog}
                />
            )}

            {isAddModalOpen && (
                <AssetModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveAsset}
                />
            )}
        </div>
    );
};

export default StudioInventoryPage;