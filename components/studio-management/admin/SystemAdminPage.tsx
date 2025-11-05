import React, { useState } from 'react';
import { User, PrintRequest } from '../../../userStore';
import { PermissionsTab } from './PermissionsTab';
import { ActivityLogTab } from './ActivityLogTab';
import { DataManagementTab } from './DataManagementTab';
import { IntegrationsTab } from './IntegrationsTab';

interface SystemAdminPageProps {
    users: User[];
    requests: PrintRequest[];
    onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

type ActiveTab = 'permissions' | 'log' | 'data' | 'integrations';

const SystemAdminPage: React.FC<SystemAdminPageProps> = ({ users, requests, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('permissions');

    const renderContent = () => {
        switch(activeTab) {
            case 'permissions':
                return <PermissionsTab users={users} onUpdateUser={onUpdateUser} />;
            case 'log':
                return <ActivityLogTab requests={requests} />;
            case 'data':
                return <DataManagementTab />;
            case 'integrations':
                return <IntegrationsTab />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h1 className="text-xl font-bold mb-4">Quản trị Hệ thống</h1>

            <div className="flex border-b border-slate-200 dark:border-zinc-700 mb-4">
                <TabButton name="Phân quyền & Vai trò" isActive={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')} />
                <TabButton name="Nhật ký Hoạt động" isActive={activeTab === 'log'} onClick={() => setActiveTab('log')} />
                <TabButton name="Sao lưu & Dữ liệu" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
                <TabButton name="Cài đặt & Tích hợp" isActive={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
            </div>

            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ name: string, isActive: boolean, onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold ${isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
        {name}
    </button>
);

export default SystemAdminPage;