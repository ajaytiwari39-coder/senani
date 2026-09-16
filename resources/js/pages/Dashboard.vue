<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
    Building2,
    ShieldCheck,
    Users,
    Receipt,
    Calendar,
    Clock,
    Lock,
    Unlock,
    LogOut,
    CheckCircle2,
    Sparkles,
    Database,
    Server,
    Activity,
    BedDouble,
    Search,
    Bell,
    Menu,
    X,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronRight,
    ChevronDown,
    Plus,
    Printer,
    Download,
    CreditCard,
    Smartphone,
    Wallet,
    TrendingUp,
    ArrowUpRight,
    Filter,
    Utensils,
    Phone,
    Mail,
    MapPin,
    FileText,
    SlidersHorizontal,
    Check,
    Copy,
    Share2,
    ExternalLink,
    Eye,
    Trash2,
    AlertTriangle
} from '@lucide/vue';
import { home } from '@/routes';
import InquiryWizardModal, { type BanquetInquiry } from '@/components/banquet/InquiryWizardModal.vue';
import { downloadElementAsPdf } from '@/components/banquet/printService';
import { buildGuestPortalUrl, getInquiryFinancials } from '@/components/banquet/guestShare';

defineOptions({
    layout: null,
});

const page = usePage();
const user = page.props.auth?.user || { name: 'Super Admin', email: 'admin@senani.com', role: 'superadmin' };

export type UserRole = 'reception' | 'manager' | 'md' | 'superadmin';

// Real authenticated role ceiling from database / session
const authenticatedRole = computed<UserRole>(() => {
    const raw = (user as any)?.role;
    if (raw === 'reception' || raw === 'manager' || raw === 'md' || raw === 'superadmin') return raw;
    return 'superadmin';
});

// Enforce that activeRole can never exceed the permissions granted by authenticatedRole
const sanitizeRole = (roleCandidate?: string | null): UserRole => {
    const authRole = authenticatedRole.value;
    if (authRole === 'reception') return 'reception';
    if (authRole === 'manager') {
        if (roleCandidate === 'reception') return 'reception';
        return 'manager'; // Manager can never exceed Step 2
    }
    if (authRole === 'md') {
        if (roleCandidate === 'reception' || roleCandidate === 'manager' || roleCandidate === 'md') return roleCandidate;
        return 'md';
    }
    // Superadmin can view/simulate all roles
    if (roleCandidate === 'reception' || roleCandidate === 'manager' || roleCandidate === 'md' || roleCandidate === 'superadmin') {
        return roleCandidate;
    }
    return 'superadmin';
};

const activeRole = ref<UserRole>(
    sanitizeRole(typeof window !== 'undefined' ? localStorage.getItem('senani_active_role') : null)
);

const setRole = (r: UserRole) => {
    const valid = sanitizeRole(r);
    activeRole.value = valid;
    if (typeof window !== 'undefined') {
        localStorage.setItem('senani_active_role', valid);
    }
    if ((valid === 'manager' || valid === 'superadmin') && typeof checkManagerPendingAlerts === 'function') {
        checkManagerPendingAlerts();
    }
};

const roleLabels: Record<UserRole, { title: string; badge: string; stepAccess: string; colorClass: string; bgClass: string }> = {
    reception: {
        title: 'Reception Front Desk',
        badge: 'Step 1 Access',
        stepAccess: 'Reception Intake Only (Step 1)',
        colorClass: 'text-amber-800',
        bgClass: 'bg-amber-50 border-amber-200'
    },
    manager: {
        title: 'Banquet Operations Manager',
        badge: 'Step 1 & 2 Access',
        stepAccess: 'Intake + Costing & Catalog (Step 1 & 2)',
        colorClass: 'text-blue-800',
        bgClass: 'bg-blue-50 border-blue-200'
    },
    md: {
        title: 'Managing Director (MD Sir)',
        badge: 'Full Access & Finalize',
        stepAccess: 'Full Access, Approval & Final Seal (Steps 1, 2, 3)',
        colorClass: 'text-purple-800',
        bgClass: 'bg-purple-50 border-purple-200'
    },
    superadmin: {
        title: 'Super Administrator',
        badge: 'Full Control & Delete Rights',
        stepAccess: 'Full Access (Steps 1, 2, 3) + Delete/Purge Inquiries',
        colorClass: 'text-rose-800',
        bgClass: 'bg-rose-50 border-rose-200'
    }
};

const logout = () => {
    router.post('/logout');
};

// -------------------------------------------------------------
// Active Tab State (0ms SPA Instant Transition)
// -------------------------------------------------------------
type AdminTab = 'dashboard' | 'rooms' | 'banquet' | 'billing' | 'invoices' | 'guests' | 'security';
const queryTab = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('tab') as AdminTab) : null;
const currentTab = ref<AdminTab>(queryTab || 'dashboard');
const isMobileMenuOpen = ref(false);
const isSidebarCollapsed = ref(typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('collapsed') === 'true' || localStorage.getItem('senani_sidebar_collapsed') === 'true'));
const toggleSidebarCollapse = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    if (typeof window !== 'undefined') {
        localStorage.setItem('senani_sidebar_collapsed', String(isSidebarCollapsed.value));
    }
};
const searchQuery = ref('');
const activeDateFilter = ref<'today' | 'week' | 'month'>('today');

// -------------------------------------------------------------
// Interactive Data: Room Rack Matrix
// -------------------------------------------------------------
interface RoomItem {
    id: number;
    number: string;
    floor: number;
    category: 'Deluxe' | 'Super Deluxe' | 'Executive Suite' | 'Presidential Suite';
    status: 'available' | 'occupied' | 'cleaning' | 'reserved';
    pricePerNight: number;
    guestName?: string;
    checkIn?: string;
    checkOut?: string;
}

const rooms = ref<RoomItem[]>([
    { id: 101, number: '101', floor: 1, category: 'Deluxe', status: 'available', pricePerNight: 2800 },
    { id: 102, number: '102', floor: 1, category: 'Deluxe', status: 'available', pricePerNight: 2800 },
    { id: 103, number: '103', floor: 1, category: 'Deluxe', status: 'available', pricePerNight: 2800 },
    { id: 104, number: '104', floor: 1, category: 'Deluxe', status: 'available', pricePerNight: 2800 },
    { id: 105, number: '105', floor: 1, category: 'Deluxe', status: 'available', pricePerNight: 2800 },
    { id: 106, number: '106', floor: 1, category: 'Deluxe', status: 'available', pricePerNight: 2800 },
    { id: 201, number: '201', floor: 2, category: 'Super Deluxe', status: 'available', pricePerNight: 4200 },
    { id: 202, number: '202', floor: 2, category: 'Super Deluxe', status: 'available', pricePerNight: 4200 },
    { id: 203, number: '203', floor: 2, category: 'Super Deluxe', status: 'available', pricePerNight: 4200 },
    { id: 204, number: '204', floor: 2, category: 'Super Deluxe', status: 'available', pricePerNight: 4200 },
    { id: 205, number: '205', floor: 2, category: 'Super Deluxe', status: 'available', pricePerNight: 4200 },
    { id: 206, number: '206', floor: 2, category: 'Super Deluxe', status: 'available', pricePerNight: 4200 },
    { id: 301, number: '301', floor: 3, category: 'Executive Suite', status: 'available', pricePerNight: 7500 },
    { id: 302, number: '302', floor: 3, category: 'Executive Suite', status: 'available', pricePerNight: 7500 },
    { id: 303, number: '303', floor: 3, category: 'Presidential Suite', status: 'available', pricePerNight: 12500 },
    { id: 304, number: '304', floor: 3, category: 'Presidential Suite', status: 'available', pricePerNight: 12500 },
]);

const roomFloorFilter = ref<number | 'all'>('all');
const roomStatusFilter = ref<string>('all');

const filteredRooms = computed(() => {
    return rooms.value.filter(room => {
        const matchesFloor = roomFloorFilter.value === 'all' || room.floor === roomFloorFilter.value;
        const matchesStatus = roomStatusFilter.value === 'all' || room.status === roomStatusFilter.value;
        const matchesSearch = !searchQuery.value ||
            room.number.includes(searchQuery.value) ||
            room.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (room.guestName && room.guestName.toLowerCase().includes(searchQuery.value.toLowerCase()));
        return matchesFloor && matchesStatus && matchesSearch;
    });
});

const roomStats = computed(() => {
    const total = rooms.value.length;
    const occupied = rooms.value.filter(r => r.status === 'occupied').length;
    const available = rooms.value.filter(r => r.status === 'available').length;
    const cleaning = rooms.value.filter(r => r.status === 'cleaning').length;
    const reserved = rooms.value.filter(r => r.status === 'reserved').length;
    const occupancyRate = Math.round((occupied / total) * 100);
    return { total, occupied, available, cleaning, reserved, occupancyRate };
});

const updateRoomStatus = (roomId: number, newStatus: RoomItem['status']) => {
    const room = rooms.value.find(r => r.id === roomId);
    if (room) {
        room.status = newStatus;
        if (newStatus === 'available') {
            delete room.guestName;
            delete room.checkIn;
            delete room.checkOut;
        }
    }
};

// -------------------------------------------------------------
// Interactive Data: Banquet Halls & Bookings
// -------------------------------------------------------------
interface BanquetBooking {
    id: string;
    hallName: 'Grand Ballroom' | 'Sapphire Hall' | 'Royal Lawn & Terrace';
    eventName: string;
    clientName: string;
    phone: string;
    date: string;
    slot: 'Morning (10 AM - 4 PM)' | 'Evening (7 PM - 1 AM)';
    paxCount: number;
    plateRate: number;
    totalAmount: number;
    advancePaid: number;
    balanceDue: number;
    status: 'confirmed' | 'draft' | 'settled';
}

const banquetBookings = ref<BanquetBooking[]>([]);

// -------------------------------------------------------------
// 3-Stage Event Inquiry Pipeline (Physical Voucher Slip Replica)
// -------------------------------------------------------------
const queryInquiry = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('inquiry') === 'true';
const queryStep = typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('step')) || 1 : 1;
const queryPrint = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('print') === 'true';
const showInquiryModal = ref(queryInquiry);
const selectedInquiry = ref<BanquetInquiry | null>(null);
const inquiryDefaultStep = ref(queryStep);

const banquetInquiries = ref<BanquetInquiry[]>([]);

// Dynamic sequential voucher number calculated from existing inquiries (e.g. 101, 102, ...)
const nextVoucherNo = computed(() => {
    const nums = banquetInquiries.value
        .map(i => parseInt(String(i.voucherNo), 10))
        .filter(n => !isNaN(n) && n > 0 && n < 100000);
    if (nums.length > 0) {
        return String(Math.max(...nums) + 1);
    }
    return '101';
});

const inquiryOpenPrintPreview = ref(queryPrint);

const openNewInquiry = (step: number = 1) => {
    selectedInquiry.value = null;
    const maxAllowed = activeRole.value === 'reception' ? 1 : (activeRole.value === 'manager' ? 2 : 3);
    inquiryDefaultStep.value = Math.min(step, maxAllowed);
    inquiryOpenPrintPreview.value = false;
    showInquiryModal.value = true;
};

const openExistingInquiry = (inq: BanquetInquiry, step: number = 1, printPreview: boolean = false) => {
    selectedInquiry.value = inq;
    const maxAllowed = activeRole.value === 'reception' ? 1 : (activeRole.value === 'manager' ? 2 : 3);
    inquiryDefaultStep.value = Math.min(step, maxAllowed);
    inquiryOpenPrintPreview.value = printPreview;
    showInquiryModal.value = true;
};

const openAndPrintInquiry = (inq: BanquetInquiry) => {
    const defaultStepForRole = activeRole.value === 'reception' ? 1 : (activeRole.value === 'manager' ? 2 : 3);
    openExistingInquiry(inq, defaultStepForRole, true);
};

const guestLinkCopiedVoucher = ref<string | null>(null);

const copyGuestLinkForVoucher = async (voucherNo: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
        const inq = banquetInquiries.value.find(i => String(i.voucherNo) === String(voucherNo));
        const url = inq ? buildGuestPortalUrl(window.location.origin, inq) : `${window.location.origin}/guest/menu-selection?v=${voucherNo}`;
        await navigator.clipboard.writeText(url);
        guestLinkCopiedVoucher.value = voucherNo;
        setTimeout(() => {
            guestLinkCopiedVoucher.value = null;
        }, 2000);
    }
};

const toggleInquiryLock = (inq: BanquetInquiry) => {
    inq.isLocked = !inq.isLocked;
    if (inq.isLocked) {
        inq.lockedAt = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        inq.lockedBy = 'Banquet Manager';
    } else {
        inq.lockedAt = undefined;
        inq.lockedBy = undefined;
    }
    handleSaveInquiry(inq);
};

// -------------------------------------------------------------
// Banquet Manager Reception Handover Notifications & System
// -------------------------------------------------------------
const showNotificationDropdown = ref(false);
const readNotificationVouchers = ref<string[]>([]);

const pendingManagerInquiries = computed(() => {
    return banquetInquiries.value.filter(i => i.status === 'pending_manager');
});

const unreadManagerNotifications = computed(() => {
    return pendingManagerInquiries.value.filter(i => !readNotificationVouchers.value.includes(String(i.voucherNo)));
});

const markNotificationAsRead = (voucherNo: string | number) => {
    const v = String(voucherNo);
    if (!readNotificationVouchers.value.includes(v)) {
        readNotificationVouchers.value.push(v);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('senani_read_manager_vouchers', JSON.stringify(readNotificationVouchers.value));
            } catch (e) {
                console.error('Error saving read vouchers', e);
            }
        }
    }
};

const markAllNotificationsAsRead = () => {
    readNotificationVouchers.value = pendingManagerInquiries.value.map(i => String(i.voucherNo));
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('senani_read_manager_vouchers', JSON.stringify(readNotificationVouchers.value));
        } catch (e) {
            console.error('Error saving read vouchers', e);
        }
    }
};

const openInquiryFromNotification = (inq: BanquetInquiry) => {
    markNotificationAsRead(inq.voucherNo);
    showNotificationDropdown.value = false;
    currentTab.value = 'banquet';
    openExistingInquiry(inq, 2);
};

const openVoucherByNumber = (vNo: string) => {
    const found = banquetInquiries.value.find(i => String(i.voucherNo) === String(vNo));
    if (found) {
        openInquiryFromNotification(found);
    }
};

// Lightweight In-App Floating Toasts & Web Audio Beep
interface DashboardToast {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning';
    voucherNo?: string;
}
const activeToasts = ref<DashboardToast[]>([]);

const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info', voucherNo?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    activeToasts.value.push({ id, title, message, type, voucherNo });
    setTimeout(() => {
        activeToasts.value = activeToasts.value.filter(t => t.id !== id);
    }, 6000);
};

const playNotificationChime = () => {
    try {
        if (typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                const ctx = new AudioContextClass();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            }
        }
    } catch (e) {
        // audio policy ignored safely
    }
};

const checkManagerPendingAlerts = () => {
    if (unreadManagerNotifications.value.length > 0) {
        showToast(
            '🔔 Reception Handovers Pending',
            `You have ${unreadManagerNotifications.value.length} inquiry intake(s) from Reception awaiting Step 2 costing.`,
            'warning'
        );
        playNotificationChime();
    }
};

