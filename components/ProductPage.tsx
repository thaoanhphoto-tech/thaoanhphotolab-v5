

import React, { useState } from 'react';
import { services } from '../data/serviceData';
import type { PageState } from '../App';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { PricingTable, getProductPrice } from '../pricingStore';
import { User } from '../userStore';
import { Product } from '../productStore';

interface ProductPageProps {
  productId: string;
  serviceId: string;
  navigateTo: (state: PageState) => void;
  isAdminMode: boolean;
  currentUser: User | null;
  prices: PricingTable;
  products: Product[];
  onAddToCart: (productId: string, quantity: number) => void;
}

const StarIcon: React.FC<{ filled?: boolean }> = ({ filled = true }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-slate-300'}`}>
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);


export const ProductPage: React.FC<ProductPageProps> = ({ productId, serviceId, navigateTo, isAdminMode, currentUser, prices, products, onAddToCart }) => {
  const service = services.find(s => s.id === serviceId);
  const product = products.find(p => p.id === productId);

  const [selectedImage, setSelectedImage] = useState(product?.imageUrl || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const relatedProducts = products.filter(p => p.id !== productId).slice(0, 5);
  const sameCategoryProducts = products.filter(p => p.serviceId === serviceId && p.id !== productId).slice(0, 8) || [];

  if (!service || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Không tìm thấy sản phẩm</h2>
        <button onClick={() => navigateTo({ page: 'home' })} className="mt-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Quay về Trang chủ
        </button>
      </div>
    );
  }

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return '';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }

  const priceInfo = getProductPrice(product.id, currentUser, prices);
  const savings = priceInfo.originalPrice > 0 ? priceInfo.originalPrice - priceInfo.sellingPrice : 0;
  
  return (
    <div className="bg-emerald-50 dark:bg-emerald-950">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <button onClick={() => navigateTo({ page: 'home' })} className="hover:text-blue-600">Trang chủ</button>
            <span>/</span>
            <button onClick={() => navigateTo({ page: 'service', serviceId: service.id })} className="hover:text-blue-600">{service.name}</button>
            <span>/</span>
            <span className="text-slate-800 dark:text-zinc-200">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Main content */}
            <main>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <div className="aspect-square w-full rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700">
                            <EditableImage contentKey={`prod_${product.id}_mainimg`} defaultSrc={selectedImage} alt={product.name} isAdminMode={isAdminMode} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-2 mt-2">
                            {(product.gallery || [product.imageUrl]).map((img: string, index: number) => (
                                <button key={index} onClick={() => setSelectedImage(img)} className={`w-16 h-16 rounded border-2 p-0.5 ${selectedImage === img ? 'border-blue-500' : 'border-transparent'}`}>
                                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover rounded-sm" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <EditableText as="h1" contentKey={`prod_${product.id}_name`} defaultValue={product.name} isAdminMode={isAdminMode} className="text-2xl font-bold text-slate-800 dark:text-zinc-100" />
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-zinc-400">
                            <span>Thương hiệu: <span className="font-semibold text-blue-600">Thảo Anh Photo Lab</span></span>
                            <span>Mã SP: IA 69</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_,i) => <StarIcon key={i} />)}
                            <span className="text-xs text-slate-500 ml-1">(15 đánh giá)</span>
                        </div>
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-lg">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-red-600">{formatPrice(priceInfo.sellingPrice)}</span>
                                {priceInfo.originalPrice > priceInfo.sellingPrice && (
                                    <span className="text-lg text-slate-400 line-through">{formatPrice(priceInfo.originalPrice)}</span>
                                )}
                            </div>
                             {savings > 0 && <p className="text-sm text-slate-600 dark:text-zinc-300 mt-1">(Tiết kiệm: <span className="font-bold">{formatPrice(savings)}</span>)</p>}
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                            <span className="font-semibold">Số lượng:</span>
                            <div className="flex items-center border border-slate-300 rounded">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1 text-lg">-</button>
                                <input type="text" value={quantity} readOnly className="w-12 text-center border-l border-r py-1 dark:bg-zinc-800" />
                                <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-1 text-lg">+</button>
                            </div>
                        </div>

                        <button onClick={() => onAddToCart(product.id, quantity)} className="w-full mt-6 py-3 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition-colors">Thêm vào giỏ hàng</button>
                        
                        <div className="text-center mt-3">
                            <p className="text-sm">Hoặc gọi hotline để đặt hàng: <strong className="text-red-500">0978.983.136</strong></p>
                        </div>

                        <div className="flex items-center gap-2 mt-4 text-sm">
                            <span className="font-semibold">Chia sẻ:</span>
                            <a href="#" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><FacebookIcon className="w-5 h-5 text-blue-700"/></a>
                        </div>
                    </div>
                </div>

                {/* Description Tabs */}
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700 mt-8">
                    <div className="border-b border-slate-200 dark:border-zinc-700 mb-6">
                        <nav className="flex gap-6">
                            <button onClick={() => setActiveTab('description')} className={`py-2 border-b-2 text-sm font-semibold ${activeTab === 'description' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Mô tả</button>
                        </nav>
                    </div>
                    <div>
                        {product.contentSections?.map((section: any, index: number) => (
                             <div key={index} className="mb-8">
                                <EditableText as="h3" contentKey={`prod_${product.id}_sec${index}_title`} defaultValue={section.title} isAdminMode={isAdminMode} className="text-lg font-bold text-orange-500 mb-3" />
                                {section.paragraphs?.map((p: string, pIndex: number) => (
                                    <EditableText as="p" key={pIndex} contentKey={`prod_${product.id}_sec${index}_p${pIndex}`} defaultValue={p} isAdminMode={isAdminMode} className="text-slate-600 dark:text-zinc-300 leading-relaxed mb-3" />
                                ))}
                                {section.listItems && section.listItems.length > 0 && (
                                    <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300 pl-4 mb-3">
                                        {section.listItems.map((item: string, itemIndex: number) => (
                                             <EditableText as="li" key={itemIndex} contentKey={`prod_${product.id}_sec${index}_li${itemIndex}`} defaultValue={item} isAdminMode={isAdminMode} />
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-4">
                                     <EditableImage contentKey={`prod_${product.id}_sec${index}_img`} defaultSrc={section.imageUrl} alt={section.title} isAdminMode={isAdminMode} className="w-full h-auto rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            {/* Sidebar */}
            <aside className="space-y-6">
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700">
                    <h3 className="font-semibold text-slate-800 dark:text-zinc-100 mb-4 border-b pb-2">Hàng mới về</h3>
                    <ul className="space-y-4">
                        {relatedProducts.map(p => {
                            const relatedPriceInfo = getProductPrice(p.id, currentUser, prices);
                            return (
                             <li key={p.id}>
                                <button onClick={() => { if (p.serviceId) navigateTo({ page: 'product', serviceId: p.serviceId, productId: p.id })}} className="flex items-center gap-3 text-left w-full hover:bg-slate-50 dark:hover:bg-zinc-700/50 p-1 rounded-md">
                                    <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-md" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">{p.name}</p>
                                        <p className="text-sm font-bold text-red-600">{formatPrice(relatedPriceInfo.sellingPrice)}</p>
                                    </div>
                                </button>
                            </li>
                        )})}
                    </ul>
                </div>
            </aside>
        </div>

        {/* Same Category Products */}
        <div className="mt-12">
             <h2 className="text-xl font-bold text-center mb-6">Sản phẩm cùng loại</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {sameCategoryProducts.map(p => {
                    const sameCatPriceInfo = getProductPrice(p.id, currentUser, prices);
                    const sameCatDiscount = sameCatPriceInfo.originalPrice > 0 ? Math.round(((sameCatPriceInfo.originalPrice - sameCatPriceInfo.sellingPrice) / sameCatPriceInfo.originalPrice) * 100) : 0;
                    return (
                    <button key={p.id} onClick={() => navigateTo({ page: 'product', serviceId: service.id, productId: p.id })} className="group text-left">
                        <div className="relative aspect-square bg-white dark:bg-zinc-800 rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-700">
                             <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                             {sameCatDiscount > 0 && <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded">-{sameCatDiscount}%</div>}
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-slate-700 dark:text-zinc-200 h-10">{p.name}</h3>
                        <div className="flex items-baseline gap-2">
                             <p className="font-bold text-red-600">{formatPrice(sameCatPriceInfo.sellingPrice)}</p>
                             {sameCatPriceInfo.originalPrice > sameCatPriceInfo.sellingPrice && <p className="text-xs text-slate-400 line-through">{formatPrice(sameCatPriceInfo.originalPrice)}</p>}
                        </div>
                    </button>
                 )})}
             </div>
        </div>
      </div>
    </div>
  );
};