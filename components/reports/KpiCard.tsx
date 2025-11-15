

// FIX: Add empty export to make this a module and prevent build errors.
import React from 'react';

interface KpiCardProps {
    title: string;
    value: string;
    color?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, color }) => (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700">
        <h4 className="text-sm font-medium text-slate-500 dark:text-zinc-400">{title}</h4>
        <p className={`text-2xl font-bold mt-1 ${color || 'text-slate-800 dark:text-zinc-100'}`}>{value}</p>
    </div>
);
export {};
