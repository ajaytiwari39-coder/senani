<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import {
    Utensils,
    CheckCircle2,
    Lock,
    Unlock,
    Calendar,
    Clock,
    Users,
    Building2,
    Phone,
    Share2,
    Printer,
    Download,
    Loader2,
    Sparkles,
    AlertTriangle,
    Save,
    Check,
    Coffee,
    Wine,
    ChevronRight,
    ShieldCheck,
} from 'lucide-vue-next';
import { type BanquetInquiry } from '@/components/banquet/InquiryWizardModal.vue';
import { menuCatalogs, type MenuCatalogTier } from '@/components/banquet/menuCatalog';
import { renderSlimBarcode } from '@/components/banquet/auditTrail';
import { printElement, downloadElementAsPdf } from '@/components/banquet/printService';
import { decodeGuestPayload } from '@/components/banquet/guestShare';

defineOptions({
    layout: null,
});

// -------------------------------------------------------------
// Sample Fallback Inquiry
// -------------------------------------------------------------
const defaultInquiry: BanquetInquiry = {
    voucherNo: '250',
    inquiryDate: '15/Nov/2026',
    guestName: 'Mr. Tushar Gupta Jee',
    phonePrimary: '8115711507',
    phoneSecondary: '7081219880',
    address: 'Civil Lines, Raebareli',
    email: 'tushar.gupta@gmail.com',
    functionDateFrom: '2026-11-15',
    functionDateTo: '2026-11-15',
    timeFrom: '19:00',
    timeTo: '23:30',
    eventType: 'Wedding Reception',
    paxGuaranteed: 350,
    selectedVenues: ['swarnim', 'swadhistam'],
    isEngagementPackage: false,
    engagementPackageType: 'none',
    isMeetingSetup: false,
    menuRateTier: 799,
    effectiveMenuRate: 799,
    menuTitle: 'Royal Deluxe Buffet',
    selectedMenuCatalogItems: [
        'Sprite', 'Fanta', 'Watermelon Mojito',
        'Tea (Regular, Ginger, Green, Masala, Lemon)', 'Filter Coffee',
        'Tomato Soup', 'Veg Sweet Corn Soup',
        'Veg Manchurian Dry', 'Chilli Potato', 'Cocktail Samosa', 'Cheese Nuggets', 'Paneer Shashlik',
        'Dal Tadka',
        'Paneer Butter Masala',
        'Aloo Gobhi Masala',
        'Kashmiri Dum Aloo',
        'Jeera Rice',
        'Boondi Raita',
        'Tandoori Butter Roti', 'Butter Naan', 'Garlic Naan',
        'Hot Gulab Jamun', 'Rasgulla',
        'Veg Hakka Noodles', 'Masala Dosa Live', 'Pav Bhaji Live',
    ],
    engagementBreakfastPax: 0,
    regularBreakfastPax: 0,
    bainaBoxes: 0,
    mandapServingsPax: 0,
    roomsNeeded: 5,
    roomArrival: '16:00',
    roomDeparture: '09:00',
    roomRate: 2500,
    decorPackageType: 'standard',
    soundMicSetup: true,
    projectorSetup: false,
    ledWallSetup: false,
    packageIncludes: ['Hall Rental', 'Grand Stage Setup', 'Theme Floral Decor', 'DJ & Acoustic Sound', 'Genset & 100% Power Backup'],
    selfArrangements: ['Photographer / Cinematography', 'Phool / Varmala', 'Cake / Gift Counter'],
    additionalHallCharges: 30000,
    additionalDecorCharges: 68000,
    specialArrangements: 'VIP Sofa seating setup for groom party. Stage entry cold pyros arranged by guest.',
    discountPercent: 5,
    discountRupees: 18883,
    discountInputMode: 'amount',
    approverRole: 'manager',
    amountPaid: 20000,
    paymentMode: 'Cash',
    paymentDate: '09/09/2026',
    status: 'pending_md',
    isLocked: false,
    lockedBy: 'Banquet Operations Manager',
    lockedAt: '12/Nov/2026, 08:30 PM',
    digitalSignature: 'SN-SIG-250-9F83A12E-V2',
    barcodeValue: 'SN-SIG-250-9F83A12E-V2',
};

