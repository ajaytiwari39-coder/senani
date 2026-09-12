<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import {
    Building2,
    ShieldCheck,
    Users,
    Receipt,
    Calendar,
    Clock,
    Lock,
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
    Eye
} from '@lucide/vue';
import { home } from '@/routes';

defineOptions({
    layout: null,
});

const page = usePage();
const user = page.props.auth?.user || { name: 'Super Admin', email: 'admin@senani.com' };

const logout = () => {
    router.post('/logout');
};

// -------------------------------------------------------------
// Active Tab State (0ms SPA Instant Transition)
// -------------------------------------------------------------
type AdminTab = 'dashboard' | 'rooms' | 'banquet' | 'billing' | 'invoices' | 'guests' | 'security';
const currentTab = ref<AdminTab>('dashboard');
const isMobileMenuOpen = ref(false);
const isSidebarCollapsed = ref(typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('collapsed') === 'true' || localStorage.getItem('senani_sidebar_collapsed') === 'true'));
const toggleSidebarCollapse = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    if (typeof window !== 'undefined') {
        localStorage.setItem('senani_sidebar_collapsed', String(isSidebarCollapsed.value));
    }
};
const searchQuery = ref('');

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
    { id: 101, number: '101', floor: 1, category: 'Deluxe', status: 'occupied', pricePerNight: 2800, guestName: 'Rajesh Malhotra', checkIn: '11 Sep', checkOut: '13 Sep' },
    { id: 102, number: '102', floor: 1, category: 'Deluxe', status: 'available', pricePerNight: 2800 },
    { id: 103, number: '103', floor: 1, category: 'Deluxe', status: 'occupied', guestName: 'Vikram Singhania', pricePerNight: 2800, checkIn: '10 Sep', checkOut: '14 Sep' },
    { id: 104, number: '104', floor: 1, category: 'Deluxe', status: 'cleaning', pricePerNight: 2800 },
    { id: 105, number: '105', floor: 1, category: 'Deluxe', status: 'occupied', guestName: 'Pooja Agarwal', pricePerNight: 2800, checkIn: '12 Sep', checkOut: '15 Sep' },
    { id: 106, number: '106', floor: 1, category: 'Deluxe', status: 'available', pricePerNight: 2800 },
    { id: 201, number: '201', floor: 2, category: 'Super Deluxe', status: 'occupied', guestName: 'Dr. Sameer Joshi', pricePerNight: 4200, checkIn: '11 Sep', checkOut: '13 Sep' },
    { id: 202, number: '202', floor: 2, category: 'Super Deluxe', status: 'occupied', guestName: 'Alok Nath Pandey', pricePerNight: 4200, checkIn: '12 Sep', checkOut: '14 Sep' },
    { id: 203, number: '203', floor: 2, category: 'Super Deluxe', status: 'available', pricePerNight: 4200 },
    { id: 204, number: '204', floor: 2, category: 'Super Deluxe', status: 'reserved', guestName: 'Kavita Chawla', pricePerNight: 4200, checkIn: '13 Sep', checkOut: '16 Sep' },
    { id: 205, number: '205', floor: 2, category: 'Super Deluxe', status: 'occupied', guestName: 'Sanjay Kapoor', pricePerNight: 4200, checkIn: '10 Sep', checkOut: '13 Sep' },
    { id: 206, number: '206', floor: 2, category: 'Super Deluxe', status: 'cleaning', pricePerNight: 4200 },
    { id: 301, number: '301', floor: 3, category: 'Executive Suite', status: 'occupied', guestName: 'Anand Mahindra (VIP)', pricePerNight: 7500, checkIn: '11 Sep', checkOut: '14 Sep' },
    { id: 302, number: '302', floor: 3, category: 'Executive Suite', status: 'occupied', guestName: 'Amitabh Raizada', pricePerNight: 7500, checkIn: '12 Sep', checkOut: '15 Sep' },
    { id: 303, number: '303', floor: 3, category: 'Presidential Suite', status: 'available', pricePerNight: 12500 },
    { id: 304, number: '304', floor: 3, category: 'Presidential Suite', status: 'reserved', guestName: 'Sharma Wedding Delegation', pricePerNight: 12500, checkIn: '13 Sep', checkOut: '15 Sep' },
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

