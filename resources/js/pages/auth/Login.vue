<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref, onMounted, onUnmounted } from 'vue';
import {
    Building2,
    ShieldCheck,
    Lock,
    Mail,
    Eye,
    EyeOff,
    LogIn,
    ShieldAlert,
    Sparkles,
    CheckCircle2,
    MapPin,
    Phone,
    Star,
    Award,
    Utensils,
    BedDouble,
    ChevronRight,
    Check,
    Calendar,
    Crown
} from '@lucide/vue';
import { request } from '@/routes/password';
import { home } from '@/routes';

defineOptions({
    layout: null, // Full-screen self-contained luxury split layout
});

defineProps<{
    status?: string;
    canResetPassword?: boolean;
}>();

const form = useForm({
    email: '',
    password: '',
    remember: true,
});

const showPassword = ref(false);
const autoFilled = ref(false);

const fillAdminCredentials = () => {
    form.email = 'admin@senani.com';
    form.password = 'Admin@12345';
    autoFilled.value = true;
    setTimeout(() => {
        autoFilled.value = false;
    }, 3000);
};

const submit = () => {
    form.post('/login', {
        onFinish: () => form.reset('password'),
    });
};

// -------------------------------------------------------------
// Real Hotel Photos Scraped & Sourced from Property
// -------------------------------------------------------------
interface HotelSlide {
    title: string;
    subtitle: string;
    tag: string;
    image: string;
    category: string;
    highlight: string;
}

const slides: HotelSlide[] = [
    {
        title: 'Neoclassical Palace Facade',
        subtitle: 'Grand Roman pillars, ornate carved arches & imperial white architecture in Raebareli.',
        tag: 'Architectural Marvel',
        image: '/images/hotel/facade.jpg',
        category: 'Palace Exterior',
        highlight: 'Neoclassical Architecture',
    },
    {
        title: 'Royal Entrance & Floral Canopy',
        subtitle: 'Lord Ganesha shrine with exquisite wedding blossom archways welcoming royal guests.',
        tag: 'Imperial Welcoming',
        image: '/images/hotel/entrance.jpg',
        category: 'Grand Entrance',
        highlight: 'Wedding Canopy & Shrine',
    },
    {
        title: 'Executive Luxury Suites',
        subtitle: 'King bedding, swan art decor, cove lighting & smart television consoles for 5-star comfort.',
        tag: '5-Star Comfort',
        image: '/images/hotel/room.jpg',
        category: 'Luxury Rooms',
        highlight: 'Executive Suites',
    },
    {
        title: 'Senani Monument & Pisces Restaurant',
        subtitle: '5th Floor rooftop fine-dining multi-cuisine restaurant & landmark stone entrance.',
        tag: 'The Lap of Luxury',
        image: '/images/hotel/signboard.png',
        category: 'Dining & Landmark',
        highlight: 'Pisces Rooftop (5th Fl)',
    },
];

const activeSlideIndex = ref(0);
let timer: any = null;

const setActiveSlide = (index: number) => {
    activeSlideIndex.value = index;
    restartAutoPlay();
};

const nextSlide = () => {
    activeSlideIndex.value = (activeSlideIndex.value + 1) % slides.length;
};

const restartAutoPlay = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, 5500);
};

onMounted(() => {
    restartAutoPlay();
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});
</script>

