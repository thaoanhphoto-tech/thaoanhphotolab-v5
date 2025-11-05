export type PostProductionStatus = 'waiting_selection' | 'retouching' | 'pending_print' | 'delivered';

export const POST_PRODUCTION_STATUSES: PostProductionStatus[] = ['waiting_selection', 'retouching', 'pending_print', 'delivered'];

export const POST_PRODUCTION_STATUS_NAMES: Record<PostProductionStatus, string> = {
    'waiting_selection': 'Chờ Chọn Ảnh',
    'retouching': 'Đang Retouch',
    'pending_print': 'Chờ In',
    'delivered': 'Đã Giao Hàng',
};

export interface EditRequest {
    id: string;
    timestamp: number;
    content: string;
    author: string; // Customer name or staff name
}

export interface RetouchVersion {
    id: string;
    versionNumber: number;
    url: string;
    timestamp: number;
}

export interface PostProductionProject {
    id: string; // `pp-${contractId}`
    contractId: string;
    customerName: string; // Denormalized
    status: PostProductionStatus;
    files: {
        originalsUrl?: string;
        customerSelectionUrl?: string;
        retouchVersions: RetouchVersion[];
    };
    editRequests: EditRequest[];
    createdAt: number;
}
