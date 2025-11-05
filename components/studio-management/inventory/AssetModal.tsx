
import React, { useState } from 'react';
import { StudioAsset, AssetCategory, ASSET_CATEGORIES } from './types';
import { XIcon } from '../../icons/XIcon';

interface AssetModalProps {
    asset?: StudioAsset | null;
    onClose: () => void;
    onSave: (data: Omit<StudioAsset, 'id' | 'history' | 'status'>, id?: string) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onClose, onSave }) => {
    const [name, setName] = useState(asset?.name || '');
    const [code, setCode] = useState(asset?.code || '');
    const [category, setCategory] = useState<AssetCategory>(asset?.category || 'Váy cưới');
    const [size, setSize] = useState(asset?.size || '');
    const [imageUrl, setImageUrl] = useState(asset?.imageUrl || '');

    const handleSubmit = () => {
        if (!name || !code || !imageUrl) {
            alert('Vui lòng điền tên, mã và URL ảnh.');
            return;
        }
        onSave({ name, code, category, size, imageUrl }, asset?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">{asset ? 'Sửa' : 'Thêm'} Tài sản</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 space-y-4">
                    <InputField label="Tên Tài sản" value={name} onChange={setName} required />
                    <InputField label="Mã" value={code} onChange={setCode} required />
                    <div>
                        <label className="text-sm font-medium">Danh mục</label>
                        <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full p-2 mt-1 border rounded dark:bg-zinc-700">
                            {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <InputField label="Kích thước" value={size} onChange={setSize} placeholder="S, M, L, XL..." />
                    <InputField label="URL Hình ảnh" value={imageUrl} onChange={setImageUrl} required />
                </div>
                <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu</button>
                </footer>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void, required?: boolean, placeholder?: string }> = 
({ label, value, onChange, required = false, placeholder }) => (
    <div>
        <label className="block text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
    </div>
);
