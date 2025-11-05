import { OperationalRole } from "../../../userStore";

export type EventType = 'chup_cuoi' | 'makeup' | 'quay_phim' | 'phong_su_cuoi' | 'khac';

export const EVENT_TYPE_NAMES: Record<EventType, string> = {
    chup_cuoi: 'Chụp cưới',
    makeup: 'Makeup',
    quay_phim: 'Quay phim',
    phong_su_cuoi: 'Phóng sự cưới',
    khac: 'Khác'
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
    chup_cuoi: 'bg-blue-500',
    makeup: 'bg-pink-500',
    quay_phim: 'bg-purple-500',
    phong_su_cuoi: 'bg-indigo-500',
    khac: 'bg-slate-500'
};

export interface StudioScheduleEvent {
    id: string;
    title: string;
    start: string; // ISO String
    end: string;   // ISO String
    customerId: string;
    eventType: EventType;
    location?: string;
    notes?: string;
    assignedPersonnel: Partial<Record<OperationalRole, string[]>>; // Maps role to array of user IDs
}
