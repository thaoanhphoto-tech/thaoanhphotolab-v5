


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PrintRequest, User, PrintWorkflowStatus, OperationalRole, BankAccount } from '../../userStore.ts';
import { PageState } from '../../App.tsx';
// FIX: Changed import casing to resolve module resolution error.
import { KanbanColumn } from './KanbanColumn.tsx';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon.tsx';
import { AccountingPage } from './AccountingPage.tsx';
import { PricingTable } from '../../pricingStore.ts';
import { CogIcon } from '../icons/CogIcon.tsx';
import { NotificationSettingsModal } from './NotificationSettingsModal.tsx';
import { Product } from '../../productStore.ts';
import { Expense } from '../../expenseStore.ts';
import { Material, ProductBOM } from '../../inventoryStore.ts';
import { LoyaltySettings } from '../../loyaltyStore.ts';


interface LabOperationPageProps {
  currentUser: User;
  requests: PrintRequest[];
  onUpdateRequest: (requestId: string, updates: Partial<Omit<PrintRequest, 'id'>>, actionDescription: string) => void;
  navigateTo: (state: PageState) => void;
  onRefreshRequests: () => void;
  prices: PricingTable;
  users: User[];
  products: Product[];
  onApplyVoucher: (requestId: string, voucherCode: string) => Promise<{ success: boolean; message: string; }>;
  bankAccounts: BankAccount[];
  expenses: Expense[];
  materials: Material[];
  productBOMs: ProductBOM[];
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  loyaltySettings: LoyaltySettings;
}

const KANBAN_COLUMNS: { id: PrintWorkflowStatus; title: string }[] = [
  { id: 'pending_print', title: 'Đơn Hàng Mới' },
  { id: 'printing', title: 'Đang In' },
  { id: 'finishing', title: 'Đang Hoàn Thiện' },
  { id: 'qc', title: 'QC (Kiểm tra chất lượng)' },
  { id: 'shipping', title: 'Đang Giao' },
  { id: 'delivered', title: 'Đã Giao' },
];

type Tab = 'workflow' | 'accounting';

export interface NotificationSettings {
    soundEnabled: boolean;
    browserNotifyEnabled: boolean;
}

// A valid, short 'ting' sound in base64 WAV format for better browser compatibility
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAAAe/3/8//5/+3/6v/q/+z/8P/z/+3/9f/6//4A/gD9AP4A/wD/AP4A/QD6APYA8gDwAOsA5gDkAOIA4wDkAOYA6gDsAO8A9QD5APwA/gD/AP8A/wD+APwA+gD3APIA7wDrAOgA5ADhAN4A3ADdAN4A5gDpAOwA7wD1APoA/gD/AP4A/QD6APUA8ADrAOcA4gDeANgA0wDSANMA2ADeAOEA5wDqAO8A9AD6AP4A/wD/APwA+ADzAPAA6gDmAOIA3QDYANEAzgDMAM0A0ADWAN0A4gDnAOwA8gD5AP8A/wD8APgA8wDrAOYA4ADcANUA0gDMAc0AzADQANQA3gDjAOkA7gD0APkA/AD+AP8A/AD6APQA7gDpAOQA3wDYANAAzADKAMcAwwDGAN8A4ADlAOoA8AD5AP8A/AD6APQA7gDoAOQA3gDYANAAzQDLAMgAxADHAMgA0ADZAN8A5QDtAPMA+gD+AP8A/AD6APMA7gDoAOIA3ADUAM4AywDGAMMAwADCAMgA0ADZAN8A5QDtAPMA+gD/AP8A/AD5APIA7QDoAOEA2wDQAMwAygDHAMIAvgC9AL4AwgDHAMsA0ADYAN4A4wDqAO8A9QD6AP0A/wD/AP4A/AD6APQA7wDrAOcA4wDeANkA0wDOAMsAyADFAMEAvQC6ALoAvQDBAMUAygDOANQA2wDfAOUA6gDuAPMA+gD/AP8A/QD8APoA9gDyAPAA7gDsAOkA5wDkAOIA4QDeANwA2QDXANQA0gDOAMwAygDKAMwAzoDTANcA2gDcAN8A4QDhAOIA5ADmAOcA5gDlAOQA4gDfANwA2gDTAM8A0ADRANQA2ADbANwA3gDfAOAA4QDhAOIA4gDhAOAA3gDcANkA0wDOAMwAywDKAMwA0ADVANwA3wDhAOYA6gDsAO8A8QDyAPMA9AD1AAMA';

