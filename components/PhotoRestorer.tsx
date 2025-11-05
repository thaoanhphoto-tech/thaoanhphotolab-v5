import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PhotoUploader } from './PhotoUploader';
import { ComparisonSlider } from './ComparisonSlider';
import { Loader } from './Loader';
import { restorePhoto, analyzeImage } from '../services/geminiService';
import { PrinterIcon } from './icons/PrinterIcon';
import { User, isFreeUserOnly } from '../userStore';
import { applyWatermark, dataURLtoFile } from '../utils/imageUtils';
import { OptionSelector } from './OptionSelector';
import { ImageAnalysisFeedback } from './ImageAnalysisFeedback';
import { OLD_PHOTO_OUTFITS, OLD_PHOTO_HAIRSTYLES, OLD_PHOTO_ACCESSORIES, GENDERS } from '../constants';
import type { Outfit, Hairstyle, Gender, ImageAnalysisResult } from '../types';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface PhotoRestorerProps {
    currentUser: User | null;
    onPrintRequest: (imageDataUrl: string, sourceTool: string) => void;
    onSinglePhotoDownloadRequest: (imageUrl: string) => void;
}

export const PhotoRestorer: React.FC<PhotoRestorerProps> = ({ currentUser, onPrintRequest, onSinglePhotoDownloadRequest }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [originalGeneratedUrl, setOriginalGeneratedUrl] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);

    // New state for advanced options
    const [gender, setGender] = useState<Gender>('Nữ');
    const [outfit, setOutfit] = useState<Outfit>(OLD_PHOTO_OUTFITS[0]);
    const [hairstyle, setHairstyle] = useState<Hairstyle>(OLD_PHOTO_HAIRSTYLES[0]);
    const [accessories, setAccessories] = useState<string[]>([]);
    const [customRequest, setCustomRequest] = useState('');


    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setPreviewUrl(url);
            setError(null);
            
            const performAnalysis = async () => {
                setIsAnalyzing(true);
                try {
                    const result = await analyzeImage(imageFile);
                    setAnalysisResult(result);
                    if (result.gender) {
                        setGender(result.gender);
                    }
                } catch (e) {
                    console.error("Analysis failed", e);
                } finally {
                    setIsAnalyzing(false);
                }
            };
            performAnalysis();

            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

    const filteredOutfits = useMemo(() => OLD_PHOTO_OUTFITS.filter(o => o.id === 'none' || o.gender === gender), [gender]);
    const filteredHairstyles = useMemo(() => OLD_PHOTO_HAIRSTYLES.filter(h => h.id === 'none' || h.gender === gender), [gender]);

    useEffect(() => {
        if (!filteredOutfits.some(o => o.id === outfit.id)) {
            setOutfit(OLD_PHOTO_OUTFITS[0]);
        }
    }, [filteredOutfits, outfit.id]);

    useEffect(() => {
        if (!filteredHairstyles.some(h => h.id === hairstyle.id)) {
            setHairstyle(OLD_PHOTO_HAIRSTYLES[0]);
        }
    }, [filteredHairstyles, hairstyle.id]);

    const handleAccessoryToggle = (accessoryId: string) => {
        setAccessories(prev => prev.includes(accessoryId) ? prev.filter(id => id !== accessoryId) : [...prev, accessoryId]);
    };

    const handleRestore = async () => {
        if (!imageFile) {
            setError('Vui lòng tải ảnh lên trước.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);
        setOriginalGeneratedUrl(null);

        try {
            const result = await restorePhoto(
                imageFile,
                outfit.name,
                hairstyle.name,
                accessories,
                customRequest
            );

            if (result.image) {
                setOriginalGeneratedUrl(result.image);
                if (isFreeUserOnly(currentUser)) {
                    const watermarkedImage = await applyWatermark(result.image);
                    setGeneratedImageUrl(watermarkedImage);
                } else {
                    setGeneratedImageUrl(result.image);
                }
            } else {
                setError(result.text || 'AI không thể phục hồi ảnh. Vui lòng thử lại.');
            }
        } catch (e) {
            console.error('Photo restoration failed:', e);
            setError('Đã xảy ra lỗi trong quá trình phục hồi. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const isFree = isFreeUserOnly(currentUser);

    const handleDownload = useCallback(() => {
        if (!originalGeneratedUrl) return;
        const link = document.createElement('a');
        link.href = originalGeneratedUrl;
        link.download = `restored-photo-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [originalGeneratedUrl]);

    const handleContinueRestoration = useCallback(() => {
        if (!originalGeneratedUrl) return;
        const newFile = dataURLtoFile(originalGeneratedUrl, `restored-photo-${Date.now()}.png`);
        if (newFile) {
            setImageFile(newFile);
            setGeneratedImageUrl(null);
            setOriginalGeneratedUrl(null);
        }
    }, [originalGeneratedUrl]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Controls */}
            <div className="space-y-6">
                <PhotoUploader onImageUpload={setImageFile} previewUrl={previewUrl} />
                
                {imageFile && <ImageAnalysisFeedback result={analysisResult} isLoading={isAnalyzing} />}
                
                <div className="space-y-4">
                    <OptionSelector
                        label="Giới tính"
                        options={GENDERS}
                        selectedOption={GENDERS.find(g => g.id === gender)!}
                        onSelect={(option) => setGender(option.id)}
                        renderOption={(option) => <span>{option.name}</span>}
                        disabled={!imageFile}
                    />
                    <OptionSelector
                        label="Trang phục"
                        options={filteredOutfits}
                        selectedOption={outfit}
// FIX: Wrap state setter in a function to match expected prop type
                        onSelect={(option) => setOutfit(option)}
                        renderOption={o => <span>{o.name}</span>}
                        disabled={!imageFile}
                    />
                     <OptionSelector
                        label="Kiểu tóc"
                        options={filteredHairstyles}
                        selectedOption={hairstyle}
// FIX: Wrap state setter in a function to match expected prop type
                        onSelect={(option) => setHairstyle(option)}
                        renderOption={h => <span>{h.name}</span>}
                        disabled={!imageFile}
                    />
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Phụ kiện</label>
                        <div className="flex flex-wrap gap-2">
                            {OLD_PHOTO_ACCESSORIES.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => handleAccessoryToggle(acc.id)}
                                    disabled={!imageFile}
                                    className={`px-3 py-1.5 text-sm rounded-full border ${accessories.includes(acc.id) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-600'}`}
                                >
                                    {acc.name}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Yêu cầu thêm</label>
                        <textarea
                            value={customRequest}
                            onChange={(e) => setCustomRequest(e.target.value)}
                            placeholder="Ví dụ: thay nền thành cảnh làng quê xưa, thêm nốt ruồi..."
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
                            rows={2}
                            disabled={!imageFile}
                        />
                    </div>
                </div>

                <button onClick={handleRestore} disabled={!imageFile || isLoading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                    {isLoading ? 'Đang phục hồi...' : 'Bắt đầu Phục hồi & Chỉnh sửa'}
                </button>
            </div>

            {/* Right Column: Result */}
            <div className="relative aspect-square">
                {isLoading && <Loader />}
                {error && <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 p-4 rounded-lg text-center">{error}</div>}
                
                {previewUrl && generatedImageUrl ? (
                    <ComparisonSlider originalImageUrl={previewUrl} generatedImageUrl={generatedImageUrl} />
                ) : generatedImageUrl ? (
                    <img src={generatedImageUrl} alt="Restored" className="w-full h-full object-contain rounded-lg" />
                ) : previewUrl ? (
                     <div className="w-full h-full bg-white dark:bg-zinc-900/50 rounded-lg flex items-center justify-center p-4">
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-md" />
                     </div>
                ) : (
                    <div className="w-full h-full bg-white dark:bg-zinc-900/50 border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-lg flex items-center justify-center">
                        <p className="text-slate-500 dark:text-zinc-400">Kết quả sẽ hiện ở đây</p>
                    </div>
                )}

                {generatedImageUrl && !isLoading && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                            onClick={handleContinueRestoration}
                            disabled={isFree}
                            className={`w-full py-2 px-3 bg-slate-500 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm ${isFree ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isFree ? "Nâng cấp để sử dụng tính năng này" : "Sử dụng ảnh này làm ảnh gốc cho lần phục chế tiếp theo"}
                        >
                            <ArrowUturnLeftIcon className="w-4 h-4" /> Tiếp tục phục chế
                        </button>
                        {isFree ? (
                             <button 
                                onClick={() => onSinglePhotoDownloadRequest(originalGeneratedUrl || '')}
                                className="w-full py-2 px-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <DownloadIcon className="w-5 h-5" /> Tải về (Gỡ logo)
                            </button>
                        ) : (
                            <button onClick={handleDownload} className="w-full py-2 px-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2">
                                <DownloadIcon className="w-5 h-5" /> Tải về
                            </button>
                        )}
                        <button 
                            onClick={() => onPrintRequest(originalGeneratedUrl || generatedImageUrl, 'Phục Hồi Ảnh Cũ')}
                            className="w-full py-2 px-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <PrinterIcon className="w-5 h-5" /> Gửi in Lab
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
