
import React from 'react';
import { HistoryEntry } from '../../userStore';
import { XIcon } from '../icons/XIcon';

interface HistoryModalProps {
  history: HistoryEntry[];
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-semibold">Lịch sử Đơn hàng</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative pl-4 border-l-2 border-slate-200 dark:border-zinc-700">
            {history.length > 0 ? history.map((entry, index) => (
              <div key={entry.timestamp} className="mb-6 relative">
                <div className="absolute -left-[1.2rem] top-1 w-5 h-5 bg-blue-500 rounded-full border-4 border-white dark:border-zinc-800"></div>
                <p className="font-semibold text-sm text-slate-800 dark:text-zinc-100">{entry.action}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  bởi <span className="font-medium">{entry.userName}</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                  {new Date(entry.timestamp).toLocaleString('vi-VN')}
                </p>
              </div>
            )) : (
                <p className="text-sm text-slate-500">Chưa có lịch sử hoạt động.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};