import React, { useRef } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { User } from '../userStore';
import { PricingTable, getProductPrice } from '../pricingStore';


// Fix: Export 'bestsellerProducts' to allow it to be imported in other modules.
export const bestsellerProducts = [
    { id: 'kts-plastic-10x15-c100', name: 'Combo 100 ảnh 10x15 ép Plastic', price: 225000, originalPrice: null, imageUrl: 'https://i.imgur.com/Y1gA3n5.jpeg', isHot: true },
    { id: 'the-layngay-5p', name: 'In Ảnh Thẻ Lấy Ngay sau 5 phút', price: 40000, originalPrice: 50000, imageUrl: 'https://i.imgur.com/nQ1h2tF.jpeg', isHot: true },
    { id: 'kts-lua-6x9-c84-album', name: 'Combo 84 ảnh 6x9 ép lụa + Album', price: 239000, originalPrice: 280000, imageUrl: 'https://i.imgur.com/tq87g9d.jpeg', isHot: false },
    { id: 'kts-plastic-10x15-c36', name: 'Combo 36 ảnh 10x15 ép Plastic', price: 245000, originalPrice: 285000, imageUrl: 'https://i.imgur.com/nJq3Xn0.jpeg', isHot: false },
    { id: 'kts-plastic-lua-13x18', name: 'In Ảnh 13x18 ép Plastic/ép Lụa', price: 5000, originalPrice: 6000, imageUrl: 'https://i.imgur.com/5J3m1mJ.jpeg', isHot: false },
    { id: 'kts-polaroid-6x9', name: 'In Ảnh 6x9 Polaroid', price: 2000, originalPrice: 3000, imageUrl: 'https://i.imgur.com/Wp5t1pC.jpeg', isHot: false },
    { id: 'kts-lua-6x9-c65-album', name: 'Combo 65 ảnh 6x9 lụa + Album', price: 199000, originalPrice: 230000, imageUrl: 'https://i.imgur.com/c1q2V1Q.jpeg', isHot: false },
    { id: 'the-chup-yeucau', name: 'Chụp ảnh thẻ lấy ngay theo yêu cầu', price: 60000, originalPrice: 80000, imageUrl: 'https://i.imgur.com/0iS2Y7N.jpeg', isHot: false },
];

const StarIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400' : 'text-slate-300 dark:text-zinc-600'}`}>
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

interface BestsellerCarouselProps {
    isAdminMode: boolean;
    currentUser: User | null;
    prices: PricingTable;
}

export const BestsellerCarousel: React.FC<BestsellerCarouselProps> = ({ isAdminMode, currentUser, prices }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };
    
    const formatPrice = (price: number | null) => {
        if (price === null || price === undefined) return '';
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    }

    return (
        <section className="py-16 sm:py-20 bg-emerald-100/70 dark:bg-emerald-900/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 relative flex justify-center items-center">
                    <span className="flex-grow h-px bg-slate-200 dark:bg-zinc-700"></span>
                    <EditableText as="h2" contentKey="home_bestseller_title" defaultValue="Sản phẩm bán chạy" isAdminMode={isAdminMode} className="text-3xl font-bold text-teal-600 dark:text-teal-400 mx-6" />
                    <span className="flex-grow h-px bg-slate-200 dark:bg-zinc-700"></span>
                </div>

                <div className="relative group">
                    <button 
                        onClick={() => scroll('left')} 
                        className="absolute top-1/2 -left-4 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
                        aria-label="Scroll left"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-slate-700 dark:text-zinc-200" />
                    </button>

                    <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                        {bestsellerProducts.map(product => {
                             const priceInfo = getProductPrice(product.id, currentUser, prices);
                             const discount = priceInfo.originalPrice > 0 ? Math.round(((priceInfo.originalPrice - priceInfo.sellingPrice) / priceInfo.originalPrice) * 100) : 0;
                            return (
                                <div key={product.id} className="flex-shrink-0 w-60 group/item transition-transform duration-300 hover:-translate-y-1">
                                    <div className="relative aspect-[4/5] bg-slate-100 dark:bg-zinc-900 rounded-lg overflow-hidden border-2 border-teal-400 dark:border-teal-600">
                                        <EditableImage contentKey={`bestseller_${product.id}_image`} defaultSrc={product.imageUrl} alt={product.name} isAdminMode={isAdminMode} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" />
                                        {discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">-{discount}%</div>
                                        )}
                                        {product.isHot && !discount && (
                                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Hot</div>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <EditableText as="h3" contentKey={`bestseller_${product.id}_name`} defaultValue={product.name} isAdminMode={isAdminMode} className="text-sm font-semibold text-slate-800 dark:text-zinc-100 h-10 overflow-hidden" />
                                        <div className="flex items-center mt-1">
                                            <StarIcon filled />
                                            <StarIcon filled />
                                            <StarIcon filled />
                                            <StarIcon filled />
                                            <StarIcon />
                                        </div>
                                        <div className="mt-2 flex items-baseline gap-2">
                                            <p className="text-md font-bold text-blue-600 dark:text-blue-400">{formatPrice(priceInfo.sellingPrice)}</p>
                                            {priceInfo.originalPrice > priceInfo.sellingPrice && (
                                                <p className="text-sm text-slate-400 dark:text-zinc-500 line-through">{formatPrice(priceInfo.originalPrice)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                     <button 
                        onClick={() => scroll('right')} 
                        className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
                        aria-label="Scroll right"
                    >
                        <ChevronRightIcon className="w-6 h-6 text-slate-700 dark:text-zinc-200" />
                    </button>
                </div>
            </div>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};