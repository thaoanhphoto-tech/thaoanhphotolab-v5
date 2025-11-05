import React, { useState } from 'react';
import { generateImageFromPrompt } from '../services/geminiService';
import { Loader } from './Loader';
import { AspectRatio } from '../types';
import { PrinterIcon } from './icons/PrinterIcon';
import { User, isFreeUserOnly } from '../userStore';
import { applyWatermark } from '../utils/imageUtils';

const ASPECT_RATIOS: AspectRatio[] = [
    { id: '1:1', name: '1:1 (Vuông)' },
    { id: '16:9', name: '16:9 (Ngang)' },
    { id: '9:16', name: '9:16 (Dọc)' },
    { id: '4:3', name: '4:3 (Ngang)' },
    { id: '3:4', name: '3:4 (Dọc)' },
];

interface ImageGeneratorProps {
    currentUser: User | null;
    onPrintRequest: (imageUrl: string, sourceTool: string) => void;
}

interface GeneratedImageState {
    original: string;
    display: string;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ currentUser, onPrintRequest }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImageState[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Vui lòng nhập mô tả để tạo ảnh.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);

        try {
            const result = await generateImageFromPrompt(prompt, aspectRatio);
            if (result.images) {
                const isFree = isFreeUserOnly(currentUser);
                const processedImages = await Promise.all(result.images.map(async (img) => ({
                    original: img,
                    display: isFree ? await applyWatermark(img) : img,
                })));
                setGeneratedImages(processedImages);
            } else {
                setError(result.text || 'Không thể tạo ảnh. Vui lòng thử lại.');
            }
        } catch (e) {
            console.error("Image generation failed:", e);
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = (imageUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `generated-image-${index}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isFree = isFreeUserOnly(currentUser);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
                <h2 className="text-xl font-bold mb-4">Tạo ảnh từ mô tả</h2>
                <div className="space-y-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Mô tả hình ảnh bạn muốn tạo. Ví dụ: 'một chú mèo phi hành gia đang lướt ván trong không gian, phong cách nghệ thuật số'..."
                        className="w-full p-3 border border-slate-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200"
                        rows={4}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Tỉ lệ khung hình</label>
                        <div className="flex flex-wrap gap-2">
                            {ASPECT_RATIOS.map(ratio => (
                                <button
                                    key={ratio.id}
                                    onClick={() => setAspectRatio(ratio.id)}
                                    className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                                        aspectRatio === ratio.id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-slate-200 dark:bg-zinc-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-zinc-500'
                                    }`}
                                >
                                    {ratio.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isLoading ? 'Đang tạo...' : 'Tạo ảnh'}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {isLoading && (
                    <div className="relative h-64 flex items-center justify-center">
                        <Loader />
                    </div>
                )}
                {error && <p className="text-center text-red-500">{error}</p>}
                {generatedImages && (
                    <div className="grid grid-cols-2 gap-4">
                        {generatedImages.map((img, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img src={img.display} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {!isFree && (
                                        <button
                                            onClick={() => handleDownload(img.display, index)}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700"
                                        >
                                            Tải xuống
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onPrintRequest(img.original, 'Tạo Ảnh')}
                                        className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                        title="Gửi in Lab"
                                    >
                                        <PrinterIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};