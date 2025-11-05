
// Fix: Re-export PlanId so other modules can import it from planStore
import { PlanId } from './userStore';
export type { PlanId };

export interface PlanDetail {
    name: string;
    description: string;
    price: string;
    features: string[];
    isPopular?: boolean;
}

export type PlanDetailsTable = { [key in PlanId]: PlanDetail };

const PLAN_STORAGE_KEY = 'app_plan_details_v1';

const initializePlans = (): PlanDetailsTable => {
    return {
        free: { 
            name: 'Miễn phí', 
            description: 'Trải nghiệm các tính năng cơ bản.', 
            price: '0đ / năm', 
            features: [
                'Tạo ảnh có Watermark (logo chìm)', 
                'Không hỗ trợ tải xuống',
                'Truy cập giới hạn một số công cụ'
            ], 
            isPopular: false 
        },
        id_restore: { 
            name: 'Gói Ảnh Thẻ & Phục Hồi', 
            description: 'Toàn quyền sử dụng 2 công cụ ảnh thẻ và phục hồi ảnh.', 
            price: '399.000đ / năm', 
            features: [
                'Tạo ảnh thẻ không giới hạn', 
                'Phục hồi ảnh chuyên sâu', 
                'Không có Watermark',
                'Tải ảnh chất lượng cao',
                'Dùng ảnh đã tạo làm ảnh gốc'
            ], 
            isPopular: false 
        },
        concept: { 
            name: 'Gói Tạo Concept', 
            description: 'Sáng tạo ảnh chân dung nghệ thuật.', 
            price: '499.000đ / năm', 
            features: [
                'Truy cập công cụ Tạo Concept', 
                'Sử dụng mọi concept có sẵn',
                'Không có Watermark',
                'Tải ảnh chất lượng cao',
                'Dùng ảnh đã tạo làm ảnh gốc'
            ], 
            isPopular: false 
        },
        family: { 
            name: 'Gói Ghép Ảnh Gia Đình', 
            description: 'Dành cho studio chuyên ghép ảnh gia đình.', 
            price: '599.000đ / năm', 
            features: [
                'Truy cập công cụ Ghép Ảnh Gia Đình', 
                'Hỗ trợ nhiều thành viên', 
                'Không có Watermark',
                'Tải ảnh chất lượng cao',
                'Dùng ảnh đã tạo làm ảnh gốc'
            ], 
            isPopular: false 
        },
        pro: { 
            name: 'Pro', 
            description: 'Gói tổng hợp, mở khóa các công cụ sáng tạo chính.', 
            price: '999.000đ / năm', 
            features: [
                'Bao gồm Gói Ảnh Thẻ & Phục Hồi', 
                'Bao gồm Gói Tạo Concept', 
                'Bao gồm Gói Ghép Ảnh Gia Đình',
                'Không có Watermark',
                'Tải ảnh chất lượng cao',
                'Dùng ảnh đã tạo làm ảnh gốc'
            ], 
            isPopular: true 
        },
        vip_pro: { 
            name: 'VIP Pro', 
            description: 'Dành cho lab và studio chuyên nghiệp.', 
            price: '1.499.000đ / năm', 
            features: [
                'Tất cả tính năng của gói Pro', 
                'Công cụ Tạo Ánh Sáng (Relight)', 
                'Công cụ Tạo Ảnh Nền', 
                'Công cụ Tạo Ảnh Truyền Thông',
                'Mở khóa mọi quyền lợi trả phí'
            ], 
            isPopular: false 
        },
        vip: { 
            name: 'VIP', 
            description: 'Giải pháp toàn diện cho mọi nhu cầu.', 
            price: '1.999.000đ / năm', 
            features: [
                'Tất cả tính năng của gói VIP Pro', 
                'Công cụ Photo Lab', 
                'Công cụ Chỉnh màu hàng loạt', 
                'Hỗ trợ ưu tiên',
                'Mở khóa mọi quyền lợi trả phí'
            ], 
            isPopular: false 
        },
        admin: { name: 'Quản trị viên', description: 'Toàn quyền quản lý hệ thống.', price: 'N/A', features: ['Quản lý người dùng', 'Xác nhận thanh toán', 'Toàn quyền truy cập công cụ'], isPopular: false },
        single_photo_download: {
            name: 'Tải ảnh lẻ (Gỡ Watermark)',
            description: 'Thanh toán một lần để tải về một ảnh chất lượng cao không có logo.',
            price: '50.000đ',
            features: [
                'Tải về 1 ảnh bạn chọn',
                'Gỡ bỏ logo Thảo Anh Photo Lab',
                'Chất lượng ảnh cao nhất'
            ],
            isPopular: false
        }
    };
};

export const loadPlans = (): PlanDetailsTable => {
    try {
        const stored = localStorage.getItem(PLAN_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.free && parsed.pro) {
                // Add new plan if it doesn't exist for backward compatibility
                if (!parsed.single_photo_download) {
                    const initial = initializePlans();
                    parsed.single_photo_download = initial.single_photo_download;
                    savePlans(parsed);
                }
                return parsed;
            }
        }
        const initial = initializePlans();
        savePlans(initial);
        return initial;
    } catch (e) {
        console.error("Failed to load plans, initializing.", e);
        const initial = initializePlans();
        savePlans(initial);
        return initial;
    }
};

export const savePlans = (plans: PlanDetailsTable): void => {
    try {
        localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
    } catch (e) {
        console.error("Failed to save plans.", e);
    }
};