// -------------------------------------------------------------
// Reactive State & Guest Portal Mode
// -------------------------------------------------------------
const currentInquiry = ref<BanquetInquiry>({ ...defaultInquiry });
const saveSuccessMessage = ref('');
const isSaving = ref(false);
const barcodeSvgGuest = ref<SVGSVGElement | null>(null);

// Guest editing mode is active by default so client can freely customize dishes
const isGuestEditing = ref(true);

// Menu Catalog for current tier
const catalog = computed<MenuCatalogTier>(() => {
    const tier = currentInquiry.value.menuRateTier || 799;
    if (tier === 499 || tier === 799 || tier === 999 || tier === 1199) {
        return menuCatalogs[tier];
    }
    return menuCatalogs[799];
});

// Render Slim Barcode
const renderGuestBarcode = () => {
    if (barcodeSvgGuest.value) {
        const sig = currentInquiry.value.digitalSignature || `SN-SIG-${currentInquiry.value.voucherNo}`;
        renderSlimBarcode(barcodeSvgGuest.value, sig, 22);
    }
};

// -------------------------------------------------------------
// Selection Helpers & Strict Quota Enforcement
// -------------------------------------------------------------
const isSelected = (item: string) => {
    return (currentInquiry.value.selectedMenuCatalogItems || []).includes(item);
};

const getCategoryCount = (items: string[]) => {
    const selected = currentInquiry.value.selectedMenuCatalogItems || [];
    return items.filter(it => selected.includes(it)).length;
};

const isCategoryFull = (items: string[], maxCount: number) => {
    return getCategoryCount(items) >= maxCount;
};

// Prevent exceeding quotas by auto-trimming excess selections
const sanitizeCatalogSelections = () => {
    if (!currentInquiry.value.selectedMenuCatalogItems || !currentInquiry.value.selectedMenuCatalogItems.length) return;
    const cat = catalog.value;
    const allowed: string[] = [];

    const keepWithinLimit = (items: string[], max: number) => {
        if (!items || !items.length) return;
        const selected = (currentInquiry.value.selectedMenuCatalogItems || []).filter(it => items.includes(it));
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

    currentInquiry.value.selectedMenuCatalogItems = allowed;
};

const toggleItem = (item: string, catItems?: string[], maxCount?: number) => {
    if (!isGuestEditing.value) return;
    
    if (!currentInquiry.value.selectedMenuCatalogItems) {
        currentInquiry.value.selectedMenuCatalogItems = [];
    }
    const idx = currentInquiry.value.selectedMenuCatalogItems.indexOf(item);
    if (idx > -1) {
        currentInquiry.value.selectedMenuCatalogItems.splice(idx, 1);
    } else {
        if (catItems && typeof maxCount === 'number') {
            if (isCategoryFull(catItems, maxCount)) {
                // Quota reached - prohibit selecting more than allowed limit
                return;
            }
        }
        currentInquiry.value.selectedMenuCatalogItems.push(item);
    }
};

// Load inquiry from URL payload or localStorage
onMounted(async () => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const voucher = params.get('v') || params.get('voucher') || '250';
        const dataPayload = params.get('d');

        // 1. Try decoding embedded inquiry data from shareable URL parameter 'd' (cross-device/WhatsApp support)
        if (dataPayload) {
            const decoded = decodeGuestPayload(dataPayload);
            if (decoded && decoded.v) {
                currentInquiry.value = {
                    ...defaultInquiry,
                    voucherNo: decoded.v || voucher,
                    guestName: decoded.g || defaultInquiry.guestName,
                    phonePrimary: decoded.p || defaultInquiry.phonePrimary,
                    functionDateFrom: decoded.d || defaultInquiry.functionDateFrom,
                    timeFrom: decoded.t1 || defaultInquiry.timeFrom,
                    timeTo: decoded.t2 || defaultInquiry.timeTo,
                    eventType: decoded.e || defaultInquiry.eventType,
                    paxGuaranteed: decoded.pax || defaultInquiry.paxGuaranteed,
                    menuRateTier: (decoded.tier as any) || defaultInquiry.menuRateTier,
                    effectiveMenuRate: decoded.rate || defaultInquiry.effectiveMenuRate,
                    menuTitle: decoded.title || defaultInquiry.menuTitle,
                    selectedMenuCatalogItems: Array.isArray(decoded.items) ? [...decoded.items] : defaultInquiry.selectedMenuCatalogItems,
                    engagementBreakfastPax: decoded.eb ?? defaultInquiry.engagementBreakfastPax,
                    regularBreakfastPax: decoded.rb ?? defaultInquiry.regularBreakfastPax,
                    bainaBoxes: decoded.bb ?? defaultInquiry.bainaBoxes,
                    mandapServingsPax: decoded.mb ?? defaultInquiry.mandapServingsPax,
                    specialArrangements: decoded.notes ?? defaultInquiry.specialArrangements,
                    digitalSignature: decoded.sig ?? defaultInquiry.digitalSignature,
                    isLocked: false,
                };

                // Cache in local device storage
                try {
                    const raw = localStorage.getItem('senani_banquet_inquiries');
                    let list: BanquetInquiry[] = raw ? JSON.parse(raw) : [];
                    const idx = list.findIndex(i => String(i.voucherNo) === String(currentInquiry.value.voucherNo));
                    if (idx > -1) {
                        list[idx] = { ...list[idx], ...currentInquiry.value };
                    } else {
                        list.unshift({ ...currentInquiry.value });
                    }
                    localStorage.setItem('senani_banquet_inquiries', JSON.stringify(list));
                } catch (e) {
                    console.warn('Could not cache inquiry to localStorage', e);
                }
            }
        } else {
            // 2. Fallback to localStorage by voucher number
            try {
                const raw = localStorage.getItem('senani_banquet_inquiries');
                if (raw) {
                    const list: BanquetInquiry[] = JSON.parse(raw);
                    const found = list.find(i => String(i.voucherNo) === String(voucher));
                    if (found) {
                        currentInquiry.value = { ...found };
                    }
                }
            } catch (e) {
                console.error('Error loading inquiry from localStorage', e);
            }
        }
    }

    // Guest portal is explicitly editable by default
    isGuestEditing.value = true;

    sanitizeCatalogSelections();
    await nextTick();
    renderGuestBarcode();
});

