<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import {
    Calendar,
    Clock,
    Receipt,
    Building2,
    Sparkles,
    CheckCircle2,
    Calculator,
    Users,
    Printer,
    ArrowRight,
    ShieldCheck,
    Layers,
    Utensils,
    ChevronRight,
    BedDouble,
    FileText,
    Send
} from '@lucide/vue';

// Active Tab state for 100% SPA instant switching (Zero Reload)
const activeTab = ref<'overview' | 'billing' | 'banquet' | 'enquiry' | 'roadmap'>('overview');

// -------------------------------------------------------------
// Interactive Billing Simulator State (Real-time Keystroke Math)
// -------------------------------------------------------------
const eventType = ref('Wedding Reception');
const guestCount = ref(350);
const plateRate = ref(850);
const hallRent = ref(45000);
const includeDj = ref(true);
const djRate = ref(15000);
const includeDecor = ref(true);
const decorRate = ref(25000);
const includeGenset = ref(true);
const gensetRate = ref(6000);
const gstRate = ref(5); // 5% composite catering or 18% regular
const advancePaid = ref(50000);
const showInvoiceModal = ref(false);

const foodSubtotal = computed(() => guestCount.value * plateRate.value);
const addonsSubtotal = computed(() => {
    let sum = Number(hallRent.value) || 0;
    if (includeDj.value) sum += Number(djRate.value) || 0;
    if (includeDecor.value) sum += Number(decorRate.value) || 0;
    if (includeGenset.value) sum += Number(gensetRate.value) || 0;
    return sum;
});
const taxableTotal = computed(() => foodSubtotal.value + addonsSubtotal.value);
const gstAmount = computed(() => Math.round((taxableTotal.value * gstRate.value) / 100));
const cgstAmount = computed(() => Math.round(gstAmount.value / 2));
const sgstAmount = computed(() => Math.round(gstAmount.value / 2));
const grandTotal = computed(() => taxableTotal.value + gstAmount.value);
const balanceDue = computed(() => Math.max(0, grandTotal.value - (Number(advancePaid.value) || 0)));

// -------------------------------------------------------------
// Interactive Banquet Calendar Slot Matrix State
// -------------------------------------------------------------
const selectedDate = ref('2026-11-20');
const halls = ref([
    {
        id: 1,
        name: 'Grand Royal Ballroom',
        capacity: '500-1000 Guests',
        morningSlot: { status: 'booked', client: 'Sharma Family (Roka Ceremony)' },
        eveningSlot: { status: 'available', client: null }
    },
    {
        id: 2,
        name: 'Sapphire Lawn & Poolside',
        capacity: '300-600 Guests',
        morningSlot: { status: 'available', client: null },
        eveningSlot: { status: 'booked', client: 'Dr. Verma Reception' }
    },
    {
        id: 3,
        name: 'Emerald Mini Banquet',
        capacity: '50-150 Guests',
        morningSlot: { status: 'available', client: null },
        eveningSlot: { status: 'tentative', client: 'Corporate Tech Conference (Token Due)' }
    }
]);

// -------------------------------------------------------------
// Interactive Enquiry Pipeline Kanban State
// -------------------------------------------------------------
const enquiries = ref([
    { id: 'ENQ-1042', name: 'Rajesh Agrawal', event: 'Wedding (500 Pax)', date: '14 Dec 2026', status: 'New Inquiry', budget: '₹6,50,000' },
    { id: 'ENQ-1039', name: 'Vikram Singhania', event: 'Sangeet Night (350 Pax)', date: '28 Nov 2026', status: 'Quotation Sent', budget: '₹4,20,000' },
    { id: 'ENQ-1035', name: 'Dr. Shweta Kapoor', event: 'Engagement (200 Pax)', date: '08 Nov 2026', status: 'Token Paid', budget: '₹2,80,000' },
    { id: 'ENQ-1028', name: 'Apollo Health Summit', event: 'Corporate Seminar (150 Pax)', date: '15 Oct 2026', status: 'Confirmed', budget: '₹1,95,000' }
]);

