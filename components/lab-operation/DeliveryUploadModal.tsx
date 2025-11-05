import React, { useState, useRef, useCallback } from 'react';
import { PrintRequest } from '../../userStore';
import { XIcon } from '../icons/XIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { Loader } from '../Loader';

interface DeliveryUploadModalProps {
  request: PrintRequest;
  onClose: () => void;
  onUpload: (photoDataUrl: string) => void;
}

export const DeliveryUploadModal: React.FC<DeliveryUploadModalProps> = ({ request, onClose, onUpload }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleConfirm = () => {
    if (!previewUrl) return;
    setIsUploading(true);
    // In a real app, this would upload to a server.
    // For this implementation, we directly use the Data URL.
    onUpload(previewUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">Tải ảnh giao hàng</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
        </header>

        <div className="p-6 space-y-4">
          <p className="text-sm">Xác nhận giao hàng thành công cho đơn <span className="font-bold">#{request.id.slice(-6)}</span> của khách hàng <span className="font-bold">{request.orderDetails.customerInfo.fullName}</span>.</p>
          
          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          <div className="aspect-square w-full bg-slate-100 dark:bg-zinc-700/50 rounded-lg flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Delivery preview" className="max-w-full max-h-full object-contain rounded-lg" />
            ) : (
              <div className="text-center text-slate-500 dark:text-zinc-400">
                <CameraIcon className="w-16 h-16 mx-auto" />
                <p>Chụp ảnh bàn giao</p>
              </div>
            )}
          </div>
           <button onClick={handleUploadClick} className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-300 dark:border-zinc-600 rounded-md text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-700">
             <UploadIcon className="w-5 h-5" /> {previewUrl ? 'Chụp/Chọn lại' : 'Chụp ảnh hoặc Tải lên'}
          </button>
        </div>

        <footer className="p-4 border-t border-slate-200 dark:border-zinc-700">
          <button
            onClick={handleConfirm}
            disabled={!previewUrl || isUploading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isUploading ? 'Đang xử lý...' : 'Xác nhận đã giao'}
          </button>
        </footer>
      </div>
    </div>
  );
};
