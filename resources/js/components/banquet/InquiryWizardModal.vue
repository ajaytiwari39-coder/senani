<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
    X,
    CheckCircle2,
    Calendar,
    Clock,
    User,
    Phone,
    MapPin,
    Mail,
    BedDouble,
    Sparkles,
    Receipt,
    Percent,
    ShieldCheck,
    Printer,
    Send,
    ArrowRight,
    ArrowLeft,
    Sliders,
    Building2,
    ChevronRight,
    Award,
    Check
} from '@lucide/vue';

export interface BanquetInquiry {
    id?: string;
    voucherNo: string;
    inquiryDate: string;
    // Step 1: Reception
    guestName: string;
    phonePrimary: string;
    phoneSecondary: string;
    address: string;
    email: string;
    functionDateFrom: string;
    functionDateTo: string;
    timeFrom: string;
    timeTo: string;
    eventType: string;
    // Step 2: Manager
    paxGuaranteed: number;
    menuType: string;
    menuRate: number;
    areasNeeded: string[];
    roomsNeeded: number;
    roomArrival: string;
    roomDeparture: string;
    roomRate: number;
    packageIncludes: string[];
    selfArrangements: string[];
    additionalHallCharges: number;
    additionalDecorCharges: number;
    specialArrangements: string;
    // Step 3: MD Approval
    discountPercent: number;
    discountType: 'percent' | 'flat';
    flatDiscountAmount: number;
    amountPaid: number;
    paymentMode: 'Cash' | 'UPI / QR' | 'Card' | 'Bank Transfer';
    paymentDate: string;
    status: 'draft_reception' | 'pending_md' | 'approved_md';
    mdApprovedAt?: string;
    mdRemarks?: string;
}

const props = withDefaults(
    defineProps<{
        show: boolean;
        initialInquiry?: BanquetInquiry | null;
        defaultStep?: number;
    }>(),
    {
        show: false,
        initialInquiry: null,
        defaultStep: 1,
    }
);

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', inquiry: BanquetInquiry): void;
}>();

// Wizard active step: 1 (Reception) | 2 (Manager) | 3 (MD Approval)
const currentStep = ref(props.defaultStep || 1);
const showPrintPreview = ref(false);

const form = ref<BanquetInquiry>({
    voucherNo: '250',
    inquiryDate: '15/Nov/2026',
    guestName: 'Mr. Tushar Gupta Jee',
    phonePrimary: '8115711507',
    phoneSecondary: '7081219880',
    address: 'RBL (Civil Lines, Raebareli)',
    email: '',
    functionDateFrom: '2026-11-15',
    functionDateTo: '2026-11-15',
    timeFrom: '19:00',
    timeTo: '00:00',
    eventType: 'Wedding Reception',
    paxGuaranteed: 350,
    menuType: 'Royal Deluxe Buffet',
    menuRate: 799,
    areasNeeded: ['Ground Hall', '1st Floor Banquet'],
    roomsNeeded: 5,
    roomArrival: '16:00',
    roomDeparture: '09:00',
    roomRate: 0,
    packageIncludes: ['Hall Rental', 'Grand Stage Setup', 'Theme Floral Decor', 'DJ & Acoustic Sound', 'Genset & 100% Power Backup'],
    selfArrangements: ['Photographer / Cinematography', 'Phool / Varmala', 'Cake / Gift Counter'],
    additionalHallCharges: 30000,
    additionalDecorCharges: 68000,
    specialArrangements: 'VIP Sofa seating setup for groom party. Stage entry cold pyros arranged by guest.',
    discountPercent: 5,
    discountType: 'percent',
    flatDiscountAmount: 0,
    amountPaid: 20000,
    paymentMode: 'Cash',
    paymentDate: '09/09/2026',
    status: 'pending_md',
    mdApprovedAt: undefined,
    mdRemarks: 'Approved with 5% executive VIP client discount.',
});

// Watch for incoming edits
watch(
    () => props.initialInquiry,
    (val) => {
        if (val) {
            form.value = JSON.parse(JSON.stringify(val));
        }
    },
    { immediate: true }
);

watch(
    () => props.defaultStep,
    (step) => {
        if (step) currentStep.value = step;
    },
    { immediate: true }
);