const advanceLead = (lead: any) => {
    const sequence = ['New Inquiry', 'Quotation Sent', 'Token Paid', 'Confirmed'];
    const currIndex = sequence.indexOf(lead.status);
    if (currIndex < sequence.length - 1) {
        lead.status = sequence[currIndex + 1];
    } else {
        lead.status = 'New Inquiry';
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};
</script>

<template>
    <Head title="Senani - Hotel, Banquet & High-Speed GST Billing ERP" />

    <div class="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <!-- Top Announcement Bar -->
        <div class="border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-4 py-2 text-center text-xs text-amber-300">
            <span class="inline-flex items-center gap-1.5 font-medium">
                <Sparkles class="h-3.5 w-3.5 text-amber-400" />
                Senani ERP v1.0 • Engineered for Zero-Reload High Speed Performance on Laravel 11 + Vue 3 SPA
            </span>
        </div>

        <!-- Navigation Header -->
        <header class="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
            <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20">
                        <Building2 class="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xl font-bold tracking-tight text-white font-serif">SENANI</span>
                            <span class="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">PREVIEW</span>
                        </div>
                        <p class="text-[11px] text-slate-400">Hotel & Banquet Management • POS Billing</p>
                    </div>
                </div>

                <!-- Desktop Navigation Tabs (Zero Page Reload SPA) -->
                <nav class="hidden md:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
                    <button
                        @click="activeTab = 'overview'"
                        :class="activeTab === 'overview' ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white'"
                        class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150"
                    >
                        <Layers class="h-3.5 w-3.5" />
                        Overview
                    </button>
                    <button
                        @click="activeTab = 'billing'"
                        :class="activeTab === 'billing' ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white'"
                        class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150"
                    >
                        <Calculator class="h-3.5 w-3.5" />
                        Live GST Billing Demo
                    </button>
                    <button
                        @click="activeTab = 'banquet'"
                        :class="activeTab === 'banquet' ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white'"
                        class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150"
                    >
                        <Calendar class="h-3.5 w-3.5" />
                        Slot Lock Matrix
                    </button>
                    <button
                        @click="activeTab = 'enquiry'"
                        :class="activeTab === 'enquiry' ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white'"
                        class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150"
                    >
                        <FileText class="h-3.5 w-3.5" />
                        Leads Pipeline
                    </button>
                    <button
                        @click="activeTab = 'roadmap'"
                        :class="activeTab === 'roadmap' ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white'"
                        class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150"
                    >
                        <CheckCircle2 class="h-3.5 w-3.5" />
                        Modules
                    </button>
                </nav>

                <!-- Action Button -->
                <div class="flex items-center gap-2">
                    <button
                        @click="activeTab = 'billing'"
                        class="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition"
                    >
                        Try Fast Billing
                        <ArrowRight class="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content Area -->
        <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <!-- Hero Header -->
            <section class="mb-10 text-center">
                <div class="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1 text-xs text-slate-300 mb-4">
                    <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Single Page Application • 0ms Lag • Local Herd Environment Ready
                </div>
                <h1 class="text-3xl font-extrabold tracking-tight sm:text-5xl font-serif text-white max-w-4xl mx-auto leading-tight">
                    Hotel Enquiry, Banquet Booking & High-Speed GST Billing
                </h1>
                <p class="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
                    A tailored, modern ERP engineered to solve double-booking headaches, handle multi-stage catering payments, and issue compliant Indian GST invoices in seconds.
                </p>

                <!-- Core Value Metrics -->
                <div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl mx-auto">
                    <div class="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-left">
                        <div class="flex items-center gap-2 text-amber-400">
                            <Clock class="h-4 w-4" />
                            <span class="text-xs font-semibold uppercase tracking-wider">Zero Reload</span>
                        </div>
                        <div class="mt-1 text-lg font-bold text-white">0ms Transition</div>
                        <p class="text-[11px] text-slate-400">Pure Vue 3 + Inertia SPA</p>
                    </div>

                    <div class="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-left">
                        <div class="flex items-center gap-2 text-emerald-400">
                            <ShieldCheck class="h-4 w-4" />
                            <span class="text-xs font-semibold uppercase tracking-wider">Slot Safety</span>
                        </div>
                        <div class="mt-1 text-lg font-bold text-white">Double-Lock</div>
                        <p class="text-[11px] text-slate-400">Strict DB Transactions</p>
                    </div>

                    <div class="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-left">
                        <div class="flex items-center gap-2 text-blue-400">
                            <Receipt class="h-4 w-4" />
                            <span class="text-xs font-semibold uppercase tracking-wider">GST Compliant</span>
                        </div>
                        <div class="mt-1 text-lg font-bold text-white">Dual-Rate Tax</div>
                        <p class="text-[11px] text-slate-400">Rooms & Catering Splits</p>
                    </div>

                    <div class="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-left">
                        <div class="flex items-center gap-2 text-purple-400">
                            <Utensils class="h-4 w-4" />
                            <span class="text-xs font-semibold uppercase tracking-wider">Banquet POS</span>
                        </div>
                        <div class="mt-1 text-lg font-bold text-white">Per-Plate Math</div>
                        <p class="text-[11px] text-slate-400">Live Stage Billing</p>
                    </div>
                </div>
            </section>

            <!-- TAB 1: OVERVIEW -->
            <div v-if="activeTab === 'overview'" class="space-y-6 animate-fade-in">
                <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
                        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div>
                                <h3 class="text-lg font-bold text-white">Why Senani Beats Traditional Systems</h3>
                                <p class="text-xs text-slate-400">Engineered specifically for Indian Hospitality & Banquet Realities</p>
                            </div>
                            <span class="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                                High Performance
                            </span>
                        </div>

                        <div class="mt-5 space-y-4">
                            <div class="flex items-start gap-3">
                                <div class="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-400">
                                    <Clock class="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 class="text-sm font-semibold text-white">No White Screens or Page Hanging</h4>
                                    <p class="text-xs text-slate-400 mt-0.5">
                                        Traditional PHP/WordPress sites reload the full HTML page every time you filter dates or submit a bill, causing slow reception desktops to freeze. Senani runs as an in-browser SPA where only data flows in milliseconds.
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="mt-0.5 rounded-lg bg-blue-500/10 p-2 text-blue-400">
                                    <ShieldCheck class="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 class="text-sm font-semibold text-white">Banquet Morning vs. Evening Slot Integrity</h4>
                                    <p class="text-xs text-slate-400 mt-0.5">
                                        Hotel rooms use 12 PM check-in / 11 AM check-out. But banquets have distinct shifts (Morning 10 AM-4 PM vs Evening 7 PM-1 AM). Senani treats both independently, preventing double bookings on auspicious dates.
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="mt-0.5 rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                                    <Receipt class="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 class="text-sm font-semibold text-white">Multi-Stage Payment Receipts</h4>
                                    <p class="text-xs text-slate-400 mt-0.5">
                                        Banquet clients don't pay 100% upfront. They pay: 1) Initial Token Deposit, 2) 50% Milestone 15 days before, 3) Final Balance on event conclusion. Senani tracks balance ledger per event seamlessly.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 flex flex-wrap gap-3 pt-4 border-t border-slate-800">
                            <button @click="activeTab = 'billing'" class="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition">
                                Test Live Billing Calculator →
                            </button>
                            <button @click="activeTab = 'banquet'" class="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition">
                                View Slot Calendar Matrix
                            </button>
                        </div>
                    </div>

                    <!-- Quick System Specs Card -->
                    <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-white">Under The Hood</h3>
                            <p class="text-xs text-slate-400 mt-0.5">Modern Full-Stack Architecture</p>

                            <div class="mt-5 space-y-3">
                                <div class="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                                    <span class="text-xs text-slate-400">Backend Framework</span>
                                    <span class="text-xs font-semibold text-white">Laravel 11 (PHP 8.3+)</span>
                                </div>
                                <div class="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                                    <span class="text-xs text-slate-400">Frontend SPA Engine</span>
                                    <span class="text-xs font-semibold text-white">Vue 3.5 + Inertia.js</span>
                                </div>
                                <div class="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                                    <span class="text-xs text-slate-400">Styling & UI</span>
                                    <span class="text-xs font-semibold text-white">Tailwind CSS v4</span>
                                </div>
                                <div class="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                                    <span class="text-xs text-slate-400">Database Engine</span>
                                    <span class="text-xs font-semibold text-white">MySQL (senani)</span>
                                </div>
                                <div class="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                                    <span class="text-xs text-slate-400">Local Dev Server</span>
                                    <span class="text-xs font-semibold text-emerald-400">Laravel Herd ()</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
                            <span class="font-semibold block mb-0.5">Deployment Ready:</span>
                            Deployable directly to Hostinger cloud/VPS without separate microservice daemons.
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 2: LIVE GST BILLING CALCULATOR DEMO -->
            <div v-if="activeTab === 'billing'" class="space-y-6 animate-fade-in">
                <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                        <div>
                            <div class="flex items-center gap-2">
                                <Calculator class="h-5 w-5 text-amber-400" />
                                <h3 class="text-lg font-bold text-white">Real-Time Banquet GST Billing Simulator</h3>
                            </div>
                            <p class="text-xs text-slate-400 mt-0.5">Notice how every number recalculates instantly on keystroke with ZERO page reload</p>
                        </div>
                        <button
                            @click="showInvoiceModal = true"
                            class="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition"
                        >
                            <Printer class="h-3.5 w-3.5" />
                            Preview Tax Invoice
                        </button>
                    </div>

                    <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Left inputs -->
                        <div class="space-y-4 lg:col-span-2">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-slate-300 mb-1">Event Type</label>
                                    <select v-model="eventType" class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none">
                                        <option>Wedding Reception</option>
                                        <option>Engagement / Ring Ceremony</option>
                                        <option>Corporate Annual Meet</option>
                                        <option>Birthday Party</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-300 mb-1">Hall Rent (Base Charges)</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-xs text-slate-500">₹</span>
                                        <input type="number" v-model.number="hallRent" class="w-full rounded-lg border border-slate-700 bg-slate-950 pl-7 pr-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            <!-- Catering Section -->
                            <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                                    <Utensils class="h-3.5 w-3.5" /> Catering & Plate Rate Configuration
                                </h4>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-medium text-slate-300 mb-1">Guaranteed Guest Count (Pax)</label>
                                        <input type="number" v-model.number="guestCount" class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-slate-300 mb-1">Per Plate Cost (₹)</label>
                                        <input type="number" v-model.number="plateRate" class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none" />
                                    </div>
                                </div>
                                <div class="mt-2 text-right text-xs text-slate-400">
                                    Catering Subtotal: <span class="font-semibold text-white">{{ formatCurrency(foodSubtotal) }}</span>
                                </div>
                            </div>

                            <!-- Addons Section -->
                            <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                                    <Sparkles class="h-3.5 w-3.5" /> Extra Services & Decor
                                </h4>
                                <div class="space-y-2.5">
                                    <label class="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                                        <span class="flex items-center gap-2">
                                            <input type="checkbox" v-model="includeDj" class="rounded border-slate-700 text-amber-500 focus:ring-amber-500" />
                                            Professional Sound System & DJ
                                        </span>
                                        <span class="text-slate-400">₹{{ djRate.toLocaleString('en-IN') }}</span>
                                    </label>
                                    <label class="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                                        <span class="flex items-center gap-2">
                                            <input type="checkbox" v-model="includeDecor" class="rounded border-slate-700 text-amber-500 focus:ring-amber-500" />
                                            Stage Theme Decoration & Fresh Floral Setup
                                        </span>
                                        <span class="text-slate-400">₹{{ decorRate.toLocaleString('en-IN') }}</span>
                                    </label>
                                    <label class="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                                        <span class="flex items-center gap-2">
                                            <input type="checkbox" v-model="includeGenset" class="rounded border-slate-700 text-amber-500 focus:ring-amber-500" />
                                            Uninterrupted Generator Power Backup (Fuel Incl.)
                                        </span>
                                        <span class="text-slate-400">₹{{ gensetRate.toLocaleString('en-IN') }}</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Tax and Settlement Settings -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-slate-300 mb-1">GST Tax Slab</label>
                                    <select v-model.number="gstRate" class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none">
                                        <option :value="5">5% (Catering Composite / Restaurant)</option>
                                        <option :value="18">18% (Standard Banquet & Combined Service)</option>
                                        <option :value="0">0% (Exempt / Special Category)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-300 mb-1">Advance Token Paid</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-xs text-slate-500">₹</span>
                                        <input type="number" v-model.number="advancePaid" class="w-full rounded-lg border border-slate-700 bg-slate-950 pl-7 pr-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Live Receipt Card -->
                        <div class="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-xl flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div class="text-xs font-bold text-white uppercase tracking-wider">Estimated Summary</div>
                                    <span class="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">LIVE MATH</span>
                                </div>

                                <div class="mt-4 space-y-2 text-xs">
                                    <div class="flex justify-between text-slate-400">
                                        <span>Catering ({{ guestCount }} × ₹{{ plateRate }}):</span>
                                        <span class="text-white">{{ formatCurrency(foodSubtotal) }}</span>
                                    </div>
                                    <div class="flex justify-between text-slate-400">
                                        <span>Hall & Extra Services:</span>
                                        <span class="text-white">{{ formatCurrency(addonsSubtotal) }}</span>
                                    </div>
                                    <div class="flex justify-between font-semibold text-slate-200 pt-2 border-t border-slate-800">
                                        <span>Taxable Amount:</span>
                                        <span>{{ formatCurrency(taxableTotal) }}</span>
                                    </div>
                                    <div class="flex justify-between text-slate-400">
                                        <span>CGST ({{ gstRate / 2 }}%):</span>
                                        <span class="text-slate-300">{{ formatCurrency(cgstAmount) }}</span>
                                    </div>
                                    <div class="flex justify-between text-slate-400">
                                        <span>SGST ({{ gstRate / 2 }}%):</span>
                                        <span class="text-slate-300">{{ formatCurrency(sgstAmount) }}</span>
                                    </div>
                                </div>

                                <div class="mt-6 rounded-xl bg-slate-950 p-4 border border-slate-800">
                                    <div class="flex justify-between items-baseline">
                                        <span class="text-xs text-slate-400 font-medium">Grand Total:</span>
                                        <span class="text-xl font-extrabold text-amber-400">{{ formatCurrency(grandTotal) }}</span>
                                    </div>
                                    <div class="mt-2 flex justify-between items-baseline text-xs text-emerald-400">
                                        <span>Advance Token Paid:</span>
                                        <span>- {{ formatCurrency(advancePaid) }}</span>
                                    </div>
                                    <div class="mt-3 pt-3 border-t border-slate-800 flex justify-between items-baseline">
                                        <span class="text-xs font-bold text-rose-400">Balance Payable:</span>
                                        <span class="text-lg font-bold text-rose-400">{{ formatCurrency(balanceDue) }}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                @click="showInvoiceModal = true"
                                class="mt-6 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                            >
                                <Printer class="h-4 w-4" />
                                Generate & Print Tax Bill
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 3: BANQUET SLOT MATRIX -->
            <div v-if="activeTab === 'banquet'" class="space-y-6 animate-fade-in">
                <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                        <div>
                            <div class="flex items-center gap-2">
                                <Calendar class="h-5 w-5 text-amber-400" />
                                <h3 class="text-lg font-bold text-white">Banquet Double-Booking Prevention Matrix</h3>
                            </div>
                            <p class="text-xs text-slate-400 mt-0.5">Morning and Evening slots are handled as separate state locks with database safety</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-slate-400">Select Date:</span>
                            <input type="date" v-model="selectedDate" class="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none" />
                        </div>
                    </div>

                    <div class="mt-6 space-y-4">
                        <div v-for="hall in halls" :key="hall.id" class="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                                <div>
                                    <h4 class="text-sm font-bold text-white flex items-center gap-2">
                                        <Building2 class="h-4 w-4 text-amber-400" />
                                        {{ hall.name }}
                                    </h4>
                                    <span class="text-xs text-slate-400">Capacity: {{ hall.capacity }}</span>
                                </div>
                                <span class="text-[11px] text-slate-500">Date: {{ selectedDate }}</span>
                            </div>

                            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <!-- Morning Slot -->
                                <div class="rounded-lg border p-3.5 transition"
                                     :class="hall.morningSlot.status === 'booked' ? 'border-rose-500/30 bg-rose-500/5' : 'border-emerald-500/30 bg-emerald-500/5'">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-semibold text-white flex items-center gap-1.5">
                                            <Clock class="h-3.5 w-3.5 text-slate-400" /> Morning Slot (10 AM - 4 PM)
                                        </span>
                                        <span v-if="hall.morningSlot.status === 'booked'" class="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                                            LOCKED / BOOKED
                                        </span>
                                        <span v-else class="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                            AVAILABLE
                                        </span>
                                    </div>
                                    <p class="mt-2 text-xs text-slate-300">
                                        {{ hall.morningSlot.client || 'No booking for this morning slot. Ready for reservation.' }}
                                    </p>
                                </div>

                                <!-- Evening Slot -->
                                <div class="rounded-lg border p-3.5 transition"
                                     :class="hall.eveningSlot.status === 'booked' ? 'border-rose-500/30 bg-rose-500/5' : (hall.eveningSlot.status === 'tentative' ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5')">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-semibold text-white flex items-center gap-1.5">
                                            <Clock class="h-3.5 w-3.5 text-slate-400" /> Evening Slot (7 PM - 1 AM)
                                        </span>
                                        <span v-if="hall.eveningSlot.status === 'booked'" class="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                                            LOCKED / BOOKED
                                        </span>
                                        <span v-else-if="hall.eveningSlot.status === 'tentative'" class="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                            HOLD / TENTATIVE
                                        </span>
                                        <span v-else class="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                            AVAILABLE
                                        </span>
                                    </div>
                                    <p class="mt-2 text-xs text-slate-300">
                                        {{ hall.eveningSlot.client || 'No booking for evening. Prime wedding slot available.' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 4: ENQUIRY KANBAN PIPELINE -->
            <div v-if="activeTab === 'enquiry'" class="space-y-6 animate-fade-in">
                <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                    <div class="flex items-center justify-between pb-4 border-b border-slate-800">
                        <div>
                            <div class="flex items-center gap-2">
                                <FileText class="h-5 w-5 text-amber-400" />
                                <h3 class="text-lg font-bold text-white">Banquet & Hotel Enquiry Pipeline</h3>
                            </div>
                            <p class="text-xs text-slate-400 mt-0.5">Click any lead card to advance its state through the CRM pipeline</p>
                        </div>
                        <span class="text-xs text-slate-400">{{ enquiries.length }} Active Leads</span>
                    </div>

                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div v-for="lead in enquiries" :key="lead.id"
                             @click="advanceLead(lead)"
                             class="group cursor-pointer rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all duration-150 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5">
                            <div class="flex items-center justify-between text-xs text-slate-400">
                                <span>{{ lead.id }}</span>
                                <span class="rounded px-2 py-0.5 text-[10px] font-semibold"
                                      :class="{
                                          'bg-blue-500/20 text-blue-300': lead.status === 'New Inquiry',
                                          'bg-purple-500/20 text-purple-300': lead.status === 'Quotation Sent',
                                          'bg-amber-500/20 text-amber-300': lead.status === 'Token Paid',
                                          'bg-emerald-500/20 text-emerald-300': lead.status === 'Confirmed'
                                      }">
                                    {{ lead.status }}
                                </span>
                            </div>

                            <div class="mt-3">
                                <h4 class="text-sm font-bold text-white group-hover:text-amber-400 transition">{{ lead.name }}</h4>
                                <p class="text-xs text-slate-400 mt-0.5">{{ lead.event }}</p>
                            </div>

                            <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1">
                                    <Calendar class="h-3 w-3" /> {{ lead.date }}
                                </span>
                                <span class="font-bold text-amber-400">{{ lead.budget }}</span>
                            </div>

                            <div class="mt-3 text-[10px] text-slate-500 text-center group-hover:text-amber-300 transition">
                                Click to advance stage →
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 5: ROADMAP & MODULES -->
            <div v-if="activeTab === 'roadmap'" class="space-y-6 animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                        <div class="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                            <BedDouble class="h-5 w-5" />
                        </div>
                        <h4 class="text-sm font-bold text-white">Module 1: Hotel Room Inventory</h4>
                        <p class="text-xs text-slate-400 mt-1">Check-in, Check-out, Tariff slabs, extra mattress billing, keycard sync and room status cleaning matrix.</p>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                        <div class="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                            <Calendar class="h-5 w-5" />
                        </div>
                        <h4 class="text-sm font-bold text-white">Module 2: Banquet Event Contract</h4>
                        <p class="text-xs text-slate-400 mt-1">Multi-hall management, morning/evening shifts, catering menu customizer, and advance token locking.</p>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                        <div class="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                            <Receipt class="h-5 w-5" />
                        </div>
                        <h4 class="text-sm font-bold text-white">Module 3: Dual GST Tax Engine</h4>
                        <p class="text-xs text-slate-400 mt-1">Compliant Indian GST with SAC/HSN codes. Separate tax calculations for luxury room tariffs vs food catering.</p>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                        <div class="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                            <Printer class="h-5 w-5" />
                        </div>
                        <h4 class="text-sm font-bold text-white">Module 4: POS & Thermal Printer</h4>
                        <p class="text-xs text-slate-400 mt-1">One-click thermal slip printing (80mm) for front-desk receipts + detailed A4 Tax Invoices for corporate clients.</p>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                        <div class="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                            <Send class="h-5 w-5" />
                        </div>
                        <h4 class="text-sm font-bold text-white">Module 5: WhatsApp Direct Quotations</h4>
                        <p class="text-xs text-slate-400 mt-1">Send PDF quotations and payment reminders directly to client phone numbers with verified invoice links.</p>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                        <div class="h-9 w-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                            <Users class="h-5 w-5" />
                        </div>
                        <h4 class="text-sm font-bold text-white">Module 6: Multi-Role Staff Access</h4>
                        <p class="text-xs text-slate-400 mt-1">Strict role isolation: Front Desk Receptionist (Billing/Check-in), Event Manager (Halls/Decor), and Owner/Auditor (P&L Reports).</p>
                    </div>
                </div>
            </div>
        </main>

        <!-- Thermal / Tax Invoice Preview Modal -->
        <div v-if="showInvoiceModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div class="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl text-slate-100">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-2">
                        <Receipt class="h-5 w-5 text-amber-400" />
                        <h3 class="text-sm font-bold uppercase tracking-wider">Tax Invoice / Receipt Voucher</h3>
                    </div>
                    <button @click="showInvoiceModal = false" class="text-slate-400 hover:text-white text-xs">✕ Close</button>
                </div>

                <!-- Printable Bill Representation -->
                <div id="printable-bill" class="mt-4 rounded-xl border border-dashed border-slate-700 bg-white p-6 font-mono text-xs text-slate-900 shadow-inner">
                    <div class="flex flex-col items-center text-center border-b border-slate-300 pb-3">
                        <img src="/images/logo-dark.png" alt="Senani Hotel Pleasant View" class="h-10 w-auto object-contain mb-1.5" />
                        <div class="text-base font-bold tracking-tight">HOTEL PLEASANT VIEW (SENANI)</div>
                        <div class="text-[10px] text-slate-600">Civil Lines, Raebareli • GSTIN: 09AAAAA0000A1Z5</div>
                        <div class="text-[10px] text-slate-600">Phone: +91 9794152222 / 9794152223 • info@hotelpleasantview.com</div>
                    </div>

                    <div class="mt-3 flex justify-between text-[11px] text-slate-700 border-b border-slate-300 pb-2">
                        <span>Inv #: SEN-2026-089</span>
                        <span>Date: {{ new Date().toLocaleDateString('en-IN') }}</span>
                    </div>

                    <div class="mt-2 text-[11px] text-slate-800">
                        <div><strong>Event:</strong> {{ eventType }} ({{ guestCount }} Guests)</div>
                        <div><strong>Hall:</strong> Grand Royal Ballroom</div>
                    </div>

                    <table class="mt-3 w-full border-t border-b border-slate-300 py-2 text-[11px]">
                        <thead>
                            <tr class="text-left border-b border-slate-200">
                                <th class="py-1">Particulars</th>
                                <th class="py-1 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="py-1">Catering ({{ guestCount }} plates × ₹{{ plateRate }})</td>
                                <td class="py-1 text-right">₹{{ foodSubtotal.toLocaleString('en-IN') }}</td>
                            </tr>
                            <tr>
                                <td class="py-1">Hall Rent & Decor Services</td>
                                <td class="py-1 text-right">₹{{ addonsSubtotal.toLocaleString('en-IN') }}</td>
                            </tr>
                            <tr class="border-t border-slate-200 font-semibold">
                                <td class="py-1">Taxable Subtotal</td>
                                <td class="py-1 text-right">₹{{ taxableTotal.toLocaleString('en-IN') }}</td>
                            </tr>
                            <tr>
                                <td class="py-0.5 text-slate-600">CGST ({{ gstRate / 2 }}%)</td>
                                <td class="py-0.5 text-right text-slate-600">₹{{ cgstAmount.toLocaleString('en-IN') }}</td>
                            </tr>
                            <tr>
                                <td class="py-0.5 text-slate-600">SGST ({{ gstRate / 2 }}%)</td>
                                <td class="py-0.5 text-right text-slate-600">₹{{ sgstAmount.toLocaleString('en-IN') }}</td>
                            </tr>
                            <tr class="border-t-2 border-slate-900 font-bold text-sm">
                                <td class="py-1.5">Net Payable</td>
                                <td class="py-1.5 text-right">₹{{ grandTotal.toLocaleString('en-IN') }}</td>
                            </tr>
                            <tr class="text-emerald-700 font-medium">
                                <td class="py-0.5">Advance Received (Receipt #RC-402)</td>
                                <td class="py-0.5 text-right">- ₹{{ Number(advancePaid).toLocaleString('en-IN') }}</td>
                            </tr>
                            <tr class="border-t border-slate-300 text-rose-700 font-bold">
                                <td class="py-1">Balance Due at Event</td>
                                <td class="py-1 text-right">₹{{ balanceDue.toLocaleString('en-IN') }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="mt-3 text-center text-[10px] text-slate-500">
                        Computer Generated Invoice • No Signature Required
                    </div>
                </div>

                <div class="mt-4 flex gap-2">
                    <button
                        onclick="window.print()"
                        class="flex-1 rounded-xl bg-amber-500 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
                    >
                        Print Now
                    </button>
                    <button
                        @click="showInvoiceModal = false"
                        class="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs text-white hover:bg-slate-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="mt-16 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
            <div class="flex items-center justify-center gap-2">
                <span>Senani Hospitality Suite</span>
                <span>•</span>
                <span>Laravel 11 + Vue 3 SPA</span>
                <span>•</span>
                <span class="text-emerald-400 font-medium">Herd: http://senani.test</span>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.15s ease-out;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(2px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
