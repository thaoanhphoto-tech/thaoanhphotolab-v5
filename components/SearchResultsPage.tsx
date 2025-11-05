
import React from 'react';
import { Product } from '../productStore';
import { PageState } from '../App';
import { PricingTable, getProductPrice } from '../pricingStore';
import { User } from '../userStore';

interface SearchResultsPageProps {
  query: string;
  products: Product[];
  navigateTo: (state: PageState) => void;
  prices: PricingTable;
  currentUser: User | null;
}

const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return '';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query, products, navigateTo, prices, currentUser }) => {
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-2">
                Kết quả tìm kiếm cho: <span className="text-blue-600">"{query}"</span>
            </h1>
            <p className="text-slate-500 mb-6">{filteredProducts.length} sản phẩm được tìm thấy.</p>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredProducts.map(product => {
                        const priceInfo = getProductPrice(product.id, currentUser, prices);
                        return (
                            <button 
                                key={product.id} 
                                onClick={() => navigateTo({ page: 'product', serviceId: product.serviceId, productId: product.id })}
                                className="group text-left"
                            >
                                <div className="relative aspect-[4/5] bg-slate-100 rounded-lg overflow-hidden">
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-zinc-100 h-10">{product.name}</h3>
                                <p className="text-md font-bold text-blue-600 dark:text-blue-400">{formatPrice(priceInfo.sellingPrice)}</p>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-slate-500">Không tìm thấy sản phẩm nào phù hợp.</p>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
