import type { jwtDecode } from "jwt-decode";
import { loadPermissions } from './permissionStore';

export type PlanId = 'free' | 'pro' | 'vip_pro' | 'vip' | 'concept' | 'family' | 'id_restore' | 'admin' | 'single_photo_download';

export type OperationalRole = 
    | 'tong_giam_doc' 
    | 'giam_doc' 
    | 'ke_to_an' 
    | 'truong_phong_lab' 
    | 'xuong' 
    | 'ship'
    // New specialized roles for studio scheduling
    | 'nhiep_anh'
    | 'makeup_artist'
    | 'stylist'
    | 'lai_xe'
    | 'hau_can';

// This remains static as it defines application roles, not a user-configurable list.
export const OPERATIONAL_ROLE_NAMES: { [key in OperationalRole]: string } = {
    tong_giam_doc: 'Tổng giám đốc',
    giam_doc: 'Giám đốc',
    ke_to_an: 'Kế toán',
    truong_phong_lab: 'Trưởng phòng lab',
    xuong: 'Xưởng',
    ship: 'Ship',
    // New role names
    nhiep_anh: 'Nhiếp ảnh',
    makeup_artist: 'Makeup Artist',
    stylist: 'Stylist',
    lai_xe: 'Lái xe',
    hau_can: 'Hậu cần'
};


export type ActiveApp = 'idPhoto' | 'photoRestorer' | 'proAiRelight' | 'imageGenerator' | 'conceptPhoto' | 'familyPhotoComposer' | 'socialMediaPostGenerator' | 'photoLab' | 'batchColorCorrector' | 'introduction';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  zalo: string;
  email?: string;
  avatarUrl?: string;
  purchasedPlans: PlanId[];
  permissionOverrides: { [toolId: string]: boolean };
  googleId?: string;
  pendingPayment?: {
    planId: PlanId;
    hasBill: boolean;
  };
  isVipCustomer?: boolean;
  operationalRole?: OperationalRole | null;
  // CRM Fields
  address?: string;
  customerNotes?: string;
  // Loyalty fields
  points: number;
  birthDate?: string; // YYYY-MM-DD
  referralCode: string;
  referredBy?: string; // referralCode of another user
  lastBirthdayGiftYear?: number;
  createdAt: number;
  faceIdPhotoUrl?: string;
}

// New type for Studio-specific staff, managed by the studio owner (user)
export interface StudioStaff {
  id: string;
  name: string;
  role: OperationalRole;
  phone?: string;
  notes?: string;
}


export interface PersonnelProfile {
    userId: string;
    hometown?: string;
    idPhotoUrl?: string;
    nationalIdUrl?: string;
    notes?: string;
    baseSalary?: number;
    salaryType?: 'hourly' | 'monthly';
    overtimeRate?: number; // e.g. 1.5, 2
    allowances?: { description: string; amount: number }[];
}

export interface TimeClockEntry {
  id: string;
  userId: string;
  timestamp: number;
  type: 'clock_in' | 'clock_out';
  photoDataUrl: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}


export const TOOL_NAMES: { [key in ActiveApp | 'admin' | string]: string } = {
    introduction: 'Giới Thiệu',
    idPhoto: 'Ảnh Thẻ',
    photoRestorer: 'Phục Hồi Ảnh Cũ',
    proAiRelight: 'Tạo Ánh Sáng',
    imageGenerator: 'Tạo Ảnh Nền',
    conceptPhoto: 'Tạo Concept',
    familyPhotoComposer: 'Ghép Ảnh Gia Đình',
    socialMediaPostGenerator: 'Ảnh Truyền Thông',
    photoLab: 'Photo Lab',
    batchColorCorrector: 'Chỉnh Màu Hàng Loạt',
    admin: 'Quản trị viên'
};

export const ALL_TOOLS: (ActiveApp | 'admin')[] = Object.keys(TOOL_NAMES) as (ActiveApp | 'admin')[];

export const isFreeUserOnly = (user: User | null): boolean => {
    if (!user) {
        // Treat logged-out users as free users for watermark purposes
        return true;
    }
    return user.purchasedPlans.length === 1 && user.purchasedPlans[0] === 'free';
};

