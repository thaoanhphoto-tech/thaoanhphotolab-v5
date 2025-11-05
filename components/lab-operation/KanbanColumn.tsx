
import React, { useState } from 'react';
import { PrintRequest, User, PrintWorkflowStatus } from '../../userStore';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  status: PrintWorkflowStatus;
  requests: PrintRequest[];
  currentUser: User;
  onUpdateRequest: (requestId: string, updates: Partial<Omit<PrintRequest, 'id'>>, actionDescription: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: PrintWorkflowStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, requests, currentUser, onUpdateRequest, onDrop }) => {
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
        {title} <span className="text-slate-400 dark:text-zinc-500">{requests.length}</span>
      </h3>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {requests.map(request => (
          <KanbanCard
            key={request.id}
            request={request}
            currentUser={currentUser}
            onUpdateRequest={onUpdateRequest}
          />
        ))}
        {requests.length === 0 && (
            <div className="text-center text-xs text-slate-400 dark:text-zinc-500 p-4">
                Không có đơn hàng nào.
            </div>
        )}
      </div>
    </div>
  );
};