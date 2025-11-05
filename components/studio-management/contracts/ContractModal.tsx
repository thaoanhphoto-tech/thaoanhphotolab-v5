import React, { useState, useEffect, useMemo } from 'react';
import { Contract, ServicePackage } from './types';
// Fix: Import Customer type from its definition file.
import type { Customer } from '../crm/types';
import { XIcon } from '../../icons/XIcon';

interface ContractModalProps {
    contract: Contract | null;
    customers: Customer[];
    servicePackages: ServicePackage[];
    onClose: () => void;
    onSave: (contractData: Omit<Contract, 'id' | 'createdAt' | 'customerName'>, id?: string) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
const parseCurrency = (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;

export const ContractModal: React.FC<ContractModalProps> = ({ contract, customers, servicePackages, onClose, onSave }) => {
    const [customerId, setCustomerId] = useState(contract?.customerId || '');
    const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>(contract?.servicePackageIds || []);
    const [additionalItems, setAdditionalItems] = useState(contract?.additionalItems || [{ description: '', price: 0 }]);
    const [discount, setDiscount] = useState(contract?.discount || 0);
    const [depositAmount, setDepositAmount] = useState(contract?.depositAmount || 0);

    const totalAmount = useMemo(() => {
        const packagesTotal = selectedPackageIds.reduce((sum, id) => {
            const pkg = servicePackages.find(p => p.id === id);
            return sum + (pkg?.price || 0);
        }, 0);
        const additionalTotal = additionalItems.reduce((sum, item) => sum + (item.price || 0), 0);
        return packagesTotal + additionalTotal - discount;
    }, [selectedPackageIds, additionalItems, discount, servicePackages]);

    const handleSave = () => {
        if (!customerId) {
            alert('Vui lòng chọn khách hàng.');
            return;
        }
        const contractData = {
            customerId,
            servicePackageIds: selectedPackageIds,
            additionalItems: additionalItems.filter(item => item.description.trim() !== ''),
            discount,
            totalAmount,
            depositAmount,
            status: contract?.status || 'draft',
            notes: ''
        };
        onSave(contractData, contract?.id);
    };

    const handlePackageToggle = (id: string) => {
        setSelectedPackageIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
    };

    const handleAdditionalItemChange = (index: number, field: 'description' | 'price', value: string | number) => {
        const newItems = [...additionalItems];
        if (field === 'price') {
             newItems[index][field] = typeof value === 'number' ? value : parseCurrency(value as string);
        } else {
             newItems[index][field] = value as string;
        }
        setAdditionalItems(newItems);
    };
    
    const addAdditionalItem = () => setAdditionalItems([...additionalItems, { description: '', price: 0 }]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">{contract ? 'Chỉnh sửa' : 'Tạo'} Hợp đồng</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="font-semibold">1. Chọn Khách hàng</label>
                        <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700">
                            <option value="">-- Chọn khách hàng từ CRM --</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold">2. Chọn Gói dịch vụ</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {servicePackages.map(pkg => (
                                <label key={pkg.id} className={`p-2 border rounded cursor-pointer ${selectedPackageIds.includes(pkg.id) ? 'bg-blue-100 border-blue-500' : 'hover:bg-slate-50'}`}>
                                    <input type="checkbox" checked={selectedPackageIds.includes(pkg.id)} onChange={() => handlePackageToggle(pkg.id)} className="mr-2"/>
                                    {pkg.name} ({formatCurrency(pkg.price)})
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="font-semibold">3. Tùy chỉnh & Chi phí phát sinh</label>
                         <div className="space-y-2 mt-2">
                            {additionalItems.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input type="text" placeholder="Mô tả" value={item.description} onChange={e => handleAdditionalItemChange(index, 'description', e.target.value)} className="flex-grow p-2 border rounded dark:bg-zinc-700"/>
                                    <input type="text" placeholder="Giá tiền" value={formatCurrency(item.price)} onChange={e => handleAdditionalItemChange(index, 'price', e.target.value)} className="w-32 p-2 border rounded dark:bg-zinc-700 text-right"/>
                                </div>
                            ))}
                        </div>
                         <button onClick={addAdditionalItem} className="text-sm font-semibold text-blue-600 mt-2">+ Thêm mục</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">Giảm giá (VNĐ)</label>
                            <input type="text" value={formatCurrency(discount)} onChange={e => setDiscount(parseCurrency(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 text-right"/>
                        </div>
                        <div>
                            <label className="font-semibold">Tiền cọc (VNĐ)</label>
                            <input type="text" value={formatCurrency(depositAmount)} onChange={e => setDepositAmount(parseCurrency(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 text-right"/>
                        </div>
                    </div>
                </div>
                 <footer className="p-4 border-t flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl">
                    <div>
                        <span className="text-sm">Tổng cộng:</span>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
                    </div>
                    <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg">Lưu Hợp đồng</button>
                </footer>
            </div>
        </div>
    );
};