export const hasPermission = (user: User, toolId: ActiveApp | 'admin'): boolean => {
    if (!user) return false;
    
    const permissions = loadPermissions();

    // Admin has access to everything
    if (user.purchasedPlans.includes('admin')) return true;

    // Check permission overrides first
    if (user.permissionOverrides && user.permissionOverrides[toolId] !== undefined) {
        return user.permissionOverrides[toolId];
    }
    // Check plans
    return user.purchasedPlans.some(planId => permissions[planId]?.includes(toolId));
};

export const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const getUsers = (): User[] => {
  try {
    const usersJson = localStorage.getItem('appUsers_v1');
    let existingUsers = usersJson ? JSON.parse(usersJson) : [];

    // If no users exist, create the default admin user and sample personnel
    if (existingUsers.length === 0) {
      const defaultUsers: User[] = [
          {
            id: 'admin-default-001',
            username: 'Thaoanhphotolab',
            password: '@Thaoanhlab#097898336',
            fullName: 'Thảo Anh Photo Lab',
            zalo: '097898336',
            purchasedPlans: ['admin'],
            permissionOverrides: {},
            isVipCustomer: true,
            operationalRole: 'tong_giam_doc',
            points: 0,
            referralCode: generateReferralCode(),
            createdAt: Date.now(),
          },
          // Sample users are removed as staff is now managed per-account
      ];
      existingUsers = defaultUsers;
      saveUsers(existingUsers);
    }
    
    // Migration for existing users
    let needsSave = false;
    const migratedUsers = existingUsers.map((user: User) => {
        const updatedUser = {...user};
        if (updatedUser.referralCode === undefined) {
            updatedUser.referralCode = generateReferralCode();
            needsSave = true;
        }
        if (updatedUser.points === undefined) {
            updatedUser.points = 0;
            needsSave = true;
        }
        if (updatedUser.createdAt === undefined) {
            updatedUser.createdAt = new Date('2024-01-01').getTime(); // Default past date for existing users
            needsSave = true;
        }
        return updatedUser;
    });

    const hasPaymentScreenUser = migratedUsers.some(u => u.username === 'manhinhthanhtoan');
    if (!hasPaymentScreenUser) {
        migratedUsers.push({
            id: 'system-payment-screen',
            username: 'manhinhthanhtoan',
            password: '123456',
            fullName: 'Màn hình Thanh toán',
            zalo: '0000000000',
            purchasedPlans: ['free'],
            permissionOverrides: {},
            points: 0,
            referralCode: 'SYSTEM',
            createdAt: Date.now(),
        });
        needsSave = true;
    }


    if (needsSave) {
        saveUsers(migratedUsers);
    }
    
    return migratedUsers;
  } catch (e) {
    console.error("Failed to parse users from localStorage:", e);
    return [];
  }
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem('appUsers_v1', JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users to localStorage:", e);
  }
};

// --- Studio Staff Management (Per User) ---
const getStudioStaffKey = (ownerId: string) => `app_studio_staff_${ownerId}`;

export const getStudioStaff = (ownerId: string): StudioStaff[] => {
    try {
        const json = localStorage.getItem(getStudioStaffKey(ownerId));
        if (json) {
            return JSON.parse(json);
        }
        // If no staff, create some samples for the admin user
        if (ownerId === 'admin-default-001') {
            const sampleStaff: StudioStaff[] = [
                { id: 'staff-1', name: 'Nguyễn Văn Nhiếp', role: 'nhiep_anh' },
                { id: 'staff-2', name: 'Trần Thị Trang Điểm', role: 'makeup_artist' },
            ];
            saveStudioStaff(ownerId, sampleStaff);
            return sampleStaff;
        }
        return [];
    } catch (e) {
        return [];
    }
};

export const saveStudioStaff = (ownerId: string, staff: StudioStaff[]): void => {
    localStorage.setItem(getStudioStaffKey(ownerId), JSON.stringify(staff));
};


// Personnel Profile Store
export const getPersonnelProfiles = (): PersonnelProfile[] => {
    try {
        const profilesJson = localStorage.getItem('appPersonnelProfiles_v1');
        return profilesJson ? JSON.parse(profilesJson) : [];
    } catch (e) {
        return [];
    }
};

export const savePersonnelProfiles = (profiles: PersonnelProfile[]): void => {
    localStorage.setItem('appPersonnelProfiles_v1', JSON.stringify(profiles));
};


