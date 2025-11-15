
import React, { useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { MediaLibraryModal } from './MediaLibraryModal';
import { dataURLtoFile } from '../utils/imageUtils';

interface PhotoUploaderProps {
  onImageUpload: (file: File) => void;
  previewUrl: string | null;
  libraryKey: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onImageUpload, previewUrl, libraryKey }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectFromLibrary = (dataUrl: string) => {
      setIsModalOpen(false);
      if (dataUrl) {
          const filename = `library-img-${Date.now()}.png`;
          const file = dataURLtoFile(dataUrl, filename);
          if (file) {
              onImageUpload(file);
          }
      }
      // If dataUrl is empty (e.g., library cleared), we don't call onImageUpload
      // to avoid breaking parent state, which expects a File object.
      // A dedicated "clear" button in the parent component would be a better UX for this.
  };

  return (
    <>
      <div
        className="relative w-full aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-center p-4 cursor-pointer transition-colors border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 hover:border-blue-500 dark:hover:border-blue-500"
        onClick={() => setIsModalOpen(true)}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="object-contain max-w-full max-h-full rounded-md" />
        ) : (
          <div className="text-slate-500 dark:text-zinc-400 pointer-events-none">
            <UploadIcon className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-zinc-500" />
            <p className="font-semibold">Chọn hoặc Tải ảnh lên</p>
            <p className="text-xs mt-1">Mở Thư viện Ảnh</p>
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <MediaLibraryModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleSelectFromLibrary}
            libraryKey={libraryKey}
            currentImageUrl={previewUrl}
        />
      )}
    </>
  );
};