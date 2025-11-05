

import React, { useState } from 'react';
import { StudioAsset, AssetStatus, ASSET_STATUSES, AssetLog } from './types';
import { Customer } from '../crm/types';
import { XIcon } from '../../icons/XIcon';
import { RentalModal } from './RentalModal';

interface AssetDetailModalProps {
    asset: StudioAsset;
    customers: Customer[];
    onClose: () => void;
    onUpdateAsset: (asset: StudioAsset) => void;
    onAddLog: (assetId: string, log: Omit<AssetLog, 'timestamp'>) => void;
}

type ActiveTab = 'info' | 'history';

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, customers, onClose, onUpdateAsset, onAddLog }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('info');
    const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

    const handleStatusChange = (newStatus: AssetStatus) => {
        const logActionMap: Partial<Record<AssetStatus, AssetLog['action']>> = {
            'Sẵn sàng': 'Sẵn sàng',
            'Giặt ủi': 'Bảo trì',
            'Bảo trì': 'Bảo trì',
        };

        const logAction = logActionMap[newStatus];
        if (logAction) {
            onAddLog(asset.id, { action: logAction, notes: `Chuyển sang trạng thái ${newStatus}` });
        }
        onUpdateAsset({ ...asset, status: newStatus });
    };
    
    const handleRentalSave = (customerId: string, returnDate: string) => {
        onAddLog(asset.id, { action: 'Cho thuê', relatedCustomerId: customerId, notes: `Dự kiến trả: ${returnDate}` });
        onUpdateAsset({ ...asset, status: 'Đang thuê' });
        setIsRentalModalOpen(false);
    };

    const handleReturn = () => {
        onAddLog(asset.id, { action: 'Trả lại', notes: 'Khách đã trả lại' });
        onUpdateAsset({ ...asset, status: 'Giặt ủi' }); // Default to laundry after return
    };


    const renderContent = () => {
        switch(activeTab) {
            case 'history':
                return (
                    <div className="space-y-3">
                        {asset.history.map(log => {
                             const customer = customers.find(c => c.id === log.relatedCustomerId);
                             return (
                                <div key={log.timestamp} className="p-2 bg-slate-50 dark:bg-zinc-700/50 rounded text-sm">
                                    <p><strong>{log.action}</strong> - {new Date(log.timestamp).toLocaleString('vi-VN')}</p>
                                    {customer && <p className="text-xs">Khách hàng: {customer.name}</p>}
                                    {log.notes && <p className="text-xs text-slate-500">{log.notes}</p>}
                                </div>
                            )
                        })}
                    </div>
                );
            case 'info':
            default:
                return (
                    <div className="space-y-4">
                        <div>
                            <p><strong>Mã:</strong> {asset.code}</p>
                            <p><strong>Danh mục:</strong> {asset.category}</p>
                            <p><strong>Kích thước:</strong> {asset.size || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Hành động</h4>
                            {asset.status === 'Sẵn sàng' && (
                                <button onClick={() => setIsRentalModalOpen(true)} className="w-full p-2 bg-blue-500 text-white rounded">Cho thuê</button>
                            )}
                             {asset.status === 'Đang thuê' && (
                                <button onClick={handleReturn} className="w-full p-2 bg-green-500 text-white rounded">Nhận lại</button>
                            )}
                             {(asset.status === 'Giặt ủi' || asset.status === 'Bảo trì') && (
                                <button onClick={() => handleStatusChange('Sẵn sàng')} className="w-full p-2 bg-green-500 text-white rounded">Chuyển sang Sẵn sàng</button>
                            )}
                            {asset.status !== 'Bảo trì' && (
                                <button onClick={() => handleStatusChange('Bảo trì')} className="w-full p-2 bg-purple-500 text-white rounded">Đưa đi Bảo trì / Sửa</button>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <header className="flex justify-between items-start p-4 border-b">
                        <div>
                            <h2 className="text-lg font-bold">{asset.name}</h2>
                            <p className="text-sm text-slate-500">{asset.code}</p>
                        </div>
                        <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </header>
                    <main className="p-6">
                        {renderContent()}
                    </main>
                </div>
            </div>
            {isRentalModalOpen && (
                <RentalModal 
                    customers={customers}
                    onClose={() => setIsRentalModalOpen(false)}
                    onSave={handleRentalSave}
                />
            )}
        </>
    );
};