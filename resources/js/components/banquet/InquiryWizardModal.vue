<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
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
    Download,
    Loader2,
    Send,
    ArrowRight,
    ArrowLeft,
    Sliders,
    Building2,
    ChevronRight,
    Award,
    Check,
    AlertTriangle,
    Utensils,
    Music,
    Tv,
    Mic,
    Volume2,
    Camera,
    Info,
    Layers,
    Gift,
    Coffee,
    Lock,
    Unlock,
    Share2,
    Copy,
    ExternalLink,
    QrCode,
    FileText,
    History,
    Trash2,
    ShieldAlert
} from '@lucide/vue';
import {
    renderSlimBarcode,
    generateBarcodeDataUrl,
    generateDigitalSignature,
    generateQrCodeDataUrl,
    diffInquiryChanges,
    type BanquetAuditEntry
} from './auditTrail';
import { printElement, downloadElementAsPdf } from './printService';
import { generateBanquetVoucherVectorPdf } from './vectorPdfGenerator';
import { buildGuestPortalUrl } from './guestShare';

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
    // Step 2: Manager (Venues & Setup)
    paxGuaranteed: number;
    selectedVenues: string[];
    isEngagementPackage: boolean;
    engagementPackageType: 'none' | 'swarnim' | 'swarnmahal';
    isMeetingSetup: boolean;
    menuRateTier: 499 | 799 | 999 | 1199;
    effectiveMenuRate: number;
    menuRate?: number;
    menuTitle: string;
    isQuotationMode?: boolean;
    selectedMenuCatalogItems: string[];
    // Additional Fooding
    engagementBreakfastPax: number;
    regularBreakfastPax: number;
    bainaBoxes: number;
    mandapServingsPax: number;
    // Rooms
    roomsNeeded: number;
    roomArrival: string;
    roomDeparture: string;
    roomRate: number;
    // Decor & AV
    decorPackageType: 'none' | 'standard' | 'wedding' | 'grand';
    soundMicSetup: boolean;
    projectorSetup: boolean;
    ledWallSetup: boolean;
    packageIncludes: string[];
    selfArrangements: string[];
    additionalHallCharges: number;
    additionalDecorCharges: number;
    specialArrangements: string;
    // Step 3: Approval & Discount
    discountPercent: number;
    discountRupees: number;
    discountInputMode: 'percent' | 'amount';
    approverRole: 'manager' | 'gm' | 'harshit' | 'md';
    amountPaid: number;
    paymentMode: 'Cash' | 'UPI / QR' | 'Card' | 'Bank Transfer';
    paymentDate: string;
    status: 'draft_reception' | 'pending_manager' | 'pending_md' | 'approved_md';
    mdApprovedAt?: string;
    mdRemarks?: string;
    // Locking, Digital Signature & Audit Trail
    isLocked?: boolean;
    lockedAt?: string;
    lockedBy?: string;
    unlockedAt?: string;
    unlockedBy?: string;
    digitalSignature?: string;
    barcodeValue?: string;
    auditLog?: BanquetAuditEntry[];
}

const props = withDefaults(
    defineProps<{
        show: boolean;
        initialInquiry?: BanquetInquiry | null;
        defaultStep?: number;
        openPrintPreview?: boolean;
        userRole?: 'reception' | 'manager' | 'md' | 'superadmin';
    }>(),
    {
        show: false,
        initialInquiry: null,
        defaultStep: 1,
        openPrintPreview: false,
        userRole: 'md',
    }
);

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', inquiry: BanquetInquiry): void;
    (e: 'delete', inquiry: BanquetInquiry): void;
}>();

// Role-Aware Stepper Permission Bounds
const maxAllowedStep = computed(() => {
    if (props.userRole === 'reception') return 1;
    if (props.userRole === 'manager') return 2;
    return 3;
});

const visibleSteps = computed(() => {
    if (props.userRole === 'reception') {
        return [
            { num: 1, title: 'Step 1: Reception Desk Intake', short: 'Reception Intake' }
        ];
    }
    if (props.userRole === 'manager') {
        return [
            { num: 1, title: 'Step 1: Reception Intake', short: 'Reception Intake' },
            { num: 2, title: 'Step 2: Banquet Manager Costing', short: 'Manager Setup' }
        ];
    }
    return [
        { num: 1, title: 'Step 1: Reception Desk Intake', short: 'Reception' },
        { num: 2, title: 'Step 2: Banquet Manager Costing', short: 'Manager' },
        { num: 3, title: 'Step 3: MD Deal Sign-off & Seal', short: 'MD Sign-off' }
    ];
});

// Wizard active step: strictly clamped to role authorization ceiling
const currentStep = ref(Math.min(props.defaultStep || 1, maxAllowedStep.value));
const showPrintPreview = ref(props.openPrintPreview || false);
const activeMenuPreviewTier = ref<499 | 799 | 999 | 1199>(799);

watch(
    () => props.openPrintPreview,
    (val) => {
        if (val) showPrintPreview.value = true;
    },
    { immediate: true }
);

// -------------------------------------------------------------
// Official Venue Rates from Hotel Pleasant View Management
// -------------------------------------------------------------
const venueOptions = [
    { id: 'swarnmahal', name: 'Swarnmahal (-1)', floor: 'Basement (-1)', price: 35000, capacityType: 'single' },
    { id: 'swarnim', name: 'Swarnim (G)', floor: 'Ground Floor (G)', price: 40000, capacityType: 'single' },
    { id: 'swadhistam', name: 'Swadhistam (1)', floor: '1st Floor (1)', price: 30000, capacityType: 'single' },
    { id: 'lawn', name: 'Lawn', floor: 'Open Outdoor', price: 40000, capacityType: 'single' },
    { id: 'pisces', name: 'Pisces Rooftop', floor: 'Rooftop Terrace', price: 40000, capacityType: 'single' },
    { id: 'mandap', name: 'Mandap Hall', floor: 'Ritual Area', price: 5000, capacityType: 'mandap' },
];

// Engagement Bundled Packages
const engagementPackageRates = {
    none: 0,
    swarnim: 45000, // Swarnim Hall with decoration + DJ setup
    swarnmahal: 40000, // Swarnmahal Hall with decoration + DJ setup
};

// Decor Package Rates
const decorPackageRates = {
    none: 0,
    standard: 30000, // DJ setup + Stage + Flower + Hall decor + Entrance + Selfie zone
    wedding: 48000, // Walkway + Side gardening + Dual DJ (45,000) + Mandap decor (3,000)
    grand: 60000, // Light + Tent + Flower decor + Theme stage + Speaker setup + Fooding decor
};

// AV Rates
const AV_RATES = {
    soundMic: 7000,
    projector: 5000,
    ledWall: 12000,
};

// Fooding Rates
const FOODING_RATES = {
    engagementBreakfast: 200, // per pax (old menu)
    regularBreakfast: 300, // per pax
    bainaBox: 260, // per pentagon box
    mandapServing: 60, // per serving / pax
    roomPerNight: 2500, // Room price @ 2,500
};

import { menuCatalogs, type MenuCatalogTier } from './menuCatalog';
export type { MenuCatalogTier };

const createBlankInquiry = (): BanquetInquiry => ({
    voucherNo: String(Date.now()).slice(-4),
    inquiryDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    guestName: '',
    phonePrimary: '',
    phoneSecondary: '',
    address: '',
    email: '',
    functionDateFrom: '',
    functionDateTo: '',
    timeFrom: '19:00',
    timeTo: '23:30',
    eventType: 'Wedding Reception',
    paxGuaranteed: 100,
    selectedVenues: ['swarnim'],
    isEngagementPackage: false,
    engagementPackageType: 'none',
    isMeetingSetup: false,
    menuRateTier: 799,
    effectiveMenuRate: 799,
    menuTitle: 'Royal Deluxe Buffet',
    isQuotationMode: false,
    selectedMenuCatalogItems: [],
    engagementBreakfastPax: 0,
    regularBreakfastPax: 0,
    bainaBoxes: 0,
    mandapServingsPax: 0,
    roomsNeeded: 0,
    roomArrival: '16:00',
    roomDeparture: '09:00',
    roomRate: 2500,
    decorPackageType: 'standard',
    soundMicSetup: false,
    projectorSetup: false,
    ledWallSetup: false,
    packageIncludes: [],
    selfArrangements: [],
    additionalHallCharges: 0,
    additionalDecorCharges: 0,
    specialArrangements: '',
    discountPercent: 0,
    discountRupees: 0,
    discountInputMode: 'amount',
    approverRole: 'manager',
    amountPaid: 0,
    paymentMode: 'Cash',
    paymentDate: new Date().toLocaleDateString('en-GB'),
    status: 'draft_reception',
    mdApprovedAt: undefined,
    mdRemarks: '',
    isLocked: false,
    lockedAt: undefined,
    lockedBy: undefined,
    auditLog: [],
});

const form = ref<BanquetInquiry>(createBlankInquiry());

// Watch for incoming edits
watch(
    () => props.initialInquiry,
    (val) => {
        if (val) {
            form.value = JSON.parse(JSON.stringify(val));
            if (form.value.isLocked === undefined) form.value.isLocked = false;
            if (form.value.isQuotationMode === undefined) form.value.isQuotationMode = false;
            if (!form.value.selectedMenuCatalogItems) form.value.selectedMenuCatalogItems = [];
            if (!form.value.auditLog) form.value.auditLog = [];
            sanitizeCatalogSelections();
            updateBarcodeAndQr();
        } else {
            form.value = createBlankInquiry();
        }
    },
    { immediate: true }
);

watch(
    () => props.show,
    (open) => {
        if (open) {
            sanitizeCatalogSelections();
            updateBarcodeAndQr();
        }
    }
);

watch(
    [() => props.defaultStep, () => props.userRole, () => props.show],
    ([newStep]) => {
        const allowed = maxAllowedStep.value;
        const target = typeof newStep === 'number' && newStep > 0 ? newStep : 1;
        currentStep.value = Math.min(target, allowed);
    },
    { immediate: true }
);

// -------------------------------------------------------------
// Meeting Setup Menu Conversion Logic
// 499 -> 799
// 799 -> 999
// 999 -> 1199
// -------------------------------------------------------------
const effectiveMenuRate = computed(() => {
    let base = Number(form.value.menuRateTier) || 799;
    if (form.value.isMeetingSetup) {
        if (base === 499) return 799;
        if (base === 799) return 999;
        if (base === 999) return 1199;
        return 1199;
    }
    return base;
});

// Keep effective menu rate synced in form
watch(effectiveMenuRate, (rate) => {
    form.value.effectiveMenuRate = rate;
});

// -------------------------------------------------------------
// Capacity & Minimum Guaranteed Pax Rules:
// - Mandap hall: 15 to 30 pax
// - Single hall: 80 to 180 pax
// - Double hall: 180 to 500 pax
// - Meeting Surcharge below minimum:
//   ₹20,000 for Banquet hall, ₹5,000 for Mandap hall (6 hr)
// -------------------------------------------------------------
const paxRules = computed(() => {
    const venues = form.value.selectedVenues;
    const isMandapOnly = venues.length === 1 && venues.includes('mandap');
    const isDoubleHall = venues.filter(v => v !== 'mandap').length >= 2;
    const isSingleHall = venues.filter(v => v !== 'mandap').length === 1;

    let minPax = 80;
    let maxPax = 180;
    let label = 'Single Hall';

    if (isMandapOnly) {
        minPax = 15;
        maxPax = 30;
        label = 'Mandap Hall';
    } else if (isDoubleHall) {
        minPax = 180;
        maxPax = 500;
        label = 'Double / Multi Hall';
    } else if (isSingleHall) {
        minPax = 80;
        maxPax = 180;
        label = 'Single Hall';
    }

    const currentPax = Number(form.value.paxGuaranteed) || 0;
    const isBelowMin = currentPax < minPax;
    const isAboveMax = currentPax > maxPax;

    // Meeting Surcharge calculation
    let meetingSurcharge = 0;
    if (form.value.isMeetingSetup && isBelowMin) {
        meetingSurcharge = isMandapOnly ? 5000 : 20000;
    }

    return {
        minPax,
        maxPax,
        label,
        currentPax,
        isBelowMin,
        isAboveMax,
        meetingSurcharge,
    };
});

// -------------------------------------------------------------
// Financial Cost Breakdown Engine
// -------------------------------------------------------------
// 1. Food Base Cost (Pax * Effective Rate)
const foodTotal = computed(() => {
    return (Number(form.value.paxGuaranteed) || 0) * effectiveMenuRate.value;
});

// 2. Extra Fooding Items
const extraFoodingTotal = computed(() => {
    const engBf = (Number(form.value.engagementBreakfastPax) || 0) * FOODING_RATES.engagementBreakfast;
    const regBf = (Number(form.value.regularBreakfastPax) || 0) * FOODING_RATES.regularBreakfast;
    const baina = (Number(form.value.bainaBoxes) || 0) * FOODING_RATES.bainaBox;
    const mandapServ = (Number(form.value.mandapServingsPax) || 0) * FOODING_RATES.mandapServing;
    return engBf + regBf + baina + mandapServ;
});

// 3. Venue Cost (Standalone vs Engagement Bundled)
const venueTotal = computed(() => {
    if (form.value.isEngagementPackage) {
        if (form.value.engagementPackageType === 'swarnim') return 45000;
        if (form.value.engagementPackageType === 'swarnmahal') return 40000;
        return 0;
    }
    // Sum selected venues
    return form.value.selectedVenues.reduce((sum, vId) => {
        const found = venueOptions.find(opt => opt.id === vId);
        return sum + (found ? found.price : 0);
    }, 0);
});

// 4. Rooms Cost
const roomsTotal = computed(() => {
    return (Number(form.value.roomsNeeded) || 0) * (Number(form.value.roomRate) || FOODING_RATES.roomPerNight);
});

// 5. Decor & AV Package Cost
const decorAvTotal = computed(() => {
    let total = 0;
    if (!form.value.isEngagementPackage) {
        total += decorPackageRates[form.value.decorPackageType] || 0;
    }
    if (form.value.soundMicSetup) total += AV_RATES.soundMic;
    if (form.value.projectorSetup) total += AV_RATES.projector;
    if (form.value.ledWallSetup) total += AV_RATES.ledWall;
    return total;
});

// 6. Manual Addons & Meeting Pax Surcharge
const otherAddonsTotal = computed(() => {
    return (
        (Number(form.value.additionalHallCharges) || 0) +
        (Number(form.value.additionalDecorCharges) || 0) +
        paxRules.value.meetingSurcharge
    );
});

// Gross Total
const totalGrossAmount = computed(() => {
    return foodTotal.value + extraFoodingTotal.value + venueTotal.value + roomsTotal.value + decorAvTotal.value + otherAddonsTotal.value;
});

// -------------------------------------------------------------
// Discount Authorization Matrix:
// "ALWAYS TELL AMOUNT IN NUMBERS NOT IN %"
// - Manager: Max 5% (tell amount in numbers)
// - General Manager: Max 7% (tell amount in numbers)
// - Above 7% up to 10%: Harshit's call compulsory (max 10% by Harshit, tell amount in numbers)
// - Above 10%: MD Sir approval required
// -------------------------------------------------------------
const discountLimitManager = computed(() => Math.round((totalGrossAmount.value * 5) / 100));
const discountLimitGM = computed(() => Math.round((totalGrossAmount.value * 7) / 100));
const discountLimitHarshit = computed(() => Math.round((totalGrossAmount.value * 10) / 100));

