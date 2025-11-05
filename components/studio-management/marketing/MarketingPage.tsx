
import React, { useState } from 'react';
import { Customer } from '../crm/types';
import { Voucher } from '../../../loyaltyStore';
import { DashboardView } from './DashboardView';
import { PromotionsView } from './PromotionsView';

interface MarketingPageProps {
    customers: Customer[];
    vouchers: Voucher[];
    onAddVoucher: (voucher: Omit<Voucher, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
}

type ActiveTab = 'dashboard' | 'promotions';

const MarketingPage: React.FC<MarketingPageProps> = (props) => {
    const { customers, vouchers, onAddVoucher } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

    return (
        <div className="p-4 h-full flex flex-col">
            <h1 className="text-xl font-bold mb-4">Marketing & Chăm sóc Khách hàng</h1>
            <div className="flex border-b border-slate-200 dark:border-zinc-700 mb-4">
                <TabButton name="Tổng quan" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <TabButton name="Quản lý Khuyến mãi" isActive={activeTab === 'promotions'} onClick={() => setActiveTab('promotions')} />
            </div>
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'dashboard' ? (
                    <DashboardView customers={customers} />
                ) : (
                    <PromotionsView vouchers={vouchers} onAddVoucher={onAddVoucher} />
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ name: string, isActive: boolean, onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold ${isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
        {name}
    </button>
);

export default MarketingPage;
