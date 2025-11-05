import React, { useState, useRef } from 'react';
import { User } from '../userStore';
import { PhotoUploader } from './PhotoUploader';
import { Loader } from './Loader';
import { generateAdvancedSocialMediaPost } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CheckIcon } from './icons/CheckIcon';
import { UploadIcon } from './icons/UploadIcon';

interface UploadedImage {
    id: string;
    file: File;
    previewUrl: string;
}

interface SocialMediaPostGeneratorProps {
    currentUser: User | null;
}

const Uploader: React.FC<{ title: string, onFilesSelected: (files: FileList | null) => void, multiple?: boolean }> =
 ({ title, onFilesSelected, multiple = false }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">{title}</h3>
            <div onClick={() => inputRef.current?.click()} className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-blue-500 bg-slate-50 dark:bg-zinc-900/50">
                <UploadIcon className="w-8 h-8 mx-auto text-slate-400 mb-2"/>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Nhấn hoặc kéo ảnh vào đây</p>
                <input type="file" ref={inputRef} onChange={e => onFilesSelected(e.target.files)} multiple={multiple} accept="image/*" className="hidden"/>
            </div>
        </div>
    );
}

export const SocialMediaPostGenerator: React.FC<SocialMediaPostGeneratorProps> = ({ currentUser }) => {
    const [mainImages, setMainImages] = useState<UploadedImage[]>([]);
    const [selectedMainImageIds, setSelectedMainImageIds] = useState<string[]>([]);
    
    const [templateImage, setTemplateImage] = useState<UploadedImage | null>(null);
    const [logoImage, setLogoImage] = useState<UploadedImage | null>(null);

    const [additionalRequest, setAdditionalRequest] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleMainImagesUpload = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).map(file => {
            const id = `${file.name}-${file.lastModified}-${Math.random()}`;
            return {
                id,
                file,
                previewUrl: URL.createObjectURL(file)
            };
        });
        setMainImages(prev => [...prev, ...newFiles]);
    };

    const handleMainImageSelect = (id: string) => {
        setSelectedMainImageIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(selectedId => selectedId !== id); // Deselect if already selected
            } else {
                return [...prev, id]; // Select if not selected
            }
        });
    };

    const handleTemplateUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        setTemplateImage({
            id: `${file.name}-${file.lastModified}`,
            file,
            previewUrl: URL.createObjectURL(file)
        });
    };
    
    const handleLogoUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        setLogoImage({
            id: `${file.name}-${file.lastModified}`,
            file,
            previewUrl: URL.createObjectURL(file)
        });
    };

    const handleGenerate = async () => {
        const selectedMainImages = mainImages.filter(img => selectedMainImageIds.includes(img.id));
        if (selectedMainImages.length === 0 || !templateImage) {
            setError("Vui lòng tải lên và chọn ít nhất một ảnh chính, và tải lên thiết kế mẫu.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);

        try {
            const result = await generateAdvancedSocialMediaPost(
                selectedMainImages.map(img => img.file),
                templateImage.file,
                logoImage?.file || null,
                additionalRequest
            );

            if (result.image) {
                setGeneratedImageUrl(result.image);
            } else {
                setError(result.text || "AI không thể tạo ảnh. Vui lòng thử lại.");
            }
        } catch(e) {
            console.error("Advanced social media post generation failed:", e);
            setError("Đã có lỗi xảy ra trong quá trình tạo ảnh.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImageUrl) return;
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = `social-post-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const canGenerate = mainImages.length > 0 && selectedMainImageIds.length > 0 && templateImage !== null && !isLoading;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-6">
                <Uploader title="1. Tải lên ảnh chính (có thể tải nhiều ảnh)" onFilesSelected={handleMainImagesUpload} multiple />
                {mainImages.length > 0 && (
                    <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Chọn ảnh để sử dụng</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {mainImages.map(image => (
                                <button key={image.id} onClick={() => handleMainImageSelect(image.id)} className="relative aspect-square rounded-md overflow-hidden border-2 transition-colors duration-200 data-[selected=true]:border-blue-500 data-[selected=true]:ring-2 data-[selected=true]:ring-blue-300 border-transparent" data-selected={selectedMainImageIds.includes(image.id)}>
                                    <img src={image.previewUrl} alt="Main image option" className="w-full h-full object-cover" />
                                    {selectedMainImageIds.includes(image.id) && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                                <CheckIcon className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <Uploader title="2. Tải lên Thiết kế mẫu" onFilesSelected={handleTemplateUpload} />
                {templateImage && (
                     <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Mẫu đã tải lên</h3>
                        <img src={templateImage.previewUrl} alt="Template preview" className="w-32 h-auto object-contain rounded-md" />
                     </div>
                )}

                <Uploader title="3. Tải logo (Tùy chọn)" onFilesSelected={handleLogoUpload} />
                {logoImage && (
                     <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Logo đã tải lên</h3>
                        <img src={logoImage.previewUrl} alt="Logo preview" className="w-24 h-24 object-contain rounded-md bg-slate-100 dark:bg-zinc-900 p-1" />
                     </div>
                )}

                <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">4. Yêu cầu thêm (Tùy chọn)</label>
                    <textarea
                        value={additionalRequest}
                        onChange={(e) => setAdditionalRequest(e.target.value)}
                        placeholder="Ví dụ: 'thêm hiệu ứng lấp lánh', 'chuyển sang tông màu cổ điển', 'thêm dòng chữ: Sale 50%'"
                        className="w-full p-2 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-800 dark:text-zinc-200"
                        rows={3}
                    />
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center text-base"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Đang xử lý...' : 'Tạo ảnh'}
                </button>
            </div>

            {/* Preview */}
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Kết quả</h3>
                 <div className="relative aspect-[9/16] bg-slate-200 dark:bg-zinc-900 rounded-lg flex items-center justify-center p-2 border-2 border-dashed border-slate-300 dark:border-zinc-700">
                    {isLoading && <Loader />}
                    {error && <p className="text-center text-red-500 p-4">{error}</p>}
                    {generatedImageUrl && !isLoading && (
                        <img src={generatedImageUrl} alt="Generated post" className="max-w-full max-h-full object-contain rounded-md" />
                    )}
                    {!isLoading && !error && !generatedImageUrl && (
                        <p className="text-slate-500 dark:text-zinc-400">Kết quả sẽ hiện ở đây</p>
                    )}
                 </div>
                 {generatedImageUrl && (
                     <button onClick={handleDownload} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                        <DownloadIcon className="w-5 h-5" />
                        Tải ảnh xuống
                    </button>
                 )}
            </div>
        </div>
    );
};