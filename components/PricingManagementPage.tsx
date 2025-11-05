import React, { useState, useEffect } from 'react';
import { services } from '../data/serviceData';
import { PricingTable, PriceEntry } from '../pricingStore';
import { useToast } from './Toast';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import type { PageState } from '../App';
// Fix: Import the 'Product' type.
import { Product } from '../productStore';

interface PricingManagementPageProps {
  navigateTo: (state: PageState) => void;
  prices: PricingTable;
  onUpdatePrices: (newPrices: PricingTable) => void;
  // Fix: Add the missing 'products' prop to resolve a type error in App.tsx.
  products: Product[];
}

type PriceType = 'retail' | 'wholesale';

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
const parseCurrency = (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;

export const PricingManagementPage: React.FC<PricingManagementPageProps> = ({ navigateTo, prices, onUpdatePrices, products }) => {
    const [localPrices, setLocalPrices] = useState<PricingTable>(() => JSON.parse(JSON.stringify(prices)));
    const [activeTab, setActiveTab] = useState<PriceType>('retail');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // This keeps the local state in sync if the global state changes from elsewhere.
        setLocalPrices(JSON.parse(JSON.stringify(prices)));
    }, [prices]);

    const handlePriceChange = (productId: string, type: 'originalPrice' | 'sellingPrice', value: number) => {
        setLocalPrices(prev => {
            // Create a deep copy to ensure immutability and trigger re-renders
            const newPrices = JSON.parse(JSON.stringify(prev));
            const currentEntry = newPrices[activeTab][productId] || { originalPrice: 0, sellingPrice: 0 };
            
            let newEntry = { ...currentEntry, [type]: value };

            if (type === 'originalPrice' && newEntry.sellingPrice > value) {
                newEntry.sellingPrice = value;
            }
            if (type === 'sellingPrice' && value > newEntry.originalPrice) {
                newEntry.originalPrice = value;
            }

            newPrices[activeTab][productId] = newEntry;
            return newPrices;
        });
    };
    
    const handleDiscountChange = (productId: string, discount: number) => {
         setLocalPrices(prev => {
            const currentEntry = prev[activeTab][productId];
            if (!currentEntry || currentEntry.originalPrice <= 0) {
                return prev;
            }
            
            // Create a deep copy to ensure immutability
            const newPrices = JSON.parse(JSON.stringify(prev));

            const cleanDiscount = Math.max(0, Math.min(100, discount));
            const newSellingPrice = Math.round(newPrices[activeTab][productId].originalPrice * (1 - cleanDiscount / 100));

            newPrices[activeTab][productId].sellingPrice = newSellingPrice;
            return newPrices;
        });
    };
    
    const handleSave = () => {
        onUpdatePrices(localPrices);
    };

    const allProducts = products;
    const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                <h1 className="text-3xl font-bold">Quản lý Bảng giá</h1>
                <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Lưu thay đổi</button>
            </div>
            
            <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('retail')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'retail' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>Bảng giá Lẻ</button>
                <button onClick={() => setActiveTab('wholesale')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'wholesale' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>Bảng giá Sỉ (VIP)</button>
            </div>

            <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-sm p-2 mb-4 border rounded-md dark:bg-zinc-700 dark:border-zinc-600"
            />

            <div className="space-y-3">
                {filteredProducts.map(product => {
                    const priceEntry = localPrices[activeTab]?.[product.id];
                    if (!priceEntry) return null;

                    const discount = priceEntry.originalPrice > 0
                        ? Math.round(((priceEntry.originalPrice - priceEntry.sellingPrice) / priceEntry.originalPrice) * 100)
                        : 0;

                    return (
                        <div key={product.id} className="grid grid-cols-1 md:grid-cols-[1fr_150px_150px_120px] gap-4 items-center p-3 bg-white dark:bg-zinc-800 rounded-md shadow-sm border dark:border-zinc-700">
                            <p className="font-semibold">{product.name}</p>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium w-20">Giá gốc:</label>
                                <input 
                                    type="text" 
                                    value={formatCurrency(priceEntry.originalPrice)} 
                                    onChange={e => handlePriceChange(product.id, 'originalPrice', parseCurrency(e.target.value))}
                                    className="w-full p-1 border rounded-md text-sm text-right dark:bg-zinc-700" 
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium w-20">Giá bán:</label>
                                <input 
                                    type="text" 
                                    value={formatCurrency(priceEntry.sellingPrice)} 
                                    onChange={e => handlePriceChange(product.id, 'sellingPrice', parseCurrency(e.target.value))}
                                    className="w-full p-1 border rounded-md text-sm text-right dark:bg-zinc-700 font-bold text-red-600" 
                                />
                            </div>
                             <div className="flex items-center gap-2">
                                <label className="text-xs font-medium w-20">Giảm %:</label>
                                <input 
                                    type="number" 
                                    value={discount < 0 ? 0 : discount} 
                                    onChange={e => handleDiscountChange(product.id, parseInt(e.target.value, 10))}
                                    className="w-full p-1 border rounded-md text-sm text-right dark:bg-zinc-700" 
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};