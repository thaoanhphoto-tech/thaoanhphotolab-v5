
import React, { useState } from 'react';
import { Customer, Interaction } from './types';
import { User } from '../../../userStore';
import { XIcon } from '../../icons/XIcon';
import { PhoneIcon } from '../../icons/PhoneIcon';
// Fix: Use default import for ZaloIcon as it is a default export.
import ZaloIcon from '../../icons/ZaloIcon';
import { MessageIcon } from '../../icons/MessageIcon';

interface CustomerDetailModalProps {
    customer: Customer;
    onClose: () => void;
    onUpdateCustomer: (customer: Customer) => void;
    currentUser: User;
}

type ActiveTab = 'info' | 'history' | 'contracts';

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, onClose, onUpdateCustomer, currentUser }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('info');
    const [newInteraction, setNewInteraction] = useState('');

    const handleAddInteraction = () => {
        if (!newInteraction.trim()) return;

        const interaction: Interaction = {
            id: `int-${Date.now()}`,
            timestamp: Date.now(),
            type: 'note', // For simplicity, all manual entries are notes for now
            content: newInteraction.trim(),
            staffName: currentUser.fullName || currentUser.username,
        };
        
        onUpdateCustomer({
            ...customer,
            interactions: [interaction, ...customer.interactions],
        });
        
        setNewInteraction('');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'history':
                return (
                    <div className="space-y-4">
                        <div>
                            <textarea
                                value={newInteraction}
                                onChange={e => setNewInteraction(e.target.value)}
                                placeholder="Thêm ghi chú về cuộc gọi, tin nhắn, cuộc hẹn..."
                                className="w-full p-2 border rounded dark:bg-zinc-700 text-slate-800 dark:text-zinc-200"
                                rows={3}
                            />
                            <button onClick={handleAddInteraction} className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded">Thêm Ghi chú</button>
                        </div>
                        <div className="space-y-3">
                            {customer.interactions.map(item => (
                                <div key={item.id} className="p-2 bg-slate-50 dark:bg-zinc-700/50 rounded">
                                    <p className="text-sm">{item.content}</p>
                                    <p className="text-xs text-slate-500 mt-1">{item.staffName} - {new Date(item.timestamp).toLocaleString('vi-VN')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
             case 'contracts':
                return <p className="text-sm text-slate-500">Tính năng quản lý hợp đồng và hóa đơn sẽ sớm được cập nhật.</p>;
            case 'info':
            default:
                return (
                    <div className="space-y-3 text-sm">
                        <p><strong>Zalo:</strong> {customer.zalo}</p>
                        <p><strong>SĐT:</strong> {customer.phone}</p>
                        <p><strong>Địa chỉ:</strong> {customer.address || 'Chưa cập nhật'}</p>
                        <p><strong>Nguồn:</strong> {customer.source || 'Không rõ'}</p>
                        <p><strong>Nhân viên phụ trách:</strong> {customer.assignedTo || 'Chưa gán'}</p>
                        <p><strong>Ngày tạo:</strong> {new Date(customer.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-zinc-700 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold">{customer.name}</h2>
                            <p className="text-sm text-slate-500">{customer.phone}</p>
                        </div>
                         <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <a href={`tel:${customer.phone}`} className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1 hover:bg-green-200"><PhoneIcon className="w-4 h-4"/> Gọi điện</a>
                        <a href={`https://zalo.me/${customer.zalo}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1 hover:bg-blue-200"><ZaloIcon className="w-4 h-4"/> Chat Zalo</a>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="border-b border-slate-200 dark:border-zinc-700 px-6">
                        <nav className="flex gap-4">
                            <TabButton name="Thông tin" isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                            <TabButton name="Lịch sử Tương tác" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                            <TabButton name="Hợp đồng & Hóa đơn" isActive={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} />
                        </nav>
                    </div>
                     <div className="p-6">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ name: string, isActive: boolean, onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`py-3 border-b-2 text-sm font-semibold ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
        {name}
    </button>
);
