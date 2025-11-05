import React, { useState } from 'react';
import { PhotoRestorer } from './PhotoRestorer';
import { ProAiRelight } from './pro-ai-relight/ProAiRelight';
import { BatchColorCorrector } from './BatchColorCorrector';
import { User } from '../userStore';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${
            active 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-300 dark:hover:bg-zinc-600'
        }`}
    >
        {children}
    </button>
);

interface PhotoLabProps {
    currentUser: User | null;
    onPrintRequest: (imageDataUrl: string, sourceTool: string) => void;
}

export const PhotoLab: React.FC<PhotoLabProps> = ({ currentUser, onPrintRequest }) => {
    const [activeTool, setActiveTool] = useState<'restore' | 'relight' | 'color'>('restore');

    return (
        <div className="space-y-6">
            <div className="flex justify-center items-center gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
                <TabButton active={activeTool === 'restore'} onClick={() => setActiveTool('restore')}>Phục hồi & Nâng cấp</TabButton>
                <TabButton active={activeTool === 'relight'} onClick={() => setActiveTool('relight')}>Tạo Ánh Sáng</TabButton>
                <TabButton active={activeTool === 'color'} onClick={() => setActiveTool('color')}>Chỉnh Màu Hàng loạt</TabButton>
            </div>

            <div>
                {activeTool === 'restore' && <PhotoRestorer currentUser={currentUser} onPrintRequest={onPrintRequest} />}
                {activeTool === 'relight' && <ProAiRelight currentUser={currentUser} onPrintRequest={onPrintRequest} />}
                {activeTool === 'color' && <BatchColorCorrector currentUser={currentUser} onPrintRequest={onPrintRequest} />}
            </div>
        </div>
    );
};