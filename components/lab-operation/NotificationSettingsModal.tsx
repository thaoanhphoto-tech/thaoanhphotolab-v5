import React, { useState, useEffect } from 'react';
import { XIcon } from '../icons/XIcon';
import type { NotificationSettings } from './LabOperationPage';


interface NotificationSettingsModalProps {
    settings: NotificationSettings;
    onClose: () => void;
    onSave: (newSettings: NotificationSettings) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ settings, onClose, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [permissionStatus, setPermissionStatus] = useState(Notification.permission);

    useEffect(() => {
        setPermissionStatus(Notification.permission);
    }, []);

    const handleBrowserNotifyToggle = () => {
        const newEnabledState = !localSettings.browserNotifyEnabled;

        if (newEnabledState) {
            if (Notification.permission === 'granted') {
                 setLocalSettings(prev => ({ ...prev, browserNotifyEnabled: true }));
            } else if (Notification.permission === 'default') {
                Notification.requestPermission().then(status => {
                    setPermissionStatus(status);
                    if (status === 'granted') {
                         setLocalSettings(prev => ({ ...prev, browserNotifyEnabled: true }));
                    }
                });
            }
            // If permission is 'denied', we can't do anything, the button remains disabled.
        } else {
             setLocalSettings(prev => ({ ...prev, browserNotifyEnabled: false }));
        }
    };
    
    const handleSave = () => {
        onSave(localSettings);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Cài đặt Thông báo</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><XIcon className="w-6 h-6" /></button>
                </header>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Tùy chỉnh cách bạn nhận thông báo về các tác vụ mới.</p>
                    <ToggleSwitch
                        label="Bật âm thanh thông báo"
                        description="Phát âm thanh 'ting' khi có đơn hàng mới."
                        enabled={localSettings.soundEnabled}
                        onChange={() => setLocalSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                    />
                     <div>
                        <ToggleSwitch
                            label="Bật thông báo trình duyệt"
                            description="Hiển thị pop-up thông báo ngay cả khi bạn không ở trong tab này."
                            enabled={localSettings.browserNotifyEnabled}
                            onChange={handleBrowserNotifyToggle}
                            disabled={permissionStatus === 'denied'}
                        />
                        {permissionStatus === 'denied' && localSettings.browserNotifyEnabled && (
                             <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 ml-4">
                                Bạn đã chặn thông báo. Vui lòng vào cài đặt của trình duyệt để cho phép trang web này gửi thông báo.
                            </p>
                        )}
                    </div>
                </div>

                <footer className="p-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                        Lưu Cài đặt
                    </button>
                </footer>
            </div>
        </div>
    );
};


const ToggleSwitch: React.FC<{ label: string, description: string, enabled: boolean, onChange: () => void, disabled?: boolean }> = 
({ label, description, enabled, onChange, disabled = false }) => (
    <div
      onClick={!disabled ? onChange : undefined}
      className={`flex justify-between items-start p-3 rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-700/50'}`}
    >
      <div className="mr-4">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{description}</p>
      </div>
      <div className="relative flex-shrink-0">
        <div className={`w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-600'}`}></div>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
);
