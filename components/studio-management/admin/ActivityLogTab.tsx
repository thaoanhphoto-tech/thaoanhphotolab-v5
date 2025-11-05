import React, { useMemo } from 'react';
import { PrintRequest, HistoryEntry } from '../../../userStore';

interface ActivityLogTabProps {
    requests: PrintRequest[];
}

interface CombinedLogEntry extends HistoryEntry {
    requestId: string;
}

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ requests }) => {
    const activityLog = useMemo(() => {
        const allLogs: CombinedLogEntry[] = [];
        requests.forEach(req => {
            req.history?.forEach(entry => {
                allLogs.push({ ...entry, requestId: req.id });
            });
        });
        return allLogs.sort((a, b) => b.timestamp - a.timestamp);
    }, [requests]);

    return (
        <div className="space-y-3 max-w-3xl mx-auto">
            {activityLog.map((log, index) => (
                <div key={`${log.requestId}-${index}`} className="p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border dark:border-zinc-700">
                    <p className="text-sm font-semibold">{log.action}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        bởi <span className="font-medium">{log.userName}</span> trên đơn hàng <span className="font-mono">#{log.requestId.slice(-6)}</span>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </p>
                </div>
            ))}
             {activityLog.length === 0 && <p className="text-center text-slate-500 py-10">Không có hoạt động nào được ghi nhận.</p>}
        </div>
    );
};