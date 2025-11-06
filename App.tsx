
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { jwtDecode } from "jwt-decode";
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { PaymentModal } from './components/PaymentModal';
import { AiChatbot } from './components/AiChatbot';
import { User, PlanId, getUsers, saveUsers, findOrCreateUserByGoogle, addRecentLogin, getPrintRequests, addPrintRequest, PrintRequest, PrintOrderDetails, updatePrintRequest, PersonnelProfile, getPersonnelProfiles, savePersonnelProfiles, generateReferralCode, BankAccount, getBankAccounts, saveBankAccounts, TimeClockEntry, getTimeClockEntries, addTimeClockEntry, StudioStaff, getStudioStaff, saveStudioStaff, ManualOrderItem } from './userStore';
import { getProducts, saveProducts, Product, getProductBases, saveProductBases } from './productStore';
import { getSizes, saveSizes, getServiceCategories, saveServiceCategories } from './catalogStore';
import { ToastProvider, useToast, ToastContainer } from './components/Toast';
import { AiAssistantIcon } from './components/icons/AiAssistantIcon';
import { Footer } from './components/Footer';
import { ContactFAB } from './components/ContactFAB';
import type { Theme } from './types';
import { PricingTable, loadPrices, savePrices } from './pricingStore';
import { PlanDetailsTable, loadPlans, savePlans } from './planStore';
// FIX: Import `saveVouchers`
import { LoyaltySettings, loadLoyaltySettings, saveLoyaltySettings, Reward, getRewards, saveRewards, Voucher, getVouchers, addVoucher as addVoucherToStore, saveVouchers } from './loyaltyStore';
import { Material, ProductBOM, getMaterials, saveMaterials, getProductBOMs, saveProductBOMs, StudioAsset, getStudioAssets, saveStudioAssets, AssetLog, addAssetLog as addInventoryAssetLog, Supplier, getSuppliers, saveSuppliers, InventoryTransaction, getInventoryTransactions, addInventoryTransaction, PurchaseOrder, getPurchaseOrders, savePurchaseOrders, addPurchaseOrder, updatePurchaseOrder, Warehouse, getWarehouses, saveWarehouses, WarehouseTransfer, getWarehouseTransfers, addWarehouseTransfer, completeWarehouseTransfer } from './inventoryStore';
import { Expense, getExpenses, addExpense } from './expenseStore';
import { getScheduleEvents, saveScheduleEvents } from './scheduleStore';
import { Customer } from './components/studio-management/crm/types';
import { ServicePackage, Contract } from './components/studio-management/contracts/types';
import { getServicePackages, saveServicePackages, getContracts, saveContracts, addPaymentToContract as addPaymentToContractStore } from './contractStore';
import { getCustomers, saveCustomers, addCustomer as addCustomerToStore, updateCustomer } from './crmStore';
import { PostProductionProject } from './components/studio-management/post-production/types';
import { getPostProductionProjects, updatePostProductionProject as updatePpProject } from './postProductionStore';
import { PrintOrderPage } from './components/PrintOrderPage';
import { CartItem, addToCart, updateCartQuantity, removeFromCart } from './cartStore';


declare const google: any;

export type PageState =
  | { page: 'home' }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'tool', toolId: string }
  | { page: 'service', serviceId: string }
  | { page: 'product', serviceId: string, productId: string }
  | { page: 'blog' }
  | { page: 'blog_post', postId: string }
  | { page: 'pricing' }
  | { page: 'promotions' }
  | { page: 'user_management' }
  | { page: 'print_queue' }
  | { page: 'print_order', requestId: string }
  | { page: 'main_products' }
  | { page: 'pricing_management' }
  | { page: 'plan_management' }
  | { page: 'product_management' }
  | { page: 'catalog_management' }
  | { page: 'my_account' }
  | { page: 'inventory_management' }
  | { page: 'time_clock' }
  | { page: 'lab_operation' }
  | { page: 'schedule' }
  | { page: 'community', selectedUserId?: string }
  | { page: 'wedding_manager' }
  | { page: 'studio_hub' }
  | { page: 'mock_payment', planId: PlanId }
  | { page: 'invoice', invoiceId: string }
  | { page: 'debt_report', customerZalo: string }
  | { page: 'search_results', query: string }
  | { page: 'cart' };


export type ActiveApp = 'idPhoto' | 'photoRestorer' | 'proAiRelight' | 'imageGenerator' | 'conceptPhoto' | 'familyPhotoComposer' | 'socialMediaPostGenerator' | 'photoLab' | 'batchColorCorrector' | 'introduction';

