import React, { useState, useEffect } from 'react';
import { Product } from '../productStore';
import { PageState } from '../App';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useToast } from './Toast';
import { TrashIcon } from './icons/TrashIcon';
// Fix: Add import for Material and ProductBOM types.
import { Material, ProductBOM } from '../inventoryStore';


interface ProductManagementPageProps {
    products: Product[];
    onUpdateProducts: (products: Product[]) => void;
    navigateTo: (state: PageState) => void;
    // New props for dynamic catalogs
    productBases: string[];
    sizes: string[];
    serviceCategories: string[];
    // Fix: Add missing props passed from App.tsx to resolve type errors.
    materials: Material[];
    productBOMs: ProductBOM[];
    onUpdateProductBOMs: (newBOMs: ProductBOM[]) => void;
}

const slugify = (text: string) => {
    if (!text) return '';
    const a = 'àáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ';
    const b = 'aaaaaaaaeeeeiiooooouuadiuouaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaEIEIOOOOOOOOOOOOOOOOOOOUUUUUUUUUUUUUUUUUUUUUUYYYyyY';
    const p = new RegExp(a.split('').join('|'), 'g');
  
    return text.toString().toLowerCase()
      .replace(p, c => b.charAt(a.indexOf(c)))
      .replace(/[\s\W-]+/g, '-');
};


