
import React from 'react';
import { Customer } from './types';
import { UsersIcon } from '../../icons/UsersIcon';

interface CrmKanbanCardProps {
    customer: Customer;
    onClick: () => void;
}

export const CrmKanbanCard: React.FC<CrmKanbanCardProps> = ({ customer, onClick }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('customerId', customer.id);
    };

    return (
        <div
            onClick={onClick}
            draggable
            onDragStart={handleDragStart}
            className="bg-white dark:bg-zinc-700 p-3 rounded-md shadow border border-slate-200 dark:border-zinc-600 cursor-pointer hover:shadow-md hover:border-blue-500"
        >
            <p className="font-semibold text-sm text-slate-800 dark:text-zinc-100">{customer.name}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{customer.phone}</p>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-600">
                <UsersIcon className="w-3 h-3"/>
                <span>{customer.assignedTo || 'Chưa gán'}</span>
            </div>
        </div>
    );
};