export const findOrCreateUserByGoogle = (decoded: { sub: string, name: string, picture: string, email: string }): { user: User, isNew: boolean } => {
    let users = getUsers();
    let user = users.find(u => u.googleId === decoded.sub || u.email === decoded.email);
    let isNew = false;
    
    if (!user) {
        isNew = true;
        const username = decoded.email.split('@')[0];
        user = {
            id: Date.now().toString(),
            username: username,
            fullName: decoded.name,
            zalo: '',
            email: decoded.email,
            avatarUrl: decoded.picture,
            googleId: decoded.sub,
            purchasedPlans: ['free'],
            permissionOverrides: {},
            isVipCustomer: false,
            operationalRole: null,
            points: 0,
            referralCode: generateReferralCode(),
            createdAt: Date.now(),
        };
        users.push(user);
    } else {
      // Update user info from Google
      user.fullName = decoded.name;
      user.avatarUrl = decoded.picture;
      if (!user.googleId) user.googleId = decoded.sub;
    }
    
    saveUsers(users);
    return { user, isNew };
};

export const getRecentLogins = (): string[] => {
    try {
        const recent = localStorage.getItem('appRecentLogins_v1');
        return recent ? JSON.parse(recent) : [];
    } catch (e) {
        return [];
    }
};

export const addRecentLogin = (username: string) => {
    let recent = getRecentLogins();
    // Remove if exists to add to the top
    recent = recent.filter(u => u !== username);
    recent.unshift(username);
    // Keep only last 5
    recent = recent.slice(0, 5);
    localStorage.setItem('appRecentLogins_v1', JSON.stringify(recent));
};

export type PrintLayoutType = '4x6_sheet' | '3x4_sheet' | 'custom';
export type PrintWorkflowStatus = 'new' | 'pending_print' | 'printing' | 'finishing' | 'shipping' | 'delivered' | 'archived';
export type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid';


export interface PrintLayoutDetail {
    type: PrintLayoutType;
    quantity: number;
    customDescription?: string;
}

export interface ManualOrderItem {
    productCode: string;
    productName: string;
    size: string;
    quantity: number;
    unitPrice: number;
}

export type OrderSourceChannel = 'Website' | 'Zalo' | 'Facebook' | 'Gmail' | 'Tại cửa hàng';

export interface PrintOrderDetails {
  customerInfo: {
    fullName: string;
    zalo: string;
    email?: string;
    address?: string;
  };
  layouts?: PrintLayoutDetail[];
  notes?: string;
  totalPrice?: number;
}

export interface HistoryEntry {
  timestamp: number;
  userId: string;
  userName: string;
  action: string;
}

export interface PrintRequest {
  id: string;
  timestamp: number;
  status: 'new' | 'viewed' | 'completed';
  workflowStatus: PrintWorkflowStatus;
  imageUrl?: string; // Optional for manual orders
  userId?: string;
  username: string; // User who submitted or accountant who created
  sourceTool: string; // The AI tool, or 'Manual'
  sourceChannel?: OrderSourceChannel;
  orderDetails: PrintOrderDetails;
  manualOrderItems?: ManualOrderItem[];
  customerFileUrls?: string[];
  deliveryPhotoUrl?: string;
  fileStorageLocation?: string;
  workInProgress?: boolean;
  history?: HistoryEntry[];
  // Accounting fields
  invoiceId?: string;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  totalAmount?: number;
  additionalCosts?: { description: string; amount: number }[];
  receivingAccountId?: string;
  referringEmployeeId?: string;
  // Voucher fields
  voucherCode?: string;
  discountAmount?: number;
  freeProductItems?: ManualOrderItem[];
}


export const getPrintRequests = (): PrintRequest[] => {
    try {
        const requestsJson = localStorage.getItem('appPrintRequests_v1');
        const requests = requestsJson ? JSON.parse(requestsJson) : [];
        // Sort by newest first
        return requests.sort((a: PrintRequest, b: PrintRequest) => b.timestamp - a.timestamp);
    } catch (e) {
        return [];
    }
};

export const savePrintRequests = (requests: PrintRequest[]): void => {
    localStorage.setItem('appPrintRequests_v1', JSON.stringify(requests));
};

