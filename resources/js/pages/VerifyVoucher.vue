<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { Head } from '@inertiajs/vue3';
import {
    ShieldCheck,
    Lock,
    Unlock,
    Calendar,
    Clock,
    User,
    Phone,
    MapPin,
    Building2,
    CheckCircle2,
    AlertTriangle,
    QrCode,
    FileText,
    ArrowLeft,
    Check,
    ExternalLink
} from 'lucide-vue-next';
import { renderSlimBarcode, generateQrCodeDataUrl, type BanquetAuditEntry } from '@/components/banquet/auditTrail';
import { menuCatalogs } from '@/components/banquet/menuCatalog';

interface VerifyInquiry {
    id?: string;
    voucherNo: string;
    inquiryDate: string;
    guestName: string;
    phonePrimary: string;
    phoneSecondary?: string;
    address: string;
    functionDateFrom: string;
    timeFrom: string;
    timeTo: string;
    eventType: string;
    paxGuaranteed: number;
    selectedVenues: string[];
    menuRateTier: number;
    effectiveMenuRate: number;
    menuTitle: string;
    selectedMenuCatalogItems: string[];
    isLocked?: boolean;
    lockedAt?: string;
    lockedBy?: string;
    digitalSignature?: string;
    barcodeValue?: string;
    auditLog?: BanquetAuditEntry[];
}

const defaultInquiry: VerifyInquiry = {
    voucherNo: '',
    inquiryDate: '',
    guestName: '',
    phonePrimary: '',
    address: '',
    functionDateFrom: '',
    timeFrom: '',
    timeTo: '',
    eventType: '',
    paxGuaranteed: 0,
    selectedVenues: [],
    menuRateTier: 799,
    effectiveMenuRate: 799,
    menuTitle: '',
    selectedMenuCatalogItems: [],
    isLocked: false,
    auditLog: []
};

const currentInquiry = ref<VerifyInquiry>({ ...defaultInquiry });
const qrCodeUrl = ref('');
const barcodeSvg = ref<SVGSVGElement | null>(null);

onMounted(async () => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const voucher = params.get('v');
        if (voucher) {
            try {
                const stored = localStorage.getItem('senani_banquet_inquiries');
                if (stored) {
                    const list: VerifyInquiry[] = JSON.parse(stored);
                    const found = list.find(i => String(i.voucherNo) === String(voucher));
                    if (found) {
                        currentInquiry.value = found;
                    }
                }
            } catch (e) {
                console.warn('Error reading stored inquiry:', e);
            }
        }

        // Generate QR Code
        const currentUrl = window.location.href;
        qrCodeUrl.value = await generateQrCodeDataUrl(currentUrl, 160);

        // Render Barcode
        await nextTick();
        if (currentInquiry.value.digitalSignature) {
            renderSlimBarcode(barcodeSvg.value, currentInquiry.value.digitalSignature, 26);
        }
    }
});

const venueLabels = computed(() => {
    const map: Record<string, string> = {
        swarnmahal: 'Swarnmahal (-1)',
        swarnim: 'Swarnim (G)',
        swadhistam: 'Swadhistam (1)',
        lawn: 'Lawn',
        pisces: 'Pisces Rooftop',
        mandap: 'Mandap Hall',
    };
    return (currentInquiry.value.selectedVenues || []).map(v => map[v] || v).join(' + ');
});
</script>