<template>
    <Head title="Executive Login - Senani Hotel Pleasant View" />

    <!-- Main Viewport: Full-Screen Luxury Split Screen -->
    <div class="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F9FD] text-[#18181B] font-sans selection:bg-[#673DE6] selection:text-white">

        <!-- ========================================================= -->
        <!-- LEFT PANEL: REAL LUXURY HOTEL SHOWCASE (VISUAL CANVAS)     -->
        <!-- ========================================================= -->
        <div class="relative w-full lg:w-[54%] xl:w-[58%] min-h-[420px] sm:min-h-[500px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden bg-slate-950">

            <!-- Real Hotel Photos with Smooth Crossfade Animation -->
            <div
                v-for="(slide, idx) in slides"
                :key="slide.image"
                :class="[
                    'absolute inset-0 transition-opacity duration-1000 ease-in-out',
                    activeSlideIndex === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10'
                ]"
            >
                <img
                    :src="slide.image"
                    :alt="slide.title"
                    class="h-full w-full object-cover object-center scale-105 transition-transform duration-6000 ease-out"
                />
            </div>

            <!-- Deep Multi-Layer Luxury Dark Gradients for Maximum Legibility -->
            <div class="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>
            <div class="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent hidden lg:block"></div>
            <div class="absolute -top-32 -left-32 z-10 h-[500px] w-[500px] rounded-full bg-[#673DE6]/20 blur-[140px] pointer-events-none"></div>

            <!-- TOP BAR: Royal Crest, Hotel Identity & Google 4.2 Rating -->
            <div class="relative z-20 flex flex-wrap items-center justify-between gap-4">
                <Link :href="home()" class="flex items-center gap-3 group">
                    <img
                        src="/images/logo-white.png"
                        alt="Senani Hotel Pleasant View"
                        class="h-14 sm:h-16 w-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-200"
                    />
                </Link>

                <!-- Verified Google Reviews Badge -->
                <div class="inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md text-white shadow-2xl">
                    <div class="flex items-center gap-1 text-amber-400">
                        <Star class="h-4 w-4 fill-amber-400 stroke-amber-400" />
                        <span class="text-sm font-black text-white">4.2</span>
                    </div>
                    <span class="h-3 w-px bg-white/20"></span>
                    <div class="flex flex-col text-left">
                        <span class="text-[11px] font-bold text-slate-100 leading-tight">1,041+ Reviews</span>
                        <span class="text-[9px] text-amber-300 font-medium">Google Verified</span>
                    </div>
                </div>
            </div>

            <!-- BOTTOM SHOWCASE: Active Slide Information, Highlights & Thumbnail Switcher -->
            <div class="relative z-20 mt-auto pt-10 sm:pt-14 space-y-5">

                <!-- Active Slide Caption -->
                <div class="space-y-2 max-w-2xl">
                    <div class="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-[#673DE6]/40 px-3.5 py-1 text-xs font-bold text-purple-100 backdrop-blur-md">
                        <Award class="h-3.5 w-3.5 text-amber-400" />
                        <span>{{ slides[activeSlideIndex].tag }}</span>
                    </div>
                    <h2 class="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight font-serif drop-shadow-md">
                        {{ slides[activeSlideIndex].title }}
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal max-w-xl">
                        {{ slides[activeSlideIndex].subtitle }}
                    </p>
                </div>

                <!-- 4 Real-World Hotel Facilities -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div class="p-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white shadow-sm">
                        <div class="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
                            <Building2 class="h-3 w-3" /> Architecture
                        </div>
                        <div class="text-xs font-bold mt-1">Neoclassical Palace</div>
                    </div>
                    <div class="p-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white shadow-sm">
                        <div class="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1">
                            <Utensils class="h-3 w-3" /> Rooftop Dining
                        </div>
                        <div class="text-xs font-bold mt-1">Pisces Multi-Cuisine (5th Fl)</div>
                    </div>
                    <div class="p-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white shadow-sm">
                        <div class="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
                            <Calendar class="h-3 w-3" /> Royal Events
                        </div>
                        <div class="text-xs font-bold mt-1">Imperial Banquet (600 Pax)</div>
                    </div>
                    <div class="p-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white shadow-sm">
                        <div class="text-[10px] uppercase font-bold text-blue-300 flex items-center gap-1">
                            <BedDouble class="h-3 w-3" /> Stays
                        </div>
                        <div class="text-xs font-bold mt-1">Luxury Executive Suites</div>
                    </div>
                </div>

                <!-- Verified Location & Phone Strip -->
                <div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/15 text-xs text-slate-300">
                    <div class="flex items-center gap-2">
                        <MapPin class="h-4 w-4 text-rose-400 shrink-0" />
                        <span class="font-medium text-slate-200">Manika Cinema Rd, Gandhi Nagar, Raebareli, UP - 229001</span>
                    </div>
                    <div class="flex items-center gap-2 font-semibold">
                        <Phone class="h-4 w-4 text-emerald-400 shrink-0" />
                        <span class="text-white font-bold tracking-wide">+91 97941 52222</span>
                    </div>
                </div>

                <!-- Interactive Carousel Indicator Dots (No Scrollbar, Pure Luxury Minimal) -->
                <div class="flex items-center justify-between pt-2">
                    <div class="flex items-center gap-2.5">
                        <button
                            v-for="(slide, idx) in slides"
                            :key="slide.category"
                            @click="setActiveSlide(idx)"
                            :title="slide.category"
                            class="group py-2 focus:outline-none transition-all cursor-pointer"
                        >
                            <span
                                :class="[
                                    'block h-2.5 rounded-full transition-all duration-300',
                                    activeSlideIndex === idx
                                        ? 'w-9 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/50'
                                        : 'w-2.5 bg-white/40 hover:bg-white/70'
                                ]"
                            ></span>
                        </button>
                    </div>

                    <!-- Active Slide Counter & Category -->
                    <div class="text-xs font-semibold text-slate-300 flex items-center gap-2">
                        <span class="text-amber-400 font-bold">0{{ activeSlideIndex + 1 }}</span>
                        <span class="text-slate-500">/</span>
                        <span class="text-slate-400">0{{ slides.length }}</span>
                        <span class="mx-1 h-3 w-px bg-white/20"></span>
                        <span class="text-white font-medium">{{ slides[activeSlideIndex].category }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- RIGHT PANEL: SLEEK HOSTINGER LIGHT ADMIN AUTH CONSOLE     -->
        <!-- ========================================================= -->
        <div class="relative w-full lg:w-[46%] xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-white border-l border-slate-200/80 shadow-2xl">

            <!-- Ambient Decorative Glow -->
            <div class="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-[#673DE6]/5 blur-[120px]"></div>

            <div class="w-full max-w-md mx-auto">
                <!-- Top Brand Header -->
                <div class="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div class="flex items-center gap-3">
                        <img
                            src="/images/logo-dark.png"
                            alt="Senani Hotel Pleasant View"
                            class="h-10 sm:h-11 w-auto object-contain"
                        />
                    </div>

                    <div class="inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50/80 px-3 py-1 text-[11px] font-bold text-[#673DE6]">
                        <ShieldCheck class="h-3.5 w-3.5 text-[#673DE6]" />
                        256-Bit SSL Secured
                    </div>
                </div>

                <!-- Portal Welcome Heading -->
                <div class="mt-8 mb-6">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#673DE6] mb-1 block">
                        Super Administrator Access
                    </span>
                    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
                        Sign In to Admin Portal
                    </h1>
                    <p class="mt-1.5 text-xs sm:text-sm text-slate-500 font-normal">
                        Executive gateway for Front Desk, Banquet Bookings & High-Speed GST Billing.
                    </p>
                </div>

                <!-- Status Alert -->
                <div v-if="status" class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600" />
                    {{ status }}
                </div>

                <!-- Authentication Error Alert -->
                <div v-if="form.errors.email || form.errors.password" class="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
                    <ShieldAlert class="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <span class="font-bold block">Authentication Failed</span>
                        {{ form.errors.email || form.errors.password }}
                    </div>
                </div>

                <!-- 1-Click Quick Admin Access Card -->
                <div class="mb-6 rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50/90 via-purple-50/60 to-indigo-50/40 p-4 shadow-xs">
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-xl bg-[#673DE6] text-white flex items-center justify-center shadow-xs shrink-0">
                                <Sparkles class="h-4.5 w-4.5" />
                            </div>
                            <div>
                                <span class="text-xs font-bold text-slate-900 block">1-Click Quick Admin Access</span>
                                <span class="text-[11px] text-slate-500">Auto-fill verified credentials</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            @click="fillAdminCredentials"
                            class="rounded-xl bg-[#673DE6] hover:bg-[#5832D0] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-[#673DE6]/25 transition flex items-center gap-1.5 active:scale-95 shrink-0"
                        >
                            <Check v-if="autoFilled" class="h-3.5 w-3.5 text-emerald-300" />
                            <span>{{ autoFilled ? 'Filled!' : 'Fill Admin' }}</span>
                        </button>
                    </div>
                </div>

                <!-- Main Login Form -->
                <form @submit.prevent="submit" class="space-y-4.5">
                    <!-- Email Field -->
                    <div>
                        <label for="email" class="block text-xs font-bold text-slate-700 mb-1.5">
                            Administrator Email
                        </label>
                        <div class="relative">
                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <Mail class="h-4 w-4" />
                            </div>
                            <input
                                id="email"
                                v-model="form.email"
                                type="email"
                                required
                                autofocus
                                autocomplete="username"
                                placeholder="admin@senani.com"
                                class="w-full rounded-xl border border-slate-200 bg-[#F8F9FD] pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-2 focus:ring-[#673DE6]/20 transition shadow-2xs font-medium"
                                :class="{ 'border-rose-400 focus:border-rose-500 focus:ring-rose-200': form.errors.email }"
                            />
                        </div>
                    </div>

                    <!-- Password Field -->
                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <label for="password" class="block text-xs font-bold text-slate-700">
                                Security Password
                            </label>
                            <a
                                v-if="canResetPassword"
                                :href="request()"
                                class="text-[11px] font-semibold text-[#673DE6] hover:text-[#5025d1] hover:underline transition"
                            >
                                Forgot Password?
                            </a>
                        </div>
                        <div class="relative">
                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <Lock class="h-4 w-4" />
                            </div>
                            <input
                                id="password"
                                v-model="form.password"
                                :type="showPassword ? 'text' : 'password'"
                                required
                                autocomplete="current-password"
                                placeholder="••••••••••••"
                                class="w-full rounded-xl border border-slate-200 bg-[#F8F9FD] pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#673DE6] focus:outline-none focus:ring-2 focus:ring-[#673DE6]/20 transition shadow-2xs font-medium"
                                :class="{ 'border-rose-400 focus:border-rose-500 focus:ring-rose-200': form.errors.password }"
                            />
                            <button
                                type="button"
                                @click="showPassword = !showPassword"
                                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                <EyeOff v-if="showPassword" class="h-4 w-4" />
                                <Eye v-else class="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <!-- Remember Me Checkbox -->
                    <div class="flex items-center justify-between pt-1">
                        <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                            <input
                                type="checkbox"
                                v-model="form.remember"
                                class="h-4 w-4 rounded border-slate-300 text-[#673DE6] focus:ring-[#673DE6] focus:ring-offset-0"
                            />
                            Remember this terminal for 30 days
                        </label>
                    </div>

                    <!-- Submit Button -->
                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="mt-3 w-full rounded-xl bg-gradient-to-r from-[#673DE6] to-[#5025d1] py-3 text-xs font-bold text-white shadow-lg shadow-[#673DE6]/25 hover:from-[#5832D0] hover:to-[#431fb5] focus:outline-none focus:ring-2 focus:ring-[#673DE6] focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                    >
                        <svg
                            v-if="form.processing"
                            class="h-4 w-4 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <LogIn v-else class="h-4 w-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                        <span>{{ form.processing ? 'Verifying Credentials...' : 'Authenticate & Enter ERP' }}</span>
                    </button>
                </form>
            </div>

            <!-- Footer Security & Server Badges -->
            <div class="w-full max-w-md mx-auto pt-8 border-t border-slate-100 mt-8 text-center">
                <div class="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span class="flex items-center gap-1">
                        <Lock class="h-3 w-3 text-[#673DE6]" /> 256-Bit Encrypted
                    </span>
                    <span>•</span>
                    <span>Hostinger Cloud Node</span>
                    <span>•</span>
                    <span>Multi-Factor Gate</span>
                </div>
                <p class="text-[10px] text-slate-400 mt-2">
                    © 2026 Senani Hotel Pleasant View. All Rights Reserved.
                </p>
            </div>

        </div>

    </div>
</template>
