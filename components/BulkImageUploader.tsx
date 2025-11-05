import React, { useState, useCallback, useEffect } from 'react';
import { services } from '../data/serviceData';
import { saveImageContent, loadImageContent, saveTextContent, loadTextContent } from '../contentStore';
import { useToast } from './Toast';
import { XIcon } from './icons/XIcon';
import { UploadIcon } from './icons/UploadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

// Import data sources for building the comprehensive map
import { defaultSlides } from './HomePage';
import { bestsellerProducts } from './BestsellerCarousel';
import { defaultMainProducts } from './MainProductsPage';

interface MatchedFile {
    file: File;
    previewUrl: string;
    id: string; // The matched ID part of the filename
    name: string; // Display name of the item being updated
    type: 'serviceProduct' | 'heroSlide' | 'homeService' | 'bestseller' | 'mainProduct';
    storageKey: string; // Direct key for simple updates
    oldImageUrl: string;
    // For complex JSON updates
    jsonKey?: string; 
    itemIndex?: number;
}

interface UnmatchedFile {
    file: File;
    previewUrl: string;
}

interface BulkImageUploaderProps {
    onClose: () => void;
    onUpdate: () => void;
    referenceIds: { id: string; name: string }[];
}

interface ComprehensiveMapItem {
    id: string;
    name: string;
    type: MatchedFile['type'];
    storageKey: string;
    oldImageUrl: string;
    jsonKey?: string;
    itemIndex?: number;
}


