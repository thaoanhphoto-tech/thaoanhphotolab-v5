
import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { jwtDecode } from "jwt-decode";
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { Loader } from './components/Loader.tsx';
import { ToastProvider, useToast, ToastContainer } from './components/Toast.tsx';
import { ContactFAB } from './components/ContactFAB.tsx';
import { AiChatbot } from './components/AiChatbot.tsx';
import { AiAssistantIcon } from './components/icons/AiAssistantIcon.tsx';
import { MockPaymentPage } from './components/MockPaymentPage.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';

// Data stores
import { 
    User, getUsers, saveUsers, PlanId, findOrCreateUserByGoogle, isFreeUserOnly, addRecentLogin,
    PrintRequest, getPrintRequests, savePrintRequests, addPrintRequest, updatePrintRequest,
    getBankAccounts, saveBankAccounts, BankAccount, getPersonnelProfiles, savePersonnelProfiles, PersonnelProfile,
    getStudioStaff, saveStudioStaff, StudioStaff,
    getTimeClockEntries, saveTimeClockEntries, addTimeClockEntry, TimeClockEntry
} from './userStore.ts';
import { Product, getProducts, saveProducts, getProductBases, saveProductBases } from './productStore.ts';
import { loadPrices, savePrices, PricingTable } from './pricingStore.ts';
import { PlanDetailsTable, loadPlans, savePlans } from './planStore.ts';
import { loadPermissions, savePermissions, PermissionsTable } from './permissionStore.ts';
import { CartItem, getCart, saveCart, addToCart, updateCartQuantity, removeFromCart, clearCart } from './cartStore.ts';
import { LoyaltySettings, Reward, Voucher, loadLoyaltySettings, saveLoyaltySettings, getRewards, saveRewards, getVouchers, saveVouchers, addVoucher as addVoucherToStore } from './loyaltyStore.ts';
import { Material, ProductBOM, Supplier, InventoryTransaction, PurchaseOrder, Warehouse, WarehouseTransfer, getMaterials, saveMaterials, getProductBOMs, saveProductBOMs, getSuppliers, saveSuppliers, getInventoryTransactions, saveInventoryTransactions, addInventoryTransaction, getPurchaseOrders, savePurchaseOrders, addPurchaseOrder, updatePurchaseOrder, getWarehouses, saveWarehouses, getWarehouseTransfers, saveWarehouseTransfers, addWarehouseTransfer, completeWarehouseTransfer, getStudioAssets, saveStudioAssets, StudioAsset, AssetLog, addAssetLog } from './inventoryStore.ts';
import { Expense, getExpenses, saveExpenses, addExpense as addExpenseToStore } from './expenseStore.ts';
import { MaterialDefinition, getSizes, saveSizes, getServiceCategories, saveServiceCategories, getMaterialDefinitions, saveMaterialDefinitions, getMaterialUnits, saveMaterialUnits } from './catalogStore.ts';
import { Customer } from './components/studio-management/crm/types.ts';
import { getCustomers, saveCustomers, addCustomer as addCustomerToStore, updateCustomer as updateCustomerInStore } from './crmStore.ts';
import { ServicePackage, Contract, Payment } from './components/studio-management/contracts/types.ts';
import { getServicePackages, saveServicePackages, getContracts, saveContracts, addPaymentToContract } from './contractStore.ts';
import { PostProductionProject } from './components/studio-management/post-production/types.ts';
import { getPostProductionProjects, savePostProductionProjects, updatePostProductionProject } from './postProductionStore.ts';

// Type definitions
import type { Theme } from './types.ts';

