import React, { useState } from 'react';
import { Material } from '../../inventoryStore';
import { XIcon } from '../icons/XIcon';

interface MaterialModalProps {
    material: Material | null;
    onClose: () => void;
    onSave: (materialData: Omit<Material, 'id' | 'stock'>, id?: string) => void;
    sizes: string[];
}

const InputField: React.FC<{ label: string, value: string | number, onChange: (val: string) => void, type?: string, required?: boolean, placeholder?: string }> = 
({ label, value, onChange, type = 'text', required = false, placeholder }) => (
    <div>
        <label className="block text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
        <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            required={required} 
            placeholder={placeholder}
            className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
        />
    </div>
);


export const MaterialModal: React.FC<MaterialModalProps> = ({ material, onClose, onSave, sizes }) => {
    const [code, setCode] = useState(material?.code || '');
    const [name, setName] = useState(material?.name || '');
    const [unit, setUnit] = useState(material?.unit || '');
    const [size, setSize] = useState(material?.size || '');
    const [unitPrice, setUnitPrice] = useState(material?.unitPrice || 0);
    const [lowStockThreshold, setLowStockThreshold] = useState(material?.lowStockThreshold || 0);
    const [imageUrl, setImageUrl] = useState(material?.imageUrl || '');
    const [accountingCode, setAccountingCode] = useState(material?.accountingCode || '152');
    const [expenseType, setExpenseType] = useState(material?.expenseType || 'valid_vat');

    const handleSubmit = () => {
        if (!code.trim() || !name.trim() || !unit.trim()) {
            alert('Vui lòng điền Mã VT, Tên vật tư, và Đơn vị.');
            return;
        }
        onSave({
            code,
            name,
            unit,
            size,
            unitPrice,
            lowStockThreshold,
            imageUrl,
            accountingCode: accountingCode as any,
            expenseType: expenseType as any,
        }, material?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">{material ? 'Chỉnh sửa' : 'Thêm'} Vật tư</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Mã VT" value={code} onChange={setCode} required placeholder="VT001"/>
                        <InputField label="Tên Vật tư" value={name} onChange={setName} required placeholder="Giấy in ảnh"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Kích thước</label>
                            <select value={size} onChange={e => setSize(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                                <option value="">-- Không có --</option>
                                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <InputField label="Đơn vị" value={unit} onChange={setUnit} required placeholder="Tờ, m², ..."/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Đơn giá" type="number" value={String(unitPrice)} onChange={val => setUnitPrice(Number(val))}/>
                        <InputField label="Ngưỡng báo tồn" type="number" value={String(lowStockThreshold)} onChange={val => setLowStockThreshold(Number(val))}/>
                    </div>
                    <InputField label="URL Hình ảnh" value={imageUrl} onChange={setImageUrl} placeholder="https://..."/>
                    <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Tài khoản Kế toán</label>
                            <select value={accountingCode} onChange={e => setAccountingCode(e.target.value as "152" | "153" | "155" | "156")} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                                <option value="152">152 - Nguyên vật liệu</option>
                                <option value="153">153 - Công cụ dụng cụ</option>
                                <option value="155">155 - Thành phẩm</option>
                                <option value="156">156 - Hàng hóa</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Loại Chi phí (Thuế)</label>
                             <select value={expenseType} onChange={e => setExpenseType(e.target.value as "valid_vat" | "valid_no_vat" | "invalid")} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                                <option value="valid_vat">Hợp lệ (có VAT)</option>
                                <option value="valid_no_vat">Hợp lệ (không VAT)</option>
                                <option value="invalid">Không hợp lệ</option>
                            </select>
                        </div>
                    </div>
                </div>
                <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu Vật tư</button>
                </footer>
            </div>
        </div>
    );
};

export default MaterialModal;
