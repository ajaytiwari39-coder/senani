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
    CheckCircle2,
    MapPin,
    Phone,
    Star,
    Award,
    Utensils,
    BedDouble,
    ChevronRight,
    Calendar,
    Crown,
    ArrowLeft
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

const submit = () => {
    form.post('/login', {
        onFinish: () => form.reset('password'),
    });
};

// -------------------------------------------------------------
// Real Hotel Photos & Verified Property Showcase
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
        title: 'Grand Facade & Porte-Cochère',
        subtitle: 'Prime Civil Lines address located 200m from Gol Chauraha with 24/7 valet concierge.',
        tag: 'Prime Location',
        image: '/images/hotel/gmb_assets/mmt_hotel_facade.jpg',
        category: 'Hotel Exterior',
        highlight: 'Civil Lines, Raebareli',
    },
    {
        title: 'Swarnim Grand Ballroom',
        subtitle: "Raebareli's premier pillarless marriage ballroom with 1,000+ guest capacity & crystal chandeliers.",
        tag: 'Grand Banquets',
        image: '/images/hotel/gmb_assets/gmb_swarnim_banquet_stage_hd.jpg',
        category: 'Swarnim Ballroom',
        highlight: '1,000+ Guest Capacity',
    },
    {
        title: 'Executive Quarters & Suites',
        subtitle: 'Sanctuary of peace with orthopedic bedding, ice-cold air conditioning & 24/7 hot water.',
        tag: 'Luxury Stays',
        image: '/images/hotel/gmb_assets/gmb_suite_interior_hd.jpg',
        category: 'Executive Suites',
        highlight: 'Verified High Hygiene',
    },
    {
        title: 'Grand Reception & Lobby',
        subtitle: 'Warm 24/7 reception desk and concierge lobby providing seamless express check-in for guests.',
        tag: 'Warm Hospitality',
        image: '/images/hotel/gmb_assets/gmb_hotel_reception_hd.jpg',
        category: 'Reception & Lobby',
        highlight: '24/7 Front Desk',
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
    timer = setInterval(nextSlide, 4500);
};

onMounted(() => {
    restartAutoPlay();
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});
</script>

