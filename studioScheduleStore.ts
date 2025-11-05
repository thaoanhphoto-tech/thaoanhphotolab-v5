import { StudioScheduleEvent } from './components/studio-management/schedule/types';
import { OperationalRole } from './userStore';

const STORAGE_KEY = 'app_studio_schedule_events_v1';

const initialEvents: StudioScheduleEvent[] = [
    // Mock data for demonstration
    {
        id: `studio-event-${Date.now()}`,
        title: 'Chụp ảnh cưới Pre-wedding',
        start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(17, 0, 0)).toISOString(),
        customerId: 'cust-2', // Trần Thị Bích
        eventType: 'chup_cuoi',
        location: 'Phim trường ABC',
        notes: 'Khách yêu cầu concept Hàn Quốc.',
        assignedPersonnel: {
            'nhiep_anh': ['personnel-1'], // Nguyễn Văn Nhiếp
            'makeup_artist': ['personnel-2'] // Trần Thị Trang Điểm
        }
    }
];


export const getStudioScheduleEvents = (): StudioScheduleEvent[] => {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (json) {
            return JSON.parse(json);
        }
        saveStudioScheduleEvents(initialEvents);
        return initialEvents;
    } catch (e) {
        return initialEvents;
    }
};

export const saveStudioScheduleEvents = (events: StudioScheduleEvent[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
        console.error("Failed to save studio schedule events.", e);
    }
};

export const addStudioScheduleEvent = (eventData: Omit<StudioScheduleEvent, 'id'>): StudioScheduleEvent => {
    const events = getStudioScheduleEvents();
    const newEvent: StudioScheduleEvent = {
        ...eventData,
        id: `studio-event-${Date.now()}`,
    };
    events.push(newEvent);
    saveStudioScheduleEvents(events);
    return newEvent;
};

export const updateStudioScheduleEvent = (updatedEvent: StudioScheduleEvent): void => {
    let events = getStudioScheduleEvents();
    events = events.map(event => (event.id === updatedEvent.id ? updatedEvent : event));
    saveStudioScheduleEvents(events);
};

export const deleteStudioScheduleEvent = (eventId: string): void => {
    let events = getStudioScheduleEvents();
    events = events.filter(event => event.id !== eventId);
    saveStudioScheduleEvents(events);
};

export const checkConflict = (
    eventToCheck: Omit<StudioScheduleEvent, 'id'>, 
    allEvents: StudioScheduleEvent[],
    excludeEventId?: string
): string[] => {
    const conflicts: string[] = [];
    const eventStart = new Date(eventToCheck.start).getTime();
    const eventEnd = new Date(eventToCheck.end).getTime();

    const personnelToCheck = Object.values(eventToCheck.assignedPersonnel).flat();

    const otherEvents = allEvents.filter(e => e.id !== excludeEventId);

    for (const personId of personnelToCheck) {
        for (const existingEvent of otherEvents) {
            const existingStart = new Date(existingEvent.start).getTime();
            const existingEnd = new Date(existingEvent.end).getTime();

            const isAssigned = Object.values(existingEvent.assignedPersonnel).flat().includes(personId);

            if (isAssigned) {
                // Check for time overlap
                if (eventStart < existingEnd && eventEnd > existingStart) {
                    conflicts.push(`Nhân viên có ID ${personId} đã được xếp lịch cho sự kiện "${existingEvent.title}" từ ${new Date(existingStart).toLocaleTimeString()} đến ${new Date(existingEnd).toLocaleTimeString()}.`);
                }
            }
        }
    }
    
    // Remove duplicate messages
    return [...new Set(conflicts)];
};