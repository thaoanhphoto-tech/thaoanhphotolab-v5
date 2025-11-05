

import React, { useRef } from 'react';
import { getUsers, saveUsers, getPersonnelProfiles, savePersonnelProfiles, PrintRequest } from '../../../userStore';
import { getProducts, saveProducts, getProductBases, saveProductBases } from '../../../productStore';
import { getSizes, saveSizes, getServiceCategories, saveServiceCategories } from '../../../catalogStore';
import { loadPrices, savePrices } from '../../../pricingStore';
import { loadLoyaltySettings, saveLoyaltySettings, getRewards, saveRewards, getVouchers, saveVouchers } from '../../../loyaltyStore';
import { getMaterials, saveMaterials, getProductBOMs, saveProductBOMs, getStudioAssets, saveStudioAssets } from '../../../inventoryStore';
import { getExpenses, saveExpenses } from '../../../expenseStore';
import { getScheduleEvents, saveScheduleEvents } from '../../../scheduleStore';
import { getCustomers, saveCustomers } from '../../../crmStore';
import { getContracts, saveContracts, getServicePackages, saveServicePackages } from '../../../contractStore';
import { getPostProductionProjects, savePostProductionProjects } from '../../../postProductionStore';
import { getStudioScheduleEvents, saveStudioScheduleEvents } from '../../../studioScheduleStore';
import { useToast } from '../../Toast';
import { Customer } from '../crm/types';

export const DataManagementTab: React.FC = () => {
    const { showToast } = useToast();
    const restoreInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = () => {
        const allUsers = getUsers();
        const backupData = {
            users: allUsers,
            personnelProfiles: getPersonnelProfiles(),
            products: getProducts(),
            productBases: getProductBases(),
            sizes: getSizes(),
            serviceCategories: getServiceCategories(),
            prices: loadPrices(),
            loyaltySettings: loadLoyaltySettings(),
            rewards: getRewards(),
            vouchers: getVouchers(),
            materials: getMaterials(),
            productBOMs: getProductBOMs(),
            studioAssets: getStudioAssets(),
            expenses: getExpenses(),
            scheduleEvents: allUsers.map(u => ({ userId: u.id, events: getScheduleEvents(u.id) })),
            customers: allUsers.map(u => ({ userId: u.id, data: getCustomers(u.id) })),
            contracts: getContracts(),
            servicePackages: getServicePackages(),
            postProductionProjects: getPostProductionProjects(),
            studioScheduleEvents: getStudioScheduleEvents(),
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `thaoanh_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Đã xuất dữ liệu thành công!', 'success');
    };
    
    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                
                if (data.users) saveUsers(data.users);
                if (data.personnelProfiles) savePersonnelProfiles(data.personnelProfiles);
                if (data.products) saveProducts(data.products);
                if (data.productBases) saveProductBases(data.productBases);
                if (data.sizes) saveSizes(data.sizes);
                if (data.serviceCategories) saveServiceCategories(data.serviceCategories);
                if (data.prices) savePrices(data.prices);
                if (data.loyaltySettings) saveLoyaltySettings(data.loyaltySettings);
                if (data.rewards) saveRewards(data.rewards);
                if (data.vouchers) saveVouchers(data.vouchers);
                if (data.materials) saveMaterials(data.materials);
                if (data.productBOMs) saveProductBOMs(data.productBOMs);
                if (data.studioAssets) saveStudioAssets(data.studioAssets);
                if (data.expenses) saveExpenses(data.expenses);
                if (data.scheduleEvents && Array.isArray(data.scheduleEvents)) {
                    data.scheduleEvents.forEach((userEvents: { userId: string, events: any[] }) => {
                        saveScheduleEvents(userEvents.userId, userEvents.events);
                    });
                }
                if (data.customers && Array.isArray(data.customers)) {
                    data.customers.forEach((userCustomers: { userId: string, data: Customer[] }) => {
                        saveCustomers(userCustomers.userId, userCustomers.data);
                    });
                }
                if (data.contracts) saveContracts(data.contracts);
                if (data.servicePackages) saveServicePackages(data.servicePackages);
                if (data.postProductionProjects) savePostProductionProjects(data.postProductionProjects);
                if (data.studioScheduleEvents) saveStudioScheduleEvents(data.studioScheduleEvents);

                showToast('Khôi phục dữ liệu thành công! Vui lòng tải lại trang.', 'success');
                setTimeout(() => window.location.reload(), 1500);

            } catch (err) {
                console.error("Restore failed:", err);
                showToast('Lỗi: Tệp sao lưu không hợp lệ.', 'error');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border dark:border-zinc-700">
                <h3 className="font-semibold text-lg">Sao lưu Dữ liệu</h3>
                <p className="text-sm text-slate-500 mt-1">Xuất toàn bộ dữ liệu của ứng dụng (người dùng, sản phẩm, đơn hàng,...) ra một tệp JSON an toàn.</p>
                <button onClick={handleBackup} className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md">Tải về tệp Sao lưu</button>
            </div>
             <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-red-500/50 dark:border-red-500/30">
                <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Khôi phục Dữ liệu</h3>
                <p className="text-sm text-slate-500 mt-1"><strong className="text-red-500">CẢNH BÁO: Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại.</strong></p>
                <input type="file" accept=".json" ref={restoreInputRef} onChange={handleRestore} className="hidden" />
                <button onClick={() => restoreInputRef.current?.click()} className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-md">Chọn tệp & Khôi phục</button>
            </div>
        </div>
    );
};
