import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../userStore';
import { ScheduleEvent, getScheduleEvents, addScheduleEvent, updateScheduleEvent, deleteScheduleEvent } from '../scheduleStore';
import { useToast } from './Toast';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { PlusIcon } from './icons/PlusIcon';
import { XIcon } from './icons/XIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BellIcon } from './icons/BellIcon';
import { CheckIcon } from './icons/CheckIcon';

interface SchedulePageProps {
  currentUser: User;
}

// --- Lunar Calendar Conversion Logic ---
const lunarCalendar = (() => {
  const LUNAR_CALENDAR_DATA = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
  ];

  const getLeapMonth = (year: number) => (LUNAR_CALENDAR_DATA[year - 1900] & 0xf);
  const getLeapMonthDays = (year: number) => ((LUNAR_CALENDAR_DATA[year - 1900] & 0x10000) ? 30 : 29);
  const getMonthDays = (year: number, month: number) => (((LUNAR_CALENDAR_DATA[year - 1900] & (0x8000 >> (month - 1))) ? 30 : 29));
  const getYearDays = (year: number) => {
    let i, sum = 348;
    for (i = 0x8000; i > 0x8; i >>= 1) sum += ((LUNAR_CALENDAR_DATA[year - 1900] & i) ? 1 : 0);
    return (sum + getLeapMonthDays(year));
  };

  const isLeapYear = (year: number) => (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));

  return {
    solarToLunar: (year: number, month: number, day: number) => {
      let offset = 0;
      const solarMonths = [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      for (let i = 1900; i < year; i++) {
        offset += getYearDays(i);
      }
      for (let i = 0; i < month - 1; i++) {
        offset += solarMonths[i];
      }
      offset += day;

      let lunarYear = 1900;
      while (lunarYear < 2100 && offset > getYearDays(lunarYear)) {
        offset -= getYearDays(lunarYear);
        lunarYear++;
      }

      let lunarMonth = 1;
      let isLeap = false;
      const leapMonth = getLeapMonth(lunarYear);

      while (true) {
        let monthDays = getMonthDays(lunarYear, lunarMonth);
        if (leapMonth > 0 && lunarMonth === leapMonth + 1 && !isLeap) {
          isLeap = true;
          monthDays = getLeapMonthDays(lunarYear);
        }
        if (offset > monthDays) {
          offset -= monthDays;
          if (isLeap && lunarMonth === leapMonth + 1) isLeap = false;
          lunarMonth++;
        } else break;
      }
      return { year: lunarYear, month: lunarMonth, day: offset, isLeap: (isLeap && lunarMonth === leapMonth) };
    }
  };
})();