// Live Discount Calculation: Currency First!
const calculatedDiscountAmount = computed(() => {
    if (form.value.discountInputMode === 'amount') {
        return Math.min(totalGrossAmount.value, Math.max(0, Number(form.value.discountRupees) || 0));
    }
    // percent mode
    return Math.round((totalGrossAmount.value * (Number(form.value.discountPercent) || 0)) / 100);
});

// Computed percentage from amount
const calculatedDiscountPercent = computed(() => {
    if (totalGrossAmount.value === 0) return 0;
    return Math.round((calculatedDiscountAmount.value / totalGrossAmount.value) * 1000) / 10;
});

// Sync both modes
const setDiscountFromPercent = (pct: number) => {
    const clampedPct = Math.max(0, Math.min(Number(pct) || 0, 100));
    form.value.discountPercent = clampedPct;
    form.value.discountRupees = Math.round((totalGrossAmount.value * clampedPct) / 100);
    form.value.discountInputMode = 'percent';
};

const setDiscountFromAmount = (amt: number) => {
    const clampedAmt = Math.max(0, Math.min(Number(amt) || 0, totalGrossAmount.value));
    form.value.discountRupees = clampedAmt;
    form.value.discountPercent = totalGrossAmount.value > 0 ? Math.round((clampedAmt / totalGrossAmount.value) * 1000) / 10 : 0;
    form.value.discountInputMode = 'amount';
};

// Authority Tier Determination
const authorityLevel = computed(() => {
    const pct = calculatedDiscountPercent.value;
    const amt = calculatedDiscountAmount.value;

    if (pct <= 5.0) {
        return {
            tier: 'manager' as const,
            title: 'Authorized by Banquet Manager',
            signatureLabel: 'Authorized Signatory - Banquet Manager',
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            maxAllowedText: `Within 5% Limit (Max ₹${discountLimitManager.value.toLocaleString('en-IN')})`,
            isWarning: false,
        };
    }
    if (pct <= 7.0) {
        return {
            tier: 'gm' as const,
            title: 'Authorized by General Manager (GM)',
            signatureLabel: 'Authorized Signatory - General Manager (GM)',
            badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
            maxAllowedText: `Within 7% GM Limit (Max ₹${discountLimitGM.value.toLocaleString('en-IN')})`,
            isWarning: false,
        };
    }
    if (pct <= 10.0) {
        return {
            tier: 'harshit' as const,
            title: "Harshit's Approval Compulsory",
            signatureLabel: "Authorized Signatory - Harshit's Approval",
            badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
            maxAllowedText: `Harshit Call Compulsory (Max 10%: ₹${discountLimitHarshit.value.toLocaleString('en-IN')})`,
            isWarning: true,
        };
    }
    return {
        tier: 'md' as const,
        title: 'Managing Director (MD Sir) Special Discretion',
        signatureLabel: 'Authorized Signatory - Managing Director (MD Sir)',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-300',
        maxAllowedText: `Exceeds 10% (Discount: ₹${amt.toLocaleString('en-IN')}) - Requires MD Signature`,
        isWarning: true,
    };
});

// Net and Balance Due
const netPayableAmount = computed(() => Math.max(0, totalGrossAmount.value - calculatedDiscountAmount.value));
const balanceDueAmount = computed(() => Math.max(0, netPayableAmount.value - (Number(form.value.amountPaid) || 0)));

// Multi-select toggle helper
const toggleVenue = (venueId: string) => {
    const idx = form.value.selectedVenues.indexOf(venueId);
    if (idx > -1) {
        form.value.selectedVenues.splice(idx, 1);
    } else {
        form.value.selectedVenues.push(venueId);
    }
};

const toggleArrayItem = (arr: string[], item: string) => {
    const idx = arr.indexOf(item);
    if (idx > -1) {
        arr.splice(idx, 1);
    } else {
        arr.push(item);
    }
};

// Stepper Validation & Actions
const stepErrors = ref<{ guestName?: string; phonePrimary?: string }>({});

const clearStepError = (field: 'guestName' | 'phonePrimary') => {
    if (stepErrors.value[field]) {
        delete stepErrors.value[field];
    }
};

const goToStep = (stepNum: number) => {
    if (stepNum >= 1 && stepNum <= maxAllowedStep.value) {
        currentStep.value = stepNum;
    }
};

const nextStep = () => {
    if (currentStep.value === 1) {
        stepErrors.value = {};
        if (!form.value.guestName || !form.value.guestName.trim()) {
            stepErrors.value.guestName = 'Customer / Host Full Name is required.';
        }
        if (!form.value.phonePrimary || !form.value.phonePrimary.trim()) {
            stepErrors.value.phonePrimary = 'Primary Phone Number is required.';
        }
        if (Object.keys(stepErrors.value).length > 0) {
            return;
        }
    }
    if (currentStep.value < maxAllowedStep.value) {
        currentStep.value++;
    }
};

