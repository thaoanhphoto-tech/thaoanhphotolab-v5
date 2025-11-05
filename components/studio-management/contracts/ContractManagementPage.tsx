import React, { useState } from 'react';
// Fix: Import Customer type from its definition file.
import type { Customer } from '../crm/types';
// Fix: Import ServicePackage and Contract types from their definition file.
import type { ServicePackage, Contract } from './types';
import { PackageManagementView } from './PackageManagementView';
import { ContractListView } from './ContractListView';

interface ContractManagementPageProps {
    customers: Customer[];
    servicePackages: ServicePackage[];
    contracts: Contract[];
    onUpdatePackages: (packages: ServicePackage[]) => void;
    onUpdateContracts: (contracts: Contract[]) => void;
}

type ActiveTab = 'contracts' | 'packages';

const ContractManagementPage: React.FC<ContractManagementPageProps> = (props) => {
    const { customers, servicePackages, contracts, onUpdatePackages, onUpdateContracts } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('contracts');

    return (
        <div className="p-4 h-full flex flex-col">
            <h1 className="text-xl font-bold mb-4">Quản lý Hợp đồng & Dịch vụ</h1>

            <div className="flex border-b border-slate-200 dark:border-zinc-700 mb-4">
                <TabButton name="Danh sách Hợp đồng" isActive={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} />
                <TabButton name="Quản lý Gói dịch vụ" isActive={activeTab === 'packages'} onClick={() => setActiveTab('packages')} />
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'contracts' ? (
                    <ContractListView
                        contracts={contracts}
                        customers={customers}
                        servicePackages={servicePackages}
                        onUpdateContracts={onUpdateContracts}
                    />
                ) : (
                    <PackageManagementView
                        packages={servicePackages}
                        onUpdatePackages={onUpdatePackages}
                    />
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ name: string, isActive: boolean, onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold ${isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
        {name}
    </button>
);


export default ContractManagementPage;