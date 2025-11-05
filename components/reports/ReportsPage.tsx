
// components/reports/ReportsPage.tsx
import React, { useState, useMemo } from 'react';
import { PrintRequest, User, ManualOrderItem } from '../../userStore';
import { Product } from '../../productStore';
import { Material, ProductBOM, Supplier, InventoryTransaction, Warehouse } from '../../inventoryStore';
import { Expense } from '../../expenseStore';
import { KpiCard } from './KpiCard';
import { SimpleBarChart, SimpleLineChart } from './charts';
import type { Contract } from '../studio-management/contracts/types';
import type { Customer } from '../studio-management/crm/types';

interface ReportsPageProps {
    contracts?: Contract[];
    customers?: Customer[];
    expenses: Expense[];
    products: Product[];
    materials: Material[];
    productBOMs: ProductBOM[];
    users: User[];
    requests: PrintRequest[];
    warehouses: Warehouse[];
    transactions: InventoryTransaction[];
    suppliers: Supplier[];
}

type FilterType = 'this_month' | 'last_month' | 'this_quarter' | 'custom';

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Tr`;
    if (Math.abs(value) >= 1_000) return `${Math.round(value / 1000)}K`;
    return new Intl.NumberFormat('vi-VN').format(value);
};

const calculateCogsForContract = (contract: Contract, products: Product[], materials: Material[], productBOMs: ProductBOM[]): number => {
    let totalCogs = 0;
    
    // This logic is simplified. A real app would have a more complex link between contract items and product BOMs.
    // For now, let's assume COGS is a percentage of the price or pre-defined on the product.
    for (const pkgId of contract.servicePackageIds) {
        // This is a placeholder logic. We need a way to link packages to products.
    }
    
    // For now, let's use a simplified COGS calculation if available on the products.
    // A better approach would be to have line items in the contract.
    // Let's simulate a 40% COGS for now.
    return contract.totalAmount * 0.4;
};


const ReportsPage: React.FC<ReportsPageProps> = ({ contracts = [], customers = [], expenses, products, materials, productBOMs, users, requests, warehouses, transactions, suppliers }) => {
    const [filter, setFilter] = useState<FilterType>('this_month');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });

    const filteredData = useMemo(() => {
        const now = new Date();
        let startTime = 0;
        let endTime = Infinity;

        switch (filter) {
            case 'this_month':
                startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                endTime = now.getTime();
                break;
            case 'last_month':
                startTime = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
                endTime = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
                break;
            case 'this_quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startTime = new Date(now.getFullYear(), quarter * 3, 1).getTime();
                endTime = now.getTime();
                break;
            case 'custom':
                if (customRange.start) startTime = new Date(customRange.start).getTime();
                if (customRange.end) endTime = new Date(customRange.end).setHours(23, 59, 59, 999);
                break;
        }
        
        const filteredContracts = contracts.filter(c => c.createdAt >= startTime && c.createdAt <= endTime);
        const filteredExpenses = expenses.filter(e => { const d = new Date(e.date).getTime(); return d >= startTime && d <= endTime; });
        const filteredCustomers = customers.filter(c => c.createdAt >= startTime && c.createdAt <= endTime);
        
        const completedContracts = filteredContracts.filter(c => c.status === 'completed');

        const totalRevenue = completedContracts.reduce((sum, c) => sum + c.totalAmount, 0);
        const totalCogs = completedContracts.reduce((sum, c) => sum + calculateCogsForContract(c, products, materials, productBOMs), 0);
        const grossProfit = totalRevenue - totalCogs;
        const totalOpex = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = grossProfit - totalOpex;
        
        const totalDebt = contracts.filter(c => c.status !== 'completed' && c.status !== 'cancelled')
                                    .reduce((sum, c) => sum + (c.totalAmount - (c.depositAmount || 0)), 0);
        
        // Chart Data
        const revenueByDay = completedContracts.reduce((acc, c) => {
            const day = new Date(c.createdAt).toLocaleDateString('vi-VN');
            acc[day] = (acc[day] || 0) + c.totalAmount;
            return acc;
        }, {} as Record<string, number>);

        const revenueByChannel = filteredContracts.reduce((acc, c) => {
            const customer = customers.find(cust => cust.id === c.customerId);
            const channel = customer?.source || 'Không rõ';
            acc[channel] = (acc[channel] || 0) + c.totalAmount;
            return acc;
        }, {} as Record<string, number>);

        const revenueByStaff = filteredContracts.reduce((acc, c) => {
            const customer = customers.find(cust => cust.id === c.customerId);
            const staff = customer?.assignedTo || 'Chưa gán';
            acc[staff] = (acc[staff] || 0) + c.totalAmount;
            return acc;
        }, {} as Record<string, number>);


        return {
            totalRevenue,
            grossProfit,
            totalOpex,
            netProfit,
            totalDebt,
            newContracts: filteredContracts.length,
            completedContracts: completedContracts.length,
            newCustomers: filteredCustomers.length,
            revenueByDay,
            revenueByChannel,
            revenueByStaff,
        };

    }, [filter, customRange, contracts, customers, expenses, products, materials, productBOMs, users]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                 <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Báo cáo & Thống kê</h1>
                 {/* Filters would go here */}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Doanh thu" value={formatCurrency(filteredData.totalRevenue) + 'đ'} />
                <KpiCard title="Lợi nhuận gộp" value={formatCurrency(filteredData.grossProfit) + 'đ'} />
                <KpiCard title="Chi phí" value={'-' + formatCurrency(filteredData.totalOpex) + 'đ'} />
                <KpiCard title="Lợi nhuận ròng" value={formatCurrency(filteredData.netProfit) + 'đ'} color={filteredData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'} />
                <KpiCard title="Công nợ" value={formatCurrency(filteredData.totalDebt) + 'đ'} color="text-amber-600" />
                <KpiCard title="Hợp đồng mới" value={String(filteredData.newContracts)} />
                <KpiCard title="Hợp đồng hoàn thành" value={String(filteredData.completedContracts)} />
                <KpiCard title="Khách hàng mới" value={String(filteredData.newCustomers)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Doanh thu theo Thời gian">
                    <SimpleLineChart data={filteredData.revenueByDay} />
                </ChartContainer>
                 <ChartContainer title="Doanh thu theo Kênh Marketing">
                     <SimpleBarChart data={Object.entries(filteredData.revenueByChannel).map(([name, value]) => ({name, value}))} />
                </ChartContainer>
                <ChartContainer title="Hiệu suất Nhân viên (Theo Doanh thu HĐ)">
                     <SimpleBarChart data={Object.entries(filteredData.revenueByStaff).map(([name, value]) => ({name, value}))} />
                </ChartContainer>
            </div>
        </div>
    );
};

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700">
        <h3 className="text-base font-semibold mb-4">{title}</h3>
        {children}
    </div>
);

export default ReportsPage;