// Lazy load components for code splitting
const IdPhotoGenerator = lazy(() => import('./components/IdPhotoGenerator').then(module => ({ default: module.IdPhotoGenerator })));
const PhotoRestorer = lazy(() => import('./components/PhotoRestorer').then(module => ({ default: module.PhotoRestorer })));
const Introduction = lazy(() => import('./components/Introduction').then(module => ({ default: module.Introduction })));
const ProAiRelight = lazy(() => import('./components/pro-ai-relight/ProAiRelight').then(module => ({ default: module.ProAiRelight })));
const ImageGenerator = lazy(() => import('./components/ImageGenerator').then(module => ({ default: module.ImageGenerator })));
const ConceptPhotoGenerator = lazy(() => import('./components/concept-photo/ConceptPhotoGenerator').then(module => ({ default: module.ConceptPhotoGenerator })));
const FamilyPhotoComposer = lazy(() => import('./components/FamilyPhotoComposer').then(module => ({ default: module.FamilyPhotoComposer })));
const SocialMediaPostGenerator = lazy(() => import('./components/SocialMediaPostGenerator').then(module => ({ default: module.SocialMediaPostGenerator })));
const PhotoLab = lazy(() => import('./components/PhotoLab').then(module => ({ default: module.PhotoLab })));
const BatchColorCorrector = lazy(() => import('./components/BatchColorCorrector').then(module => ({ default: module.BatchColorCorrector })));
const HomePage = lazy(() => import('./components/HomePage').then(module => ({ default: module.HomePage })));
const ServicePage = lazy(() => import('./components/ServicePage').then(module => ({ default: module.ServicePage })));
const ProductPage = lazy(() => import('./components/ProductPage').then(module => ({ default: module.ProductPage })));
const LoginPage = lazy(() => import('./components/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./components/RegisterPage').then(module => ({ default: module.RegisterPage })));
const BlogPage = lazy(() => import('./components/BlogPage').then(module => ({ default: module.BlogPage })));
const BlogPostPage = lazy(() => import('./components/BlogPostPage').then(module => ({ default: module.BlogPostPage })));
const PricingPage = lazy(() => import('./components/PricingPage').then(module => ({ default: module.PricingPage })));
const PromotionsPage = lazy(() => import('./components/PromotionsPage').then(module => ({ default: module.PromotionsPage })));
const UserManagementPage = lazy(() => import('./UserManagementPage'));
const PrintQueuePage = lazy(() => import('./components/PrintQueuePage').then(module => ({ default: module.PrintQueuePage })));
const MainProductsPage = lazy(() => import('./components/MainProductsPage').then(module => ({ default: module.MainProductsPage })));
const PricingManagementPage = lazy(() => import('./components/PricingManagementPage').then(module => ({ default: module.PricingManagementPage })));
const PlanManagementPage = lazy(() => import('./components/PlanManagementPage'));
const ProductManagementPage = lazy(() => import('./components/ProductManagementPage').then(module => ({ default: module.ProductManagementPage })));
const CatalogManagementPage = lazy(() => import('./components/CatalogManagementPage').then(module => ({ default: module.CatalogManagementPage })));
const MyAccountPage = lazy(() => import('./components/MyAccountPage'));
const InventoryManagementPage = lazy(() => import('./components/InventoryManagementPage'));
const TimeClockPage = lazy(() => import('./components/TimeClockPage').then(module => ({ default: module.TimeClockPage })));
const LabOperationPage = lazy(() => import('./components/lab-operation/LabOperationPage'));
const SchedulePage = lazy(() => import('./components/SchedulePage'));
const CommunityPage = lazy(() => import('./components/CommunityPage'));
const WeddingStudioManager = lazy(() => import('./components/studio-management/WeddingStudioManager'));
const StudioManagementHub = lazy(() => import('./components/studio-management/StudioManagementHub'));
const MockPaymentPage = lazy(() => import('./components/MockPaymentPage').then(module => ({ default: module.MockPaymentPage })));
const InvoicePage = lazy(() => import('./components/lab-operation/InvoicePage').then(module => ({ default: module.InvoicePage })));
const DebtReportPage = lazy(() => import('./components/lab-operation/DebtReportPage').then(module => ({ default: module.DebtReportPage })));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage').then(module => ({ default: module.SearchResultsPage })));
const CartPage = lazy(() => import('./components/CartPage').then(module => ({ default: module.CartPage })));

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';

