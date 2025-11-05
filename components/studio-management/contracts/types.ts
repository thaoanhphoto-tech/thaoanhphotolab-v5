
export interface ServicePackage {
    id: string;
    name: string;
    price: number;
    items: string[];
}

export type ContractStatus = 'draft' | 'deposit_pending' | 'in_progress' | 'completed' | 'cancelled';

export const CONTRACT_STATUS_NAMES: Record<ContractStatus, string> = {
    'draft': 'Nháp',
    'deposit_pending': 'Chờ cọc',
    'in_progress': 'Đang thực hiện',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy',
};

// Fix: Add Payment interface to be used in contracts.
export interface Payment {
    amount: number;
    date: string;
    method: string;
    notes?: string;
}

export interface Contract {
    id: string;
    customerId: string;
    customerName: string; // Denormalized for easy display
    servicePackageIds: string[];
    additionalItems: {
        description: string;
        price: number;
    }[];
    discount: number;
    totalAmount: number;
    depositAmount: number;
    status: ContractStatus;
    createdAt: number;
    notes?: string;
    // Fix: Add payments array to contract type.
    payments?: Payment[];
}