<template>
    <Head title="Management ERP Login | Hotel Pleasant View, Raebareli" />

    <!-- Main Viewport: Full-Screen Luxury Split Screen -->
    <div class="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF8F5] text-[#1A1816] font-sans selection:bg-[#8E744B] selection:text-white">

        <!-- ========================================================= -->
        <!-- LEFT PANEL: AUTHENTIC HOTEL SHOWCASE (VISUAL CANVAS)      -->
        <!-- ========================================================= -->
        <div class="relative w-full lg:w-[54%] xl:w-[58%] min-h-[440px] sm:min-h-[500px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden bg-[#141312]">

            <!-- Authentic Hotel Photos with Smooth Crossfade Animation -->
            <div
                v-for="(slide, idx) in slides"
                :key="slide.image"
                :class="[
                    'absolute inset-0 transition-opacity duration-700 ease-in-out',
                    activeSlideIndex === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10'
                ]"
            >
                <img
                    :src="slide.image"
                    :alt="slide.title"
                    :loading="idx === 0 ? 'eager' : 'lazy'"
                    class="h-full w-full object-cover object-center scale-105 transition-transform duration-5000 ease-out brightness-[0.45] contrast-[1.05]"
                />
            </div>

            <!-- Warm Luxury Vignette Gradients for Legibility -->
            <div class="absolute inset-0 z-10 bg-gradient-to-t from-[#141312] via-[#141312]/50 to-[#141312]/40"></div>
            <div class="absolute inset-0 z-10 bg-gradient-to-r from-[#141312]/80 via-transparent to-transparent hidden lg:block"></div>
            <div class="absolute -top-32 -left-32 z-10 h-[500px] w-[500px] rounded-full bg-[#C5A880]/15 blur-[140px] pointer-events-none"></div>

            <!-- TOP BAR: Brand Identity & Verified Rating Badge -->
            <div class="relative z-20 flex flex-wrap items-center justify-between gap-4">
                <Link :href="home()" class="inline-flex items-center gap-2 text-white hover:text-[#C5A880] transition-colors group">
                    <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span class="text-xs font-serif tracking-widest uppercase">Back to Website</span>
                </Link>

                <!-- Verified Ratings Badge -->
                <div class="inline-flex items-center gap-2.5 rounded-full border border-[#C5A880]/30 bg-[#1C1B1A]/80 px-4 py-1.5 backdrop-blur-md text-white shadow-xl">
                    <div class="flex items-center gap-1 text-[#C5A880]">
                        <Star class="h-3.5 w-3.5 fill-[#C5A880] stroke-[#C5A880]" />
                        <span class="text-xs font-bold text-white">4.2</span>
                    </div>
                    <span class="h-3 w-px bg-white/20"></span>
                    <div class="flex items-center gap-1.5 text-[11px] text-[#DFCEB7]">
                        <span>1,030+ Verified Reviews</span>
                    </div>
                </div>
            </div>

            <!-- BOTTOM SHOWCASE: Active Slide Information, Highlights & Indicators -->
            <div class="relative z-20 mt-auto pt-10 sm:pt-14 space-y-5">

                <!-- Active Slide Caption -->
                <div class="space-y-2 max-w-2xl text-left">
                    <div class="inline-flex items-center gap-2 rounded-full border border-[#C5A880]/40 bg-[#1C1B1A]/80 px-3.5 py-1 text-[11px] font-medium text-[#DFCEB7] uppercase tracking-widest backdrop-blur-md">
                        <Crown class="h-3 w-3 text-[#C5A880]" />
                        <span>{{ slides[activeSlideIndex].tag }}</span>
                    </div>
                    <h2 class="text-2xl sm:text-3xl xl:text-4xl font-normal tracking-tight text-[#FAF8F5] leading-tight font-serif">
                        {{ slides[activeSlideIndex].title }}
                    </h2>
                    <p class="text-xs sm:text-sm text-[#E8E2D8] leading-relaxed font-normal max-w-xl">
                        {{ slides[activeSlideIndex].subtitle }}
                    </p>
                </div>

                <!-- 4 Real Hotel Pillars -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div class="p-3 rounded-xl border border-white/10 bg-[#1C1B1A]/70 backdrop-blur-md text-white shadow-sm text-left">
                        <div class="text-[10px] uppercase font-semibold text-[#C5A880] flex items-center gap-1">
                            <Building2 class="h-3 w-3" /> Landmark
                        </div>
                        <div class="text-xs font-medium mt-1 text-[#FAF8F5]">Civil Lines, Gol Chauraha</div>
                    </div>
                    <div class="p-3 rounded-xl border border-white/10 bg-[#1C1B1A]/70 backdrop-blur-md text-white shadow-sm text-left">
                        <div class="text-[10px] uppercase font-semibold text-[#C5A880] flex items-center gap-1">
                            <Calendar class="h-3 w-3" /> Banquets
                        </div>
                        <div class="text-xs font-medium mt-1 text-[#FAF8F5]">Swarnim (1,000 Pax)</div>
                    </div>
                    <div class="p-3 rounded-xl border border-white/10 bg-[#1C1B1A]/70 backdrop-blur-md text-white shadow-sm text-left">
                        <div class="text-[10px] uppercase font-semibold text-[#C5A880] flex items-center gap-1">
                            <BedDouble class="h-3 w-3" /> Stays
                        </div>
                        <div class="text-xs font-medium mt-1 text-[#FAF8F5]">Executive & Deluxe</div>
                    </div>
                    <div class="p-3 rounded-xl border border-white/10 bg-[#1C1B1A]/70 backdrop-blur-md text-white shadow-sm text-left">
                        <div class="text-[10px] uppercase font-semibold text-[#C5A880] flex items-center gap-1">
                            <Utensils class="h-3 w-3" /> Dining
                        </div>
                        <div class="text-xs font-medium mt-1 text-[#FAF8F5]">Awadhi Gourmet Live</div>
                    </div>
                </div>

                <!-- Verified Location & Phone Strip -->
                <div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/15 text-xs text-[#E8E2D8]">
                    <div class="flex items-center gap-2 text-left">
                        <MapPin class="h-4 w-4 text-[#C5A880] shrink-0" />
                        <span class="font-normal text-slate-200">Manika Cinema Rd, Gandhi Nagar, Raebareli, UP – 229001</span>
                    </div>
                    <div class="flex items-center gap-2 font-semibold">
                        <Phone class="h-4 w-4 text-[#C5A880] shrink-0" />
                        <a href="tel:+919794152222" class="text-white hover:text-[#C5A880] transition-colors">+91 97941 52222</a>
                    </div>
                </div>

                <!-- Slide Indicator Dots -->
                <div class="flex items-center justify-between pt-2">
                    <div class="flex items-center gap-2">
                        <button
                            v-for="(slide, idx) in slides"
                            :key="slide.category"
                            @click="setActiveSlide(idx)"
                            :title="slide.category"
                            class="group py-2 focus:outline-none transition-all cursor-pointer"
                        >
                            <span
                                :class="[
                                    'block h-1.5 rounded-full transition-all duration-300',
                                    activeSlideIndex === idx
                                        ? 'w-8 bg-[#C5A880]'
                                        : 'w-2 bg-white/40 hover:bg-white/70'
                                ]"
                            ></span>
                        </button>
                    </div>

                    <!-- Active Slide Counter -->
                    <div class="text-xs font-medium text-slate-300 flex items-center gap-2">
                        <span class="text-[#C5A880] font-semibold">0{{ activeSlideIndex + 1 }}</span>
                        <span class="text-slate-500">/</span>
                        <span class="text-slate-400">0{{ slides.length }}</span>
                        <span class="mx-1 h-3 w-px bg-white/20"></span>
                        <span class="text-white">{{ slides[activeSlideIndex].category }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- RIGHT PANEL: CLEAN PRODUCTION ADMIN AUTH CONSOLE          -->
        <!-- ========================================================= -->
        <div class="relative w-full lg:w-[46%] xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#FFFFFF] border-l border-[#EAE4DA] shadow-xl">

            <!-- Ambient Decorative Glow -->
            <div class="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-[#C5A880]/5 blur-[120px]"></div>

            <div class="w-full max-w-md mx-auto">
                <!-- Top Brand Header -->
                <div class="flex items-center justify-between pb-6 border-b border-[#ECE7DE]">
                    <Link :href="home()" class="flex items-center gap-2.5">
                        <div class="h-9 w-9 rounded-full bg-[#1C1B1A] flex items-center justify-center text-[#C5A880] shadow-sm">
                            <Crown class="h-4 w-4" />
                        </div>
                        <div class="text-left">
                            <span class="text-sm font-serif font-semibold tracking-wider text-[#1A1816] block uppercase">Hotel Pleasant View</span>
                            <span class="text-[10px] text-[#8E744B] tracking-widest uppercase block">Hospitality ERP</span>
                        </div>
                    </Link>

                    <div class="inline-flex items-center gap-1.5 rounded-full border border-[#D9D1C7] bg-[#FAF8F5] px-3 py-1 text-[11px] font-medium text-[#7A633F]">
                        <ShieldCheck class="h-3.5 w-3.5 text-[#8E744B]" />
                        256-Bit SSL Secured
                    </div>
                </div>

                <!-- Portal Welcome Heading -->
                <div class="mt-8 mb-6 text-left">
                    <span class="text-xs font-semibold uppercase tracking-widest text-[#8E744B] mb-1 block">
                        Authorized Staff Access
                    </span>
                    <h1 class="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#1A1816]">
                        Sign In to ERP Portal
                    </h1>
                    <p class="mt-1.5 text-xs sm:text-sm text-[#4A453E] font-normal leading-relaxed">
                        Access reservations, Swarnim Ballroom event schedules, guest check-ins, and billing management.
                    </p>
                </div>

                <!-- Status Alert -->
                <div v-if="status" class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600" />
                    {{ status }}
                </div>

                <!-- Authentication Error Alert -->
                <div v-if="form.errors.email || form.errors.password" class="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 text-left">
                    <ShieldAlert class="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <span class="font-bold block">Authentication Failed</span>
                        {{ form.errors.email || form.errors.password }}
                    </div>
                </div>

                <!-- Main Clean Login Form -->
                <form @submit.prevent="submit" class="space-y-5 text-left">
                    <!-- Email Field -->
                    <div>
                        <label for="email" class="block text-xs font-semibold text-[#1A1816] mb-1.5">
                            Account Email Address
                        </label>
                        <div class="relative">
                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C857B]">
                                <Mail class="h-4 w-4" />
                            </div>
                            <input
                                id="email"
                                v-model="form.email"
                                type="email"
                                required
                                autofocus
                                autocomplete="username"
                                placeholder="name@domain.com"
                                class="w-full rounded-xl border border-[#D9D1C7] bg-[#FAF8F5] pl-10 pr-3.5 py-2.5 text-xs text-[#1A1816] placeholder-[#9C9488] focus:bg-white focus:border-[#8E744B] focus:outline-none focus:ring-2 focus:ring-[#8E744B]/20 transition shadow-2xs font-normal"
                                :class="{ 'border-rose-400 focus:border-rose-500 focus:ring-rose-200': form.errors.email }"
                            />
                        </div>
                    </div>

                    <!-- Password Field -->
                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <label for="password" class="block text-xs font-semibold text-[#1A1816]">
                                Security Password
                            </label>
                            <a
                                v-if="canResetPassword"
                                :href="request()"
                                class="text-[11px] font-medium text-[#8E744B] hover:text-[#6E5834] hover:underline transition"
                            >
                                Forgot Password?
                            </a>
                        </div>
                        <div class="relative">
                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C857B]">
                                <Lock class="h-4 w-4" />
                            </div>
                            <input
                                id="password"
                                v-model="form.password"
                                :type="showPassword ? 'text' : 'password'"
                                required
                                autocomplete="current-password"
                                placeholder="••••••••••••"
                                class="w-full rounded-xl border border-[#D9D1C7] bg-[#FAF8F5] pl-10 pr-10 py-2.5 text-xs text-[#1A1816] placeholder-[#9C9488] focus:bg-white focus:border-[#8E744B] focus:outline-none focus:ring-2 focus:ring-[#8E744B]/20 transition shadow-2xs font-normal"
                                :class="{ 'border-rose-400 focus:border-rose-500 focus:ring-rose-200': form.errors.password }"
                            />
                            <button
                                type="button"
                                @click="showPassword = !showPassword"
                                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8C857B] hover:text-[#1A1816] focus:outline-none cursor-pointer"
                                aria-label="Toggle password visibility"
                            >
                                <EyeOff v-if="showPassword" class="h-4 w-4" />
                                <Eye v-else class="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <!-- Remember Me Checkbox -->
                    <div class="flex items-center justify-between pt-1">
                        <label class="flex items-center gap-2 cursor-pointer text-xs text-[#4A453E] font-normal">
                            <input
                                type="checkbox"
                                v-model="form.remember"
                                class="h-4 w-4 rounded border-[#D9D1C7] text-[#8E744B] focus:ring-[#8E744B] focus:ring-offset-0"
                            />
                            Remember this terminal for 30 days
                        </label>
                    </div>

                    <!-- Submit Button -->
                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="mt-3 w-full rounded-xl bg-[#1C1B1A] hover:bg-[#2E2B28] py-3 text-xs font-semibold tracking-wider text-[#FAF8F5] uppercase shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8E744B] focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer border border-[#453E37]"
                    >
                        <svg
                            v-if="form.processing"
                            class="h-4 w-4 animate-spin text-[#C5A880]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <LogIn v-else class="h-4 w-4 stroke-[2.2] text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
                        <span>{{ form.processing ? 'Authenticating...' : 'Sign In to ERP Portal' }}</span>
                    </button>
                </form>
            </div>

            <!-- Footer Security & Server Badges with Abhiram Technologies Credit -->
            <div class="w-full max-w-md mx-auto pt-8 border-t border-[#ECE7DE] mt-8 text-center">
                <div class="flex items-center justify-center gap-3 text-[11px] text-[#8C857B] font-medium">
                    <span class="flex items-center gap-1">
                        <Lock class="h-3 w-3 text-[#8E744B]" /> 256-Bit Encrypted
                    </span>
                    <span>•</span>
                    <span>Protected Node</span>
                    <span>•</span>
                    <span>Multi-Factor Access</span>
                </div>
                <p class="text-[11px] text-[#8C857B] mt-2.5">
                    © 2026 Hotel Pleasant View, Raebareli. Designed by
                    <a
                        href="https://abhiramtechnologies.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-[#8E744B] hover:text-[#6E5834] font-medium hover:underline"
                    >
                        Abhiram Technologies
                    </a>.
                </p>
            </div>

        </div>

    </div>
</template>
