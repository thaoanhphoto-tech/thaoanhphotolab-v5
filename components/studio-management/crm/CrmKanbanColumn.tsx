
import React, { useState } from 'react';
import { Customer, CustomerStatus } from './types';
import { CrmKanbanCard } from './CrmKanbanCard';

interface CrmKanbanColumnProps {
    title: string;
    status: CustomerStatus;
    customers: Customer[];
    onCardClick: (customer: Customer) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: CustomerStatus) => void;
}

export const CrmKanbanColumn: React.FC<CrmKanbanColumnProps> = ({ title, status, customers, onCardClick, onDrop }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);
    
    const handleDropInternal = (e: React.DragEvent<HTMLDivElement>) => {
        onDrop(e, status);
        setIsDragOver(false);
    };

    return (
        <div 
            className={`w-72 h-full flex flex-col bg-slate-100 dark:bg-zinc-800/50 rounded-lg shadow-inner transition-colors ${isDragOver ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropInternal}
        >
            <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 p-3 border-b border-slate-200 dark:border-zinc-700">
                {title} <span className="text-slate-400 dark:text-zinc-500">{customers.length}</span>
            </h3>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {customers.map(customer => (
                    <CrmKanbanCard
                        key={customer.id}
                        customer={customer}
                        onClick={() => onCardClick(customer)}
                    />
                ))}
            </div>
        </div>
    );
};
