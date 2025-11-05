

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FamilyUploader } from './concept-photo/FamilyUploader';
import { ConceptSelector } from './concept-photo/ConceptSelector';
import { ResultGrid } from './concept-photo/ResultGrid';
import { GenerationProgress } from './concept-photo/GenerationProgress';
import { familyConcepts } from '../data/familyConceptData';
import type { FamilyMember, Concept, GeneratedImage, Pose, ConceptCategory, MemberRole } from './concept-photo/types';
import { compressImage } from '../utils/imageUtils';
import { generateConceptPhoto, analyzeImage } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { User, isFreeUserOnly } from '../userStore';
import { applyWatermark } from '../utils/imageUtils';

interface FamilyPhotoComposerProps {
    currentUser: User | null;
    onPrintRequest: (imageDataUrl: string, sourceTool: string) => void;
}

const familyConceptCategories: ConceptCategory[] = [{
    id: 'family',
    name: 'Gia Đình',
    concepts: familyConcepts,
}];

export const FamilyPhotoComposer: React.FC<FamilyPhotoComposerProps> = ({ currentUser, onPrintRequest }) => {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [selectedConcept, setSelectedConcept] = useState<Concept | null>(familyConcepts[0] || null);
    const [selectedPoses, setSelectedPoses] = useState<Pose[]>([]);
    const [arrangementRequest, setArrangementRequest] = useState('');
    const [preserveFaces, setPreserveFaces] = useState(true);
    const [additionalRequest, setAdditionalRequest] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    
    const stopGenerationRef = useRef(false);

    useEffect(() => {
      // Auto-select first concept and its poses on mount
      if(familyConcepts.length > 0) {
        const firstConcept = familyConcepts[0];
        setSelectedConcept(firstConcept);
        setSelectedPoses(firstConcept.poses);
      }
    }, [])

    const handleFamilyChange = (updatedMembers: FamilyMember[]) => {
        const newMembers = updatedMembers.filter(m => !familyMembers.some(fm => fm.id === m.id));
        setFamilyMembers(updatedMembers);

        newMembers.forEach(member => {
            // Set analyzing state
            setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, isAnalyzing: true } : m));
            
            // Compress image
            compressImage(member.file)
                .then(compressedFile => {
                    setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, file: compressedFile, status: 'done' } : m));
                })
                .catch(() => {
                    setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: 'error', isAnalyzing: false } : m));
                });
            
            // Analyze image
            analyzeImage(member.file)
                .then(result => {
                    const updates: Partial<FamilyMember> = { analysisResult: result, isAnalyzing: false };
                    // Auto-assign role based on analysis if possible
                    if (result.gender === 'Nam') {
                        updates.role = 'adult_male';
                    } else if (result.gender === 'Nữ') {
                        updates.role = 'adult_female';
                    }
                    setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, ...updates } : m));
                })
                .catch(() => {
                     setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, isAnalyzing: false, analysisResult: null } : m));
                });
        });
    };
    
    const readyMembers = useMemo(() => familyMembers.filter(p => p.status === 'done'), [familyMembers]);

    const canGenerate = useMemo(() => {
        if (isGenerating || !selectedConcept || selectedPoses.length === 0) return false;
        
        const required = selectedConcept.requiredPortraits;
        const max = selectedConcept.maxPortraits;
        
        if (readyMembers.length < required) return false;
        if (max && readyMembers.length > max) return false;
        
        return true;
    }, [isGenerating, readyMembers, selectedConcept, selectedPoses]);

    const handleGenerate = async () => {
        if (!canGenerate || !selectedConcept) return;

        setIsGenerating(true);
        setGeneratedImages([]);
        setGenerationProgress(0);
        stopGenerationRef.current = false;

        const isFree = isFreeUserOnly(currentUser);
        const totalSteps = selectedPoses.length;
        for (let i = 0; i < totalSteps; i++) {
            if (stopGenerationRef.current) break;
            
            const pose = selectedPoses[i];
            setProgressMessage(`Đang tạo dáng: ${pose.name} (${i + 1}/${totalSteps})`);
            
            try {
                const result = await generateConceptPhoto(
                    readyMembers, 
                    pose.prompt, 
                    true, // isFamilyPrompt
                    selectedConcept.simpleFamilyMode || false,
                    preserveFaces,
                    arrangementRequest,
                    additionalRequest
                );

                if (result.image) {
                    const displayUrl = isFree ? await applyWatermark(result.image) : result.image;
                    setGeneratedImages(prev => [
                        ...prev, 
                        { id: `img-${Date.now()}-${i}`, displayUrl: displayUrl, originalUrl: result.image!, prompt: pose.prompt, name: pose.name }
                    ]);
                }
            } catch (e) {
                console.error(`Error generating pose ${pose.name}`, e);
            }
            
            setGenerationProgress(((i + 1) / totalSteps) * 100);
        }

        setIsGenerating(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">1. Thêm thành viên gia đình</h3>
                    <FamilyUploader familyMembers={familyMembers} onFamilyChange={handleFamilyChange} maxMembers={selectedConcept?.maxPortraits} />
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
                     <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">2. Chọn Concept & Dáng</h3>
                     <ConceptSelector 
                        concepts={familyConceptCategories} 
                        selectedConcept={selectedConcept} 
                        setSelectedConcept={setSelectedConcept}
                        selectedPoses={selectedPoses}
                        setSelectedPoses={setSelectedPoses}
                     />
                </div>
                 <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">3. Yêu cầu sắp xếp (Tùy chọn)</label>
                    <textarea
                        value={arrangementRequest}
                        onChange={(e) => setArrangementRequest(e.target.value)}
                        placeholder="Ví dụ: 'Bố đứng giữa, mẹ bên phải, con trai ngồi phía trước', 'Mọi người nhìn về phía bên trái'..."
                        className="w-full p-2 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        rows={3}
                    />
                    <p className="text-xs text-slate-500 mt-1">Mô tả cách bạn muốn các thành viên được sắp xếp trong ảnh.</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">4. Yêu cầu thêm (Tùy chọn)</label>
                    <textarea
                        value={additionalRequest}
                        onChange={(e) => setAdditionalRequest(e.target.value)}
                        placeholder="Ví dụ: 'tất cả mọi người đều mặc áo sơ mi trắng', 'thêm hiệu ứng tuyết rơi nhẹ'..."
                        className="w-full p-2 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        rows={3}
                    />
                    <p className="text-xs text-slate-500 mt-1">Mô tả các yêu cầu chung khác cho bức ảnh.</p>
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
                    {isGenerating ? 'Đang tạo...' : 'Tạo ảnh gia đình'}
                </button>
            </div>
            <div className="lg:col-span-2">
                {isGenerating && <GenerationProgress progress={generationProgress} message={progressMessage} onStop={() => stopGenerationRef.current = true} />}
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