// -------------------------------------------------------------
// Central Server Database Synchronization Engine
// -------------------------------------------------------------
let pollTimer: any = null;
const isSyncingServer = ref(false);

const fetchInquiriesFromServer = async () => {
    if (typeof window === 'undefined') return;
    try {
        const res = await fetch('/api/banquet-inquiries', {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!res.ok) return;
        const result = await res.json();
        if (result && result.success && Array.isArray(result.data)) {
            // Filter out any legacy test data from earlier verification
            const serverList: BanquetInquiry[] = result.data.filter(
                (i: BanquetInquiry) => !(String(i.voucherNo) === '250' && (i.guestName || '').toLowerCase().includes('rajesh'))
            );
            
            // Detect newly arrived manager handovers from other users/devices
            const oldVouchers = new Set(banquetInquiries.value.map(i => String(i.voucherNo)));
            const newHandovers = serverList.filter(i => i.status === 'pending_manager' && !oldVouchers.has(String(i.voucherNo)));

            banquetInquiries.value = serverList;
            try {
                localStorage.setItem('senani_banquet_inquiries', JSON.stringify(serverList));
            } catch (e) {
                console.warn('LocalStorage quota exceeded or unavailable', e);
            }

            if (newHandovers.length > 0 && (activeRole.value === 'manager' || activeRole.value === 'superadmin')) {
                const latest = newHandovers[0];
                showToast(
                    '🔔 New Reception Handover!',
                    `Slip #${latest.voucherNo} for ${latest.guestName || 'Guest'} (${latest.paxGuaranteed || latest.paxExpected || 0} Pax) was forwarded by Reception.`,
                    'warning',
                    String(latest.voucherNo)
                );
                playNotificationChime();
            }
        }
    } catch (err) {
        console.error('Error fetching banquet inquiries from central server', err);
    }
};

const batchSyncInquiriesToServer = async (inquiriesToSync: BanquetInquiry[]) => {
    if (inquiriesToSync.length === 0) return;
    try {
        const res = await fetch('/api/banquet-inquiries/batch-sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ inquiries: inquiriesToSync })
        });
        if (res.ok) {
            const result = await res.json();
            if (result && result.data && Array.isArray(result.data)) {
                banquetInquiries.value = result.data;
                try {
                    localStorage.setItem('senani_banquet_inquiries', JSON.stringify(result.data));
                } catch (e) {}
            }
        }
    } catch (err) {
        console.error('Error syncing local inquiries to server database', err);
    }
};

const saveInquiryToServer = async (inq: BanquetInquiry) => {
    try {
        await fetch('/api/banquet-inquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(inq)
        });
    } catch (err) {
        console.error('Error persisting inquiry to server database', err);
    }
};

const deleteInquiryFromServer = async (voucherNo: string) => {
    try {
        await fetch(`/api/banquet-inquiries/${encodeURIComponent(voucherNo)}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            }
        });
    } catch (err) {
        console.error('Error deleting inquiry from server database', err);
    }
};

const handleSaveInquiry = (inq: BanquetInquiry) => {
    const existingIdx = banquetInquiries.value.findIndex(i => String(i.voucherNo) === String(inq.voucherNo));
    if (existingIdx > -1) {
        banquetInquiries.value[existingIdx] = inq;
    } else {
        banquetInquiries.value.unshift(inq);
    }
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('senani_banquet_inquiries', JSON.stringify(banquetInquiries.value));
        } catch (e) {
            console.error('Error saving banquet inquiries to localStorage', e);
        }
    }

    // Persist immediately to central server MySQL database
    saveInquiryToServer(inq);

    // Interactive Notification Handover Feedback
    if (inq.status === 'pending_manager') {
        if (activeRole.value === 'manager' || activeRole.value === 'superadmin') {
            showToast(
                '🔔 New Reception Handover Received',
                `Voucher #${inq.voucherNo} for ${inq.guestName || 'Guest'} (${inq.paxGuaranteed || inq.paxExpected || 0} Pax) is awaiting your Step 2 costing!`,
                'warning',
                String(inq.voucherNo)
            );
            playNotificationChime();
        } else {
            showToast(
                '✅ Intake Forwarded to Manager',
                `Voucher #${inq.voucherNo} for ${inq.guestName || 'Guest'} successfully forwarded to Banquet Manager.`,
                'success'
            );
        }
    } else if (inq.status === 'pending_md') {
        showToast(
            '✅ Costing Forwarded to MD',
            `Voucher #${inq.voucherNo} submitted to Managing Director for discount approval & final seal.`,
            'info'
        );
    } else if (inq.status === 'approved_md') {
        showToast(
            '🎉 Event Booking Sealed & Locked',
            `Voucher #${inq.voucherNo} has been officially approved & locked by MD Sir.`,
            'success'
        );
    }
};

// -------------------------------------------------------------
// Super Admin Dedicated Inquiry Deletion Control
// -------------------------------------------------------------
const inquiryToDelete = ref<BanquetInquiry | null>(null);
const showDeleteConfirmModal = ref(false);

const requestDeleteInquiry = (inq: BanquetInquiry) => {
    inquiryToDelete.value = inq;
    showDeleteConfirmModal.value = true;
};

const confirmDeleteInquiry = () => {
    if (!inquiryToDelete.value) return;
    const vNo = String(inquiryToDelete.value.voucherNo);
    banquetInquiries.value = banquetInquiries.value.filter(i => String(i.voucherNo) !== vNo);
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('senani_banquet_inquiries', JSON.stringify(banquetInquiries.value));
        } catch (e) {
            console.error('Error saving banquet inquiries after deletion', e);
        }
    }

    // Delete from central server database
    deleteInquiryFromServer(vNo);

    showDeleteConfirmModal.value = false;
    inquiryToDelete.value = null;
};

const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === 'senani_banquet_inquiries' && e.newValue) {
        try {
            const list = JSON.parse(e.newValue);
            if (Array.isArray(list)) {
                banquetInquiries.value = list;
            }
        } catch (err) {
            console.error('Failed to parse inquiries from storage event', err);
        }
    }
    if (e.key === 'senani_read_manager_vouchers' && e.newValue) {
        try {
            readNotificationVouchers.value = JSON.parse(e.newValue);
        } catch (err) {
            console.error('Failed to parse read vouchers from storage event', err);
        }
    }
};

const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (showNotificationDropdown.value && !target.closest('#notification-bell-container')) {
        showNotificationDropdown.value = false;
    }
};

onMounted(() => {
    if (typeof window !== 'undefined') {
        // Load read vouchers history
        try {
            const rawRead = localStorage.getItem('senani_read_manager_vouchers');
            if (rawRead) {
                const list = JSON.parse(rawRead);
                if (Array.isArray(list)) {
                    readNotificationVouchers.value = list;
                }
            }
        } catch (e) {
            console.error('Error loading read vouchers', e);
        }

        // Multi-tab / cross-tab realtime sync & click-away dismissal
        window.addEventListener('storage', handleStorageEvent);
        document.addEventListener('click', handleDocumentClick);
        window.addEventListener('focus', fetchInquiriesFromServer);

        // Load local cache immediately so UI shows instantly
        try {
            const raw = localStorage.getItem('senani_banquet_inquiries');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list) && list.length > 0) {
                    banquetInquiries.value = list.filter(
                        (i: BanquetInquiry) => !(String(i.voucherNo) === '250' && (i.guestName || '').toLowerCase().includes('rajesh'))
                    );
                }
            }
        } catch (e) {
            console.error('Error loading banquet inquiries from localStorage', e);
        }

        // Fetch from central server MySQL database immediately
        fetchInquiriesFromServer();

        // Start background polling every 5 seconds to sync entries across different devices/users
        pollTimer = setInterval(fetchInquiriesFromServer, 5000);

        if (queryInquiry) {
            const params = new URLSearchParams(window.location.search);
            const vNo = params.get('voucher');
            if (vNo) {
                const found = banquetInquiries.value.find(i => String(i.voucherNo) === String(vNo));
                if (found) {
                    selectedInquiry.value = { ...found };
                }
            }
        }

        // Check if there are active manager alerts on mount
        if (activeRole.value === 'manager' || activeRole.value === 'superadmin') {
            setTimeout(() => {
                checkManagerPendingAlerts();
            }, 800);
        }
    }
});

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
        window.removeEventListener('storage', handleStorageEvent);
        window.removeEventListener('focus', fetchInquiriesFromServer);
        document.removeEventListener('click', handleDocumentClick);
    }
});

// -------------------------------------------------------------
// Interactive Data: Recent GST Tax Invoices
// -------------------------------------------------------------
interface GstInvoice {
    invoiceNo: string;
    date: string;
    customerName: string;
    serviceType: string;
    taxableAmount: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
    paymentMode: 'UPI / QR' | 'Credit Card' | 'Cash Counter' | 'Bank NEFT';
    status: 'Paid' | 'Partial' | 'Pending';
}

const recentInvoices = ref<GstInvoice[]>([]);

// Dynamic Financial & Operational Metrics
const totalSalesToday = computed(() => recentInvoices.value.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0));
const totalGstToday = computed(() => recentInvoices.value.reduce((sum, inv) => sum + (Number(inv.gstAmount) || 0), 0));
const confirmedInquiries = computed(() => banquetInquiries.value.filter(i => i.status === 'approved_md' || i.status === 'pending_md'));
const todayFunctionsCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const fromBookings = banquetBookings.value.filter(b => (b.date || '').toLowerCase().includes('today')).length;
    const fromInquiries = confirmedInquiries.value.filter(i => i.functionDateFrom === today || (i.functionDateFrom || '').includes(today)).length;
    return fromBookings + fromInquiries;
});
const todayFunctionsPax = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const fromBookings = banquetBookings.value.filter(b => (b.date || '').toLowerCase().includes('today')).reduce((sum, b) => sum + (Number(b.paxCount) || 0), 0);
    const fromInquiries = confirmedInquiries.value.filter(i => i.functionDateFrom === today || (i.functionDateFrom || '').includes(today)).reduce((sum, i) => sum + (Number(i.paxGuaranteed) || 0), 0);
    return fromBookings + fromInquiries;
});
const pendingFolioDues = computed(() => {
    const fromBookings = banquetBookings.value.reduce((sum, b) => sum + (Number(b.balanceDue) || 0), 0);
    const fromInquiries = confirmedInquiries.value.reduce((sum, i) => sum + Math.max(0, (Number(i.totalAmount) || 0) - (Number(i.amountPaid || i.advancePaid) || 0)), 0);
    return fromBookings + fromInquiries;
});
const pendingFolioCount = computed(() => {
    const fromBookings = banquetBookings.value.filter(b => (Number(b.balanceDue) || 0) > 0).length;
    const fromInquiries = confirmedInquiries.value.filter(i => Math.max(0, (Number(i.totalAmount) || 0) - (Number(i.amountPaid || i.advancePaid) || 0)) > 0).length;
    return fromBookings + fromInquiries;
});

// Senani Official Banquet Venues List
const banquetHalls = [
    {
        name: 'Swarnim (Ground Floor)',
        code: 'swarnim',
        capacity: 450,
        floor: 'Ground Floor (G)',
        badgeClass: 'bg-purple-50 text-[#673DE6] border-purple-200',
        btnClass: 'bg-purple-50 hover:bg-purple-100 text-[#673DE6]',
        rent: 40000,
        desc: 'Central AC, grand stage, crystal chandelier lighting, attached VIP dining & washrooms.'
    },
    {
        name: 'Swarnmahal (Basement)',
        code: 'swarnmahal',
        capacity: 350,
        floor: 'Basement (-1)',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        btnClass: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
        rent: 35000,
        desc: 'Acoustic surround sound, Italian marble flooring, LED stage & attached bridal suite.'
    },
    {
        name: 'Swadhistam (1st Floor)',
        code: 'swadhistam',
        capacity: 250,
        floor: '1st Floor (1)',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        btnClass: 'bg-amber-50 hover:bg-amber-100 text-amber-700',
        rent: 30000,
        desc: 'Ideal for Tilak, Ring Ceremonies, Seminars, Birthdays, and corporate meetups.'
    },
    {
        name: 'Royal Garden Lawn',
        code: 'lawn',
        capacity: 800,
        floor: 'Open Outdoor',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        btnClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700',
        rent: 40000,
        desc: 'Open garden lawn with fountain, gazebo stage, and fairy canopy lighting.'
    },
    {
        name: 'Pisces Rooftop Terrace',
        code: 'pisces',
        capacity: 300,
        floor: 'Rooftop Terrace',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        btnClass: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
        rent: 40000,
        desc: 'Open sky panoramic view, ambient mood lighting, mocktail lounge & live BBQ setup.'
    },
    {
        name: 'Mandap Hall',
        code: 'mandap',
        capacity: 100,
        floor: 'Ritual Area',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        btnClass: 'bg-rose-50 hover:bg-rose-100 text-rose-700',
        rent: 5000,
        desc: 'Dedicated sacred mandap ritual zone for traditional wedding & puja ceremonies.'
    },
];

// Banquet Slot Availability Checker
const getSlotStatus = (hallCodeOrName: string, slotType: 'Morning' | 'Evening') => {
    const term = hallCodeOrName.toLowerCase();
    const booking = banquetBookings.value.find(b => 
        (b.hallName.toLowerCase().includes(term) || term.includes(b.hallName.toLowerCase())) && 
        b.slot.toLowerCase().includes(slotType.toLowerCase())
    );
    if (booking) {
        return { isBooked: true, label: `Booked (${booking.clientName})`, booking };
    }

    const inq = banquetInquiries.value.find(i => {
        const venues = i.selectedVenues || [];
        const hasVenue = venues.some(v => v.toLowerCase().includes(term) || term.includes(v.toLowerCase()));
        return hasVenue && (i.status === 'approved_md' || i.status === 'pending_md');
    });
    if (inq) {
        return { isBooked: true, label: `Reserved (${inq.guestName || 'Client'})`, booking: null };
    }

    return { isBooked: false, label: 'Available', booking: null };
};

// CRM Guest Profiles Dynamic Aggregator
const guestProfiles = computed(() => {
    const list: Array<{
        name: string;
        phone: string;
        city: string;
        initials: string;
        eventType: string;
        venue: string;
        spend: number;
        status: string;
    }> = [];

    banquetInquiries.value.forEach(inq => {
        if (!inq.guestName) return;
        const cleanName = inq.guestName.replace(/^(Mr\.|Mrs\.|Dr\.|Adv\.|Ms\.)\s+/i, '').replace(/\s+Jee$/i, '').trim();
        const initials = cleanName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'GP';
        list.push({
            name: inq.guestName,
            phone: inq.phonePrimary || 'N/A',
            city: inq.address || 'Raebareli',
            initials,
            eventType: inq.eventType || 'Banquet Event',
            venue: inq.selectedVenues?.join(', ') || 'Banquet Hall',
            spend: inq.amountPaid || 0,
            status: inq.status === 'approved_md' ? 'Confirmed Client' : 'Inquiry Stage'
        });
    });

    rooms.value.filter(r => r.guestName).forEach(r => {
        const initials = (r.guestName || '').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'RG';
        list.push({
            name: r.guestName || 'Guest',
            phone: 'N/A',
            city: 'Raebareli',
            initials,
            eventType: `Room ${r.number} Stay`,
            venue: r.category,
            spend: r.pricePerNight || 0,
            status: 'Checked-In'
        });
    });

    return list;
});

