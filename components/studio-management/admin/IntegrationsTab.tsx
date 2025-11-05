import React, { useState } from 'react';

export const IntegrationsTab: React.FC = () => {
    const [zaloKey, setZaloKey] = useState('');
    const [googleKey, setGoogleKey] = useState('');

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
             <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border dark:border-zinc-700">
                <h3 className="font-semibold text-lg">Tích hợp API</h3>
                <p className="text-sm text-slate-500 mt-1">Kết nối với các dịch vụ bên thứ ba để mở rộng chức năng.</p>
                
                <div className="mt-4 space-y-4">
                    <InputField label="Zalo OA API Key" value={zaloKey} onChange={setZaloKey} placeholder="Dán API key của bạn vào đây..."/>
                    <InputField label="Google Calendar API Key" value={googleKey} onChange={setGoogleKey} placeholder="Dán API key của bạn vào đây..."/>
                </div>

                <button className="mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Lưu Cài đặt</button>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void, placeholder?: string }> = 
({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
    </div>
);