<template>
    <Head :title="`Voucher #${currentInquiry.voucherNo} Audit Verification - Senani Hotel`" />

    <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-slate-100 font-sans p-3 sm:p-6 flex flex-col items-center">
        <!-- Main Verification Card -->
        <div class="w-full max-w-4xl bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
            
            <!-- Top Luxury Branding Header -->
            <div class="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 p-4 sm:p-6 border-b border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <img src="/assets/logo-dark.png" alt="Senani Hotel" class="h-10 sm:h-12 object-contain" />
                    <div class="border-l border-purple-700/50 pl-3">
                        <div class="text-sm sm:text-base font-black tracking-wide text-white uppercase">
                            Digital Integrity & Audit Portal
                        </div>
                        <div class="text-[11px] text-purple-300 font-medium">
                            Hotel Pleasant View • Manika Cinema Road, Civil Lines, Raebareli
                        </div>
                    </div>
                </div>

                <!-- Verification Seal Badge -->
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-xs">
                    <ShieldCheck class="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Cryptographically Authenticated</span>
                </div>
            </div>

            <!-- Slim Barcode & Digital Signature Bar ("Ptla sa Barcode") -->
            <div class="bg-slate-950/95 p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex flex-col items-center sm:items-start">
                    <div class="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                        Digital Signature Auth Token
                    </div>
                    <div class="text-sm sm:text-base font-mono font-black text-amber-400 tracking-wider">
                        {{ currentInquiry.digitalSignature || `SN-SIG-${currentInquiry.voucherNo}-VERIFIED` }}
                    </div>
                    <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Signed by: <strong class="text-slate-200">{{ currentInquiry.lockedBy || 'Banquet Operations Manager' }}</strong></span>
                        <span>•</span>
                        <span>Sealed: <strong class="text-slate-200">{{ currentInquiry.lockedAt || 'Confirmed' }}</strong></span>
                    </div>
                </div>

                <!-- Slim Barcode SVG -->
                <div class="bg-white px-3 py-1.5 rounded-lg border border-slate-300 flex flex-col items-center">
                    <svg ref="barcodeSvg" class="h-6 w-52"></svg>
                    <span class="text-[9px] font-mono font-bold text-slate-700 tracking-wider mt-0.5">
                        {{ currentInquiry.digitalSignature || `SN-SIG-${currentInquiry.voucherNo}` }}
                    </span>
                </div>
            </div>

            <!-- Content Grid: Summary & Revision History -->
            <div class="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <!-- Left Column (5 Cols): Voucher Summary -->
                <div class="lg:col-span-5 space-y-4">
                    <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                        <div class="flex items-center justify-between pb-2 border-b border-slate-700">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Voucher Details</span>
                            <span class="px-2 py-0.5 rounded text-xs font-black font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                #{{ currentInquiry.voucherNo }}
                            </span>
                        </div>

                        <div>
                            <div class="text-base font-black text-white">{{ currentInquiry.guestName }}</div>
                            <div class="text-xs text-slate-400">{{ currentInquiry.address }}</div>
                            <div class="text-xs font-mono text-purple-300 mt-0.5">Primary: {{ currentInquiry.phonePrimary }}</div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-700/50">
                            <div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase">Event Type</div>
                                <div class="font-bold text-slate-200">{{ currentInquiry.eventType }}</div>
                            </div>
                            <div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase">Guaranteed Pax</div>
                                <div class="font-bold text-emerald-400">{{ currentInquiry.paxGuaranteed }} Persons</div>
                            </div>
                            <div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase">Event Date</div>
                                <div class="font-bold text-slate-200">{{ currentInquiry.functionDateFrom }}</div>
                            </div>
                            <div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase">Allocated Venue</div>
                                <div class="font-bold text-slate-200">{{ venueLabels }}</div>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-slate-700/50">
                            <div class="text-[10px] text-slate-400 font-bold uppercase">Catering Package</div>
                            <div class="flex items-center justify-between mt-0.5">
                                <span class="text-xs font-bold text-slate-200">{{ currentInquiry.menuTitle }}</span>
                                <span class="text-xs font-mono font-bold text-purple-300">@₹{{ currentInquiry.effectiveMenuRate }}/plate</span>
                            </div>
                            <div class="text-[11px] text-slate-400 mt-1">
                                {{ currentInquiry.selectedMenuCatalogItems?.length || 0 }} authentic dishes confirmed across courses.
                            </div>
                        </div>

                        <!-- Current Lock Status Pill -->
                        <div class="pt-3">
                            <div v-if="currentInquiry.isLocked" class="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2.5">
                                <Lock class="h-4 w-4 text-emerald-400 shrink-0" />
                                <div>
                                    <div class="text-xs font-bold text-emerald-300">Official Lock Active (Frozen)</div>
                                    <div class="text-[10px] text-emerald-400/80">Tamper-proof protection enabled. No alterations allowed.</div>
                                </div>
                            </div>
                            <div v-else class="p-2.5 rounded-lg bg-amber-950/70 border border-amber-500/50 flex items-center gap-2.5">
                                <Unlock class="h-4 w-4 text-amber-400 shrink-0" />
                                <div>
                                    <div class="text-xs font-bold text-amber-300">Deal Open For Revisions</div>
                                    <div class="text-[10px] text-amber-400/80">Pending manager freeze or active modification.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- QR Code Widget -->
                    <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-4">
                        <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="Verification QR" class="h-20 w-20 rounded-lg bg-white p-1 border border-slate-400 shadow-md shrink-0" />
                        <div class="text-xs text-slate-300">
                            <div class="font-bold text-white flex items-center gap-1.5">
                                <QrCode class="h-3.5 w-3.5 text-purple-400" />
                                <span>Official QR Integrity Seal</span>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                Scan with any smartphone camera to inspect authentic real-time revision history and digital signature token.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Right Column (7 Cols): Complete Chronological Audit Trail Timeline -->
                <div class="lg:col-span-7 space-y-4">
                    <div class="p-4 sm:p-5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-700">
                            <div class="flex items-center gap-2">
                                <FileText class="h-4 w-4 text-purple-400" />
                                <h3 class="text-sm font-bold text-white">Chronological Revision & Audit Trail</h3>
                            </div>
                            <span class="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-700/50">
                                {{ currentInquiry.auditLog?.length || 0 }} Logged Events
                            </span>
                        </div>

                        <!-- Timeline Nodes -->
                        <div class="mt-4 relative pl-6 border-l-2 border-slate-700 space-y-6">
                            
                            <div
                                v-for="entry in (currentInquiry.auditLog || [])"
                                :key="entry.id"
                                class="relative group"
                            >
                                <!-- Node Icon / Dot -->
                                <div
                                    class="absolute -left-[31px] top-0 h-5 w-5 rounded-full flex items-center justify-center border-2 text-[10px]"
                                    :class="{
                                        'bg-emerald-500 border-emerald-200 text-white': entry.action === 'locked',
                                        'bg-amber-500 border-amber-200 text-white': entry.action === 'unlocked',
                                        'bg-blue-500 border-blue-200 text-white': entry.action === 'updated',
                                        'bg-purple-500 border-purple-200 text-white': entry.action === 'created',
                                    }"
                                >
                                    <Lock v-if="entry.action === 'locked'" class="h-2.5 w-2.5" />
                                    <Unlock v-else-if="entry.action === 'unlocked'" class="h-2.5 w-2.5" />
                                    <Check v-else-if="entry.action === 'created'" class="h-2.5 w-2.5" />
                                    <span v-else>✏️</span>
                                </div>

                                <!-- Node Content Card -->
                                <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-700/70 text-xs shadow-xs space-y-1.5">
                                    <div class="flex flex-wrap items-center justify-between gap-1">
                                        <div class="flex items-center gap-2">
                                            <span
                                                class="font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded"
                                                :class="{
                                                    'bg-emerald-950 text-emerald-400 border border-emerald-600/40': entry.action === 'locked',
                                                    'bg-amber-950 text-amber-400 border border-amber-600/40': entry.action === 'unlocked',
                                                    'bg-blue-950 text-blue-400 border border-blue-600/40': entry.action === 'updated',
                                                    'bg-purple-950 text-purple-400 border border-purple-600/40': entry.action === 'created',
                                                }"
                                            >
                                                {{ entry.action.toUpperCase() }}
                                            </span>
                                            <span class="font-bold text-slate-200">{{ entry.actor }}</span>
                                        </div>
                                        <span class="text-[10px] font-mono text-slate-400">{{ entry.timestamp }}</span>
                                    </div>

                                    <p class="text-slate-300 text-[11px] leading-snug">
                                        {{ entry.details }}
                                    </p>

                                    <!-- Digital Signature Pill if locked -->
                                    <div v-if="entry.digitalSignature" class="mt-1 p-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10.5px] text-amber-400 flex items-center justify-between">
                                        <span>Seal: <strong>{{ entry.digitalSignature }}</strong></span>
                                        <span class="text-[9px] text-slate-500 uppercase">Cryptographic Token</span>
                                    </div>

                                    <!-- Unlocked Previous Signature Reference -->
                                    <div v-if="entry.previousSignature" class="mt-1 text-[10px] font-mono text-slate-400">
                                        Previous Seal Voided: <span class="line-through text-slate-500">{{ entry.previousSignature }}</span>
                                    </div>

                                    <!-- Diffs / Changes list -->
                                    <div v-if="entry.changes && entry.changes.length > 0" class="mt-1.5 pt-1.5 border-t border-slate-800/80 space-y-1">
                                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recorded Revisions:</div>
                                        <div
                                            v-for="(change, cIdx) in entry.changes"
                                            :key="cIdx"
                                            class="flex items-start gap-1.5 text-[10.5px] text-blue-300 font-medium bg-blue-950/30 px-2 py-0.5 rounded border border-blue-900/40"
                                        >
                                            <span class="text-blue-400">•</span>
                                            <span>{{ change }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer Note -->
            <div class="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                    Official Audit Record • Senani Hotel Pleasant View Banquet Management System v2.4
                </div>
                <div class="flex items-center gap-4">
                    <a href="/dashboard?tab=banquet" class="text-purple-400 hover:text-purple-300 font-bold transition flex items-center gap-1">
                        <ArrowLeft class="h-3 w-3" />
                        <span>Return to ERP Dashboard</span>
                    </a>
                </div>
            </div>

        </div>
    </div>
</template>
