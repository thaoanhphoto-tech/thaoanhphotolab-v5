

import React, { useMemo } from 'react';
import { Customer } from '../crm/types';

interface DashboardViewProps {
    customers: Customer[];
}

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
    </div>
);

const SimpleBarChart: React.FC<{data: {name: string, value: number}[]}> = ({ data }) => {
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
                            {item.value}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 text-center truncate w-full">{item.name}</p>
                </div>
            ))}
        </div>
    );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ customers }) => {
    const customerSourceData = useMemo(() => {
        const sourceMap = customers.reduce((acc: Record<string, number>, customer) => {
            const source = customer.source || 'Không rõ';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(sourceMap)
            .map(([name, value]) => ({ name, value }))
            // Fix: Explicitly cast chart data values to Number before sorting.
            .sort((a, b) => Number(b.value) - Number(a.value));

    }, [customers]);

    return (
        <div className="space-y-6">
            <ChartContainer title="Phân tích Nguồn khách hàng">
                <SimpleBarChart data={customerSourceData} />
            </ChartContainer>
        </div>
    );
};