// -------------------------------------------------------------
// Interactive Fast GST POS Billing Engine State
// -------------------------------------------------------------
const posBillType = ref<'banquet' | 'room' | 'restaurant'>('banquet');
const posCustomerName = ref('');
const posPhone = ref('');
const posGstin = ref('');
const posPax = ref(100);
const posPlateRate = ref(799);
const posHallRent = ref(35000);
const posDj = ref(false);
const posDjRate = ref(15000);
const posDecor = ref(false);
const posDecorRate = ref(20000);
const posGenset = ref(true);
const posGensetRate = ref(5000);
const posRoomTariff = ref(2500);
const posRoomNights = ref(1);
const posGstRate = ref(5);
const posAdvance = ref(0);

const posTaxableSubtotal = computed(() => {
    if (posBillType.value === 'banquet') {
        const catering = posPax.value * posPlateRate.value;
        let addons = Number(posHallRent.value) || 0;
        if (posDj.value) addons += Number(posDjRate.value) || 0;
        if (posDecor.value) addons += Number(posDecorRate.value) || 0;
        if (posGenset.value) addons += Number(posGensetRate.value) || 0;
        return catering + addons;
    } else if (posBillType.value === 'room') {
        return posRoomTariff.value * posRoomNights.value;
    } else {
        return posPax.value * 450; // Restaurant average
    }
});

const posGstAmount = computed(() => Math.round((posTaxableSubtotal.value * posGstRate.value) / 100));
const posCgstAmount = computed(() => Math.round(posGstAmount.value / 2));
const posSgstAmount = computed(() => Math.round(posGstAmount.value / 2));
const posGrandTotal = computed(() => posTaxableSubtotal.value + posGstAmount.value);
const posBalanceDue = computed(() => Math.max(0, posGrandTotal.value - (Number(posAdvance.value) || 0)));

// -------------------------------------------------------------
// Modals State
// -------------------------------------------------------------
const showInvoiceModal = ref(false);
const activeModalInvoice = ref<any>(null);
const showCheckInModal = ref(false);

const openInvoicePreview = (inv?: GstInvoice) => {
    if (inv) {
        activeModalInvoice.value = {
            invoiceNo: inv.invoiceNo,
            date: inv.date,
            customerName: inv.customerName,
            serviceType: inv.serviceType,
            taxableAmount: inv.taxableAmount,
            gstRate: inv.gstRate,
            gstAmount: inv.gstAmount,
            totalAmount: inv.totalAmount,
            advancePaid: inv.status === 'Paid' ? inv.totalAmount : inv.totalAmount * 0.7,
            balanceDue: inv.status === 'Paid' ? 0 : inv.totalAmount * 0.3,
            paymentMode: inv.paymentMode
        };
    } else {
        activeModalInvoice.value = {
            invoiceNo: `SN-INV-2026-0${Math.floor(420 + Math.random() * 50)}`,
            date: '12 Sep 2026, 05:00 PM',
            customerName: posCustomerName.value || 'Walk-in Guest',
            serviceType: posBillType.value === 'banquet' ? 'Grand Ballroom Event Package' : 'Hotel Accommodation & Services',
            taxableAmount: posTaxableSubtotal.value,
            gstRate: posGstRate.value,
            gstAmount: posGstAmount.value,
            totalAmount: posGrandTotal.value,
            advancePaid: posAdvance.value,
            balanceDue: posBalanceDue.value,
            paymentMode: 'UPI / QR'
        };
    }
    showInvoiceModal.value = true;
};

const printInvoice = () => {
    window.print();
};

// Check-in form state
const checkInRoomNumber = ref('102');
const checkInGuestName = ref('');
const checkInPhone = ref('');
const checkInIdType = ref('Aadhaar Card');
const checkInDeposit = ref(3000);

const submitCheckIn = () => {
    const room = rooms.value.find(r => r.number === checkInRoomNumber.value);
    if (room) {
        room.status = 'occupied';
        room.guestName = checkInGuestName.value || 'Registered Guest';
        room.checkIn = '12 Sep';
        room.checkOut = '14 Sep';
    }
    showCheckInModal.value = false;
    checkInGuestName.value = '';
    checkInPhone.value = '';
};
</script>

