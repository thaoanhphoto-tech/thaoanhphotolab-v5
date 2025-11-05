import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './icons/XIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { getMediaLibrary, addImageToLibrary, removeImageFromLibrary, LibraryImage } from '../mediaLibraryStore';

interface MediaLibraryModalProps {
    itemKey: string;
    currentImageUrl: string;
    onClose: () => void;
    onSelect: (newImageUrl: string) => void;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ itemKey, currentImageUrl, onClose, onSelect }) => {
    const [images, setImages] = useState<LibraryImage[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const library = getMediaLibrary(itemKey, currentImageUrl);
        setImages(library);
    }, [itemKey, currentImageUrl]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const newLibrary = addImageToLibrary(itemKey, dataUrl);
                setImages(newLibrary);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDelete = (imageId: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa ảnh này vĩnh viễn?')) return;

        const imageToDelete = images.find(img => img.id === imageId);
        
        const newLibrary = removeImageFromLibrary(itemKey, imageId);
        setImages(newLibrary);

        // If deleting the currently selected image, select another one
        if (imageToDelete && imageToDelete.url === currentImageUrl && newLibrary.length > 0) {
            onSelect(newLibrary[0].url);
        } else if (newLibrary.length === 0) {
            onSelect(''); // Signal to revert to default
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold">Thư viện ảnh</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
                </header>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-zinc-700/50 transition-colors"
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <UploadIcon className="w-10 h-10 text-slate-400 mb-2"/>
                            <p className="text-sm font-semibold">Tải ảnh mới</p>
                        </div>
                        {images.map(image => (
                            <div key={image.id} className="relative group aspect-square">
                                <img src={image.url} alt="Library item" className="w-full h-full object-cover rounded-lg" />
                                {currentImageUrl === image.url && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white" title="Ảnh đang được hiển thị">
                                        <CheckIcon className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 rounded-lg gap-2">
                                    <button onClick={() => onSelect(image.url)} className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700">
                                        Chọn ảnh này
                                    </button>
                                    <button onClick={() => handleDelete(image.id)} className="w-full px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 flex items-center justify-center gap-1">
                                        <TrashIcon className="w-4 h-4" /> Xóa
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
