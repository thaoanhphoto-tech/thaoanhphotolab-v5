
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { XIcon } from '../icons/XIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { OrderSourceChannel, ManualOrderItem, User, OPERATIONAL_ROLE_NAMES } from '../../userStore';
import { PricingTable, getProductPrice } from '../../pricingStore';
import { StarIcon } from '../icons/StarIcon';
import { Product } from '../../productStore';

interface CreateOrderModalProps {
    onClose: () => void;
    onSave: (
        customerInfo: { fullName: string; zalo: string; address?: string },
        sourceChannel: OrderSourceChannel,
        items: ManualOrderItem[],
        notes: string,
        files: string[],
        fileStorageLocation: string,
        referringEmployeeId?: string
    ) => void;
    currentUser: User;
    prices: PricingTable;
    users: User[];
    products: Product[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
const parseCurrency = (value: string) => parseInt(value.replace(/\D/g, ''), 10) || 0;


const ORDER_SOURCES: OrderSourceChannel[] = ['Zalo', 'Facebook', 'Gmail', 'Tại cửa hàng'];
const FILE_STORAGE_LOCATIONS = ['Máy chủ Lab', 'Hệ thống Web', 'Google Drive', 'Khác'];
const SIZES = ['6x9', '9x12', '10x15', '13x18', '15x21', '20x30', '25x38', '30x40', '30x45', '35x50', '40x60', '50x75', '60x90', '70x110', 'Khác'];
const QUANTITIES = Array.from({ length: 50 }, (_, i) => i + 1);

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onSave, currentUser, prices, users, products }) => {
    const [isVipOrder, setIsVipOrder] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [fullName, setFullName] = useState('');
    const [zalo, setZalo] = useState('');
    const [address, setAddress] = useState('');
    const [sourceChannel, setSourceChannel] = useState<OrderSourceChannel>('Zalo');
    const [items, setItems] = useState<ManualOrderItem[]>([{ productCode: '', productName: '', size: '60x90', quantity: 1, unitPrice: 0 }]);
    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState<string[]>([]);
    const [fileStorageLocation, setFileStorageLocation] = useState(FILE_STORAGE_LOCATIONS[0]);
    const [referringEmployeeId, setReferringEmployeeId] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCustomerVip, setIsCustomerVip] = useState(false);

    const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0), [items]);

    useEffect(() => {
        // This effect derives the VIP status from the Zalo number, which can be set manually or by selecting a VIP.
        const foundUser = users.find(u => u.zalo && u.zalo.trim() !== '' && u.zalo.trim() === zalo.trim());
        setIsCustomerVip(foundUser?.isVipCustomer || false);
    }, [zalo, users]);
    
    const handleVipToggle = (checked: boolean) => {
        setIsVipOrder(checked);
        // Reset customer info when toggling
        setSelectedUserId('');
        setFullName('');
        setZalo('');
        setAddress('');
    };

    const handleVipSelect = (userId: string) => {
        setSelectedUserId(userId);
        if (userId) {
            const selectedUser = users.find(u => u.id === userId);
            if (selectedUser) {
                setFullName(selectedUser.fullName);
                setZalo(selectedUser.zalo);
            }
        } else {
            setFullName('');
            setZalo('');
        }
    };


    const handleItemChange = (index: number, field: keyof ManualOrderItem, value: string | number) => {
        const newItems = [...items];
        const currentItem = { ...newItems[index] };

        if (field === 'unitPrice') {
            currentItem[field] = typeof value === 'number' ? value : parseCurrency(value as string);
        } else if (field === 'quantity') {
            currentItem[field] = Math.max(1, typeof value === 'number' ? value : parseInt(value, 10) || 1);
        } else if (field === 'productCode') {
            currentItem[field] = value as string;
            // Auto-fill product name and price based on customer's VIP status
            const product = products.find(p => p.id === value);
            if (product) {
                currentItem.productName = product.name;
                const customerForPricing: User = { 
                    ...currentUser, 
                    isVipCustomer: isCustomerVip
                };
                const priceInfo = getProductPrice(product.id, customerForPricing, prices);
                currentItem.unitPrice = priceInfo.sellingPrice;
            } else {
                 currentItem.productName = '';
                 currentItem.unitPrice = 0;
            }
        } else {
            (currentItem as any)[field] = value;
        }

        newItems[index] = currentItem;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { productCode: '', productName: '', size: '60x90', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            // Fix: Explicitly type 'file' as File to resolve type inference issue.
            const fileReaders = Array.from(event.target.files).map((file: File) => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(fileReaders).then(dataUrls => {
                setFiles(prev => [...prev, ...dataUrls]);
            });
        }
    };

    const handleSubmit = () => {
        if (!fullName || !zalo || items.some(item => !item.productCode || !item.productName)) {
            alert('Vui lòng điền đủ thông tin khách hàng và chi tiết đơn hàng (Mã SP, Tên SP).');
            return;
        }
        onSave({ fullName, zalo, address }, sourceChannel, items, notes, files, fileStorageLocation, referringEmployeeId);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[95vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Tạo Đơn Hàng Thủ Công</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6 text-slate-500 dark:text-zinc-400" /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Họ và Tên <span className="text-red-500">*</span></label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isVipOrder}
                                        onChange={e => handleVipToggle(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Khách VIP</span>
                                </label>
                            </div>

                            {isVipOrder ? (
                                <select
                                    value={selectedUserId}
                                    onChange={e => handleVipSelect(e.target.value)}
                                    className="w-full p-2 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                                >
                                    <option value="">-- Chọn khách hàng --</option>
                                    {users.filter(u => u.isVipCustomer).map(user => (
                                        <option key={user.id} value={user.id}>{user.fullName} ({user.zalo})</option>
                                    ))}
                                </select>
                            ) : (
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200" />
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Số Zalo <span className="text-red-500">*</span></label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    value={zalo} 
                                    onChange={e => setZalo(e.target.value)} 
                                    readOnly={isVipOrder && !!selectedUserId}
                                    className="w-full p-2 mt-1 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 pr-8 disabled:bg-slate-100 dark:disabled:bg-zinc-800/50" 
                                />
                                {isCustomerVip && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3" title="Khách hàng VIP">
                                    <StarIcon className="w-5 h-5 text-yellow-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Nguồn đơn hàng</label>
                            <select value={sourceChannel} onChange={e => setSourceChannel(e.target.value as OrderSourceChannel)} className="w-full p-2 mt-1 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                                {ORDER_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Địa chỉ Giao hàng (Nếu có)</label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 mt-1 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200" placeholder="Nhập địa chỉ của khách hàng..."/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Nhân viên giới thiệu (Nếu có)</label>
                            <select value={referringEmployeeId} onChange={e => setReferringEmployeeId(e.target.value)} className="w-full p-2 mt-1 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                                <option value="">-- Chọn nhân viên --</option>
                                {users.filter(u => u.operationalRole).map(employee => (
                                    <option key={employee.id} value={employee.id}>{employee.fullName} ({OPERATIONAL_ROLE_NAMES[employee.operationalRole!]})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="font-semibold mb-3 text-slate-800 dark:text-zinc-100">Chi tiết Đơn hàng</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_40px] gap-3 items-center text-xs font-bold text-slate-500 dark:text-zinc-400 px-2 pb-1 border-b dark:border-zinc-700">
                                <span>MÃ SẢN PHẨM</span>
                                <span>TÊN SẢN PHẨM</span>
                                <span>KÍCH THƯỚC</span>
                                <span className="text-center">SỐ LƯỢNG</span>
                                <span className="text-right">ĐƠN GIÁ</span>
                                <span></span>
                            </div>
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_40px] gap-3 items-center">
                                    <select value={item.productCode} onChange={e => handleItemChange(index, 'productCode', e.target.value)} className="p-2 border border-slate-300 dark:border-zinc-600 rounded-md text-sm bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                                        <option value="">Chọn mã</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                                    </select>
                                    <input type="text" value={item.productName} onChange={e => handleItemChange(index, 'productName', e.target.value)} className="p-2 border border-slate-300 dark:border-zinc-600 rounded-md text-sm bg-slate-50 dark:bg-zinc-800/50 text-slate-800 dark:text-zinc-200" />
                                    <select value={item.size} onChange={e => handleItemChange(index, 'size', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-zinc-600 rounded-md text-sm bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                                         {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="p-2 border border-slate-300 dark:border-zinc-600 rounded-md text-sm text-center bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                                        {QUANTITIES.map(q => <option key={q} value={q}>{q}</option>)}
                                    </select>
                                    <input type="text" value={formatCurrency(item.unitPrice)} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="p-2 border border-slate-300 dark:border-zinc-600 rounded-md text-sm text-right font-semibold text-red-600 bg-white dark:bg-zinc-800" />
                                    <button onClick={() => removeItem(index)} disabled={items.length <= 1} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"><XIcon className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addItem} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"><PlusCircleIcon className="w-5 h-5" /> Thêm sản phẩm</button>
                    </div>

                    {/* File Attachments */}
                    <div>
                        <h3 className="font-semibold mb-2 text-slate-800 dark:text-zinc-100">File đính kèm của Khách</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                             <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Nơi lưu trữ file</label>
                                <select value={fileStorageLocation} onChange={e => setFileStorageLocation(e.target.value)} className="w-full p-2 mt-1 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                                    {FILE_STORAGE_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                             </div>
                             <div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden"/>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full p-3 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-blue-500">
                                    <UploadIcon className="w-6 h-6 mx-auto text-slate-400 mb-1"/>
                                    <span className="text-sm font-semibold">Tải lên file ảnh</span>
                                </button>
                             </div>
                         </div>
                        {files.length > 0 && (
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                {files.map((file, index) => (
                                    <img key={index} src={file} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded"/>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Notes */}
                    <div>
                        <label className="font-semibold text-slate-800 dark:text-zinc-100">Ghi chú Đơn hàng</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 mt-1 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200" rows={3}></textarea>
                    </div>
                </div>

                <footer className="p-4 border-t border-slate-200 dark:border-zinc-700 flex justify-between items-center flex-shrink-0 bg-slate-50 dark:bg-zinc-800/50 rounded-b-xl">
                    <div>
                        <span className="text-sm text-slate-500 dark:text-zinc-400">Tổng cộng:</span>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(subtotal)}đ</p>
                    </div>
                    <button onClick={handleSubmit} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Tạo Đơn Hàng</button>
                </footer>
            </div>
        </div>
    );
};
