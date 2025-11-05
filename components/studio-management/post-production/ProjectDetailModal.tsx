import React, { useState } from 'react';
import { PostProductionProject, POST_PRODUCTION_STATUS_NAMES, PostProductionStatus } from './types';
import { XIcon } from '../../icons/XIcon';
import { LinkIcon } from '../../icons/LinkIcon';

interface ProjectDetailModalProps {
    project: PostProductionProject;
    onClose: () => void;
    onUpdateProject: (project: PostProductionProject) => void;
}

type ActiveTab = 'files' | 'requests';

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose, onUpdateProject }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('files');
    const [localProject, setLocalProject] = useState(project);
    const [newRequest, setNewRequest] = useState('');

    const handleFileUrlChange = (field: 'originalsUrl' | 'customerSelectionUrl', value: string) => {
        setLocalProject(prev => ({
            ...prev,
            files: {
                ...prev.files,
                [field]: value
            }
        }));
    };
    
    const handleAddEditRequest = () => {
        if (!newRequest.trim()) return;
        const updatedProject = {
            ...localProject,
            editRequests: [
                { id: `req-${Date.now()}`, timestamp: Date.now(), content: newRequest, author: 'Admin' },
                ...localProject.editRequests
            ]
        };
        setLocalProject(updatedProject);
        onUpdateProject(updatedProject);
        setNewRequest('');
    };
    
    const handleSaveChanges = () => {
        onUpdateProject(localProject);
        onClose();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'requests':
                return (
                     <div className="space-y-4">
                        <div>
                            <textarea
                                value={newRequest}
                                onChange={e => setNewRequest(e.target.value)}
                                placeholder="Thêm yêu cầu chỉnh sửa từ khách hàng..."
                                className="w-full p-2 border rounded dark:bg-zinc-700 text-slate-800 dark:text-zinc-200"
                                rows={3}
                            />
                            <button onClick={handleAddEditRequest} className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded">Thêm Yêu cầu</button>
                        </div>
                        <div className="space-y-3">
                            {localProject.editRequests.map(item => (
                                <div key={item.id} className="p-2 bg-slate-50 dark:bg-zinc-700/50 rounded">
                                    <p className="text-sm">{item.content}</p>
                                    <p className="text-xs text-slate-500 mt-1">{item.author} - {new Date(item.timestamp).toLocaleString('vi-VN')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'files':
            default:
                return (
                    <div className="space-y-4">
                        <UrlInput label="Link ảnh gốc (Google Drive)" value={localProject.files.originalsUrl || ''} onChange={(val) => handleFileUrlChange('originalsUrl', val)} />
                        <UrlInput label="Link ảnh khách chọn" value={localProject.files.customerSelectionUrl || ''} onChange={(val) => handleFileUrlChange('customerSelectionUrl', val)} />
                        
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Trạng thái dự án</h4>
                             <select 
                                value={localProject.status} 
                                onChange={(e) => setLocalProject(p => ({...p, status: e.target.value as PostProductionStatus}))}
                                className="w-full p-2 border rounded dark:bg-zinc-700 text-slate-800 dark:text-zinc-200"
                            >
                                {Object.entries(POST_PRODUCTION_STATUS_NAMES).map(([key, name]) => (
                                    <option key={key} value={key}>{name}</option>
                                ))}
                            </select>
                        </div>
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
                            <h2 className="text-lg font-bold">Dự án Hậu kỳ: {project.customerName}</h2>
                            <p className="text-sm text-slate-500">Hợp đồng #{project.contractId.slice(-6)}</p>
                        </div>
                         <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="border-b border-slate-200 dark:border-zinc-700 px-6">
                        <nav className="flex gap-4">
                            <TabButton name="Tệp & Trạng thái" isActive={activeTab === 'files'} onClick={() => setActiveTab('files')} />
                            <TabButton name="Yêu cầu Chỉnh sửa" isActive={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
                        </nav>
                    </div>
                     <div className="p-6">
                        {renderContent()}
                    </div>
                </main>

                 <footer className="p-4 border-t flex justify-end bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl">
                    <button onClick={handleSaveChanges} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu Thay đổi</button>
                </footer>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ name: string, isActive: boolean, onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`py-3 border-b-2 text-sm font-semibold ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
        {name}
    </button>
);

const UrlInput: React.FC<{label: string, value: string, onChange: (val: string) => void}> = ({label, value, onChange}) => (
    <div>
        <label className="text-sm font-semibold">{label}</label>
        <div className="relative mt-1">
            <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
                type="url" 
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full p-2 pl-9 border rounded dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" 
            />
        </div>
    </div>
);