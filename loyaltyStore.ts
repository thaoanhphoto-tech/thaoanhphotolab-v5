

export interface LoyaltySettings {
    pointsPerUnit: number; // e.g., 10000 (for 10,000 VND)
    pointsValue: number;   // e.g., 1 (for 1 point)
    referralBonusPoints: number; // for both referrer and referred
    birthdayGiftDescription: string;
    birthdayGiftType: 'discount'; // For future expansion
    birthdayGiftValue: number; // e.g. 20 for 20%
}

export type RewardType = 'discount' | 'product';

export interface Reward {
    id: string;
    type: RewardType;
    pointsCost: number;
    description: string;
    value: number | string; // amount for discount, productId for product
}

export interface Voucher {
    id: string;
    code: string;
    userId?: string; // Optional for general promo codes
    createdAt: number;
    status: 'active' | 'used';
    // For rewards redeemed by points
    rewardId?: string;
    // For birthday gifts
    source?: 'birthday_gift' | 'promo_campaign';
    rewardType?: 'discount'; // For now only discount for birthdays
    rewardValue?: number; // e.g. 20 for 20%
    // For marketing campaigns
    description?: string;
    discountType?: 'percentage' | 'fixed_amount';
    discountValue?: number;
    expiresAt?: string; // ISO date string
    minOrderValue?: number;
}


const LOYALTY_SETTINGS_KEY = 'app_loyalty_settings_v1';
const REWARDS_KEY = 'app_rewards_v1';
const VOUCHERS_KEY = 'app_vouchers_v1';

export const getDefaultLoyaltySettings = (): LoyaltySettings => ({
    pointsPerUnit: 10000,
    pointsValue: 1,
    referralBonusPoints: 50,
    birthdayGiftDescription: 'Voucher giảm giá 20% cho đơn hàng tiếp theo.',
    birthdayGiftType: 'discount',
    birthdayGiftValue: 20, // 20%
});

export const loadLoyaltySettings = (): LoyaltySettings => {
    try {
        const settingsJson = localStorage.getItem(LOYALTY_SETTINGS_KEY);
        if (settingsJson) {
            // Merge saved settings with defaults to ensure new fields are present
            return { ...getDefaultLoyaltySettings(), ...JSON.parse(settingsJson) };
        }
    } catch (e) {
        console.error("Failed to load loyalty settings", e);
    }
    return getDefaultLoyaltySettings();
};

export const saveLoyaltySettings = (settings: LoyaltySettings): void => {
    try {
        localStorage.setItem(LOYALTY_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save loyalty settings", e);
    }
};

// Reward Management
export const getRewards = (): Reward[] => {
    try {
        const rewardsJson = localStorage.getItem(REWARDS_KEY);
        return rewardsJson ? JSON.parse(rewardsJson) : [];
    } catch (e) {
        return [];
    }
};

export const saveRewards = (rewards: Reward[]): void => {
    localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
};

// Voucher Management
export const getVouchers = (): Voucher[] => {
    try {
        const vouchersJson = localStorage.getItem(VOUCHERS_KEY);
        return vouchersJson ? JSON.parse(vouchersJson) : [];
    } catch (e) {
        return [];
    }
};

export const saveVouchers = (vouchers: Voucher[]): void => {
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers));
};

export const addVoucher = (voucherData: Omit<Voucher, 'id' | 'createdAt' | 'status'>): void => {
    const vouchers = getVouchers();
    const newVoucher: Voucher = {
        ...voucherData,
        id: `voucher-${Date.now()}`,
        createdAt: Date.now(),
        status: 'active',
        source: 'promo_campaign',
    };
    vouchers.unshift(newVoucher);
    saveVouchers(vouchers);
};