
import React, { useState, lazy, Suspense } from 'react';
import { User, StudioStaff } from '../../userStore';
import { Loader } from '../Loader';
import type { Customer } from './crm/types';
import type { ServicePackage, Contract } from './contracts/types';
import { Expense } from '../../expenseStore';
import { PersonnelProfile, TimeClockEntry } from '../../userStore';
import { PostProductionProject } from './post-production/types';
import { StudioAsset, AssetLog } from '../../inventoryStore';
import { Voucher } from '../../loyaltyStore';
import { Product } from '../../productStore';
import { Material, ProductBOM } from '../../inventoryStore';
import { PrintRequest } from '../../userStore';


// Icons
import { HomeIcon } from '../icons/HomeIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { BanknotesIcon } from '../icons/BanknotesIcon';
import { IdCardIcon } from '../icons/IdCardIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { GiftIcon } from '../icons/GiftIcon';
import { CogIcon } from '../icons/CogIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';


type ManagementTabId = 
    | 'dashboard' 
    | 'crm' 
    | 'schedule'
    | 'contracts' 
    | 'finance' 
    | 'hr' 
    | 'post_production' 
    | 'inventory'
    | 'marketing'
    | 'reports'
    | 'admin';

interface SidebarItem {
    id: ManagementTabId;
    name: string;
    icon: React.ReactNode;
    isComingSoon?: boolean;
}

const CrmPage = lazy(() => import('./crm/CrmPage'));
const StudioSchedulePage = lazy(() => import('./schedule/StudioSchedulePage'));
const ContractManagementPage = lazy(() => import('./contracts/ContractManagementPage'));
const ExpenseManagementPage = lazy(() => import('../../components/expenses/ExpenseManagementPage'));
const HRPayrollTab = lazy(() => import('../hr/HRPayrollTab').then(module => ({ default: module.HRPayrollTab })));
const PostProductionPage = lazy(() => import('./post-production/PostProductionPage'));
const StudioInventoryPage = lazy(() => import('./inventory/StudioInventoryPage'));
const MarketingPage = lazy(() => import('./marketing/MarketingPage'));
const ReportsPage = lazy(() => import('./reports/ReportsPage'));
const SystemAdminPage = lazy(() => import('./admin/SystemAdminPage'));


