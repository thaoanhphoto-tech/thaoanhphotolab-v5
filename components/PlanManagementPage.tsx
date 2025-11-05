





import React, { useState } from 'react';
import { PlanDetailsTable, PlanDetail, PlanId } from '../planStore';
import { PageState } from '../App';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useToast } from './Toast';
import { ALL_TOOLS, TOOL_NAMES, ActiveApp } from '../userStore';
import { PermissionsTable, loadPermissions, savePermissions } from '../permissionStore';
import { PlusIcon } from './icons/PlusIcon';
import { XIcon } from './icons/XIcon';

interface PlanManagementPageProps {
    navigateTo: (state: PageState) => void;
    plans: PlanDetailsTable;
    onUpdatePlans: (newPlans: PlanDetailsTable) => void;
}


const ModalInputField: React.FC<{ label: string, value: string, onChange: (val: string) => void, placeholder?: string, required?: boolean }> = ({ label, value, onChange, placeholder, required }) => (
    <div>
        <label className="block text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
    </div>
);

const AddPlanModal: React.FC<{
    onClose: () => void;
    onAdd: (newPlanId: string, newPlanDetail: PlanDetail) => boolean;
}> = ({ onClose, onAdd }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [features, setFeatures] = useState('');

    const handleSubmit = () => {
        const newPlan: PlanDetail = {
            name: name.trim(),
            description: description.trim(),
            price: price.trim(),
            features: features.split('\n').filter(f => f.trim()),
            isPopular: false
        };
        const success = onAdd(id.trim().toLowerCase().replace(/\s+/g, '_'), newPlan);
        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Thêm Gói Mới</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <ModalInputField label="ID Gói *" value={id} onChange={setId} placeholder="vi-du: pro_plus (viết liền, không dấu)" required/>
                    <ModalInputField label="Tên Gói *" value={name} onChange={setName} placeholder="Ví dụ: Pro Plus" required/>
                    <ModalInputField label="Giá *" value={price} onChange={setPrice} placeholder="Ví dụ: 1.999.000đ / năm" required/>
                    <ModalInputField label="Mô tả *" value={description} onChange={setDescription} required/>
                    <div>
                        <label className="block text-sm font-medium">Tính năng (mỗi dòng một tính năng)</label>
                        <textarea 
                            value={features}
                            onChange={e => setFeatures(e.target.value)}
                            className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 h-24"
                        />
                    </div>
                </div>
                <footer className="p-4 border-t dark:border-zinc-700 flex justify-end gap-2 bg-slate-50 dark:bg-zinc-800/50 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-semibold rounded-md border dark:border-zinc-600">Hủy</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 font-semibold rounded-md bg-green-600 text-white">Thêm Gói</button>
                </footer>
            </div>
        </div>
    );
};

const PlanManagementPage: React.FC<PlanManagementPageProps> = ({ navigateTo, plans, onUpdatePlans }) => {
    const [localPlans, setLocalPlans] = useState<PlanDetailsTable>(() => JSON.parse(JSON.stringify(plans)));
    const [localPermissions, setLocalPermissions] = useState<PermissionsTable>(() => loadPermissions());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { showToast } = useToast();

    const handleInputChange = (planId: PlanId, field: keyof Omit<PlanDetail, 'features' | 'isPopular'>, value: string) => {
        setLocalPlans(prev => ({
            ...prev,
            [planId]: {
                ...prev[planId],
                [field]: value
            }
        }));
    };

    const handleFeaturesChange = (planId: PlanId, value: string) => {
        const featuresArray = value.split('\n');
         setLocalPlans(prev => ({
            ...prev,
            [planId]: {
                ...prev[planId],
                features: featuresArray
            }
        }));
    };

    const handlePermissionToggle = (planId: PlanId, toolId: ActiveApp | 'admin') => {
        setLocalPermissions(prev => {
            const newPermissions = JSON.parse(JSON.stringify(prev));
            const planPerms: string[] = newPermissions[planId] || [];
            const toolIndex = planPerms.indexOf(toolId);

            if (toolIndex > -1) {
                planPerms.splice(toolIndex, 1); // remove
            } else {
                planPerms.push(toolId); // add
            }

            newPermissions[planId] = planPerms;
            return newPermissions;
        });
    };
    
    const handleSave = () => {
        onUpdatePlans(localPlans);
        savePermissions(localPermissions);
        showToast('Đã cập nhật thông tin và quyền hạn các gói!', 'success');
    };

    const handleAddPlan = (newPlanId: string, newPlanDetail: PlanDetail): boolean => {
        if (!newPlanId.trim()) {
            showToast('ID Gói không được để trống.', 'error');
            return false;
        }
        if (localPlans[newPlanId as PlanId]) {
            showToast(`ID Gói '${newPlanId}' đã tồn tại.`, 'error');
            return false;
        }

        setLocalPlans(prev => ({
            ...prev,
            [newPlanId]: newPlanDetail
        }));
        setLocalPermissions(prev => ({
            ...prev,
            [newPlanId]: []
        }));
        showToast('Đã thêm gói mới vào danh sách. Nhấn "Lưu thay đổi" để xác nhận.', 'success');
        return true;
    };
    
    const plansToShow = Object.keys(localPlans).filter(id => id !== 'admin') as PlanId[];

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigateTo({ page: 'user_management' })}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-6"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Quay lại trang Quản trị
            </button>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý Gói Trợ lý Studio</h1>
                <div className="flex gap-2">
                    <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <PlusIcon className="w-5 h-5"/> Thêm Gói Mới
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Lưu thay đổi</button>
                </div>
            </div>
            
            <div className="space-y-6">
                {plansToShow.map(planId => {
                    const plan = localPlans[planId];
                    if (!plan) return null;
                    return (
                        <div key={planId} className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border dark:border-zinc-700">
                           <h2 className="text-xl font-bold mb-4">{plan.name}</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <InputField label="Tên Gói" value={plan.name} onChange={val => handleInputChange(planId, 'name', val)} />
                               <InputField label="Giá (VD: 999.000đ / năm)" value={plan.price} onChange={val => handleInputChange(planId, 'price', val)} />
                               <div className="md:col-span-2">
                                   <InputField label="Mô tả" value={plan.description} onChange={val => handleInputChange(planId, 'description', val)} />
                               </div>
                               <div className="md:col-span-2">
                                   <label className="block text-sm font-medium">Tính năng (mỗi dòng một tính năng)</label>
                                   <textarea 
                                       value={plan.features.join('\n')}
                                       onChange={e => handleFeaturesChange(planId, e.target.value)}
                                       className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 h-24"
                                   />
                               </div>
                               {/* Permissions Section */}
                               <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
                                   <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Quyền hạn Công cụ</label>
                                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                       {ALL_TOOLS.filter(toolId => toolId !== 'admin' && toolId !== 'introduction').map(toolId => (
                                           <label key={toolId} className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer">
                                               <input
                                                   type="checkbox"
                                                   checked={localPermissions[planId]?.includes(toolId) || false}
                                                   onChange={() => handlePermissionToggle(planId, toolId)}
                                                   className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                               />
                                               <span className="ml-2 text-sm text-slate-700 dark:text-zinc-200">{TOOL_NAMES[toolId]}</span>
                                           </label>
                                       ))}
                                   </div>
                               </div>
                           </div>
                        </div>
                    );
                })}
            </div>
            
            {isAddModalOpen && (
                <AddPlanModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddPlan}
                />
            )}
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
    </div>
);

export default PlanManagementPage;