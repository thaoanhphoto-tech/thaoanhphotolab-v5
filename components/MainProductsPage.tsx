

import React, { useState, useEffect, useRef } from 'react';
import { EditableText } from './EditableText';
import type { PageState } from '../App';
import { loadTextContent, saveTextContent } from '../contentStore';
import { UploadIcon } from './icons/UploadIcon';
import { BulkImageUploader } from './BulkImageUploader';
import { MediaLibraryModal } from './MediaLibraryModal';

interface MainProductsPageProps {
  navigateTo: (state: PageState) => void;
  isAdminMode: boolean;
}

interface MainProduct {
  id: string;
  serviceId: string;
  productId?: string;
  title: string;
  imageUrls: string[];
}

export const defaultMainProducts: MainProduct[] = [
  {
    id: 'ep-go',
    serviceId: 'in-anh-ep-go',
    title: 'ẢNH ÉP GỖ',
    imageUrls: [
      'https://i.imgur.com/9C06b7g.jpeg', 
      'https://i.imgur.com/gO2p1eF.jpeg', 
      'https://i.imgur.com/L7pTqQc.jpeg',
      'https://i.imgur.com/rM2zG3G.jpeg',
    ],
  },
  {
    id: 'trang-guong',
    serviceId: 'in-anh-mica',
    title: 'ẢNH TRÁNG GƯƠNG',
    imageUrls: [
      'https://i.imgur.com/h5T2gV2.jpeg',
      'https://i.imgur.com/L7dYf7e.jpeg',
      'https://i.imgur.com/Y1gA3n5.jpeg',
      'https://i.imgur.com/gO2p1eF.jpeg',
    ],
  },
  {
    id: 'photobook',
    serviceId: 'photobook',
    title: 'PHOTOBOOK',
    imageUrls: [
      'https://i.imgur.com/5J3m1mJ.jpeg',
      'https://i.imgur.com/zW3qfGf.jpeg',
      'https://i.imgur.com/nJq3Xn0.jpeg',
      'https://i.imgur.com/c1q2V1Q.jpeg',
    ],
  },
  {
    id: 'in-kts',
    serviceId: 'in-anh-kts',
    title: 'IN ẢNH KTS',
    imageUrls: [
      'https://i.imgur.com/Wp5t1pC.jpeg',
      'https://i.imgur.com/5J3m1mJ.jpeg',
      'https://i.imgur.com/8QpDPrN.jpeg',
      'https://i.imgur.com/a2oDKo1.jpeg',
    ],
  },
  {
    id: 'anh-de-ban',
    serviceId: 'anh-de-ban',
    title: 'ẢNH ĐỂ BÀN',
    imageUrls: [
      'https://i.imgur.com/gO2p1eF.jpeg',
      'https://i.imgur.com/L7dYf7e.jpeg',
      'https://i.imgur.com/c1q2V1Q.jpeg',
      'https://i.imgur.com/Y1gA3n5.jpeg',
    ],
  },
   {
    id: 'anh-the',
    serviceId: 'in-anh-kts',
    productId: 'the-layngay-5p',
    title: 'ẢNH THẺ',
    imageUrls: [
      'https://i.imgur.com/nQ1h2tF.jpeg',
      'https://i.imgur.com/0iS2Y7N.jpeg'
    ],
  },
  {
    id: 'khung-go-noi',
    serviceId: 'anh-khung-go-noi',
    title: 'KHUNG NỔI',
    imageUrls: [
      'https://i.imgur.com/rM2zG3G.jpeg',
      'https://i.imgur.com/tq87g9d.jpeg',
      'https://i.imgur.com/nJq3Xn0.jpeg',
      'https://i.imgur.com/bWc9p1v.jpeg',
    ],
  },
  {
    id: 'khung-anh',
    serviceId: 'khung-anh-treo-tuong',
    title: 'KHUNG ẢNH',
    imageUrls: [
      'https://i.imgur.com/tq87g9d.jpeg',
      'https://i.imgur.com/h5T2gV2.jpeg',
      'https://i.imgur.com/nJq3Xn0.jpeg',
      'https://i.imgur.com/c1q2V1Q.jpeg',
    ],
  },
];

