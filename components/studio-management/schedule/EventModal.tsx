import React, { useState, useMemo } from 'react';
// Fix: Import Customer type from its definition file.
import type { Customer } from '../crm/types';
import { User, OperationalRole, OPERATIONAL_ROLE_NAMES, StudioStaff } from '../../../userStore';
import { StudioScheduleEvent, EventType, EVENT_TYPE_NAMES } from './types';
import { XIcon } from '../../icons/XIcon';
import { TrashIcon } from '../../icons/TrashIcon';

interface EventModalProps {
    event: StudioScheduleEvent | null;
    onClose: () => void;
    onSave: (eventData: Omit<StudioScheduleEvent, 'id'>, id?: string) => void;
    onDelete: (eventId: string) => void;
    customers: Customer[];
    personnel: StudioStaff[];
}

const SCHEDULING_ROLES: OperationalRole[] = ['nhiep_anh', 'makeup_artist', 'stylist', 'lai_xe', 'hau_can'];

export const EventModal: React.FC<EventModalProps> = ({ event, onClose, onSave, onDelete, customers, personnel }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [start, setStart] = useState(event ? new Date(event.start) : new Date());
    const [end, setEnd] = useState(event ? new Date(event.end) : new Date(new Date().getTime() + 2 * 60 * 60 * 1000));
    const [customerId, setCustomerId] = useState(event?.customerId || '');
    const [eventType, setEventType] = useState<EventType>(event?.eventType || 'chup_cuoi');
    const [location, setLocation] = useState(event?.location || '');
    const [notes, setNotes] = useState(event?.notes || '');
    const [assignedPersonnel, setAssignedPersonnel] = useState<Partial<Record<OperationalRole, string[]>>>(event?.assignedPersonnel || {});
    
    const handlePersonnelChange = (role: OperationalRole, selectedIds: string[]) => {
        setAssignedPersonnel(prev => ({
            ...prev,
            [role]: selectedIds,
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !customerId) {
            alert('Vui lòng nhập Tiêu đề và chọn Khách hàng.');
            return;
        }
        onSave({ title, start: start.toISOString(), end: end.toISOString(), customerId, eventType, location, notes, assignedPersonnel }, event?.id);
    };

    const personnelByRole = useMemo(() => {
        return SCHEDULING_ROLES.reduce((acc, role) => {
            acc[role] = personnel.filter(p => p.role === role);
            return acc;
        }, {} as Record<OperationalRole, StudioStaff[]>);
    }, [personnel]);
    
    return (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">{event ? 'Chỉnh sửa Lịch' : 'Thêm Lịch mới'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                        <InputField label="Tiêu đề" value={title} onChange={setTitle} required />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Bắt đầu" type="datetime-local" value={start.toISOString().substring(0, 16)} onChange={val => setStart(new Date(val))} required />
                            <InputField label="Kết thúc" type="datetime-local" value={end.toISOString().substring(0, 16)} onChange={val => setEnd(new Date(val))} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Khách hàng</label>
                                <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700" required>
                                    <option value="">-- Chọn khách hàng --</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Loại lịch</label>
                                <select value={eventType} onChange={e => setEventType(e.target.value as EventType)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700">
                                    {Object.entries(EVENT_TYPE_NAMES).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                                </select>
                            </div>
                        </div>
                        <InputField label="Địa điểm" value={location} onChange={setLocation} placeholder="VD: Phim trường ABC, Studio,..." />
                        
                        <div>
                            <h3 className="text-sm font-medium mb-2">Phân công Nhân sự</h3>
                            <div className="space-y-2 p-2 bg-slate-50 dark:bg-zinc-700/50 rounded-md">
                                {SCHEDULING_ROLES.map(role => (
                                    <div key={role}>
                                        <label className="text-xs font-bold">{OPERATIONAL_ROLE_NAMES[role]}</label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {personnelByRole[role].map(person => {
                                                const isChecked = assignedPersonnel[role]?.includes(person.id);
                                                return (
                                                    <label key={person.id} className={`px-2 py-1 text-xs rounded-full cursor-pointer ${isChecked ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-zinc-600'}`}>
                                                        <input type="checkbox" className="hidden" checked={isChecked} onChange={() => {
                                                            const currentAssigned = assignedPersonnel[role] || [];
                                                            const newAssigned = isChecked ? currentAssigned.filter(id => id !== person.id) : [...currentAssigned, person.id];
                                                            handlePersonnelChange(role, newAssigned);
                                                        }} />
                                                        {person.name}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Ghi chú</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700" rows={3}></textarea>
                        </div>
                    </div>
                    <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-between">
                         {event ? (
                            <button type="button" onClick={() => onDelete(event.id)} className="px-4 py-2 text-sm font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1">
                                <TrashIcon className="w-4 h-4" /> Xóa
                            </button>
                        ) : <div></div>}
                        <div className="flex gap-2">
                           <button type="button" onClick={onClose} className="px-4 py-2 font-semibold rounded-md border dark:border-zinc-600">Hủy</button>
                           <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu</button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void, type?: string, required?: boolean, placeholder?: string }> = 
({ label, value, onChange, type = 'text', required = false, placeholder }) => (
    <div>
        <label className="block text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"/>
    </div>
);