export const ProductManagementPage: React.FC<ProductManagementPageProps> = ({ 
    products, 
    onUpdateProducts, 
    navigateTo,
    productBases,
    sizes,
    serviceCategories,
    materials,
    productBOMs,
    onUpdateProductBOMs,
}) => {
    const [localProducts, setLocalProducts] = useState<Product[]>(() => JSON.parse(JSON.stringify(products)));
    const [isAdding, setIsAdding] = useState(false);
    const { showToast } = useToast();

    // New detailed state for the form
    const [nameBase, setNameBase] = useState('');
    const [size, setSize] = useState(sizes[0] || '');
    const [description, setDescription] = useState('');
    const [serviceCategory, setServiceCategory] = useState(serviceCategories[0] || '');
    const [imageUrl, setImageUrl] = useState('');
    const [frameName, setFrameName] = useState('');
    const [price, setPrice] = useState(0);
    const [originalPrice, setOriginalPrice] = useState<number | null>(null);

    // Auto-generated fields state
    const [generatedId, setGeneratedId] = useState('');
    const [generatedName, setGeneratedName] = useState('');
    const [cogs, setCogs] = useState(0);

    // BOM State
    const [bomItems, setBomItems] = useState<{ materialId: string, quantity: number }[]>([]);

    // Effect for auto-generation
    useEffect(() => {
        const finalName = `${nameBase} ${size !== 'Khác' ? size : ''}`.trim();
        setGeneratedName(finalName);

        const finalId = slugify(finalName);
        setGeneratedId(finalId);
    }, [nameBase, size]);
    
    // Effect to calculate COGS
    useEffect(() => {
        const totalCogs = bomItems.reduce((sum, item) => {
            const material = materials.find(m => m.id === item.materialId);
            return sum + (material ? material.unitPrice * item.quantity : 0);
        }, 0);
        setCogs(totalCogs);
    }, [bomItems, materials]);


    const resetForm = () => {
        setNameBase('');
        setSize(sizes[0] || '');
        setDescription('');
        setServiceCategory(serviceCategories[0] || '');
        setImageUrl('');
        setFrameName('');
        setPrice(0);
        setOriginalPrice(null);
        setGeneratedId('');
        setGeneratedName('');
        setBomItems([]);
        setCogs(0);
    };

    const handleAddProduct = () => {
        if (!generatedName || !serviceCategory || !imageUrl || !nameBase) {
            showToast('Vui lòng điền đầy đủ Tên, Loại và URL Ảnh.', 'error');
            return;
        }
        if (localProducts.some(p => p.id === generatedId)) {
            showToast(`Mã sản phẩm '${generatedId}' đã tồn tại. Vui lòng chọn tên hoặc kích thước khác.`, 'error');
            return;
        }

        const productToAdd: Product = {
            id: generatedId,
            name: generatedName,
            price: price,
            originalPrice: originalPrice,
            imageUrl: imageUrl,
            description: description,
            frameInfo: frameName ? { id: slugify(frameName), name: frameName } : undefined,
            serviceId: slugify(serviceCategory),
            serviceName: serviceCategory,
            cogs: cogs,
        };
        
        const updatedProducts = [...localProducts, productToAdd];
        setLocalProducts(updatedProducts);
        onUpdateProducts(updatedProducts);
        
        // Save the BOM for the new product
        const newBOM: ProductBOM = { productId: generatedId, items: bomItems };
        onUpdateProductBOMs([...productBOMs, newBOM]);

        showToast('Thêm sản phẩm thành công!', 'success');
        setIsAdding(false);
        resetForm();
    };

    const handleDeleteProduct = (productId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này? Thao tác này sẽ xóa sản phẩm khỏi toàn bộ hệ thống.')) {
            const updatedProducts = localProducts.filter(p => p.id !== productId);
            setLocalProducts(updatedProducts);
            onUpdateProducts(updatedProducts);
            // Also remove its BOM
            onUpdateProductBOMs(productBOMs.filter(b => b.productId !== productId));
            showToast('Đã xóa sản phẩm.', 'success');
        }
    };
    
    const handleCancelAdd = () => {
        setIsAdding(false);
        resetForm();
    };
    
    const handleBomItemChange = (index: number, field: 'materialId' | 'quantity', value: string | number) => {
        const newBomItems = [...bomItems];
        (newBomItems[index] as any)[field] = value;
        setBomItems(newBomItems);
    };

    const addBomItem = () => {
        setBomItems([...bomItems, { materialId: '', quantity: 1 }]);
    };

    const removeBomItem = (index: number) => {
        setBomItems(bomItems.filter((_, i) => i !== index));
    };

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
                <h1 className="text-3xl font-bold text-slate-800 dark:text-zinc-100">Quản lý Sản phẩm</h1>
                {!isAdding && 
                    <button onClick={() => setIsAdding(true)} className="px-6 py-2 font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white">
                        + Thêm sản phẩm
                    </button>
                }
            </div>
            
            {isAdding && (
                <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg mb-8 space-y-4 border-2 border-blue-500 dark:border-blue-400">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Thêm sản phẩm mới</h2>
                        <button onClick={handleCancelAdd} className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-md hover:bg-red-600">Hủy</button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                           <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">TÊN SẢN PHẨM GỐC</label>
                           <select value={nameBase} onChange={e => setNameBase(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                                <option value="">-- Chọn loại sản phẩm --</option>
                                {productBases.map(base => (
                                    <option key={base} value={base}>{base}</option>
                                ))}
                           </select>
                        </div>
                         <div>
                           <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">KÍCH THƯỚC</label>
                           <select value={size} onChange={e => setSize(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                         <div>
                           <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">LOẠI DỊCH VỤ</label>
                           <select value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                             {serviceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                           </select>
                        </div>
                        <div className="md:col-span-4">
                            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">MÔ TẢ</label>
                            <input type="text" placeholder="Mô tả ngắn gọn về sản phẩm..." value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"/>
                        </div>
                        <div className="md:col-span-4">
                            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">URL ẢNH *</label>
                            <input type="text" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"/>
                        </div>
                         <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">TÊN KHUNG (NẾU CÓ)</label>
                            <input type="text" placeholder="Khung gỗ sồi" value={frameName} onChange={e => setFrameName(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"/>
                         </div>
                         <div>
                           <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">GIÁ BÁN *</label>
                           <input type="number" placeholder="200000" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"/>
                        </div>
                         <div>
                           <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">GIÁ GỐC (NẾU CÓ)</label>
                           <input type="number" placeholder="250000" value={originalPrice || ''} onChange={e => setOriginalPrice(Number(e.target.value) || null)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"/>
                        </div>

                        <div className="md:col-span-4 bg-slate-100 dark:bg-zinc-700/50 p-3 rounded-md space-y-1">
                            <p className="text-xs font-bold text-slate-500">Xem trước thông tin:</p>
                            <p className="text-sm"><strong>Tên sản phẩm:</strong> {generatedName}</p>
                            <p className="text-sm"><strong>Mã sản phẩm (ID):</strong> <code className="text-blue-600 dark:text-blue-400">{generatedId}</code></p>
                        </div>
                        
                         <div className="md:col-span-4">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 border-t pt-4 mt-2">ĐỊNH MỨC VẬT TƯ (TÍNH GIÁ VỐN)</h3>
                            <div className="space-y-2 mt-2">
                                {bomItems.map((item, index) => (
                                    <div key={index} className="grid grid-cols-[3fr_1fr_40px] gap-2 items-center">
                                        <select value={item.materialId} onChange={e => handleBomItemChange(index, 'materialId', e.target.value)} className="w-full p-1.5 border rounded text-sm dark:bg-zinc-700">
                                            <option value="">-- Chọn vật tư --</option>
                                            {materials.map(mat => <option key={mat.id} value={mat.id}>[{mat.code}] - {mat.name}</option>)}
                                        </select>
                                        <input type="number" value={item.quantity} onChange={e => handleBomItemChange(index, 'quantity', Number(e.target.value))} className="w-full p-1.5 border rounded text-sm dark:bg-zinc-700" placeholder="Số lượng" />
                                        <button onClick={() => removeBomItem(index)}><TrashIcon className="w-5 h-5 text-red-500"/></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addBomItem} className="text-xs font-semibold text-blue-500 mt-2">+ Thêm vật tư</button>
                             <p className="text-sm font-semibold mt-2">Giá vốn tạm tính: <span className="text-green-600">{new Intl.NumberFormat('vi-VN').format(cogs)}đ</span></p>
                        </div>
                     </div>
                     <button onClick={handleAddProduct} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu sản phẩm</button>
                </div>
            )}

            <div className="space-y-4">
                {localProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-md shadow-sm border dark:border-zinc-700">
                        <div className="flex items-center gap-4">
                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded"/>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">{product.serviceName} - <code className="text-xs">{product.id}</code></p>
                            </div>
                        </div>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                 {localProducts.length === 0 && <p className="text-center text-slate-500 py-8">Chưa có sản phẩm nào.</p>}
            </div>
        </div>
    );
};