// Save Selections
const saveGuestPreferences = () => {
    if (!isGuestEditing.value) return;

    isSaving.value = true;
    try {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('senani_banquet_inquiries');
            let list: BanquetInquiry[] = raw ? JSON.parse(raw) : [defaultInquiry];
            const idx = list.findIndex(i => String(i.voucherNo) === String(currentInquiry.value.voucherNo));
            if (idx > -1) {
                list[idx] = {
                    ...list[idx],
                    selectedMenuCatalogItems: [...(currentInquiry.value.selectedMenuCatalogItems || [])],
                    engagementBreakfastPax: currentInquiry.value.engagementBreakfastPax,
                    regularBreakfastPax: currentInquiry.value.regularBreakfastPax,
                    bainaBoxes: currentInquiry.value.bainaBoxes,
                    mandapServingsPax: currentInquiry.value.mandapServingsPax,
                    specialArrangements: currentInquiry.value.specialArrangements,
                };
            } else {
                list.unshift({ ...currentInquiry.value });
            }
            localStorage.setItem('senani_banquet_inquiries', JSON.stringify(list));
        }

        saveSuccessMessage.value = 'Your menu selections and service preferences have been saved successfully!';
        setTimeout(() => {
            saveSuccessMessage.value = '';
        }, 6000);
    } catch (e) {
        console.error('Error saving guest preferences', e);
    } finally {
        isSaving.value = false;
    }
};

