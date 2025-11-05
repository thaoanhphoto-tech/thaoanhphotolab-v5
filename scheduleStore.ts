// scheduleStore.ts

export interface ScheduleEvent {
  id: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  title: string; // "chụp gì"
  clientName: string;
  bridePhone?: string;
  groomPhone?: string;
  studioPhone?: string;
  price: number;
  deposit?: number;
  notes: string;
  isCompleted: boolean;
  paymentStatus?: 'paid' | 'unpaid' | 'deposited';
  fileDelivered?: boolean;
}

const getStorageKey = (userId: string): string => `app_schedule_events_${userId}`;

export const getScheduleEvents = (userId: string): ScheduleEvent[] => {
  try {
    const eventsJson = localStorage.getItem(getStorageKey(userId));
    const events = eventsJson ? JSON.parse(eventsJson) : [];
    // Sort by date and time
    return events.sort((a: ScheduleEvent, b: ScheduleEvent) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateA - dateB;
    });
  } catch (e) {
    console.error("Failed to load schedule events:", e);
    return [];
  }
};

export const saveScheduleEvents = (userId: string, events: ScheduleEvent[]): void => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(events));
  } catch (e) {
    console.error("Failed to save schedule events:", e);
  }
};

export const addScheduleEvent = (userId: string, eventData: Omit<ScheduleEvent, 'id'>): ScheduleEvent => {
  const events = getScheduleEvents(userId);
  const newEvent: ScheduleEvent = {
    ...eventData,
    id: `event-${Date.now()}`,
  };
  events.push(newEvent);
  saveScheduleEvents(userId, events);
  return newEvent;
};

export const updateScheduleEvent = (userId: string, updatedEvent: ScheduleEvent): void => {
  let events = getScheduleEvents(userId);
  events = events.map(event => (event.id === updatedEvent.id ? updatedEvent : event));
  saveScheduleEvents(userId, events);
};

export const deleteScheduleEvent = (userId: string, eventId: string): void => {
  let events = getScheduleEvents(userId);
  events = events.filter(event => event.id !== eventId);
  saveScheduleEvents(userId, events);
};