const LabOperationPage: React.FC<LabOperationPageProps> = (props) => {
    const { currentUser, requests, onUpdateRequest, navigateTo, onRefreshRequests } = props;
    const [activeTab, setActiveTab] = useState<Tab>('workflow');
    const [draggedRequestId, setDraggedRequestId] = useState<string | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ soundEnabled: true, browserNotifyEnabled: false });
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        const storedSettings = localStorage.getItem('app_lab_notification_settings');
        if (storedSettings) {
            setNotificationSettings(JSON.parse(storedSettings));
        }
    }, []);

    const handleSaveSettings = (newSettings: NotificationSettings) => {
        setNotificationSettings(newSettings);
        localStorage.setItem('app_lab_notification_settings', JSON.stringify(newSettings));
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, requestId: string) => {
        setDraggedRequestId(requestId);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: PrintWorkflowStatus) => {
        e.preventDefault();
        if (draggedRequestId) {
            const request = requests.find(r => r.id === draggedRequestId);
            if(request && request.workflowStatus !== targetStatus) {
                onUpdateRequest(draggedRequestId, { workflowStatus: targetStatus }, `đã chuyển trạng thái sang "${targetStatus}"`);
            }
            setDraggedRequestId(null);
        }
    };
    
    // Notification for new requests
    useEffect(() => {
        const newRequestCount = requests.filter(r => r.workflowStatus === 'new').length;
        if (newRequestCount > 0) {
            if (notificationSettings.soundEnabled && audioRef.current) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
            if (notificationSettings.browserNotifyEnabled && Notification.permission === 'granted') {
                new Notification('Có đơn hàng mới!', {
                    body: `Bạn có ${newRequestCount} yêu cầu in mới cần xử lý.`,
                    icon: '/favicon.ico'
                });
            }
        }
    }, [requests, notificationSettings]);


    const renderContent = () => {
        if (activeTab === 'accounting') {
            return <AccountingPage {...props} />;
        }
        
        return (
            <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.id}
                        title={col.title}
                        status={col.id}
                        requests={requests.filter(r => r.workflowStatus === col.id)}
                        currentUser={currentUser}
                        onUpdateRequest={onUpdateRequest}
                        onDrop={handleDrop}
                        users={props.users}
                        products={props.products}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="h-screen w-screen bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 flex flex-col p-4">
             <audio ref={audioRef} src={NOTIFICATION_SOUND_URL} preload="auto"></audio>
            <header className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigateTo({ page: 'home' })} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold">Vận hành LAB</h1>
                </div>
                <div className="flex items-center gap-4">
                     <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800">
                        <CogIcon className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                        <p className="font-semibold">{currentUser.fullName}</p>
                        <p className="text-sm text-slate-500">{currentUser.operationalRole ? currentUser.operationalRole.replace(/_/g, ' ') : 'User'}</p>
                    </div>
                </div>
            </header>
            
            <div className="flex border-b border-slate-200 dark:border-zinc-700 mb-4 flex-shrink-0">
                <TabButton name="Luồng công việc" isActive={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} />
                <TabButton name="Kế toán & Công nợ" isActive={activeTab === 'accounting'} onClick={() => setActiveTab('accounting')} />
            </div>

            {renderContent()}
            
             {isSettingsModalOpen && (
                <NotificationSettingsModal
                    settings={notificationSettings}
                    onClose={() => setIsSettingsModalOpen(false)}
                    onSave={handleSaveSettings}
                />
            )}
        </div>
    );
};

const TabButton: React.FC<{ name: string, isActive: boolean, onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
        {name}
    </button>
);

export default LabOperationPage;