const AppContent: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>({ page: 'home' });
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const sessionUserJson = sessionStorage.getItem('loggedInUser_v1');
    if (sessionUserJson) {
        try {
            return JSON.parse(sessionUserJson);
        } catch (e) {
            sessionStorage.removeItem('loggedInUser_v1');
        }
    }
    const rememberedCredsJson = localStorage.getItem('rememberedCredentials_v1');
    if (rememberedCredsJson) {
        try {
            const { username, password } = JSON.parse(rememberedCredsJson);
            const allUsers = getUsers(); 
            const user = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
            if (user) {
                sessionStorage.setItem('loggedInUser_v1', JSON.stringify(user));
                addRecentLogin(user.username);
                return user;
            } else {
                localStorage.removeItem('rememberedCredentials_v1');
            }
        } catch (e) {
            localStorage.removeItem('rememberedCredentials_v1');
        }
    }
    return null;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'dark';
  });

  const [paymentPlan, setPaymentPlan] = useState<PlanId | null>(null);
  const [isAiChatbotOpen, setIsAiChatbotOpen] = useState(false);
  const [isInitialLogin, setIsInitialLogin] = useState(false);
  const [isPrintOrderModalOpen, setIsPrintOrderModalOpen] = useState(false);
  const [printOrderData, setPrintOrderData] = useState<{ imageUrl: string; sourceTool: string } | null>(null);
  const [imageToDownloadUrl, setImageToDownloadUrl] = useState<string | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [productBases, setProductBases] = useState<string[]>(() => getProductBases());
  const [sizes, setSizes] = useState<string[]>(() => getSizes());
  const [serviceCategories, setServiceCategories] = useState<string[]>(() => getServiceCategories());
  const [prices, setPrices] = useState<PricingTable>(() => loadPrices());
  const [plans, setPlans] = useState<PlanDetailsTable>(() => loadPlans());
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>(() => loadLoyaltySettings());
  const [rewards, setRewards] = useState<Reward[]>(() => getRewards());
  const [vouchers, setVouchers] = useState<Voucher[]>(() => getVouchers());
  const [printRequests, setPrintRequests] = useState<PrintRequest[]>(() => getPrintRequests());
  const [personnelProfiles, setPersonnelProfiles] = useState<PersonnelProfile[]>(() => getPersonnelProfiles());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => getBankAccounts());
  const [timeClockEntries, setTimeClockEntries] = useState<TimeClockEntry[]>(() => getTimeClockEntries());
  const [studioStaff, setStudioStaff] = useState<StudioStaff[]>(() => currentUser ? getStudioStaff(currentUser.id) : []);
  const [materials, setMaterials] = useState<Material[]>(() => getMaterials());
  const [productBOMs, setProductBOMs] = useState<ProductBOM[]>(() => getProductBOMs());
  const [expenses, setExpenses] = useState<Expense[]>(() => getExpenses());
  const [cart, setCart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem('app_shopping_cart_v1') || '[]'));
  // New inventory states
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getSuppliers());
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => getInventoryTransactions());
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getPurchaseOrders());
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => getWarehouses());
  const [warehouseTransfers, setWarehouseTransfers] = useState<WarehouseTransfer[]>(() => getWarehouseTransfers());


  // Studio Management States
  const [customers, setCustomers] = useState<Customer[]>(() => currentUser ? getCustomers(currentUser.id) : []);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>(() => getServicePackages());
  const [contracts, setContracts] = useState<Contract[]>(() => getContracts());
  const [postProductionProjects, setPostProductionProjects] = useState<PostProductionProject[]>(() => getPostProductionProjects());
  const [studioAssets, setStudioAssets] = useState<StudioAsset[]>(() => getStudioAssets());
  

  const navigateTo = useCallback((state: PageState) => {
    setPageState(state);
    window.scrollTo(0, 0);
  }, []);

  const isAdmin = currentUser?.purchasedPlans.includes('admin') || false;
  
  // --- Cart Handlers ---
  const handleAddToCart = (productId: string, quantity: number) => {
    const newCart = addToCart(productId, quantity);
    setCart(newCart);
    showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const newCart = updateCartQuantity(productId, quantity);
    setCart(newCart);
  };
  
  const handleRemoveFromCart = (productId: string) => {
    const newCart = removeFromCart(productId);
    setCart(newCart);
  };

  // --- Data Update Handlers ---
  const handleUpdateUsers = (newUsers: User[]) => {
    saveUsers(newUsers);
    setUsers(newUsers);
  };

  const handleUpdateSingleUser = (userId: string, updates: Partial<User>) => {
      const newUsers = users.map(u => (u.id === userId ? { ...u, ...updates } : u));
      handleUpdateUsers(newUsers);
      if (currentUser?.id === userId) {
        const updatedCurrentUser = { ...currentUser, ...updates };
        setCurrentUser(updatedCurrentUser);
        sessionStorage.setItem('loggedInUser_v1', JSON.stringify(updatedCurrentUser));
      }
  };
  
  const handleUpdateProducts = (newProducts: Product[]) => {
    saveProducts(newProducts);
    setProducts(newProducts);
  };
  
  const handleUpdatePrices = (newPrices: PricingTable) => {
    savePrices(newPrices);
    setPrices(newPrices);
    showToast('Bảng giá đã được cập nhật!', 'success');
  };
  
  const handleUpdatePlans = (newPlans: PlanDetailsTable) => {
    savePlans(newPlans);
    setPlans(newPlans);
  };

  const handleUpdateProductBases = (newBases: string[]) => {
    saveProductBases(newBases);
    setProductBases(newBases);
  };
  
  const handleUpdateSizes = (newSizes: string[]) => {
    saveSizes(newSizes);
    setSizes(newSizes);
  };
  
  const handleUpdateServiceCategories = (newCategories: string[]) => {
    saveServiceCategories(newCategories);
    setServiceCategories(newCategories);
  };

  const handleUpdateLoyaltySettings = (settings: LoyaltySettings) => {
    saveLoyaltySettings(settings);
    setLoyaltySettings(settings);
    showToast('Cài đặt khách hàng thân thiết đã được cập nhật!', 'success');
  };
  
  const handleUpdateRewards = (newRewards: Reward[]) => {
    saveRewards(newRewards);
    setRewards(newRewards);
  };
  
  const handleUpdateVouchers = (newVouchers: Voucher[]) => {
    saveVouchers(newVouchers);
    setVouchers(newVouchers);
  };

  const handleManualPointUpdate = (userId: string, points: number, reason: string) => {
    const newUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, points: (u.points || 0) + points };
      }
      return u;
    });
    handleUpdateUsers(newUsers);
    showToast(`Đã cập nhật ${points} điểm cho người dùng. Lý do: ${reason}`, 'success');
  };
  
  const handleRedeemReward = (rewardId: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Vui lòng đăng nhập.' };
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return { success: false, message: 'Không tìm thấy phần thưởng.' };
    if ((currentUser.points || 0) < reward.pointsCost) return { success: false, message: 'Bạn không đủ điểm.' };
    
    const updatedUser = { ...currentUser, points: (currentUser.points || 0) - reward.pointsCost };
    handleUpdateSingleUser(currentUser.id, { points: updatedUser.points });

    const newVoucher: Voucher = {
      id: `vouch-${Date.now()}`,
      code: `REDEEM-${currentUser.username.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      createdAt: Date.now(),
      status: 'active',
      rewardId: reward.id,
    };
    handleUpdateVouchers([newVoucher, ...vouchers]);

    return { success: true, message: `Đổi thành công "${reward.description}"! Kiểm tra voucher trong tài khoản.` };
  };

  const handleAddVoucher = (voucherData: Omit<Voucher, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    addVoucherToStore(voucherData);
    setVouchers(getVouchers());
    showToast('Đã tạo voucher khuyến mãi mới!', 'success');
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    addExpense(expenseData);
    setExpenses(getExpenses());
  };

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions'>) => {
    if (!currentUser) return;
    const newCustomer = addCustomerToStore(currentUser.id, customerData);
    setCustomers(prev => [newCustomer, ...prev]);
  };
  
  const handleUpdateCustomer = (customer: Customer) => {
    if (!currentUser) return;
    const updatedCustomers = updateCustomer(currentUser.id, customer);
    setCustomers(updatedCustomers);
  };
  
  const handleAddPaymentToContract = (contractId: string, amount: number, date: string, method: string, notes?: string) => {
    const newPayment = { amount, date, method, notes };
    const updatedContracts = addPaymentToContractStore(contractId, newPayment);
    setContracts(updatedContracts);
  };
  
  const handleUpdatePostProductionProject = (project: PostProductionProject) => {
      updatePpProject(project);
      setPostProductionProjects(getPostProductionProjects());
  };
  
  const handleUpdateStudioAsset = (asset: StudioAsset) => {
      const allAssets = getStudioAssets();
      const exists = allAssets.some(a => a.id === asset.id);
      let updatedAssets;
      if (exists) {
          updatedAssets = allAssets.map(a => a.id === asset.id ? asset : a);
      } else {
          updatedAssets = [asset, ...allAssets];
      }
      saveStudioAssets(updatedAssets);
      setStudioAssets(updatedAssets);
  };

  const handleAddAssetLog = (assetId: string, log: Omit<AssetLog, 'timestamp'>) => {
      addInventoryAssetLog(assetId, log);
      setStudioAssets(getStudioAssets());
  };
  
  const handleUpdateServicePackages = (newPackages: ServicePackage[]) => {
      saveServicePackages(newPackages);
      setServicePackages(newPackages);
  };

  const handleUpdateContracts = (newContracts: Contract[]) => {
      saveContracts(newContracts);
      setContracts(newContracts);
  };

  const handleUpdatePersonnelProfile = (userId: string, profile: PersonnelProfile) => {
      const newProfiles = [...personnelProfiles.filter(p => p.userId !== userId), profile];
      savePersonnelProfiles(newProfiles);
      setPersonnelProfiles(newProfiles);
  };

  const handleUpdateSuppliers = (newSuppliers: Supplier[]) => {
    saveSuppliers(newSuppliers);
    setSuppliers(newSuppliers);
  };

  const handleAddInventoryTransaction = (transaction: Omit<InventoryTransaction, 'id' | 'timestamp'>) => {
    addInventoryTransaction(transaction);
    // Refresh related states
    setInventoryTransactions(getInventoryTransactions());
    setMaterials(getMaterials());
    setSuppliers(getSuppliers());
  };
  
  const handleAddPurchaseOrder = (orderData: Omit<PurchaseOrder, 'id' | 'timestamp'>) => {
      addPurchaseOrder(orderData);
      setPurchaseOrders(getPurchaseOrders());
  };

  const handleUpdatePurchaseOrder = (orderId: string, updates: Partial<PurchaseOrder>) => {
      updatePurchaseOrder(orderId, updates);
      setPurchaseOrders(getPurchaseOrders());
  };

  const handleUpdateWarehouses = (newWarehouses: Warehouse[]) => {
    saveWarehouses(newWarehouses);
    setWarehouses(newWarehouses);
  };

  const handleAddWarehouseTransfer = (transferData: Omit<WarehouseTransfer, 'id' | 'timestamp' | 'status'>) => {
    addWarehouseTransfer(transferData);
    setWarehouseTransfers(getWarehouseTransfers());
    setInventoryTransactions(getInventoryTransactions()); // Refresh transactions
    setMaterials(getMaterials()); // Refresh materials
  };

  const handleCompleteWarehouseTransfer = (transferId: string) => {
    if (!currentUser) return;
    completeWarehouseTransfer(transferId, currentUser.id);
    setWarehouseTransfers(getWarehouseTransfers());
    setInventoryTransactions(getInventoryTransactions());
    setMaterials(getMaterials());
  };

// FIX: Add handler for onApplyAudit
const handleApplyAudit = (updates: { id: string; newStock: number; warehouseId: string }[], notes: string, warehouseId: string) => {
    updates.forEach(update => {
        const material = materials.find(m => m.id === update.id);
        if (material && currentUser) {
            const currentStock = (material.stock || {})[warehouseId] || 0;
            const difference = update.newStock - currentStock;
            if (difference !== 0) {
                handleAddInventoryTransaction({
                    materialId: update.id,
                    type: 'adjustment_audit',
                    quantity: difference,
                    unitPrice: material.unitPrice, 
                    notes: `Kiểm kê tại ${warehouses.find(w => w.id === warehouseId)?.name}: ${notes}`,
                    staffId: currentUser.id,
                    warehouseId: warehouseId,
                });
            }
        }
    });
    showToast('Đã áp dụng kết quả kiểm kê và tạo phiếu điều chỉnh.', 'success');
};


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleUpdatePassword = (oldPassword: string, newPassword: string): { success: boolean, message: string } => {
    if (!currentUser) return { success: false, message: 'Bạn cần đăng nhập.' };
    if (currentUser.password !== oldPassword) return { success: false, message: 'Mật khẩu cũ không đúng.'};

    handleUpdateSingleUser(currentUser.id, { password: newPassword });

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };
  
  const handleLogin = async (username: string, password: string, rememberMe: boolean): Promise<{ success: boolean; message: string }> => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('loggedInUser_v1', JSON.stringify(user));
      addRecentLogin(user.username);
      navigateTo({ page: 'home' });
      setIsAiChatbotOpen(true);
      setIsInitialLogin(true);
      
      localStorage.setItem('lastLoggedInUser_v1', user.username);

      if (rememberMe) {
          localStorage.setItem('rememberedCredentials_v1', JSON.stringify({ username, password }));
      } else {
          localStorage.removeItem('rememberedCredentials_v1');
      }

      return { success: true, message: 'Đăng nhập thành công!' };
    }
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
  };

  const handleGoogleLogin = (credential: string) => {
    try {
        const decoded: any = jwtDecode(credential);
        const { user, isNew } = findOrCreateUserByGoogle(decoded);
        setCurrentUser(user);
        sessionStorage.setItem('loggedInUser_v1', JSON.stringify(user));
        addRecentLogin(user.username);
        setUsers(getUsers());
        navigateTo({ page: 'home' });
        setIsAiChatbotOpen(true);
        setIsInitialLogin(true);
        if (isNew) {
            showToast('Tài khoản của bạn đã được tạo thành công!', 'success');
        }
    } catch (error) {
        console.error("Google login failed", error);
        showToast('Đăng nhập bằng Google thất bại.', 'error');
    }
  };
  
  const handleFaceLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('loggedInUser_v1', JSON.stringify(user));
    addRecentLogin(user.username);
    navigateTo({ page: 'home' });
    setIsAiChatbotOpen(true);
    setIsInitialLogin(true);
    showToast(`Chào mừng ${user.fullName} đã quay trở lại!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('loggedInUser_v1');
    // Keep last logged in user, but remove remembered credentials for security
    const rememberedCreds = localStorage.getItem('rememberedCredentials_v1');
    if (rememberedCreds) {
        try {
            const { password, ...rest } = JSON.parse(rememberedCreds);
            // This logic is now flawed because we're not storing password separately.
            // Correct approach: just remove the whole thing on logout.
        } catch(e) {}
    }
     localStorage.removeItem('rememberedCredentials_v1');

    navigateTo({ page: 'home' });
  };
  
  const handleRegister = async (username: string, password: string, fullName: string, zalo: string, email?: string, referredBy?: string): Promise<{ success: boolean; message: string }> => {
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
    }

    let referralBonusApplied = false;
    let newUsers = [...users];

    if (referredBy) {
        const referrerIndex = newUsers.findIndex(u => u.referralCode.toUpperCase() === referredBy.toUpperCase());
        if (referrerIndex !== -1) {
            const referrer = { ...newUsers[referrerIndex] };
            referrer.points = (referrer.points || 0) + loyaltySettings.referralBonusPoints;
            newUsers[referrerIndex] = referrer;
            referralBonusApplied = true;
        } else {
            showToast('Mã giới thiệu không hợp lệ.', 'error');
        }
    }

    const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        fullName,
        zalo,
        email,
        purchasedPlans: ['free'],
        permissionOverrides: {},
        points: referralBonusApplied ? loyaltySettings.referralBonusPoints : 0,
        referralCode: generateReferralCode(),
        referredBy: referralBonusApplied ? referredBy.toUpperCase() : undefined,
        createdAt: Date.now(),
    };

    newUsers.push(newUser);
    handleUpdateUsers(newUsers);
    
    return { success: true, message: 'Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.' };
  };

  const handlePurchaseRequest = (planId: PlanId) => {
    if (!currentUser) {
        navigateTo({ page: 'login' });
        return;
    }
    setPaymentPlan(planId);
  };

  const handleSinglePhotoDownloadRequest = (imageUrl: string) => {
    if (!imageUrl) {
        showToast('Lỗi: không tìm thấy ảnh gốc.', 'error');
        return;
    }
    setImageToDownloadUrl(imageUrl);
    setPaymentPlan('single_photo_download');
  };
  
  const handlePrintRequest = (imageUrl: string, sourceTool: string) => {
    setPrintOrderData({ imageUrl, sourceTool });
    setIsPrintOrderModalOpen(true);
  };

  const handlePrintRequestWithLoginCheck = (imageUrl: string, sourceTool: string) => {
    if (!currentUser) {
        showToast('Vui lòng đăng nhập để gửi yêu cầu in.', 'info');
        navigateTo({ page: 'login' });
        return;
    }
    handlePrintRequest(imageUrl, sourceTool);
  };

  const handlePrintOrderSubmit = (orderDetails: PrintOrderDetails) => {
    if (!printOrderData || !currentUser) return;
    addPrintRequest({
        imageUrl: printOrderData.imageUrl,
        sourceTool: printOrderData.sourceTool,
        userId: currentUser.id,
        username: currentUser.username,
        orderDetails,
    });
    setPrintOrderData(null);
    setIsPrintOrderModalOpen(false);
    showToast('Đã gửi yêu cầu in thành công!', 'success');
    setPrintRequests(getPrintRequests());
  };
  
  const renderTool = (toolId: string) => {
    // Open access for all users, including guests
    switch (toolId) {
      case 'introduction': return <Introduction navigateTo={navigateTo} currentUser={currentUser} />;
      case 'idPhoto': return <IdPhotoGenerator currentUser={currentUser} onPrintRequest={handlePrintRequestWithLoginCheck} onSinglePhotoDownloadRequest={handleSinglePhotoDownloadRequest} />;
      case 'photoRestorer': return <PhotoRestorer currentUser={currentUser} onPrintRequest={handlePrintRequestWithLoginCheck} onSinglePhotoDownloadRequest={handleSinglePhotoDownloadRequest} />;
      case 'proAiRelight': return <ProAiRelight currentUser={currentUser} onPrintRequest={handlePrintRequestWithLoginCheck} />;
      case 'imageGenerator': return <ImageGenerator currentUser={currentUser} onPrintRequest={handlePrintRequestWithLoginCheck} />;
      case 'conceptPhoto': return <ConceptPhotoGenerator currentUser={currentUser} onPrintRequest={handlePrintRequestWithLoginCheck} />;
      case 'familyPhotoComposer': return <FamilyPhotoComposer currentUser={currentUser} onPrintRequest={handlePrintRequestWithLoginCheck} />;
      case 'socialMediaPostGenerator': return <SocialMediaPostGenerator currentUser={currentUser} />;
      // FIX: Add onSinglePhotoDownloadRequest to PhotoLab
      case 'photoLab': return <PhotoLab currentUser={currentUser} onPrintRequest={handlePrintRequestWithLoginCheck} onSinglePhotoDownloadRequest={handleSinglePhotoDownloadRequest} />;
      case 'batchColorCorrector': return <BatchColorCorrector currentUser={currentUser} onPrintRequest={handlePrintRequestWithLoginCheck} />;
      default: 
        return <Introduction navigateTo={navigateTo} currentUser={currentUser} />;
    }
  };
  
    // --- Admin Action Handlers ---
    const handleAddUser = async (username: string, password: string, plan: PlanId, fullName: string, zalo: string, isVip: boolean, email?: string, referredBy?: string): Promise<{ success: boolean; message: string }> => {
        const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (existing) return { success: false, message: 'Tên đăng nhập đã tồn tại.' };

        const newUser: User = {
            id: `user-${Date.now()}`,
            username, password, fullName, zalo, email,
            purchasedPlans: [plan],
            permissionOverrides: {},
            isVipCustomer: isVip,
            points: 0,
            referralCode: generateReferralCode(),
            createdAt: Date.now(),
        };
        handleUpdateUsers([...users, newUser]);
        showToast('Thêm thành viên mới thành công!', 'success');
        return { success: true, message: 'Thành công' };
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa thành viên này?')) {
            handleUpdateUsers(users.filter(u => u.id !== userId));
            showToast('Đã xóa thành viên.', 'success');
        }
    };

    const handleConfirmPayment = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user && user.pendingPayment) {
            handleUpdateSingleUser(userId, {
                purchasedPlans: [...user.purchasedPlans, user.pendingPayment.planId],
                pendingPayment: undefined
            });
            showToast('Xác nhận thanh toán thành công!', 'success');
        }
    };
    
    const handleRejectPayment = (userId: string) => {
        handleUpdateSingleUser(userId, { pendingPayment: undefined });
        showToast('Đã từ chối thanh toán.', 'info');
    };

    const handleLabUpdateRequest = (requestId: string, updates: Partial<Omit<PrintRequest, 'id'>>, actionDescription: string) => {
        if (!currentUser) return;
        updatePrintRequest(requestId, updates, currentUser, actionDescription);
        setPrintRequests(getPrintRequests()); // Refresh
    };
    
    const handleApplyVoucher = async (requestId: string, voucherCode: string): Promise<{ success: boolean; message: string; }> => {
        const request = printRequests.find(r => r.id === requestId);
        const voucher = vouchers.find(v => v.code.toUpperCase() === voucherCode.toUpperCase() && v.status === 'active');

        if (!request) return { success: false, message: 'Không tìm thấy đơn hàng.' };
        if (!voucher) return { success: false, message: 'Mã voucher không hợp lệ hoặc đã hết hạn.' };

        let discountAmount = 0;
        let freeProductItems: ManualOrderItem[] = [];
        
        if(voucher.rewardId) { // Redeemed reward
            const reward = rewards.find(r => r.id === voucher.rewardId);
            if (!reward) return { success: false, message: 'Lỗi: Không tìm thấy phần thưởng tương ứng.'};
            if(reward.type === 'discount') {
                discountAmount = reward.value as number;
            } else if (reward.type === 'product') {
                const product = products.find(p => p.id === reward.value);
                if(product) {
                    freeProductItems.push({ productCode: product.id, productName: `${product.name} (Quà tặng)`, size: '', quantity: 1, unitPrice: 0 });
                }
            }
        } else { // Promo campaign voucher
            if(voucher.discountType === 'fixed_amount') {
                discountAmount = voucher.discountValue || 0;
            } else if (voucher.discountType === 'percentage') {
                discountAmount = (request.totalAmount || 0) * (voucher.discountValue || 0) / 100;
            }
        }

        const updatedRequest = { ...request, voucherCode, discountAmount, freeProductItems };
        updatePrintRequest(requestId, updatedRequest, currentUser, `Áp dụng voucher ${voucherCode}`);
        setPrintRequests(getPrintRequests());

        const updatedVoucher = {...voucher, status: 'used' as 'used'};
        handleUpdateVouchers(vouchers.map(v => v.id === updatedVoucher.id ? updatedVoucher : v));

        return { success: true, message: `Áp dụng voucher thành công! Giảm ${formatCurrency(discountAmount)}` };
    };
    
    const handleAddTimeClockEntry = (userId: string, type: 'clock_in' | 'clock_out', photoDataUrl: string) => {
        addTimeClockEntry({ userId, type, photoDataUrl, timestamp: Date.now() });
        setTimeClockEntries(getTimeClockEntries());
        showToast(`Đã chấm công ${type === 'clock_in' ? 'vào' : 'ra'} thành công!`, 'success');
        navigateTo({ page: 'user_management' }); // Go back to admin to see the log
    };


  const isFullScreenPage = pageState.page === 'wedding_manager' || pageState.page === 'studio_hub';

  const renderContent = () => {
    switch (pageState.page) {
      case 'home': return <HomePage navigateTo={navigateTo} isAdminMode={isAdmin} currentUser={currentUser} prices={prices} products={products} />;
      case 'login': return <LoginPage onLogin={handleLogin} navigateTo={navigateTo} onGoogleLogin={handleGoogleLogin} onFaceLogin={handleFaceLogin} users={users} />;
      case 'register': return <RegisterPage onRegister={handleRegister} navigateTo={navigateTo} onGoogleLogin={handleGoogleLogin} />;
      case 'tool': return renderTool(pageState.toolId);
      case 'service': return <ServicePage serviceId={pageState.serviceId} navigateTo={navigateTo} isAdminMode={isAdmin} currentUser={currentUser} prices={prices} products={products} />;
      case 'product': return <ProductPage productId={pageState.productId} serviceId={pageState.serviceId} navigateTo={navigateTo} isAdminMode={isAdmin} currentUser={currentUser} prices={prices} products={products} onAddToCart={handleAddToCart} />;
      case 'blog': return <BlogPage navigateTo={navigateTo} />;
      case 'blog_post': return <BlogPostPage postId={pageState.postId} navigateTo={navigateTo} />;
      case 'pricing': return <PricingPage currentUser={currentUser} onPurchaseRequest={handlePurchaseRequest} navigateTo={navigateTo} plans={plans} />;
      case 'promotions': return <PromotionsPage navigateTo={navigateTo} isAdminMode={isAdmin} />;
      case 'user_management': return isAdmin && <UserManagementPage 
        users={users} 
        currentUser={currentUser}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdateUser={handleUpdateSingleUser}
        onConfirmPayment={handleConfirmPayment}
        onRejectPayment={handleRejectPayment}
        navigateTo={navigateTo}
        personnelProfiles={personnelProfiles}
        onUpdatePersonnelProfile={handleUpdatePersonnelProfile}
        loyaltySettings={loyaltySettings}
        onUpdateLoyaltySettings={handleUpdateLoyaltySettings}
        onManualPointUpdate={handleManualPointUpdate}
        rewards={rewards}
        onUpdateRewards={handleUpdateRewards}
        products={products}
        bankAccounts={bankAccounts}
        onUpdateBankAccounts={(b) => { saveBankAccounts(b); setBankAccounts(b); }}
        materials={materials}
        onUpdateMaterials={(m) => { saveMaterials(m); setMaterials(m); }}
        productBOMs={productBOMs}
        onUpdateProductBOMs={(b) => { saveProductBOMs(b); setProductBOMs(b); }}
        timeClockEntries={timeClockEntries}
        requests={printRequests}
        expenses={expenses}
        onAddExpense={handleAddExpense}
        suppliers={suppliers}
        onUpdateSuppliers={handleUpdateSuppliers}
        transactions={inventoryTransactions}
        onAddTransaction={handleAddInventoryTransaction}
        sizes={sizes}
        purchaseOrders={purchaseOrders}
        onAddPurchaseOrder={handleAddPurchaseOrder}
        onUpdatePurchaseOrder={handleUpdatePurchaseOrder}
        warehouses={warehouses}
        onUpdateWarehouses={handleUpdateWarehouses}
        warehouseTransfers={warehouseTransfers}
        onAddWarehouseTransfer={handleAddWarehouseTransfer}
        onCompleteWarehouseTransfer={handleCompleteWarehouseTransfer}
        onApplyAudit={handleApplyAudit}
      />;
      case 'print_queue': return isAdmin && <PrintQueuePage navigateTo={navigateTo} />;
      case 'print_order': return <PrintOrderPage requestId={pageState.requestId} navigateTo={navigateTo} />;
      case 'main_products': return <MainProductsPage navigateTo={navigateTo} isAdminMode={isAdmin} />;
      case 'pricing_management': return isAdmin && <PricingManagementPage navigateTo={navigateTo} prices={prices} onUpdatePrices={handleUpdatePrices} products={products} />;
      case 'plan_management': return isAdmin && <PlanManagementPage navigateTo={navigateTo} plans={plans} onUpdatePlans={handleUpdatePlans} />;
      case 'product_management': return isAdmin && <ProductManagementPage products={products} onUpdateProducts={handleUpdateProducts} navigateTo={navigateTo} productBases={productBases} sizes={sizes} serviceCategories={serviceCategories} materials={materials} productBOMs={productBOMs} onUpdateProductBOMs={(b) => { saveProductBOMs(b); setProductBOMs(b);}} />;
      case 'catalog_management': return isAdmin && <CatalogManagementPage productBases={productBases} sizes={sizes} serviceCategories={serviceCategories} onUpdateProductBases={handleUpdateProductBases} onUpdateSizes={handleUpdateSizes} onUpdateServiceCategories={handleUpdateServiceCategories} navigateTo={navigateTo} />;
      // FIX: Wrap onUpdateUser to match expected signature
      case 'my_account': return currentUser && <MyAccountPage currentUser={currentUser} rewards={rewards} vouchers={vouchers.filter(v => v.userId === currentUser.id)} products={products} onRedeemReward={handleRedeemReward} onUpdateUser={(updates) => handleUpdateSingleUser(currentUser.id, updates)} onUpdatePassword={handleUpdatePassword} />;
      case 'inventory_management': return isAdmin && currentUser && <InventoryManagementPage navigateTo={navigateTo} materials={materials} onUpdateMaterials={(m) => { saveMaterials(m); setMaterials(m); }} onApplyAudit={handleApplyAudit} currentUser={currentUser} suppliers={suppliers} onUpdateSuppliers={handleUpdateSuppliers} transactions={inventoryTransactions} onAddTransaction={handleAddInventoryTransaction} sizes={sizes} purchaseOrders={purchaseOrders} onAddPurchaseOrder={handleAddPurchaseOrder} onUpdatePurchaseOrder={handleUpdatePurchaseOrder} warehouses={warehouses} onUpdateWarehouses={handleUpdateWarehouses} warehouseTransfers={warehouseTransfers} onAddWarehouseTransfer={handleAddWarehouseTransfer} onCompleteWarehouseTransfer={handleCompleteWarehouseTransfer}/>;
      case 'time_clock': return currentUser && <TimeClockPage currentUser={currentUser} onAddTimeClockEntry={handleAddTimeClockEntry} />;
      case 'lab_operation': return currentUser && (currentUser.operationalRole || isAdmin) && <LabOperationPage currentUser={currentUser} requests={printRequests} onUpdateRequest={handleLabUpdateRequest} navigateTo={navigateTo} onRefreshRequests={() => setPrintRequests(getPrintRequests())} prices={prices} users={users} products={products} onApplyVoucher={handleApplyVoucher} bankAccounts={bankAccounts} expenses={expenses} materials={materials} productBOMs={productBOMs} />;
      case 'schedule': return currentUser && (currentUser.operationalRole === 'tong_giam_doc' || isAdmin) && <SchedulePage currentUser={currentUser}/>;
      case 'community': return currentUser && <CommunityPage currentUser={currentUser} users={users} navigateTo={navigateTo} initialSelectedUserId={pageState.selectedUserId} requests={printRequests} />;
      case 'studio_hub': return currentUser && (isAdmin || currentUser.operationalRole) && ( <StudioManagementHub onSelectManager={(manager) => { if (manager === 'wedding') { navigateTo({ page: 'wedding_manager' }); } }} /> );
      case 'wedding_manager': return currentUser && (isAdmin || currentUser.operationalRole) && (
          <WeddingStudioManager 
              currentUser={currentUser}
              onBackToHub={() => navigateTo({ page: 'studio_hub'})}
              customers={customers}
              onUpdateCustomer={handleUpdateCustomer}
              onAddCustomer={handleAddCustomer}
              studioStaff={studioStaff}
              servicePackages={servicePackages}
              contracts={contracts}
              onUpdatePackages={handleUpdateServicePackages}
              onUpdateContracts={handleUpdateContracts}
              onAddPayment={handleAddPaymentToContract}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              personnelProfiles={personnelProfiles}
              timeClockEntries={timeClockEntries}
              onUpdatePersonnelProfile={handleUpdatePersonnelProfile}
              postProductionProjects={postProductionProjects}
              onUpdatePostProductionProject={handleUpdatePostProductionProject}
              studioAssets={studioAssets}
              onUpdateStudioAsset={handleUpdateStudioAsset}
              onAddAssetLog={handleAddAssetLog}
              vouchers={vouchers}
              onAddVoucher={handleAddVoucher}
              products={products}
              materials={materials}
              productBOMs={productBOMs}
              requests={printRequests}
              onUpdateUser={handleUpdateSingleUser}
              users={users}
          />
      );
      case 'search_results': return <SearchResultsPage query={pageState.query} products={products} navigateTo={navigateTo} prices={prices} currentUser={currentUser} />;
      case 'cart': return <CartPage cart={cart} products={products} onUpdateQuantity={handleUpdateCartQuantity} onRemove={handleRemoveFromCart} navigateTo={navigateTo} prices={prices} currentUser={currentUser} />;
      default: return <HomePage navigateTo={navigateTo} isAdminMode={isAdmin} currentUser={currentUser} prices={prices} products={products} />;
    }
  };
  
  return (
    <div className={`${theme}`}>
      <div className={`bg-emerald-50 dark:bg-emerald-950 text-slate-800 dark:text-zinc-200 ${isFullScreenPage ? 'h-screen' : 'min-h-screen'}`}>
        {!isFullScreenPage && <Header 
            currentUser={currentUser}
            handleLogout={handleLogout}
            navigateTo={navigateTo}
            theme={theme}
            toggleTheme={toggleTheme}
            isAdmin={isAdmin}
            newPrintRequestsCount={printRequests.filter(r => r.status === 'new').length}
            pageState={pageState}
            cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        />}

        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader /></div>}>
            {renderContent()}
        </Suspense>

        {paymentPlan && (
            <PaymentModal
                planId={paymentPlan}
                onClose={() => setPaymentPlan(null)}
                plans={plans}
                bankAccounts={bankAccounts}
                onBillSubmit={(planId, billUrl) => {
                    if (planId === 'single_photo_download') {
                        if (imageToDownloadUrl) {
                            const link = document.createElement('a');
                            link.href = imageToDownloadUrl;
                            link.download = `thaoanhphotolab-${Date.now()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            showToast('Thanh toán thành công! Ảnh của bạn đang được tải về.', 'success');
                            
                            setImageToDownloadUrl(null);
                            setPaymentPlan(null);
                        } else {
                            showToast('Lỗi: Không tìm thấy ảnh để tải về.', 'error');
                            setPaymentPlan(null);
                        }
                    } else if (currentUser) {
                        handleUpdateSingleUser(currentUser.id, { pendingPayment: { planId, hasBill: true } });
                        showToast('Đã gửi bill thành công! Quản trị viên sẽ sớm xác nhận.', 'success');
                        setPaymentPlan(null);
                    }
                }}
            />
        )}

        {isPrintOrderModalOpen && printOrderData && (
          <PrintOrderPage
            imageUrl={printOrderData.imageUrl}
            sourceTool={printOrderData.sourceTool}
            currentUser={currentUser}
            onClose={() => setIsPrintOrderModalOpen(false)}
            onSubmit={handlePrintOrderSubmit}
          />
        )}
        
        {!isFullScreenPage && isAiChatbotOpen && <AiChatbot onClose={() => setIsAiChatbotOpen(false)} isInitialLogin={isInitialLogin} currentUser={currentUser} />}
        
        {!isFullScreenPage && !isAiChatbotOpen && (
             <button
                onClick={() => setIsAiChatbotOpen(true)}
                className="fixed bottom-4 right-4 z-[99] w-16 h-16 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-transform hover:scale-110 animate-subtle-bob"
            >
                <AiAssistantIcon className="w-8 h-8"/>
            </button>
        )}

        {!isFullScreenPage && <Footer />}
        {!isFullScreenPage && <ContactFAB />}
        <ToastContainer />
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