const shareSelectionsToWhatsApp = () => {
    const count = currentInquiry.value.selectedMenuCatalogItems?.length || 0;
    const items = (currentInquiry.value.selectedMenuCatalogItems || []).map(it => `• ${it}`).join('\n');
    const msg = encodeURIComponent(
        `Namaste Senani Banquet Team,\n\nI have finalized my catering menu choices for Voucher #${currentInquiry.value.voucherNo} (${currentInquiry.value.guestName}):\n\n📅 Date: ${currentInquiry.value.functionDateFrom}\n👥 Pax: ${currentInquiry.value.paxGuaranteed} Guests\n🍽️ Selected Dishes (${count}):\n${items}\n\n☕ Extra Services:\n- Engagement Breakfast: ${currentInquiry.value.engagementBreakfastPax || 0} pax\n- Regular Breakfast: ${currentInquiry.value.regularBreakfastPax || 0} pax\n- Baina Boxes: ${currentInquiry.value.bainaBoxes || 0} pcs\n- Mandap Servings: ${currentInquiry.value.mandapServingsPax || 0} pax\n\n📝 Special Dietary / Setup Notes:\n${currentInquiry.value.specialArrangements || 'None'}\n\nPlease proceed with kitchen preparations. Thank you!`
    );
    window.open(`https://wa.me/919794152223?text=${msg}`, '_blank');
};

const isPdfDownloading = ref(false);

const triggerPrint = () => {
    printElement('printable-guest-selection', 'Senani Guest Menu Choices');
};

const handleDownloadPdf = async () => {
    isPdfDownloading.value = true;
    await downloadElementAsPdf(
        'printable-guest-selection',
        `Senani-Guest-Menu-${currentInquiry.value.voucherNo || 'Choices'}.pdf`
    );
    isPdfDownloading.value = false;
};
</script>

