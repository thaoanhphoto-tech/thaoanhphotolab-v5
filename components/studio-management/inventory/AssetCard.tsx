
import React from 'react';
import { StudioAsset, ASSET_STATUS_COLORS } from './types';

interface AssetCardProps {
    asset: StudioAsset;
    onClick: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
    return (
        <button onClick={onClick} className="text-left w-full bg-white dark:bg-zinc-800 rounded-lg shadow-sm border dark:border-zinc-700 overflow-hidden group">
            <div className="relative aspect-square">
                <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className={`absolute top-2 right-2 flex items-center gap-1.5 text-white text-xs font-semibold px-2 py-0.5 rounded-full ${ASSET_STATUS_COLORS[asset.status]}`}>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    {asset.status}
                </div>
            </div>
            <div className="p-3">
                <p className="font-semibold text-sm truncate">{asset.name}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{asset.code}</p>
            </div>
        </button>
    );
};