const prevStep = () => {
    stepErrors.value = {};
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

const submitReceptionStep1 = () => {
    stepErrors.value = {};
    if (!form.value.guestName || !form.value.guestName.trim()) {
        stepErrors.value.guestName = 'Customer / Host Full Name is required.';
    }
    if (!form.value.phonePrimary || !form.value.phonePrimary.trim()) {
        stepErrors.value.phonePrimary = 'Primary Phone Number is required.';
    }
    if (Object.keys(stepErrors.value).length > 0) {
        return;
    }
    form.value.status = 'pending_manager';
    emit('save', { ...form.value });
    emit('close');
};

const submitManagerStep2 = () => {
    form.value.status = 'pending_md';
    emit('save', { ...form.value });
    emit('close');
};

const submitMdFinalize = () => {
    form.value.status = 'approved_md';
    form.value.isLocked = true;
    form.value.approverRole = authorityLevel.value.tier;
    form.value.lockedBy = 'Managing Director (MD Sir)';
    form.value.lockedAt = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    form.value.mdApprovedAt = form.value.lockedAt;
    emit('save', { ...form.value });
    emit('close');
};

const approveByAuthority = () => {
    submitMdFinalize();
};

const saveAndClose = () => {
    emit('save', { ...form.value });
    emit('close');
};

// -------------------------------------------------------------
// Print Preview Computed Helpers (Every single detail for voucher)
// -------------------------------------------------------------
const currentMenuCatalog = computed<MenuCatalogTier>(() => {
    const tier = effectiveMenuRate.value;
    if (tier === 499 || tier === 799 || tier === 999 || tier === 1199) {
        return menuCatalogs[tier];
    }
    return menuCatalogs[799];
});

const selectedVenuesDetailed = computed(() => {
    if (form.value.isEngagementPackage) {
        if (form.value.engagementPackageType === 'swarnim') {
            return [{ name: 'Swarnim Hall with Decoration + DJ Setup', price: 45000, type: 'Engagement Package' }];
        }
        if (form.value.engagementPackageType === 'swarnmahal') {
            return [{ name: 'Swarnmahal Hall with Decoration + DJ Setup', price: 40000, type: 'Engagement Package' }];
        }
    }
    return form.value.selectedVenues.map(vId => {
        const found = venueOptions.find(opt => opt.id === vId);
        return found || { id: vId, name: vId.toUpperCase(), floor: 'Banquet Level', price: 35000, capacityType: 'single' };
    });
});

const selectedDecorDetails = computed(() => {
    const type = form.value.decorPackageType;
    if (type === 'standard') {
        return { name: 'Standard Decor Package', price: 30000, inclusions: 'DJ Setup + Stage Backdrop + Floral Ambience + Entrance Arch + Selfie Zone' };
    }
    if (type === 'wedding') {
        return { name: 'Wedding Mandap Package', price: 48000, inclusions: 'Floral Walkway + Side Gardening + Dual DJ (₹45,000) + Mandap Decor (₹3,000)' };
    }
    if (type === 'grand') {
        return { name: 'Grand Royal Theme Package', price: 60000, inclusions: 'Ambient Lights + Canopy Tent + Fresh Flower Decor + Royal Stage + Acoustic Setup + Fooding Decor' };
    }
    return null;
});

const selectedAvItems = computed(() => {
    const items: { name: string; price: number }[] = [];
    if (form.value.soundMicSetup) items.push({ name: 'Professional Sound & Cordless Mic Setup', price: AV_RATES.soundMic });
    if (form.value.projectorSetup) items.push({ name: 'HD Video Projector & High-Gain Screen', price: AV_RATES.projector });
    if (form.value.ledWallSetup) items.push({ name: 'High-Density LED Video Wall Setup', price: AV_RATES.ledWall });
    return items;
});

const extraFoodingItemsDetailed = computed(() => {
    const items: { name: string; qty: string; rate: string; total: number }[] = [];
    if (Number(form.value.engagementBreakfastPax) > 0) {
        items.push({
            name: 'Engagement Breakfast (Old Menu)',
            qty: `${form.value.engagementBreakfastPax} Pax`,
            rate: `₹${FOODING_RATES.engagementBreakfast}/pax`,
            total: form.value.engagementBreakfastPax * FOODING_RATES.engagementBreakfast
        });
    }
    if (Number(form.value.regularBreakfastPax) > 0) {
        items.push({
            name: 'Regular Indian / Continental Breakfast',
            qty: `${form.value.regularBreakfastPax} Pax`,
            rate: `₹${FOODING_RATES.regularBreakfast}/pax`,
            total: form.value.regularBreakfastPax * FOODING_RATES.regularBreakfast
        });
    }
    if (Number(form.value.bainaBoxes) > 0) {
        items.push({
            name: 'Baina Traditional Pentagon Gift Boxes',
            qty: `${form.value.bainaBoxes} Boxes`,
            rate: `₹${FOODING_RATES.bainaBox}/box`,
            total: form.value.bainaBoxes * FOODING_RATES.bainaBox
        });
    }
    if (Number(form.value.mandapServingsPax) > 0) {
        items.push({
            name: 'Mandap Ritual Catering Servings',
            qty: `${form.value.mandapServingsPax} Servings`,
            rate: `₹${FOODING_RATES.mandapServing}/serving`,
            total: form.value.mandapServingsPax * FOODING_RATES.mandapServing
        });
    }
    return items;
});

const isPdfDownloading = ref(false);

const triggerPrint = async () => {
    const wasPreviewClosed = !showPrintPreview.value;
    if (wasPreviewClosed) {
        showPrintPreview.value = true;
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    printElement('printable-voucher', `Senani Banquet Voucher #${form.value.voucherNo}`);
};

const handleDownloadPdf = async () => {
    isPdfDownloading.value = true;
    await updateBarcodeAndQr();
    try {
        const success = await generateBanquetVoucherVectorPdf({
            form: form.value,
            effectiveMenuRate: effectiveMenuRate.value,
            currentMenuCatalog: currentMenuCatalog.value,
            foodTotal: foodTotal.value,
            extraFoodingTotal: extraFoodingTotal.value,
            venueTotal: venueTotal.value,
            roomsTotal: roomsTotal.value,
            decorAvTotal: decorAvTotal.value,
            otherAddonsTotal: otherAddonsTotal.value,
            totalGrossAmount: totalGrossAmount.value,
            calculatedDiscountAmount: calculatedDiscountAmount.value,
            calculatedDiscountPercent: calculatedDiscountPercent.value,
            netPayableAmount: netPayableAmount.value,
            balanceDueAmount: balanceDueAmount.value,
            selectedVenuesDetailed: selectedVenuesDetailed.value,
            paxRules: paxRules.value,
            selectedDecorDetails: selectedDecorDetails.value,
            selectedAvItems: selectedAvItems.value,
            confirmedMenuCategories: confirmedMenuCategories.value,
            authorityLevel: authorityLevel.value,
            barcodeDataUrl: barcodeDataUrl.value,
            qrCodeDataUrl: qrCodeDataUrl.value,
        }, `Senani-Banquet-Voucher-${form.value.voucherNo}.pdf`);

        if (!success) {
            // Fallback to DOM-based PDF if vector generation encountered an issue
            await downloadElementAsPdf(
                'printable-voucher',
                `Senani-Banquet-Voucher-${form.value.voucherNo}.pdf`
            );
        }
    } catch (err) {
        console.error('Vector PDF trigger failed, falling back to standard export:', err);
        await downloadElementAsPdf(
            'printable-voucher',
            `Senani-Banquet-Voucher-${form.value.voucherNo}.pdf`
        );
    } finally {
        isPdfDownloading.value = false;
    }
};

// -------------------------------------------------------------
// Interactive Menu Item Selection, Quota Limits & Lock Control
// -------------------------------------------------------------
const barcodeSvgStep2 = ref<SVGSVGElement | null>(null);
const barcodeSvgPrint = ref<SVGSVGElement | null>(null);
const barcodeDataUrl = ref<string>('');
const qrCodeDataUrl = ref<string>('');
const showAuditModal = ref(false);
const unlockSnapshot = ref<Partial<BanquetInquiry> | null>(null);

const isItemSelected = (item: string) => {
    return (form.value.selectedMenuCatalogItems || []).includes(item);
};

const getCategorySelectedCount = (items: string[]) => {
    if (!items || !items.length) return 0;
    const selected = form.value.selectedMenuCatalogItems || [];
    return items.filter(it => selected.includes(it)).length;
};

const isCategoryFull = (items: string[], maxCount: number) => {
    if (!items || !items.length || maxCount <= 0) return false;
    return getCategorySelectedCount(items) >= maxCount;
};

// Full Courses Catalog with Quotas
const allCoursesList = computed(() => {
    const cat = currentMenuCatalog.value;
    return [
        { key: 'welcomeDrinks', label: 'Welcome Drinks & Mocktails', icon: '🍹', items: cat.welcomeDrinks || [], count: cat.welcomeDrinksCount },
        { key: 'hotDrinks', label: 'Hot Beverages', icon: '☕', items: cat.hotDrinks || [], count: cat.hotDrinksCount },
        { key: 'soups', label: 'Gourmet Soups', icon: '🍲', items: cat.soups || [], count: cat.soupsCount },
        { key: 'starters', label: 'Starters & Finger Food', icon: '🍢', items: cat.starters || [], count: cat.startersCount },
        { key: 'paneer', label: 'Paneer Specialty', icon: '🥘', items: cat.paneer || [], count: cat.paneerCount },
        { key: 'dal', label: 'Dal Preparation', icon: '🍲', items: cat.dal || [], count: cat.dalCount },
        { key: 'dryVeg', label: 'Dry Seasonal Veg', icon: '🥦', items: cat.dryVeg || [], count: cat.dryVegCount },
        { key: 'gravyVeg', label: 'Rich Gravy Specialties', icon: '🍛', items: cat.gravyVeg || [], count: cat.gravyVegCount },
        { key: 'rice', label: 'Basmati Rice & Pulao', icon: '🍚', items: cat.rice || [], count: cat.riceCount },
        { key: 'raita', label: 'Curd & Raita', icon: '🥣', items: cat.raita || [], count: cat.raitaCount },
        { key: 'breads', label: 'Assorted Tandoor Breads', icon: '🍞', items: cat.breads || [], count: cat.breadsCount },
        { key: 'desserts', label: 'Royal Desserts & Halwas', icon: '🍨', items: cat.desserts || [], count: cat.dessertsCount },
        { key: 'salads', label: 'Salads & Accompaniments', icon: '🥗', items: cat.salads && cat.salads.length ? cat.salads : ['Sirka Pyaaz', 'Green Salad', 'Achaar', 'Chutney'], count: 4 },
        { key: 'liveCounters', label: 'Live Chef Counters', icon: '🍳', items: cat.liveCounters || [], count: cat.liveCountersCount },
    ].filter(c => c.items && c.items.length > 0);
});

const totalCatalogItemsCount = computed(() => {
    return allCoursesList.value.reduce((sum, c) => sum + c.items.length, 0);
});

const setQuotationMode = (active: boolean) => {
    if (form.value.isLocked) return;
    form.value.isQuotationMode = active;
    if (active) {
        // "kuch select nhi rhega": in quotation mode, clear selected items
        form.value.selectedMenuCatalogItems = [];
    }
};

// Culinary Tasting Menu (Clean, without unchecked clutter) for the Luxury Voucher
const confirmedMenuCategories = computed(() => {
    const catalog = currentMenuCatalog.value;
    const selected = form.value.selectedMenuCatalogItems || [];
    const isQuotation = !!form.value.isQuotationMode;
    
    const getItems = (catalogList: string[] = [], quota: number = 1) => {
        if (isQuotation) {
            // In quotation mode, show ALL food items!
            return catalogList || [];
        }
        const picked = (catalogList || []).filter(item => selected.includes(item));
        if (picked.length > 0) return picked;
        return (catalogList || []).slice(0, Math.max(1, quota));
    };

    const categories = [
        { key: 'welcomeDrinks', label: 'Welcome Drinks & Mocktails', icon: '🍹', quota: catalog.welcomeDrinksCount, items: getItems(catalog.welcomeDrinks, catalog.welcomeDrinksCount) },
        { key: 'hotDrinks', label: 'Hot Beverages', icon: '☕', quota: catalog.hotDrinksCount, items: getItems(catalog.hotDrinks, catalog.hotDrinksCount) },
        { key: 'soups', label: 'Gourmet Soups', icon: '🍲', quota: catalog.soupsCount, items: getItems(catalog.soups, catalog.soupsCount) },
        { key: 'starters', label: 'Starters & Finger Food', icon: '🍢', quota: catalog.startersCount, items: getItems(catalog.starters, catalog.startersCount) },
        { key: 'paneer', label: 'Paneer Specialty', icon: '🥘', quota: catalog.paneerCount, items: getItems(catalog.paneer, catalog.paneerCount) },
        { key: 'dal', label: 'Dal Preparation', icon: '🍲', quota: catalog.dalCount, items: getItems(catalog.dal, catalog.dalCount) },
        { key: 'dryVeg', label: 'Dry Seasonal Veg', icon: '🥦', quota: catalog.dryVegCount, items: getItems(catalog.dryVeg, catalog.dryVegCount) },
        { key: 'gravyVeg', label: 'Rich Gravy Specialties', icon: '🍛', quota: catalog.gravyVegCount, items: getItems(catalog.gravyVeg, catalog.gravyVegCount) },
        { key: 'rice', label: 'Basmati Rice & Pulao', icon: '🍚', quota: catalog.riceCount, items: getItems(catalog.rice, catalog.riceCount) },
        { key: 'raita', label: 'Curd & Raita', icon: '🥣', quota: catalog.raitaCount, items: getItems(catalog.raita, catalog.raitaCount) },
        { key: 'breads', label: 'Assorted Tandoor Breads', icon: '🍞', quota: catalog.breadsCount, items: getItems(catalog.breads, catalog.breadsCount) },
        { key: 'desserts', label: 'Royal Desserts & Halwas', icon: '🍨', quota: catalog.dessertsCount, items: getItems(catalog.desserts, catalog.dessertsCount) },
        { key: 'salads', label: 'Salads & Accompaniments', icon: '🥗', quota: 4, items: isQuotation ? (catalog.salads || ['Sirka Pyaaz', 'Green Salad', 'Achaar', 'Chutney']) : (catalog.salads && catalog.salads.length ? catalog.salads.slice(0, 4) : ['Sirka Pyaaz', 'Green Salad', 'Achaar', 'Chutney']) },
        { key: 'liveCounters', label: 'Live Chef Counters', icon: '🍳', quota: catalog.liveCountersCount, items: getItems(catalog.liveCounters, catalog.liveCountersCount) },
    ];

    return categories.filter(c => c.items.length > 0);
});

// Strict Quota Limit Enforcement (Never allow more than allowed limit)
const toggleMenuItem = (item: string, categoryItems?: string[], maxAllowed?: number) => {
    if (form.value.isLocked) return;
    if (!form.value.selectedMenuCatalogItems) {
        form.value.selectedMenuCatalogItems = [];
    }
    const idx = form.value.selectedMenuCatalogItems.indexOf(item);
    if (idx > -1) {
        form.value.selectedMenuCatalogItems.splice(idx, 1);
    } else {
        if (categoryItems && maxAllowed !== undefined) {
            if (getCategorySelectedCount(categoryItems) >= maxAllowed) {
                // Quota reached! Prevent selecting more than allowed limit
                return;
            }
        }
        form.value.selectedMenuCatalogItems.push(item);
    }
};

// Ensure selections never exceed quotas for the active tier
const sanitizeCatalogSelections = () => {
    if (!form.value.selectedMenuCatalogItems || !form.value.selectedMenuCatalogItems.length) return;
    const cat = currentMenuCatalog.value;
    const allowed: string[] = [];

    const keepWithinLimit = (items: string[], max: number) => {
        if (!items || !items.length) return;
        const selected = form.value.selectedMenuCatalogItems.filter(it => items.includes(it));
        allowed.push(...selected.slice(0, max));
    };

    keepWithinLimit(cat.welcomeDrinks, cat.welcomeDrinksCount);
    keepWithinLimit(cat.hotDrinks, cat.hotDrinksCount);
    keepWithinLimit(cat.soups, cat.soupsCount);
    keepWithinLimit(cat.starters, cat.startersCount);
    keepWithinLimit(cat.dal, cat.dalCount);
    keepWithinLimit(cat.paneer, cat.paneerCount);
    keepWithinLimit(cat.dryVeg, cat.dryVegCount);
    keepWithinLimit(cat.gravyVeg, cat.gravyVegCount);
    keepWithinLimit(cat.rice, cat.riceCount);
    keepWithinLimit(cat.raita, cat.raitaCount);
    keepWithinLimit(cat.breads, cat.breadsCount);
    keepWithinLimit(cat.desserts, cat.dessertsCount);
    keepWithinLimit(cat.liveCounters, cat.liveCountersCount);

    form.value.selectedMenuCatalogItems = allowed;
};

const selectAllDefaults = () => {
    if (form.value.isLocked) return;
    const cat = currentMenuCatalog.value;
    const picked: string[] = [];
    if (cat.welcomeDrinks) picked.push(...cat.welcomeDrinks.slice(0, cat.welcomeDrinksCount));
    if (cat.hotDrinks) picked.push(...cat.hotDrinks.slice(0, cat.hotDrinksCount));
    if (cat.soups) picked.push(...cat.soups.slice(0, cat.soupsCount));
    if (cat.starters) picked.push(...cat.starters.slice(0, cat.startersCount));
    if (cat.dal) picked.push(...cat.dal.slice(0, cat.dalCount));
    if (cat.paneer) picked.push(...cat.paneer.slice(0, cat.paneerCount));
    if (cat.dryVeg) picked.push(...cat.dryVeg.slice(0, cat.dryVegCount));
    if (cat.gravyVeg) picked.push(...cat.gravyVeg.slice(0, cat.gravyVegCount));
    if (cat.rice) picked.push(...cat.rice.slice(0, cat.riceCount));
    if (cat.raita) picked.push(...cat.raita.slice(0, cat.raitaCount));
    if (cat.breads) picked.push(...cat.breads.slice(0, cat.breadsCount));
    if (cat.desserts) picked.push(...cat.desserts.slice(0, cat.dessertsCount));
    if (cat.liveCounters) picked.push(...cat.liveCounters.slice(0, cat.liveCountersCount));
    form.value.selectedMenuCatalogItems = picked;
};

const clearMenuSelection = () => {
    if (form.value.isLocked) return;
    form.value.selectedMenuCatalogItems = [];
};

// Render Barcode & QR Code
const updateBarcodeAndQr = async () => {
    if (typeof window === 'undefined') return;
    const verifyUrl = `${window.location.origin}/verify/voucher?v=${form.value.voucherNo}`;
    qrCodeDataUrl.value = await generateQrCodeDataUrl(verifyUrl, 160);

    const sig = form.value.digitalSignature || `SN-SIG-${form.value.voucherNo}`;
    barcodeDataUrl.value = generateBarcodeDataUrl(sig, 28);

    await nextTick();
    if (barcodeSvgStep2.value) {
        renderSlimBarcode(barcodeSvgStep2.value, sig, 22);
    }
    if (barcodeSvgPrint.value) {
        renderSlimBarcode(barcodeSvgPrint.value, sig, 24);
    }
};

// Manager Deal Lock / Freeze Mechanism with Full Audit Trail Tracking
const toggleDealLock = () => {
    form.value.isLocked = !form.value.isLocked;

    if (!form.value.auditLog) {
        form.value.auditLog = [];
    }

    const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    if (form.value.isLocked) {
        // Enforce quota sanity before lock
        sanitizeCatalogSelections();

        // 1. Check if there were edits made while deal was unlocked
        if (unlockSnapshot.value) {
            const diffs = diffInquiryChanges(unlockSnapshot.value, form.value);
            if (diffs.length > 0) {
                form.value.auditLog.push({
                    id: 'aud-' + Date.now() + '-upd',
                    timestamp,
                    action: 'updated',
                    actor: 'Banquet Operations Manager',
                    details: `Inquiry details updated (${diffs.length} fields modified)`,
                    changes: diffs,
                });
            }
            unlockSnapshot.value = null;
        }

        // 2. Generate new versioned Digital Signature
        const lockCount = form.value.auditLog.filter(a => a.action === 'locked').length + 1;
        const newSig = generateDigitalSignature(form.value.voucherNo, lockCount);
        form.value.digitalSignature = newSig;
        form.value.barcodeValue = newSig;
        form.value.lockedAt = timestamp;
        form.value.lockedBy = 'Banquet Operations Manager';

        // 3. Log Lock Event
        form.value.auditLog.push({
            id: 'aud-' + Date.now() + '-lck',
            timestamp,
            action: 'locked',
            actor: 'Banquet Operations Manager',
            details: 'Deal sealed & frozen. Cryptographic digital signature generated.',
            digitalSignature: newSig,
        });

        updateBarcodeAndQr();
    } else {
        // UNLOCKING DEAL
        unlockSnapshot.value = JSON.parse(JSON.stringify(form.value));
        const prevSig = form.value.digitalSignature;
        form.value.unlockedAt = timestamp;
        form.value.unlockedBy = 'Banquet Operations Manager';

        form.value.auditLog.push({
            id: 'aud-' + Date.now() + '-unl',
            timestamp,
            action: 'unlocked',
            actor: 'Banquet Operations Manager',
            details: 'Deal unlocked for menu revision and client adjustments.',
            previousSignature: prevSig,
        });
    }

    emit('save', { ...form.value });
};

// Share Link Helpers
const showShareModal = ref(false);
const copySuccess = ref(false);

const getGuestPortalUrl = computed(() => {
    if (typeof window === 'undefined') return '';
    return buildGuestPortalUrl(window.location.origin, form.value);
});

const copyGuestLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(getGuestPortalUrl.value);
        copySuccess.value = true;
        setTimeout(() => {
            copySuccess.value = false;
        }, 2500);
    }
};

