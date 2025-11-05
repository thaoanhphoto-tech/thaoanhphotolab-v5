import React, { useState, useEffect, useMemo } from 'react';
// Fix: Import Customer type from its definition file.
import type { Customer } from '../crm/types';
import { User, StudioStaff } from '../../../userStore';
import { StudioScheduleEvent, EventType, EVENT_TYPE_COLORS, EVENT_TYPE_NAMES } from './types';
import { getStudioScheduleEvents, addStudioScheduleEvent, updateStudioScheduleEvent, deleteStudioScheduleEvent, checkConflict } from '../../../studioScheduleStore';
import { EventModal } from './EventModal';
import { useToast } from '../../Toast';
import { ChevronLeftIcon } from '../../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
import { PlusIcon } from '../../icons/PlusIcon';

interface StudioSchedulePageProps {
    customers: Customer[];
    personnel: StudioStaff[];
}

const StudioSchedulePage: React.FC<StudioSchedulePageProps> = ({ customers, personnel }) => {
    const [events, setEvents] = useState<StudioScheduleEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<StudioScheduleEvent | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        setEvents(getStudioScheduleEvents());
    }, []);

    const handleSaveEvent = (eventData: Omit<StudioScheduleEvent, 'id'>, id?: string) => {
        const allEvents = getStudioScheduleEvents();
        const conflicts = checkConflict(eventData, allEvents, id);
        
        if (conflicts.length > 0) {
            const conflictMessage = "Cảnh báo trùng lịch:\n" + conflicts.join("\n");
            if (!window.confirm(conflictMessage + "\n\nBạn có muốn tiếp tục lưu?")) {
                return;
            }
        }
        
        if (id) {
            updateStudioScheduleEvent({ ...eventData, id });
            showToast('Đã cập nhật lịch!', 'success');
        } else {
            addStudioScheduleEvent(eventData);
            showToast('Đã thêm lịch mới!', 'success');
        }
        setEvents(getStudioScheduleEvents());
        setIsModalOpen(false);
        setEditingEvent(null);
    };
    
    const handleDeleteEvent = (eventId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa lịch này?')) {
            deleteStudioScheduleEvent(eventId);
            setEvents(getStudioScheduleEvents());
            showToast('Đã xóa lịch.', 'info');
        }
    };

    const openAddModal = (date: string) => {
        setEditingEvent(null);
        // Pre-fill date when adding from a specific day
        const prefilledEvent = { date, time: '09:00' };
        setIsModalOpen(true);
    };

    const openEditModal = (event: StudioScheduleEvent) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };
    
    const { month, year, calendarGrid } = useMemo(() => {
        // Calendar logic remains the same
        const d = currentDate;
        const month = d.getMonth();
        const year = d.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid: ({ day: number } | null)[][] = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDayOfMonth) || day > daysInMonth) {
                    week.push(null);
                } else {
                    week.push({ day });
                    day++;
                }
            }
            grid.push(week);
            if(day > daysInMonth) break;
        }
        return { month, year, calendarGrid: grid };
    }, [currentDate]);

    const eventsByDate = useMemo(() => {
        return events.reduce((acc, event) => {
            const date = new Date(event.start).toISOString().split('T')[0];
            (acc[date] = acc[date] || []).push(event);
            return acc;
        }, {} as Record<string, StudioScheduleEvent[]>);
    }, [events]);

    return (
        <div className="p-4 h-full flex flex-col">
             <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h1 className="text-xl font-bold">Quản lý Lịch Studio</h1>
                <button onClick={() => openAddModal(new Date().toISOString().split('T')[0])} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm flex items-center gap-2"><PlusIcon className="w-5 h-5"/> Thêm Lịch</button>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md border dark:border-zinc-700 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><ChevronLeftIcon className="w-6 h-6"/></button>
                    <h2 className="text-xl font-bold">{`Tháng ${month + 1}, ${year}`}</h2>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><ChevronRightIcon className="w-6 h-6"/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2 flex-shrink-0">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-1 min-h-0">
                    {calendarGrid.flat().map((dayInfo, index) => {
                        if (!dayInfo) return <div key={`empty-${index}`} className="border-t dark:border-zinc-700"></div>;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayInfo.day).padStart(2, '0')}`;
                        const dayEvents = (eventsByDate[dateStr] || []).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                        
                        return (
                            <div key={dateStr} className="border-t dark:border-zinc-700 p-1 text-xs overflow-y-auto">
                                <span className="font-semibold">{dayInfo.day}</span>
                                {dayEvents.map(event => (
                                    <button key={event.id} onClick={() => openEditModal(event)} className={`w-full text-left p-1 rounded mt-1 ${EVENT_TYPE_COLORS[event.eventType] || 'bg-slate-200'}`}>
                                        <p className="font-bold truncate text-white">{new Date(event.start).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {event.title}</p>
                                        <p className="text-white/80 truncate">KH: {customers.find(c => c.id === event.customerId)?.name || 'N/A'}</p>
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {isModalOpen && (
                <EventModal 
                    event={editingEvent}
                    onClose={() => { setIsModalOpen(false); setEditingEvent(null); }}
                    onSave={handleSaveEvent}
                    onDelete={handleDeleteEvent}
                    customers={customers}
                    personnel={personnel}
                />
            )}
        </div>
    );
};

export default StudioSchedulePage;
