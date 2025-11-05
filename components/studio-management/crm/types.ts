



// Fix: Export the Interaction interface to make it accessible to other modules.
export type CustomerStatus = 'new' | 'consulting' | 'closed' | 'shooting' | 'post-production' | 'completed';

export const CUSTOMER_STATUSES: CustomerStatus[] = ['new', 'consulting', 'closed', 'shooting', 'post-production', 'completed'];

export const CUSTOMER_STATUS_NAMES: Record<CustomerStatus, string> = {
    'new': 'Mới',
    'consulting': 'Đang tư vấn',
    'closed': 'Đã chốt',
    'shooting': 'Đang chụp',
    'post-production': 'Hậu kỳ',
    'completed': 'Hoàn thành',
};

export interface Interaction {
    id: string;
    timestamp: number;
    type: 'note' | 'call' | 'zalo' | 'meeting';
    content: string;
    staffName: string;
}

// Fix: Export the Customer interface to make it accessible to other modules.
export interface Customer {
    id: string;
    name: string;
    phone: string;
    zalo: string;
    address?: string;
    source?: string; // Facebook Ads, Zalo, Giới thiệu, ...
    assignedTo?: string; // Staff name
    status: CustomerStatus;
    interactions: Interaction[];
    createdAt: number;
}