const ComingSoon: React.FC = () => (
  <div className="flex items-center justify-center h-full p-8 text-center text-slate-500 dark:text-zinc-400">
    <div>
        <h2 className="text-2xl font-bold">Tính năng sắp ra mắt!</h2>
        <p className="mt-2">Chúng tôi đang làm việc chăm chỉ để mang đến cho bạn công cụ này.</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => (
    <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">QUẢN LÝ STUDIO ÁO CƯỚI</h1>
        <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
            Đây là trung tâm điều hành dành riêng cho các studio áo cưới chuyên nghiệp. Từ việc quản lý khách hàng, sắp xếp lịch, theo dõi hợp đồng đến tối ưu hóa tài chính và nhân sự, công cụ này được thiết kế để đơn giản hóa mọi quy trình, giúp bạn tập trung vào điều quan trọng nhất: sáng tạo nghệ thuật và mang lại trải nghiệm hoàn hảo cho khách hàng.
        </p>
    </div>
);


interface WeddingStudioManagerProps {
    currentUser: User;
    onBackToHub: () => void;
    customers: Customer[];
    onUpdateCustomer: (customer: Customer) => void;
    onAddCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions'>) => void;
    studioStaff: StudioStaff[]; // Use studio staff instead of all users
    servicePackages: ServicePackage[];
    contracts: Contract[];
    onUpdatePackages: (packages: ServicePackage[]) => void;
    onUpdateContracts: (contracts: Contract[]) => void;
    onAddPayment: (contractId: string, amount: number, date: string, method: string, notes?: string) => void;
    expenses: Expense[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    personnelProfiles: PersonnelProfile[];
    timeClockEntries: TimeClockEntry[];
    onUpdatePersonnelProfile: (userId: string, profile: PersonnelProfile) => void;
    postProductionProjects: PostProductionProject[];
    onUpdatePostProductionProject: (project: PostProductionProject) => void;
    studioAssets: StudioAsset[];
    onUpdateStudioAsset: (asset: StudioAsset) => void;
    onAddAssetLog: (assetId: string, log: Omit<AssetLog, 'timestamp'>) => void;
    vouchers: Voucher[];
    onAddVoucher: (voucher: Omit<Voucher, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
    products: Product[];
    materials: Material[];
    productBOMs: ProductBOM[];
    requests: PrintRequest[]; // For admin activity log
    onUpdateUser: (userId: string, updates: Partial<User>) => void; // For admin permissions
    users: User[]; // Keep global users for admin page
}

const WeddingStudioManager: React.FC<WeddingStudioManagerProps> = (props) => {
    const { currentUser, onBackToHub, customers, onUpdateCustomer, onAddCustomer, studioStaff, servicePackages, contracts, onUpdatePackages, onUpdateContracts, onAddPayment, expenses, onAddExpense, personnelProfiles, timeClockEntries, onUpdatePersonnelProfile, postProductionProjects, onUpdatePostProductionProject, studioAssets, onUpdateStudioAsset, onAddAssetLog, vouchers, onAddVoucher, products, materials, productBOMs, requests, onUpdateUser, users } = props;
    const [activeTab, setActiveTab] = useState<ManagementTabId>('dashboard');

    const sidebarItems: SidebarItem[] = [
        { id: 'dashboard', name: 'Tổng quan', icon: <HomeIcon className="w-5 h-5 mr-3"/> },
        { id: 'crm', name: 'Quản lý Khách hàng', icon: <UsersIcon className="w-5 h-5 mr-3"/> },
        { id: 'schedule', name: 'Quản lý Lịch', icon: <CalendarDaysIcon className="w-5 h-5 mr-3"/> },
        { id: 'contracts', name: 'Quản lý Hợp đồng', icon: <DocumentTextIcon className="w-5 h-5 mr-3"/> },
        { id: 'finance', name: 'Quản lý Tài chính', icon: <BanknotesIcon className="w-5 h-5 mr-3"/> },
        { id: 'hr', name: 'Quản lý Nhân sự', icon: <IdCardIcon className="w-5 h-5 mr-3"/> },
        { id: 'post_production', name: 'Quản lý Hậu kỳ', icon: <CameraIcon className="w-5 h-5 mr-3"/> },
        { id: 'inventory', name: 'Quản lý Kho', icon: <ArchiveBoxIcon className="w-5 h-5 mr-3"/> },
        { id: 'marketing', name: 'Marketing', icon: <GiftIcon className="w-5 h-5 mr-3"/> },
        { id: 'reports', name: 'Báo cáo & Thống kê', icon: <DocumentTextIcon className="w-5 h-5 mr-3"/>, isComingSoon: false },
        { id: 'admin', name: 'Quản trị Hệ thống', icon: <CogIcon className="w-5 h-5 mr-3"/>, isComingSoon: false },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'crm':
                return <CrmPage customers={customers} onUpdateCustomer={onUpdateCustomer} currentUser={currentUser} onAddCustomer={onAddCustomer} studioStaff={studioStaff} />;
            case 'schedule':
                return <StudioSchedulePage customers={customers} personnel={studioStaff} />;
            case 'contracts':
                return <ContractManagementPage 
                            customers={customers}
                            servicePackages={servicePackages}
                            contracts={contracts}
                            onUpdatePackages={onUpdatePackages}
                            onUpdateContracts={onUpdateContracts}
                        />;
            case 'finance':
                return <ExpenseManagementPage
                            expenses={expenses}
                            onAddExpense={onAddExpense}
                        />;
            case 'hr':
                return <HRPayrollTab 
                            users={users}
                            personnelProfiles={personnelProfiles}
                            timeClockEntries={timeClockEntries}
                        />;
            case 'post_production':
                return <PostProductionPage 
                            projects={postProductionProjects}
                            contracts={contracts}
                            onUpdateProject={onUpdatePostProductionProject}
                        />;
            case 'inventory':
                return <StudioInventoryPage 
                            assets={studioAssets}
                            customers={customers}
                            onUpdateAsset={onUpdateStudioAsset}
                            onAddLog={onAddAssetLog}
                        />;
            case 'marketing':
                return <MarketingPage
                            customers={customers}
                            vouchers={vouchers}
                            onAddVoucher={onAddVoucher}
                        />;
            case 'reports':
                return <ReportsPage 
                    contracts={contracts}
                    customers={customers}
                    expenses={expenses}
                    products={products}
                    materials={materials}
                    productBOMs={productBOMs}
                    users={users}
                />;
            case 'admin':
                return <SystemAdminPage
                    users={users}
                    requests={requests}
                    onUpdateUser={onUpdateUser}
                />;
            default:
                return <ComingSoon />;
        }
    };

    return (
        <div className="flex h-full rounded-lg overflow-hidden border dark:border-zinc-700 shadow-md">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-800 p-4 flex-shrink-0 flex flex-col border-r dark:border-zinc-700">
                <button onClick={onBackToHub} className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-4 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-700">
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Quay lại Trung tâm</span>
                </button>
                <nav className="space-y-1 flex-1">
                    {sidebarItems.map(item => (
                         <button
                            key={item.id}
                            onClick={() => !item.isComingSoon && setActiveTab(item.id)}
                            className={`w-full flex items-center px-4 py-2.5 rounded-md font-semibold text-sm transition-colors ${
                                activeTab === item.id
                                ? 'bg-blue-600 text-white shadow'
                                : `text-slate-700 dark:text-zinc-300 ${item.isComingSoon ? 'opacity-50 cursor-default' : 'hover:bg-slate-100 dark:hover:bg-zinc-700'}`
                            }`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                            {item.isComingSoon && <span className="ml-auto text-xs bg-slate-200 dark:bg-zinc-600 px-1.5 py-0.5 rounded">Sắp ra mắt</span>}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-900/50">
                <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader /></div>}>
                    {renderContent()}
                </Suspense>
            </main>
        </div>
    );
};

export default WeddingStudioManager;
