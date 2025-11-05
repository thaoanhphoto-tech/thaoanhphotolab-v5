
import { Customer } from "../crm/types";

export type AssetCategory = 'Váy cưới' | 'Vest' | 'Áo dài' | 'Phụ kiện' | 'Đạo cụ';
export const ASSET_CATEGORIES: AssetCategory[] = ['Váy cưới', 'Vest', 'Áo dài', 'Phụ kiện', 'Đạo cụ'];

export type AssetStatus = 'Sẵn sàng' | 'Đang thuê' | 'Giặt ủi' | 'Bảo trì' | 'Hỏng';
export const ASSET_STATUSES: AssetStatus[] = ['Sẵn sàng', 'Đang thuê', 'Giặt ủi', 'Bảo trì', 'Hỏng'];

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
    'Sẵn sàng': 'bg-green-500',
    'Đang thuê': 'bg-amber-500',
    'Giặt ủi': 'bg-blue-500',
    'Bảo trì': 'bg-purple-500',
    'Hỏng': 'bg-red-500',
};

export interface AssetLog {
    timestamp: number;
    action: 'Cho thuê' | 'Trả lại' | 'Bảo trì' | 'Sẵn sàng' | 'Tạo mới';
    notes?: string;
    relatedCustomerId?: string; // Stored customer ID
}

export interface StudioAsset {
    id: string;
    name: string;
    code: string;
    category: AssetCategory;
    size?: string;
    imageUrl: string;
    status: AssetStatus;
    purchasePrice?: number;
    history: AssetLog[];
}
