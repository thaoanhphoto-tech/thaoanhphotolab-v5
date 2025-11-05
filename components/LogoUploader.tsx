import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface LogoUploaderProps {
  logoUrl: string | null;
  onLogoUpload: (file: File) => void;
  isAdminMode: boolean;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ logoUrl, onLogoUpload, isAdminMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (isAdminMode) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onLogoUpload(file);
    }
  };

  return (
    <div className="relative group w-24 h-24 flex-shrink-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        disabled={!isAdminMode}
      />
      <div
        onClick={handleContainerClick}
        className={`w-full h-full bg-white dark:bg-zinc-900/50 rounded-md p-1 shadow-sm overflow-hidden border-2 border-teal-600 dark:border-teal-400 ${isAdminMode ? 'cursor-pointer' : ''}`}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-md">
            <UploadIcon className="w-8 h-8 text-slate-400" />
          </div>
        )}
      </div>
      {isAdminMode && (
        <div
          onClick={handleContainerClick}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-md"
        >
          <UploadIcon className="w-8 h-8 mb-1" />
          <span className="text-sm font-semibold">Đổi Logo</span>
        </div>
      )}
    </div>
  );
};