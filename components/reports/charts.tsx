
import React from 'react';

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Tr`;
    if (Math.abs(value) >= 1_000) return `${Math.round(value / 1000)}K`;
    return new Intl.NumberFormat('vi-VN').format(value);
};

export const SimpleBarChart: React.FC<{data: {name: string, value: number}[]}> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    if (data.length === 0) return <p className="text-center text-sm text-slate-400 py-10">Không có dữ liệu</p>;

    return (
        <div className="w-full h-64 flex gap-4 items-end">
            {data.map(item => (
                <div key={item.name} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full h-full flex items-end">
                        <div 
                            className="w-full bg-blue-500 rounded-t-sm group-hover:bg-blue-400 transition-colors"
                            style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                        ></div>
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold bg-slate-700 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {new Intl.NumberFormat('vi-VN').format(item.value)}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 text-center truncate w-full" title={item.name}>{item.name}</p>
                </div>
            ))}
        </div>
    );
};

export const SimpleLineChart: React.FC<{data: Record<string, number>}> = ({ data }) => {
    const entries = Object.entries(data);
    if (entries.length === 0) return <p className="text-center text-sm text-slate-400 py-10">Không có dữ liệu</p>;

    const values = Object.values(data);
    const maxValue = values.length > 0 ? Math.max(...values.map(v => Number(v))) : 0;
    const points = entries.map(([_, value], index) => {
        const x = (entries.length > 1 ? index / (entries.length - 1) : 0.5) * 100;
        const y = 100 - (maxValue > 0 ? (Number(value) / maxValue) * 100 : 0);
        return `${x},${y}`;
    }).join(' ');

    return (
         <div className="w-full h-64 relative">
             <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />
             </svg>
             <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400">
                 <span>{entries[0]?.[0]}</span>
                 <span>{entries[entries.length - 1]?.[0]}</span>
             </div>
             <div className="absolute top-0 left-0 -translate-y-full text-xs text-slate-400">
                 <span>{formatCurrency(maxValue)}</span>
             </div>
         </div>
    );
};