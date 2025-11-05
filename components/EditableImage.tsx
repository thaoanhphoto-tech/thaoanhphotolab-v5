import React, { useState, useEffect } from 'react';
import { loadImageContent, saveImageContent } from '../contentStore';
import { UploadIcon } from './icons/UploadIcon';
import { MediaLibraryModal } from './MediaLibraryModal';

interface EditableImageProps {
    contentKey: string;
    defaultSrc: string;
    isAdminMode: boolean;
    alt: string;
    className?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({ contentKey, defaultSrc, isAdminMode, alt, className }) => {
    const [imageSrc, setImageSrc] = useState(defaultSrc);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setImageSrc(loadImageContent(contentKey, defaultSrc));
    }, [contentKey, defaultSrc]);

    const handleSelect = (newImageUrl: string) => {
        if (newImageUrl) {
            saveImageContent(contentKey, newImageUrl);
            setImageSrc(newImageUrl);
        } else {
            // Revert to default if the library becomes empty
            saveImageContent(contentKey, defaultSrc);
            setImageSrc(defaultSrc);
        }
        setIsModalOpen(false);
    };

    if (!isAdminMode) {
        return <img src={imageSrc} alt={alt} className={className} />;
    }

    return (
        <>
            <div className={`relative group w-full h-full ${className}`}>
                <img src={imageSrc} alt={alt} className="w-full h-full object-cover" />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                    <UploadIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm font-semibold">Quản lý ảnh</span>
                </button>
            </div>
            {isModalOpen && (
                <MediaLibraryModal
                    itemKey={contentKey}
                    currentImageUrl={imageSrc}
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleSelect}
                />
            )}
        </>
    );
};