<template>
    <Head title="Guest Catering Menu Selection | Hotel Pleasant View (Senani)" />

    <div class="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
        <!-- Top Luxury Brand Banner -->
        <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print-hidden">
            <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <img
                        src="/images/logo-dark.png"
                        alt="Senani Hotel Pleasant View"
                        class="h-10 sm:h-12 w-auto object-contain"
                    />
                    <div class="hidden sm:block border-l border-slate-200 pl-3">
                        <div class="text-xs font-black tracking-wider text-purple-900 uppercase">
                            Guest Hospitality Portal
                        </div>
                        <div class="text-[10px] text-slate-500 font-medium">
                            Banquet & Catering Preference Manager
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <button
                        @click="triggerPrint"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                        <Printer class="h-3.5 w-3.5 text-slate-500" />
                        <span>Print Choices</span>
                    </button>
                    <button
                        @click="handleDownloadPdf"
                        :disabled="isPdfDownloading"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                    >
                        <Loader2 v-if="isPdfDownloading" class="h-3.5 w-3.5 animate-spin" />
                        <Download v-else class="h-3.5 w-3.5" />
                        <span class="hidden sm:inline">{{ isPdfDownloading ? 'Generating…' : 'Download PDF' }}</span>
                    </button>
                    <a
                        href="tel:+919794152223"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition border border-emerald-200"
                    >
                        <Phone class="h-3.5 w-3.5 text-emerald-600" />
                        <span class="hidden sm:inline">Call Manager</span>
                    </a>
                </div>
            </div>
        </header>

        <main id="printable-guest-selection" class="max-w-5xl mx-auto px-4 py-6 space-y-5">

            <!-- Success Alert Toast -->
            <div
                v-if="saveSuccessMessage"
                class="p-4 rounded-xl bg-emerald-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in print-hidden"
            >
                <div class="flex items-center gap-2.5">
                    <CheckCircle2 class="h-5 w-5 shrink-0" />
                    <div>
                        <span class="text-xs sm:text-sm font-bold block">{{ saveSuccessMessage }}</span>
                        <span class="text-[11px] text-emerald-100 block">Your preferences are saved locally on this device.</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        @click="shareSelectionsToWhatsApp"
                        class="px-3 py-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                        <Share2 class="h-3.5 w-3.5 text-emerald-600" />
                        <span>Send to Hotel on WhatsApp</span>
                    </button>
                    <button @click="saveSuccessMessage = ''" class="text-white/80 hover:text-white text-xs cursor-pointer p-1">✕</button>
                </div>
            </div>

            <!-- GUEST STATUS & MODE BANNER -->
            <div
                class="p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                :class="isGuestEditing ? 'bg-gradient-to-r from-purple-50 via-white to-purple-50 border-purple-200 text-slate-800' : 'bg-gradient-to-r from-amber-50 via-amber-50/60 to-white border-2 border-amber-300 text-amber-950'"
            >
                <div class="flex items-start gap-3.5">
                    <div
                        class="p-2.5 rounded-xl shrink-0 mt-0.5 shadow-2xs"
                        :class="isGuestEditing ? 'bg-[#673DE6] text-white' : 'bg-amber-200 text-amber-900'"
                    >
                        <Utensils v-if="isGuestEditing" class="h-5 w-5" />
                        <Lock v-else class="h-5 w-5" />
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <div class="text-sm font-black tracking-tight" :class="isGuestEditing ? 'text-[#673DE6]' : 'text-amber-950'">
                                {{ isGuestEditing ? 'GUEST MENU CUSTOMIZATION ACTIVE' : 'SEALED VIEW MODE' }}
                            </div>
                            <span
                                class="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                                :class="isGuestEditing ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-200/80 text-amber-900'"
                            >
                                {{ isGuestEditing ? '🟢 EDITABLE' : '🔒 VIEW ONLY' }}
                            </span>
                        </div>
                        <p class="text-xs leading-relaxed max-w-2xl" :class="isGuestEditing ? 'text-slate-600' : 'text-amber-800'">
                            {{ isGuestEditing
                                ? 'Namaste ' + currentInquiry.guestName + ' Ji! You can select and customize your catering dishes below within your package quota. Click "Save My Choices" when finished.'
                                : 'This selection is currently in view mode. Click "Enable Editing" to adjust dish selections.' }}
                        </p>
                        <div v-if="currentInquiry.digitalSignature" class="flex flex-wrap items-center gap-2 pt-1">
                            <span class="text-[10px] font-mono text-purple-900 bg-purple-100/70 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                                🔒 Deal Seal: {{ currentInquiry.digitalSignature }}
                            </span>
                            <span v-if="currentInquiry.lockedAt" class="text-[10px] text-slate-500 font-medium">
                                (Contract Sealed: {{ currentInquiry.lockedAt }})
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Slim Barcode & Action Buttons -->
                <div class="flex flex-col sm:flex-row items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
                    <div class="bg-white/90 p-2 rounded-xl border border-purple-100 flex flex-col items-center">
                        <svg ref="barcodeSvgGuest" class="h-6 max-w-[150px]"></svg>
                        <span class="text-[9px] font-mono font-bold text-slate-500 mt-0.5">SN-BARCODE #{{ currentInquiry.voucherNo }}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            @click="isGuestEditing = !isGuestEditing"
                            class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold shadow-xs transition cursor-pointer"
                            :class="isGuestEditing ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'"
                        >
                            <Lock v-if="isGuestEditing" class="h-3.5 w-3.5" />
                            <Unlock v-else class="h-3.5 w-3.5" />
                            <span>{{ isGuestEditing ? 'View Mode' : 'Enable Editing' }}</span>
                        </button>
                        <button
                            v-if="isGuestEditing"
                            @click="saveGuestPreferences"
                            :disabled="isSaving"
                            class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#673DE6] text-white hover:bg-[#5832D0] text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                            <Save class="h-3.5 w-3.5" />
                            <span>{{ isSaving ? 'Saving…' : 'Save Choices' }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Guest Event Particulars Card -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Proposal & Voucher</span>
                        <h1 class="text-lg font-black text-slate-900">
                            Namaste, {{ currentInquiry.guestName }} Ji
                        </h1>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 text-[#673DE6] border border-purple-200">
                            Voucher #{{ currentInquiry.voucherNo }}
                        </span>
                        <span
                            :class="[
                                'px-2.5 py-1 rounded-full text-xs font-bold uppercase',
                                isGuestEditing ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            ]"
                        >
                            {{ isGuestEditing ? '🟢 Customization Open' : '🔒 View Mode' }}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3.5 text-xs">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 block">Occasion / Event</span>
                        <span class="font-bold text-[#673DE6] text-sm">{{ currentInquiry.eventType }}</span>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 block">Function Date & Time</span>
                        <span class="font-bold text-slate-800">{{ currentInquiry.functionDateFrom }}</span>
                        <span class="text-[10px] text-slate-500 block font-mono">{{ currentInquiry.timeFrom }} - {{ currentInquiry.timeTo }}</span>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 block">Guaranteed Pax</span>
                        <span class="font-bold text-slate-800 text-sm">{{ currentInquiry.paxGuaranteed }} Guests</span>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 block">Catering Package</span>
                        <span class="font-bold text-purple-700 text-sm">₹{{ currentInquiry.effectiveMenuRate }}/pax</span>
                        <span class="text-[10px] text-slate-500 block">{{ catalog.title }}</span>
                    </div>
                </div>
            </div>

            <!-- INTERACTIVE CATERING COURSES WITH CHECKBOXES -->
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-base font-black text-slate-900 flex items-center gap-2">
                            <Utensils class="h-4 w-4 text-[#673DE6]" />
                            <span>Select Your Catering Dishes & Courses</span>
                        </h2>
                        <p class="text-xs text-slate-500">
                            Check the boxes for the dishes you'd like served at your event.
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                            {{ currentInquiry.selectedMenuCatalogItems?.length || 0 }} Items Selected
                        </span>
                    </div>
                </div>

                <!-- Course Cards Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">

                    <!-- 1. Welcome Drinks -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🍹 Welcome Drinks</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.welcomeDrinks) >= catalog.welcomeDrinksCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.welcomeDrinks) }}/{{ catalog.welcomeDrinksCount }}
                                {{ getCategoryCount(catalog.welcomeDrinks) >= catalog.welcomeDrinksCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.welcomeDrinks"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.welcomeDrinks, catalog.welcomeDrinksCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.welcomeDrinks, catalog.welcomeDrinksCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.welcomeDrinks, catalog.welcomeDrinksCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 2. Hot Drinks -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>☕ Hot Beverages</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.hotDrinks) >= catalog.hotDrinksCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.hotDrinks) }}/{{ catalog.hotDrinksCount }}
                                {{ getCategoryCount(catalog.hotDrinks) >= catalog.hotDrinksCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.hotDrinks"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    item.length > 25 ? 'col-span-2' : '',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.hotDrinks, catalog.hotDrinksCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.hotDrinks, catalog.hotDrinksCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.hotDrinks, catalog.hotDrinksCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 3. Soups -->
                    <div v-if="catalog.soups.length" class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🍲 Soups</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.soups) >= catalog.soupsCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.soups) }}/{{ catalog.soupsCount }}
                                {{ getCategoryCount(catalog.soups) >= catalog.soupsCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.soups"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.soups, catalog.soupsCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.soups, catalog.soupsCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.soups, catalog.soupsCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 4. Starters & Snacks -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🍢 Starters & Snacks</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.starters) >= catalog.startersCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.starters) }}/{{ catalog.startersCount }}
                                {{ getCategoryCount(catalog.starters) >= catalog.startersCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.starters"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.starters, catalog.startersCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.starters, catalog.startersCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.starters, catalog.startersCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 5. Dal Preparation -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🍲 Dal Preparation</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.dal) >= catalog.dalCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.dal) }}/{{ catalog.dalCount }}
                                {{ getCategoryCount(catalog.dal) >= catalog.dalCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.dal"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.dal, catalog.dalCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.dal, catalog.dalCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.dal, catalog.dalCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 6. Paneer Specialty -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🧀 Paneer Specialty</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.paneer) >= catalog.paneerCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.paneer) }}/{{ catalog.paneerCount }}
                                {{ getCategoryCount(catalog.paneer) >= catalog.paneerCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.paneer"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.paneer, catalog.paneerCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.paneer, catalog.paneerCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.paneer, catalog.paneerCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 7. Dry Seasonal Veg -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🥦 Dry Seasonal Veg</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.dryVeg) >= catalog.dryVegCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.dryVeg) }}/{{ catalog.dryVegCount }}
                                {{ getCategoryCount(catalog.dryVeg) >= catalog.dryVegCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.dryVeg"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.dryVeg, catalog.dryVegCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.dryVeg, catalog.dryVegCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.dryVeg, catalog.dryVegCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 8. Rich Gravy Veg -->
                    <div v-if="catalog.gravyVeg.length" class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🥘 Rich Gravy Veg</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.gravyVeg) >= catalog.gravyVegCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.gravyVeg) }}/{{ catalog.gravyVegCount }}
                                {{ getCategoryCount(catalog.gravyVeg) >= catalog.gravyVegCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.gravyVeg"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.gravyVeg, catalog.gravyVegCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.gravyVeg, catalog.gravyVegCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.gravyVeg, catalog.gravyVegCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 9. Rice & Pulao -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🍚 Rice & Pulao</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.rice) >= catalog.riceCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.rice) }}/{{ catalog.riceCount }}
                                {{ getCategoryCount(catalog.rice) >= catalog.riceCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.rice"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.rice, catalog.riceCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.rice, catalog.riceCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.rice, catalog.riceCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 10. Curd & Raita -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🥣 Curd & Raita</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.raita) >= catalog.raitaCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.raita) }}/{{ catalog.raitaCount }}
                                {{ getCategoryCount(catalog.raita) >= catalog.raitaCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.raita"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.raita, catalog.raitaCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.raita, catalog.raitaCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.raita, catalog.raitaCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 11. Assorted Tandoori Breads -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🫓 Tandoor Breads</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.breads) >= catalog.breadsCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.breads) }}/{{ catalog.breadsCount }}
                                {{ getCategoryCount(catalog.breads) >= catalog.breadsCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.breads"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.breads, catalog.breadsCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.breads, catalog.breadsCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.breads, catalog.breadsCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 12. Desserts & Sweets -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🍨 Desserts & Halwa</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.desserts) >= catalog.dessertsCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.desserts) }}/{{ catalog.dessertsCount }}
                                {{ getCategoryCount(catalog.desserts) >= catalog.dessertsCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.desserts"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.desserts, catalog.dessertsCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.desserts, catalog.dessertsCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.desserts, catalog.dessertsCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 13. Salads & Accompaniments -->
                    <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🥗 Salads & Dips</span>
                            </div>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                All Included
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            <div
                                v-for="item in catalog.salads"
                                :key="item"
                                class="flex items-center gap-1.5 p-1.5 text-[11px] font-medium text-slate-700"
                            >
                                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                <span>{{ item }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 14. Live Cooking Counters (if present) -->
                    <div v-if="catalog.liveCounters.length" class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2 md:col-span-2">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <span>🍳 Live Cooking Stations</span>
                            </div>
                            <span
                                :class="[
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    getCategoryCount(catalog.liveCounters) >= catalog.liveCountersCount
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                ]"
                            >
                                {{ getCategoryCount(catalog.liveCounters) }}/{{ catalog.liveCountersCount }}
                                {{ getCategoryCount(catalog.liveCounters) >= catalog.liveCountersCount ? 'Max Picked' : 'Picked' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 text-xs">
                            <label
                                v-for="item in catalog.liveCounters"
                                :key="item"
                                :class="[
                                    'flex items-start gap-2 p-1.5 rounded-lg border transition select-none',
                                    !isGuestEditing
                                        ? 'cursor-not-allowed opacity-75'
                                        : (!isSelected(item) && isCategoryFull(catalog.liveCounters, catalog.liveCountersCount))
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                            : 'cursor-pointer hover:bg-purple-50/40',
                                    isSelected(item) ? 'bg-purple-50/60 border-purple-300 font-bold text-slate-900' : 'border-slate-100 text-slate-600'
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleItem(item, catalog.liveCounters, catalog.liveCountersCount)"
                                    :disabled="!isGuestEditing || (!isSelected(item) && isCategoryFull(catalog.liveCounters, catalog.liveCountersCount))"
                                    class="rounded text-[#673DE6] focus:ring-[#673DE6] mt-0.5"
                                />
                                <span class="leading-tight text-[11px]">{{ item }}</span>
                            </label>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Extra Services & Ritual Requests -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Coffee class="h-4 w-4 text-[#673DE6]" />
                        <span>Extra Services & Breakfast Add-ons</span>
                    </h3>
                    <span class="text-[10px] text-slate-400">Optional Client Requests</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                        <label class="block text-[11px] font-bold text-slate-700">Engagement Breakfast (@₹200)</label>
                        <input
                            v-model.number="currentInquiry.engagementBreakfastPax"
                            type="number"
                            min="0"
                            :disabled="!isGuestEditing"
                            placeholder="Pax Count"
                            class="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold disabled:bg-slate-100"
                        />
                    </div>
                    <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                        <label class="block text-[11px] font-bold text-slate-700">Regular Breakfast (@₹300)</label>
                        <input
                            v-model.number="currentInquiry.regularBreakfastPax"
                            type="number"
                            min="0"
                            :disabled="!isGuestEditing"
                            placeholder="Pax Count"
                            class="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold disabled:bg-slate-100"
                        />
                    </div>
                    <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                        <label class="block text-[11px] font-bold text-slate-700">Baina Boxes (@₹260)</label>
                        <input
                            v-model.number="currentInquiry.bainaBoxes"
                            type="number"
                            min="0"
                            :disabled="!isGuestEditing"
                            placeholder="Box Count"
                            class="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold disabled:bg-slate-100"
                        />
                    </div>
                    <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                        <label class="block text-[11px] font-bold text-slate-700">Mandap Servings (@₹60)</label>
                        <input
                            v-model.number="currentInquiry.mandapServingsPax"
                            type="number"
                            min="0"
                            :disabled="!isGuestEditing"
                            placeholder="Servings Count"
                            class="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold disabled:bg-slate-100"
                        />
                    </div>
                </div>

                <div class="pt-2">
                    <label class="block text-[11px] font-bold text-slate-700 mb-1">
                        Special Instructions / Dietary Requirements (Jain, Non-Spicy, Timings, etc.)
                    </label>
                    <textarea
                        v-model="currentInquiry.specialArrangements"
                        :disabled="!isGuestEditing"
                        rows="2"
                        placeholder="Type any specific guest preferences or requirements for hotel management..."
                        class="w-full rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition disabled:bg-slate-100"
                    ></textarea>
                </div>
            </div>

            <!-- Sticky Bottom Action Footer -->
            <div class="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-300 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 print-hidden">
                <div class="flex items-center gap-2">
                    <div class="p-2 rounded-lg bg-purple-100 text-[#673DE6]">
                        <Utensils class="h-4 w-4" />
                    </div>
                    <div>
                        <div class="text-xs font-bold text-slate-900">
                            {{ currentInquiry.selectedMenuCatalogItems?.length || 0 }} Items Selected for {{ currentInquiry.guestName }}
                        </div>
                        <div class="text-[10px] text-slate-500">
                            {{ isGuestEditing ? '🟢 Ready to save and transmit to hotel banquet team' : '🔒 Menu currently in view-only mode' }}
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        v-if="isGuestEditing"
                        @click="saveGuestPreferences"
                        :disabled="isSaving"
                        class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#673DE6] text-white hover:bg-[#5832D0] text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Save class="h-4 w-4" />
                        <span>{{ isSaving ? 'Saving Changes...' : 'Save & Confirm Menu Choices' }}</span>
                    </button>
                    <button
                        v-else
                        @click="isGuestEditing = true"
                        class="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                        <Unlock class="h-4 w-4 text-amber-700" />
                        <span>Enable Editing</span>
                    </button>
                    <button
                        @click="shareSelectionsToWhatsApp"
                        class="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                        <Share2 class="h-4 w-4 text-emerald-600 group-hover:text-white" />
                        <span>Send to WhatsApp</span>
                    </button>
                    <button
                        @click="handleDownloadPdf"
                        :disabled="isPdfDownloading"
                        class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-800 hover:text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                    >
                        <Loader2 v-if="isPdfDownloading" class="h-4 w-4 animate-spin" />
                        <Download v-else class="h-4 w-4" />
                        <span class="hidden sm:inline">{{ isPdfDownloading ? 'Generating…' : 'Download PDF' }}</span>
                    </button>
                </div>
            </div>

        </main>
    </div>
</template>

<style scoped>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.25s ease-out forwards;
}
</style>
