
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PortraitUploader } from './PortraitUploader';
import { ReferenceModeSelector } from './ReferenceModeSelector';
import { ConceptSelector } from './ConceptSelector';
import { StyleReferenceUploader } from './StyleReferenceUploader';
import { ResultGrid } from './ResultGrid';
import { GenerationProgress } from './GenerationProgress';
import { conceptCategories as allConceptCategories } from '../../data/conceptData';
import type { UploadedPortrait, ReferenceMode, Concept, GeneratedImage, Pose } from './types';
import { compressImage } from '../../utils/imageUtils';
import { generateConceptPhoto, analyzeStyleFromImage } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import { PrinterIcon } from '../icons/PrinterIcon';
import { User, isFreeUserOnly } from '../../userStore';
import { applyWatermark } from '../../utils/imageUtils';

interface ConceptPhotoGeneratorProps {
    currentUser: User | null;
    onPrintRequest: (imageDataUrl: string, sourceTool: string) => void;
}

export const ConceptPhotoGenerator: React.FC<ConceptPhotoGeneratorProps> = ({ currentUser, onPrintRequest }) => {
    const [uploadedPortraits, setUploadedPortraits] = useState<UploadedPortrait[]>([]);
    const [referenceMode, setReferenceMode] = useState<ReferenceMode>('concept');
    const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
    const [selectedPoses, setSelectedPoses] = useState<Pose[]>([]);

    const [styleReferenceFile, setStyleReferenceFile] = useState<File | null>(null);
    const [stylePrompt, setStylePrompt] = useState('');
    const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);
    const [preserveFaces, setPreserveFaces] = useState(true);
    const [additionalRequest, setAdditionalRequest] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    // Fix: Add useRef import to fix 'Cannot find name' error.
    const stopGenerationRef = useRef(false);

    // Filter out family-related concepts
    const conceptCategories = useMemo(() => 
        allConceptCategories
            .map(category => ({
                ...category,
                concepts: category.concepts.filter(concept => !concept.isFamilyPrompt),
            }))
            .filter(category => category.concepts.length > 0)
    , []);

    useEffect(() => {
        // Auto-select the first concept of the first category
        if (conceptCategories.length > 0 && conceptCategories[0].concepts.length > 0) {
            const firstConcept = conceptCategories[0].concepts[0];
            if (!selectedConcept) {
                 setSelectedConcept(firstConcept);
                 setSelectedPoses(firstConcept.poses);
            }
        }
    }, [conceptCategories, selectedConcept]);


    const handleFilesChange = useCallback((files: File[]) => {
        const newPortraits: UploadedPortrait[] = files.map(file => ({
            id: `${file.name}-${file.lastModified}`,
            file: file,
            status: 'compressing',
            previewUrl: URL.createObjectURL(file),
        }));
        
        setUploadedPortraits(prev => [...prev, ...newPortraits]);

        newPortraits.forEach(portrait => {
            compressImage(portrait.file)
                .then(compressedFile => {
                    setUploadedPortraits(prev => prev.map(p => p.id === portrait.id ? { ...p, file: compressedFile, status: 'done' } : p));
                })
                .catch(() => {
                    setUploadedPortraits(prev => prev.map(p => p.id === portrait.id ? { ...p, status: 'error' } : p));
                });
        });
    }, []);

    const handleStyleFileChange = (file: File | null) => {
        setStyleReferenceFile(file);
        if (file) {
            setStylePrompt('');
            handleAnalyzeStyle(file);
        }
    };
    
    const handleAnalyzeStyle = async (file: File) => {
        setIsAnalyzingStyle(true);
        try {
            const description = await analyzeStyleFromImage(file);
            if (description) {
                setStylePrompt(description);
            }
        } catch (e) {
            console.error("Style analysis failed", e);
        } finally {
            setIsAnalyzingStyle(false);
        }
    };

    const readyPortraits = useMemo(() => uploadedPortraits.filter(p => p.status === 'done'), [uploadedPortraits]);
    
    const canGenerate = useMemo(() => {
        if (isGenerating || readyPortraits.length === 0) return false;
        if (referenceMode === 'concept') {
            return selectedConcept && selectedPoses.length > 0 && readyPortraits.length >= selectedConcept.requiredPortraits;
        }
        if (referenceMode === 'style') {
            return styleReferenceFile || stylePrompt.trim() !== '';
        }
        return false;
    }, [isGenerating, readyPortraits, referenceMode, selectedConcept, selectedPoses, styleReferenceFile, stylePrompt]);

    const handleGenerate = async () => {
        if (!canGenerate) return;

        setIsGenerating(true);
        setError(null);
        setGeneratedImages([]);
        setGenerationProgress(0);
        stopGenerationRef.current = false;

        const promptsToRun: { name: string, prompt: string }[] = [];
        if (referenceMode === 'concept' && selectedConcept) {
            selectedPoses.forEach(pose => promptsToRun.push({name: pose.name, prompt: pose.prompt}));
        } else if (referenceMode === 'style' && stylePrompt) {
            promptsToRun.push({name: "Style Applied", prompt: stylePrompt});
        }
        
        const isFree = isFreeUserOnly(currentUser);
        const totalSteps = promptsToRun.length;
        for (let i = 0; i < totalSteps; i++) {
            if (stopGenerationRef.current) {
                break;
            }
            
            const currentPrompt = promptsToRun[i];
            setProgressMessage(`Đang tạo dáng: ${currentPrompt.name} (${i + 1}/${totalSteps})`);
            
            try {
                const result = await generateConceptPhoto(
                    readyPortraits, 
                    currentPrompt.prompt, 
                    selectedConcept?.isFamilyPrompt || false,
                    selectedConcept?.simpleFamilyMode || false,
                    preserveFaces,
                    undefined, // arrangementRequest
                    additionalRequest
                );

                if (result.image) {
                    const displayUrl = isFree ? await applyWatermark(result.image) : result.image;
                    setGeneratedImages(prev => [
                        ...prev, 
                        { id: `img-${Date.now()}-${i}`, displayUrl: displayUrl, originalUrl: result.image!, prompt: currentPrompt.prompt, name: currentPrompt.name }
                    ]);
                } else {
                    console.warn(`Generation failed for pose ${currentPrompt.name}: ${result.text}`);
                }
            } catch (e) {
                console.error(`Error generating pose ${currentPrompt.name}`, e);
            }
            
            setGenerationProgress(((i + 1) / totalSteps) * 100);
        }

        setIsGenerating(false);
        setProgressMessage('');
    };
    
    const handleStop = () => {
      stopGenerationRef.current = true;
      setIsGenerating(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">1. Tải ảnh chân dung</h3>
                    <PortraitUploader onFilesChange={handleFilesChange} uploadedPortraits={uploadedPortraits} />
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">2. Chọn phong cách</h3>
                    <ReferenceModeSelector mode={referenceMode} setMode={setReferenceMode} />
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                     {referenceMode === 'concept' ? (
                        <>
                             <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">3. Chọn Concept & Dáng</h3>
                             <ConceptSelector 
                                concepts={conceptCategories} 
                                selectedConcept={selectedConcept} 
                                setSelectedConcept={setSelectedConcept}
                                selectedPoses={selectedPoses}
                                setSelectedPoses={setSelectedPoses}
                             />
                        </>
                    ) : (
                         <>
                             <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">3. Cung cấp ảnh hoặc mô tả</h3>
                             <StyleReferenceUploader 
                                onFileChange={handleStyleFileChange}
                                promptValue={stylePrompt}
                                onPromptChange={setStylePrompt}
                             />
                              {isAnalyzingStyle && <p className="text-xs text-center mt-2 text-slate-500">Đang phân tích phong cách...</p>}
                        </>
                    )}
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">4. Yêu cầu thêm (Tùy chọn)</label>
                    <textarea
                        value={additionalRequest}
                        onChange={(e) => setAdditionalRequest(e.target.value)}
                        placeholder="Ví dụ: 'thêm một nốt ruồi nhỏ trên má phải', 'mặc áo màu xanh dương thay vì màu đỏ'..."
                        className="w-full p-2 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-slate-800 dark:text-zinc-200"
                        rows={3}
                    />
                    <p className="text-xs text-slate-500 mt-1">Mô tả thêm các chi tiết bạn muốn AI thực hiện.</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Giữ nguyên nét mặt</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only peer" checked={preserveFaces} onChange={(e) => setPreserveFaces(e.target.checked)} />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-purple-600"></div>
                        </div>
                    </label>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full py-3 px-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center text-base"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isGenerating ? 'Đang tạo...' : 'Bắt đầu Sáng tạo'}
                </button>
            </div>
            <div className="lg:col-span-2">
                {isGenerating && <GenerationProgress progress={generationProgress} message={progressMessage} onStop={handleStop} />}
                <ResultGrid 
                    images={generatedImages} 
                    setImages={setGeneratedImages}
                    currentUser={currentUser}
                    onPrintRequest={onPrintRequest}
                />
            </div>
        </div>
    );
};
