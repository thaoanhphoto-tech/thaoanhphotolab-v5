import React, { useState } from 'react';
import { PostProductionProject, PostProductionStatus, POST_PRODUCTION_STATUSES, POST_PRODUCTION_STATUS_NAMES } from './types';
import { Contract } from '../contracts/types';
import { ProjectKanbanCard } from './ProjectKanbanCard';
import { ProjectDetailModal } from './ProjectDetailModal';

interface PostProductionPageProps {
    projects: PostProductionProject[];
    contracts: Contract[];
    onUpdateProject: (project: PostProductionProject) => void;
}

const PostProductionPage: React.FC<PostProductionPageProps> = ({ projects, contracts, onUpdateProject }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<PostProductionProject | null>(null);

    const handleCardClick = (project: PostProductionProject) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: PostProductionStatus) => {
        e.preventDefault();
        const projectId = e.dataTransfer.getData('projectId');
        const project = projects.find(p => p.id === projectId);
        if (project && project.status !== targetStatus) {
            onUpdateProject({ ...project, status: targetStatus });
        }
    };

    return (
        <div className="h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h1 className="text-xl font-bold">Quản lý Ảnh & Hậu kỳ</h1>
            </div>
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex h-full gap-4">
                    {POST_PRODUCTION_STATUSES.map(status => (
                        <div 
                            key={status}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, status)}
                            className="w-72 h-full flex flex-col bg-slate-100 dark:bg-zinc-800/50 rounded-lg shadow-inner"
                        >
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 p-3 border-b border-slate-200 dark:border-zinc-700">
                                {POST_PRODUCTION_STATUS_NAMES[status]}
                                <span className="text-slate-400 dark:text-zinc-500 ml-2">{projects.filter(p => p.status === status).length}</span>
                            </h3>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {projects.filter(p => p.status === status).map(project => (
                                    <ProjectKanbanCard
                                        key={project.id}
                                        project={project}
                                        onClick={() => handleCardClick(project)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && selectedProject && (
                <ProjectDetailModal
                    project={selectedProject}
                    onClose={() => setIsModalOpen(false)}
                    onUpdateProject={onUpdateProject}
                />
            )}
        </div>
    );
};

export default PostProductionPage;