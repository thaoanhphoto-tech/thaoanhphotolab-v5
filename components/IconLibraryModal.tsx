import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './icons/XIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { getCustomIcons, addCustomIcon, removeCustomIcon, CustomIcon } from '../iconStore';
import { useToast } from './Toast';

interface IconLibraryModalProps {
    onClose: () => void;
    onUpdate: () => void; // To trigger re-render on the parent
}

const IconLibraryModal: React.FC<IconLibraryModalProps> = ({ onClose, onUpdate }) => {
    const [icons, setIcons] = useState<CustomIcon[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        setIcons(getCustomIcons());
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        const name = prompt("Nhập tên cho icon mới (VD: Điện thoại 3D):");
        if (!name || !name.trim()) {
            showToast("Tên icon không được để trống.", 'error');
            return;
        }

        const type = prompt("Nhập loại icon (chỉ được là 'phone', 'zalo', hoặc 'facebook'):");
        if (type !== 'phone' && type !== 'zalo' && type !== 'facebook') {
            showToast("Loại icon không hợp lệ. Phải là 'phone', 'zalo', hoặc 'facebook'.", 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const newIcon: CustomIcon = {
                id: `custom-${type}-${Date.now()}`,
                name,
                type,
                dataUrl,
            };
            const newLibrary = addCustomIcon(newIcon);
            setIcons(newLibrary);
            onUpdate();
            showToast('Đã thêm icon mới!', 'success');
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = (iconId: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa icon này vĩnh viễn?')) return;
        const newLibrary = removeCustomIcon(iconId);
        setIcons(newLibrary);
        onUpdate();
        showToast('Đã xóa icon.', 'info');
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold">Thư viện Icon Tùy chỉnh</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
                </header>
                
                <div className="flex-1 overflow-y-auto p-6" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-zinc-700/50 transition-colors"
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.svg" className="hidden" />
                            <UploadIcon className="w-10 h-10 text-slate-400 mb-2"/>
                            <p className="text-sm font-semibold">Tải Icon Mới</p>
                        </div>
                        {icons.map(icon => (
                            <div key={icon.id} className="relative group aspect-square p-2 border rounded-lg dark:border-zinc-700 flex items-center justify-center bg-slate-50 dark:bg-zinc-900/50">
                                <img src={icon.dataUrl} alt={icon.name} className="max-w-full max-h-full object-contain" />
                                <div className="absolute bottom-1 left-1 right-1 text-center">
                                    <p className="text-xs bg-black/50 text-white px-1 rounded truncate">{icon.name}</p>
                                </div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete(icon.id)} className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IconLibraryModal;