<template>
    <Head title="Executive Admin Portal - Senani ERP" />

    <!-- App Main Container: Hostinger Light Theme (#F8F9FD) -->
    <div class="h-screen w-full bg-[#F8F9FD] text-[#18181B] font-sans antialiased flex flex-col overflow-hidden selection:bg-[#673DE6] selection:text-white">

        <!-- ========================================================= -->
        <!-- TOP EXECUTIVE NAVBAR (Ultra-Sleek Minimal 40px Stripe)      -->
        <!-- ========================================================= -->
        <header class="shrink-0 h-10 border-b border-slate-200/80 bg-white px-3 sm:px-4 flex items-center justify-between z-30 select-none shadow-2xs">
            <!-- Left: Brand Logo, Desktop Collapse Toggle & Mobile Trigger -->
            <div class="flex items-center gap-2">
                <!-- Mobile Drawer Toggle -->
                <button
                    type="button"
                    @click="isMobileMenuOpen = !isMobileMenuOpen"
                    class="lg:hidden p-1 rounded-md text-slate-600 hover:bg-slate-100 transition"
                    aria-label="Toggle mobile navigation"
                >
                    <Menu v-if="!isMobileMenuOpen" class="h-4 w-4" />
                    <X v-else class="h-4 w-4" />
                </button>

                <!-- Desktop Sidebar Collapse/Expand Toggle Button -->
                <button
                    type="button"
                    @click="toggleSidebarCollapse"
                    class="hidden lg:flex items-center justify-center h-7 w-7 rounded-md text-slate-500 hover:text-[#673DE6] hover:bg-[#F0EBFF] transition"
                    :title="isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
                >
                    <PanelLeftOpen v-if="isSidebarCollapsed" class="h-3.5 w-3.5" />
                    <PanelLeftClose v-else class="h-3.5 w-3.5" />
                </button>

                <div class="hidden lg:block h-3.5 w-px bg-slate-200"></div>

                <Link :href="home()" class="flex items-center gap-1.5 group">
                    <img
                        src="/images/logo-dark.png"
                        alt="Senani Hotel Pleasant View"
                        class="h-5 sm:h-5.5 w-auto object-contain group-hover:opacity-90 transition"
                    />
                    <span class="rounded-md bg-[#F0EBFF] px-1.5 py-0.5 text-[9px] font-bold text-[#673DE6] border border-[#E0D7FE] hidden sm:inline-flex leading-none">
                        v2.4
                    </span>
                </Link>
            </div>

            <!-- Center: Quick Universal Search Bar (Sleek Thin 28px) -->
            <div class="hidden md:flex items-center max-w-xs lg:max-w-sm w-full mx-3">
                <div class="relative w-full">
                    <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search rooms, guests, invoice #..."
                        class="w-full h-7 rounded-lg border border-slate-200/80 bg-[#F8F9FD] pl-7.5 pr-8 text-[11px] text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-1 focus:ring-[#673DE6]/20 transition"
                    />
                    <kbd class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center rounded border border-slate-200 bg-white px-1 py-0.2 text-[8px] font-semibold text-slate-400">
                        ⌘K
                    </kbd>
                </div>
            </div>

            <!-- Right: Live Cloud Pill, Fast Actions & Admin Profile -->
            <div class="flex items-center gap-2">
                <!-- Hostinger Live Cloud Badge -->
                <div class="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 h-6">
                    <span class="relative flex h-1.5 w-1.5">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Hostinger MySQL Live
                </div>

                <!-- 3-Step Event Inquiry Button -->
                <button
                    @click="openNewInquiry(1)"
                    class="hidden lg:inline-flex items-center gap-1.5 h-7 rounded-lg border border-purple-200 bg-[#F0EBFF] px-2.5 text-[11px] font-bold text-[#673DE6] hover:bg-[#E5DBFE] transition shadow-2xs"
                >
                    <Sparkles class="h-3 w-3 text-[#673DE6]" />
                    <span>+ Event Inquiry</span>
                </button>

                <!-- Quick Check-in Button -->
                <button
                    @click="showCheckInModal = true"
                    class="hidden sm:inline-flex items-center gap-1.5 h-7 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:border-[#673DE6] hover:text-[#673DE6] transition shadow-2xs"
                >
                    <Plus class="h-3 w-3 text-[#673DE6]" />
                    <span>Check-In</span>
                </button>

                <!-- Fast GST Bill Button -->
                <button
                    @click="currentTab = 'billing'"
                    class="inline-flex items-center gap-1.5 h-7 rounded-lg bg-[#673DE6] px-2.5 text-[11px] font-bold text-white hover:bg-[#5832D0] transition shadow-xs shadow-[#673DE6]/20"
                >
                    <Receipt class="h-3 w-3" />
                    <span class="hidden sm:inline">Fast GST Bill</span>
                    <span class="sm:hidden">Bill</span>
                </button>

                <!-- Notification Bell (Reception Handovers & Stage Pipeline) -->
                <div id="notification-bell-container" class="relative">
                    <button
                        type="button"
                        @click="showNotificationDropdown = !showNotificationDropdown"
                        class="relative h-7 px-2 flex items-center justify-center gap-1.5 rounded-lg border transition cursor-pointer"
                        :class="[
                            showNotificationDropdown
                                ? 'border-[#673DE6] bg-purple-50 text-[#673DE6]'
                                : (unreadManagerNotifications.length > 0 && (activeRole === 'manager' || activeRole === 'superadmin')
                                    ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-xs'
                                    : 'border-slate-200 bg-white text-slate-600 hover:text-[#673DE6] hover:border-[#673DE6]/40 hover:bg-slate-50')
                        ]"
                        :title="activeRole === 'manager' || activeRole === 'superadmin' ? `Manager Alerts: ${unreadManagerNotifications.length} unread handover(s)` : 'Reception Handovers'"
                    >
                        <Bell
                            class="h-3.5 w-3.5"
                            :class="unreadManagerNotifications.length > 0 && (activeRole === 'manager' || activeRole === 'superadmin') ? 'text-amber-600 animate-pulse' : 'text-slate-500'"
                        />
                        <span
                            v-if="pendingManagerInquiries.length > 0"
                            class="text-[10px] font-extrabold"
                            :class="unreadManagerNotifications.length > 0 && (activeRole === 'manager' || activeRole === 'superadmin') ? 'text-rose-600' : 'text-slate-600'"
                        >
                            {{ pendingManagerInquiries.length }}
                        </span>
                        <span
                            v-if="unreadManagerNotifications.length > 0 && (activeRole === 'manager' || activeRole === 'superadmin')"
                            class="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black text-white shadow-xs"
                        >
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span class="relative">{{ unreadManagerNotifications.length }}</span>
                        </span>
                    </button>

                    <!-- Notification Popover Dropdown -->
                    <div
                        v-if="showNotificationDropdown"
                        class="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <!-- Header -->
                        <div class="p-3.5 bg-slate-50/80 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="h-7 w-7 rounded-lg bg-[#F0EBFF] text-[#673DE6] flex items-center justify-center">
                                    <Bell class="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 class="text-xs font-black text-slate-900 leading-tight">Reception Handovers</h3>
                                    <p class="text-[10px] text-slate-500 font-medium">
                                        {{ pendingManagerInquiries.length }} lead(s) awaiting Step 2 costing
                                    </p>
                                </div>
                            </div>
                            <button
                                v-if="unreadManagerNotifications.length > 0"
                                @click="markAllNotificationsAsRead"
                                class="text-[10px] font-bold text-[#673DE6] hover:text-[#5832D0] hover:underline cursor-pointer"
                            >
                                Mark all read
                            </button>
                        </div>

                        <!-- Inquiry Notification Items -->
                        <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
                            <div
                                v-for="inq in pendingManagerInquiries"
                                :key="inq.voucherNo"
                                class="p-3 hover:bg-slate-50/80 transition flex items-start justify-between gap-2"
                                :class="{ 'bg-purple-50/20': !readNotificationVouchers.includes(String(inq.voucherNo)) }"
                            >
                                <div class="space-y-1 min-w-0 flex-1">
                                    <div class="flex items-center gap-1.5 flex-wrap">
                                        <span class="font-mono font-black text-[#673DE6] text-xs">#{{ inq.voucherNo }}</span>
                                        <span class="text-xs font-bold text-slate-900 truncate">{{ inq.guestName || 'Unnamed Guest' }}</span>
                                        <span
                                            v-if="!readNotificationVouchers.includes(String(inq.voucherNo))"
                                            class="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"
                                            title="Unread notification"
                                        ></span>
                                    </div>
                                    <div class="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                        <span v-if="inq.phonePrimary || inq.phone" class="flex items-center gap-0.5">
                                            <Phone class="h-2.5 w-2.5 text-slate-400" />
                                            {{ inq.phonePrimary || inq.phone }}
                                        </span>
                                        <span class="flex items-center gap-0.5 font-bold text-slate-700">
                                            <Users class="h-2.5 w-2.5 text-slate-400" />
                                            {{ inq.paxGuaranteed || inq.paxExpected || 0 }} Pax
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
                                        <span class="bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 py-0.2 rounded font-bold text-[9px]">
                                            Step 1 Captured by Reception
                                        </span>
                                        <span class="text-slate-500">{{ inq.eventType || 'Banquet Event' }}</span>
                                    </div>
                                </div>

                                <div class="flex flex-col items-end gap-1.5 shrink-0">
                                    <button
                                        @click="openInquiryFromNotification(inq)"
                                        class="px-2.5 py-1 rounded-lg bg-[#673DE6] text-white text-[10px] font-extrabold hover:bg-[#5832D0] transition shadow-xs flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>⚡ Cost Step 2</span>
                                    </button>
                                    <button
                                        v-if="!readNotificationVouchers.includes(String(inq.voucherNo))"
                                        @click="markNotificationAsRead(inq.voucherNo)"
                                        class="text-[9px] text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>

                            <!-- Empty State -->
                            <div v-if="pendingManagerInquiries.length === 0" class="p-6 text-center">
                                <div class="h-10 w-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                                    <CheckCircle2 class="h-5 w-5" />
                                </div>
                                <p class="text-xs font-bold text-slate-800">All Handovers Handled!</p>
                                <p class="text-[11px] text-slate-400 mt-0.5">
                                    No inquiries from Reception are waiting for manager costing.
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="p-2.5 bg-slate-50/60 text-center border-t border-slate-100">
                            <button
                                @click="currentTab = 'banquet'; showNotificationDropdown = false"
                                class="text-[11px] font-bold text-[#673DE6] hover:underline cursor-pointer"
                            >
                                Open Banquet 3-Stage Pipeline →
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Sign Out -->
                <button
                    @click="logout"
                    title="Sign Out"
                    class="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                >
                    <LogOut class="h-3 w-3" />
                </button>
            </div>
        </header>

        <!-- ========================================================= -->
        <!-- CORE WORKSPACE (Fixed Height App Shell)                   -->
        <!-- ========================================================= -->
        <div class="flex-1 flex w-full overflow-hidden">

            <!-- ----------------------------------------------------- -->
            <!-- SLEEK COLLAPSIBLE SIDEBAR                             -->
            <!-- ----------------------------------------------------- -->
            <aside
                :class="[
                    'fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200/80 transition-all duration-200 lg:static lg:h-full flex flex-col shrink-0 shadow-sm lg:shadow-none select-none',
                    isSidebarCollapsed ? 'lg:w-[64px] p-2' : 'lg:w-60 p-3',
                    isMobileMenuOpen ? 'w-60 translate-x-0 p-3' : '-translate-x-full lg:translate-x-0'
                ]"
            >
                <div class="flex-1 overflow-y-auto space-y-4 pr-0.5 custom-scrollbar">
                    <!-- Navigation Category: Overview -->
                    <div>
                        <div v-if="!isSidebarCollapsed" class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Overview
                        </div>
                        <div v-else class="my-1 border-t border-slate-100"></div>

                        <nav class="space-y-1">
                            <button
                                @click="currentTab = 'dashboard'; isMobileMenuOpen = false"
                                :title="isSidebarCollapsed ? 'Dashboard' : ''"
                                :class="[
                                    'w-full flex items-center rounded-xl text-xs font-semibold transition',
                                    isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-left',
                                    currentTab === 'dashboard'
                                        ? 'bg-[#F0EBFF] text-[#673DE6] font-bold shadow-2xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                ]"
                            >
                                <Activity class="h-4 w-4 shrink-0" />
                                <span v-if="!isSidebarCollapsed" class="truncate">Dashboard</span>
                            </button>

                            <button
                                @click="currentTab = 'rooms'; isMobileMenuOpen = false"
                                :title="isSidebarCollapsed ? `Room Matrix (${roomStats.available} Free)` : ''"
                                :class="[
                                    'w-full flex items-center rounded-xl text-xs font-semibold transition',
                                    isSidebarCollapsed ? 'justify-center p-2.5 relative' : 'justify-between px-3 py-2 text-left',
                                    currentTab === 'rooms'
                                        ? 'bg-[#F0EBFF] text-[#673DE6] font-bold shadow-2xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                ]"
                            >
                                <span class="flex items-center gap-3">
                                    <BedDouble class="h-4 w-4 shrink-0" />
                                    <span v-if="!isSidebarCollapsed" class="truncate">Room Matrix</span>
                                </span>
                                <span v-if="!isSidebarCollapsed" class="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    {{ roomStats.available }} Free
                                </span>
                                <span v-else class="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            </button>

                            <button
                                @click="currentTab = 'banquet'; isMobileMenuOpen = false"
                                :title="isSidebarCollapsed ? 'Banquet Halls (2 Today)' : ''"
                                :class="[
                                    'w-full flex items-center rounded-xl text-xs font-semibold transition',
                                    isSidebarCollapsed ? 'justify-center p-2.5 relative' : 'justify-between px-3 py-2 text-left',
                                    currentTab === 'banquet'
                                        ? 'bg-[#F0EBFF] text-[#673DE6] font-bold shadow-2xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                ]"
                            >
                                <span class="flex items-center gap-3">
                                    <Calendar class="h-4 w-4 shrink-0" />
                                    <span v-if="!isSidebarCollapsed" class="truncate">Banquet Halls</span>
                                </span>
                                <span v-if="!isSidebarCollapsed" class="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-[#673DE6]">
                                    2 Today
                                </span>
                                <span v-else class="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#673DE6]"></span>
                            </button>
                        </nav>
                    </div>

                    <!-- Navigation Category: Revenue & POS -->
                    <div>
                        <div v-if="!isSidebarCollapsed" class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Billing & Finance
                        </div>
                        <div v-else class="my-1 border-t border-slate-100"></div>

                        <nav class="space-y-1">
                            <button
                                @click="currentTab = 'billing'; isMobileMenuOpen = false"
                                :title="isSidebarCollapsed ? 'Fast GST POS' : ''"
                                :class="[
                                    'w-full flex items-center rounded-xl text-xs font-semibold transition',
                                    isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-left',
                                    currentTab === 'billing'
                                        ? 'bg-[#F0EBFF] text-[#673DE6] font-bold shadow-2xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                ]"
                            >
                                <Receipt class="h-4 w-4 shrink-0" />
                                <span v-if="!isSidebarCollapsed" class="truncate">Fast GST POS</span>
                            </button>

                            <button
                                @click="currentTab = 'invoices'; isMobileMenuOpen = false"
                                :title="isSidebarCollapsed ? 'Tax Invoices' : ''"
                                :class="[
                                    'w-full flex items-center rounded-xl text-xs font-semibold transition',
                                    isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-left',
                                    currentTab === 'invoices'
                                        ? 'bg-[#F0EBFF] text-[#673DE6] font-bold shadow-2xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                ]"
                            >
                                <FileText class="h-4 w-4 shrink-0" />
                                <span v-if="!isSidebarCollapsed" class="truncate">Tax Invoices</span>
                            </button>
                        </nav>
                    </div>

                    <!-- Navigation Category: Administration -->
                    <div>
                        <div v-if="!isSidebarCollapsed" class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Management
                        </div>
                        <div v-else class="my-1 border-t border-slate-100"></div>

                        <nav class="space-y-1">
                            <button
                                @click="currentTab = 'guests'; isMobileMenuOpen = false"
                                :title="isSidebarCollapsed ? 'Guest Directory' : ''"
                                :class="[
                                    'w-full flex items-center rounded-xl text-xs font-semibold transition',
                                    isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-left',
                                    currentTab === 'guests'
                                        ? 'bg-[#F0EBFF] text-[#673DE6] font-bold shadow-2xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                ]"
                            >
                                <Users class="h-4 w-4 shrink-0" />
                                <span v-if="!isSidebarCollapsed" class="truncate">Guest Directory</span>
                            </button>

                            <button
                                @click="currentTab = 'security'; isMobileMenuOpen = false"
                                :title="isSidebarCollapsed ? 'Server & Security' : ''"
                                :class="[
                                    'w-full flex items-center rounded-xl text-xs font-semibold transition',
                                    isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-left',
                                    currentTab === 'security'
                                        ? 'bg-[#F0EBFF] text-[#673DE6] font-bold shadow-2xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                ]"
                            >
                                <ShieldCheck class="h-4 w-4 shrink-0" />
                                <span v-if="!isSidebarCollapsed" class="truncate">Server & Security</span>
                            </button>
                        </nav>
                    </div>
                </div>

                <!-- Sidebar Bottom: Collapse Toggle & User Profile (Pinned at bottom) -->
                <div class="shrink-0 pt-2 mt-1 border-t border-slate-200/80 space-y-1.5">
                    <!-- Collapse Toggle Inside Sidebar -->
                    <button
                        type="button"
                        @click="toggleSidebarCollapse"
                        class="w-full hidden lg:flex items-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs font-medium transition"
                        :class="isSidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-1.5'"
                        :title="isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
                    >
                        <PanelLeftOpen v-if="isSidebarCollapsed" class="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <PanelLeftClose v-else class="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span v-if="!isSidebarCollapsed" class="truncate text-slate-600 font-semibold text-xs">Collapse</span>
                    </button>

                    <!-- User Profile Card -->
                    <div
                        v-if="!isSidebarCollapsed"
                        class="flex items-center gap-2 p-1.5 rounded-xl bg-[#F8F9FD] border border-slate-200/60"
                    >
                        <div class="h-7 w-7 rounded-lg bg-gradient-to-br from-[#673DE6] to-[#5025d1] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-slate-900 truncate">{{ user.name }}</p>
                            <p class="text-[9px] text-slate-400 truncate">{{ user.email }}</p>
                        </div>
                    </div>
                    <div
                        v-else
                        class="flex justify-center"
                        :title="`${user.name} (${user.email})`"
                    >
                        <div class="h-7 w-7 rounded-lg bg-gradient-to-br from-[#673DE6] to-[#5025d1] text-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer hover:ring-2 hover:ring-[#673DE6]/30 transition">
                            {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Backdrop for Mobile Sidebar -->
            <div
                v-if="isMobileMenuOpen"
                @click="isMobileMenuOpen = false"
                class="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs lg:hidden"
            ></div>

            <!-- ----------------------------------------------------- -->
            <!-- MAIN CONTENT AREA (Independent Native Smooth Scroll) -->
            <!-- ----------------------------------------------------- -->
            <main class="flex-1 h-full overflow-y-auto bg-[#F8F9FD] scroll-smooth custom-scrollbar">
                <div class="max-w-[1600px] mx-auto p-3 sm:p-4 lg:p-4.5">

                    <!-- ================================================= -->
                    <!-- VIEW 1: EXECUTIVE DASHBOARD (Overview Tab)        -->
                    <!-- ================================================= -->
                    <div v-if="currentTab === 'dashboard'" class="space-y-3 sm:space-y-3.5 animate-in fade-in duration-200">

                    <!-- Sleek Minimal Operational Context Bar with 3-Level Role Switcher -->
                    <div class="flex flex-wrap items-center justify-between gap-2.5 py-0.5">
                        <div class="flex items-center gap-2 sm:gap-2.5">
                            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200/90 shadow-2xs">
                                <span class="relative flex h-2 w-2">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span class="text-[11px] font-extrabold tracking-wider uppercase text-slate-700">Live Hotel Ops</span>
                            </div>
                            <span class="text-slate-300 hidden sm:inline">•</span>
                            
                                <!-- Interactive 3-Level Role Switcher Widget -->
                                <div class="flex items-center p-0.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs">
                                    <span class="text-[10px] font-extrabold text-slate-400 px-2 uppercase tracking-wider hidden md:inline">Tier:</span>
                                    <button
                                        type="button"
                                        @click="setRole('reception')"
                                        :class="[
                                            'px-2 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1 cursor-pointer',
                                            activeRole === 'reception'
                                                ? 'bg-amber-500 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        ]"
                                        title="Reception Desk: Step 1 Intake Only"
                                    >
                                        <span>🏢 Reception (Step 1)</span>
                                    </button>
                                    <button
                                        type="button"
                                        @click="setRole('manager')"
                                        :disabled="authenticatedRole === 'reception'"
                                        :class="[
                                            'px-2 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1',
                                            authenticatedRole === 'reception' ? 'opacity-40 cursor-not-allowed text-slate-400' : 'cursor-pointer',
                                            activeRole === 'manager'
                                                ? 'bg-[#673DE6] text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        ]"
                                        :title="authenticatedRole === 'reception' ? 'Requires Manager or MD Account' : 'Banquet Manager: Steps 1 & 2 Setup & Quotations'"
                                    >
                                        <span>👔 Manager (Step 1 & 2)</span>
                                    </button>
                                    <button
                                        type="button"
                                        @click="setRole('md')"
                                        :disabled="authenticatedRole === 'reception' || authenticatedRole === 'manager'"
                                        :class="[
                                            'px-2 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1',
                                            authenticatedRole === 'reception' || authenticatedRole === 'manager' ? 'opacity-40 cursor-not-allowed text-slate-400' : 'cursor-pointer',
                                            activeRole === 'md'
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        ]"
                                        :title="authenticatedRole === 'reception' || authenticatedRole === 'manager' ? 'Locked (Requires MD/Admin Login)' : 'MD Sir: Complete Super Authority & Contract Seal'"
                                    >
                                        <span>👑 MD Sir</span>
                                    </button>
                                    <button
                                        type="button"
                                        @click="setRole('superadmin')"
                                        :disabled="authenticatedRole !== 'superadmin'"
                                        :class="[
                                            'px-2 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1',
                                            authenticatedRole !== 'superadmin' ? 'opacity-40 cursor-not-allowed text-slate-400' : 'cursor-pointer',
                                            activeRole === 'superadmin'
                                                ? 'bg-rose-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        ]"
                                        :title="authenticatedRole !== 'superadmin' ? 'Locked (Requires Super Admin Login)' : 'Super Admin: Full Access + Delete Rights'"
                                    >
                                        <span>⚡ Super Admin</span>
                                    </button>
                                </div>
                        </div>

                        <!-- Date Filter Pills & Realtime Pulse -->
                        <div class="flex items-center gap-2">
                            <div class="flex items-center p-0.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs">
                                <button
                                    @click="activeDateFilter = 'today'"
                                    :class="[
                                        'px-2.5 py-1 rounded-lg font-bold transition-all duration-200',
                                        activeDateFilter === 'today'
                                            ? 'bg-[#673DE6] text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    ]"
                                >
                                    Today
                                </button>
                                <button
                                    @click="activeDateFilter = 'week'"
                                    :class="[
                                        'px-2.5 py-1 rounded-lg font-medium transition-all duration-200',
                                        activeDateFilter === 'week'
                                            ? 'bg-[#673DE6] text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    ]"
                                >
                                    This Week
                                </button>
                                <button
                                    @click="activeDateFilter = 'month'"
                                    :class="[
                                        'px-2.5 py-1 rounded-lg font-medium transition-all duration-200',
                                        activeDateFilter === 'month'
                                            ? 'bg-[#673DE6] text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    ]"
                                >
                                    This Month
                                </button>
                            </div>
                            <div class="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-2xs">
                                <Activity class="h-3 w-3 text-emerald-500 animate-pulse" />
                                <span>Realtime</span>
                            </div>
                        </div>
                    </div>

                    <!-- Manager Reception Handover Alert (Overview Banner) -->
                    <div
                        v-if="(activeRole === 'manager' || activeRole === 'superadmin') && pendingManagerInquiries.length > 0"
                        class="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-white p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200"
                    >
                        <div class="flex items-start sm:items-center gap-3">
                            <div class="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-200">
                                <Bell class="h-4.5 w-4.5 animate-pulse" />
                            </div>
                            <div>
                                <div class="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2 flex-wrap">
                                    <span>{{ pendingManagerInquiries.length }} Reception Intake{{ pendingManagerInquiries.length > 1 ? 's' : '' }} Waiting for Costing</span>
                                    <span class="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                        Action Required (Step 2)
                                    </span>
                                </div>
                                <p class="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                                    Reception has completed guest intake and forwarded lead(s). Configure hall setup, menu tier & pricing.
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                                @click="openInquiryFromNotification(pendingManagerInquiries[0])"
                                class="px-3 py-1.5 rounded-xl bg-[#673DE6] hover:bg-[#5832D0] text-white text-xs font-extrabold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>Cost Voucher #{{ pendingManagerInquiries[0].voucherNo }}</span>
                                <ChevronRight class="h-3.5 w-3.5" />
                            </button>
                            <button
                                @click="currentTab = 'banquet'"
                                class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                            >
                                View Pipeline
                            </button>
                        </div>
                    </div>

                    <!-- 4 Sleek Minimal Executive Metric Cards with Micro-Interactions & Gradients -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                        <!-- Card 1: Today's Total Sales -->
                        <div class="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_22px_-4px_rgba(103,61,230,0.12)] hover:border-purple-300/80 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                            <div class="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#673DE6] to-indigo-500"></div>
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sales Today</span>
                                <div class="h-7.5 w-7.5 rounded-lg bg-gradient-to-br from-[#673DE6] to-indigo-600 text-white flex items-center justify-center shadow-xs shadow-purple-200 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <Receipt class="h-4 w-4" />
                                </div>
                            </div>
                            <div class="mt-2 flex items-baseline justify-between gap-1">
                                <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">₹{{ totalSalesToday.toLocaleString('en-IN') }}</span>
                                <span class="inline-flex items-center text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-1.5 py-0.5 rounded-full">
                                    {{ recentInvoices.length }} Invoices
                                </span>
                            </div>
                            <div class="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                                <span>GST (CGST+SGST):</span>
                                <span class="font-semibold text-slate-700 font-mono">₹{{ totalGstToday.toLocaleString('en-IN') }}</span>
                            </div>
                        </div>

                        <!-- Card 2: Room Occupancy -->
                        <div class="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_22px_-4px_rgba(14,165,233,0.12)] hover:border-sky-300/80 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                            <div class="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-sky-500 to-blue-600"></div>
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Room Occupancy</span>
                                <div class="h-7.5 w-7.5 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs shadow-sky-200 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <BedDouble class="h-4 w-4" />
                                </div>
                            </div>
                            <div class="mt-2 flex items-baseline justify-between gap-1">
                                <div class="flex items-baseline gap-1.5">
                                    <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">
                                        {{ roomStats.occupied }}/{{ roomStats.total }}
                                    </span>
                                    <span class="text-[11px] text-slate-400 font-medium">rooms</span>
                                </div>
                                <span class="inline-flex items-center rounded-full bg-sky-50 border border-sky-200/70 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                                    {{ roomStats.occupancyRate }}%
                                </span>
                            </div>
                            <!-- Mini animated progress bar -->
                            <div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden mt-1.5">
                                <div class="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-700" :style="{ width: roomStats.occupancyRate + '%' }"></div>
                            </div>
                            <div class="mt-1.5 pt-1 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                                <span>Available:</span>
                                <span class="font-bold text-emerald-600">{{ roomStats.available }} Rooms</span>
                            </div>
                        </div>

                        <!-- Card 3: Banquet Functions -->
                        <div class="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_22px_-4px_rgba(245,158,11,0.12)] hover:border-amber-300/80 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                            <div class="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500 to-orange-500"></div>
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banquet Functions</span>
                                <div class="h-7.5 w-7.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs shadow-amber-200 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <Calendar class="h-4 w-4" />
                                </div>
                            </div>
                            <div class="mt-2 flex items-baseline justify-between gap-1">
                                <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">{{ todayFunctionsCount }} Events</span>
                                <span class="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                    {{ todayFunctionsPax }} Pax Total
                                </span>
                            </div>
                            <div class="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between truncate">
                                <span>Status:</span>
                                <span class="font-semibold text-purple-700 truncate">{{ todayFunctionsCount > 0 ? 'Active Functions Scheduled' : 'No Events Scheduled' }}</span>
                            </div>
                        </div>

                        <!-- Card 4: Active Folio / Unbilled -->
                        <div class="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_22px_-4px_rgba(16,185,129,0.12)] hover:border-emerald-300/80 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                            <div class="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Folio Dues</span>
                                <div class="h-7.5 w-7.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shadow-emerald-200 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <CreditCard class="h-4 w-4" />
                                </div>
                            </div>
                            <div class="mt-2 flex items-baseline justify-between gap-1">
                                <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">₹{{ pendingFolioDues.toLocaleString('en-IN') }}</span>
                                <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {{ pendingFolioDues === 0 ? 'All Settled' : 'Pending' }}
                                </span>
                            </div>
                            <div class="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                                <span>Check-out settlements:</span>
                                <span class="font-semibold text-slate-700">{{ pendingFolioCount }} pending</span>
                            </div>
                        </div>
                    </div>

                    <!-- 2-Column Operational Grid: Room Rack & Today's Events -->
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">

                        <!-- Left (7 Cols): Live Room Matrix Quick Rack -->
                        <div class="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                                <div>
                                    <h2 class="text-sm sm:text-base font-bold text-slate-900">Front Desk Room Rack</h2>
                                    <p class="text-[11px] text-slate-500">Live room occupancy status & quick folio management</p>
                                </div>
                                <button
                                    @click="currentTab = 'rooms'"
                                    class="text-xs font-bold text-[#673DE6] hover:text-[#5025d1] flex items-center gap-1 self-start sm:self-auto"
                                >
                                    View All Rooms <ChevronRight class="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <!-- Quick Status Legend Pills -->
                            <div class="flex flex-wrap items-center gap-2.5 pb-2 mb-2.5 border-b border-slate-100 text-[11px]">
                                <span class="flex items-center gap-1.5 text-slate-600">
                                    <span class="h-2 w-2 rounded-full bg-emerald-500"></span> Available ({{ roomStats.available }})
                                </span>
                                <span class="flex items-center gap-1.5 text-slate-600">
                                    <span class="h-2 w-2 rounded-full bg-[#673DE6]"></span> Occupied ({{ roomStats.occupied }})
                                </span>
                                <span class="flex items-center gap-1.5 text-slate-600">
                                    <span class="h-2 w-2 rounded-full bg-amber-500"></span> Cleaning ({{ roomStats.cleaning }})
                                </span>
                                <span class="flex items-center gap-1.5 text-slate-600">
                                    <span class="h-2 w-2 rounded-full bg-blue-500"></span> Reserved ({{ roomStats.reserved }})
                                </span>
                            </div>

                            <!-- Mini Room Grid -->
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div
                                    v-for="room in rooms.slice(0, 12)"
                                    :key="room.id"
                                    :class="[
                                        'rounded-xl border p-2.5 transition flex flex-col justify-between text-left cursor-pointer hover:shadow-xs',
                                        room.status === 'available' ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400' :
                                        room.status === 'occupied' ? 'border-purple-200 bg-purple-50/40 hover:border-[#673DE6]' :
                                        room.status === 'cleaning' ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400' :
                                        'border-blue-200 bg-blue-50/40 hover:border-blue-400'
                                    ]"
                                >
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs sm:text-sm font-extrabold text-slate-900">{{ room.number }}</span>
                                        <span
                                            :class="[
                                                'h-2 w-2 rounded-full',
                                                room.status === 'available' ? 'bg-emerald-500' :
                                                room.status === 'occupied' ? 'bg-[#673DE6]' :
                                                room.status === 'cleaning' ? 'bg-amber-500' : 'bg-blue-500'
                                            ]"
                                        ></span>
                                    </div>
                                    <div class="mt-1.5">
                                        <p class="text-[10px] font-semibold text-slate-500 truncate">{{ room.category }}</p>
                                        <p v-if="room.guestName" class="text-[11px] font-bold text-slate-900 truncate mt-0.5">
                                            {{ room.guestName }}
                                        </p>
                                        <p v-else class="text-[11px] font-bold text-emerald-700 mt-0.5">
                                            ₹{{ room.pricePerNight }}/night
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right (5 Cols): Today's Banquet Function Schedule -->
                        <div class="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between mb-2.5">
                                    <div>
                                        <h2 class="text-sm sm:text-base font-bold text-slate-900">Today's Banquet Schedule</h2>
                                        <p class="text-[11px] text-slate-500">Hall reservations, slots & catering details</p>
                                    </div>
                                    <button
                                        @click="currentTab = 'banquet'"
                                        class="text-xs font-bold text-[#673DE6] hover:text-[#5025d1] flex items-center gap-1"
                                    >
                                        All Halls <ChevronRight class="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div v-if="banquetBookings.length > 0" class="space-y-2">
                                    <div
                                        v-for="bk in banquetBookings.slice(0, 2)"
                                        :key="bk.id"
                                        class="rounded-xl border border-slate-200/80 p-2.5 sm:p-3 bg-[#F8F9FD] hover:bg-white hover:border-[#673DE6]/40 transition"
                                    >
                                        <div class="flex items-center justify-between mb-1.5">
                                            <span class="text-xs font-bold text-[#673DE6]">{{ bk.hallName }}</span>
                                            <span
                                                :class="[
                                                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                                    bk.status === 'confirmed' ? 'bg-purple-100 text-[#673DE6]' : 'bg-emerald-100 text-emerald-800'
                                                ]"
                                            >
                                                {{ bk.status }}
                                            </span>
                                        </div>
                                        <h3 class="text-xs font-bold text-slate-900">{{ bk.eventName }}</h3>
                                        <div class="mt-2 text-[11px] text-slate-500 space-y-1">
                                            <div class="flex items-center justify-between">
                                                <span>Client: {{ bk.clientName }}</span>
                                                <span class="font-semibold text-slate-700">{{ bk.slot }}</span>
                                            </div>
                                            <div class="flex items-center justify-between pt-1 border-t border-slate-200/60 font-semibold text-slate-800">
                                                <span>Guests: {{ bk.paxCount }} Pax</span>
                                                <span class="text-[#673DE6]">Total: ₹{{ bk.totalAmount.toLocaleString('en-IN') }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="py-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <Calendar class="h-6 w-6 mx-auto text-slate-300 mb-1" />
                                    <p class="text-xs font-semibold text-slate-600">No banquet functions scheduled today</p>
                                    <p class="text-[10px] text-slate-400 mt-0.5">All banquet halls are available for booking</p>
                                </div>
                            </div>

                            <button
                                @click="openNewInquiry(1)"
                                class="mt-4 w-full py-2.5 rounded-xl border border-dashed border-purple-300 bg-purple-50/50 text-xs font-bold text-[#673DE6] hover:bg-purple-50 transition flex items-center justify-center gap-1.5"
                            >
                                <Plus class="h-4 w-4" /> Register New Banquet Inquiry
                            </button>
                        </div>
                    </div>

                    <!-- Recent Fast GST Invoices Table -->
                    <div class="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                            <div>
                                <h2 class="text-sm sm:text-base font-bold text-slate-900">Recent GST Tax Invoices</h2>
                                <p class="text-[11px] text-slate-500">Official GST bills generated with CGST / SGST split</p>
                            </div>
                            <button
                                @click="currentTab = 'invoices'"
                                class="text-xs font-bold text-[#673DE6] hover:text-[#5025d1] flex items-center gap-1 self-start sm:self-auto"
                            >
                                View All Invoices <ChevronRight class="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs whitespace-nowrap">
                                <thead>
                                    <tr class="border-b border-slate-100 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        <th class="pb-2 pr-3 font-semibold">Invoice No</th>
                                        <th class="pb-2 pr-3 font-semibold">Date & Time</th>
                                        <th class="pb-2 pr-3 font-semibold">Customer / Corporate</th>
                                        <th class="pb-2 pr-3 font-semibold">Service Description</th>
                                        <th class="pb-2 pr-3 font-semibold text-right">Taxable</th>
                                        <th class="pb-2 pr-4 font-semibold text-right">GST</th>
                                        <th class="pb-2 pr-4 font-semibold text-right">Total Amount</th>
                                        <th class="pb-2 px-3 font-semibold">Payment Mode</th>
                                        <th class="pb-2 px-2 font-semibold text-center">Status</th>
                                        <th class="pb-2 pl-2 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-slate-600 font-medium text-xs">
                                    <tr v-for="inv in recentInvoices" :key="inv.invoiceNo" class="hover:bg-slate-50/80 transition">
                                        <td class="py-2.5 pr-3 font-bold text-[#673DE6] font-mono">{{ inv.invoiceNo }}</td>
                                        <td class="py-2.5 pr-3 text-slate-500">{{ inv.date }}</td>
                                        <td class="py-2.5 pr-3 font-semibold text-slate-900">{{ inv.customerName }}</td>
                                        <td class="py-2.5 pr-3 text-slate-500 truncate max-w-xs">{{ inv.serviceType }}</td>
                                        <td class="py-2.5 pr-3 text-right font-mono">₹{{ inv.taxableAmount.toLocaleString('en-IN') }}</td>
                                        <td class="py-2.5 pr-4 text-right text-purple-700 font-semibold font-mono">
                                            ₹{{ inv.gstAmount.toLocaleString('en-IN') }} ({{ inv.gstRate }}%)
                                        </td>
                                        <td class="py-2.5 pr-4 text-right font-bold text-slate-900 font-mono">
                                            ₹{{ inv.totalAmount.toLocaleString('en-IN') }}
                                        </td>
                                        <td class="py-2.5 px-3">
                                            <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                                {{ inv.paymentMode }}
                                            </span>
                                        </td>
                                        <td class="py-2.5 px-2 text-center">
                                            <span
                                                :class="[
                                                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                                    inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    inv.status === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                                ]"
                                            >
                                                {{ inv.status }}
                                            </span>
                                        </td>
                                        <td class="py-2.5 pl-2 text-right">
                                            <button
                                                @click="openInvoicePreview(inv)"
                                                class="rounded-lg bg-purple-50 text-[#673DE6] hover:bg-[#673DE6] hover:text-white px-2.5 py-1 text-[11px] font-bold transition inline-flex items-center gap-1"
                                            >
                                                <Eye class="h-3 w-3" /> View Bill
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="recentInvoices.length === 0">
                                        <td colspan="10" class="py-8 text-center text-slate-400">
                                            <div class="flex flex-col items-center justify-center gap-1.5">
                                                <Receipt class="h-7 w-7 text-slate-300" />
                                                <span class="text-xs font-semibold text-slate-600">No GST Invoices Recorded Today</span>
                                                <span class="text-[10px] text-slate-400">Bills generated in the Fast POS Billing engine will appear here automatically</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- ================================================= -->
                <!-- VIEW 2: FAST GST POS BILLING ENGINE               -->
                <!-- ================================================= -->
                <div v-else-if="currentTab === 'billing'" class="space-y-6 animate-in fade-in duration-200">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Fast GST Billing & POS Counter</h1>
                            <p class="text-xs sm:text-sm text-slate-500 mt-1">
                                Instant GST calculation with automated CGST/SGST split & printable Tax Invoice
                            </p>
                        </div>

                        <!-- Bill Type Toggle -->
                        <div class="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <button
                                @click="posBillType = 'banquet'"
                                :class="[
                                    'px-3 py-1.5 rounded-lg text-xs font-bold transition',
                                    posBillType === 'banquet' ? 'bg-[#673DE6] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                ]"
                            >
                                Banquet Function
                            </button>
                            <button
                                @click="posBillType = 'room'"
                                :class="[
                                    'px-3 py-1.5 rounded-lg text-xs font-bold transition',
                                    posBillType === 'room' ? 'bg-[#673DE6] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                ]"
                            >
                                Hotel Room Stay
                            </button>
                        </div>
                    </div>

                    <!-- Billing Form & Real-Time Receipt Summary -->
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        <!-- Left: Dynamic Inputs Form (7 Cols) -->
                        <div class="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
                            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">1. Customer & Event Information</h2>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Guest / Organization Name</label>
                                    <input
                                        v-model="posCustomerName"
                                        type="text"
                                        placeholder="Full Name"
                                        class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-2 focus:ring-[#673DE6]/20 transition"
                                    />
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Contact</label>
                                    <input
                                        v-model="posPhone"
                                        type="tel"
                                        placeholder="+91 Mobile Number"
                                        class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-2 focus:ring-[#673DE6]/20 transition"
                                    />
                                </div>
                            </div>

                            <!-- Banquet Fields -->
                            <div v-if="posBillType === 'banquet'" class="space-y-4 pt-3 border-t border-slate-100">
                                <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">2. Banquet Catering & Hall Details</h2>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Expected Guests (Pax)</label>
                                        <input
                                            v-model.number="posPax"
                                            type="number"
                                            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Food Plate Rate (₹)</label>
                                        <input
                                            v-model.number="posPlateRate"
                                            type="number"
                                            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Hall Rent Base (₹)</label>
                                        <input
                                            v-model.number="posHallRent"
                                            type="number"
                                            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                        />
                                    </div>
                                </div>

                                <!-- Add-on Checkboxes -->
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                    <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/40 cursor-pointer">
                                        <input type="checkbox" v-model="posDj" class="rounded text-[#673DE6] focus:ring-[#673DE6]" />
                                        <span class="text-xs font-semibold text-slate-700">DJ Sound (₹15,000)</span>
                                    </label>
                                    <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/40 cursor-pointer">
                                        <input type="checkbox" v-model="posDecor" class="rounded text-[#673DE6] focus:ring-[#673DE6]" />
                                        <span class="text-xs font-semibold text-slate-700">Stage Decor (₹20,000)</span>
                                    </label>
                                    <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/40 cursor-pointer">
                                        <input type="checkbox" v-model="posGenset" class="rounded text-[#673DE6] focus:ring-[#673DE6]" />
                                        <span class="text-xs font-semibold text-slate-700">Genset (₹5,000)</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Room Fields -->
                            <div v-else class="space-y-4 pt-3 border-t border-slate-100">
                                <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">2. Room Stay Tariffs</h2>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Tariff Per Night (₹)</label>
                                        <input
                                            v-model.number="posRoomTariff"
                                            type="number"
                                            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Nights Stay</label>
                                        <input
                                            v-model.number="posRoomNights"
                                            type="number"
                                            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- GST Rate Slab & Advance Deposit -->
                            <div class="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">GST Tax Slab</label>
                                    <select
                                        v-model.number="posGstRate"
                                        class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                    >
                                        <option :value="5">5% Composite (Catering & Food)</option>
                                        <option :value="12">12% Standard (Hotel Stay &lt; ₹7,500)</option>
                                        <option :value="18">18% Luxury / Banquet Hall Services</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Advance Token Paid (₹)</label>
                                    <input
                                        v-model.number="posAdvance"
                                        type="number"
                                        class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Right: Live Tax Summary & Bill Action (5 Cols) -->
                        <div class="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                                    <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Tax Invoice Summary</span>
                                    <span class="rounded-full bg-purple-50 text-[#673DE6] font-bold text-[10px] px-2.5 py-0.5 border border-purple-200">
                                        SAC 9963
                                    </span>
                                </div>

                                <div class="space-y-2.5 text-xs text-slate-600">
                                    <div class="flex items-center justify-between">
                                        <span>Taxable Subtotal:</span>
                                        <span class="font-semibold text-slate-900">₹{{ posTaxableSubtotal.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div class="flex items-center justify-between text-slate-500">
                                        <span>CGST ({{ posGstRate / 2 }}%):</span>
                                        <span class="font-semibold">₹{{ posCgstAmount.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div class="flex items-center justify-between text-slate-500">
                                        <span>SGST ({{ posGstRate / 2 }}%):</span>
                                        <span class="font-semibold">₹{{ posSgstAmount.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div class="flex items-center justify-between text-purple-700 font-bold">
                                        <span>Total GST ({{ posGstRate }}%):</span>
                                        <span>₹{{ posGstAmount.toLocaleString('en-IN') }}</span>
                                    </div>

                                    <div class="pt-3 border-t border-slate-100 flex items-baseline justify-between text-slate-900">
                                        <span class="text-sm font-bold">Grand Total:</span>
                                        <span class="text-xl font-extrabold text-[#673DE6]">
                                            ₹{{ posGrandTotal.toLocaleString('en-IN') }}
                                        </span>
                                    </div>

                                    <div class="flex items-center justify-between text-emerald-700 font-semibold pt-1">
                                        <span>Advance Token Credited:</span>
                                        <span>- ₹{{ (Number(posAdvance) || 0).toLocaleString('en-IN') }}</span>
                                    </div>

                                    <div class="pt-2 border-t border-dashed border-slate-200 flex items-baseline justify-between">
                                        <span class="text-xs font-bold uppercase text-slate-700">Net Balance Due:</span>
                                        <span class="text-lg font-black text-rose-600">
                                            ₹{{ posBalanceDue.toLocaleString('en-IN') }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-6 space-y-2.5">
                                <button
                                    @click="openInvoicePreview()"
                                    class="w-full py-3 rounded-xl bg-[#673DE6] hover:bg-[#5832D0] text-white font-bold text-xs shadow-md shadow-[#673DE6]/25 transition flex items-center justify-center gap-2"
                                >
                                    <Printer class="h-4 w-4" />
                                    <span>Generate & Print GST Invoice</span>
                                </button>
                                <button
                                    @click="posCustomerName = ''; posAdvance = 0"
                                    class="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
                                >
                                    Reset Form
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ================================================= -->
                <!-- VIEW 3: BANQUET HALLS & SLOT CALENDAR             -->
                <!-- ================================================= -->
                <div v-else-if="currentTab === 'banquet'" class="space-y-6 animate-in fade-in duration-200">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-2">
                                <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Banquet Halls & Event Pipeline</h1>
                                <span
                                    class="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                                    :class="roleLabels[activeRole].bgClass + ' ' + roleLabels[activeRole].colorClass"
                                >
                                    {{ roleLabels[activeRole].title }} ({{ roleLabels[activeRole].badge }})
                                </span>
                            </div>
                            <p class="text-xs sm:text-sm text-slate-500 mt-1">
                                Current Role Access: <strong class="text-slate-700">{{ roleLabels[activeRole].stepAccess }}</strong>
                            </p>
                        </div>
                        <button
                            @click="openNewInquiry(1)"
                            class="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white transition shadow-xs cursor-pointer"
                            :class="activeRole === 'reception' ? 'bg-amber-600 hover:bg-amber-700' : (activeRole === 'manager' ? 'bg-[#673DE6] hover:bg-[#5832D0]' : 'bg-emerald-600 hover:bg-emerald-700')"
                        >
                            <Plus class="h-4 w-4" />
                            <span v-if="activeRole === 'reception'">+ New Reception Intake (Step 1)</span>
                            <span v-else-if="activeRole === 'manager'">+ New Banquet Costing (Step 1 & 2)</span>
                            <span v-else>+ New Banquet Voucher (Full Access)</span>
                        </button>
                    </div>

                    <!-- Banquet Manager: Reception Handover Alert Banner with Quick Slips -->
                    <div
                        v-if="(activeRole === 'manager' || activeRole === 'superadmin') && pendingManagerInquiries.length > 0"
                        class="rounded-2xl border-2 border-amber-300/90 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/5 p-4 sm:p-5 shadow-sm space-y-3 animate-in fade-in duration-300"
                    >
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div class="flex items-start sm:items-center gap-3">
                                <div class="relative h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
                                    <Bell class="h-5 w-5 animate-pulse" />
                                    <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white">
                                        {{ pendingManagerInquiries.length }}
                                    </span>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <h3 class="text-sm sm:text-base font-black text-slate-900">
                                            Attention Banquet Manager: {{ pendingManagerInquiries.length }} Reception Intake{{ pendingManagerInquiries.length > 1 ? 's' : '' }} Waiting for Costing
                                        </h3>
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                            Action Required (Step 2)
                                        </span>
                                    </div>
                                    <p class="text-xs text-slate-600 mt-0.5">
                                        Reception desk has captured new event inquiries. Click any slip below to configure hall allocation, menu packages, and client quotation.
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <button
                                    @click="openInquiryFromNotification(pendingManagerInquiries[0])"
                                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#673DE6] text-white text-xs font-bold hover:bg-[#5832D0] transition shadow-xs cursor-pointer"
                                >
                                    <span>⚡ Cost Next Pending (#{{ pendingManagerInquiries[0].voucherNo }})</span>
                                </button>
                            </div>
                        </div>

                        <!-- Quick Voucher Chips List -->
                        <div class="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Pending Slips:</span>
                            <button
                                v-for="pInq in pendingManagerInquiries"
                                :key="pInq.voucherNo"
                                @click="openInquiryFromNotification(pInq)"
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-xs font-medium text-slate-700 hover:text-[#673DE6] transition shadow-2xs shrink-0 cursor-pointer"
                            >
                                <span class="font-mono font-bold text-[#673DE6]">#{{ pInq.voucherNo }}</span>
                                <span class="font-semibold text-slate-900">{{ pInq.guestName || 'Guest' }}</span>
                                <span class="text-slate-400 text-[10px]">({{ pInq.paxGuaranteed || pInq.paxExpected || 0 }} Pax)</span>
                                <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">Cost Step 2 →</span>
                            </button>
                        </div>
                    </div>

                    <!-- 3-Stage Event Inquiry & Physical Voucher Pipeline -->
                    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <div class="flex items-center gap-2">
                                    <h2 class="text-base font-extrabold text-slate-900">
                                        3-Stage Event Booking & Inquiry Pipeline
                                    </h2>
                                    <span class="rounded-full bg-purple-50 text-[#673DE6] text-[10px] font-bold px-2 py-0.5 border border-purple-200">
                                        Physical Voucher Slip System
                                    </span>
                                </div>
                                <p class="text-xs text-slate-500 mt-0.5">
                                    Stage 1: Reception Capture → Stage 2: Manager Costing → Stage 3: MD Discount Slider & Authorization
                                </p>
                            </div>

                            <div class="flex items-center gap-2">
                                <button
                                    @click="openNewInquiry(1)"
                                    class="inline-flex items-center gap-1.5 rounded-xl bg-[#673DE6] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#5832D0] transition shadow-xs"
                                >
                                    <Plus class="h-4 w-4" />
                                    <span>+ New Inquiry</span>
                                </button>
                            </div>
                        </div>

                        <!-- Inquiry Pipeline Table -->
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs whitespace-nowrap">
                                <thead>
                                    <tr class="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        <th class="pb-3 font-semibold">Slip #</th>
                                        <th class="pb-3 font-semibold">Guest & Contacts</th>
                                        <th class="pb-3 font-semibold">Event & Date</th>
                                        <th class="pb-3 font-semibold">Pax & Menu Tier</th>
                                        <th class="pb-3 font-semibold text-right">Gross Total</th>
                                        <th class="pb-3 font-semibold text-right">Discount (₹)</th>
                                        <th class="pb-3 font-semibold text-right">Net Payable</th>
                                        <th class="pb-3 font-semibold text-right">Advance Paid</th>
                                        <th class="pb-3 font-semibold text-center">Pipeline Stage</th>
                                        <th class="pb-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-slate-600 font-medium">
                                    <tr v-for="inq in banquetInquiries" :key="inq.voucherNo" class="hover:bg-slate-50/80 transition">
                                        <td class="py-3 font-mono">
                                            <div class="font-bold text-[#673DE6]">#{{ inq.voucherNo }}</div>
                                            <div class="mt-0.5">
                                                <button
                                                    type="button"
                                                    @click="toggleInquiryLock(inq)"
                                                    class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition"
                                                    :class="inq.isLocked ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'"
                                                    :title="inq.isLocked ? 'Deal is Locked. Click to unlock.' : 'Deal is Open. Click to lock.'"
                                                >
                                                    <Lock v-if="inq.isLocked" class="h-2.5 w-2.5 text-amber-700" />
                                                    <Unlock v-else class="h-2.5 w-2.5 text-slate-500" />
                                                    <span>{{ inq.isLocked ? 'Locked' : 'Open' }}</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td class="py-3">
                                            <div class="font-bold text-slate-900">{{ inq.guestName }}</div>
                                            <div class="text-[11px] text-slate-500 font-mono">{{ inq.phonePrimary }} • {{ inq.address }}</div>
                                        </td>
                                        <td class="py-3">
                                            <div class="font-semibold text-slate-800">{{ inq.eventType }}</div>
                                            <div class="text-[11px] text-slate-500">{{ inq.functionDateFrom }} ({{ inq.timeFrom }}-{{ inq.timeTo }})</div>
                                        </td>
                                        <td class="py-3">
                                            <div class="font-bold text-slate-900">{{ inq.paxGuaranteed }} Pax</div>
                                            <div class="text-[11px] text-purple-700">
                                                ₹{{ inq.effectiveMenuRate || inq.menuRate || 799 }}/plate
                                                <span v-if="inq.isMeetingSetup" class="text-[9px] text-amber-700 font-bold bg-amber-50 px-1 py-0.5 rounded ml-0.5">Meeting</span>
                                            </div>
                                        </td>
                                        <td class="py-3 text-right font-mono font-bold text-slate-900">
                                            ₹{{ getInquiryFinancials(inq).gross.toLocaleString('en-IN') }}
                                        </td>
                                        <td class="py-3 text-right font-mono">
                                            <div v-if="getInquiryFinancials(inq).discount > 0" class="text-amber-600 font-bold">
                                                -₹{{ getInquiryFinancials(inq).discount.toLocaleString('en-IN') }}
                                                <span v-if="inq.discountPercent" class="text-[10px] text-slate-400 font-normal">({{ inq.discountPercent }}%)</span>
                                            </div>
                                            <span v-else class="text-slate-400">₹0</span>
                                        </td>
                                        <td class="py-3 text-right font-mono font-black text-emerald-700">
                                            ₹{{ getInquiryFinancials(inq).net.toLocaleString('en-IN') }}
                                        </td>
                                        <td class="py-3 text-right font-mono text-slate-700">
                                            <span class="font-bold">₹{{ (Number(inq.amountPaid) || 0).toLocaleString('en-IN') }}</span>
                                            <div class="text-[10px] text-slate-400">
                                                Bal: ₹{{ getInquiryFinancials(inq).balance.toLocaleString('en-IN') }}
                                            </div>
                                        </td>
                                        <td class="py-3 text-center">
                                            <span
                                                v-if="inq.status === 'approved_md'"
                                                class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1"
                                            >
                                                <CheckCircle2 class="h-3 w-3" /> MD Approved & Sealed
                                            </span>
                                            <span
                                                v-else-if="inq.status === 'pending_md'"
                                                class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1"
                                            >
                                                <Clock class="h-3 w-3" /> Awaiting MD Approval
                                            </span>
                                            <span
                                                v-else-if="inq.status === 'pending_manager'"
                                                class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-[#673DE6] border border-purple-200 inline-flex items-center gap-1"
                                            >
                                                <Clock class="h-3 w-3" /> Awaiting Manager Setup
                                            </span>
                                            <span
                                                v-else
                                                class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1"
                                            >
                                                Reception Intake Draft
                                            </span>
                                        </td>
                                        <td class="py-3 text-right">
                                            <div class="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    @click="copyGuestLinkForVoucher(inq.voucherNo)"
                                                    class="rounded-lg bg-purple-50 text-[#673DE6] hover:bg-[#673DE6] hover:text-white px-2 py-1 text-[11px] font-bold transition flex items-center gap-1 border border-purple-200 shadow-2xs cursor-pointer"
                                                    :title="'Copy guest self-selection link for Voucher #' + inq.voucherNo"
                                                >
                                                    <Check v-if="guestLinkCopiedVoucher === inq.voucherNo" class="h-3 w-3 text-emerald-600" />
                                                    <Share2 v-else class="h-3 w-3" />
                                                    <span>{{ guestLinkCopiedVoucher === inq.voucherNo ? 'Copied!' : 'Link' }}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="openAndPrintInquiry(inq)"
                                                    class="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white px-2 py-1 text-[11px] font-bold transition flex items-center gap-1 border border-slate-200 shadow-2xs cursor-pointer"
                                                    title="Print Full Voucher, Package & Menu"
                                                >
                                                    <Printer class="h-3 w-3" />
                                                    <span>Print</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="openAndPrintInquiry(inq)"
                                                    class="rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2 py-1 text-[11px] font-bold transition flex items-center gap-1 border border-emerald-200 shadow-2xs cursor-pointer"
                                                    title="Open Print Preview to Download PDF"
                                                >
                                                    <Download class="h-3 w-3" />
                                                    <span>PDF</span>
                                                </button>
                                                <a
                                                    :href="'/verify/voucher?v=' + inq.voucherNo"
                                                    target="_blank"
                                                    class="rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2 py-1 text-[11px] font-bold transition flex items-center gap-1 border border-emerald-200 shadow-2xs cursor-pointer"
                                                    title="View Public Verification Certificate & Audit Trail"
                                                >
                                                    <ShieldCheck class="h-3 w-3" />
                                                    <span>Verify</span>
                                                </a>

                                                <!-- Role-Specific Action Buttons -->
                                                <template v-if="activeRole === 'reception'">
                                                    <button
                                                        @click="openExistingInquiry(inq, 1)"
                                                        class="rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                                                        title="Edit Reception Intake (Step 1)"
                                                    >
                                                        Edit Step 1
                                                    </button>
                                                </template>
                                                <template v-else-if="activeRole === 'manager'">
                                                    <button
                                                        v-if="inq.status === 'pending_manager' || inq.status === 'draft_reception'"
                                                        @click="openExistingInquiry(inq, 2)"
                                                        class="rounded-lg bg-purple-50 text-[#673DE6] hover:bg-[#673DE6] hover:text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                                                        title="Configure Halls, Pax & Catering (Step 2)"
                                                    >
                                                        Configure Step 2
                                                    </button>
                                                    <button
                                                        v-else
                                                        @click="openExistingInquiry(inq, 2)"
                                                        class="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                                                        title="Review Step 1 & 2 Setup"
                                                    >
                                                        Edit Step 1 & 2
                                                    </button>
                                                </template>
                                                <template v-else-if="activeRole === 'superadmin'">
                                                    <button
                                                        @click="openExistingInquiry(inq, 3)"
                                                        class="rounded-lg bg-slate-100 text-slate-800 hover:bg-[#673DE6] hover:text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                                                        title="Super Admin Edit & Review (All Steps)"
                                                    >
                                                        Edit #{{ inq.voucherNo }}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        @click="requestDeleteInquiry(inq)"
                                                        class="rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white px-2 py-1 text-[11px] font-bold transition flex items-center gap-1 border border-rose-200 shadow-2xs cursor-pointer"
                                                        title="Permanently Delete Inquiry"
                                                    >
                                                        <Trash2 class="h-3 w-3" />
                                                        <span>Delete</span>
                                                    </button>
                                                </template>
                                                <template v-else>
                                                    <button
                                                        v-if="inq.status === 'pending_md'"
                                                        @click="openExistingInquiry(inq, 3)"
                                                        class="rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                                                        title="MD Approval, Discount & Contract Seal"
                                                    >
                                                        👑 MD Sign-off
                                                    </button>
                                                    <button
                                                        v-else
                                                        @click="openExistingInquiry(inq, 3)"
                                                        class="rounded-lg bg-[#F0EBFF] text-[#673DE6] hover:bg-[#673DE6] hover:text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                                                        title="Full 3-Step Review & Voucher"
                                                    >
                                                        Voucher #{{ inq.voucherNo }}
                                                    </button>
                                                    <!-- Delete button for MD Sir & Super Admin -->
                                                    <button
                                                        type="button"
                                                        @click="requestDeleteInquiry(inq)"
                                                        class="rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white px-2 py-1 text-[11px] font-bold transition flex items-center gap-1 border border-rose-200 shadow-2xs cursor-pointer"
                                                        title="Permanently Delete Inquiry"
                                                    >
                                                        <Trash2 class="h-3 w-3" />
                                                        <span>Delete</span>
                                                    </button>
                                                </template>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="banquetInquiries.length === 0">
                                        <td colspan="10" class="py-8 text-center text-slate-400">
                                            <div class="flex flex-col items-center justify-center gap-1.5">
                                                <Calendar class="h-7 w-7 text-slate-300" />
                                                <span class="text-xs font-semibold text-slate-600">No Event Inquiries Registered Yet</span>
                                                <span class="text-[10px] text-slate-400">Click "+ New Inquiry" to create the first 3-stage banquet slip</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Master Banquet Venues Display (6 Senani Halls & Grounds) -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div
                            v-for="hall in banquetHalls"
                            :key="hall.code"
                            class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                        >
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <span :class="['rounded-full text-[10px] font-bold px-2.5 py-0.5 border', hall.badgeClass]">
                                        Capacity: {{ hall.capacity }} Pax
                                    </span>
                                    <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                </div>
                                <h3 class="text-base font-bold text-slate-900">{{ hall.name }}</h3>
                                <p class="text-xs text-slate-500 mt-1">{{ hall.desc }}</p>
                                <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                                    <div class="flex items-center justify-between">
                                        <span>Morning Slot:</span>
                                        <span :class="getSlotStatus(hall.code, 'Morning').isBooked ? 'font-bold text-[#673DE6]' : 'font-bold text-emerald-600'">
                                            {{ getSlotStatus(hall.code, 'Morning').label }}
                                        </span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span>Evening Slot:</span>
                                        <span :class="getSlotStatus(hall.code, 'Evening').isBooked ? 'font-bold text-[#673DE6]' : 'font-bold text-emerald-600'">
                                            {{ getSlotStatus(hall.code, 'Evening').label }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                @click="posBillType = 'banquet'; posHallRent = hall.rent; currentTab = 'billing'"
                                :class="['mt-4 w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer', hall.btnClass]"
                            >
                                Quick Bill (₹{{ hall.rent.toLocaleString('en-IN') }})
                            </button>
                        </div>
                    </div>

                    <!-- Bookings Schedule List -->
                    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                        <h2 class="text-base font-bold text-slate-900 mb-4">Confirmed Upcoming Functions</h2>
                        <div v-if="banquetBookings.length > 0" class="space-y-3">
                            <div
                                v-for="bk in banquetBookings"
                                :key="bk.id"
                                class="p-4 rounded-xl border border-slate-200/80 bg-[#F8F9FD] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="font-bold text-[#673DE6] text-xs">{{ bk.id }}</span>
                                        <span class="text-xs font-semibold text-slate-500">• {{ bk.hallName }}</span>
                                    </div>
                                    <h3 class="text-sm font-bold text-slate-900">{{ bk.eventName }}</h3>
                                    <p class="text-xs text-slate-500 mt-0.5">{{ bk.clientName }} ({{ bk.phone }}) • {{ bk.date }} • {{ bk.slot }}</p>
                                </div>
                                <div class="flex sm:flex-col items-end justify-between gap-1 text-right">
                                    <span class="text-sm font-extrabold text-slate-900">₹{{ bk.totalAmount.toLocaleString('en-IN') }}</span>
                                    <span class="text-xs font-semibold text-emerald-600">Paid: ₹{{ bk.advancePaid.toLocaleString('en-IN') }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="py-6 text-center text-slate-400 bg-[#F8F9FD] rounded-xl border border-dashed border-slate-200">
                            <Calendar class="h-6 w-6 mx-auto text-slate-300 mb-1" />
                            <p class="text-xs font-semibold text-slate-600">No confirmed upcoming functions</p>
                            <p class="text-[10px] text-slate-400 mt-0.5">Approved banquet inquiries will automatically populate here</p>
                        </div>
                    </div>
                </div>

                <!-- ================================================= -->
                <!-- VIEW 4: ROOM MATRIX & FRONT DESK                  -->
                <!-- ================================================= -->
                <div v-else-if="currentTab === 'rooms'" class="space-y-6 animate-in fade-in duration-200">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Room Inventory & Front Desk</h1>
                            <p class="text-xs sm:text-sm text-slate-500 mt-1">
                                Live status of all 32 rooms with check-in, check-out, and housekeeping dispatch
                            </p>
                        </div>
                        <button
                            @click="showCheckInModal = true"
                            class="inline-flex items-center gap-1.5 rounded-xl bg-[#673DE6] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#5832D0] transition shadow-xs"
                        >
                            <Plus class="h-4 w-4" /> Guest Check-In
                        </button>
                    </div>

                    <!-- Floor & Status Filters -->
                    <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-xs font-bold text-slate-400 mr-1">Floor:</span>
                            <button
                                @click="roomFloorFilter = 'all'"
                                :class="['px-3 py-1 rounded-lg text-xs font-semibold transition', roomFloorFilter === 'all' ? 'bg-[#673DE6] text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
                            >
                                All Floors
                            </button>
                            <button
                                @click="roomFloorFilter = 1"
                                :class="['px-3 py-1 rounded-lg text-xs font-semibold transition', roomFloorFilter === 1 ? 'bg-[#673DE6] text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
                            >
                                1st Floor (Deluxe)
                            </button>
                            <button
                                @click="roomFloorFilter = 2"
                                :class="['px-3 py-1 rounded-lg text-xs font-semibold transition', roomFloorFilter === 2 ? 'bg-[#673DE6] text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
                            >
                                2nd Floor (Super Deluxe)
                            </button>
                            <button
                                @click="roomFloorFilter = 3"
                                :class="['px-3 py-1 rounded-lg text-xs font-semibold transition', roomFloorFilter === 3 ? 'bg-[#673DE6] text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
                            >
                                3rd Floor (Suites)
                            </button>
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-slate-400 mr-1">Status:</span>
                            <select
                                v-model="roomStatusFilter"
                                class="rounded-xl border border-slate-200 bg-[#F8F9FD] px-3 py-1 text-xs text-slate-900 focus:outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="available">Available ({{ roomStats.available }})</option>
                                <option value="occupied">Occupied ({{ roomStats.occupied }})</option>
                                <option value="cleaning">Cleaning ({{ roomStats.cleaning }})</option>
                                <option value="reserved">Reserved ({{ roomStats.reserved }})</option>
                            </select>
                        </div>
                    </div>

                    <!-- Room Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div
                            v-for="room in filteredRooms"
                            :key="room.id"
                            class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                        >
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-lg font-extrabold text-slate-900">Room {{ room.number }}</span>
                                    <span
                                        :class="[
                                            'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                            room.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                            room.status === 'occupied' ? 'bg-purple-50 text-[#673DE6] border border-purple-200' :
                                            room.status === 'cleaning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                            'bg-blue-50 text-blue-700 border border-blue-200'
                                        ]"
                                    >
                                        {{ room.status }}
                                    </span>
                                </div>
                                <p class="text-xs font-medium text-slate-500">{{ room.category }} • Floor {{ room.floor }}</p>

                                <div class="mt-3 p-2.5 rounded-xl bg-[#F8F9FD] text-xs">
                                    <div v-if="room.status === 'occupied'" class="space-y-1">
                                        <p class="font-bold text-slate-900">{{ room.guestName }}</p>
                                        <p class="text-[11px] text-slate-500">Stay: {{ room.checkIn }} - {{ room.checkOut }}</p>
                                    </div>
                                    <div v-else-if="room.status === 'available'" class="space-y-0.5">
                                        <p class="font-bold text-emerald-700">₹{{ room.pricePerNight }}/night</p>
                                        <p class="text-[10px] text-slate-400">Ready for immediate check-in</p>
                                    </div>
                                    <div v-else-if="room.status === 'cleaning'" class="space-y-0.5">
                                        <p class="font-bold text-amber-700">Housekeeping In-Progress</p>
                                        <p class="text-[10px] text-slate-400">Linens & sanitization</p>
                                    </div>
                                    <div v-else class="space-y-0.5">
                                        <p class="font-bold text-blue-700">Reserved for {{ room.guestName }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                                <button
                                    v-if="room.status === 'available'"
                                    @click="checkInRoomNumber = room.number; showCheckInModal = true"
                                    class="w-full py-1.5 rounded-lg bg-[#673DE6] text-white font-bold hover:bg-[#5832D0] transition"
                                >
                                    Check In Guest
                                </button>
                                <button
                                    v-else-if="room.status === 'occupied'"
                                    @click="updateRoomStatus(room.id, 'cleaning')"
                                    class="w-full py-1.5 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition"
                                >
                                    Check-Out & Bill
                                </button>
                                <button
                                    v-else-if="room.status === 'cleaning'"
                                    @click="updateRoomStatus(room.id, 'available')"
                                    class="w-full py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition"
                                >
                                    Mark Cleaned
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ================================================= -->
                <!-- VIEW 5: TAX INVOICES & REGISTERS                  -->
                <!-- ================================================= -->
                <div v-else-if="currentTab === 'invoices'" class="space-y-6 animate-in fade-in duration-200">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Tax Invoices & GST Registers</h1>
                            <p class="text-xs sm:text-sm text-slate-500 mt-1">
                                GST Compliant electronic registers ready for GSTR-1 & monthly accounting audits
                            </p>
                        </div>
                        <button
                            @click="currentTab = 'billing'"
                            class="inline-flex items-center gap-1.5 rounded-xl bg-[#673DE6] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#5832D0] transition shadow-xs"
                        >
                            <Plus class="h-4 w-4" /> Create New Bill
                        </button>
                    </div>

                    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead>
                                    <tr class="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        <th class="pb-3 font-semibold">Invoice No</th>
                                        <th class="pb-3 font-semibold">Date & Time</th>
                                        <th class="pb-3 font-semibold">Customer / Corporate</th>
                                        <th class="pb-3 font-semibold">Service Description</th>
                                        <th class="pb-3 font-semibold text-right">Taxable</th>
                                        <th class="pb-3 font-semibold text-right">GST</th>
                                        <th class="pb-3 font-semibold text-right">Total Amount</th>
                                        <th class="pb-3 font-semibold">Payment Mode</th>
                                        <th class="pb-3 font-semibold text-center">Status</th>
                                        <th class="pb-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-slate-600 font-medium">
                                    <tr v-for="inv in recentInvoices" :key="inv.invoiceNo" class="hover:bg-slate-50/80 transition">
                                        <td class="py-3 font-bold text-[#673DE6]">{{ inv.invoiceNo }}</td>
                                        <td class="py-3 text-slate-500">{{ inv.date }}</td>
                                        <td class="py-3 font-semibold text-slate-900">{{ inv.customerName }}</td>
                                        <td class="py-3 text-slate-500 truncate max-w-xs">{{ inv.serviceType }}</td>
                                        <td class="py-3 text-right">₹{{ inv.taxableAmount.toLocaleString('en-IN') }}</td>
                                        <td class="py-3 text-right text-purple-700 font-semibold">
                                            ₹{{ inv.gstAmount.toLocaleString('en-IN') }} ({{ inv.gstRate }}%)
                                        </td>
                                        <td class="py-3 text-right font-bold text-slate-900">
                                            ₹{{ inv.totalAmount.toLocaleString('en-IN') }}
                                        </td>
                                        <td class="py-3">
                                            <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                                {{ inv.paymentMode }}
                                            </span>
                                        </td>
                                        <td class="py-3 text-center">
                                            <span
                                                :class="[
                                                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                                    inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    inv.status === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                                ]"
                                            >
                                                {{ inv.status }}
                                            </span>
                                        </td>
                                        <td class="py-3 text-right">
                                            <button
                                                @click="openInvoicePreview(inv)"
                                                class="rounded-lg bg-purple-50 text-[#673DE6] hover:bg-[#673DE6] hover:text-white px-2.5 py-1 text-[11px] font-bold transition inline-flex items-center gap-1"
                                            >
                                                <Eye class="h-3 w-3" /> View Bill
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="recentInvoices.length === 0">
                                        <td colspan="10" class="py-8 text-center text-slate-400">
                                            <div class="flex flex-col items-center justify-center gap-1.5">
                                                <Receipt class="h-7 w-7 text-slate-300" />
                                                <span class="text-xs font-semibold text-slate-600">No GST Invoices Recorded</span>
                                                <span class="text-[10px] text-slate-400">Bills created at the POS Billing Counter will be registered here</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- ================================================= -->
                <!-- VIEW 6: GUEST DIRECTORY                           -->
                <!-- ================================================= -->
                <div v-else-if="currentTab === 'guests'" class="space-y-6 animate-in fade-in duration-200">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Guest Profiles & CRM</h1>
                            <p class="text-xs sm:text-sm text-slate-500 mt-1">
                                Verified guest records, loyalty history, and stay preferences
                            </p>
                        </div>
                    </div>

                    <div v-if="guestProfiles.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            v-for="guest in guestProfiles"
                            :key="guest.name + guest.phone"
                            class="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs"
                        >
                            <div class="flex items-center gap-3 mb-3">
                                <div class="h-10 w-10 rounded-xl bg-purple-100 text-[#673DE6] font-bold flex items-center justify-center">
                                    {{ guest.initials }}
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-900">{{ guest.name }}</h4>
                                    <p class="text-xs text-slate-500">{{ guest.phone }} • {{ guest.city }}</p>
                                </div>
                            </div>
                            <div class="text-xs text-slate-600 space-y-1 pt-3 border-t border-slate-100">
                                <div class="flex justify-between"><span>Activity:</span><span class="font-bold text-slate-900">{{ guest.eventType }}</span></div>
                                <div class="flex justify-between"><span>Venue / Room:</span><span class="font-semibold text-purple-700">{{ guest.venue }}</span></div>
                                <div class="flex justify-between"><span>Paid / Spend:</span><span class="font-bold text-[#673DE6]">₹{{ guest.spend.toLocaleString('en-IN') }}</span></div>
                                <div class="flex justify-between"><span>Status:</span><span class="font-semibold text-emerald-600">{{ guest.status }}</span></div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 p-8">
                        <div class="flex flex-col items-center justify-center gap-2">
                            <Users class="h-10 w-10 text-slate-300 mx-auto" />
                            <span class="text-sm font-bold text-slate-700">No Guest Profiles Found</span>
                            <span class="text-xs text-slate-400 max-w-sm">Guest profiles are automatically registered when you capture new event inquiries or room check-ins.</span>
                        </div>
                    </div>
                </div>

                <!-- ================================================= -->
                <!-- VIEW 7: SERVER & SECURITY AUDIT                   -->
                <!-- ================================================= -->
                <div v-else-if="currentTab === 'security'" class="space-y-6 animate-in fade-in duration-200">
                    <div>
                        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Hostinger Cloud Server & Security Status</h1>
                        <p class="text-xs sm:text-sm text-slate-500 mt-1">
                            Live infrastructure telemetry, 256-bit SSL certificate & audit trails
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div class="flex items-center justify-between text-[#673DE6]">
                                <span class="text-xs font-bold uppercase text-slate-400">Web Engine</span>
                                <Server class="h-5 w-5" />
                            </div>
                            <div class="mt-3 text-lg font-bold text-slate-900">LiteSpeed Web Server</div>
                            <p class="text-xs text-slate-500 mt-1">HTTP/3 enabled, Gzip active</p>
                        </div>

                        <div class="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div class="flex items-center justify-between text-blue-600">
                                <span class="text-xs font-bold uppercase text-slate-400">Database</span>
                                <Database class="h-5 w-5" />
                            </div>
                            <div class="mt-3 text-lg font-bold text-slate-900">MySQL 8.4 Engine</div>
                            <p class="text-xs text-slate-500 mt-1">Hostinger isolated database</p>
                        </div>

                        <div class="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div class="flex items-center justify-between text-emerald-600">
                                <span class="text-xs font-bold uppercase text-slate-400">SSL Encryption</span>
                                <Lock class="h-5 w-5" />
                            </div>
                            <div class="mt-3 text-lg font-bold text-slate-900">256-Bit SSL</div>
                            <p class="text-xs text-slate-500 mt-1">Encrypted sessions & payments</p>
                        </div>

                        <div class="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div class="flex items-center justify-between text-amber-600">
                                <span class="text-xs font-bold uppercase text-slate-400">Firewall Guard</span>
                                <ShieldCheck class="h-5 w-5" />
                            </div>
                            <div class="mt-3 text-lg font-bold text-slate-900">Rate Limiter Active</div>
                            <p class="text-xs text-slate-500 mt-1">Brute-force lockout enabled</p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>

        <!-- ========================================================= -->
        <!-- MODAL 1: OFFICIAL GST TAX INVOICE PRINT PREVIEW           -->
        <!-- ========================================================= -->
        <div
            v-if="showInvoiceModal && activeModalInvoice"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
            <div class="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <!-- Modal Top Action Bar -->
                <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
                    <div class="flex items-center gap-2">
                        <span class="rounded-full bg-purple-100 text-[#673DE6] text-xs font-bold px-3 py-1">
                            Official Tax Invoice
                        </span>
                        <span class="text-xs text-slate-500">{{ activeModalInvoice.invoiceNo }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            @click="printInvoice"
                            class="inline-flex items-center gap-1.5 rounded-xl bg-[#673DE6] px-4 py-2 text-xs font-bold text-white hover:bg-[#5832D0] shadow-sm transition"
                        >
                            <Printer class="h-4 w-4" /> Print Tax Invoice
                        </button>
                        <button
                            @click="showInvoiceModal = false"
                            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <!-- Printable Invoice Layout -->
                <div id="printable-gst-invoice" class="p-6 sm:p-8 border border-slate-200 rounded-xl bg-white text-slate-900">
                    <!-- Header -->
                    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
                        <div>
                            <div class="flex items-center gap-3">
                                <img src="/images/logo-dark.png" alt="Senani Hotel Pleasant View" class="h-12 sm:h-14 w-auto object-contain" />
                                <div class="border-l border-slate-200 pl-3">
                                    <div class="text-base font-black tracking-tight text-slate-900">SENANI HOTEL & BANQUET</div>
                                    <p class="text-[10px] text-slate-500 font-medium">Hotel Pleasant View • Civil Lines, Raebareli, UP</p>
                                </div>
                            </div>
                            <p class="text-xs text-slate-500 mt-2">Railway Station Road, Civil Lines, Uttar Pradesh - 229001</p>
                            <p class="text-xs text-slate-500">GSTIN: <span class="font-bold text-slate-800">09AAAAA0000A1Z5</span> • State Code: 09</p>
                        </div>
                        <div class="text-left sm:text-right">
                            <span class="text-base font-extrabold text-[#673DE6] uppercase tracking-wider block">GST TAX INVOICE</span>
                            <p class="text-xs font-bold text-slate-800 mt-1">{{ activeModalInvoice.invoiceNo }}</p>
                            <p class="text-xs text-slate-500">{{ activeModalInvoice.date }}</p>
                        </div>
                    </div>

                    <!-- Billed To -->
                    <div class="py-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                            <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Billed To:</span>
                            <p class="text-sm font-bold text-slate-900 mt-0.5">{{ activeModalInvoice.customerName }}</p>
                            <p class="text-slate-500">Payment Mode: {{ activeModalInvoice.paymentMode }}</p>
                        </div>
                        <div class="sm:text-right">
                            <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Invoice Type:</span>
                            <p class="text-xs font-semibold text-slate-800 mt-0.5">Composite Hospitality & Catering Supply</p>
                            <p class="text-xs text-slate-500">SAC Code: 996331 / 996311</p>
                        </div>
                    </div>

                    <!-- Invoice Line Items Table -->
                    <table class="w-full text-left text-xs my-5">
                        <thead>
                            <tr class="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                <th class="pb-2">Description</th>
                                <th class="pb-2 text-center">SAC Code</th>
                                <th class="pb-2 text-right">Taxable Value</th>
                                <th class="pb-2 text-right">CGST</th>
                                <th class="pb-2 text-right">SGST</th>
                                <th class="pb-2 text-right">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            <tr>
                                <td class="py-3 font-semibold text-slate-900">{{ activeModalInvoice.serviceType }}</td>
                                <td class="py-3 text-center text-slate-500">9963</td>
                                <td class="py-3 text-right">₹{{ activeModalInvoice.taxableAmount.toLocaleString('en-IN') }}</td>
                                <td class="py-3 text-right">₹{{ Math.round(activeModalInvoice.gstAmount / 2).toLocaleString('en-IN') }}</td>
                                <td class="py-3 text-right">₹{{ Math.round(activeModalInvoice.gstAmount / 2).toLocaleString('en-IN') }}</td>
                                <td class="py-3 text-right font-bold text-slate-900">₹{{ activeModalInvoice.totalAmount.toLocaleString('en-IN') }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Totals and Balance Due -->
                    <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs">
                        <div class="text-slate-500 space-y-1">
                            <p class="font-bold text-slate-700">Terms & Conditions:</p>
                            <p>1. Invoices are computer generated and valid under Indian GST Act.</p>
                            <p>2. Advance token is non-refundable upon cancellation within 48 hours.</p>
                        </div>
                        <div class="w-full sm:w-64 space-y-2 text-xs">
                            <div class="flex justify-between text-slate-600"><span>Taxable Value:</span><span>₹{{ activeModalInvoice.taxableAmount.toLocaleString('en-IN') }}</span></div>
                            <div class="flex justify-between text-slate-600"><span>Total GST ({{ activeModalInvoice.gstRate }}%):</span><span>₹{{ activeModalInvoice.gstAmount.toLocaleString('en-IN') }}</span></div>
                            <div class="flex justify-between font-bold text-slate-900 text-sm border-t pt-1">
                                <span>Grand Total:</span>
                                <span class="text-[#673DE6]">₹{{ activeModalInvoice.totalAmount.toLocaleString('en-IN') }}</span>
                            </div>
                            <div class="flex justify-between text-emerald-700 font-semibold">
                                <span>Advance Paid:</span>
                                <span>- ₹{{ activeModalInvoice.advancePaid.toLocaleString('en-IN') }}</span>
                            </div>
                            <div class="flex justify-between font-bold text-rose-600 text-sm border-t pt-1">
                                <span>Balance Payable:</span>
                                <span>₹{{ activeModalInvoice.balanceDue.toLocaleString('en-IN') }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- MODAL 2: QUICK CHECK-IN FORM                              -->
        <!-- ========================================================= -->
        <div
            v-if="showCheckInModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
            <div class="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl">
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <h3 class="text-base font-bold text-slate-900">New Guest Check-In</h3>
                    <button @click="showCheckInModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                        <X class="h-4 w-4" />
                    </button>
                </div>

                <form @submit.prevent="submitCheckIn" class="space-y-3.5 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Select Room</label>
                        <select
                            v-model="checkInRoomNumber"
                            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                        >
                            <option
                                v-for="r in rooms.filter(x => x.status === 'available')"
                                :key="r.id"
                                :value="r.number"
                            >
                                Room {{ r.number }} ({{ r.category }} - ₹{{ r.pricePerNight }}/night)
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Guest Full Name</label>
                        <input
                            v-model="checkInGuestName"
                            type="text"
                            required
                            placeholder="e.g. Alok Verma"
                            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                        />
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Contact Mobile</label>
                        <input
                            v-model="checkInPhone"
                            type="tel"
                            required
                            placeholder="+91 Mobile Number"
                            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 mb-1">ID Proof</label>
                            <select
                                v-model="checkInIdType"
                                class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                            >
                                <option>Aadhaar Card</option>
                                <option>Passport</option>
                                <option>Driving License</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 mb-1">Deposit (₹)</label>
                            <input
                                v-model.number="checkInDeposit"
                                type="number"
                                class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>

                    <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                            type="submit"
                            class="flex-1 py-2.5 rounded-xl bg-[#673DE6] hover:bg-[#5832D0] text-white font-bold text-xs transition"
                        >
                            Confirm Check-In
                        </button>
                        <button
                            type="button"
                            @click="showCheckInModal = false"
                            class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- MODAL 3: 3-STEP BANQUET INQUIRY WIZARD                   -->
        <!-- ========================================================= -->
        <InquiryWizardModal
            :show="showInquiryModal"
            :initialInquiry="selectedInquiry"
            :suggestedVoucherNo="nextVoucherNo"
            :defaultStep="inquiryDefaultStep"
            :openPrintPreview="inquiryOpenPrintPreview"
            :userRole="activeRole"
            @close="showInquiryModal = false; inquiryOpenPrintPreview = false"
            @save="handleSaveInquiry"
            @delete="requestDeleteInquiry"
        />

        <!-- ========================================================= -->
        <!-- MODAL 4: SUPER ADMIN INQUIRY DELETE CONFIRMATION          -->
        <!-- ========================================================= -->
        <div
            v-if="showDeleteConfirmModal && inquiryToDelete"
            class="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
            <div class="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
                <div class="flex items-start gap-3.5">
                    <div class="h-11 w-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertTriangle class="h-5 w-5" />
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-900">Permanently Delete Inquiry?</h3>
                        <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                            You are deleting Banquet Inquiry <strong class="text-slate-900 font-mono">#{{ inquiryToDelete.voucherNo }}</strong> for <strong class="text-slate-900">{{ inquiryToDelete.guestName }}</strong> ({{ inquiryToDelete.eventType }}).
                        </p>
                        <p class="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                            <span>⚡</span> Super Administrator Authorization Confirmed.
                        </p>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                        type="button"
                        @click="showDeleteConfirmModal = false; inquiryToDelete = null"
                        class="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        @click="confirmDeleteInquiry"
                        class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <Trash2 class="h-3.5 w-3.5" />
                        <span>Confirm & Delete</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Real-Time Floating Notification Toasts -->
        <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
            <div
                v-for="toast in activeToasts"
                :key="toast.id"
                class="pointer-events-auto rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-2xl border flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-in slide-in-from-bottom-5"
                :class="[
                    toast.type === 'success'
                        ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                        : (toast.type === 'warning'
                            ? 'border-amber-400 bg-amber-50/60 text-amber-950'
                            : 'border-purple-300 bg-purple-50/40 text-slate-900')
                ]"
            >
                <div
                    class="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    :class="[
                        toast.type === 'success'
                            ? 'bg-emerald-500 text-white'
                            : (toast.type === 'warning'
                                ? 'bg-amber-500 text-white'
                                : 'bg-[#673DE6] text-white')
                    ]"
                >
                    <Bell class="h-4 w-4" />
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-xs font-black leading-tight">{{ toast.title }}</h4>
                    <p class="text-[11px] mt-0.5 leading-snug opacity-90">{{ toast.message }}</p>
                    <div v-if="toast.voucherNo && (activeRole === 'manager' || activeRole === 'superadmin')" class="mt-2">
                        <button
                            type="button"
                            @click="openVoucherByNumber(toast.voucherNo)"
                            class="px-2.5 py-1 rounded-lg bg-[#673DE6] text-white text-[10px] font-extrabold hover:bg-[#5832D0] transition shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                            <span>⚡ Cost Step 2 Now</span>
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    @click="activeToasts = activeToasts.filter(t => t.id !== toast.id)"
                    class="text-slate-400 hover:text-slate-600 shrink-0 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                    <X class="h-3.5 w-3.5" />
                </button>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Ultra-Sleek Modern Minimal Scrollbars */
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.35);
    border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.65);
}
</style>