const banquetBookings = ref<BanquetBooking[]>([
    {
        id: 'BQ-2026-081',
        hallName: 'Grand Ballroom',
        eventName: 'Verma-Sharma Wedding Reception',
        clientName: 'Suresh Chandra Verma',
        phone: '+91 98391 22441',
        date: 'Today, 12 Sep 2026',
        slot: 'Evening (7 PM - 1 AM)',
        paxCount: 450,
        plateRate: 950,
        totalAmount: 485000,
        advancePaid: 350000,
        balanceDue: 135000,
        status: 'confirmed',
    },
    {
        id: 'BQ-2026-082',
        hallName: 'Sapphire Hall',
        eventName: 'TechCorp Annual Leadership Seminar',
        clientName: 'Deepak Saxena (HR Head)',
        phone: '+91 94150 88722',
        date: 'Today, 12 Sep 2026',
        slot: 'Morning (10 AM - 4 PM)',
        paxCount: 140,
        plateRate: 750,
        totalAmount: 145000,
        advancePaid: 145000,
        balanceDue: 0,
        status: 'settled',
    },
    {
        id: 'BQ-2026-083',
        hallName: 'Royal Lawn & Terrace',
        eventName: 'Gupta Family Silver Jubilee Gala',
        clientName: 'Rameshwar Gupta',
        phone: '+91 99351 10984',
        date: 'Tomorrow, 13 Sep 2026',
        slot: 'Evening (7 PM - 1 AM)',
        paxCount: 300,
        plateRate: 850,
        totalAmount: 310000,
        advancePaid: 150000,
        balanceDue: 160000,
        status: 'confirmed',
    },
]);

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

const recentInvoices = ref<GstInvoice[]>([
    {
        invoiceNo: 'SN-INV-2026-0412',
        date: '12 Sep, 02:15 PM',
        customerName: 'TechCorp India Pvt Ltd',
        serviceType: 'Sapphire Hall Seminar & Buffet',
        taxableAmount: 138095,
        gstRate: 5,
        gstAmount: 6905,
        totalAmount: 145000,
        paymentMode: 'Bank NEFT',
        status: 'Paid',
    },
    {
        invoiceNo: 'SN-INV-2026-0411',
        date: '12 Sep, 11:40 AM',
        customerName: 'Rajesh Malhotra',
        serviceType: 'Room 101 Deluxe Stay (2 Nights)',
        taxableAmount: 5000,
        gstRate: 12,
        gstAmount: 600,
        totalAmount: 5600,
        paymentMode: 'UPI / QR',
        status: 'Paid',
    },
    {
        invoiceNo: 'SN-INV-2026-0410',
        date: '11 Sep, 08:30 PM',
        customerName: 'Vikram Singhania',
        serviceType: 'Room 103 Folio + Dine-in Room Service',
        taxableAmount: 8200,
        gstRate: 12,
        gstAmount: 984,
        totalAmount: 9184,
        paymentMode: 'Credit Card',
        status: 'Paid',
    },
    {
        invoiceNo: 'SN-INV-2026-0409',
        date: '11 Sep, 04:10 PM',
        customerName: 'Suresh Chandra Verma',
        serviceType: 'Grand Ballroom Wedding Advance Token',
        taxableAmount: 333333,
        gstRate: 5,
        gstAmount: 16667,
        totalAmount: 350000,
        paymentMode: 'Bank NEFT',
        status: 'Partial',
    },
    {
        invoiceNo: 'SN-INV-2026-0408',
        date: '10 Sep, 10:20 AM',
        customerName: 'Dr. Sameer Joshi',
        serviceType: 'Super Deluxe Room 201 Advance',
        taxableAmount: 7500,
        gstRate: 12,
        gstAmount: 900,
        totalAmount: 8400,
        paymentMode: 'UPI / QR',
        status: 'Paid',
    },
]);