export const addPrintRequest = (requestData: Omit<PrintRequest, 'id' | 'timestamp' | 'status' | 'workflowStatus'>) => {
    const requests = getPrintRequests();
    const newRequest: PrintRequest = {
        ...requestData,
        id: `print-${Date.now()}`,
        timestamp: Date.now(),
        status: 'new',
        workflowStatus: 'new',
        workInProgress: false,
        history: [],
    };
    requests.unshift(newRequest);
    savePrintRequests(requests);
};

export const updatePrintRequest = (
    requestId: string, 
    updates: Partial<Omit<PrintRequest, 'id'>>, 
    currentUser: User, 
    actionDescription: string
): void => {
    let requests = getPrintRequests();
    
    const newHistoryEntry: HistoryEntry = {
        timestamp: Date.now(),
        userId: currentUser.id,
        userName: currentUser.fullName || currentUser.username,
        action: actionDescription,
    };

    requests = requests.map(req => {
        if (req.id === requestId) {
            const updatedHistory = [...(req.history || []), newHistoryEntry];
            return { ...req, ...updates, history: updatedHistory }; 
        }
        return req;
    });
    savePrintRequests(requests);
};


export const getPendingBill = (userId: string): string | null => {
    try {
        const billsJson = localStorage.getItem('appPendingBills_v1');
        const bills = billsJson ? JSON.parse(billsJson) : {};
        return bills[userId] || null;
    } catch (e) {
        return null;
    }
};

export interface BankAccount {
    id: string;
    bankBin: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
}

export const BANKS = [
    { bin: '970415', name: 'VietinBank' },
    { bin: '970418', name: 'Vietcombank' },
    { bin: '970405', name: 'Agribank' },
    { bin: '970432', name: 'VPBank' },
    { bin: '970422', name: 'MBBank' },
    { bin: '970407', name: 'Techcombank' },
    { bin: '970403', name: 'Sacombank' },
    { bin: '970416', name: 'ACB' },
    { bin: '970423', name: 'TPBank' },
    { bin: '970448', name: 'OCB' },
];

export const getBankAccounts = (): BankAccount[] => {
    try {
        const infoJson = localStorage.getItem('appBankAccounts_v1');
        const existingAccounts = infoJson ? JSON.parse(infoJson) : [];

        // If no accounts exist, create the default one.
        if (existingAccounts.length === 0) {
            const defaultAccount: BankAccount = {
                id: `default-${Date.now()}`,
                bankBin: '970432', // VPBank BIN
                accountNumber: '0978983136',
                accountName: 'NGUYEN HUU THAO',
                isDefault: true
            };
            saveBankAccounts([defaultAccount]);
            return [defaultAccount];
        }

        return existingAccounts;
    } catch (e) {
        // If parsing fails, it's safer to return an empty array than to potentially overwrite data.
        console.error("Failed to load bank accounts from localStorage", e);
        return [];
    }
};


export const saveBankAccounts = (accounts: BankAccount[]): void => {
    localStorage.setItem('appBankAccounts_v1', JSON.stringify(accounts));
};


export const getPrintPrices = (): Record<PrintLayoutType, number> => {
    const defaultPrices: Record<PrintLayoutType, number> = {
        '4x6_sheet': 40000,
        '3x4_sheet': 40000,
        'custom': 0, // Custom items are priced manually by admin
    };
    try {
        const pricesJson = localStorage.getItem('appPrintPrices_v1');
        return pricesJson ? { ...defaultPrices, ...JSON.parse(pricesJson) } : defaultPrices;
    } catch (e) {
        return defaultPrices;
    }
};

export const savePrintPrices = (prices: Record<PrintLayoutType, number>): void => {
    localStorage.setItem('appPrintPrices_v1', JSON.stringify(prices));
};

export const getTimeClockEntries = (): TimeClockEntry[] => {
    try {
        const entriesJson = localStorage.getItem('appTimeClockEntries_v1');
        return entriesJson ? JSON.parse(entriesJson) : [];
    } catch (e) {
        return [];
    }
};

export const addTimeClockEntry = (entry: Omit<TimeClockEntry, 'id'>): void => {
    const entries = getTimeClockEntries();
    const newEntry: TimeClockEntry = {
        ...entry,
        id: `tc-${Date.now()}`
    };
    entries.push(newEntry);
    localStorage.setItem('appTimeClockEntries_v1', JSON.stringify(entries));
};