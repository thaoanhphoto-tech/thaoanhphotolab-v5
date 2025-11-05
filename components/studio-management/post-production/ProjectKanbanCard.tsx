import React from 'react';
import { PostProductionProject } from './types';

interface ProjectKanbanCardProps {
    project: PostProductionProject;
    onClick: () => void;
}

export const ProjectKanbanCard: React.FC<ProjectKanbanCardProps> = ({ project, onClick }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('projectId', project.id);
    };

    return (
        <div
            onClick={onClick}
            draggable
            onDragStart={handleDragStart}
            className="bg-white dark:bg-zinc-700 p-3 rounded-md shadow border border-slate-200 dark:border-zinc-600 cursor-pointer hover:shadow-md hover:border-blue-500"
        >
            <p className="font-semibold text-sm text-slate-800 dark:text-zinc-100">{project.customerName}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">HĐ: #{project.contractId.slice(-6)}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Ngày tạo: {new Date(project.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
    );
};
