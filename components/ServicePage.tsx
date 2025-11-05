import React, { useState } from 'react';
import { services } from '../data/serviceData';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { GridIcon } from './icons/GridIcon';
import { ListIcon } from './icons/ListIcon';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { useToast } from './Toast';
import { PageState } from '../App';
import { BulkImageUploader } from './BulkImageUploader';
import { UploadIcon } from './icons/UploadIcon';
import { PricingTable, getProductPrice } from '../pricingStore';
import { User } from '../userStore';
// Fix: Import the 'Product' type.
import { Product } from '../productStore';


interface ServicePageProps {
  serviceId?: string;
  navigateTo: (state: PageState) => void;
  isAdminMode: boolean;
  currentUser: User | null;
  prices: PricingTable;
  // Fix: Add the missing 'products' prop to resolve a type error in App.tsx.
  products: Product[];
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.418a.562.562 0 01.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988H8.88a.563.563 0 00.475-.31l2.125-5.112z" />
    </svg>
);


export const ServicePage: React.FC<ServicePageProps> = ({ serviceId, navigateTo, isAdminMode, currentUser, prices, products }) => {
  const service = services.find(s => s.id === serviceId);
  const { showToast } = useToast();
  const [isBulkUploaderOpen, setIsBulkUploaderOpen] = useState(false);
  
  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return '';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }

  const handleUpdate = () => {
      // Reload the page to reflect all changes from localStorage
      showToast('Đã cập nhật thành công! Đang tải lại trang...', 'success');
      setTimeout(() => window.location.reload(), 1000);
  };

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Không tìm thấy dịch vụ</h2>
        <p className="mt-4 text-slate-500">Dịch vụ bạn đang tìm kiếm không tồn tại.</p>
        <button
          onClick={() => navigateTo({ page: 'home' })}
          className="mt-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  const serviceReferenceIds = service.products?.map(p => ({
      id: p.id,
      name: p.name
  })) || [];


  if (service.layout === 'sidebar') {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const sidebarCategories = [
        { name: 'Ảnh gỗ meka', count: 4 },
        { name: 'Ảnh gỗ lụa', count: 5 },
        { name: 'Ảnh tráng gương', count: 5 },
        { name: 'In ảnh', count: 13 },
    ];
    
    const priceFilters = [
        'Giá dưới 100.000đ', '100.000đ - 200.000đ', '200.000đ - 300.000đ',
        '300.000đ - 500.000đ', '500.000đ - 1.000.000đ',
    ];
    
    const newArrivals = services.flatMap(s => s.products || []).filter(p => p.id.startsWith('kts-')).slice(0, 5);

    return (
      <div className="bg-emerald-50 dark:bg-emerald-950 text-slate-800 dark:text-zinc-200 animate-fade-in">
          <style>{`
              @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
              .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
          `}</style>
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <nav className="mb-8 text-sm font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                <button onClick={() => navigateTo({ page: 'home' })} className="hover:text-blue-600 dark:hover:text-blue-400">Trang chủ</button>
                <span>/</span>
                <span className="text-slate-800 dark:text-zinc-200">{service.name}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-700 pb-2">Danh mục</h3>
                        <ul className="space-y-2 text-sm">
                            {sidebarCategories.map(cat => (
                                <li key={cat.name}><a href="#" className="flex justify-between items-center text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"><span>▪ {cat.name}</span> <span>({cat.count})</span></a></li>
                            ))}
                        </ul>
                    </div>
                     <div className="space-y-3">
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-700 pb-2">Giá sản phẩm</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-zinc-300">
                            {priceFilters.map(filter => (
                                <li key={filter}><label className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"/>{filter}</label></li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-700 pb-2">Thương hiệu</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-zinc-300">
                           <li><label className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"/>Thảo Anh Photo Lab</label></li>
                        </ul>
                    </div>
                     <div className="space-y-3">
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-700 pb-2">Kích thước</h3>
                        <div className="flex gap-2">
                             <button className="px-3 py-1 border border-slate-300 dark:border-zinc-600 rounded text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">15x21</button>
                             <button className="px-3 py-1 border border-slate-300 dark:border-zinc-600 rounded text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">20x30</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-700 pb-2">Hàng mới về</h3>
                        <ul className="space-y-4">
                            {newArrivals.map(product => {
                                const priceInfo = getProductPrice(product.id, currentUser, prices);
                                return (
                                <li key={product.id} className="flex items-center gap-3">
                                    <EditableImage contentKey={`service_${service.id}_new_${product.id}_image`} defaultSrc={product.imageUrl} alt={product.name} isAdminMode={isAdminMode} className="w-16 h-16 object-cover rounded-md border-2 border-teal-400 dark:border-teal-600" />
                                    <div>
                                        <EditableText as="p" contentKey={`service_${service.id}_new_${product.id}_name`} defaultValue={product.name} isAdminMode={isAdminMode} className="text-sm font-medium text-slate-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" />
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-500">
                                            {priceInfo.sellingPrice > 0 ? formatPrice(priceInfo.sellingPrice) : 'Liên hệ'}
                                        </div>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-4">
                        <EditableText as="h1" contentKey={`service_${service.id}_title`} defaultValue={service.name.toUpperCase()} isAdminMode={isAdminMode} className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white" />
                        {isAdminMode && (
                            <button onClick={() => setIsBulkUploaderOpen(true)} className="flex-shrink-0 ml-4 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-md hover:bg-purple-700 flex items-center gap-1.5">
                                <UploadIcon className="w-4 h-4" /> Tải lên hàng loạt
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-between items-center mb-6 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                             <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}><GridIcon className="w-6 h-6"/></button>
                             <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}><ListIcon className="w-6 h-6"/></button>
                             <span className="text-sm text-slate-600 dark:text-zinc-400 ml-2">Tìm thấy {service.products?.length || 0} sản phẩm</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="sort-by" className="text-sm font-medium">Sắp xếp:</label>
                             <select id="sort-by" className="border border-slate-300 dark:border-zinc-700 rounded px-2 py-1.5 bg-white dark:bg-zinc-800 text-sm focus:ring-1 focus:ring-blue-500">
                                 <option>Thứ tự</option>
                                 <option>Mới nhất</option>
                                 <option>Giá: Tăng dần</option>
                                 <option>Giá: Giảm dần</option>
                             </select>
                        </div>
                    </div>
                     <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                        {service.products?.map(product => {
                            const priceInfo = getProductPrice(product.id, currentUser, prices);
                            const discount = priceInfo.originalPrice > 0 ? Math.round(((priceInfo.originalPrice - priceInfo.sellingPrice) / priceInfo.originalPrice) * 100) : 0;
                            
                            return (
                                <button key={product.id} onClick={() => navigateTo({ page: 'product', serviceId: service.id, productId: product.id })} className="group text-left transition-transform duration-300 hover:-translate-y-1 flex flex-col md:flex-row md:items-center gap-4">
                                     <div className={`relative flex-shrink-0 overflow-hidden rounded-lg ${viewMode === 'grid' ? 'aspect-[4/5] w-full' : 'w-32 h-32 md:w-40 md:h-40'}`}>
                                        <EditableImage contentKey={`service_${service.id}_prod_${product.id}_image`} defaultSrc={product.imageUrl} alt={product.name} isAdminMode={isAdminMode} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 border-2 border-teal-400 dark:border-teal-600 rounded-lg" />
                                        
                                        {discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                                                -{discount}%
                                            </div>
                                        )}
                                        {product.isHot && !discount && ( <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Hot</div> )}
                                    </div>
                                    <div className="mt-3 md:mt-0">
                                        <EditableText as="h3" contentKey={`service_${service.id}_prod_${product.id}_name`} defaultValue={product.name} isAdminMode={isAdminMode} className="text-sm font-semibold text-slate-800 dark:text-zinc-100" />
                                        <div className="flex items-center mt-1">
                                            {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />)}
                                        </div>
                                        <div className="mt-2 flex items-baseline gap-2">
                                            {priceInfo.sellingPrice > 0 ? (
                                                <>
                                                    <p className="text-md font-bold text-blue-600 dark:text-blue-400">{formatPrice(priceInfo.sellingPrice)}</p>
                                                    {priceInfo.originalPrice > priceInfo.sellingPrice && (
                                                        <p className="text-sm text-slate-400 dark:text-zinc-500 line-through">{formatPrice(priceInfo.originalPrice)}</p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-md font-bold text-blue-600 dark:text-blue-400">Liên hệ</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </main>
            </div>
            {isBulkUploaderOpen && (
                <BulkImageUploader 
                    onClose={() => setIsBulkUploaderOpen(false)} 
                    onUpdate={handleUpdate}
                    referenceIds={serviceReferenceIds}
                />
            )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950 text-slate-800 dark:text-zinc-200 animate-fade-in">
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-in-out;
            }
        `}</style>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <nav className="mb-8 text-sm font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <button onClick={() => navigateTo({ page: 'home' })} className="hover:text-blue-600 dark:hover:text-blue-400">Trang chủ</button>
            <span>/</span>
            <span className="text-slate-800 dark:text-zinc-200">{service.name}</span>
        </nav>
        
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-zinc-800 pb-4">
            <EditableText as="h1" contentKey={`service_${service.id}_title`} defaultValue={service.name.toUpperCase()} isAdminMode={isAdminMode} className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white" />
            {isAdminMode && (
                <button onClick={() => setIsBulkUploaderOpen(true)} className="flex-shrink-0 ml-4 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 flex items-center gap-1.5">
                    <UploadIcon className="w-4 h-4" /> Tải lên hàng loạt
                </button>
            )}
        </div>

        {service.products && service.products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {service.products.map(product => {
                    const priceInfo = getProductPrice(product.id, currentUser, prices);
                    const discount = priceInfo.originalPrice > 0 ? Math.round(((priceInfo.originalPrice - priceInfo.sellingPrice) / priceInfo.originalPrice) * 100) : 0;
                        
                    return (
                        <button key={product.id} onClick={() => navigateTo({ page: 'product', serviceId: service.id, productId: product.id })} className="group text-left transition-transform duration-300 hover:-translate-y-1">
                            <div className="relative aspect-[4/5] bg-slate-100 dark:bg-zinc-900 rounded-lg overflow-hidden border-2 border-teal-400 dark:border-teal-600">
                                <EditableImage contentKey={`service_${service.id}_prod_${product.id}_image`} defaultSrc={product.imageUrl} alt={product.name} isAdminMode={isAdminMode} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                 
                                {discount > 0 && (
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                                        -{discount}%
                                    </div>
                                )}

                                {product.isHot && !discount && (
                                     <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Hot</div>
                                )}
                            </div>
                            <div className="mt-3">
                                <EditableText as="h3" contentKey={`service_${service.id}_prod_${product.id}_name`} defaultValue={product.name} isAdminMode={isAdminMode} className="text-sm font-semibold text-slate-800 dark:text-zinc-100 h-10 overflow-hidden" />
                                <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />)}
                                </div>
                                <div className="mt-2 flex items-baseline gap-2">
                                     {priceInfo.sellingPrice > 0 ? (
                                        <>
                                            <p className="text-md font-bold text-blue-600 dark:text-blue-400">{formatPrice(priceInfo.sellingPrice)}</p>
                                            {priceInfo.originalPrice > priceInfo.sellingPrice && (
                                                <p className="text-sm text-slate-400 dark:text-zinc-500 line-through">{formatPrice(priceInfo.originalPrice)}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-md font-bold text-blue-600 dark:text-blue-400">Liên hệ</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        ) : (
             !service.contentSections || service.contentSections.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                    <p className="text-slate-500 dark:text-zinc-400">Sản phẩm cho dịch vụ này đang được cập nhật.</p>
                </div>
             ) : null
        )}

        {service.contentSections && service.contentSections.length > 0 && (
            <div className="mt-16 sm:mt-20 space-y-16">
                {service.contentSections.map((section, index) => (
                    <div key={index} className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className={`lg:order-${index % 2 === 0 ? '2' : '1'}`}>
                             <EditableImage contentKey={`service_${service.id}_section_${index}_image`} defaultSrc={section.imageUrl} alt={section.title} isAdminMode={isAdminMode} className="rounded-lg shadow-lg w-full h-auto object-cover border-2 border-teal-400 dark:border-teal-600" />
                        </div>
                        <div className={`space-y-4 lg:order-${index % 2 === 0 ? '1' : '2'}`}>
                             <EditableText as="h2" contentKey={`service_${service.id}_section_${index}_title`} defaultValue={section.title} isAdminMode={isAdminMode} className="text-2xl font-bold text-slate-800 dark:text-zinc-100" />
                            {section.paragraphs?.map((p, pIndex) => (
                                <EditableText as="p" key={pIndex} contentKey={`service_${service.id}_section_${index}_p_${pIndex}`} defaultValue={p} isAdminMode={isAdminMode} className="text-slate-600 dark:text-zinc-300 leading-relaxed" />
                            ))}
                            {section.listItems && section.listItems.length > 0 && (
                                <>
                                    <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-200 pt-2">Thông tin chi tiết:</h3>
                                    <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300">
                                        {section.listItems.map((item, itemIndex) => (
                                            <EditableText as="li" key={itemIndex} contentKey={`service_${service.id}_section_${index}_li_${itemIndex}`} defaultValue={item} isAdminMode={isAdminMode} />
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      {isBulkUploaderOpen && (
        <BulkImageUploader 
            onClose={() => setIsBulkUploaderOpen(false)} 
            onUpdate={handleUpdate}
            referenceIds={serviceReferenceIds}
        />
       )}
    </div>
  );
};