// Calculation Helpers
const foodTotal = computed(() => (Number(form.value.paxGuaranteed) || 0) * (Number(form.value.menuRate) || 0));
const addonsTotal = computed(() => {
    let roomsCost = (Number(form.value.roomsNeeded) || 0) * (Number(form.value.roomRate) || 0);
    return roomsCost + (Number(form.value.additionalHallCharges) || 0) + (Number(form.value.additionalDecorCharges) || 0);
});
const totalBaseAmount = computed(() => foodTotal.value + addonsTotal.value);

const calculatedDiscount = computed(() => {
    if (form.value.discountType === 'percent') {
        return Math.round((totalBaseAmount.value * (Number(form.value.discountPercent) || 0)) / 100);
    }
    return Number(form.value.flatDiscountAmount) || 0;
});

const netPayableAmount = computed(() => Math.max(0, totalBaseAmount.value - calculatedDiscount.value));
const balanceDueAmount = computed(() => Math.max(0, netPayableAmount.value - (Number(form.value.amountPaid) || 0)));

// Available options for selection
const areaOptions = [
    'Ground Hall',
    '1st Floor Banquet',
    '2nd Floor Sapphire Hall',
    'Open Lawn / Terrace',
    'Poolside Deck',
];

const packageIncludeOptions = [
    'Hall Rental',
    'Grand Stage Setup',
    'Theme Floral Decor',
    'DJ & Acoustic Sound',
    'Genset & 100% Power Backup',
    'Chafing & Catering Setup',
    'Welcome Drinks & Mocktails Counter',
    'VIP Lounge Seating',
];

const selfArrangementOptions = [
    'Photographer / Cinematography',
    'Phool / Varmala',
    'Cake / Gift Counter',
    'Cold Pyros / Fireworks',
    'Purohit / Pandit Ji',
    'Live Band / Orchestra',
];

const toggleArrayItem = (arr: string[], item: string) => {
    const idx = arr.indexOf(item);
    if (idx > -1) {
        arr.splice(idx, 1);
    } else {
        arr.push(item);
    }
};

// Stepper Actions
const nextStep = () => {
    if (currentStep.value < 3) currentStep.value++;
};
const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
};

const approveByMd = () => {
    form.value.status = 'approved_md';
    form.value.mdApprovedAt = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    emit('save', { ...form.value });
};

const saveAndClose = () => {
    emit('save', { ...form.value });
    emit('close');
};

const triggerPrint = () => {
    window.print();
};
</script>