export const BulkImageUploader: React.FC<BulkImageUploaderProps> = ({ onClose, onUpdate, referenceIds }) => {
    const [matchedFiles, setMatchedFiles] = useState<MatchedFile[]>([]);
    const [unmatchedFiles, setUnmatchedFiles] = useState<UnmatchedFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const { showToast } = useToast();
    const [comprehensiveMap, setComprehensiveMap] = useState<Map<string, ComprehensiveMapItem>>(new Map());

    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);


    useEffect(() => {
        const newMap = new Map<string, ComprehensiveMapItem>();
        
        // 1. Service Products (e.g., 'kts-p1')
        services.forEach(service => {
            service.products?.forEach(product => {
                const storageKey = `service_${service.id}_prod_${product.id}_image`;
                newMap.set(product.id, {
                    id: product.id,
                    name: product.name,
                    type: 'serviceProduct',
                    storageKey: storageKey,
                    oldImageUrl: loadImageContent(storageKey, product.imageUrl),
                });
            });
        });

        // 2. Hero Slides (e.g., 'home_slide_slide1')
        const storedSlides = JSON.parse(loadTextContent('home_hero_slides', '[]'));
        const slides = storedSlides.length > 0 ? storedSlides : defaultSlides;
        slides.forEach((slide: any) => {
            const id = `home_slide_${slide.id}`;
            newMap.set(id, {
                id: slide.id,
                name: slide.title,
                type: 'heroSlide',
                storageKey: id, // The key for matching is the filename itself
                oldImageUrl: slide.src,
                jsonKey: 'home_hero_slides',
            });
        });

        // 3. Home Services (e.g., 'home_service_in-anh-ep-go')
        services.forEach(service => {
             const id = `home_service_${service.id}`;
             const storageKey = `${id}_image`;
             newMap.set(id, {
                id: service.id,
                name: service.name,
                type: 'homeService',
                storageKey: storageKey,
                oldImageUrl: loadImageContent(storageKey, service.imageUrl),
            });
        });

        // 4. Bestsellers (e.g., 'bestseller_kts-p7')
        bestsellerProducts.forEach(product => {
            const id = `bestseller_${product.id}`;
            const storageKey = `${id}_image`;
            newMap.set(id, {
                id: product.id,
                name: product.name,
                type: 'bestseller',
                storageKey: storageKey,
                oldImageUrl: loadImageContent(storageKey, product.imageUrl),
            });
        });
        
        // 5. Main Products (e.g., 'main_prod_ep-go_0')
        const storedMainProducts = JSON.parse(loadTextContent('main_products_data_v2', '[]'));
        const mainProducts = storedMainProducts.length > 0 ? storedMainProducts : defaultMainProducts;
        mainProducts.forEach((product: any) => {
            product.imageUrls.forEach((url: string, index: number) => {
                const id = `main_prod_${product.id}_${index}`;
                 newMap.set(id, {
                    id: product.id,
                    name: `${product.title} (ảnh ${index + 1})`,
                    type: 'mainProduct',
                    storageKey: id,
                    oldImageUrl: url,
                    jsonKey: 'main_products_data_v2',
                    itemIndex: index,
                });
            });
        });

        setComprehensiveMap(newMap);
    }, []);


    const handleFiles = useCallback((files: FileList) => {
        const newMatched: MatchedFile[] = [];
        const newUnmatched: UnmatchedFile[] = [];

        for (const file of Array.from(files)) {
            const fileId = file.name.split('.').slice(0, -1).join('.');
            const match = comprehensiveMap.get(fileId);

            if (match) {
                newMatched.push({
                    file,
                    previewUrl: URL.createObjectURL(file),
                    ...match
                });
            } else {
                newUnmatched.push({
                    file,
                    previewUrl: URL.createObjectURL(file),
                });
            }
        }
        setMatchedFiles(prev => [...prev, ...newMatched]);
        setUnmatchedFiles(prev => [...prev, ...newUnmatched]);
    }, [comprehensiveMap]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const handleStartUpdate = async () => {
        if (matchedFiles.length === 0) {
            showToast('Không có ảnh nào khớp.', 'info');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        
        const heroSlidesToUpdate = matchedFiles.filter(f => f.type === 'heroSlide');
        const mainProductsToUpdate = matchedFiles.filter(f => f.type === 'mainProduct');
        const simpleUpdates = matchedFiles.filter(f => f.type !== 'heroSlide' && f.type !== 'mainProduct');
        
        // Process JSON updates first
        if (heroSlidesToUpdate.length > 0) {
            const storedSlidesJson = loadTextContent('home_hero_slides', '[]');
            let slides = storedSlidesJson ? JSON.parse(storedSlidesJson) : defaultSlides;
            for (const item of heroSlidesToUpdate) {
                const dataUrl = await fileToDataUrl(item.file);
                const slideIndex = slides.findIndex((s: any) => s.id === item.id);
                if (slideIndex !== -1) {
                    slides[slideIndex].src = dataUrl;
                }
            }
            saveTextContent('home_hero_slides', JSON.stringify(slides));
        }
        
        if (mainProductsToUpdate.length > 0) {
            const storedProductsJson = loadTextContent('main_products_data_v2', '[]');
            let products = storedProductsJson ? JSON.parse(storedProductsJson) : defaultMainProducts;
            for (const item of mainProductsToUpdate) {
                 const dataUrl = await fileToDataUrl(item.file);
                 const productIndex = products.findIndex((p: any) => p.id === item.id);
                 if (productIndex !== -1 && item.itemIndex !== undefined) {
                     products[productIndex].imageUrls[item.itemIndex] = dataUrl;
                 }
            }
            saveTextContent('main_products_data_v2', JSON.stringify(products));
        }

        // Process simple key-value updates
        for (let i = 0; i < simpleUpdates.length; i++) {
            const item = simpleUpdates[i];
            const dataUrl = await fileToDataUrl(item.file);
            saveImageContent(item.storageKey, dataUrl);
            const overallProgress = (heroSlidesToUpdate.length + mainProductsToUpdate.length + i + 1) / matchedFiles.length;
            setProgress(overallProgress * 100);
        }

        setIsProcessing(false);
        showToast(`Đã cập nhật thành công ${matchedFiles.length} ảnh! Đang tải lại trang...`, 'success');
        onUpdate();
        setTimeout(onClose, 500);
    };
    
    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    };

    const filteredIds = referenceIds.filter(ref => 
        ref.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold">Tải lên hàng loạt ảnh</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <details className="bg-slate-100 dark:bg-zinc-700/50 p-3 rounded-lg text-sm mb-4">
                            <summary className="font-semibold cursor-pointer">Tra cứu ID &amp; Quy tắc đặt tên file</summary>
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-600">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên hoặc ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 mb-2 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800"
                                />
                                <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                                    {filteredIds.map(ref => (
                                        <div key={ref.id} className="flex items-center justify-between p-1.5 bg-slate-200 dark:bg-zinc-600 rounded">
                                            <div>
                                                <code className="text-xs font-mono">{ref.id}</code>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400">{ref.name}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(ref.id)}
                                                className="p-1.5 rounded-md hover:bg-slate-300 dark:hover:bg-zinc-500 transition-colors"
                                                title={`Sao chép ID: ${ref.id}`}
                                            >
                                                {copiedId === ref.id ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4 text-slate-500 dark:text-slate-300" />}
                                            </button>
                                        </div>
                                    ))}
                                    {filteredIds.length === 0 && <p className="text-xs text-slate-500 text-center">Không tìm thấy ID nào.</p>}
                                </div>
                            </div>
                        </details>

                        <div
                            onDragOver={e => {e.preventDefault(); e.stopPropagation();}}
                            onDrop={handleDrop}
                            className="p-8 border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                        >
                            <UploadIcon className="w-12 h-12 mx-auto text-slate-400 mb-2"/>
                            <p className="font-semibold">Kéo và thả tệp vào đây</p>
                            <p className="text-sm text-slate-500">hoặc</p>
                            <label className="text-blue-600 font-semibold cursor-pointer hover:underline">
                                Chọn tệp từ máy tính
                                <input type="file" multiple onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {matchedFiles.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-green-600 dark:text-green-400">Ảnh đã khớp ({matchedFiles.length})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2 max-h-64 overflow-y-auto pr-2">
                                {matchedFiles.map(item => (
                                    <div key={item.id + (item.itemIndex ?? '')} className="border p-2 rounded-lg bg-slate-50 dark:bg-zinc-700/50">
                                        <div className="flex items-center gap-2">
                                            <img src={item.oldImageUrl} alt="Ảnh cũ" className="w-12 h-12 object-cover rounded flex-shrink-0" />
                                            <p className="text-2xl text-slate-400">→</p>
                                            <img src={item.previewUrl} alt="Ảnh mới" className="w-12 h-12 object-cover rounded flex-shrink-0" />
                                        </div>
                                        <p className="text-xs font-bold mt-2 truncate" title={item.name}>{item.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate" title={item.file.name}>{item.file.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {unmatchedFiles.length > 0 && (
                         <div>
                            <h3 className="font-semibold text-red-600 dark:text-red-400">Ảnh không khớp ({unmatchedFiles.length})</h3>
                            <p className="text-xs text-slate-500">Những ảnh này có tên file không trùng với quy tắc nào.</p>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                                {unmatchedFiles.map((item, index) => (
                                    <div key={index} className="border p-1 rounded-lg bg-red-50 dark:bg-red-900/20">
                                        <img src={item.previewUrl} alt="Không khớp" className="w-full h-auto aspect-square object-cover rounded" />
                                        <p className="text-xs text-red-700 dark:text-red-300 mt-1 truncate" title={item.file.name}>{item.file.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                <footer className="p-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end items-center gap-4 flex-shrink-0">
                    {isProcessing && (
                         <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-zinc-700 flex-1">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                         </div>
                    )}
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-sm font-semibold rounded-md border dark:border-zinc-600 disabled:opacity-50">Hủy</button>
                    <button 
                        onClick={handleStartUpdate} 
                        disabled={isProcessing || matchedFiles.length === 0}
                        className="px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? `Đang cập nhật... ${Math.round(progress)}%` : `Bắt đầu cập nhật (${matchedFiles.length} ảnh)`}
                    </button>
                </footer>
            </div>
        </div>
    );
};