const ProductSlideshowItem: React.FC<{
    product: MainProduct;
    onImageChange: (productId: string, imageIndex: number, newDataUrl: string) => void;
    navigateTo: (state: PageState) => void;
    isAdminMode: boolean;
}> = ({ product, onImageChange, navigateTo, isAdminMode }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState<{ itemKey: string, currentUrl: string } | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (!isHovered && product.imageUrls.length > 1) {
            timeoutRef.current = window.setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % product.imageUrls.length);
            }, 3000);
        }
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentIndex, isHovered, product.imageUrls.length]);

    const handleClick = () => {
        const pageState: PageState = product.productId
            ? { page: 'product', serviceId: product.serviceId, productId: product.productId }
            : { page: 'service', serviceId: product.serviceId };

        if (isAdminMode) {
            const itemKey = `main_prod_${product.id}_${currentIndex}`;
            const currentUrl = product.imageUrls[currentIndex];
            setModalInfo({ itemKey, currentUrl });
            setIsModalOpen(true);
        } else {
            navigateTo(pageState);
        }
    };

    const handleSelectFromLibrary = (newImageUrl: string) => {
        if (modalInfo) {
            const [,,,productId, imageIndexStr] = modalInfo.itemKey.split('_');
            const imageIndex = parseInt(imageIndexStr, 10);
            onImageChange(productId, imageIndex, newImageUrl || defaultMainProducts.find(p=>p.id === productId)!.imageUrls[imageIndex]);
        }
        setIsModalOpen(false);
        setModalInfo(null);
    };


    return (
        <>
            <button
                onClick={handleClick}
                className="relative group overflow-hidden rounded-lg shadow-lg aspect-square"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >

                <div className="absolute inset-0">
                    {product.imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`${product.title} slide ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                                opacity: index === currentIndex ? 1 : 0,
                                transition: 'opacity 1s ease-in-out, transform 0.5s ease-in-out',
                                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                            }}
                        />
                    ))}
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                    <EditableText
                        as="h2"
                        contentKey={`main_prod_${product.id}_title`}
                        defaultValue={product.title}
                        isAdminMode={isAdminMode}
                        className="text-white text-lg md:text-xl font-bold uppercase tracking-wider text-center"
                    />
                    {isAdminMode && isHovered && (
                         <div className="mt-4 px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-md backdrop-blur-sm flex items-center gap-2">
                            <UploadIcon className="w-4 h-4" />
                            Quản lý ảnh
                        </div>
                    )}
                </div>
            </button>
            {isAdminMode && isModalOpen && modalInfo && (
                <MediaLibraryModal
                    itemKey={modalInfo.itemKey}
                    currentImageUrl={modalInfo.currentUrl}
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleSelectFromLibrary}
                />
            )}
        </>
    );
};


export const MainProductsPage: React.FC<MainProductsPageProps> = ({ navigateTo, isAdminMode }) => {
    
    const [mainProducts, setMainProducts] = useState<MainProduct[]>(() => {
        const stored = loadTextContent('main_products_data_v2', '');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed[0]?.imageUrls) {
                    return parsed;
                }
            } catch (e) {
                console.error("Failed to load main products from storage", e);
            }
        }
        return defaultMainProducts;
    });

    const [isBulkUploaderOpen, setIsBulkUploaderOpen] = useState(false);

    const handleProductImageChange = (productId: string, imageIndex: number, newDataUrl: string) => {
        const newProducts = mainProducts.map(p => {
            if (p.id === productId) {
                const newImageUrls = [...p.imageUrls];
                newImageUrls[imageIndex] = newDataUrl;
                return { ...p, imageUrls: newImageUrls };
            }
            return p;
        });
        setMainProducts(newProducts);
        saveTextContent('main_products_data_v2', JSON.stringify(newProducts));
    };

    const mainProductsReferenceIds = mainProducts.flatMap(product => 
        product.imageUrls.map((_, index) => ({
            id: `main_prod_${product.id}_${index}`,
            name: `${product.title} (ảnh ${index + 1})`
        }))
    );

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950">
      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 relative">
          <EditableText
            as="h1"
            contentKey="main_products_title"
            defaultValue="Sản Phẩm Sản Xuất Chủ Đạo"
            isAdminMode={isAdminMode}
            className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-zinc-100"
          />
          <EditableText
            as="p"
            contentKey="main_products_subtitle"
            defaultValue="Khám phá những dòng sản phẩm chất lượng cao, làm nên thương hiệu của Thảo Anh Photo Lab."
            isAdminMode={isAdminMode}
            className="mt-4 text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto"
          />
          {isAdminMode && (
            <div className="absolute top-0 right-0">
                <button 
                    onClick={() => setIsBulkUploaderOpen(true)}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-md hover:bg-purple-700 flex items-center gap-1.5"
                >
                    <UploadIcon className="w-4 h-4" /> Tải lên hàng loạt
                </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mainProducts.map((product) => (
             <ProductSlideshowItem
                key={product.id}
                product={product}
                navigateTo={navigateTo}
                isAdminMode={isAdminMode}
                onImageChange={handleProductImageChange}
            />
          ))}
        </div>
      </main>
      {isAdminMode && isBulkUploaderOpen && (
        <BulkImageUploader 
            onClose={() => setIsBulkUploaderOpen(false)} 
            onUpdate={() => window.location.reload()}
            referenceIds={mainProductsReferenceIds}
        />
      )}
    </div>
  );
};