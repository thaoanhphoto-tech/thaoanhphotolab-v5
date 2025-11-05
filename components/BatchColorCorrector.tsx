

import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { applyColorGrade, analyzeStyleFromImage } from '../services/geminiService';
import type { UpscaleQuality } from '../components/pro-ai-relight/types';
import { User, isFreeUserOnly } from '../userStore';
import { applyWatermark } from '../utils/imageUtils';
import { PrinterIcon } from './icons/PrinterIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageFile extends File {
    id: string;
    previewUrl: string;
}

interface BatchColorCorrectorProps {
    currentUser: User | null;
    onPrintRequest: (imageUrl: string, sourceTool: string) => void;
}

interface ProcessedImage {
    id: string;
    url: string; // display url
    originalUrl: string; // for printing
}

export const BatchColorCorrector: React.FC<BatchColorCorrectorProps> = ({ currentUser, onPrintRequest }) => {
    const [sourceImages, setSourceImages] = useState<ImageFile[]>([]);
    const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
    const [colorPrompt, setColorPrompt] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const stopProcessingRef = useRef(false);
    const sourceInputRef = useRef<HTMLInputElement>(null);
    const refInputRef = useRef<HTMLInputElement>(null);
    const isFree = isFreeUserOnly(currentUser);

    const handleSourceFiles = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).map(file => Object.assign(file, {
            id: `${file.name}-${file.lastModified}`,
            previewUrl: URL.createObjectURL(file)
        }));
        setSourceImages(prev => [...prev, ...newFiles]);
    };

    const handleReferenceFile = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const newFile = Object.assign(file, {
            id: `${file.name}-${file.lastModified}`,
            previewUrl: URL.createObjectURL(file)
        });
        setReferenceImage(newFile);
        setColorPrompt('');
        handleAnalyzeStyle(newFile);
    };

    const handleAnalyzeStyle = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const description = await analyzeStyleFromImage(file);
            if (description) setColorPrompt(description);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const startProcessing = async () => {
        if (sourceImages.length === 0 || (!referenceImage && !colorPrompt.trim())) {
            alert('Vui lòng tải lên ảnh nguồn và ảnh tham chiếu hoặc mô tả màu.');
            return;
        }

        setIsProcessing(true);
        setProcessedImages([]);
        setProgress(0);
        stopProcessingRef.current = false;
        
        for (let i = 0; i < sourceImages.length; i++) {
            if (stopProcessingRef.current) break;
            
            const file = sourceImages[i];
            setProgress(((i + 1) / sourceImages.length) * 100);
            
            try {
                const result = await applyColorGrade(file, colorPrompt, 'fhd');
                if (result.image) {
                    const displayUrl = isFree ? await applyWatermark(result.image) : result.image;
                    setProcessedImages(prev => [...prev, { id: file.id, url: displayUrl, originalUrl: result.image! }]);
                }
            } catch(e) {
                console.error(`Failed to process ${file.name}`, e);
            }
        }

        setIsProcessing(false);
    };

    const handleDownload = (imageUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `color-corrected-${index}.png`;
        link.click();
    };

    const handleDownloadAll = () => {
        processedImages.forEach((img, index) => {
            handleDownload(img.url, index);
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Inputs */}
                <div className="space-y-4">
                    <Uploader
                        title="1. Tải lên các ảnh cần chỉnh màu"
                        onFilesSelected={handleSourceFiles}
                        inputRef={sourceInputRef}
                        multiple
                    />
                     {sourceImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-100 dark:bg-zinc-800/50 rounded-md">
                            {sourceImages.map(f => <img key={f.id} src={f.previewUrl} className="w-full h-full aspect-square object-cover rounded" alt={f.name} />)}
                        </div>
                    )}
                </div>
                 {/* Right: Reference */}
                 <div className="space-y-4">
                    <Uploader
                        title="2. Tải ảnh mẫu hoặc mô tả màu"
                        onFilesSelected={handleReferenceFile}
                        inputRef={refInputRef}
                    />
                     {referenceImage && <img src={referenceImage.previewUrl} className="w-32 h-32 object-cover rounded-lg mx-auto" alt="Reference" />}
                     <textarea
                        value={colorPrompt}
                        onChange={e => {
                            setColorPrompt(e.target.value);
                            if (referenceImage) setReferenceImage(null);
                        }}
                        placeholder="Ví dụ: Tông màu phim của Wong Kar-wai, ấm áp và hoài cổ..."
                        className="w-full p-2 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200"
                        rows={3}
                     />
                     {isAnalyzing && <p className="text-xs text-center">Đang phân tích màu...</p>}
                </div>
            </div>
            
            <button
                onClick={startProcessing}
                disabled={isProcessing || sourceImages.length === 0 || (!referenceImage && !colorPrompt.trim())}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-400"
            >
                <SparklesIcon className="w-5 h-5"/> Bắt đầu chỉnh màu ({sourceImages.length} ảnh)
            </button>

            {isProcessing && (
                <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-zinc-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            )}
            
            {processedImages.length > 0 && (
                <div>
                     {!isFree && <button onClick={handleDownloadAll} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold flex items-center gap-2"><DownloadIcon className="w-4 h-4" /> Tải về tất cả</button>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {processedImages.map((img, index) => (
                            <div key={img.id} className="relative group aspect-square">
                                <img src={img.url} className="w-full h-full object-cover rounded-lg" alt={`Processed ${index + 1}`} />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {!isFree && (
                                        <button
                                            onClick={() => handleDownload(img.url, index)}
                                            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            title="Tải xuống"
                                        >
                                           <DownloadIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onPrintRequest(img.originalUrl, 'Chỉnh Màu Hàng Loạt')}
                                        className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                        title="Gửi in Lab"
                                    >
                                        <PrinterIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Uploader: React.FC<{ title: string, onFilesSelected: (files: FileList | null) => void, inputRef: React.RefObject<HTMLInputElement>, multiple?: boolean }> =
 ({ title, onFilesSelected, inputRef, multiple=false }) => (
    <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <div onClick={() => inputRef.current?.click()} className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-blue-500">
            <UploadIcon className="w-8 h-8 mx-auto text-slate-400 mb-2"/>
            <p className="text-sm font-semibold">Nhấn hoặc kéo ảnh vào đây</p>
            <input type="file" ref={inputRef} onChange={e => onFilesSelected(e.target.files)} multiple={multiple} accept="image/*" className="hidden"/>
        </div>
    </div>
);