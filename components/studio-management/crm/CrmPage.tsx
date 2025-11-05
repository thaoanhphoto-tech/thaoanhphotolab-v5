

import React, { useState } from 'react';
import { Customer, CustomerStatus, CUSTOMER_STATUSES, CUSTOMER_STATUS_NAMES } from './types';
import { CrmKanbanColumn } from './CrmKanbanColumn';
import { CustomerDetailModal } from './CustomerDetailModal';
import { PlusIcon } from '../../icons/PlusIcon';
import { User, StudioStaff } from '../../../userStore';
import { AddCustomerModal } from './AddCustomerModal';

interface CrmPageProps {
    customers: Customer[];
    onUpdateCustomer: (customer: Customer) => void;
    onAddCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions'>) => void;
    currentUser: User;
    studioStaff: StudioStaff[];
}

const CrmPage: React.FC<CrmPageProps> = ({ customers, onUpdateCustomer, onAddCustomer, currentUser, studioStaff }) => {
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const handleCardClick = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: CustomerStatus) => {
        e.preventDefault();
        const customerId = e.dataTransfer.getData('customerId');
        const customer = customers.find(c => c.id === customerId);
        if (customer && customer.status !== targetStatus) {
            onUpdateCustomer({ ...customer, status: targetStatus });
        }
    };

    return (
        <div className="h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h1 className="text-xl font-bold">Quản lý Khách hàng (CRM)</h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm hover:bg-blue-700 flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" /> Thêm Khách hàng
                </button>
            </div>
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex h-full gap-4">
                    {CUSTOMER_STATUSES.map(status => (
                        <CrmKanbanColumn
                            key={status}
                            title={CUSTOMER_STATUS_NAMES[status]}
                            status={status}
                            customers={customers.filter(c => c.status === status)}
                            onCardClick={handleCardClick}
                            onDrop={handleDrop}
                        />
                    ))}
                </div>
            </div>

            {isDetailModalOpen && selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    onClose={handleCloseDetailModal}
                    onUpdateCustomer={onUpdateCustomer}
                    currentUser={currentUser}
                />
            )}

            {isAddModalOpen && (
                <AddCustomerModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={(customerData) => {
                        onAddCustomer(customerData);
                        setIsAddModalOpen(false);
                    }}
                    studioStaff={studioStaff}
                />
            )}
        </div>
    );
};

export default CrmPage;