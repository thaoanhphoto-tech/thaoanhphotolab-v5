
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PrintRequest, User, PrintWorkflowStatus, OperationalRole, BankAccount } from '../../userStore';
import { PageState } from '../../App';
// Fix: Correct import path casing for KanbanColumn.
import { KanbanColumn } from './KanbanColumn';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { AccountingPage } from './AccountingPage';
import { PricingTable } from '../../pricingStore';
import { CogIcon } from '../icons/CogIcon';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { Product } from '../../productStore';
import { Expense } from '../../expenseStore';
import { Material, ProductBOM } from '../../inventoryStore';


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
}

const KANBAN_COLUMNS: { id: PrintWorkflowStatus; title: string }[] = [
  { id: 'pending_print', title: 'Đơn Hàng Mới' },
  { id: 'printing', title: 'Đang In' },
  { id: 'finishing', title: 'Đang Hoàn Thiện' },
  { id: 'shipping', title: 'Đang Giao' },
  { id: 'delivered', title: 'Đã Giao' },
];

type Tab = 'workflow' | 'accounting';

export interface NotificationSettings {
    soundEnabled: boolean;
    browserNotifyEnabled: boolean;
}

const NOTIFICATION_SOUND_URL = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTSEUAAAABAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAABoY2hpbmcAAAACAAAABQAAAZEAAAJAACYgJCBAQHBwh3iHiAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq-';

const TabButton: React.FC<{ name: string, icon?: React.ReactNode, isActive: boolean, onClick: () => void }> = ({ name, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-3 text-sm font-semibold transition-colors flex items-center ${isActive ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'}`}>
        {icon} {name}
    </button>
);


const LabOperationPage: React.FC<LabOperationPageProps> = (props) => {
    const { currentUser, requests, onUpdateRequest, navigateTo, onRefreshRequests, prices, users, products, onApplyVoucher, bankAccounts, expenses, materials, productBOMs } = props;
    const [activeTab, setActiveTab] = useState<Tab>('workflow');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
        const saved = localStorage.getItem('lab_notification_settings');
        return saved ? JSON.parse(saved) : { soundEnabled: true, browserNotifyEnabled: true };
    });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Notification for new requests
    useEffect(() => {
        const newRequests = requests.filter(r => r.workflowStatus === 'new');
        if (newRequests.length > 0) {
            if (notificationSettings.soundEnabled && audioRef.current) {
                audioRef.current.play().catch(e => console.error("Audio playback failed", e));
            }
            if (notificationSettings.browserNotifyEnabled && Notification.permission === 'granted') {
                new Notification('Có đơn hàng in mới!', {
                    body: `${newRequests.length} yêu cầu mới đang chờ xử lý.`,
                    tag: 'new-print-request',
                });
            }
        }
    }, [requests, notificationSettings]);

    const handleSaveSettings = (newSettings: NotificationSettings) => {
        setNotificationSettings(newSettings);
        localStorage.setItem('lab_notification_settings', JSON.stringify(newSettings));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: PrintWorkflowStatus) => {
        const requestId = e.dataTransfer.getData('requestId');
        if (!requestId) return;
        const request = requests.find(r => r.id === requestId);
        if (request && request.workflowStatus !== targetStatus) {
            onUpdateRequest(request.id, { workflowStatus: targetStatus }, `Chuyển sang trạng thái "${KANBAN_COLUMNS.find(c => c.id === targetStatus)?.title}"`);
        }
    };

    const groupedRequests = requests.reduce((acc, req) => {
        const status = req.workflowStatus;
        if (!acc[status]) acc[status] = [];
        acc[status].push(req);
        return acc;
    }, {} as Record<PrintWorkflowStatus, PrintRequest[]>);

    return (
        <div className="flex flex-col h-screen bg-emerald-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200">
             <audio ref={audioRef} src={NOTIFICATION_SOUND_URL} preload="auto"></audio>
            <header className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center flex-shrink-0">
                <button onClick={() => navigateTo({ page: 'user_management' })} className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Quay lại Quản trị
                </button>
                 <div className="flex items-center">
                    <TabButton name="Quy trình Lab" isActive={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} />
                    <TabButton name="Kế toán" isActive={activeTab === 'accounting'} onClick={() => setActiveTab('accounting')} />
                </div>
                 <div>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700">
                        <CogIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
            </header>
            
            <main className="flex-1 overflow-hidden p-4">
                {activeTab === 'workflow' ? (
                     <div className="h-full flex gap-4 overflow-x-auto">
                        {KANBAN_COLUMNS.map(column => (
                            <KanbanColumn
                                key={column.id}
                                title={column.title}
                                status={column.id}
                                requests={groupedRequests[column.id] || []}
                                currentUser={currentUser}
                                onUpdateRequest={onUpdateRequest}
                                onDrop={handleDrop}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto">
                        <AccountingPage {...props} />
                    </div>
                )}
            </main>
            {isSettingsOpen && (
                <NotificationSettingsModal 
                    settings={notificationSettings}
                    onClose={() => setIsSettingsOpen(false)}
                    onSave={handleSaveSettings}
                />
            )}
        </div>
    );
};

export default LabOperationPage;
