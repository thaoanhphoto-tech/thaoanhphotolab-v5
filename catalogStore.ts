// catalogStore.ts

export const SIZES_STORAGE_KEY = 'app_catalog_sizes_v1';
export const CATEGORIES_STORAGE_KEY = 'app_catalog_service_categories_v1';

const DEFAULT_SIZES = ['10x15', '13x18', '15x21', '20x30', '25x38', '30x45', '40x60', '50x75', '60x90', '70x110', '80x120', 'Khác'];
const DEFAULT_CATEGORIES = [
    "in ảnh cao cấp ép Plastic/ép Lụa",
    "In Ảnh Ép Gỗ",
    "IN ẢNH MICA HD",
    "IN ẢNH MICA 5K",
    "IN ẢNH TRÁNG GƯƠNG (PHA LÊ)",
    "Ảnh Khung Gỗ Nổi",
    "Ảnh Để Bàn",
    "Khung Ảnh Treo Tường",
    "Photobook",
    "Khung Ảnh Hợp Kim Titan",
];

// Sizes
export const getSizes = (): string[] => {
    try {
        const json = localStorage.getItem(SIZES_STORAGE_KEY);
        if (json) {
            const parsed = JSON.parse(json);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        // If not found, initialize with defaults
        saveSizes(DEFAULT_SIZES);
        return DEFAULT_SIZES;
    } catch (e) {
        return DEFAULT_SIZES;
    }
};

export const saveSizes = (sizes: string[]): void => {
    try {
        localStorage.setItem(SIZES_STORAGE_KEY, JSON.stringify(sizes));
    } catch (e) {
        console.error("Failed to save sizes.", e);
    }
};

// Service Categories
export const getServiceCategories = (): string[] => {
    try {
        const json = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (json) {
            const parsed = JSON.parse(json);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        // If not found, initialize with defaults
        saveServiceCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
    } catch (e) {
        return DEFAULT_CATEGORIES;
    }
};

export const saveServiceCategories = (categories: string[]): void => {
    try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error("Failed to save categories.", e);
    }
};