const shareOnWhatsApp = () => {
    const phone = form.value.phonePrimary ? form.value.phonePrimary.replace(/[^0-9]/g, '') : '';
    const msg = encodeURIComponent(
        `Namaste ${form.value.guestName} Ji,\n\nPlease select your preferred catering menu and service options for your upcoming ${form.value.eventType} (Voucher #${form.value.voucherNo}) at Hotel Pleasant View (Senani):\n\n${getGuestPortalUrl.value}\n\nThank you,\nSenani Banquet Management`
    );
    const targetPhone = phone ? `91${phone.slice(-10)}` : '';
    const url = targetPhone ? `https://wa.me/${targetPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
};
</script>

<template>
    <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-2 md:p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
    >
        <!-- FULL-WIDTH MODERN WIZARD MODAL (w-[98vw] max-w-[1720px]) -->
        <div class="relative w-[98vw] max-w-[1720px] h-[95vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden font-sans">

            <!-- ===================================================== -->
            <!-- MODAL HEADER: Title + 3-Stage Progress Stepper         -->
            <!-- ===================================================== -->
            <div class="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 select-none">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="h-8.5 w-8.5 rounded-xl bg-[#F0EBFF] text-[#673DE6] flex items-center justify-center font-black text-sm border border-[#E0D7FE]">
                            #{{ form.voucherNo }}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                                    Hotel & Banquet Event Inquiry Workflow
                                </h2>
                                <span
                                    v-if="form.status === 'approved_md'"
                                    class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1 border border-emerald-200"
                                >
                                    <CheckCircle2 class="h-3 w-3" /> {{ authorityLevel.title }}
                                </span>
                                <span
                                    v-else-if="form.status === 'pending_md'"
                                    class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 inline-flex items-center gap-1"
                                >
                                    <Clock class="h-3 w-3" /> Awaiting MD Final Approval
                                </span>
                                <span
                                    v-else-if="form.status === 'pending_manager'"
                                    class="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 inline-flex items-center gap-1"
                                >
                                    <Clock class="h-3 w-3" /> Awaiting Banquet Manager
                                </span>
                                <span
                                    v-else
                                    class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200"
                                >
                                    Reception Intake Draft
                                </span>
                            </div>
                            <p class="text-[11px] text-slate-500">
                                Senani Hotel Pleasant View • Manika Cinema Road, Civil Lines, Raebareli
                            </p>
                        </div>
                    </div>

                    <!-- Close Button -->
                    <button
                        type="button"
                        @click="$emit('close')"
                        class="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                    >
                        <X class="h-4 w-4" />
                    </button>
                </div>

                <!-- Role-Aware Interactive Stepper Navigation -->
                <div
                    class="grid gap-2 sm:gap-3 pt-2.5"
                    :class="visibleSteps.length === 1 ? 'grid-cols-1' : (visibleSteps.length === 2 ? 'grid-cols-2' : 'grid-cols-3')"
                >
                    <button
                        v-for="s in visibleSteps"
                        :key="s.num"
                        type="button"
                        @click="goToStep(s.num)"
                        :class="[
                            'flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition text-left',
                            currentStep === s.num
                                ? 'bg-[#673DE6] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                        ]"
                    >
                        <span
                            class="h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-black"
                            :class="currentStep === s.num ? 'bg-white text-[#673DE6]' : 'bg-slate-300 text-slate-700'"
                        >
                            {{ s.num }}
                        </span>
                        <span class="truncate">{{ s.title }}</span>
                    </button>
                </div>
            </div>

            <!-- ===================================================== -->
            <!-- MODAL BODY: SCROLLABLE FULL-WIDTH CONTENT             -->
            <!-- ===================================================== -->
            <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-[#F8F9FD] custom-scrollbar">

                <!-- ------------------------------------------------- -->
                <!-- STEP 1: RECEPTION DESK INTAKE                     -->
                <!-- ------------------------------------------------- -->
                <div v-if="currentStep === 1" class="space-y-4 animate-in fade-in duration-150 max-w-6xl mx-auto">
                    <!-- Guest Profile Card -->
                    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                                <User class="h-4 w-4 text-[#673DE6]" />
                                Customer / Host Information
                            </h3>
                            <span class="text-[10px] text-slate-400 font-mono">Voucher #{{ form.voucherNo }}</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Customer / Host Full Name *
                                </label>
                                <input
                                    v-model="form.guestName"
                                    @input="clearStepError('guestName')"
                                    type="text"
                                    required
                                    placeholder="e.g. Mr. Rajesh Kumar / Host Name"
                                    :class="[
                                        'w-full h-8.5 rounded-lg border px-3 text-xs text-slate-900 focus:bg-white focus:outline-none transition',
                                        stepErrors.guestName ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500' : 'border-slate-200 bg-slate-50/60 focus:border-[#673DE6]'
                                    ]"
                                />
                                <span v-if="stepErrors.guestName" class="text-[10px] text-rose-600 font-bold mt-0.5 block">
                                    {{ stepErrors.guestName }}
                                </span>
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                    <Phone class="h-3 w-3 text-emerald-600" />
                                    Phone No. (Primary) *
                                </label>
                                <input
                                    v-model="form.phonePrimary"
                                    @input="clearStepError('phonePrimary')"
                                    type="tel"
                                    required
                                    placeholder="e.g. 8115711507"
                                    :class="[
                                        'w-full h-8.5 rounded-lg border px-3 text-xs text-slate-900 focus:bg-white focus:outline-none transition font-mono',
                                        stepErrors.phonePrimary ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500' : 'border-slate-200 bg-slate-50/60 focus:border-[#673DE6]'
                                    ]"
                                />
                                <span v-if="stepErrors.phonePrimary" class="text-[10px] text-rose-600 font-bold mt-0.5 block">
                                    {{ stepErrors.phonePrimary }}
                                </span>
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
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-mono"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Event / Function Type *
                                </label>
                                <input
                                    v-model="form.eventType"
                                    type="text"
                                    placeholder="e.g. Wedding Reception, Engagement, Tilak, Corporate Meeting"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                    <Mail class="h-3 w-3 text-blue-500" />
                                    Email Address (Optional)
                                </label>
                                <input
                                    v-model="form.email"
                                    type="email"
                                    placeholder="e.g. guest@domain.com"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                    <MapPin class="h-3 w-3 text-rose-500" />
                                    City / Address
                                </label>
                                <input
                                    v-model="form.address"
                                    type="text"
                                    placeholder="e.g. Civil Lines, Raebareli"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Event Schedule & Dates -->
                    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Calendar class="h-4 w-4 text-[#673DE6]" />
                                Function Date & Reserved Timing Slots
                            </h3>
                            <span class="text-[10px] text-slate-400">Voucher Slot Reservation</span>
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
                <!-- STEP 2: BANQUET MANAGER FULL-WIDTH ENGINE         -->
                <!-- ------------------------------------------------- -->
                <div v-if="currentStep === 2" class="space-y-4 animate-in fade-in duration-150">

                    <!-- Live Pax Validation Banner -->
                    <div
                        v-if="paxRules.isBelowMin || paxRules.isAboveMax || form.isMeetingSetup"
                        class="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs"
                        :class="[
                            paxRules.meetingSurcharge > 0
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-purple-50 border-purple-200 text-purple-900'
                        ]"
                    >
                        <div class="flex items-center gap-2">
                            <AlertTriangle class="h-4 w-4 shrink-0 text-amber-600" />
                            <div>
                                <span class="font-bold">{{ paxRules.label }} Capacity Rule:</span>
                                <span> Min Guaranteed: <strong>{{ paxRules.minPax }} Pax</strong> | Max: <strong>{{ paxRules.maxPax }} Pax</strong>.</span>
                                <span v-if="paxRules.isBelowMin" class="ml-1 text-rose-700 font-bold">
                                    Current {{ form.paxGuaranteed }} Pax is below guaranteed minimum.
                                </span>
                            </div>
                        </div>
                        <div v-if="paxRules.meetingSurcharge > 0" class="flex items-center gap-2 font-bold text-rose-700 bg-white/80 px-2.5 py-1 rounded-lg border border-rose-300">
                            <span>Meeting Below-Pax Surcharge Applied:</span>
                            <span class="font-mono text-sm">+₹{{ paxRules.meetingSurcharge.toLocaleString('en-IN') }} (6 Hr Slot)</span>
                        </div>
                    </div>

                    <!-- Manager Catering Control & Deal Lock Bar -->
                    <div class="p-3 rounded-xl bg-gradient-to-r from-purple-50 via-white to-purple-50 border border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                        <div class="flex flex-wrap items-center gap-2.5">
                            <!-- Deal Lock / Unlock Status Button with Slim Barcode -->
                            <div v-if="form.isLocked" class="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 font-bold shadow-2xs">
                                <div class="flex items-center gap-1.5 text-xs">
                                    <Lock class="h-3.5 w-3.5 text-amber-700 shrink-0" />
                                    <span>🔒 DEAL LOCKED</span>
                                </div>
                                <!-- Slim Barcode ("Ptla sa Barcode") -->
                                <div class="hidden sm:flex flex-col items-center bg-white px-2 py-0.5 rounded border border-slate-200">
                                    <svg ref="barcodeSvgStep2" class="h-5 w-36"></svg>
                                    <span class="text-[8.5px] font-mono font-bold text-slate-700">{{ form.digitalSignature || `SN-SIG-${form.voucherNo}` }}</span>
                                </div>
                                <button
                                    type="button"
                                    @click="showAuditModal = true"
                                    class="px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10.5px] font-bold border border-purple-200 cursor-pointer transition flex items-center gap-1"
                                >
                                    <History class="h-3 w-3 text-purple-700" />
                                    <span>Audit Log ({{ form.auditLog?.length || 0 }})</span>
                                </button>
                                <button
                                    type="button"
                                    @click="toggleDealLock"
                                    class="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black cursor-pointer transition shadow-2xs"
                                >
                                    Unlock
                                </button>
                            </div>
                            <div v-else class="flex items-center gap-2">
                                <button
                                    type="button"
                                    @click="toggleDealLock"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition shadow-2xs cursor-pointer"
                                    title="Freeze catering choices so no further edits can be made"
                                >
                                    <Lock class="h-3.5 w-3.5" />
                                    <span>Lock Deal (Freeze Menu)</span>
                                </button>
                                <span class="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                    🟢 Menu Editing Open
                                </span>
                                <button
                                    v-if="form.auditLog && form.auditLog.length"
                                    type="button"
                                    @click="showAuditModal = true"
                                    class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold border border-slate-300 cursor-pointer transition flex items-center gap-1"
                                >
                                    <History class="h-3 w-3 text-slate-600" />
                                    <span>Audit ({{ form.auditLog.length }})</span>
                                </button>
                            </div>

                            <div class="hidden sm:block text-slate-300">|</div>

                            <!-- Mode Selector Switcher: Quotation Mode vs Confirmed Selection -->
                            <div class="inline-flex p-0.5 bg-slate-200/90 rounded-lg border border-slate-300 text-xs shadow-2xs">
                                <button
                                    type="button"
                                    @click="setQuotationMode(true)"
                                    :disabled="form.isLocked"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition cursor-pointer"
                                    :class="form.isQuotationMode 
                                        ? 'bg-purple-700 text-white shadow-xs' 
                                        : 'text-slate-700 hover:text-purple-900 hover:bg-white/60'"
                                    title="Quotation Mode: Prospective offer with all catalog items shown without dish selection"
                                >
                                    <FileText class="h-3.5 w-3.5" />
                                    <span>📋 Quotation Mode (All Food Items)</span>
                                </button>
                                <button
                                    type="button"
                                    @click="setQuotationMode(false)"
                                    :disabled="form.isLocked"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition cursor-pointer"
                                    :class="!form.isQuotationMode 
                                        ? 'bg-[#673DE6] text-white shadow-xs' 
                                        : 'text-slate-700 hover:text-purple-900 hover:bg-white/60'"
                                    title="Confirmed Menu Mode: Select specific dishes according to tier quota"
                                >
                                    <CheckCircle2 class="h-3.5 w-3.5" />
                                    <span>🎯 Confirmed Menu Mode</span>
                                </button>
                            </div>

                            <!-- Selected Status / Counter -->
                            <div v-if="form.isQuotationMode" class="flex items-center gap-1.5 text-[11px] text-purple-900 font-bold bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200">
                                <Sparkles class="h-3.5 w-3.5 text-purple-600 shrink-0" />
                                <span>All {{ totalCatalogItemsCount }} Items Displayed (0 Selected)</span>
                            </div>
                            <div v-else class="flex items-center gap-1.5 text-[11px] text-slate-700">
                                <Utensils class="h-3.5 w-3.5 text-[#673DE6]" />
                                <span>Dishes Picked:</span>
                                <strong class="font-mono text-purple-700 font-black">{{ form.selectedMenuCatalogItems?.length || 0 }} Items</strong>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <template v-if="!form.isQuotationMode">
                                <button
                                    type="button"
                                    @click="selectAllDefaults"
                                    :disabled="form.isLocked"
                                    class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    title="Auto-select recommended dishes according to official tier quotas"
                                >
                                    ✨ Pick Recommended
                                </button>
                                <button
                                    type="button"
                                    @click="clearMenuSelection"
                                    :disabled="form.isLocked"
                                    class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-500 text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    title="Clear all chosen items"
                                >
                                    Clear
                                </button>
                            </template>
                            <button
                                type="button"
                                @click="showShareModal = true"
                                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#673DE6] hover:bg-[#5832D0] text-white font-bold transition shadow-xs cursor-pointer"
                                title="Share guest portal link with client to choose dishes"
                            >
                                <Share2 class="h-3.5 w-3.5" />
                                <span>Share Link to Guest</span>
                            </button>
                        </div>
                    </div>

                    <!-- 3-COLUMN FULL-WIDTH LAYOUT -->
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">

                        <!-- COLUMN 1 (4 Cols): Venues, Packages & Pax Setup -->
                        <div class="lg:col-span-4 space-y-4">
                            <!-- Venue Selection Card -->
                            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h3 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <Building2 class="h-3.5 w-3.5 text-[#673DE6]" />
                                        Venue / Hall Inventory
                                    </h3>
                                    <span class="text-[10px] font-bold font-mono text-purple-700">
                                        ₹{{ venueTotal.toLocaleString('en-IN') }}
                                    </span>
                                </div>

                                <!-- Engagement Package Toggle -->
                                <div class="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200/80 space-y-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[11px] font-bold text-[#673DE6]">Exclusive Engagement Package</span>
                                        <input
                                            type="checkbox"
                                            v-model="form.isEngagementPackage"
                                            class="rounded text-[#673DE6] focus:ring-[#673DE6]"
                                        />
                                    </div>
                                    <div v-if="form.isEngagementPackage" class="grid grid-cols-1 gap-2 pt-1">
                                        <label
                                            class="flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs transition"
                                            :class="form.engagementPackageType === 'swarnim' ? 'bg-purple-50/70 border-[#673DE6] text-[#673DE6] font-semibold' : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'"
                                        >
                                            <div class="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    :checked="form.engagementPackageType === 'swarnim'"
                                                    @change="form.engagementPackageType = form.engagementPackageType === 'swarnim' ? 'none' : 'swarnim'"
                                                    class="rounded text-[#673DE6] focus:ring-[#673DE6]"
                                                />
                                                <div>
                                                    <div class="font-bold text-slate-900">Swarnim Hall (G) + Decor + DJ</div>
                                                    <div class="text-[10px] text-slate-500">Hall + Stage + Flowers + Full DJ Setup</div>
                                                </div>
                                            </div>
                                            <div class="font-mono font-bold text-[#673DE6] text-right">
                                                ₹45,000
                                            </div>
                                        </label>

                                        <label
                                            class="flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs transition"
                                            :class="form.engagementPackageType === 'swarnmahal' ? 'bg-purple-50/70 border-[#673DE6] text-[#673DE6] font-semibold' : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'"
                                        >
                                            <div class="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    :checked="form.engagementPackageType === 'swarnmahal'"
                                                    @change="form.engagementPackageType = form.engagementPackageType === 'swarnmahal' ? 'none' : 'swarnmahal'"
                                                    class="rounded text-[#673DE6] focus:ring-[#673DE6]"
                                                />
                                                <div>
                                                    <div class="font-bold text-slate-900">Swarnmahal Hall (-1) + Decor + DJ</div>
                                                    <div class="text-[10px] text-slate-500">Basement Hall + Stage + Flowers + DJ Setup</div>
                                                </div>
                                            </div>
                                            <div class="font-mono font-bold text-[#673DE6] text-right">
                                                ₹40,000
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <!-- Standalone Venues List -->
                                <div v-if="!form.isEngagementPackage" class="space-y-1.5">
                                    <label
                                        v-for="venue in venueOptions"
                                        :key="venue.id"
                                        @click="toggleVenue(venue.id)"
                                        :class="[
                                            'flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition',
                                            form.selectedVenues.includes(venue.id)
                                                ? 'bg-purple-50/70 border-[#673DE6] text-[#673DE6] font-semibold'
                                                : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                                        ]"
                                    >
                                        <div class="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                :checked="form.selectedVenues.includes(venue.id)"
                                                class="rounded text-[#673DE6] focus:ring-[#673DE6]"
                                            />
                                            <div>
                                                <div class="font-bold text-slate-900">{{ venue.name }}</div>
                                                <div class="text-[10px] text-slate-400">{{ venue.floor }}</div>
                                            </div>
                                        </div>
                                        <div class="font-mono font-bold text-slate-900">
                                            ₹{{ venue.price.toLocaleString('en-IN') }}
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Guaranteed Pax & Meeting Switch -->
                            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h3 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <User class="h-3.5 w-3.5 text-[#673DE6]" />
                                        Guaranteed Pax & Event Setup
                                    </h3>
                                </div>

                                <div>
                                    <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                        Guaranteed Pax (Persons) *
                                    </label>
                                    <input
                                        v-model.number="form.paxGuaranteed"
                                        type="number"
                                        min="10"
                                        class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-bold"
                                    />
                                </div>

                                <!-- Meeting Setup Toggle -->
                                <div class="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 space-y-1">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <span class="text-[11px] font-bold text-amber-900">Corporate Meeting Setup</span>
                                            <p class="text-[10px] text-amber-700">Auto-converts food menu rates & below-pax rules</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            v-model="form.isMeetingSetup"
                                            class="rounded text-amber-600 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>

                                <!-- Rooms Allocation -->
                                <div class="pt-2 border-t border-slate-100 space-y-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[11px] font-bold text-slate-700">Rooms Needed (@ ₹2,500/night)</span>
                                        <span class="font-mono text-xs font-bold text-purple-700">₹{{ roomsTotal.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div class="grid grid-cols-3 gap-2">
                                        <input
                                            v-model.number="form.roomsNeeded"
                                            type="number"
                                            min="0"
                                            placeholder="Rooms"
                                            class="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-900"
                                        />
                                        <input
                                            v-model="form.roomArrival"
                                            type="time"
                                            title="Arrival Time"
                                            class="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px]"
                                        />
                                        <input
                                            v-model="form.roomDeparture"
                                            type="time"
                                            title="Departure Time"
                                            class="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- COLUMN 2 (5 Cols): Fooding Engine & Docx Menu Catalog -->
                        <div class="lg:col-span-5 flex flex-col space-y-4">
                            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex-1 flex flex-col">
                                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div class="flex items-center gap-1.5">
                                        <Utensils class="h-3.5 w-3.5 text-[#673DE6]" />
                                        <h3 class="text-xs font-bold text-slate-900">
                                            Fooding Package & Menu Tiers
                                        </h3>
                                    </div>
                                    <span class="font-mono text-xs font-bold text-purple-700">
                                        ₹{{ foodTotal.toLocaleString('en-IN') }}
                                    </span>
                                </div>

                                <!-- 4 Base Menu Tiers (@499 / @799 / @999 / @1199) -->
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <button
                                        v-for="tier in ([499, 799, 999, 1199] as const)"
                                        :key="tier"
                                        type="button"
                                        @click="form.menuRateTier = tier; activeMenuPreviewTier = tier"
                                        :class="[
                                            'p-2.5 rounded-xl border text-left transition flex flex-col justify-between',
                                            form.menuRateTier === tier
                                                ? 'bg-[#673DE6] text-white border-[#673DE6] shadow-xs'
                                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                        ]"
                                    >
                                        <div class="text-[10px] font-medium" :class="form.menuRateTier === tier ? 'text-purple-200' : 'text-slate-400'">
                                            Tier Rate
                                        </div>
                                        <div class="font-mono text-base font-black">
                                            ₹{{ tier }}
                                        </div>
                                        <div class="text-[9px] truncate" :class="form.menuRateTier === tier ? 'text-purple-100' : 'text-slate-500'">
                                            {{ tier === 499 ? 'Veg Buffet' : tier === 799 ? 'Royal Deluxe' : tier === 999 ? 'Imperial' : 'Royal Grand' }}
                                        </div>
                                    </button>
                                </div>

                                <!-- Meeting Rate Conversion Alert -->
                                <div v-if="form.isMeetingSetup" class="p-2 rounded-lg bg-purple-50 border border-purple-200 text-[11px] flex items-center justify-between text-[#673DE6] font-bold">
                                    <span>Meeting Conversion Active:</span>
                                    <span>Base ₹{{ form.menuRateTier }} ➔ Effective <strong class="text-sm font-black font-mono">₹{{ effectiveMenuRate }}</strong> / Pax</span>
                                </div>

                                <!-- Special Servings & Breakfast Addons -->
                                <div class="pt-2 border-t border-slate-100 space-y-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[11px] font-bold text-slate-700">Special Servings & Breakfast Addons</span>
                                        <span class="font-mono text-xs font-bold text-purple-700">
                                            ₹{{ ((form.engagementBreakfastPax * 200) + (form.regularBreakfastPax * 300) + (form.bainaBoxes * 260) + (form.mandapServingsPax * 60)).toLocaleString('en-IN') }}
                                        </span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="text-[10px] font-bold text-slate-700">Engagement Bf (@₹200)</span>
                                                <span class="font-mono text-[10px] text-purple-700">₹{{ (form.engagementBreakfastPax * 200).toLocaleString('en-IN') }}</span>
                                            </div>
                                            <input
                                                v-model.number="form.engagementBreakfastPax"
                                                type="number"
                                                min="0"
                                                placeholder="Pax count"
                                                class="w-full h-7 rounded border border-slate-200 px-2 text-xs font-bold"
                                            />
                                        </div>

                                        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="text-[10px] font-bold text-slate-700">Regular Bf (@₹300)</span>
                                                <span class="font-mono text-[10px] text-purple-700">₹{{ (form.regularBreakfastPax * 300).toLocaleString('en-IN') }}</span>
                                            </div>
                                            <input
                                                v-model.number="form.regularBreakfastPax"
                                                type="number"
                                                min="0"
                                                placeholder="Pax count"
                                                class="w-full h-7 rounded border border-slate-200 px-2 text-xs font-bold"
                                            />
                                        </div>

                                        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="text-[10px] font-bold text-slate-700">Baina Box (@₹260)</span>
                                                <span class="font-mono text-[10px] text-purple-700">₹{{ (form.bainaBoxes * 260).toLocaleString('en-IN') }}</span>
                                            </div>
                                            <input
                                                v-model.number="form.bainaBoxes"
                                                type="number"
                                                min="0"
                                                placeholder="Box count"
                                                class="w-full h-7 rounded border border-slate-200 px-2 text-xs font-bold"
                                            />
                                        </div>

                                        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="text-[10px] font-bold text-slate-700">Mandap Servings (@₹60)</span>
                                                <span class="font-mono text-[10px] text-purple-700">₹{{ (form.mandapServingsPax * 60).toLocaleString('en-IN') }}</span>
                                            </div>
                                            <input
                                                v-model.number="form.mandapServingsPax"
                                                type="number"
                                                min="0"
                                                placeholder="Pax count"
                                                class="w-full h-7 rounded border border-slate-200 px-2 text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <!-- Official Docx Menu Selection Panel (Interactive Checkboxes for Manager) -->
                                <div class="pt-2 border-t border-slate-100 flex-1 flex flex-col min-h-0">
                                    <div class="flex items-center justify-between mb-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs font-bold text-slate-900">
                                                Catering Courses & Dish Selection
                                            </span>
                                            <span class="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold border border-purple-200">
                                                Tier ₹{{ effectiveMenuRate }}
                                            </span>
                                            <span v-if="form.isQuotationMode" class="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-black border border-purple-300 flex items-center gap-1">
                                                <Sparkles class="h-3 w-3 text-purple-600" />
                                                QUOTATION MODE
                                            </span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span v-if="form.isQuotationMode" class="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                All {{ totalCatalogItemsCount }} Food Items Displayed
                                            </span>
                                            <span v-else class="text-[10px] font-mono font-bold text-purple-700">
                                                {{ form.selectedMenuCatalogItems?.length || 0 }} Dishes Selected
                                            </span>
                                            <button
                                                type="button"
                                                @click="setQuotationMode(!form.isQuotationMode)"
                                                :disabled="form.isLocked"
                                                class="px-2 py-0.5 rounded text-[10.5px] font-bold border transition cursor-pointer"
                                                :class="form.isQuotationMode ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'"
                                            >
                                                {{ form.isQuotationMode ? '🎯 Pick Dishes' : '📋 Quotation Mode' }}
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Quotation Mode Banner -->
                                    <div v-if="form.isQuotationMode" class="p-2.5 rounded-lg bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 text-xs flex items-center justify-between gap-2 mb-2 shadow-2xs">
                                        <div class="flex items-center gap-2 text-purple-950">
                                            <Sparkles class="h-4 w-4 text-purple-600 shrink-0" />
                                            <div>
                                                <span class="font-bold text-purple-900">Quotation Mode Active:</span>
                                                <span class="text-purple-800 ml-1">Kuch select nahi rahega — proposal quotation me catalog ke sabhi {{ totalCatalogItemsCount }} food items display honge.</span>
                                            </div>
                                        </div>
                                        <span class="shrink-0 text-[10px] font-mono font-bold bg-white text-purple-900 px-2 py-0.5 rounded border border-purple-300">
                                            0 Required / Open Quota
                                        </span>
                                    </div>

                                    <!-- Full-Height Expandable Scrollable Course Container (No Empty Gap) -->
                                    <div class="flex-1 min-h-[460px] max-h-[660px] overflow-y-auto p-2.5 rounded-lg bg-slate-50/80 border border-slate-200 text-[11px] space-y-3 custom-scrollbar">
                                        <div
                                            v-for="course in allCoursesList"
                                            :key="course.key"
                                            class="p-2 rounded bg-white border border-slate-200/80 shadow-2xs"
                                        >
                                            <div class="flex items-center justify-between font-bold text-slate-900 pb-1 mb-1.5 border-b border-slate-100">
                                                <span class="flex items-center gap-1.5">
                                                    <span>{{ course.icon }}</span>
                                                    <span>{{ course.label }}</span>
                                                </span>
                                                <!-- Quotation Mode Badge vs Selection Badge -->
                                                <span
                                                    v-if="form.isQuotationMode"
                                                    class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-mono"
                                                >
                                                    All {{ course.items.length }} Offered • Quota: {{ course.count }}
                                                </span>
                                                <span
                                                    v-else
                                                    class="text-[9.5px] font-bold px-1.5 py-0.5 rounded transition font-mono"
                                                    :class="isCategoryFull(course.items, course.count) ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black' : 'bg-purple-50 text-purple-700'"
                                                >
                                                    {{ getCategorySelectedCount(course.items) }}/{{ course.count }} {{ isCategoryFull(course.items, course.count) ? 'Max' : 'Picked' }}
                                                </span>
                                            </div>

                                            <!-- Quotation Mode: All food items displayed cleanly with purple bullets -->
                                            <div v-if="form.isQuotationMode" class="grid grid-cols-2 gap-1 text-[10.5px]">
                                                <div
                                                    v-for="item in course.items"
                                                    :key="item"
                                                    class="flex items-center gap-1.5 py-0.5 text-slate-800"
                                                >
                                                    <span class="h-1.5 w-1.5 rounded-full bg-purple-600 shrink-0"></span>
                                                    <span class="truncate font-medium text-slate-800">{{ item }}</span>
                                                </div>
                                            </div>

                                            <!-- Confirmed Selection Mode: Interactive Checkboxes -->
                                            <div v-else class="grid grid-cols-2 gap-1 text-[10.5px]">
                                                <label
                                                    v-for="item in course.items"
                                                    :key="item"
                                                    :class="['flex items-center gap-1.5 select-none', form.isLocked || (!isItemSelected(item) && isCategoryFull(course.items, course.count)) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        :checked="isItemSelected(item)"
                                                        @change="toggleMenuItem(item, course.items, course.count)"
                                                        :disabled="form.isLocked || (!isItemSelected(item) && isCategoryFull(course.items, course.count))"
                                                        class="rounded text-[#673DE6] focus:ring-[#673DE6] h-3 w-3 disabled:opacity-40 cursor-pointer"
                                                    />
                                                    <span :class="isItemSelected(item) ? 'font-bold text-slate-900' : 'text-slate-600'" class="truncate">{{ item }}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- COLUMN 3 (3 Cols): Decor Packages, AV & Realtime Totals -->
                        <div class="lg:col-span-3 space-y-4">
                            <!-- Decor & AV Setup -->
                            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h3 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <Sparkles class="h-3.5 w-3.5 text-[#673DE6]" />
                                        Decoration & AV Setup
                                    </h3>
                                    <span class="font-mono text-xs font-bold text-purple-700">
                                        ₹{{ decorAvTotal.toLocaleString('en-IN') }}
                                    </span>
                                </div>

                                <!-- Curated Decor Packages -->
                                <div v-if="!form.isEngagementPackage" class="space-y-1.5">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase">Decor Package</label>
                                    <div class="space-y-1.5">
                                        <label
                                            class="flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition"
                                            :class="form.decorPackageType === 'standard' ? 'bg-purple-50/70 border-[#673DE6] text-[#673DE6] font-semibold' : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'"
                                        >
                                            <div class="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    :checked="form.decorPackageType === 'standard'"
                                                    @change="form.decorPackageType = form.decorPackageType === 'standard' ? 'none' : 'standard'"
                                                    class="rounded text-[#673DE6] focus:ring-[#673DE6]"
                                                />
                                                <div>
                                                    <div class="font-bold text-slate-900">Standard Event Decor</div>
                                                    <div class="text-[10px] text-slate-500">DJ, Stage, Flower, Entrance, Selfie</div>
                                                </div>
                                            </div>
                                            <div class="font-mono font-bold text-slate-900">
                                                ₹30,000
                                            </div>
                                        </label>

                                        <label
                                            class="flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition"
                                            :class="form.decorPackageType === 'wedding' ? 'bg-purple-50/70 border-[#673DE6] text-[#673DE6] font-semibold' : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'"
                                        >
                                            <div class="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    :checked="form.decorPackageType === 'wedding'"
                                                    @change="form.decorPackageType = form.decorPackageType === 'wedding' ? 'none' : 'wedding'"
                                                    class="rounded text-[#673DE6] focus:ring-[#673DE6]"
                                                />
                                                <div>
                                                    <div class="font-bold text-slate-900">Wedding Decor Package</div>
                                                    <div class="text-[10px] text-slate-500">Walkway, Garden, Dual DJ + Mandap</div>
                                                </div>
                                            </div>
                                            <div class="font-mono font-bold text-slate-900">
                                                ₹48,000
                                            </div>
                                        </label>

                                        <label
                                            class="flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition"
                                            :class="form.decorPackageType === 'grand' ? 'bg-purple-50/70 border-[#673DE6] text-[#673DE6] font-semibold' : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'"
                                        >
                                            <div class="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    :checked="form.decorPackageType === 'grand'"
                                                    @change="form.decorPackageType = form.decorPackageType === 'grand' ? 'none' : 'grand'"
                                                    class="rounded text-[#673DE6] focus:ring-[#673DE6]"
                                                />
                                                <div>
                                                    <div class="font-bold text-slate-900">Grand Theme Setup</div>
                                                    <div class="text-[10px] text-slate-500">Light, Tent, Flowers, Theme Stage</div>
                                                </div>
                                            </div>
                                            <div class="font-mono font-bold text-slate-900">
                                                ₹60,000
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <!-- AV Setup Checklist -->
                                <div class="pt-2 border-t border-slate-100 space-y-1.5">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase">Audio / Visual Addons</label>
                                    <label class="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs cursor-pointer">
                                        <span class="flex items-center gap-1.5">
                                            <input type="checkbox" v-model="form.soundMicSetup" class="rounded text-[#673DE6]" />
                                            Sound & Mic Setup
                                        </span>
                                        <span class="font-mono font-bold text-slate-700">₹7,000</span>
                                    </label>

                                    <label class="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs cursor-pointer">
                                        <span class="flex items-center gap-1.5">
                                            <input type="checkbox" v-model="form.projectorSetup" class="rounded text-[#673DE6]" />
                                            Projector & Screen
                                        </span>
                                        <span class="font-mono font-bold text-slate-700">₹5,000</span>
                                    </label>

                                    <label class="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs cursor-pointer">
                                        <span class="flex items-center gap-1.5">
                                            <input type="checkbox" v-model="form.ledWallSetup" class="rounded text-[#673DE6]" />
                                            LED Video Wall
                                        </span>
                                        <span class="font-mono font-bold text-slate-700">₹12,000</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Live Baseline Costing Summary Card -->
                            <div class="bg-slate-900 text-white p-4 rounded-xl shadow-md space-y-2 font-sans">
                                <div class="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                                    Live Cost Formulation
                                </div>
                                <div class="space-y-1 text-xs border-b border-slate-800 pb-2 font-mono">
                                    <div class="flex justify-between"><span>Fooding:</span> <span>₹{{ foodTotal.toLocaleString('en-IN') }}</span></div>
                                    <div class="flex justify-between"><span>Venue(s):</span> <span>₹{{ venueTotal.toLocaleString('en-IN') }}</span></div>
                                    <div class="flex justify-between"><span>Rooms:</span> <span>₹{{ roomsTotal.toLocaleString('en-IN') }}</span></div>
                                    <div class="flex justify-between"><span>Decor & AV:</span> <span>₹{{ decorAvTotal.toLocaleString('en-IN') }}</span></div>
                                    <div v-if="extraFoodingTotal > 0" class="flex justify-between"><span>Extra Servings:</span> <span>₹{{ extraFoodingTotal.toLocaleString('en-IN') }}</span></div>
                                    <div v-if="paxRules.meetingSurcharge > 0" class="flex justify-between text-amber-300"><span>Meeting Surcharge:</span> <span>₹{{ paxRules.meetingSurcharge.toLocaleString('en-IN') }}</span></div>
                                </div>
                                <div class="flex items-baseline justify-between pt-1">
                                    <span class="text-xs font-bold text-slate-300">Gross Baseline:</span>
                                    <span class="text-xl font-black font-mono text-emerald-400">
                                        ₹{{ totalGrossAmount.toLocaleString('en-IN') }}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- ------------------------------------------------- -->
                <!-- STEP 3: TIERED APPROVAL & DISCOUNT (₹ FIRST)      -->
                <!-- ------------------------------------------------- -->
                <div v-if="currentStep === 3 && (userRole === 'md' || userRole === 'superadmin')" class="space-y-4 animate-in fade-in duration-150 max-w-6xl mx-auto">
                    <!-- Executive Dark Card -->
                    <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-800">
                        <div class="flex items-center justify-between border-b border-slate-700/80 pb-3">
                            <div>
                                <p class="text-[10px] font-bold tracking-widest uppercase text-slate-400">SENANI HOTEL PLEASANT VIEW • ESTIMATE #{{ form.voucherNo }}</p>
                                <h3 class="text-base sm:text-lg font-extrabold text-white mt-0.5">
                                    {{ form.guestName }} • {{ form.eventType }}
                                </h3>
                                <p class="text-xs text-slate-400 font-mono">
                                    Guaranteed: {{ form.paxGuaranteed }} Pax @ ₹{{ effectiveMenuRate }}/plate | Function: {{ form.functionDateFrom }}
                                </p>
                            </div>
                            <div class="text-right">
                                <span class="rounded-full px-3 py-1 text-xs font-bold border inline-flex items-center gap-1" :class="authorityLevel.badgeClass">
                                    {{ authorityLevel.title }}
                                </span>
                                <div class="text-[10px] text-slate-400 mt-1.5 font-mono">
                                    {{ authorityLevel.maxAllowedText }}
                                </div>
                            </div>
                        </div>

                        <!-- 4 Big Financial Indicators (Amount First!) -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 font-mono">
                            <div>
                                <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gross Total</span>
                                <div class="text-lg sm:text-2xl font-black text-slate-100 mt-0.5">
                                    ₹{{ totalGrossAmount.toLocaleString('en-IN') }}
                                </div>
                            </div>

                            <div>
                                <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Discount in ₹ (Amount)</span>
                                <div class="text-lg sm:text-2xl font-black text-amber-300 mt-0.5">
                                    -₹{{ calculatedDiscountAmount.toLocaleString('en-IN') }}
                                    <span class="text-xs font-normal text-amber-200/80">({{ calculatedDiscountPercent }}%)</span>
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

                    <!-- Interactive Discount Matrix Controller: Currency-First -->
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div class="flex items-center gap-2">
                                <div class="h-8 w-8 rounded-lg bg-purple-50 text-[#673DE6] flex items-center justify-center">
                                    <Sliders class="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 class="text-xs sm:text-sm font-bold text-slate-900">
                                        Tiered Discount Controller (Always in ₹ Numbers)
                                    </h4>
                                    <p class="text-[11px] text-slate-500">
                                        Manager: up to 5% | GM: up to 7% | Harshit Call: up to 10% | MD: >10%
                                    </p>
                                </div>
                            </div>

                            <!-- Discount Input Direct in Rupees -->
                            <div class="flex items-center gap-2">
                                <div class="flex items-center gap-1 border border-slate-300 rounded-lg px-2 py-1 bg-slate-50">
                                    <span class="text-xs font-bold text-slate-500">₹</span>
                                    <input
                                        type="number"
                                        :value="form.discountRupees"
                                        @input="setDiscountFromAmount(Number(($event.target as HTMLInputElement).value))"
                                        placeholder="Discount in ₹"
                                        class="w-28 text-xs font-bold text-slate-900 bg-transparent focus:outline-none font-mono"
                                    />
                                </div>
                                <span class="text-xs text-slate-400">or</span>
                                <!-- Quick Percent Buttons -->
                                <div class="flex items-center gap-1">
                                    <button
                                        v-for="pct in [0, 5, 7, 10]"
                                        :key="pct"
                                        type="button"
                                        @click="setDiscountFromPercent(pct)"
                                        :class="[
                                            'h-7 px-2.5 rounded-lg text-xs font-bold transition font-mono',
                                            calculatedDiscountPercent === pct
                                                ? 'bg-[#673DE6] text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        ]"
                                    >
                                        {{ pct }}%
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- The Range Slider with Currency Labels -->
                        <div class="py-2">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-bold text-slate-700">
                                    Current Discount Amount:
                                    <strong class="text-emerald-700 text-base font-black font-mono">
                                        ₹{{ calculatedDiscountAmount.toLocaleString('en-IN') }}
                                    </strong>
                                    <span class="text-xs font-normal text-slate-400 ml-1">({{ calculatedDiscountPercent }}%)</span>
                                </span>
                                <span class="text-xs font-semibold" :class="authorityLevel.isWarning ? 'text-amber-700' : 'text-slate-600'">
                                    Sign-off: <strong>{{ authorityLevel.title }}</strong>
                                </span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="20"
                                step="0.5"
                                :value="calculatedDiscountPercent"
                                @input="setDiscountFromPercent(Number(($event.target as HTMLInputElement).value))"
                                class="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#673DE6]"
                            />

                            <!-- Tier Range Indicators -->
                            <div class="grid grid-cols-4 text-[10px] text-slate-500 pt-2 font-mono">
                                <div>0% (Standard)</div>
                                <div class="text-center text-emerald-700 font-bold">5% (Manager: ₹{{ discountLimitManager.toLocaleString('en-IN') }})</div>
                                <div class="text-center text-blue-700 font-bold">7% (GM: ₹{{ discountLimitGM.toLocaleString('en-IN') }})</div>
                                <div class="text-right text-amber-700 font-bold">10% (Harshit: ₹{{ discountLimitHarshit.toLocaleString('en-IN') }})</div>
                            </div>
                        </div>

                        <!-- Advance Paid & Payment Mode -->
                        <div class="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Advance Amount Paid (₹)
                                </label>
                                <input
                                    v-model.number="form.amountPaid"
                                    type="number"
                                    min="0"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-bold font-mono"
                                />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Payment Mode
                                </label>
                                <select
                                    v-model="form.paymentMode"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI / QR">UPI / QR</option>
                                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                                    <option value="Card">Credit / Debit Card</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                                    Authority Seal & Sign-off
                                </label>
                                <button
                                    type="button"
                                    @click="approveByAuthority"
                                    class="w-full h-8.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                                    :class="form.status === 'approved_md' ? 'bg-emerald-600' : 'bg-[#673DE6] hover:bg-[#5832D0]'"
                                >
                                    <ShieldCheck class="h-4 w-4" />
                                    <span>{{ form.status === 'approved_md' ? 'Authorized & Signed' : 'Sign & Approve Estimate' }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 3 Restricted Fallback (if non-MD somehow targets Step 3) -->
                <div v-else-if="currentStep === 3 && userRole !== 'md' && userRole !== 'superadmin'" class="p-8 text-center bg-white rounded-2xl border border-amber-200 max-w-lg mx-auto my-8 space-y-3 shadow-xs">
                    <div class="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl font-bold">
                        🔒
                    </div>
                    <h3 class="text-sm font-bold text-slate-900">Step 3 Restricted to Managing Director & Super Admin</h3>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        Stage 3 (Final MD Approval, Custom Discounts & Contract Seal) requires Managing Director or Super Admin authorization. Please review or save from Step 2.
                    </p>
                </div>

            </div>

            <!-- ===================================================== -->
            <!-- MODAL FOOTER: ACTION BUTTONS                          -->
            <!-- ===================================================== -->
            <div class="shrink-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
                <div>
                    <button
                        v-if="currentStep > 1"
                        type="button"
                        @click="prevStep"
                        class="h-8 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                    >
                        <ArrowLeft class="h-3.5 w-3.5" />
                        <span>Previous</span>
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        @click="showPrintPreview = true"
                        class="h-8 px-3 rounded-lg border border-purple-200 bg-purple-50 text-[#673DE6] hover:bg-purple-100 text-xs font-bold transition flex items-center gap-1.5"
                    >
                        <Printer class="h-3.5 w-3.5" />
                        <span>Print Voucher (#{{ form.voucherNo }})</span>
                    </button>

                    <button
                        type="button"
                        @click="handleDownloadPdf"
                        :disabled="isPdfDownloading"
                        class="h-8 px-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-wait"
                    >
                        <Loader2 v-if="isPdfDownloading" class="h-3.5 w-3.5 animate-spin" />
                        <Download v-else class="h-3.5 w-3.5" />
                        <span>{{ isPdfDownloading ? 'Generating…' : 'Download PDF' }}</span>
                    </button>

                    <button
                        type="button"
                        @click="saveAndClose"
                        class="h-8 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                    >
                        Save & Exit Draft
                    </button>

                    <!-- Reception Action -->
                    <template v-if="userRole === 'reception'">
                        <button
                            type="button"
                            @click="submitReceptionStep1"
                            class="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                            <CheckCircle2 class="h-3.5 w-3.5" />
                            <span>Save & Forward to Banquet Manager</span>
                        </button>
                    </template>

                    <!-- Manager Actions -->
                    <template v-else-if="userRole === 'manager'">
                        <button
                            v-if="currentStep === 1"
                            type="button"
                            @click="nextStep"
                            class="h-8 px-4 rounded-lg bg-[#673DE6] hover:bg-[#5832D0] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                            <span>Next: Configure Setup</span>
                            <ArrowRight class="h-3.5 w-3.5" />
                        </button>
                        <button
                            v-else
                            type="button"
                            @click="submitManagerStep2"
                            class="h-8 px-4 rounded-lg bg-[#673DE6] hover:bg-[#5832D0] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                            <CheckCircle2 class="h-3.5 w-3.5" />
                            <span>Save & Forward to MD for Final Approval</span>
                        </button>
                    </template>

                    <!-- MD / Super Authority Actions -->
                    <template v-else>
                        <button
                            v-if="userRole === 'superadmin' && initialInquiry"
                            type="button"
                            @click="$emit('delete', { ...form }); $emit('close')"
                            class="h-8 px-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Super Admin Only: Permanently Delete Inquiry"
                        >
                            <Trash2 class="h-3.5 w-3.5" />
                            <span>Delete Inquiry</span>
                        </button>
                        <button
                            v-if="currentStep < 3"
                            type="button"
                            @click="nextStep"
                            class="h-8 px-4 rounded-lg bg-[#673DE6] hover:bg-[#5832D0] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                            <span>Next Step</span>
                            <ArrowRight class="h-3.5 w-3.5" />
                        </button>
                        <button
                            v-else
                            type="button"
                            @click="submitMdFinalize"
                            class="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                            <CheckCircle2 class="h-3.5 w-3.5" />
                            <span>👑 {{ userRole === 'superadmin' ? 'Super Admin Final Approve & Freeze' : 'MD Final Approve & Freeze Contract' }}</span>
                        </button>
                    </template>
                </div>
            </div>

            <!-- ===================================================== -->
            <!-- PRINTABLE VOUCHER MODAL OVERLAY (Invoice + Package + Menu) -->
            <!-- ===================================================== -->
            <div
                v-if="showPrintPreview"
                class="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
            >
                <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-900 border border-slate-300 print:border-none print:shadow-none print:p-0 my-auto max-h-[95vh] overflow-y-auto custom-scrollbar">
                    <!-- Close & Action Bar in Preview (Hidden during print) -->
                    <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 print:hidden sticky top-0 bg-white z-10">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-black text-slate-900 tracking-tight uppercase">Banquet Booking Voucher & Full Contract Dossier</span>
                            <span class="rounded-full bg-purple-100 text-[#673DE6] text-[10px] font-bold px-2 py-0.5 border border-purple-200">#{{ form.voucherNo }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                type="button"
                                @click="triggerPrint"
                                class="h-8 px-4 rounded-lg bg-[#673DE6] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#5832D0] shadow-xs transition"
                            >
                                <Printer class="h-3.5 w-3.5" />
                                <span>Print Full Voucher (Invoice + Inclusions + Menu)</span>
                            </button>
                            <button
                                type="button"
                                @click="handleDownloadPdf"
                                :disabled="isPdfDownloading"
                                class="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 shadow-xs transition disabled:opacity-60 disabled:cursor-wait"
                            >
                                <Loader2 v-if="isPdfDownloading" class="h-3.5 w-3.5 animate-spin" />
                                <Download v-else class="h-3.5 w-3.5" />
                                <span>{{ isPdfDownloading ? 'Generating PDF…' : 'Download PDF' }}</span>
                            </button>
                            <button
                                type="button"
                                @click="showPrintPreview = false"
                                class="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                            >
                                <X class="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <!-- COMPLETE 2-PAGE LUXURY EXECUTIVE DOSSIER -->
                    <div id="printable-voucher" class="bg-white text-slate-900 text-[11px] font-sans">
                        
                        <!-- ========================================================= -->
                        <!-- PAGE 1: COMMERCIAL CONTRACT & INFRASTRUCTURE LOGISTICS   -->
                        <!-- ========================================================= -->
                        <div class="print-page page-1 bg-white p-4 print:p-0 border border-slate-300 print:border-none rounded-xl print:rounded-none space-y-2.5" style="page-break-after: always; break-after: page; page-break-inside: avoid; break-inside: avoid;">
                            <!-- Top Regal Letterhead -->
                            <div class="flex items-start justify-between border-b-2 border-slate-900 pb-2">
                                <div class="flex items-center gap-3.5">
                                    <img src="/images/logo-dark.png" alt="Senani Hotel Pleasant View" class="h-12 w-auto object-contain" />
                                    <div class="border-l-2 border-amber-600/40 pl-3">
                                        <div class="text-sm font-serif font-black tracking-wider text-slate-950 uppercase">Hotel Pleasant View</div>
                                        <div class="text-xs font-bold text-amber-900 tracking-wide">BANQUET & CONVENTION CONTRACT DOSSIER</div>
                                        <div class="text-[10.5px] text-slate-600 font-medium">A Premium Hospitality Unit of Senani Group • Civil Lines, Raebareli, UP</div>
                                        <div class="text-[10.5px] text-slate-500 font-mono">GSTIN: 09AAAAA0000A1Z5 • 24x7 Executive Front Desk</div>
                                    </div>
                                </div>
                                <div class="text-right text-[10.5px] leading-tight text-slate-700 bg-slate-50 border border-slate-200 rounded p-2">
                                    <div class="font-bold text-slate-900 pb-0.5 border-b border-slate-200 mb-0.5">HELPLINE & BOOKING DESK</div>
                                    <div class="font-mono">RECEPTION: <span class="font-bold text-slate-900">+91 9794152222</span></div>
                                    <div class="font-mono">MANAGER: <span class="font-bold text-slate-900">+91 9794152223</span></div>
                                    <div class="font-mono">MD OFFICE: <span class="font-bold text-slate-900">+91 9794152224</span></div>
                                    <div class="font-mono">SALES: <span class="font-bold text-slate-900">+91 9794152225</span></div>
                                </div>
                            </div>

                            <!-- Booking Reference Strip -->
                            <div class="flex items-center justify-between py-1.5 px-3 bg-slate-900 text-white rounded-lg font-medium text-xs">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-amber-400 font-bold">VOUCHER NO:</span>
                                    <span class="font-mono font-black text-white text-sm">#{{ form.voucherNo }}</span>
                                </div>
                                <div class="text-[10.5px] font-mono uppercase px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold">
                                    {{ form.isQuotationMode ? 'OFFICIAL BANQUET QUOTATION PROPOSAL' : (form.status === 'approved_md' ? 'OFFICIAL BOOKING CONFIRMATION' : 'PROVISIONAL INQUIRY QUOTATION') }}
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-slate-300">DATE:</span>
                                    <span class="font-mono font-bold text-white">{{ form.inquiryDate }}</span>
                                </div>
                            </div>

                            <!-- Client & Event Matrix (Clean Grid) -->
                            <div class="p-2.5 bg-slate-50/80 border border-slate-200 rounded-lg text-[11.5px] space-y-1.5">
                                <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <div class="flex">
                                        <span class="w-28 font-bold text-slate-600">Client / Host:</span>
                                        <span class="font-black text-slate-950">{{ form.guestName }}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-28 font-bold text-slate-600">Contact Number:</span>
                                        <span class="font-mono font-bold text-slate-900">{{ form.phonePrimary }}</span>
                                        <span v-if="form.phoneSecondary" class="font-mono ml-2 text-slate-600">, {{ form.phoneSecondary }}</span>
                                    </div>
                                </div>
                                <div class="flex">
                                    <span class="w-28 font-bold text-slate-600">Address:</span>
                                    <span class="text-slate-800">{{ form.address || 'Civil Lines, Raebareli' }}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-slate-200/70">
                                    <div>
                                        <span class="w-28 inline-block font-bold text-slate-600">Function Date:</span>
                                        <span class="font-bold text-slate-900">{{ form.functionDateFrom }}</span>
                                        <span v-if="form.functionDateTo && form.functionDateTo !== form.functionDateFrom"> to <span class="font-bold text-slate-900">{{ form.functionDateTo }}</span></span>
                                    </div>
                                    <div>
                                        <span class="font-bold text-slate-600">Timing Slot:</span>
                                        <span class="font-semibold text-slate-900 ml-1.5">{{ form.timeFrom }} to {{ form.timeTo }}</span>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <div>
                                        <span class="w-28 inline-block font-bold text-slate-600">Event Type:</span>
                                        <span class="font-bold text-amber-900">{{ form.eventType }}</span>
                                    </div>
                                    <div>
                                        <span class="font-bold text-slate-600">Catering Tier:</span>
                                        <span class="font-bold text-slate-900 ml-1.5">₹{{ effectiveMenuRate }}/plate ({{ currentMenuCatalog.title }})</span>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <div>
                                        <span class="w-28 inline-block font-bold text-slate-600">Guaranteed Pax:</span>
                                        <span class="font-black text-slate-950">{{ form.paxGuaranteed }} Persons</span>
                                    </div>
                                    <div>
                                        <span class="font-bold text-slate-600">Allocated Area:</span>
                                        <span v-if="form.isEngagementPackage" class="font-bold text-amber-900 ml-1.5">Engagement Package ({{ form.engagementPackageType.toUpperCase() }})</span>
                                        <span v-else class="font-bold text-slate-900 ml-1.5">{{ form.selectedVenues.map(v => v.toUpperCase()).join(', ') }}</span>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <div>
                                        <span class="w-28 inline-block font-bold text-slate-600">Rooms Allotted:</span>
                                        <span class="font-bold text-slate-900">{{ form.roomsNeeded }} Executive AC Rooms</span>
                                        <span class="text-slate-500 text-[10.5px] ml-1">(@ ₹{{ form.roomRate || 2500 }}/night)</span>
                                    </div>
                                    <div>
                                        <span class="font-bold text-slate-600">Room Stay:</span>
                                        <span class="text-slate-800 ml-1.5">{{ form.roomArrival }} to {{ form.roomDeparture }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Commercial Billing & Settlement Breakdown -->
                            <div class="border border-slate-300 rounded-lg overflow-hidden bg-white">
                                <div class="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between font-bold text-[11.5px] text-slate-900">
                                    <span>COMMERCIAL INVOICE BREAKDOWN</span>
                                    <span class="text-[10.5px] font-mono text-slate-500 font-normal">All amounts in INR</span>
                                </div>
                                <div class="p-2.5 space-y-1 font-mono text-[11.5px]">
                                    <div class="flex justify-between text-slate-700">
                                        <span>Catering Buffet ({{ form.paxGuaranteed }} Pax × ₹{{ effectiveMenuRate }}):</span>
                                        <span class="font-bold">₹{{ foodTotal.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div v-if="extraFoodingTotal > 0" class="flex justify-between text-slate-700">
                                        <span>Extra Ritual Servings & Breakfast Add-ons:</span>
                                        <span class="font-bold">₹{{ extraFoodingTotal.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div v-if="venueTotal > 0" class="flex justify-between text-slate-700">
                                        <span>Banquet Hall & Allocated Spaces:</span>
                                        <span class="font-bold">₹{{ venueTotal.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div v-if="roomsTotal > 0" class="flex justify-between text-slate-700">
                                        <span>Executive Room Stays ({{ form.roomsNeeded }} Rooms):</span>
                                        <span class="font-bold">₹{{ roomsTotal.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div v-if="decorAvTotal > 0" class="flex justify-between text-slate-700">
                                        <span>Stage Backdrop, Floral Ambience & AV Setup:</span>
                                        <span class="font-bold">₹{{ decorAvTotal.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div v-if="otherAddonsTotal > 0" class="flex justify-between text-slate-700">
                                        <span>Meeting Pax Surcharge / Specialized Add-ons:</span>
                                        <span class="font-bold">₹{{ otherAddonsTotal.toLocaleString('en-IN') }}</span>
                                    </div>

                                    <!-- Total Estimated Baseline -->
                                    <div class="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900">
                                        <span>Total Estimated Baseline:</span>
                                        <span>₹{{ totalGrossAmount.toLocaleString('en-IN') }}</span>
                                    </div>

                                    <!-- Management Concession (if any) -->
                                    <div v-if="calculatedDiscountAmount > 0" class="flex justify-between text-emerald-800 font-bold">
                                        <span>Authorized Management Concession ({{ calculatedDiscountPercent }}%):</span>
                                        <span>- ₹{{ calculatedDiscountAmount.toLocaleString('en-IN') }}</span>
                                    </div>

                                    <!-- Net Contract Amount (Clean Highlighted Box, No Negative Margins) -->
                                    <div class="flex justify-between font-black text-xs border border-slate-700 py-1.5 px-2.5 rounded bg-amber-50 text-slate-950 mt-1">
                                        <span class="uppercase tracking-wide">Net Contract Amount:</span>
                                        <span class="font-black text-sm">₹{{ netPayableAmount.toLocaleString('en-IN') }}</span>
                                    </div>

                                    <div class="flex justify-between text-slate-800 pt-1">
                                        <span>Advance Token Received:</span>
                                        <span class="font-bold text-slate-950">₹{{ form.amountPaid.toLocaleString('en-IN') }} (Mode: {{ form.paymentMode }})</span>
                                    </div>
                                    <div class="flex justify-between font-black text-[11.5px] text-rose-700 border-t border-slate-200 pt-1">
                                        <span>Balance Due on Event Day:</span>
                                        <span>₹{{ balanceDueAmount.toLocaleString('en-IN') }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Package Inclusions & Infrastructure Logistics Grid -->
                            <div class="border border-slate-300 rounded-lg overflow-hidden bg-white">
                                <div class="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between font-bold text-[11.5px] text-slate-900">
                                    <span>PACKAGE INCLUSIONS & INFRASTRUCTURE LOGISTICS</span>
                                    <span class="text-[10.5px] font-mono text-slate-500 font-normal">Hotel Venue Specifications</span>
                                </div>
                                <div class="p-2 grid grid-cols-2 gap-2 text-[11px]">
                                    <!-- Box 1 -->
                                    <div class="p-2 rounded bg-slate-50 border border-slate-200">
                                        <div class="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 flex justify-between">
                                            <span>1. Allocated Halls & Spaces</span>
                                            <span class="font-mono font-bold text-slate-900">₹{{ venueTotal.toLocaleString('en-IN') }}</span>
                                        </div>
                                        <div class="text-slate-700 space-y-0.5">
                                            <div v-for="venue in selectedVenuesDetailed" :key="venue.name">• {{ venue.name }} (₹{{ venue.price.toLocaleString('en-IN') }})</div>
                                            <div class="text-[10px] text-slate-500">Min Pax: {{ paxRules.minPax }} • Max: {{ paxRules.maxPax }}</div>
                                        </div>
                                    </div>
                                    <!-- Box 2 -->
                                    <div class="p-2 rounded bg-slate-50 border border-slate-200">
                                        <div class="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 flex justify-between">
                                            <span>2. Executive Deluxe Rooms</span>
                                            <span class="font-mono font-bold text-slate-900">₹{{ roomsTotal.toLocaleString('en-IN') }}</span>
                                        </div>
                                        <div class="text-slate-700 space-y-0.5">
                                            <div>• {{ form.roomsNeeded }} AC Rooms (@ ₹{{ form.roomRate || 2500 }}/night)</div>
                                            <div class="text-[10px] text-slate-500">Stay: {{ form.roomArrival }} to {{ form.roomDeparture }} • 24/7 Hot Water</div>
                                        </div>
                                    </div>
                                    <!-- Box 3 -->
                                    <div class="p-2 rounded bg-slate-50 border border-slate-200">
                                        <div class="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 flex justify-between">
                                            <span>3. Stage & Theme Decor</span>
                                            <span class="font-mono font-bold text-slate-900" v-if="selectedDecorDetails">₹{{ selectedDecorDetails.price.toLocaleString('en-IN') }}</span>
                                            <span class="text-slate-500 font-normal" v-else>Included</span>
                                        </div>
                                        <div class="text-slate-700 text-[10.5px]">
                                            <div v-if="selectedDecorDetails" class="font-semibold text-slate-900">{{ selectedDecorDetails.name }}: {{ selectedDecorDetails.inclusions }}</div>
                                            <div v-else>Stage backdrop, VIP sofa seating, red carpet & lighting.</div>
                                        </div>
                                    </div>
                                    <!-- Box 4 -->
                                    <div class="p-2 rounded bg-slate-50 border border-slate-200">
                                        <div class="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 flex justify-between">
                                            <span>4. Audio-Visual & Central AC</span>
                                            <span class="font-mono font-bold text-slate-900">₹{{ selectedAvItems.reduce((s, i) => s + i.price, 0).toLocaleString('en-IN') }}</span>
                                        </div>
                                        <div class="text-slate-700 space-y-0.5 text-[10.5px]">
                                            <div>• Acoustic PA sound system, wireless mics & central air-conditioning.</div>
                                            <div class="text-[10px] text-slate-500">100% DG Genset silent power backup throughout function.</div>
                                        </div>
                                    </div>
                                </div>
                                <!-- Deliverables & Arrangements Footer -->
                                <div class="bg-slate-50 px-3 py-1.5 border-t border-slate-200 grid grid-cols-2 gap-2.5 text-[10.5px] text-slate-600">
                                    <div>
                                        <strong class="text-slate-800">Deliverables:</strong> Fine Bone China tableware, cutlery, glassware & uniformed banquet waiters.
                                    </div>
                                    <div>
                                        <strong class="text-slate-800">Guest Self-Arrangements:</strong> Photographer, Cinematography, Varmala & Personal Gift counters.
                                    </div>
                                </div>
                            </div>

                            <!-- Page 1 Bottom Signature Marker -->
                            <div class="pt-2 flex items-center justify-between text-[10.5px] text-slate-500 border-t border-slate-200">
                                <span>Hotel Pleasant View • A Unit of Senani Group • Civil Lines, Raebareli, UP</span>
                                <span class="font-mono font-bold text-slate-700">PAGE 1 OF 2 (COMMERCIAL & INFRASTRUCTURE SPECIFICATIONS)</span>
                            </div>
                        </div>

                        <!-- PAGE BREAK DIVIDER FOR PRINT & PDF ENGINE -->
                        <div class="pdf-page-break print:hidden my-3 border-t-2 border-dashed border-slate-300 relative text-center">
                            <span class="bg-white px-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest relative -top-2.5">
                                --- PAGE 2 BREAK (CULINARY MENU & LEGAL SEAL) ---
                            </span>
                        </div>

                        <!-- ========================================================= -->
                        <!-- PAGE 2: OFFICIAL CULINARY MENU & CONTRACT AUTHORIZATION  -->
                        <!-- ========================================================= -->
                        <div class="print-page page-2 bg-white p-4 print:p-0 border border-slate-300 print:border-none rounded-xl print:rounded-none space-y-2" style="page-break-inside: avoid; break-inside: avoid;">
                            <!-- Page 2 Header Strip -->
                            <div class="flex items-center justify-between border-b-2 border-slate-900 pb-1.5">
                                <div class="flex items-center gap-3">
                                    <img src="/images/logo-dark.png" alt="Senani" class="h-10 w-auto object-contain" />
                                    <div>
                                        <div class="text-[12.5px] font-serif font-black tracking-wider text-slate-950 uppercase">Hotel Pleasant View • Catering Services</div>
                                        <div class="text-[11px] font-bold text-amber-900">
                                            {{ form.isQuotationMode ? 'OFFICIAL BANQUET CULINARY QUOTATION & COMPLETE MENU CATALOG' : 'OFFICIAL BANQUET CULINARY TASTING MENU SPECIFICATIONS' }}
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-[10.5px] font-mono font-black text-slate-900">
                                        {{ currentMenuCatalog.title }} (@ ₹{{ effectiveMenuRate }}/pax)
                                    </div>
                                    <div class="text-[10px] font-mono text-slate-600">
                                        Guaranteed for {{ form.paxGuaranteed }} Guests • Voucher #{{ form.voucherNo }}
                                    </div>
                                </div>
                            </div>

                            <!-- Executive Culinary Tasting Menu / Quotation Proposal -->
                            <div class="border border-slate-300 rounded-lg overflow-hidden bg-white">
                                <div class="bg-amber-950 text-amber-200 px-3 py-1 flex items-center justify-between text-xs font-bold">
                                    <div class="flex items-center gap-2">
                                        <span class="text-[11px]">{{ form.isQuotationMode ? '📋 BANQUET MENU QUOTATION - COMPLETE CULINARY OFFER' : '👑 CONFIRMED ROYAL BANQUET TASTING MENU' }}</span>
                                        <span class="text-[10px] font-normal text-amber-300 font-mono">
                                            ({{ confirmedMenuCategories.length }} Specialized Courses{{ form.isQuotationMode ? ' • All Food Items Offered' : '' }})
                                        </span>
                                    </div>
                                    <span class="text-[10px] font-mono bg-amber-900/80 px-2 py-0.5 rounded text-white border border-amber-700">
                                        {{ form.isQuotationMode ? 'OFFICIAL QUOTATION' : `Catering Code: SEC-${form.voucherNo}-${form.menuRateTier}` }}
                                    </span>
                                </div>

                                <div class="p-1.5 grid grid-cols-2 gap-1.5 text-[10px]">
                                    <div
                                        v-for="cat in confirmedMenuCategories"
                                        :key="cat.key"
                                        class="p-1.5 rounded bg-slate-50 border border-slate-200 space-y-0.5"
                                    >
                                        <div class="flex items-center justify-between border-b border-slate-200 pb-0.5">
                                            <span class="font-black text-slate-900 text-[10.5px] uppercase tracking-wide flex items-center gap-1">
                                                <span>{{ cat.icon }}</span>
                                                <span>{{ cat.label }}</span>
                                            </span>
                                            <span v-if="form.isQuotationMode" class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200">
                                                All {{ cat.items.length }} (Quota: {{ cat.quota }})
                                            </span>
                                            <span v-else class="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                                                {{ cat.items.length }} Items
                                            </span>
                                        </div>
                                        <div class="text-[9.5px] text-slate-700 leading-snug pt-0.5">
                                            <span v-for="(dish, dIdx) in cat.items" :key="dish" class="inline">
                                                <span class="text-amber-700 font-bold mr-0.5">•</span>
                                                <span class="font-semibold text-slate-900">{{ dish }}</span>
                                                <span v-if="dIdx < cat.items.length - 1" class="text-slate-400 mr-1.5">,</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Official Booking Terms & Conditions -->
                            <div class="border border-slate-300 rounded-lg p-2 bg-slate-50 text-[10px] text-slate-700 space-y-0.5">
                                <div class="font-bold text-slate-900 text-[10.5px] border-b border-slate-200 pb-0.5 flex items-center justify-between">
                                    <span>OFFICIAL BOOKING TERMS & CANCELLATION POLICY</span>
                                    <span class="font-mono text-[9px] text-slate-400">Hotel Pleasant View Statutory Contract</span>
                                </div>
                                <ol class="list-decimal list-inside space-y-0.5 leading-snug">
                                    <li><strong>Guaranteed Attendance Billing</strong>: Billed for contracted minimum guarantee ({{ form.paxGuaranteed }} Pax) even if actual attendance is lower. Extra pax billed at contracted per-plate rate.</li>
                                    <li><strong>Slot Timings</strong>: Event timings ({{ form.timeFrom }} to {{ form.timeTo }}) must be strictly adhered to. Extension requires prior management approval and incurs overtime charges.</li>
                                    <li><strong>Prohibitions</strong>: Outside food/liquor, commercial firecrackers, and hazardous materials strictly barred on hotel premises without statutory municipal permits.</li>
                                    <li><strong>Cancellation Policy</strong>: Advance token deposit is non-refundable and non-transferable under any circumstances upon contract locking.</li>
                                    <li><strong>Settlement</strong>: 100% net balance (₹{{ balanceDueAmount.toLocaleString('en-IN') }}) must be cleared before event commencement prior to hall key handover.</li>
                                </ol>
                            </div>

                            <!-- Digital Integrity Seal & Barcode ("Ptla sa Barcode") -->
                            <div class="p-2 rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-between gap-2 text-xs">
                                <div class="flex items-center gap-2.5">
                                    <!-- Scannable QR Code -->
                                    <div class="flex flex-col items-center bg-white p-1 rounded border border-slate-300 shadow-2xs shrink-0">
                                        <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="Verification QR" class="h-11 w-11" />
                                        <span class="text-[9.5px] font-mono text-slate-500 font-bold mt-0.5">Scan to Verify</span>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-1.5">
                                            <ShieldCheck class="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                            <span class="text-[10px] font-black uppercase tracking-wider text-slate-900">Official Digital Integrity Seal</span>
                                            <span v-if="form.isLocked" class="text-[9px] font-bold font-mono px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                🔒 SEALED & FROZEN
                                            </span>
                                            <span v-else class="text-[9px] font-bold font-mono px-1 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                                🔓 UNLOCKED DRAFT
                                            </span>
                                        </div>
                                        <div class="text-[10.5px] font-mono text-slate-700 mt-0.5">
                                            Auth Token: <strong class="text-purple-900">{{ form.digitalSignature || `SN-SIG-${form.voucherNo}` }}</strong>
                                        </div>
                                        <div class="text-[9.5px] text-slate-500 mt-0.5">
                                            Sealed by: <strong>{{ form.lockedBy || 'Banquet Operations Manager' }}</strong> • {{ form.lockedAt || form.inquiryDate }}
                                        </div>
                                        <div class="text-[10px] text-purple-700 font-medium">
                                            Scan QR with smartphone to inspect tamper-evident audit log.
                                        </div>
                                    </div>
                                </div>

                                <!-- High-Resolution Barcode (Base64 PNG Image - Always Visible!) -->
                                <div class="flex flex-col items-center bg-white px-2.5 py-1 rounded border border-slate-300 shadow-2xs shrink-0">
                                    <img v-if="barcodeDataUrl" :src="barcodeDataUrl" alt="Digital Signature Barcode" class="h-5 w-36 object-contain" />
                                    <svg v-else ref="barcodeSvgPrint" class="h-5 w-36"></svg>
                                    <span class="text-[9px] font-mono font-bold text-slate-700 mt-0.5">
                                        {{ form.digitalSignature || `SN-SIG-${form.voucherNo}` }}
                                    </span>
                                </div>
                            </div>

                            <!-- Dual Authorized Signatures with Official Senani Seal -->
                            <div class="pt-2 grid grid-cols-2 gap-6 text-center text-[10px] border-t border-slate-200">
                                <div>
                                    <div class="border-t-2 border-slate-800 pt-0.5 font-bold text-slate-900">Accepted & Confirmed By (Guest / Host)</div>
                                    <div class="text-[10px] text-slate-600 font-mono">{{ form.guestName }} (Ph: {{ form.phonePrimary }})</div>
                                </div>
                                <div class="flex flex-col items-center">
                                    <div class="flex items-center gap-1.5 mb-0.5">
                                        <img src="/images/emblem-dark.png" alt="Senani" class="h-4.5 w-auto object-contain" />
                                        <span class="text-[10px] font-mono font-bold text-amber-950 uppercase tracking-wider">Hotel Pleasant View Official Seal</span>
                                    </div>
                                    <div class="w-full border-t-2 border-slate-800 pt-0.5 font-bold text-slate-900">For Hotel Pleasant View (Authorized Officer)</div>
                                    <div class="text-[10px] text-emerald-800 font-bold font-mono">{{ authorityLevel.signatureLabel }}</div>
                                </div>
                            </div>

                            <!-- Corporate Footer -->
                            <div class="flex items-center justify-between text-[9.5px] text-slate-500 pt-1 border-t border-slate-200">
                                <span>Hotel Pleasant View • A Unit of Senani Group • Manika Cinema Road, Gandhi Nagar, Civil Lines, Raebareli, UP - 229001</span>
                                <span class="font-mono font-bold text-slate-700">PAGE 2 OF 2 (CULINARY & LEGAL AGREEMENT)</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- ===================================================== -->
            <!-- SHARE MENU SELECTION LINK MODAL                      -->
            <!-- ===================================================== -->
            <div
                v-if="showShareModal"
                class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            >
                <div class="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div class="flex items-center gap-2">
                            <div class="p-2 rounded-xl bg-purple-100 text-[#673DE6]">
                                <Share2 class="h-4 w-4" />
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-slate-900">Share Menu Selection with Guest</h3>
                                <p class="text-[11px] text-slate-500 font-mono">Voucher #{{ form.voucherNo }} • {{ form.guestName }}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            @click="showShareModal = false"
                            class="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        >
                            <X class="h-4 w-4" />
                        </button>
                    </div>

                    <div class="space-y-3.5 text-xs">
                        <p class="text-slate-600 text-[11px] leading-relaxed">
                            Share this private portal link with the guest. They can review the menu options, check off desired dishes, customize breakfast/baina services, and save preferences.
                        </p>

                        <!-- Direct URL Box -->
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Direct Guest Selection URL</label>
                            <div class="flex items-center gap-2">
                                <input
                                    type="text"
                                    readonly
                                    :value="getGuestPortalUrl"
                                    class="flex-1 h-8.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-mono text-[11px] text-slate-800 focus:outline-none select-all"
                                />
                                <button
                                    type="button"
                                    @click="copyGuestLink"
                                    class="h-8.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                                >
                                    <Check v-if="copySuccess" class="h-3.5 w-3.5 text-emerald-400" />
                                    <Copy v-else class="h-3.5 w-3.5" />
                                    <span>{{ copySuccess ? 'Copied!' : 'Copy' }}</span>
                                </button>
                            </div>
                        </div>

                        <!-- WhatsApp Share -->
                        <button
                            type="button"
                            @click="shareOnWhatsApp"
                            class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                        >
                            <span>💬 Send via WhatsApp to {{ form.phonePrimary }}</span>
                        </button>

                        <!-- Preview in New Tab -->
                        <a
                            :href="getGuestPortalUrl"
                            target="_blank"
                            class="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1.5 transition text-center"
                        >
                            <ExternalLink class="h-3.5 w-3.5" />
                            <span>Preview Guest Portal in New Tab</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- ===================================================== -->
            <!-- DIGITAL AUDIT TRAIL & REVISION HISTORY MODAL          -->
            <!-- ===================================================== -->
            <div
                v-if="showAuditModal"
                class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            >
                <div class="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div class="flex items-center gap-2">
                            <div class="p-2 rounded-xl bg-purple-100 text-[#673DE6]">
                                <History class="h-4 w-4" />
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-slate-900">Banquet Voucher Audit Trail & Revisions</h3>
                                <p class="text-[11px] text-slate-500 font-mono">Voucher #{{ form.voucherNo }} • {{ form.guestName }}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            @click="showAuditModal = false"
                            class="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        >
                            <X class="h-4 w-4" />
                        </button>
                    </div>

                    <!-- Timeline Content -->
                    <div class="flex-1 overflow-y-auto pr-1 space-y-4 text-xs custom-scrollbar">
                        <div v-if="!form.auditLog || !form.auditLog.length" class="text-center py-8 text-slate-400">
                            No revision logs recorded yet for this voucher.
                        </div>
                        <div v-else class="relative pl-5 border-l-2 border-slate-200 space-y-4">
                            <div
                                v-for="entry in form.auditLog"
                                :key="entry.id"
                                class="relative group"
                            >
                                <div
                                    class="absolute -left-[27px] top-0 h-4 w-4 rounded-full flex items-center justify-center border text-[9px]"
                                    :class="{
                                        'bg-emerald-500 text-white border-emerald-200': entry.action === 'locked',
                                        'bg-amber-500 text-white border-amber-200': entry.action === 'unlocked',
                                        'bg-blue-500 text-white border-blue-200': entry.action === 'updated',
                                        'bg-purple-500 text-white border-purple-200': entry.action === 'created',
                                    }"
                                >
                                    <Lock v-if="entry.action === 'locked'" class="h-2 w-2" />
                                    <Unlock v-else-if="entry.action === 'unlocked'" class="h-2 w-2" />
                                    <Check v-else-if="entry.action === 'created'" class="h-2 w-2" />
                                    <span v-else>✏️</span>
                                </div>

                                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-1.5">
                                            <span
                                                class="font-black uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded"
                                                :class="{
                                                    'bg-emerald-100 text-emerald-800': entry.action === 'locked',
                                                    'bg-amber-100 text-amber-800': entry.action === 'unlocked',
                                                    'bg-blue-100 text-blue-800': entry.action === 'updated',
                                                    'bg-purple-100 text-purple-800': entry.action === 'created',
                                                }"
                                            >
                                                {{ entry.action.toUpperCase() }}
                                            </span>
                                            <span class="font-bold text-slate-800">{{ entry.actor }}</span>
                                        </div>
                                        <span class="text-[10px] font-mono text-slate-400">{{ entry.timestamp }}</span>
                                    </div>

                                    <p class="text-[11px] text-slate-600">{{ entry.details }}</p>

                                    <div v-if="entry.digitalSignature" class="p-1 rounded bg-white border border-slate-200 font-mono text-[10px] text-amber-800">
                                        Digital Signature Token: <strong>{{ entry.digitalSignature }}</strong>
                                    </div>

                                    <div v-if="entry.previousSignature" class="text-[9.5px] font-mono text-slate-400">
                                        Previous Seal Voided: <span class="line-through text-slate-500">{{ entry.previousSignature }}</span>
                                    </div>

                                    <div v-if="entry.changes && entry.changes.length" class="mt-1 pt-1 border-t border-slate-200/80 space-y-0.5">
                                        <div class="text-[9.5px] font-bold text-slate-500 uppercase">Recorded Updates:</div>
                                        <div
                                            v-for="(chg, cIdx) in entry.changes"
                                            :key="cIdx"
                                            class="text-[10.5px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-medium"
                                        >
                                            • {{ chg }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <a
                            :href="`/verify/voucher?v=${form.voucherNo}`"
                            target="_blank"
                            class="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
                        >
                            <span>Open Public Verification Page</span>
                            <ExternalLink class="h-3 w-3" />
                        </a>
                        <button
                            type="button"
                            @click="showAuditModal = false"
                            class="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer transition"
                        >
                            Close
                        </button>
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