// -------------------------------------------------------------
// Interactive Fast GST POS Billing Engine State
// -------------------------------------------------------------
const posBillType = ref<'banquet' | 'room' | 'restaurant'>('banquet');
const posCustomerName = ref('Mr. Kailash Nath Aggarwal');
const posPhone = ref('+91 98390 12345');
const posGstin = ref('');
const posPax = ref(250);
const posPlateRate = ref(850);
const posHallRent = ref(40000);
const posDj = ref(true);
const posDjRate = ref(15000);
const posDecor = ref(true);
const posDecorRate = ref(20000);
const posGenset = ref(true);
const posGensetRate = ref(5000);
const posRoomTariff = ref(5600);
const posRoomNights = ref(2);
const posGstRate = ref(5);
const posAdvance = ref(50000);

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
                <div class="max-w-[1600px] mx-auto p-4 sm:p-5 lg:p-6">

                    <!-- ================================================= -->
                    <!-- VIEW 1: EXECUTIVE DASHBOARD (Overview Tab)        -->
                    <!-- ================================================= -->
                    <div v-if="currentTab === 'dashboard'" class="space-y-5 sm:space-y-6 animate-in fade-in duration-200">

                    <!-- Welcome Header & Live Date Bar -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                Welcome back, {{ user.name }}
                            </h1>
                            <p class="text-xs sm:text-sm text-slate-500 mt-1">
                                Real-time Hospitality, Banquet & Financial Operations Overview
                            </p>
                        </div>

                        <!-- Date & Filter Quick Toggle -->
                        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs self-start sm:self-auto">
                            <button class="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#673DE6] text-white shadow-xs">
                                Today
                            </button>
                            <button class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                                This Week
                            </button>
                            <button class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                                This Month
                            </button>
                        </div>
                    </div>

                    <!-- 4 Sleek Minimal Executive Metric Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        <!-- Card 1: Today's Total Sales -->
                        <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales Today</span>
                                <div class="h-9 w-9 rounded-xl bg-purple-50 text-[#673DE6] flex items-center justify-center">
                                    <Receipt class="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div class="mt-3 flex items-baseline gap-2">
                                <span class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">₹1,84,500</span>
                                <span class="inline-flex items-center text-[11px] font-bold text-emerald-600">
                                    <TrendingUp class="h-3 w-3 mr-0.5" /> +14.8%
                                </span>
                            </div>
                            <div class="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                                <span>GST (CGST+SGST):</span>
                                <span class="font-semibold text-slate-700">₹18,450 (10%)</span>
                            </div>
                        </div>

                        <!-- Card 2: Room Occupancy -->
                        <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Room Occupancy</span>
                                <div class="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <BedDouble class="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div class="mt-3 flex items-baseline gap-2">
                                <span class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                    {{ roomStats.occupied }} / {{ roomStats.total }}
                                </span>
                                <span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                                    {{ roomStats.occupancyRate }}%
                                </span>
                            </div>
                            <div class="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                                <span>Available to sell:</span>
                                <span class="font-semibold text-emerald-600">{{ roomStats.available }} Rooms</span>
                            </div>
                        </div>

                        <!-- Card 3: Banquet Hall Events -->
                        <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Banquet Functions</span>
                                <div class="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Calendar class="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div class="mt-3 flex items-baseline gap-2">
                                <span class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">2 Events</span>
                                <span class="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                    590 Pax Total
                                </span>
                            </div>
                            <div class="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                                <span>Grand Ballroom:</span>
                                <span class="font-semibold text-purple-700">Evening Reception</span>
                            </div>
                        </div>

                        <!-- Card 4: Active Folio / Unbilled -->
                        <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Folio Dues</span>
                                <div class="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CreditCard class="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div class="mt-3 flex items-baseline gap-2">
                                <span class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">₹42,800</span>
                                <span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                    Healthy
                                </span>
                            </div>
                            <div class="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                                <span>Settlement on Check-out:</span>
                                <span class="font-semibold text-slate-700">4 checkouts today</span>
                            </div>
                        </div>
                    </div>

                    <!-- 2-Column Operational Grid: Room Rack & Today's Events -->
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        <!-- Left (7 Cols): Live Room Matrix Quick Rack -->
                        <div class="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                                <div>
                                    <h2 class="text-base font-bold text-slate-900">Front Desk Room Rack</h2>
                                    <p class="text-xs text-slate-500">Live room occupancy status & quick folio management</p>
                                </div>
                                <button
                                    @click="currentTab = 'rooms'"
                                    class="text-xs font-bold text-[#673DE6] hover:text-[#5025d1] flex items-center gap-1"
                                >
                                    View All Rooms <ChevronRight class="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <!-- Quick Status Legend Pills -->
                            <div class="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b border-slate-100 text-xs">
                                <span class="flex items-center gap-1.5 text-slate-600">
                                    <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Available ({{ roomStats.available }})
                                </span>
                                <span class="flex items-center gap-1.5 text-slate-600">
                                    <span class="h-2.5 w-2.5 rounded-full bg-[#673DE6]"></span> Occupied ({{ roomStats.occupied }})
                                </span>
                                <span class="flex items-center gap-1.5 text-slate-600">
                                    <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Cleaning ({{ roomStats.cleaning }})
                                </span>
                                <span class="flex items-center gap-1.5 text-slate-600">
                                    <span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Reserved ({{ roomStats.reserved }})
                                </span>
                            </div>

                            <!-- Mini Room Grid -->
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div
                                    v-for="room in rooms.slice(0, 12)"
                                    :key="room.id"
                                    :class="[
                                        'rounded-xl border p-3 transition flex flex-col justify-between text-left',
                                        room.status === 'available' ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400' :
                                        room.status === 'occupied' ? 'border-purple-200 bg-purple-50/40 hover:border-[#673DE6]' :
                                        room.status === 'cleaning' ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400' :
                                        'border-blue-200 bg-blue-50/40 hover:border-blue-400'
                                    ]"
                                >
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-extrabold text-slate-900">{{ room.number }}</span>
                                        <span
                                            :class="[
                                                'h-2 w-2 rounded-full',
                                                room.status === 'available' ? 'bg-emerald-500' :
                                                room.status === 'occupied' ? 'bg-[#673DE6]' :
                                                room.status === 'cleaning' ? 'bg-amber-500' : 'bg-blue-500'
                                            ]"
                                        ></span>
                                    </div>
                                    <div class="mt-2">
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
                        <div class="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 class="text-base font-bold text-slate-900">Today's Banquet Schedule</h2>
                                        <p class="text-xs text-slate-500">Hall reservations, slots & catering details</p>
                                    </div>
                                    <button
                                        @click="currentTab = 'banquet'"
                                        class="text-xs font-bold text-[#673DE6] hover:text-[#5025d1] flex items-center gap-1"
                                    >
                                        All Halls <ChevronRight class="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div class="space-y-3">
                                    <div
                                        v-for="bk in banquetBookings.slice(0, 2)"
                                        :key="bk.id"
                                        class="rounded-xl border border-slate-200/80 p-3.5 bg-[#F8F9FD] hover:bg-white hover:border-[#673DE6]/40 transition"
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
                            </div>

                            <button
                                @click="currentTab = 'banquet'"
                                class="mt-4 w-full py-2.5 rounded-xl border border-dashed border-purple-300 bg-purple-50/50 text-xs font-bold text-[#673DE6] hover:bg-purple-50 transition flex items-center justify-center gap-1.5"
                            >
                                <Plus class="h-4 w-4" /> Book New Banquet Function
                            </button>
                        </div>
                    </div>

                    <!-- Recent Fast GST Invoices Table -->
                    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <div>
                                <h2 class="text-base font-bold text-slate-900">Recent GST Tax Invoices</h2>
                                <p class="text-xs text-slate-500">Official GST bills generated with CGST / SGST split</p>
                            </div>
                            <button
                                @click="currentTab = 'invoices'"
                                class="text-xs font-bold text-[#673DE6] hover:text-[#5025d1] flex items-center gap-1"
                            >
                                View All Invoices <ChevronRight class="h-3.5 w-3.5" />
                            </button>
                        </div>

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
                            <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Banquet Halls & Slot Manager</h1>
                            <p class="text-xs sm:text-sm text-slate-500 mt-1">
                                Morning & Evening slot allocation with automated double-booking lock
                            </p>
                        </div>
                        <button
                            class="inline-flex items-center gap-1.5 rounded-xl bg-[#673DE6] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#5832D0] transition shadow-xs"
                        >
                            <Plus class="h-4 w-4" /> New Banquet Contract
                        </button>
                    </div>

                    <!-- 3 Master Halls Display -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="rounded-full bg-purple-50 text-[#673DE6] text-[10px] font-bold px-2.5 py-0.5 border border-purple-200">
                                        Capacity: 600 Pax
                                    </span>
                                    <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                </div>
                                <h3 class="text-lg font-bold text-slate-900">Grand Ballroom</h3>
                                <p class="text-xs text-slate-500 mt-1">Central AC, Italian marble flooring, 4K projector, bridal suite attached.</p>
                                <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                                    <div class="flex items-center justify-between">
                                        <span>Morning Slot:</span>
                                        <span class="font-bold text-emerald-600">Available</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span>Evening Slot:</span>
                                        <span class="font-bold text-[#673DE6]">Booked (Verma-Sharma)</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                @click="posBillType = 'banquet'; posHallRent = 45000; currentTab = 'billing'"
                                class="mt-4 w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#673DE6] font-bold text-xs transition"
                            >
                                Quick Bill This Hall
                            </button>
                        </div>

                        <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 border border-blue-200">
                                        Capacity: 250 Pax
                                    </span>
                                    <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                </div>
                                <h3 class="text-lg font-bold text-slate-900">Sapphire Hall</h3>
                                <p class="text-xs text-slate-500 mt-1">Ideal for Ring Ceremonies, Seminars, Birthdays, and corporate meetups.</p>
                                <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                                    <div class="flex items-center justify-between">
                                        <span>Morning Slot:</span>
                                        <span class="font-bold text-[#673DE6]">Booked (TechCorp)</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span>Evening Slot:</span>
                                        <span class="font-bold text-emerald-600">Available</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                @click="posBillType = 'banquet'; posHallRent = 25000; currentTab = 'billing'"
                                class="mt-4 w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition"
                            >
                                Quick Bill This Hall
                            </button>
                        </div>

                        <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
                                        Capacity: 800 Pax
                                    </span>
                                    <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                </div>
                                <h3 class="text-lg font-bold text-slate-900">Royal Lawn & Terrace</h3>
                                <p class="text-xs text-slate-500 mt-1">Open garden lawn with fountain, gazebo stage, and canopy lighting.</p>
                                <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                                    <div class="flex items-center justify-between">
                                        <span>Morning Slot:</span>
                                        <span class="font-bold text-emerald-600">Available</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span>Evening Slot:</span>
                                        <span class="font-bold text-emerald-600">Available</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                @click="posBillType = 'banquet'; posHallRent = 55000; currentTab = 'billing'"
                                class="mt-4 w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition"
                            >
                                Quick Bill This Hall
                            </button>
                        </div>
                    </div>

                    <!-- Bookings Schedule List -->
                    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                        <h2 class="text-base font-bold text-slate-900 mb-4">Confirmed Upcoming Functions</h2>
                        <div class="space-y-3">
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

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="h-10 w-10 rounded-xl bg-purple-100 text-[#673DE6] font-bold flex items-center justify-center">
                                    RM
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-900">Rajesh Malhotra</h4>
                                    <p class="text-xs text-slate-500">+91 98201 44512 • New Delhi</p>
                                </div>
                            </div>
                            <div class="text-xs text-slate-600 space-y-1 pt-3 border-t border-slate-100">
                                <div class="flex justify-between"><span>Total Visits:</span><span class="font-bold text-slate-900">4 Stays</span></div>
                                <div class="flex justify-between"><span>Total Spend:</span><span class="font-bold text-[#673DE6]">₹48,200</span></div>
                                <div class="flex justify-between"><span>Current Room:</span><span class="font-semibold text-emerald-600">Room 101 (Deluxe)</span></div>
                            </div>
                        </div>

                        <div class="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                                    SV
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-900">Suresh Chandra Verma</h4>
                                    <p class="text-xs text-slate-500">+91 98391 22441 • Lucknow</p>
                                </div>
                            </div>
                            <div class="text-xs text-slate-600 space-y-1 pt-3 border-t border-slate-100">
                                <div class="flex justify-between"><span>Function:</span><span class="font-bold text-slate-900">Wedding Reception</span></div>
                                <div class="flex justify-between"><span>Hall:</span><span class="font-semibold text-purple-700">Grand Ballroom</span></div>
                                <div class="flex justify-between"><span>Contract Value:</span><span class="font-bold text-[#673DE6]">₹4,85,000</span></div>
                            </div>
                        </div>

                        <div class="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                                    TC
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-900">TechCorp India Pvt Ltd</h4>
                                    <p class="text-xs text-slate-500">Corporate Account • GST: 09AAACT1234F1Z</p>
                                </div>
                            </div>
                            <div class="text-xs text-slate-600 space-y-1 pt-3 border-t border-slate-100">
                                <div class="flex justify-between"><span>Event:</span><span class="font-bold text-slate-900">Annual Seminar</span></div>
                                <div class="flex justify-between"><span>Billed:</span><span class="font-bold text-[#673DE6]">₹1,45,000 (Paid)</span></div>
                                <div class="flex justify-between"><span>Status:</span><span class="font-semibold text-emerald-600">Active Corporate</span></div>
                            </div>
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
                <div class="p-6 sm:p-8 border border-slate-200 rounded-xl bg-white text-slate-900">
                    <!-- Header -->
                    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
                        <div>
                            <div class="flex items-center gap-2">
                                <div class="h-8 w-8 rounded-lg bg-[#673DE6] text-white flex items-center justify-center font-black text-sm">
                                    S
                                </div>
                                <span class="text-xl font-extrabold tracking-tight text-slate-900">SENANI HOTEL & BANQUET</span>
                            </div>
                            <p class="text-xs text-slate-500 mt-1">Railway Station Road, Civil Lines, Uttar Pradesh - 229001</p>
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
