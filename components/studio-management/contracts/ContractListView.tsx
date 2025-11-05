import React, { useState } from 'react';
import { Contract, CONTRACT_STATUS_NAMES } from './types';
import { PlusIcon } from '../../icons/PlusIcon';
import { ContractModal } from './ContractModal';
// Fix: Import Customer type from its definition file.
import type { Customer } from '../crm/types';
// Fix: Import ServicePackage type from its definition file.
import type { ServicePackage } from './types';

interface ContractListViewProps {
    contracts: Contract[];
    customers: Customer[];
    servicePackages: ServicePackage[];
    onUpdateContracts: (contracts: Contract[]) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';

export const ContractListView: React.FC<ContractListViewProps> = (props) => {
    const { contracts, customers, servicePackages, onUpdateContracts } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);

    const openAddModal = () => {
        setEditingContract(null);
        setIsModalOpen(true);
    };

    const handleSave = (contractData: Omit<Contract, 'id' | 'createdAt' | 'customerName'>, id?: string) => {
        const customer = customers.find(c => c.id === contractData.customerId);
        if (!customer) return;

        if (id) {
            onUpdateContracts(contracts.map(c => (c.id === id ? { ...c, ...contractData, customerName: customer.name } : c)));
        } else {
            const newContract: Contract = { 
                id: `contract-${Date.now()}`, 
                createdAt: Date.now(),
                customerName: customer.name,
                ...contractData
            };
            onUpdateContracts([newContract, ...contracts]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm">
                    <PlusIcon className="w-5 h-5" /> Tạo Hợp đồng
                </button>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border dark:border-zinc-700 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left bg-slate-50 dark:bg-zinc-700/50">
                        <tr>
                            <th className="p-3">Mã HĐ</th>
                            <th className="p-3">Khách hàng</th>
                            <th className="p-3">Ngày tạo</th>
                            <th className="p-3 text-right">Tổng giá trị</th>
                            <th className="p-3">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map(contract => (
                            <tr key={contract.id} className="border-t dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer">
                                <td className="p-3 font-mono text-xs text-slate-500">#{contract.id.slice(-6)}</td>
                                <td className="p-3 font-semibold">{contract.customerName}</td>
                                <td className="p-3">{new Date(contract.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td className="p-3 text-right font-semibold text-blue-600">{formatCurrency(contract.totalAmount)}</td>
                                <td className="p-3">
                                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-slate-200 text-slate-700">
                                        {CONTRACT_STATUS_NAMES[contract.status]}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {contracts.length === 0 && <p className="text-center text-slate-500 py-6">Chưa có hợp đồng nào.</p>}
            </div>

            {isModalOpen && (
                <ContractModal 
                    contract={editingContract}
                    customers={customers}
                    servicePackages={servicePackages}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};