// Lazy-loaded page components
const HomePage = lazy(() => import('./components/HomePage.tsx'));
const ServicePage = lazy(() => import('./components/ServicePage.tsx'));
const ProductPage = lazy(() => import('./components/ProductPage.tsx'));
const LoginPage = lazy(() => import('./components/LoginPage.tsx'));
const RegisterPage = lazy(() => import('./components/RegisterPage.tsx'));
const PricingPage = lazy(() => import('./components/PricingPage.tsx'));
const BlogPage = lazy(() => import('./components/BlogPage.tsx'));
const BlogPostPage = lazy(() => import('./components/BlogPostPage.tsx'));
const PrintQueuePage = lazy(() => import('./components/PrintQueuePage.tsx'));
const PrintOrderPage = lazy(() => import('./components/PrintOrderPage.tsx'));
const PromotionsPage = lazy(() => import('./components/PromotionsPage.tsx'));
const MainProductsPage = lazy(() => import('./components/MainProductsPage.tsx'));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage.tsx'));
const CartPage = lazy(() => import('./components/CartPage.tsx'));
const MyAccountPage = lazy(() => import('./components/MyAccountPage.tsx'));
const UserManagementPage = lazy(() => import('./components/UserManagementPage.tsx'));
const PricingManagementPage = lazy(() => import('./components/PricingManagementPage.tsx'));
const ProductManagementPage = lazy(() => import('./components/ProductManagementPage.tsx'));
const PlanManagementPage = lazy(() => import('./components/PlanManagementPage.tsx'));
const CatalogManagementPage = lazy(() => import('./components/CatalogManagementPage.tsx'));
const LabOperationPage = lazy(() => import('./components/lab-operation/LabOperationPage.tsx'));
const DebtReportPage = lazy(() => import('./components/lab-operation/DebtReportPage.tsx'));
const TimeClockPage = lazy(() => import('./components/TimeClockPage.tsx'));
const StudioManagementHub = lazy(() => import('./components/studio-management/StudioManagementHub.tsx'));
const WeddingStudioManager = lazy(() => import('./components/studio-management/WeddingStudioManager.tsx'));
const TracePage = lazy(() => import('./components/TracePage.tsx'));
const CommunityPage = lazy(() => import('./components/CommunityPage.tsx'));
const SchedulePage = lazy(() => import('./components/SchedulePage.tsx'));


// Lazy-loaded Tool components
const Introduction = lazy(() => import('./components/Introduction.tsx'));
const IdPhotoGenerator = lazy(() => import('./components/IdPhotoGenerator.tsx'));
const PhotoRestorer = lazy(() => import('./components/PhotoRestorer.tsx'));
const ConceptPhotoGenerator = lazy(() => import('./components/concept-photo/ConceptPhotoGenerator.tsx'));
const FamilyPhotoComposer = lazy(() => import('./components/FamilyPhotoComposer.tsx'));
const AiWeddingComposer = lazy(() => import('./components/AiWeddingComposer.tsx'));
const PhotoLab = lazy(() => import('./components/PhotoLab.tsx'));
const SocialMediaPostGenerator = lazy(() => import('./components/SocialMediaPostGenerator.tsx'));
const AiPortraitMaster = lazy(() => import('./components/AiPortraitMaster.tsx'));

export type PageState = {
  page: string;
  [key: string]: any;
};