const SchedulePage: React.FC<SchedulePageProps> = ({ currentUser }) => {
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
    const { showToast } = useToast();

    // Revenue calculation state
    const [revenueRange, setRevenueRange] = useState({ start: '', end: '' });
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalDebt, setTotalDebt] = useState(0);

    useEffect(() => {
        setEvents(getScheduleEvents(currentUser.id));
        // Ask for notification permission on first visit to this page
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, [currentUser.id]);
    
    useEffect(() => {
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
        setRevenueRange({ start: firstDayOfMonth, end: lastDayOfMonth });
    }, [currentDate]);

    useEffect(() => {
        if (revenueRange.start && revenueRange.end) {
            const start = new Date(revenueRange.start).getTime();
            const end = new Date(revenueRange.end).setHours(23, 59, 59, 999);
            
            let revenue = 0;
            let debt = 0;

            events.forEach(event => {
                const eventDate = new Date(event.date).getTime();
                if (eventDate >= start && eventDate <= end) {
                    // "Doanh thu" is the total value of all shows scheduled in the period.
                    revenue += event.price;

                    // "Công nợ" is the total outstanding amount for all shows in the period.
                    if (event.paymentStatus !== 'paid') {
                        debt += event.price - (event.deposit || 0);
                    }
                }
            });
            setTotalRevenue(revenue);
            setTotalDebt(debt);
        }
    }, [events, revenueRange]);


    const handleSaveEvent = (eventData: Omit<ScheduleEvent, 'id'>, id?: string) => {
        if (id) {
            updateScheduleEvent(currentUser.id, { ...eventData, id });
            showToast('Đã cập nhật lịch chụp!', 'success');
        } else {
            addScheduleEvent(currentUser.id, eventData);
            showToast('Đã thêm lịch chụp mới!', 'success');
        }
        setEvents(getScheduleEvents(currentUser.id));
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const handleDeleteEvent = (eventId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa lịch chụp này?')) {
            deleteScheduleEvent(currentUser.id, eventId);
            setEvents(getScheduleEvents(currentUser.id));
            showToast('Đã xóa lịch chụp.', 'info');
        }
    };

    const handleToggleComplete = (event: ScheduleEvent) => {
        const isNowCompleted = !event.isCompleted;
        updateScheduleEvent(currentUser.id, { 
            ...event, 
            isCompleted: isNowCompleted,
            paymentStatus: isNowCompleted ? (event.paymentStatus || 'unpaid') : undefined
        });
        setEvents(getScheduleEvents(currentUser.id));
    };
    
    const handlePaymentStatusChange = (event: ScheduleEvent, status: 'paid' | 'unpaid' | 'deposited') => {
        updateScheduleEvent(currentUser.id, { ...event, paymentStatus: status });
        setEvents(getScheduleEvents(currentUser.id));
    };

    const handleToggleFileDelivered = (event: ScheduleEvent) => {
        updateScheduleEvent(currentUser.id, { ...event, fileDelivered: !event.fileDelivered });
        setEvents(getScheduleEvents(currentUser.id));
    };

    const openAddModal = () => {
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const openEditModal = (event: ScheduleEvent) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };
    
    const { month, year, calendarGrid } = useMemo(() => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const calendarGrid: ({ day: number; lunarDay: number; lunarMonth: number; } | null)[][] = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDayOfMonth) || day > daysInMonth) {
                    week.push(null);
                } else {
                    const lunarDate = lunarCalendar.solarToLunar(year, month + 1, day);
                    week.push({ day, lunarDay: lunarDate.day, lunarMonth: lunarDate.month });
                    day++;
                }
            }
            calendarGrid.push(week);
            if(day > daysInMonth) break;
        }
        return { month, year, calendarGrid };

    }, [currentDate]);
    
    const eventsByDate = useMemo(() => {
        return events.reduce((acc, event) => {
            (acc[event.date] = acc[event.date] || []).push(event);
            return acc;
        }, {} as Record<string, ScheduleEvent[]>);
    }, [events]);

    const selectedDateEvents = eventsByDate[selectedDate] || [];

    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const gregorianDateStr = selectedDateObj.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const [y, m, d] = selectedDate.split('-').map(Number);
    const lunarDate = lunarCalendar.solarToLunar(y, m, d);
    const lunarDateStr = `(Ngày ${lunarDate.day} tháng ${lunarDate.month}${lunarDate.isLeap ? ' Nhuận' : ''} ÂL)`;


    return (
        <div>
            {/* Revenue Summary */}
            <div className="mb-8 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md border dark:border-zinc-700">
                <h2 className="font-semibold mb-3">Tổng hợp Doanh thu & Công nợ</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <input type="date" value={revenueRange.start} onChange={e => setRevenueRange(p => ({...p, start: e.target.value}))} className="p-2 border rounded dark:bg-zinc-700"/>
                    <span>đến</span>
                    <input type="date" value={revenueRange.end} onChange={e => setRevenueRange(p => ({...p, end: e.target.value}))} className="p-2 border rounded dark:bg-zinc-700"/>
                    <div className="ml-auto flex items-center gap-6">
                        <div className="text-right">
                           <p className="text-sm text-slate-500">Tổng công nợ</p>
                           <p className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('vi-VN').format(totalDebt)}đ</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Tổng doanh thu</p>
                            <p className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('vi-VN').format(totalRevenue)}đ</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-zinc-700">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><ChevronLeftIcon className="w-6 h-6"/></button>
                        <h2 className="text-xl font-bold">{`Tháng ${month + 1}, ${year}`}</h2>
                        <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><ChevronRightIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarGrid.flat().map((dayInfo, index) => {
                            if (!dayInfo) return <div key={`empty-${index}`} className="aspect-square"></div>;
                            
                            const { day, lunarDay, lunarMonth } = dayInfo;
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = dateStr === selectedDate;
                            const isToday = new Date().toISOString().split('T')[0] === dateStr;
                            const hasEvents = !!eventsByDate[dateStr];

                            return (
                                <button key={dateStr} onClick={() => setSelectedDate(dateStr)} className={`relative aspect-square p-1 flex flex-col items-center justify-start rounded-lg transition-colors ${isSelected ? 'bg-blue-500 text-white' : isToday ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-zinc-700'}`}>
                                    <span className={`font-semibold text-sm ${isSelected ? 'text-white' : isToday ? 'text-blue-600 dark:text-blue-300' : ''}`}>{day}</span>
                                    <span className={`text-[10px] leading-tight ${isSelected ? 'text-white/70' : 'text-slate-400 dark:text-zinc-500'}`}>
                                        {lunarDay === 1 ? `${lunarDay}/${lunarMonth}` : lunarDay}
                                    </span>
                                    {hasEvents && <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {/* Daily Schedule */}
                <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-zinc-700">
                     <h2 className="font-bold mb-4">{gregorianDateStr} <span className="text-sm font-normal text-slate-500">{lunarDateStr}</span></h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedDateEvents.length > 0 ? selectedDateEvents.map(event => {
                            const debt = event.price - (event.deposit || 0);
                            return (
                            <div key={event.id} className={`p-3 rounded-lg border-l-4 ${event.isCompleted ? (event.paymentStatus === 'paid' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : event.paymentStatus === 'deposited' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20') : 'bg-slate-50 dark:bg-zinc-700 border-blue-500'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className={`font-semibold ${event.isCompleted ? 'line-through text-slate-500' : ''}`}>{event.title}</p>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400">{event.time} - {event.clientName}</p>
                                        {(event.bridePhone || event.groomPhone || event.studioPhone) && (
                                            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-zinc-300 border-t pt-2 border-slate-200 dark:border-zinc-600">
                                                {event.bridePhone && <p><strong>CD:</strong> <a href={`tel:${event.bridePhone}`} className="hover:underline">{event.bridePhone}</a></p>}
                                                {event.groomPhone && <p><strong>CR:</strong> <a href={`tel:${event.groomPhone}`} className="hover:underline">{event.groomPhone}</a></p>}
                                                {event.studioPhone && <p><strong>Studio:</strong> <a href={`tel:${event.studioPhone}`} className="hover:underline">{event.studioPhone}</a></p>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEditModal(event)} className="p-1 text-slate-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteEvent(event.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end mt-2 flex-wrap gap-2">
                                     {event.isCompleted ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button onClick={() => handlePaymentStatusChange(event, 'unpaid')} className={`px-2 py-1 text-xs rounded ${event.paymentStatus === 'unpaid' ? 'bg-amber-500 text-white font-bold' : 'bg-amber-100 text-amber-800'}`}>Chưa TT</button>
                                            <button onClick={() => handlePaymentStatusChange(event, 'deposited')} className={`px-2 py-1 text-xs rounded ${event.paymentStatus === 'deposited' ? 'bg-purple-500 text-white font-bold' : 'bg-purple-100 text-purple-800'}`}>Đã cọc</button>
                                            <button onClick={() => handlePaymentStatusChange(event, 'paid')} className={`px-2 py-1 text-xs rounded ${event.paymentStatus === 'paid' ? 'bg-green-500 text-white font-bold' : 'bg-green-100 text-green-800'}`}>Đã TT</button>
                                            <button onClick={() => handleToggleFileDelivered(event)} className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${event.fileDelivered ? 'bg-sky-500 text-white font-bold' : 'bg-sky-100 text-sky-800'}`}>
                                                {event.fileDelivered && <CheckIcon className="w-3 h-3"/>}
                                                {event.fileDelivered ? 'Đã trả file' : 'Chưa trả file'}
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center text-xs cursor-pointer">
                                            <input type="checkbox" checked={event.isCompleted} onChange={() => handleToggleComplete(event)} className="w-4 h-4 rounded text-blue-600"/>
                                            <span className="ml-2">Hoàn thành</span>
                                        </label>
                                    )}
                                    <div className="text-sm text-right">
                                        <span className="font-bold text-green-600">{new Intl.NumberFormat('vi-VN').format(event.price)}đ</span>
                                        {event.deposit && event.deposit > 0 && (
                                            <div className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
                                                (Đã cọc: {new Intl.NumberFormat('vi-VN').format(event.deposit)}đ)
                                            </div>
                                        )}
                                        {debt > 0 && event.paymentStatus !== 'paid' && (
                                            <div className="text-sm font-bold text-orange-500 dark:text-orange-400">
                                                Nợ: {new Intl.NumberFormat('vi-VN').format(debt)}đ
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}) : <p className="text-sm text-center text-slate-500 py-8">Không có lịch chụp.</p>}
                    </div>
                    <button onClick={openAddModal} className="w-full mt-4 py-2 bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"><PlusIcon className="w-5 h-5"/>Thêm Lịch chụp</button>
                </div>
            </div>

            {isModalOpen && (
                <ScheduleEventModal
                    event={editingEvent}
                    selectedDate={selectedDate}
                    onClose={() => { setIsModalOpen(false); setEditingEvent(null); }}
                    onSave={handleSaveEvent}
                />
            )}
        </div>
    );
};

// Modal Component
const ScheduleEventModal: React.FC<{ event: ScheduleEvent | null, selectedDate: string, onSave: (eventData: Omit<ScheduleEvent, 'id'>, id?: string) => void, onClose: () => void }> =
({ event, selectedDate, onClose, onSave }) => {
    const [date, setDate] = useState(event?.date || selectedDate);
    const [time, setTime] = useState(event?.time || '09:00');
    const [title, setTitle] = useState(event?.title || '');
    const [clientName, setClientName] = useState(event?.clientName || '');
    const [bridePhone, setBridePhone] = useState(event?.bridePhone || '');
    const [groomPhone, setGroomPhone] = useState(event?.groomPhone || '');
    const [studioPhone, setStudioPhone] = useState(event?.studioPhone || '');
    const [price, setPrice] = useState(event?.price || 0);
    const [deposit, setDeposit] = useState(event?.deposit || 0);
    const [notes, setNotes] = useState(event?.notes || '');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !clientName) {
            alert('Vui lòng nhập Chụp gì và Tên khách.');
            return;
        }
        onSave({ 
            date, 
            time, 
            title, 
            clientName, 
            price, 
            deposit,
            notes, 
            isCompleted: event?.isCompleted || false, 
            paymentStatus: event?.paymentStatus, 
            fileDelivered: event?.fileDelivered || false, 
            bridePhone, 
            groomPhone, 
            studioPhone 
        }, event?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">{event ? 'Chỉnh sửa Lịch chụp' : 'Thêm Lịch chụp mới'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Ngày" type="date" value={date} onChange={setDate} required/>
                            <InputField label="Giờ" type="time" value={time} onChange={setTime} required/>
                        </div>
                        <InputField label="Chụp gì?" value={title} onChange={setTitle} required/>
                        <InputField label="Tên khách/Studio" value={clientName} onChange={setClientName} required/>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="SĐT Cô dâu" type="tel" value={bridePhone} onChange={setBridePhone} />
                            <InputField label="SĐT Chú rể" type="tel" value={groomPhone} onChange={setGroomPhone} />
                        </div>
                        <InputField label="SĐT Studio" type="tel" value={studioPhone} onChange={setStudioPhone} />
                        <div className="grid grid-cols-2 gap-4">
                           <InputField label="Giá show (VNĐ)" type="number" value={String(price)} onChange={val => setPrice(Number(val))}/>
                           <InputField label="Đã cọc (VNĐ)" type="number" value={String(deposit)} onChange={val => setDeposit(Number(val))}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Ghi chú</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" rows={3}></textarea>
                        </div>
                    </div>
                    <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void, type?: string, required?: boolean }> = ({ label, value, onChange, type = 'text', required = false }) => (
    <div>
        <label className="block text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"/>
    </div>
);


export default SchedulePage;