import React, { useState } from 'react';
import { PageState } from '../App';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useToast } from './Toast';

interface CatalogManagementPageProps {
    productBases: string[];
    sizes: string[];
    serviceCategories: string[];
    onUpdateProductBases: (bases: string[]) => void;
    onUpdateSizes: (sizes: string[]) => void;
    onUpdateServiceCategories: (categories: string[]) => void;
    navigateTo: (state: PageState) => void;
}

const ManagementSection: React.FC<{
    title: string;
    items: string[];
    onUpdateItems: (items: string[]) => void;
}> = ({ title, items, onUpdateItems }) => {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim() && !items.map(i => i.toLowerCase()).includes(newItem.trim().toLowerCase())) {
            const updatedItems = [...items, newItem.trim()];
            onUpdateItems(updatedItems);
            setNewItem('');
        }
    };

    const handleDeleteItem = (itemToDelete: string) => {
        const updatedItems = items.filter(item => item !== itemToDelete);
        onUpdateItems(updatedItems);
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="flex gap-2 mb-4">
                <input 
                    type="text"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder="Tên mục mới..."
                    className="flex-grow p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
                />
                <button onClick={handleAddItem} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600">Thêm</button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {items.map(item => (
                    <div key={item} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-zinc-700 rounded">
                        <span>{item}</span>
                        <button onClick={() => handleDeleteItem(item)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const CatalogManagementPage: React.FC<CatalogManagementPageProps> = ({
    productBases,
    sizes,
    serviceCategories,
    onUpdateProductBases,
    onUpdateSizes,
    onUpdateServiceCategories,
    navigateTo
}) => {
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
                 <h1 className="text-3xl font-bold text-slate-800 dark:text-zinc-100">Quản lý Danh mục</h1>
            </div>
            <p className="text-slate-500 dark:text-zinc-400 mb-8">Đây là nơi quản lý các danh sách chọn (dropdown) được sử dụng trong toàn hệ thống, ví dụ như trong form "Thêm sản phẩm mới". Các thay đổi sẽ được lưu tự động.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ManagementSection 
                    title="Quản lý Loại sản phẩm gốc"
                    items={productBases}
                    onUpdateItems={onUpdateProductBases}
                />
                 <ManagementSection 
                    title="Quản lý Kích thước"
                    items={sizes}
                    onUpdateItems={onUpdateSizes}
                />
                 <ManagementSection 
                    title="Quản lý Loại dịch vụ"
                    items={serviceCategories}
                    onUpdateItems={onUpdateServiceCategories}
                />
            </div>
        </div>
    );
};