const AppContent: React.FC = () => {
    // State Management
    const [pageState, setPageState] = useState<PageState>({ page: 'home' });
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [theme, setTheme] = useState<Theme>('dark');
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [isInitialLogin, setIsInitialLogin] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState<PlanId | null>(null);
    const [isMockPayment, setIsMockPayment] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [newPrintRequestsCount, setNewPrintRequestsCount] = useState(0);

    // Data states
    const [products, setProducts] = useState<Product[]>([]);
    const [prices, setPrices] = useState<PricingTable>(() => loadPrices());
    const [plans, setPlans] = useState<PlanDetailsTable>(() => loadPlans());
    const [permissions, setPermissions] = useState<PermissionsTable>(() => loadPermissions());
    const [cart, setCart] = useState<CartItem[]>([]);
    const [requests, setRequests] = useState<PrintRequest[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [personnelProfiles, setPersonnelProfiles] = useState<PersonnelProfile[]>([]);
    const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>(() => loadLoyaltySettings());
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [productBOMs, setProductBOMs] = useState<ProductBOM[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [warehouseTransfers, setWarehouseTransfers] = useState<WarehouseTransfer[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [timeClockEntries, setTimeClockEntries] = useState<TimeClockEntry[]>([]);
    
    // Catalog states
    const [productBases, setProductBases] = useState<string[]>([]);
    const [sizes, setSizes] = useState<string[]>([]);
    const [serviceCategories, setServiceCategories] = useState<string[]>([]);
    const [materialDefinitions, setMaterialDefinitions] = useState<MaterialDefinition[]>([]);
    const [materialUnits, setMaterialUnits] = useState<string[]>([]);

    // Studio management states
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [studioStaff, setStudioStaff] = useState<StudioStaff[]>([]);
    const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [postProductionProjects, setPostProductionProjects] = useState<PostProductionProject[]>([]);
    const [studioAssets, setStudioAssets] = useState<StudioAsset[]>([]);


    const { showToast } = useToast();

    // Initial data loading
    useEffect(() => {
        // Basic data
        setUsers(getUsers());
        setProducts(getProducts());
        setCart(getCart());
        setRequests(getPrintRequests());
        setBankAccounts(getBankAccounts());
        setPersonnelProfiles(getPersonnelProfiles());
        setRewards(getRewards());
        setVouchers(getVouchers());
        
        // Inventory data
        setMaterials(getMaterials());
        setProductBOMs(getProductBOMs());
        setSuppliers(getSuppliers());
        setInventoryTransactions(getInventoryTransactions());
        setPurchaseOrders(getPurchaseOrders());
        setWarehouses(getWarehouses());
        setWarehouseTransfers(getWarehouseTransfers());
        setExpenses(getExpenses());
        setTimeClockEntries(getTimeClockEntries());
        setStudioAssets(getStudioAssets());

        // Catalog data
        setProductBases(getProductBases());
        setSizes(getSizes());
        setServiceCategories(getServiceCategories());
        setMaterialDefinitions(getMaterialDefinitions());
        setMaterialUnits(getMaterialUnits());

        // Studio management data
        setServicePackages(getServicePackages());
        setContracts(getContracts());
        setPostProductionProjects(getPostProductionProjects());

        // Check for logged-in user
        const loggedInUser = localStorage.getItem('currentUser_v1');
        if (loggedInUser) {
            setCurrentUser(JSON.parse(loggedInUser));
        }

        // Theme
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) setTheme(savedTheme);
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
        
        // Handle URL params for direct navigation
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page');
        const requestId = params.get('requestId');
        const customerZalo = params.get('customerZalo');
        const invoiceId = params.get('invoiceId');

        if (page === 'debt_report' && customerZalo) {
            setPageState({ page: 'debt_report', customerZalo });
        } else if (page === 'invoice' && invoiceId) {
            // This is handled by a separate HTML file, but good to have logic here
        }

    }, []);

    // Derived State & Effects
    useEffect(() => {
      setIsAdminMode(currentUser?.purchasedPlans.includes('admin') || false);
      if (currentUser) {
          // Sync customers & staff for the current user
          setCustomers(getCustomers(currentUser.id));
          setStudioStaff(getStudioStaff(currentUser.id));
      }
    }, [currentUser]);

    useEffect(() => {
        if (isAdminMode) {
            setNewPrintRequestsCount(requests.filter(r => r.workflowStatus === 'new').length);
        }
    }, [requests, isAdminMode]);

    // Handlers
    const navigateTo = (newState: PageState) => {
        setPageState(newState);
        window.scrollTo(0, 0);
    };

    const handleLogin = async (username: string, password: string, rememberMe: boolean): Promise<{ success: boolean; message: string; }> => {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUser_v1', JSON.stringify(user));
            localStorage.setItem('lastLoggedInUser_v1', user.username);
            addRecentLogin(user.username);
            
            if (rememberMe) {
                 localStorage.setItem('rememberedCredentials_v1', JSON.stringify({username, password}));
            } else {
                 localStorage.removeItem('rememberedCredentials_v1');
            }
            
            navigateTo({ page: 'home' });
            setIsChatbotOpen(true);
            setIsInitialLogin(true);
            return { success: true, message: 'Đăng nhập thành công!' };
        }
        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser_v1');
        navigateTo({ page: 'home' });
    };

    const handleRegister = async (username: string, password: string, fullName: string, zalo: string, email?: string, referredBy?: string): Promise<{ success: boolean; message: string; }> => {
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
        }
         if (users.some(u => u.zalo.trim() !== '' && u.zalo === zalo)) {
            return { success: false, message: 'Số Zalo đã được đăng ký.' };
        }

        let referrer: User | undefined;
        if (referredBy) {
            referrer = users.find(u => u.referralCode === referredBy.toUpperCase());
            if (!referrer) {
                return { success: false, message: 'Mã giới thiệu không hợp lệ.' };
            }
        }
        
        // Determine if this is the first user registration.
        const isFirstUser = users.length === 0;
        const initialPlans: PlanId[] = isFirstUser ? ['admin'] : ['free'];

        const newUser: User = { 
            id: Date.now().toString(), 
            username, 
            password, 
            fullName, 
            zalo, 
            email: email || '', 
            purchasedPlans: initialPlans,
            permissionOverrides: {}, 
            points: 0, 
            referralCode: Math.random().toString(36).substring(2,8).toUpperCase(), 
            createdAt: Date.now(), 
            referredBy: referrer?.referralCode 
        };
        
        const updatedUsers = [...users, newUser];

        if (referrer) {
            const bonusPoints = loyaltySettings.referralBonusPoints;
            newUser.points += bonusPoints;
            const referrerIndex = updatedUsers.findIndex(u => u.id === referrer!.id);
            if (referrerIndex > -1) {
                updatedUsers[referrerIndex].points += bonusPoints;
            }
            showToast(`Bạn và người giới thiệu đã nhận được ${bonusPoints} điểm thưởng!`, 'success');
        }

        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        
        const successMessage = isFirstUser
            ? 'Đăng ký thành công! Bạn là Quản trị viên đầu tiên của hệ thống.'
            : 'Đăng ký thành công! Vui lòng đăng nhập.';

        return { success: true, message: successMessage };
    };

    const handleGoogleLogin = (credential: string) => {
        try {
            const decoded: any = jwtDecode(credential);
            const { user, isNew } = findOrCreateUserByGoogle(decoded);
            setCurrentUser(user);
            localStorage.setItem('currentUser_v1', JSON.stringify(user));
            navigateTo({ page: 'home' });
            if (isNew) {
                showToast(`Chào mừng ${user.fullName}! Tài khoản của bạn đã được tạo.`, 'success');
            } else {
                showToast(`Chào mừng quay trở lại, ${user.fullName}!`, 'success');
            }
        } catch (error) {
            console.error("Google login error", error);
            showToast('Đăng nhập Google thất bại.', 'error');
        }
    };
    
    // All other state update handlers...
    const handleUpdatePlans = (newPlans: PlanDetailsTable) => { setPlans(newPlans); savePlans(newPlans); };
    const handleUpdatePermissions = (newPermissions: PermissionsTable) => { setPermissions(newPermissions); savePermissions(newPermissions); };
    const handleUpdatePrices = (newPrices: PricingTable) => { setPrices(newPrices); savePrices(newPrices); };
    const handleUpdateProducts = (newProducts: Product[]) => { setProducts(newProducts); saveProducts(newProducts); };
    const handleCartUpdate = (updatedCart: CartItem[]) => { setCart(updatedCart); saveCart(updatedCart); };
    const handleAddToCart = (productId: string, quantity: number) => { handleCartUpdate(addToCart(productId, quantity)); showToast('Đã thêm vào giỏ hàng!', 'success'); };
    const handleUpdateCartQuantity = (productId: string, quantity: number) => { handleCartUpdate(updateCartQuantity(productId, quantity)); };
    const handleRemoveFromCart = (productId: string) => { handleCartUpdate(removeFromCart(productId)); };
    
    const handlePurchaseRequest = (planId: PlanId) => {
        if (!currentUser) { navigateTo({ page: 'login' }); return; }
        if (planId === 'single_photo_download' && isMockPayment) { setIsMockPayment(true); return; }
        setShowPaymentModal(planId);
    };

    const handleBillSubmit = (planId: PlanId, billUrl: string) => {
        if (!currentUser) return;
        const newRequest: Omit<PrintRequest, 'id'|'timestamp'|'workflowStatus'|'workInProgress'|'history'> = {
            imageUrl: billUrl,
            sourceTool: `bill_payment_${planId}`,
            userId: currentUser.id,
            username: currentUser.username,
            orderDetails: { customerInfo: { fullName: currentUser.fullName, zalo: currentUser.zalo } }
        };
        addPrintRequest(newRequest);
        
        const updatedUser = { ...currentUser, pendingPayment: { planId, hasBill: true } };
        handleUpdateUser(currentUser.id, { pendingPayment: { planId, hasBill: true } });
        setCurrentUser(updatedUser);

        setShowPaymentModal(null);
        showToast('Đã gửi bill thanh toán! Vui lòng chờ admin xác nhận.', 'info');
    };
    
    const handleUpdateUser = (userId: string, updates: Partial<User>) => {
        const newUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
        setUsers(newUsers);
        saveUsers(newUsers);
        if (currentUser && currentUser.id === userId) {
            const updatedCurrentUser = { ...currentUser, ...updates };
            setCurrentUser(updatedCurrentUser);
            localStorage.setItem('currentUser_v1', JSON.stringify(updatedCurrentUser));
        }
    };
    
    const handleManualPointUpdate = (userId: string, points: number, reason: string) => {
        const newUsers = users.map(u => {
            if (u.id === userId) {
                const newPoints = (u.points || 0) + Number(points);
                showToast(`Đã cập nhật điểm cho ${u.fullName}. Điểm mới: ${newPoints}. Lý do: ${reason}`, 'success');
                return { ...u, points: newPoints };
            }
            return u;
        });
        setUsers(newUsers);
        saveUsers(newUsers);
        if (currentUser && currentUser.id === userId) {
            const updatedCurrentUser = newUsers.find(u => u.id === userId);
            if(updatedCurrentUser) {
                setCurrentUser(updatedCurrentUser);
                localStorage.setItem('currentUser_v1', JSON.stringify(updatedCurrentUser));
            }
        }
    };

    const handleApplyVoucher = async (requestId: string, voucherCode: string): Promise<{ success: boolean; message: string; }> => {
        const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
        const voucher = vouchers.find(v => v.code.toUpperCase() === voucherCode.toUpperCase() && v.status === 'active');
        if (!voucher) {
            return { success: false, message: 'Mã voucher không hợp lệ hoặc đã được sử dụng.' };
        }

        const request = requests.find(r => r.id === requestId);
        if (!request) {
            return { success: false, message: 'Không tìm thấy đơn hàng.' };
        }

        let discountAmount = 0;
        if (voucher.discountType === 'fixed_amount' && voucher.discountValue) {
            discountAmount = voucher.discountValue;
        } else if (voucher.discountType === 'percentage' && voucher.discountValue) {
            const baseTotal = request.manualOrderItems
                ? request.manualOrderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
                : (request.orderDetails.totalPrice || 0);
            const additionalTotal = (request.additionalCosts || []).reduce((sum, item) => sum + item.amount, 0);
            const preDiscountTotal = baseTotal + additionalTotal;
            discountAmount = preDiscountTotal * (voucher.discountValue / 100);
        }

        if (discountAmount <= 0) {
            return { success: false, message: 'Voucher không thể áp dụng.' };
        }

        // Update request with discount
        updatePrintRequest(requestId, { discountAmount, voucherCode }, currentUser, `Áp dụng voucher ${voucherCode}`);
        setRequests(getPrintRequests()); // Refresh state

        // Mark voucher as used
        const updatedVouchers = vouchers.map(v => v.id === voucher.id ? { ...v, status: 'used' as 'used' } : v);
        setVouchers(updatedVouchers);
        saveVouchers(updatedVouchers);
        
        return { success: true, message: `Áp dụng voucher thành công! Giảm ${formatCurrency(discountAmount)}đ.` };
    };


    const allProps = {
        // Pass all state and handlers down to pages
        currentUser, users, products, prices, plans, permissions, cart, requests, bankAccounts, personnelProfiles, loyaltySettings, rewards, vouchers, materials, productBOMs, suppliers, inventoryTransactions, purchaseOrders, warehouses, warehouseTransfers, expenses, timeClockEntries, productBases, sizes, serviceCategories, materialDefinitions, materialUnits, customers, studioStaff, servicePackages, contracts, postProductionProjects, studioAssets,
        navigateTo, isAdminMode,
        onUpdateUser: handleUpdateUser,
        onUpdateProducts: (p: Product[]) => { setProducts(p); saveProducts(p); },
        onUpdatePrices: handleUpdatePrices,
        onUpdatePlans: handleUpdatePlans,
        onUpdatePermissions: handleUpdatePermissions,
        onAddToCart: handleAddToCart,
        onUpdateCartQuantity: handleUpdateCartQuantity,
        onRemoveFromCart: handleRemoveFromCart,
        onApplyVoucher: handleApplyVoucher,
        onManualPointUpdate: handleManualPointUpdate,
        onAddUser: async (username: string, password: string, plan: PlanId, fullName: string, zalo: string, isVip: boolean): Promise<{ success: boolean; message: string; }> => {
            if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
            }
            const newUser: User = { id: Date.now().toString(), username, password, fullName, zalo, email: '', purchasedPlans: [plan], permissionOverrides: {}, isVipCustomer: isVip, points: 0, referralCode: Math.random().toString(36).substring(2,8).toUpperCase(), createdAt: Date.now() };
            const updatedUsers = [...users, newUser];
            setUsers(updatedUsers);
            saveUsers(updatedUsers);
            return { success: true, message: 'Thêm thành công!' };
        },
        onDeleteUser: (userId: string) => {
            if (currentUser?.id === userId || users.find(u => u.id === userId)?.purchasedPlans.includes('admin')) {
                showToast('Không thể xóa tài khoản admin hoặc chính bạn.', 'error');
                return;
            }
            if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
                const newUsers = users.filter(u => u.id !== userId);
                setUsers(newUsers);
                saveUsers(newUsers);
                showToast('Đã xóa người dùng.', 'success');
            }
        },
        onUpdatePersonnelProfile: (userId: string, profile: PersonnelProfile) => {
            const newProfiles = personnelProfiles.filter(p => p.userId !== userId);
            newProfiles.push(profile);
            setPersonnelProfiles(newProfiles);
            savePersonnelProfiles(newProfiles);
            showToast('Đã cập nhật hồ sơ nhân sự.', 'success');
        },
         onPrintRequest: (imageDataUrl: string, sourceTool: string) => {
            if (!currentUser) { navigateTo({ page: 'login' }); return; }
            setPageState({ page: 'print_order_modal', imageUrl: imageDataUrl, sourceTool });
        },
         onSinglePhotoDownloadRequest: () => {
             handlePurchaseRequest('single_photo_download');
        },
        // ... all other handlers
        onUpdateLoyaltySettings: (settings: LoyaltySettings) => { setLoyaltySettings(settings); saveLoyaltySettings(settings); showToast('Đã lưu cài đặt Loyalty!', 'success'); },
        onUpdateRewards: (newRewards: Reward[]) => { setRewards(newRewards); saveRewards(newRewards); },
        onUpdateBankAccounts: (accounts: BankAccount[]) => { setBankAccounts(accounts); saveBankAccounts(accounts); },
        onAddExpense: (expense: Omit<Expense, 'id'>) => { addExpenseToStore(expense); setExpenses(getExpenses()); showToast('Đã thêm chi phí.', 'success'); },
        onUpdateMaterials: (mats: Material[]) => { setMaterials(mats); saveMaterials(mats); },
        onApplyAudit: (updates: { id: string; newStock: number, warehouseId: string }[], notes: string, warehouseId: string) => {
             updates.forEach(update => {
                const material = materials.find(m => m.id === update.id);
                if (material) {
                    const currentStock = (material.stock || {})[warehouseId] || 0;
                    const difference = update.newStock - currentStock;
                    if (difference !== 0) {
                        addInventoryTransaction({ materialId: update.id, type: 'adjustment_audit', quantity: difference, unitPrice: material.unitPrice, notes: `Kiểm kê tại ${warehouses.find(w => w.id === warehouseId)?.name}: ${notes}`, staffId: currentUser!.id, warehouseId: warehouseId });
                    }
                }
            });
            setMaterials(getMaterials());
            setInventoryTransactions(getInventoryTransactions());
            showToast('Đã áp dụng kết quả kiểm kê.', 'success');
        },
        onUpdateSuppliers: (s: Supplier[]) => { setSuppliers(s); saveSuppliers(s); },
        onAddTransaction: (t: Omit<InventoryTransaction, 'id' | 'timestamp'>) => { addInventoryTransaction(t); setInventoryTransactions(getInventoryTransactions()); setMaterials(getMaterials()); },
        onAddPurchaseOrder: (po: Omit<PurchaseOrder, 'id'|'timestamp'>) => { addPurchaseOrder(po); setPurchaseOrders(getPurchaseOrders()); },
        onUpdatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => { updatePurchaseOrder(id, updates); setPurchaseOrders(getPurchaseOrders()); },
        onUpdateWarehouses: (w: Warehouse[]) => { setWarehouses(w); saveWarehouses(w); },
        onAddWarehouseTransfer: (t: Omit<WarehouseTransfer, 'id'|'timestamp'|'status'>) => { addWarehouseTransfer(t); setWarehouseTransfers(getWarehouseTransfers()); setMaterials(getMaterials()); },
        onCompleteWarehouseTransfer: (id: string) => { completeWarehouseTransfer(id, currentUser!.id); setWarehouseTransfers(getWarehouseTransfers()); setMaterials(getMaterials()); },
        onUpdateProductBOMs: (b: ProductBOM[]) => { setProductBOMs(b); saveProductBOMs(b); },

        // Catalogs
        onUpdateProductBases: (d: string[]) => { setProductBases(d); saveProductBases(d); },
        onUpdateSizes: (d: string[]) => { setSizes(d); saveSizes(d); },
        onUpdateServiceCategories: (d: string[]) => { setServiceCategories(d); saveServiceCategories(d); },
        onUpdateMaterialDefinitions: (d: MaterialDefinition[]) => { setMaterialDefinitions(d); saveMaterialDefinitions(d); },
        onUpdateMaterialUnits: (d: string[]) => { setMaterialUnits(d); saveMaterialUnits(d); },

        // CRM
        onUpdateCustomer: (customer: Customer) => { setCustomers(updateCustomerInStore(currentUser!.id, customer)); },
        onAddCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions'>) => { addCustomerToStore(currentUser!.id, customerData); setCustomers(getCustomers(currentUser!.id)); },

        // Contracts
        onUpdatePackages: (pkgs: ServicePackage[]) => { setServicePackages(pkgs); saveServicePackages(pkgs); },
        onUpdateContracts: (c: Contract[]) => { setContracts(c); saveContracts(c); },
        onAddPayment: (contractId: string, amount: number, date: string, method: string, notes?: string) => {
            const payment: Payment = { amount, date, method, notes };
            setContracts(addPaymentToContract(contractId, payment));
            showToast('Đã ghi nhận thanh toán!', 'success');
        },
        
        // Post-production
        onUpdatePostProductionProject: (project: PostProductionProject) => { updatePostProductionProject(project); setPostProductionProjects(getPostProductionProjects()); },

        // Studio Assets
        onUpdateStudioAsset: (asset: StudioAsset) => {
            let assetExists = studioAssets.some(a => a.id === asset.id);
            const newAssets = assetExists ? studioAssets.map(a => a.id === asset.id ? asset : a) : [asset, ...studioAssets];
            setStudioAssets(newAssets);
            saveStudioAssets(newAssets);
        },
        onAddAssetLog: (assetId: string, log: Omit<AssetLog, 'timestamp'>) => { addAssetLog(assetId, log); setStudioAssets(getStudioAssets()); },

        // Vouchers
        onAddVoucher: (voucherData: Omit<Voucher, 'id' | 'userId' | 'createdAt' | 'status'>) => { addVoucherToStore(voucherData); setVouchers(getVouchers()); }

    };

    const renderPage = () => {
        switch (pageState.page) {
            case 'home': return <HomePage {...allProps} />;
            case 'service': return <ServicePage serviceId={pageState.serviceId} {...allProps} />;
            case 'product': return <ProductPage productId={pageState.productId} serviceId={pageState.serviceId} {...allProps} />;
            case 'main_products': return <MainProductsPage {...allProps} />;
            case 'login': return <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} onFaceLogin={(user) => {setCurrentUser(user); navigateTo({page: 'home'});}} users={users} navigateTo={navigateTo} />;
            case 'register': return <RegisterPage onRegister={handleRegister} onGoogleLogin={handleGoogleLogin} navigateTo={navigateTo} />;
            case 'pricing': return <PricingPage onPurchaseRequest={handlePurchaseRequest} {...allProps} />;
            case 'blog': return <BlogPage {...allProps} />;
            case 'blog_post': return <BlogPostPage postId={pageState.postId} {...allProps} />;
            case 'promotions': return <PromotionsPage {...allProps} />;
            case 'search_results': return <SearchResultsPage query={pageState.query} {...allProps} />;
            case 'cart': return <CartPage cart={cart} onUpdateQuantity={handleUpdateCartQuantity} onRemove={handleRemoveFromCart} {...allProps} />;
            case 'my_account': return <MyAccountPage 
                onRedeemReward={(rewardId: string) => ({success: false, message: 'Tính năng đang phát triển'})}
                onUpdatePassword={(oldP:string, newP:string) => ({success:false, message:'Tính năng đang phát triển'})}
                onUpdateUser={(updates: Partial<User>) => handleUpdateUser(currentUser!.id, updates)}
                {...allProps} 
            />;
            case 'user_management': return <UserManagementPage 
                onConfirmPayment={()=>{}}
                onRejectPayment={()=>{}}
                {...allProps} 
             />;
            case 'pricing_management': return <PricingManagementPage {...allProps} />;
            case 'product_management': return <ProductManagementPage {...allProps} />;
            case 'plan_management': return <PlanManagementPage onUpdatePlans={handleUpdatePlans} {...allProps} />;
            case 'catalog_management': return <CatalogManagementPage {...allProps} />;
            case 'lab_operation': return currentUser ? <LabOperationPage currentUser={currentUser} onRefreshRequests={() => setRequests(getPrintRequests())} onUpdateRequest={(id, updates, action) => { updatePrintRequest(id, updates, currentUser, action); setRequests(getPrintRequests()); }} {...allProps} /> : <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} onFaceLogin={(user)=>{setCurrentUser(user); navigateTo({page:'home'});}} users={users} navigateTo={navigateTo} />;
            case 'print_queue': return <PrintQueuePage {...allProps} />;
            case 'time_clock': return currentUser ? <TimeClockPage currentUser={currentUser} onAddTimeClockEntry={(userId, type, photo) => { addTimeClockEntry({userId, type, photoDataUrl: photo, timestamp: Date.now()}); showToast(`Đã chấm công ${type === 'clock_in' ? 'vào' : 'ra'}!`, 'success');}} /> : null;
            case 'studio_hub': return <StudioManagementHub onSelectManager={(manager) => navigateTo({page: 'wedding_studio_manager'})} />;
            case 'wedding_studio_manager': return currentUser ? <WeddingStudioManager onBackToHub={() => navigateTo({page: 'user_management'})} {...allProps} currentUser={currentUser} /> : null;
            case 'debt_report': return <DebtReportPage customerZalo={pageState.customerZalo} allUsers={users} allRequests={requests} />;
            case 'trace': return <TracePage requestId={pageState.requestId} />;
            case 'community': return currentUser ? <CommunityPage currentUser={currentUser} users={users} navigateTo={navigateTo} initialSelectedUserId={pageState.selectedUserId} requests={requests} /> : <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} onFaceLogin={(user)=>{setCurrentUser(user); navigateTo({page:'home'});}} users={users} navigateTo={navigateTo} />;
            case 'schedule': return currentUser ? <SchedulePage currentUser={currentUser} /> : null;

            case 'tool':
                switch (pageState.toolId) {
                    case 'idPhoto': return <IdPhotoGenerator {...allProps} />;
                    case 'photoRestorer': return <PhotoRestorer {...allProps} />;
                    case 'conceptPhoto': return <ConceptPhotoGenerator {...allProps} />;
                    case 'familyPhotoComposer': return <FamilyPhotoComposer {...allProps} />;
                    case 'aiWeddingComposer': return <AiWeddingComposer {...allProps} />;
                    case 'photoLab': return <PhotoLab {...allProps} />;
                    case 'socialMediaPostGenerator': return <SocialMediaPostGenerator {...allProps} />;
                    case 'aiPortraitMaster': return <AiPortraitMaster {...allProps} />;
                    default: return <Introduction {...allProps} />;
                }
            default: return <HomePage {...allProps} />;
        }
    };

    return (
        <div className={theme}>
            <div className="bg-emerald-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 min-h-screen">
                {!pageState.page.includes('lab_operation') && !pageState.page.includes('wedding_studio_manager') && <Header
                    currentUser={currentUser}
                    handleLogout={handleLogout}
                    navigateTo={navigateTo}
                    theme={theme}
                    toggleTheme={() => { const newTheme = theme === 'light' ? 'dark' : 'light'; setTheme(newTheme); localStorage.setItem('theme', newTheme); }}
                    isAdmin={isAdminMode}
                    newPrintRequestsCount={newPrintRequestsCount}
                    pageState={pageState}
                    cartItemCount={cart.length}
                />}

                <Suspense fallback={<div className="flex justify-center items-center py-40"><Loader /></div>}>
                    {renderPage()}
                </Suspense>

                {pageState.page === 'print_order_modal' && (
                    <PrintOrderPage
                        imageUrl={pageState.imageUrl}
                        sourceTool={pageState.sourceTool}
                        currentUser={currentUser}
                        onClose={() => navigateTo({ page: pageState.fromPage || 'tool', toolId: pageState.fromToolId || 'idPhoto' })}
                        onSubmit={(orderDetails) => {
                            if (!currentUser) return;
                            addPrintRequest({
                                imageUrl: pageState.imageUrl,
                                sourceTool: pageState.sourceTool,
                                userId: currentUser.id,
                                username: currentUser.username,
                                orderDetails
                            });
                            setRequests(getPrintRequests());
                            navigateTo({ page: 'home' });
                            showToast('Đã gửi yêu cầu in thành công!', 'success');
                        }}
                    />
                )}
                
                {isMockPayment && showPaymentModal && <MockPaymentPage planId={showPaymentModal} onClose={() => setIsMockPayment(false)} onPaymentSuccess={(planId) => { setIsMockPayment(false); setShowPaymentModal(null); }} />}
                {showPaymentModal && !isMockPayment && <PaymentModal planId={showPaymentModal} onClose={() => setShowPaymentModal(null)} onBillSubmit={handleBillSubmit} onVerifiedDownload={()=>{}} bankAccounts={bankAccounts} plans={plans} />}
                
                {!pageState.page.includes('lab_operation') && !pageState.page.includes('wedding_studio_manager') && <Footer />}
                
                {!isChatbotOpen && !pageState.page.includes('lab_operation') && (
                    <button onClick={() => setIsChatbotOpen(true)} className="fixed bottom-4 right-4 z-[99] w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700">
                        <AiAssistantIcon className="w-7 h-7" />
                    </button>
                )}
                
                {isChatbotOpen && <AiChatbot onClose={() => setIsChatbotOpen(false)} isInitialLogin={isInitialLogin} currentUser={currentUser} />}
                
                <ContactFAB />
                <ToastContainer />
            </div>
        </div>
    );
};

const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
);

export default App;