<template>
    <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
        <!-- Wizard Modal Container -->
        <div class="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden font-sans">

            <!-- ===================================================== -->
            <!-- MODAL HEADER: Title + 3-Stage Progress Stepper         -->
            <!-- ===================================================== -->
            <div class="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 select-none">
                <div class="flex items-center justify-between pb-3">
                    <div class="flex items-center gap-2.5">
                        <div class="h-8 w-8 rounded-lg bg-[#F0EBFF] text-[#673DE6] flex items-center justify-center font-black text-sm border border-[#E0D7FE]">
                            #{{ form.voucherNo }}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                                    Hotel & Banquet Event Inquiry Workflow
                                </h2>
                                <span
                                    v-if="form.status === 'approved_md'"
                                    class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1"
                                >
                                    <CheckCircle2 class="h-3 w-3" /> MD Approved
                                </span>
                                <span
                                    v-else-if="form.status === 'pending_md'"
                                    class="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-[#673DE6]"
                                >
                                    Pending MD Approval
                                </span>
                                <span
                                    v-else
                                    class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700"
                                >
                                    Reception Draft
                                </span>
                            </div>
                            <p class="text-[11px] text-slate-500">
                                Senani Hotel Pleasant View • Manika Cinema Road, Civil Lines, Raebareli
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        @click="emit('close')"
                        class="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                    >
                        <X class="h-4 w-4" />
                    </button>
                </div>

                <!-- Interactive 3-Step Pill Bar -->
                <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <!-- Step 1 Trigger -->
                    <button
                        type="button"
                        @click="currentStep = 1"
                        :class="[
                            'flex items-center justify-center gap-2 py-1.5 px-2 rounded-xl font-bold transition text-left',
                            currentStep === 1
                                ? 'bg-[#673DE6] text-white shadow-xs'
                                : 'bg-[#F8F9FD] text-slate-600 hover:bg-slate-100'
                        ]"
                    >
                        <span class="flex h-5 w-5 rounded-full items-center justify-center text-[10px] font-black border"
                              :class="currentStep === 1 ? 'border-white/40 bg-white/20' : 'border-slate-300 bg-white text-slate-700'">
                            1
                        </span>
                        <span class="truncate">Reception Desk</span>
                    </button>

                    <!-- Step 2 Trigger -->
                    <button
                        type="button"
                        @click="currentStep = 2"
                        :class="[
                            'flex items-center justify-center gap-2 py-1.5 px-2 rounded-xl font-bold transition text-left',
                            currentStep === 2
                                ? 'bg-[#673DE6] text-white shadow-xs'
                                : 'bg-[#F8F9FD] text-slate-600 hover:bg-slate-100'
                        ]"
                    >
                        <span class="flex h-5 w-5 rounded-full items-center justify-center text-[10px] font-black border"
                              :class="currentStep === 2 ? 'border-white/40 bg-white/20' : 'border-slate-300 bg-white text-slate-700'">
                            2
                        </span>
                        <span class="truncate">Banquet Manager</span>
                    </button>

                    <!-- Step 3 Trigger -->
                    <button
                        type="button"
                        @click="currentStep = 3"
                        :class="[
                            'flex items-center justify-center gap-2 py-1.5 px-2 rounded-xl font-bold transition text-left',
                            currentStep === 3
                                ? 'bg-[#673DE6] text-white shadow-xs'
                                : 'bg-[#F8F9FD] text-slate-600 hover:bg-slate-100'
                        ]"
                    >
                        <span class="flex h-5 w-5 rounded-full items-center justify-center text-[10px] font-black border"
                              :class="currentStep === 3 ? 'border-white/40 bg-white/20' : 'border-slate-300 bg-white text-slate-700'">
                            3
                        </span>
                        <span class="truncate">MD Approval (Slider)</span>
                    </button>
                </div>
            </div>

            <!-- ===================================================== -->
            <!-- MODAL BODY: Step Content Views                         -->
            <!-- ===================================================== -->
            <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8F9FD] custom-scrollbar">

                <!-- ------------------------------------------------- -->
                <!-- STEP 1: RECEPTION DESK DETAILS                    -->
                <!-- ------------------------------------------------- -->
                <div v-if="currentStep === 1" class="space-y-4 animate-in fade-in duration-150">
                    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                                <User class="h-4 w-4 text-[#673DE6]" />
                                Guest Profile & Primary Contacts
                            </h3>
                            <span class="text-[11px] text-slate-400">Printed Form Voucher Ref #{{ form.voucherNo }}</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Guest Full Name *
                                </label>
                                <input
                                    v-model="form.guestName"
                                    type="text"
                                    required
                                    placeholder="e.g. Mr. Tushar Gupta Jee"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-1 focus:ring-[#673DE6]/20 transition"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Event / Function Type *
                                </label>
                                <input
                                    v-model="form.eventType"
                                    type="text"
                                    placeholder="e.g. Wedding, Reception, Tilak, Birthday"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-1 focus:ring-[#673DE6]/20 transition"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                    <Phone class="h-3 w-3 text-emerald-600" />
                                    Phone No. (Primary) *
                                </label>
                                <input
                                    v-model="form.phonePrimary"
                                    type="tel"
                                    required
                                    placeholder="e.g. 8115711507"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-1 focus:ring-[#673DE6]/20 transition font-mono"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                    <Phone class="h-3 w-3 text-slate-400" />
                                    Phone No. (Alternate / Secondary)
                                </label>
                                <input
                                    v-model="form.phoneSecondary"
                                    type="tel"
                                    placeholder="e.g. 7081219880"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-1 focus:ring-[#673DE6]/20 transition font-mono"
                                />
                            </div>

                            <div class="sm:col-span-2">
                                <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                    <MapPin class="h-3 w-3 text-rose-500" />
                                    City / Address
                                </label>
                                <input
                                    v-model="form.address"
                                    type="text"
                                    placeholder="e.g. RBL (Civil Lines, Raebareli)"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-1 focus:ring-[#673DE6]/20 transition"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Event Schedule & Dates -->
                    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Calendar class="h-4 w-4 text-[#673DE6]" />
                                Function Date & Reserved Timing
                            </h3>
                            <span class="text-[10px] text-slate-400">Voucher Slot Locking</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Function Date (From)
                                </label>
                                <input
                                    v-model="form.functionDateFrom"
                                    type="date"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Function Date (To)
                                </label>
                                <input
                                    v-model="form.functionDateTo"
                                    type="date"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                    <Clock class="h-3 w-3 text-slate-400" />
                                    Time (From)
                                </label>
                                <input
                                    v-model="form.timeFrom"
                                    type="time"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                    <Clock class="h-3 w-3 text-slate-400" />
                                    Time (To)
                                </label>
                                <input
                                    v-model="form.timeTo"
                                    type="time"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ------------------------------------------------- -->
                <!-- STEP 2: BANQUET MANAGER FORMULATION               -->
                <!-- ------------------------------------------------- -->
                <div v-if="currentStep === 2" class="space-y-4 animate-in fade-in duration-150">
                    <!-- Catering, Pax & Area Selection -->
                    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Receipt class="h-4 w-4 text-[#673DE6]" />
                                Guaranteed Pax, Menu & Area Allocation
                            </h3>
                            <span class="rounded-md bg-purple-50 text-[#673DE6] px-2 py-0.5 text-[10px] font-bold border border-purple-100">
                                Food Subtotal: ₹{{ foodTotal.toLocaleString('en-IN') }}
                            </span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    No. of Persons (Guaranteed Pax) *
                                </label>
                                <input
                                    v-model.number="form.paxGuaranteed"
                                    type="number"
                                    min="10"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-bold"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Menu Rate / Plate (₹) *
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                                    <input
                                        v-model.number="form.menuRate"
                                        type="number"
                                        min="100"
                                        class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 pl-6 pr-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Menu Title / Package
                                </label>
                                <input
                                    v-model="form.menuType"
                                    type="text"
                                    placeholder="e.g. Royal Deluxe (Rate 799)"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>
                        </div>

                        <!-- Area / Hall Needed (Multi-select Pills) -->
                        <div class="pt-2">
                            <label class="block text-[11px] font-bold text-slate-700 mb-2">
                                Area Needed (Select all reserved spaces):
                            </label>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    v-for="area in areaOptions"
                                    :key="area"
                                    type="button"
                                    @click="toggleArrayItem(form.areasNeeded, area)"
                                    :class="[
                                        'px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5',
                                        form.areasNeeded.includes(area)
                                            ? 'bg-[#F0EBFF] border-[#673DE6] text-[#673DE6] font-bold shadow-2xs'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    ]"
                                >
                                    <Check v-if="form.areasNeeded.includes(area)" class="h-3 w-3 text-[#673DE6]" />
                                    <span>{{ area }}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Rooms & Package Inclusions -->
                    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                                <BedDouble class="h-4 w-4 text-[#673DE6]" />
                                Rooms Allocation & Package Inclusions
                            </h3>
                            <span class="text-[10px] text-slate-400">Checklist based on physical voucher</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Rooms Needed
                                </label>
                                <input
                                    v-model.number="form.roomsNeeded"
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 5"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-semibold"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Room Arrival Time
                                </label>
                                <input
                                    v-model="form.roomArrival"
                                    type="time"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Room Departure Time
                                </label>
                                <input
                                    v-model="form.roomDeparture"
                                    type="time"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>
                        </div>

                        <!-- Included in Package Checklist -->
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-2">
                                Included In Hotel Package:
                            </label>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <label
                                    v-for="inc in packageIncludeOptions"
                                    :key="inc"
                                    class="flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition"
                                    :class="form.packageIncludes.includes(inc) ? 'bg-[#F0EBFF]/50 border-[#673DE6] font-semibold text-slate-900' : 'bg-white border-slate-200 text-slate-600'"
                                >
                                    <input
                                        type="checkbox"
                                        :checked="form.packageIncludes.includes(inc)"
                                        @change="toggleArrayItem(form.packageIncludes, inc)"
                                        class="rounded text-[#673DE6] focus:ring-[#673DE6]"
                                    />
                                    <span class="truncate">{{ inc }}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Self Arrangement (Guest arrangement) -->
                        <div class="pt-2 border-t border-slate-100">
                            <label class="block text-[11px] font-bold text-slate-700 mb-2">
                                Self Arrangement (Guest Bringing / Arranging):
                            </label>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <label
                                    v-for="self in selfArrangementOptions"
                                    :key="self"
                                    class="flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition"
                                    :class="form.selfArrangements.includes(self) ? 'bg-amber-50/50 border-amber-400 font-semibold text-amber-900' : 'bg-white border-slate-200 text-slate-600'"
                                >
                                    <input
                                        type="checkbox"
                                        :checked="form.selfArrangements.includes(self)"
                                        @change="toggleArrayItem(form.selfArrangements, self)"
                                        class="rounded text-amber-600 focus:ring-amber-500"
                                    />
                                    <span class="truncate">{{ self }}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Additional Charges (Decor + Hall) -->
                        <div class="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Stage & Theme Decor Charge (₹)
                                </label>
                                <input
                                    v-model.number="form.additionalDecorCharges"
                                    type="number"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-semibold"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Hall / DJ / Genset Extra Charges (₹)
                                </label>
                                <input
                                    v-model.number="form.additionalHallCharges"
                                    type="number"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-semibold"
                                />
                            </div>
                        </div>

                        <!-- Special Arrangements Notes -->
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                Special Instructions & Requirements
                            </label>
                            <textarea
                                v-model="form.specialArrangements"
                                rows="2"
                                placeholder="Any special VIP seating, sound timing limitations, or specific dietary notes..."
                                class="w-full rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- ------------------------------------------------- -->
                <!-- STEP 3: MD FINAL APPROVAL & DISCOUNT SLIDER       -->
                <!-- ------------------------------------------------- -->
                <div v-if="currentStep === 3" class="space-y-4 animate-in fade-in duration-150">
                    <!-- Quotation Summary Card -->
                    <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md">
                        <div class="flex items-center justify-between border-b border-slate-700/80 pb-3">
                            <div>
                                <p class="text-[10px] font-bold tracking-widest uppercase text-slate-400">SENANI HOTEL PLEASANT VIEW</p>
                                <h3 class="text-base font-extrabold text-white mt-0.5">
                                    {{ form.guestName }} • {{ form.eventType }}
                                </h3>
                            </div>
                            <div class="text-right">
                                <span class="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold">
                                    Voucher #{{ form.voucherNo }}
                                </span>
                                <p class="text-[10px] text-slate-400 mt-1">Date: {{ form.functionDateFrom }} ({{ form.paxGuaranteed }} Pax)</p>
                            </div>
                        </div>

                        <!-- Financial Big Numbers -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                            <div>
                                <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gross Total</span>
                                <div class="text-lg sm:text-xl font-bold text-slate-200 mt-0.5">
                                    ₹{{ totalBaseAmount.toLocaleString('en-IN') }}
                                </div>
                            </div>

                            <div>
                                <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Discount Applied</span>
                                <div class="text-lg sm:text-xl font-bold text-amber-300 mt-0.5">
                                    -₹{{ calculatedDiscount.toLocaleString('en-IN') }}
                                    <span class="text-xs font-normal">({{ form.discountPercent }}%)</span>
                                </div>
                            </div>

                            <div>
                                <span class="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Net Payable</span>
                                <div class="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
                                    ₹{{ netPayableAmount.toLocaleString('en-IN') }}
                                </div>
                            </div>

                            <div>
                                <span class="text-[10px] font-semibold uppercase tracking-wider text-rose-300">Balance Due</span>
                                <div class="text-xl sm:text-2xl font-black text-rose-400 mt-0.5">
                                    ₹{{ balanceDueAmount.toLocaleString('en-IN') }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Interactive MD Discount Controller -->
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div class="flex items-center gap-2">
                                <div class="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Sliders class="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 class="text-xs sm:text-sm font-bold text-slate-900">
                                        Managing Director Discretionary Discount Slider
                                    </h4>
                                    <p class="text-[11px] text-slate-500">
                                        Slide to adjust percentage discount or lock executive VIP pricing
                                    </p>
                                </div>
                            </div>

                            <!-- Preset Quick Percent Buttons -->
                            <div class="flex items-center gap-1.5">
                                <button
                                    v-for="p in [0, 5, 10, 15, 20]"
                                    :key="p"
                                    type="button"
                                    @click="form.discountPercent = p"
                                    :class="[
                                        'h-7 px-2.5 rounded-lg text-xs font-bold transition',
                                        form.discountPercent === p
                                            ? 'bg-[#673DE6] text-white shadow-2xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    ]"
                                >
                                    {{ p }}%
                                </button>
                            </div>
                        </div>

                        <!-- The Slider Element -->
                        <div class="py-2">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-bold text-slate-700">
                                    Discount Rate: <span class="text-[#673DE6] text-sm">{{ form.discountPercent }}%</span>
                                </span>
                                <span class="text-xs font-semibold text-slate-500">
                                    Savings for Guest: <strong class="text-emerald-600 font-bold">₹{{ calculatedDiscount.toLocaleString('en-IN') }}</strong>
                                </span>
                            </div>

                            <input
                                v-model.number="form.discountPercent"
                                type="range"
                                min="0"
                                max="25"
                                step="1"
                                class="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#673DE6]"
                            />

                            <div class="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                                <span>0% (Regular Rate)</span>
                                <span>5% (Privilege)</span>
                                <span>10% (Executive VIP)</span>
                                <span>15% (Special Family)</span>
                                <span>25% (Max MD Discretion)</span>
                            </div>
                        </div>

                        <!-- Advance Payment Section -->
                        <div class="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Advance Amount Paid (₹)
                                </label>
                                <input
                                    v-model.number="form.amountPaid"
                                    type="number"
                                    placeholder="e.g. 20000"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-bold"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Payment Method
                                </label>
                                <select
                                    v-model="form.paymentMode"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                >
                                    <option>Cash</option>
                                    <option>UPI / QR</option>
                                    <option>Card</option>
                                    <option>Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Payment Received Date
                                </label>
                                <input
                                    v-model="form.paymentDate"
                                    type="text"
                                    placeholder="e.g. 09/09/2026"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>
                        </div>

                        <!-- MD Approval Stamp & Remarks -->
                        <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F0EBFF]/30 p-3 rounded-xl border border-[#E0D7FE]">
                            <div class="flex items-center gap-2.5">
                                <div class="h-9 w-9 rounded-xl bg-[#673DE6] text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <ShieldCheck class="h-5 w-5" />
                                </div>
                                <div>
                                    <h5 class="text-xs font-bold text-slate-900">
                                        Managing Director Seal & Authorization
                                    </h5>
                                    <p class="text-[10px] text-slate-500">
                                        {{ form.status === 'approved_md' ? `Approved on ${form.mdApprovedAt || 'Today'}` : 'Requires MD sign-off to lock booking' }}
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <button
                                    v-if="form.status !== 'approved_md'"
                                    type="button"
                                    @click="approveByMd"
                                    class="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <CheckCircle2 class="h-3.5 w-3.5" />
                                    <span>Approve & Lock</span>
                                </button>
                                <div
                                    v-else
                                    class="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg"
                                >
                                    <Award class="h-4 w-4 text-emerald-600" />
                                    <span>Officially Approved by MD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===================================================== -->
            <!-- MODAL FOOTER: Navigation Buttons & Actions            -->
            <!-- ===================================================== -->
            <div class="shrink-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
                <div>
                    <button
                        v-if="currentStep > 1"
                        type="button"
                        @click="prevStep"
                        class="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                    >
                        <ArrowLeft class="h-3.5 w-3.5" />
                        <span>Previous</span>
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    <!-- Print Voucher Button -->
                    <button
                        type="button"
                        @click="showPrintPreview = true"
                        class="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-[#673DE6] hover:text-[#673DE6] transition flex items-center gap-1.5 shadow-2xs"
                    >
                        <Printer class="h-3.5 w-3.5 text-slate-500" />
                        <span class="hidden sm:inline">Print Voucher</span>
                    </button>

                    <!-- Save Draft Button -->
                    <button
                        type="button"
                        @click="saveAndClose"
                        class="h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Save & Exit
                    </button>

                    <!-- Next Step Button -->
                    <button
                        v-if="currentStep < 3"
                        type="button"
                        @click="nextStep"
                        class="h-8 px-3.5 rounded-lg bg-[#673DE6] hover:bg-[#5832D0] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shadow-[#673DE6]/20"
                    >
                        <span>Next Step</span>
                        <ArrowRight class="h-3.5 w-3.5" />
                    </button>

                    <!-- Final Submit on Step 3 -->
                    <button
                        v-else
                        type="button"
                        @click="approveByMd"
                        class="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                        <CheckCircle2 class="h-3.5 w-3.5" />
                        <span>Finish & Confirm Booking</span>
                    </button>
                </div>
            </div>

            <!-- ===================================================== -->
            <!-- PRINTABLE VOUCHER MODAL OVERLAY (Matches Physical Form) -->
            <!-- ===================================================== -->
            <div
                v-if="showPrintPreview"
                class="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
            >
                <div class="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 sm:p-8 text-slate-900 border border-slate-300 print:border-none print:shadow-none print:p-0 my-auto">
                    <!-- Close button in preview -->
                    <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 print:hidden">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Booking Voucher Preview</span>
                        <div class="flex items-center gap-2">
                            <button
                                type="button"
                                @click="triggerPrint"
                                class="h-7 px-3 rounded-lg bg-[#673DE6] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#5832D0]"
                            >
                                <Printer class="h-3 w-3" />
                                <span>Print Now</span>
                            </button>
                            <button
                                type="button"
                                @click="showPrintPreview = false"
                                class="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                            >
                                <X class="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <!-- ACTUAL PHYSICAL SLIP REPLICA -->
                    <div class="border border-slate-400 p-4 sm:p-6 bg-white text-[12px] font-sans">
                        <!-- Top Header Contacts & Logo -->
                        <div class="flex items-start justify-between border-b border-slate-400 pb-3">
                            <div class="flex items-center gap-2">
                                <img src="/images/logo-dark.png" alt="Senani Hotel Pleasant View" class="h-9 w-auto" />
                            </div>
                            <div class="text-right text-[10px] leading-tight text-slate-700 font-mono">
                                <div>RECEPTION : +91 9794152222</div>
                                <div>MANAGER : +91 9794152223</div>
                                <div class="font-bold text-slate-900">MANAGING DIRECTOR : +91 9794152224</div>
                                <div>BANQUET MANAGER : +91 9794152225</div>
                            </div>
                        </div>

                        <!-- Tagline banner -->
                        <div class="text-center font-bold text-xs tracking-wider py-1.5 border-b border-slate-400 bg-slate-100">
                            PLEASE COLLECT RECEIPT OF ALL PAYMENT
                        </div>

                        <!-- Sl No. & Date -->
                        <div class="flex justify-between py-1.5 border-b border-slate-300 font-bold text-sm">
                            <span>Voucher No. : <span class="font-mono text-[#673DE6]">{{ form.voucherNo }}</span></span>
                            <span>Date: <span class="font-mono">{{ form.inquiryDate }}</span></span>
                        </div>

                        <!-- Guest Fields -->
                        <div class="py-2 space-y-1.5 border-b border-slate-300 text-xs">
                            <div class="flex"><span class="w-28 font-bold text-slate-600">Guest Name:</span> <span class="font-bold">{{ form.guestName }}</span></div>
                            <div class="flex"><span class="w-28 font-bold text-slate-600">Phone No.:</span> <span class="font-mono font-semibold">{{ form.phonePrimary }}</span> <span v-if="form.phoneSecondary" class="font-mono ml-4">, {{ form.phoneSecondary }}</span></div>
                            <div class="flex"><span class="w-28 font-bold text-slate-600">Address:</span> <span>{{ form.address }}</span></div>
                            <div class="flex justify-between">
                                <div><span class="w-28 inline-block font-bold text-slate-600">Function Date:</span> <span class="font-semibold">{{ form.functionDateFrom }}</span> to <span class="font-semibold">{{ form.functionDateTo }}</span></div>
                                <div><span class="font-bold text-slate-600">Time:</span> {{ form.timeFrom }} to {{ form.timeTo }}</div>
                            </div>
                            <div class="flex justify-between">
                                <div><span class="w-28 inline-block font-bold text-slate-600">Event Type:</span> <span class="font-bold text-[#673DE6]">{{ form.eventType }}</span></div>
                                <div><span class="font-bold text-slate-600">Menu Type:</span> {{ form.menuType }} (₹{{ form.menuRate }}/plate)</div>
                            </div>
                            <div class="flex justify-between">
                                <div><span class="w-28 inline-block font-bold text-slate-600">No. of person:</span> <span class="font-bold">(Guaranteed) {{ form.paxGuaranteed }}</span></div>
                                <div><span class="font-bold text-slate-600">Area Needed:</span> {{ form.areasNeeded.join(', ') }}</div>
                            </div>
                            <div class="flex justify-between">
                                <div><span class="w-28 inline-block font-bold text-slate-600">Rooms Needed:</span> <span class="font-bold">{{ form.roomsNeeded }} Rooms</span></div>
                                <div><span class="font-bold text-slate-600">Arrival:</span> {{ form.roomArrival }} to {{ form.roomDeparture }}</div>
                            </div>
                        </div>

                        <!-- Package Inclusions & Self Arrangements -->
                        <div class="py-2 border-b border-slate-300 grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span class="font-bold text-slate-700 block mb-1">Included in Package:</span>
                                <ul class="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                                    <li v-for="inc in form.packageIncludes" :key="inc">{{ inc }}</li>
                                </ul>
                            </div>
                            <div>
                                <span class="font-bold text-slate-700 block mb-1">Self Arrangement (Guest):</span>
                                <ul class="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                                    <li v-for="self in form.selfArrangements" :key="self">{{ self }}</li>
                                </ul>
                            </div>
                        </div>

                        <!-- Financials / Breakdown -->
                        <div class="py-2.5 border-b border-slate-400 bg-slate-50/70 p-2 font-mono text-xs space-y-1">
                            <div class="flex justify-between font-bold">
                                <span>Total Estimated Amount:</span>
                                <span>₹{{ totalBaseAmount.toLocaleString('en-IN') }}</span>
                            </div>
                            <div v-if="calculatedDiscount > 0" class="flex justify-between text-emerald-700 font-semibold">
                                <span>MD Approved Discount ({{ form.discountPercent }}%):</span>
                                <span>- ₹{{ calculatedDiscount.toLocaleString('en-IN') }}</span>
                            </div>
                            <div class="flex justify-between font-extrabold text-sm border-t border-slate-300 pt-1">
                                <span>Payable Amount:</span>
                                <span>₹{{ netPayableAmount.toLocaleString('en-IN') }}</span>
                            </div>
                            <div class="flex justify-between text-slate-700 pt-0.5">
                                <span>Amount Paid (Advance):</span>
                                <span class="font-bold">₹{{ form.amountPaid.toLocaleString('en-IN') }} ({{ form.paymentMode }})</span>
                            </div>
                            <div class="flex justify-between font-bold text-rose-600">
                                <span>Balance Due on Event:</span>
                                <span>₹{{ balanceDueAmount.toLocaleString('en-IN') }}</span>
                            </div>
                        </div>

                        <!-- Signatures Box -->
                        <div class="pt-6 pb-2 grid grid-cols-2 gap-8 text-center text-xs">
                            <div>
                                <div class="border-t border-slate-400 pt-1 font-bold text-slate-700">Guest Signature</div>
                                <div class="text-[10px] text-slate-400 font-mono">{{ form.guestName }}</div>
                            </div>
                            <div>
                                <div class="border-t border-slate-400 pt-1 font-bold text-slate-700">Authorized Signatory / MD</div>
                                <div class="text-[10px] text-emerald-600 font-bold">
                                    {{ form.status === 'approved_md' ? '✔ DIGITALLY APPROVED BY MD' : 'PENDING APPROVAL' }}
                                </div>
                            </div>
                        </div>

                        <!-- Footer Address -->
                        <div class="text-center text-[10px] text-slate-500 pt-3 border-t border-slate-300 mt-3">
                            Hotel Pleasant View, Manika Cinema Road, Gandhi Nagar, Civil Lines - Raebareli 229001
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Custom Minimal Scrollbar inside Wizard */
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
