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
    Coffee
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
    // Step 2: Manager (Venues & Setup)
    paxGuaranteed: number;
    selectedVenues: string[];
    isEngagementPackage: boolean;
    engagementPackageType: 'none' | 'swarnim' | 'swarnmahal';
    isMeetingSetup: boolean;
    menuRateTier: 499 | 799 | 999 | 1199;
    effectiveMenuRate: number;
    menuTitle: string;
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
    status: 'draft_reception' | 'pending_md' | 'approved_md';
    mdApprovedAt?: string;
    mdRemarks?: string;
}

const props = withDefaults(
    defineProps<{
        show: boolean;
        initialInquiry?: BanquetInquiry | null;
        defaultStep?: number;
        openPrintPreview?: boolean;
    }>(),
    {
        show: false,
        initialInquiry: null,
        defaultStep: 1,
        openPrintPreview: false,
    }
);

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', inquiry: BanquetInquiry): void;
}>();

// Wizard active step: 1 (Reception) | 2 (Manager) | 3 (MD / Authority Approval)
const currentStep = ref(props.defaultStep || 1);
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

// -------------------------------------------------------------
// Official Docx Menu Catalogs (Extracted from 499, 799, 999 docx)
// -------------------------------------------------------------
interface MenuCatalogTier {
    tier: 499 | 799 | 999 | 1199;
    title: string;
    welcomeDrinksCount: number;
    hotDrinksCount: number;
    soupsCount: number;
    startersCount: number;
    dalCount: number;
    paneerCount: number;
    dryVegCount: number;
    gravyVegCount: number;
    riceCount: number;
    raitaCount: number;
    breadsCount: number;
    dessertsCount: number;
    liveCountersCount: number;
    welcomeDrinks: string[];
    hotDrinks: string[];
    soups: string[];
    starters: string[];
    dal: string[];
    paneer: string[];
    dryVeg: string[];
    gravyVeg: string[];
    rice: string[];
    raita: string[];
    breads: string[];
    desserts: string[];
    salads: string[];
    liveCounters: string[];
}

const menuCatalogs: Record<499 | 799 | 999 | 1199, MenuCatalogTier> = {
    499: {
        tier: 499,
        title: 'Executive Vegetarian Buffet (₹499)',
        welcomeDrinksCount: 2,
        hotDrinksCount: 1,
        soupsCount: 0,
        startersCount: 3,
        dalCount: 1,
        paneerCount: 1,
        dryVegCount: 1,
        gravyVegCount: 0,
        riceCount: 1,
        raitaCount: 1,
        breadsCount: 4,
        dessertsCount: 1,
        liveCountersCount: 0,
        welcomeDrinks: ['Sprite', 'Coke', 'Fanta', 'Limca', 'Special Sarbat'],
        hotDrinks: ['Tea (Regular, Masala, Ginger, Green, Lemon)', 'Coffee'],
        soups: [],
        starters: ['Veg Manchurian Dry', 'Chilli Potato', 'Cocktail Samosa', 'Cheese Nuggets', 'Fried Masala Idly', 'Peri Peri French Fries'],
        dal: ['Dal Tadka', 'Dal Fry', 'Rajma Masala', 'Chana Masala'],
        paneer: ['Paneer Butter Masala', 'Paneer Do Pyaaza', 'Palak Paneer', 'Matar Paneer'],
        dryVeg: ['Jeera Aloo', 'Mix Veg', 'Aloo Gobhi'],
        gravyVeg: [],
        rice: ['Jeera Rice', 'Plain Rice'],
        raita: ['Boondi Raita', 'Mix Veg Raita'],
        breads: ['Tandoori Plain Roti', 'Tandoori Butter Roti', 'Butter Naan', 'Lachha Parantha', 'Poori', 'Kachauri'],
        desserts: ['Hot Gulab Jamun', 'Rasgulla', 'Ice Cream', 'Lauki Halwa'],
        salads: ['Sirka Pyaaz', 'Green Salad', 'Achaar', 'Chutney', 'Water', 'Sprouts'],
        liveCounters: [],
    },
    799: {
        tier: 799,
        title: 'Royal Deluxe Buffet (₹799)',
        welcomeDrinksCount: 3,
        hotDrinksCount: 2,
        soupsCount: 2,
        startersCount: 5,
        dalCount: 1,
        paneerCount: 1,
        dryVegCount: 1,
        gravyVegCount: 1,
        riceCount: 1,
        raitaCount: 1,
        breadsCount: 3,
        dessertsCount: 2,
        liveCountersCount: 3,
        welcomeDrinks: ['Sprite', 'Fanta', 'Limca', 'Coke', 'Special Sarbat', 'Watermelon Mojito', 'Virgin Mojito', 'Fresh Lime Soda'],
        hotDrinks: ['Tea (Regular, Ginger, Green, Masala, Lemon)', 'Filter Coffee', 'Hot Chocolate Milk', 'Badam Milk'],
        soups: ['Tomato Soup', 'Veg Sweet Corn Soup', 'Clear Soup', 'Veg Manchow Soup'],
        starters: ['Veg Manchurian Dry', 'Chilli Potato', 'Cocktail Samosa', 'Cheese Nuggets', 'Fried Masala Idly', 'Peri Peri French Fries', 'Paneer Shashlik', 'Spring Roll', 'Cutlets'],
        dal: ['Dal Tadka', 'Dal Fry', 'Rajma Masala', 'Chana Masala', 'Mix Dal', 'Panch Ratan Dal', 'Pal Dal (Saghpaita)'],
        paneer: ['Paneer Butter Masala', 'Paneer Do Pyaaza', 'Palak Paneer', 'Matar Paneer', 'Kadhai Paneer', 'Khoya Paneer'],
        dryVeg: ['Jeera Aloo', 'Mix Veg', 'Aloo Gobhi Masala'],
        gravyVeg: ['Kashmiri Dum Aloo', 'Aloo Matar', 'Malai Kofta', 'Veg Kofta'],
        rice: ['Jeera Rice', 'Plain Rice', 'Masala Rice', 'Mix Veg Pulao', 'Matar Pulao', 'Kaju Pulao'],
        raita: ['Boondi Raita', 'Mix Veg Raita', 'Bottle Gourd (Lauki) Raita'],
        breads: ['Tandoori Plain Roti', 'Tandoori Butter Roti', 'Butter Naan', 'Garlic Naan', 'Missi Roti', 'Poori', 'Kachauri', 'Khasta Kachauri', 'Fried Papad'],
        desserts: ['Hot Gulab Jamun', 'Rasgulla', 'Ice Cream', 'Lauki Halwa', 'Rasmalai', 'Moong Dal Halwa'],
        salads: ['Sirka Pyaaz', 'Green Salad', 'Russian Salad', 'Sprouts', 'Mix Fruit Salad', 'German Potato Salad', 'Achaar', 'Chutney'],
        liveCounters: ['Veg Hakka Noodles', 'Veg Fried Rice (Manchurian/Chilli Paneer)', 'Masala Dosa Live', 'Imarti & Rabri Live', 'Pav Bhaji Live', 'Muradabadi Dal Live'],
    },
    999: {
        tier: 999,
        title: 'Imperial Grand Feast (₹999)',
        welcomeDrinksCount: 4,
        hotDrinksCount: 2,
        soupsCount: 2,
        startersCount: 7,
        dalCount: 1,
        paneerCount: 2,
        dryVegCount: 1,
        gravyVegCount: 1,
        riceCount: 2,
        raitaCount: 2,
        breadsCount: 5,
        dessertsCount: 3,
        liveCountersCount: 6,
        welcomeDrinks: ['Pepsi / Coke / Limca / Fanta', 'Red Smooth Sarbat', 'Mojito Blue', 'Fresh Lime Soda', 'Milk Shake', 'Watermelon Mocktail', 'Cold Coffee', 'Mango Mojito', 'Vanilla Shake', 'Virgin Mojito'],
        hotDrinks: ['Tea (Regular, Masala, Ginger, Green, Lemon)', 'Milk (Badam, Chocolate, Turmeric)'],
        soups: ['Veg Sweet Corn Soup', 'Veg Manchow', 'Talumein Soup', 'Vegetable Soup', 'Mix Veg Clear Soup', 'Tomato Soup', 'Cream of Mushroom Soup', 'Veg Lemon & Coriander Soup'],
        starters: ['Tandoori Paneer Tikka', 'Hara Bhara Kabab', 'Chilli Paneer Dry', 'Paneer 65', 'Tandoori Roasted Aloo', 'Mushroom Tikka', 'Paneer Pakoda', 'Achari Paneer Tikka', 'Veg Seekh Kabab', 'Cheese Nuggets', 'Fried Idly', 'Peri Peri French Fries', 'Gobhi Chilli', 'Baby Corn Chilli', 'Mushroom Chilli', 'Paneer Manchurian', 'Gobhi Manchurian', 'Aloo Bonda'],
        dal: ['Dhuli Urad Masala Dal', 'Masur Dal Black', 'Green Urad Masala Dal', 'Black Chana Dal', 'Green Chana Dal', 'Matar Fry Dal'],
        paneer: ['Paneer Pasanda', 'Paneer Kaleji', 'Paneer Kali Mirch', 'Paneer Korma', 'Kaju Paneer', 'Paneer Hongkong', 'Paneer 65', 'Paneer Do Pyaza', 'Paneer Bhurji', 'Paneer Lahsuni'],
        dryVeg: ['Mix Veg', 'Aloo Gobhi Masala', 'Jeera Aloo', 'Lauki Masala', 'Patta Gobhi Matar', 'Stuffed Tawa Veg'],
        gravyVeg: ['Kashmiri Dum Aloo', 'Matar Mushroom', 'Malai Kofta', 'Veg Kofta', 'Aloo Tomato Masala', 'Sarso Ka Saag'],
        rice: ['Masala Rice', 'Garlic Pulao', 'Paneer Pulao', 'Lemon Rice', 'Curd Rice', 'Jeera Rice', 'Mix Veg Pulao', 'Kaju Pulao'],
        raita: ['Lauki Raita', 'Cucumber Raita', 'Mango Raita', 'Fruit Raita', 'Boondi Raita', 'Mix Veg Raita'],
        breads: ['Stuff Naan', 'Coriander Naan', 'White Til Naan', 'Pudina Parantha', 'Missi Roti', 'Chilli Lachha', 'Garlic Naan', 'Tandoori Butter Roti', 'Butter Naan', 'Tawa Roti', 'Poori', 'Kachauri', 'Khasta Kachauri', 'Fried Papad'],
        desserts: ['White Rasgulla', 'Ras Bhari', 'Pastry Cake', 'Gulab Jamun', 'Chhena Bol', 'Rasmalai', 'Gajar Ka Halwa (Winter)', 'Moong Dal Halwa', 'Kesariya Mewa Milk (Live)'],
        salads: ['Kimchi Salad', 'Russian Salad', 'Pasta Salad', 'Sprout Salad', 'Green Salad', 'Kachumbar Salad', 'Red Onion Lachha Salad'],
        liveCounters: ['Chaat Counter (Aloo, Matar, Papdi, Stuffed Chilli/Tomato)', 'Pani Poori Counter', 'Veg Hakka Noodles', 'Crispy Corn', 'Chilli Mushroom', 'Chilli Paneer Gravy', 'Chilli Garlic Noodles', 'Burnt Garlic Noodles', 'Schezwan Fried Rice', 'Pav Bhaji Live', 'Moradabadi Daal Live'],
    },
    1199: {
        tier: 1199,
        title: 'Presidential Royal Grand Banquet (₹1199)',
        welcomeDrinksCount: 5,
        hotDrinksCount: 2,
        soupsCount: 3,
        startersCount: 9,
        dalCount: 2,
        paneerCount: 2,
        dryVegCount: 2,
        gravyVegCount: 2,
        riceCount: 2,
        raitaCount: 2,
        breadsCount: 6,
        dessertsCount: 4,
        liveCountersCount: 8,
        welcomeDrinks: ['All Mocktails & Shakes', 'Exotic Fruit Punch', 'Blue Lagoon', 'Mojito Barista', 'Cold Coffee with Ice Cream'],
        hotDrinks: ['Signature Masala Chai', 'Espresso Bar', 'Kadhai Badam Kesar Milk'],
        soups: ['Minestrone Soup', 'Cream of Broccoli Soup', 'Tom Yum Soup', 'Veg Manchow', 'Sweet Corn'],
        starters: ['Afghani Paneer Tikka', 'Dahi Ke Kabab', 'Corn Cheese Balls', 'Tandoori Broccoli', 'Paneer Kurkure', 'Kurkuri Bhindi', 'Soya Chaap Tandoori', 'Crispy Lotus Stem', 'Spring Rolls', 'Veg Seekh Kabab'],
        dal: ['Dal Makhani Special', 'Panchmel Dal', 'Yellow Dal Tadka Double Tadka'],
        paneer: ['Shahi Paneer Lazeez', 'Paneer Lababdar', 'Paneer Tikka Masala Gravy', 'Paneer Pasanda'],
        dryVeg: ['Subz Panchwati', 'Methi Malai Matar Dry', 'Aloo Dum Banarasi', 'Tawa Exotic Veg'],
        gravyVeg: ['Navratan Korma', 'Malai Kofta Kesariya', 'Mushroom Rogan Josh', 'Kaju Masala Gravy'],
        rice: ['Awadhi Dum Biryani', 'Kashmiri Pulao', 'Jeera Pulao', 'Brown Garlic Rice'],
        raita: ['Pineapple Raita', 'Anar Raita', 'Burani Raita', 'Mix Veg Raita'],
        breads: ['Amritsari Kulcha', 'Chilli Garlic Naan', 'Laccha Parantha', 'Missi Roti', 'Butter Naan', 'Roomali Roti'],
        desserts: ['Angoori Rasmalai', 'Hot Jalebi with Rabri', 'Brownie with Vanilla', 'Kulfi Falooda', 'Gulab Jamun', 'Moong Dal Halwa'],
        salads: ['Exotic Greek Salad', 'Caesar Salad', 'Sprouts & Apple Salad', 'Russian Salad', 'Lachha Pyaaz'],
        liveCounters: ['Woodfired Pizza Counter', 'Pasta in Red & White Sauce', 'Dimsum & Momos Counter', 'Live Dosa & Uttapam', 'Live Tawa Chaat', 'Pani Poori (5 Flavors)', 'Waffle & Crepes', 'Mocktail Bar'],
    },
};

// -------------------------------------------------------------
// Reactive Form State
// -------------------------------------------------------------
const form = ref<BanquetInquiry>({
    voucherNo: '250',
    inquiryDate: '15/Nov/2026',
    guestName: 'Mr. Tushar Gupta Jee',
    phonePrimary: '8115711507',
    phoneSecondary: '7081219880',
    address: 'Civil Lines, Raebareli',
    email: '',
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
    selectedMenuCatalogItems: [],
    engagementBreakfastPax: 0,
    regularBreakfastPax: 0,
    bainaBoxes: 0,
    mandapServingsPax: 0,
    roomsNeeded: 5,
    roomArrival: '16:00',
    roomDeparture: '09:00',
    roomRate: 2500,
    decorPackageType: 'standard',
    soundMicSetup: false,
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
    mdApprovedAt: undefined,
    mdRemarks: 'Approved with 5% privilege VIP discount.',
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
    form.value.discountPercent = pct;
    form.value.discountRupees = Math.round((totalGrossAmount.value * pct) / 100);
    form.value.discountInputMode = 'percent';
};

const setDiscountFromAmount = (amt: number) => {
    form.value.discountRupees = amt;
    form.value.discountPercent = totalGrossAmount.value > 0 ? Math.round((amt / totalGrossAmount.value) * 1000) / 10 : 0;
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

// Stepper Actions
const nextStep = () => {
    if (currentStep.value < 3) currentStep.value++;
};
const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
};

const approveByAuthority = () => {
    form.value.status = 'approved_md';
    form.value.approverRole = authorityLevel.value.tier;
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

const triggerPrint = () => {
    window.print();
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
                                    class="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-[#673DE6] border border-purple-200"
                                >
                                    Pending Approval
                                </span>
                                <span
                                    v-else
                                    class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200"
                                >
                                    Reception Draft
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

                <!-- 3-Stage Interactive Stepper Navigation -->
                <div class="grid grid-cols-3 gap-2 sm:gap-3 pt-2.5">
                    <button
                        type="button"
                        @click="currentStep = 1"
                        :class="[
                            'flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition text-left',
                            currentStep === 1
                                ? 'bg-[#673DE6] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                        ]"
                    >
                        <span class="h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-black" :class="currentStep === 1 ? 'bg-white text-[#673DE6]' : 'bg-slate-300 text-slate-700'">
                            1
                        </span>
                        <span class="truncate">Reception Desk Intake</span>
                    </button>

                    <button
                        type="button"
                        @click="currentStep = 2"
                        :class="[
                            'flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition text-left',
                            currentStep === 2
                                ? 'bg-[#673DE6] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                        ]"
                    >
                        <span class="h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-black" :class="currentStep === 2 ? 'bg-white text-[#673DE6]' : 'bg-slate-300 text-slate-700'">
                            2
                        </span>
                        <span class="truncate">Banquet Manager Costing</span>
                    </button>

                    <button
                        type="button"
                        @click="currentStep = 3"
                        :class="[
                            'flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition text-left',
                            currentStep === 3
                                ? 'bg-[#673DE6] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                        ]"
                    >
                        <span class="h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-black" :class="currentStep === 3 ? 'bg-white text-[#673DE6]' : 'bg-slate-300 text-slate-700'">
                            3
                        </span>
                        <span class="truncate">Tiered Approval & Discount (₹)</span>
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
                                    type="text"
                                    required
                                    placeholder="e.g. Mr. Tushar Gupta Jee"
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition"
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
                                    class="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 focus:bg-white focus:border-[#673DE6] focus:outline-none transition font-mono"
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
                                            class="flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs"
                                            :class="form.engagementPackageType === 'swarnim' ? 'bg-white border-[#673DE6] shadow-xs' : 'bg-slate-50 border-slate-200'"
                                        >
                                            <div>
                                                <div class="font-bold text-slate-900">Swarnim Hall (G) + Decor + DJ</div>
                                                <div class="text-[10px] text-slate-500">Hall + Stage + Flowers + Full DJ Setup</div>
                                            </div>
                                            <div class="font-mono font-bold text-[#673DE6] text-right">
                                                <input type="radio" value="swarnim" v-model="form.engagementPackageType" class="mr-1.5" />
                                                ₹45,000
                                            </div>
                                        </label>

                                        <label
                                            class="flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs"
                                            :class="form.engagementPackageType === 'swarnmahal' ? 'bg-white border-[#673DE6] shadow-xs' : 'bg-slate-50 border-slate-200'"
                                        >
                                            <div>
                                                <div class="font-bold text-slate-900">Swarnmahal Hall (-1) + Decor + DJ</div>
                                                <div class="text-[10px] text-slate-500">Basement Hall + Stage + Flowers + DJ Setup</div>
                                            </div>
                                            <div class="font-mono font-bold text-[#673DE6] text-right">
                                                <input type="radio" value="swarnmahal" v-model="form.engagementPackageType" class="mr-1.5" />
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
                        <div class="lg:col-span-5 space-y-4">
                            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
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
                                        v-for="tier in [499, 799, 999, 1199]"
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
                                        <div class="text-base font-black font-mono">
                                            ₹{{ tier }}
                                        </div>
                                        <div class="text-[10px] truncate" :class="form.menuRateTier === tier ? 'text-purple-100 font-semibold' : 'text-slate-500'">
                                            {{ tier === 499 ? 'Veg Buffet' : tier === 799 ? 'Royal Deluxe' : tier === 999 ? 'Imperial' : 'Royal Grand' }}
                                        </div>
                                    </button>
                                </div>

                                <!-- Meeting Rate Conversion Alert -->
                                <div v-if="form.isMeetingSetup" class="p-2 rounded-lg bg-purple-50 border border-purple-200 text-[11px] flex items-center justify-between text-[#673DE6] font-bold">
                                    <span>Meeting Conversion Active:</span>
                                    <span>Base ₹{{ form.menuRateTier }} ➔ Effective <strong class="text-sm font-black font-mono">₹{{ effectiveMenuRate }}</strong> / Pax</span>
                                </div>

                                <!-- Extra Fooding Addons Grid -->
                                <div class="pt-2 border-t border-slate-100 space-y-2">
                                    <div class="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                        <span>Special Servings & Breakfast Addons</span>
                                        <span class="font-mono text-purple-700">₹{{ extraFoodingTotal.toLocaleString('en-IN') }}</span>
                                    </div>

                                    <div class="grid grid-cols-2 gap-2 text-xs">
                                        <!-- Engagement Breakfast @200 -->
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

                                        <!-- Regular Breakfast @300 -->
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

                                        <!-- Baina @260 per pentagon box -->
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

                                        <!-- Mandap Servings @60 -->
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

                                <!-- Official Docx Menu Preview Accordion -->
                                <div class="pt-2 border-t border-slate-100">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-[11px] font-bold text-slate-900">
                                            Included Menu Course Preview (Docx Catalog)
                                        </span>
                                        <span class="text-[10px] text-[#673DE6] font-bold">
                                            Tier: ₹{{ activeMenuPreviewTier }}
                                        </span>
                                    </div>

                                    <div class="max-h-48 overflow-y-auto p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-2 custom-scrollbar">
                                        <div>
                                            <strong class="text-purple-800">Welcome Drinks (Any {{ menuCatalogs[activeMenuPreviewTier].welcomeDrinksCount }}):</strong>
                                            <p class="text-slate-600">{{ menuCatalogs[activeMenuPreviewTier].welcomeDrinks.join(', ') }}</p>
                                        </div>
                                        <div>
                                            <strong class="text-purple-800">Starters (Any {{ menuCatalogs[activeMenuPreviewTier].startersCount }}):</strong>
                                            <p class="text-slate-600">{{ menuCatalogs[activeMenuPreviewTier].starters.join(', ') }}</p>
                                        </div>
                                        <div>
                                            <strong class="text-purple-800">Paneer Specials (Any {{ menuCatalogs[activeMenuPreviewTier].paneerCount }}):</strong>
                                            <p class="text-slate-600">{{ menuCatalogs[activeMenuPreviewTier].paneer.join(', ') }}</p>
                                        </div>
                                        <div v-if="menuCatalogs[activeMenuPreviewTier].liveCounters.length > 0">
                                            <strong class="text-purple-800">Live Counters (Any {{ menuCatalogs[activeMenuPreviewTier].liveCountersCount }}):</strong>
                                            <p class="text-slate-600">{{ menuCatalogs[activeMenuPreviewTier].liveCounters.join(', ') }}</p>
                                        </div>
                                        <div>
                                            <strong class="text-purple-800">Desserts (Any {{ menuCatalogs[activeMenuPreviewTier].dessertsCount }}):</strong>
                                            <p class="text-slate-600">{{ menuCatalogs[activeMenuPreviewTier].desserts.join(', ') }}</p>
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
                                            class="flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer"
                                            :class="form.decorPackageType === 'standard' ? 'bg-purple-50 border-[#673DE6]' : 'bg-slate-50 border-slate-200'"
                                        >
                                            <div>
                                                <div class="font-bold text-slate-900">Standard Event Decor</div>
                                                <div class="text-[10px] text-slate-500">DJ, Stage, Flower, Entrance, Selfie</div>
                                            </div>
                                            <div class="font-mono font-bold text-slate-900">
                                                <input type="radio" value="standard" v-model="form.decorPackageType" class="mr-1" />
                                                ₹30,000
                                            </div>
                                        </label>

                                        <label
                                            class="flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer"
                                            :class="form.decorPackageType === 'wedding' ? 'bg-purple-50 border-[#673DE6]' : 'bg-slate-50 border-slate-200'"
                                        >
                                            <div>
                                                <div class="font-bold text-slate-900">Wedding Decor Package</div>
                                                <div class="text-[10px] text-slate-500">Walkway, Garden, Dual DJ + Mandap</div>
                                            </div>
                                            <div class="font-mono font-bold text-slate-900">
                                                <input type="radio" value="wedding" v-model="form.decorPackageType" class="mr-1" />
                                                ₹48,000
                                            </div>
                                        </label>

                                        <label
                                            class="flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer"
                                            :class="form.decorPackageType === 'grand' ? 'bg-purple-50 border-[#673DE6]' : 'bg-slate-50 border-slate-200'"
                                        >
                                            <div>
                                                <div class="font-bold text-slate-900">Grand Theme Setup</div>
                                                <div class="text-[10px] text-slate-500">Light, Tent, Flowers, Theme Stage</div>
                                            </div>
                                            <div class="font-mono font-bold text-slate-900">
                                                <input type="radio" value="grand" v-model="form.decorPackageType" class="mr-1" />
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
                <div v-if="currentStep === 3" class="space-y-4 animate-in fade-in duration-150 max-w-6xl mx-auto">
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
                        @click="saveAndClose"
                        class="h-8 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                    >
                        Save & Exit
                    </button>

                    <button
                        v-if="currentStep < 3"
                        type="button"
                        @click="nextStep"
                        class="h-8 px-4 rounded-lg bg-[#673DE6] hover:bg-[#5832D0] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                        <span>Next Step</span>
                        <ArrowRight class="h-3.5 w-3.5" />
                    </button>

                    <button
                        v-else
                        type="button"
                        @click="approveByAuthority"
                        class="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                        <CheckCircle2 class="h-3.5 w-3.5" />
                        <span>Confirm & Lock Voucher</span>
                    </button>
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
                                @click="showPrintPreview = false"
                                class="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                            >
                                <X class="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <!-- COMPLETE PRINTABLE DOCUMENT REPLICA -->
                    <div id="printable-voucher" class="space-y-4 bg-white text-slate-900 text-[11px] font-sans">
                        
                        <!-- ========================================================= -->
                        <!-- PART 1: COMMERCIAL INVOICE SLIP (User's Current Invoice)   -->
                        <!-- ========================================================= -->
                        <div class="border border-slate-400 p-4 sm:p-5 bg-white print-avoid-break">
                            <!-- Top Header Contacts & Logo -->
                            <div class="flex items-start justify-between border-b border-slate-400 pb-2.5">
                                <div class="flex items-center gap-3">
                                    <img src="/images/logo-dark.png" alt="Senani Hotel Pleasant View" class="h-14 sm:h-16 w-auto object-contain" />
                                    <div class="hidden sm:block border-l border-slate-300 pl-3">
                                        <div class="text-[11px] font-black tracking-wider text-purple-900 uppercase">Banquet & Convention Booking Voucher</div>
                                        <div class="text-[9px] text-slate-600 font-medium">A Premium Hospitality Unit of Senani Group</div>
                                        <div class="text-[8px] text-slate-400 font-mono">Civil Lines, Raebareli, UP • GSTIN: 09AAAAA0000A1Z5</div>
                                    </div>
                                </div>
                                <div class="text-right text-[10px] leading-tight text-slate-700 font-mono">
                                    <div class="font-bold text-[#673DE6] pb-0.5">HELPLINE & BOOKING DESK</div>
                                    <div>RECEPTION : +91 9794152222</div>
                                    <div>MANAGER : +91 9794152223</div>
                                    <div class="font-bold text-slate-900">MD OFFICE : +91 9794152224</div>
                                    <div>BANQUET SALES : +91 9794152225</div>
                                </div>
                            </div>

                            <!-- Tagline banner -->
                            <div class="text-center font-bold text-[11px] tracking-wider py-1 border-b border-slate-400 bg-slate-100">
                                PLEASE COLLECT RECEIPT OF ALL PAYMENT
                            </div>

                            <!-- Sl No. & Date -->
                            <div class="flex justify-between py-1.5 border-b border-slate-300 font-bold text-xs">
                                <span>Voucher No. : <span class="font-mono text-[#673DE6]">#{{ form.voucherNo }}</span></span>
                                <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                    {{ form.status === 'approved_md' ? 'OFFICIAL BOOKING VOUCHER' : 'PROVISIONAL INQUIRY QUOTATION' }}
                                </span>
                                <span>Date: <span class="font-mono">{{ form.inquiryDate }}</span></span>
                            </div>

                            <!-- Guest Fields -->
                            <div class="py-2 space-y-1.5 border-b border-slate-300 text-[11px]">
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="flex"><span class="w-28 font-bold text-slate-600">Guest Name:</span> <span class="font-bold text-slate-900">{{ form.guestName }}</span></div>
                                    <div class="flex"><span class="w-28 font-bold text-slate-600">Phone No.:</span> <span class="font-mono font-bold">{{ form.phonePrimary }}</span> <span v-if="form.phoneSecondary" class="font-mono ml-2">, {{ form.phoneSecondary }}</span></div>
                                </div>
                                <div class="flex"><span class="w-28 font-bold text-slate-600">Address:</span> <span class="text-slate-800">{{ form.address }}</span></div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div><span class="w-28 inline-block font-bold text-slate-600">Function Date:</span> <span class="font-bold text-slate-900">{{ form.functionDateFrom }}</span> to <span class="font-bold text-slate-900">{{ form.functionDateTo }}</span></div>
                                    <div><span class="font-bold text-slate-600">Timing Slot:</span> <span class="font-semibold">{{ form.timeFrom }} to {{ form.timeTo }}</span></div>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div><span class="w-28 inline-block font-bold text-slate-600">Event Type:</span> <span class="font-bold text-[#673DE6]">{{ form.eventType }}</span></div>
                                    <div>
                                        <span class="font-bold text-slate-600">Catering Tier:</span>
                                        <span class="font-bold">₹{{ effectiveMenuRate }}/plate</span>
                                        <span v-if="form.isMeetingSetup" class="text-[9px] text-purple-700 font-bold bg-purple-50 px-1 py-0.5 rounded ml-1 border border-purple-200">Meeting Setup</span>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <span class="w-28 inline-block font-bold text-slate-600">No. of person:</span>
                                        <span class="font-black text-slate-900">(Guaranteed) {{ form.paxGuaranteed }} Pax</span>
                                    </div>
                                    <div>
                                        <span class="font-bold text-slate-600">Allocated Area:</span>
                                        <span v-if="form.isEngagementPackage" class="font-bold text-purple-700">Engagement Package ({{ form.engagementPackageType.toUpperCase() }})</span>
                                        <span v-else class="font-bold text-slate-800">{{ form.selectedVenues.map(v => v.toUpperCase()).join(', ') }}</span>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <span class="w-28 inline-block font-bold text-slate-600">Rooms Needed:</span>
                                        <span class="font-bold">{{ form.roomsNeeded }} Rooms</span> (@ ₹{{ form.roomRate || 2500 }}/night)
                                    </div>
                                    <div>
                                        <span class="font-bold text-slate-600">Room Stay:</span>
                                        <span>{{ form.roomArrival }} to {{ form.roomDeparture }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Financials / Breakdown (Amount in Numbers!) -->
                            <div class="py-2.5 border-b border-slate-400 bg-slate-50/80 p-2.5 font-mono text-[11px] space-y-1 my-2 rounded-xs">
                                <div class="flex justify-between text-slate-600 text-[10px]">
                                    <span>Fooding ({{ form.paxGuaranteed }} Pax × ₹{{ effectiveMenuRate }}):</span>
                                    <span>₹{{ foodTotal.toLocaleString('en-IN') }}</span>
                                </div>
                                <div v-if="extraFoodingTotal > 0" class="flex justify-between text-slate-600 text-[10px]">
                                    <span>Extra Fooding & Ritual Servings:</span>
                                    <span>₹{{ extraFoodingTotal.toLocaleString('en-IN') }}</span>
                                </div>
                                <div v-if="venueTotal > 0" class="flex justify-between text-slate-600 text-[10px]">
                                    <span>Hall / Venue Charges:</span>
                                    <span>₹{{ venueTotal.toLocaleString('en-IN') }}</span>
                                </div>
                                <div v-if="roomsTotal > 0" class="flex justify-between text-slate-600 text-[10px]">
                                    <span>Room Accommodations ({{ form.roomsNeeded }} Rms):</span>
                                    <span>₹{{ roomsTotal.toLocaleString('en-IN') }}</span>
                                </div>
                                <div v-if="decorAvTotal > 0" class="flex justify-between text-slate-600 text-[10px]">
                                    <span>Decoration & AV Equipment:</span>
                                    <span>₹{{ decorAvTotal.toLocaleString('en-IN') }}</span>
                                </div>
                                <div v-if="otherAddonsTotal > 0" class="flex justify-between text-slate-600 text-[10px]">
                                    <span>Add-ons / Meeting Pax Surcharge:</span>
                                    <span>₹{{ otherAddonsTotal.toLocaleString('en-IN') }}</span>
                                </div>
                                <div class="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900 text-xs">
                                    <span>Total Estimated Baseline Amount:</span>
                                    <span>₹{{ totalGrossAmount.toLocaleString('en-IN') }}</span>
                                </div>
                                <div v-if="calculatedDiscountAmount > 0" class="flex justify-between text-emerald-700 font-bold">
                                    <span>{{ authorityLevel.title }} Concession ({{ calculatedDiscountPercent }}%):</span>
                                    <span>- ₹{{ calculatedDiscountAmount.toLocaleString('en-IN') }}</span>
                                </div>
                                <div class="flex justify-between font-black text-sm border-t border-slate-300 pt-1 text-slate-900">
                                    <span>Net Payable Amount:</span>
                                    <span>₹{{ netPayableAmount.toLocaleString('en-IN') }}</span>
                                </div>
                                <div class="flex justify-between text-slate-700 pt-0.5 text-xs">
                                    <span>Advance Token Paid:</span>
                                    <span class="font-bold">₹{{ form.amountPaid.toLocaleString('en-IN') }} ({{ form.paymentMode }})</span>
                                </div>
                                <div class="flex justify-between font-black text-xs text-rose-600 border-t border-slate-200 pt-1">
                                    <span>Balance Due on Event Day:</span>
                                    <span>₹{{ balanceDueAmount.toLocaleString('en-IN') }}</span>
                                </div>
                            </div>

                            <!-- Signatures Box: Dynamic Authority Designation with Official Emblem Seal -->
                            <div class="pt-4 pb-1 grid grid-cols-2 gap-8 text-center text-[11px]">
                                <div>
                                    <div class="border-t border-slate-400 pt-1 font-bold text-slate-700">Guest / Client Signature</div>
                                    <div class="text-[9px] text-slate-500 font-mono">{{ form.guestName }}</div>
                                </div>
                                <div class="flex flex-col items-center">
                                    <div class="flex items-center gap-1.5 mb-1">
                                        <img src="/images/emblem-dark.png" alt="Senani" class="h-6 w-auto object-contain" />
                                        <span class="text-[8px] font-mono font-bold text-purple-950 uppercase tracking-wider">Senani Official Seal</span>
                                    </div>
                                    <div class="w-full border-t border-slate-400 pt-1 font-bold text-slate-700">
                                        {{ authorityLevel.signatureLabel }}
                                    </div>
                                    <div class="text-[9px] text-emerald-700 font-bold">
                                        {{ form.status === 'approved_md' ? '✔ DIGITALLY AUTHORIZED' : 'PENDING AUTHORIZATION' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ========================================================= -->
                        <!-- PART 2: PACKAGE INCLUSIONS & LOGISTICS SPECIFICATIONS      -->
                        <!-- ("bus neeche kya hai package me wo add ho jay")           -->
                        <!-- ========================================================= -->
                        <div class="border border-slate-400 p-4 sm:p-5 bg-white print-avoid-break">
                            <div class="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-300 bg-slate-50 p-2 rounded-xs">
                                <div class="flex items-center gap-2">
                                    <img src="/images/emblem-dark.png" alt="Senani" class="h-4.5 w-auto object-contain" />
                                    <span class="font-black text-xs uppercase tracking-wider text-slate-900">Package Inclusions & Infrastructure Logistics</span>
                                </div>
                                <span class="text-[10px] font-mono text-slate-500 font-semibold">Official Venue & Hospitality Breakdown</span>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                                <!-- 1. Venue & Halls Booked -->
                                <div class="p-2.5 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
                                    <div class="font-bold text-slate-800 text-xs flex items-center justify-between border-b border-slate-200 pb-1">
                                        <span>1. Allocated Halls & Spaces</span>
                                        <span class="font-mono text-purple-700 font-extrabold">₹{{ venueTotal.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div v-if="form.isEngagementPackage" class="text-xs">
                                        <p class="font-bold text-purple-800">
                                            {{ form.engagementPackageType === 'swarnim' ? 'Swarnim Hall with Decoration + DJ Setup' : 'Swarnmahal Hall with Decoration + DJ Setup' }}
                                        </p>
                                        <p class="text-[10px] text-slate-500">Standalone Engagement Combo Package</p>
                                    </div>
                                    <ul v-else class="space-y-1">
                                        <li v-for="venue in selectedVenuesDetailed" :key="venue.name" class="flex justify-between items-center text-[10px]">
                                            <span class="font-medium text-slate-700">• {{ venue.name }}</span>
                                            <span class="font-mono font-bold text-slate-900">₹{{ venue.price.toLocaleString('en-IN') }}</span>
                                        </li>
                                    </ul>
                                    <div class="text-[10px] text-slate-500 pt-1 border-t border-slate-200 space-y-0.5">
                                        <div>Capacity: <span class="font-semibold">{{ paxRules.minPax }} Min Guaranteed Pax</span> (Max {{ paxRules.maxPax }} Pax)</div>
                                        <div v-if="form.isMeetingSetup" class="text-purple-700 font-semibold">
                                            Meeting Setup 6-hr Slot (Below min pax surcharge: ₹20k Banquet / ₹5k Mandap)
                                        </div>
                                    </div>
                                </div>

                                <!-- 2. Room Accommodations -->
                                <div class="p-2.5 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
                                    <div class="font-bold text-slate-800 text-xs flex items-center justify-between border-b border-slate-200 pb-1">
                                        <span>2. Deluxe Room Stays</span>
                                        <span class="font-mono text-purple-700 font-extrabold">₹{{ roomsTotal.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div class="space-y-1">
                                        <div class="flex justify-between">
                                            <span class="text-slate-600">Rooms Allocated:</span>
                                            <span class="font-bold text-slate-900">{{ form.roomsNeeded }} Executive AC Rooms</span>
                                        </div>
                                        <div class="flex justify-between text-[10px]">
                                            <span class="text-slate-600">Standard Room Tariff:</span>
                                            <span class="font-mono font-semibold">₹{{ form.roomRate || 2500 }} / room / night</span>
                                        </div>
                                        <div class="flex justify-between text-[10px]">
                                            <span class="text-slate-600">Check-in / Check-out:</span>
                                            <span class="font-medium">{{ form.roomArrival }} to {{ form.roomDeparture }}</span>
                                        </div>
                                        <p class="text-[9px] text-slate-500 pt-1 border-t border-slate-200">
                                            Includes: Air Conditioning, Attached Bath, 24/7 Hot Water, Daily Housekeeping & Room Service.
                                        </p>
                                    </div>
                                </div>

                                <!-- 3. Stage & Theme Decor Setup -->
                                <div class="p-2.5 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
                                    <div class="font-bold text-slate-800 text-xs flex items-center justify-between border-b border-slate-200 pb-1">
                                        <span>3. Stage & Floral Decor</span>
                                        <span class="font-mono text-purple-700 font-extrabold" v-if="selectedDecorDetails">₹{{ selectedDecorDetails.price.toLocaleString('en-IN') }}</span>
                                        <span class="text-[10px] text-slate-400" v-else>Included</span>
                                    </div>
                                    <div v-if="selectedDecorDetails">
                                        <p class="font-bold text-slate-900 text-[11px]">{{ selectedDecorDetails.name }}</p>
                                        <p class="text-[10px] text-slate-600 mt-0.5 leading-tight">{{ selectedDecorDetails.inclusions }}</p>
                                    </div>
                                    <div v-else class="text-[10px] text-slate-600">
                                        Stage backdrop, seating & ambient lighting arranged as per package.
                                    </div>
                                    <p class="text-[9px] text-slate-500 pt-1 border-t border-slate-200">
                                        Includes: VIP Sofa Seating, Red Carpet Walkway, Round Tables with Satin Linen & Banquet Chair Covers.
                                    </p>
                                </div>

                                <!-- 4. AV & Sound Technology -->
                                <div class="p-2.5 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
                                    <div class="font-bold text-slate-800 text-xs flex items-center justify-between border-b border-slate-200 pb-1">
                                        <span>4. Audio-Visual & Tech Setup</span>
                                        <span class="font-mono text-purple-700 font-extrabold">
                                            ₹{{ selectedAvItems.reduce((s, i) => s + i.price, 0).toLocaleString('en-IN') }}
                                        </span>
                                    </div>
                                    <ul v-if="selectedAvItems.length" class="space-y-1">
                                        <li v-for="av in selectedAvItems" :key="av.name" class="flex justify-between items-center text-[10px]">
                                            <span class="text-slate-700">• {{ av.name }}</span>
                                            <span class="font-mono font-bold text-slate-900">₹{{ av.price.toLocaleString('en-IN') }}</span>
                                        </li>
                                    </ul>
                                    <p v-else class="text-[10px] text-slate-500 italic">
                                        Standard acoustic PA system included. Projector / LED wall available on request.
                                    </p>
                                    <p class="text-[9px] text-slate-500 pt-1 border-t border-slate-200">
                                        100% DG Genset Silent Power Backup & Central AC throughout the function.
                                    </p>
                                </div>
                            </div>

                            <!-- Hotel Deliverables vs Self Arrangements -->
                            <div class="mt-3 pt-2.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                                <div>
                                    <span class="font-bold text-slate-700 uppercase tracking-wider block mb-1">Hotel Hospitality Deliverables:</span>
                                    <ul class="list-disc list-inside text-slate-600 space-y-0.5">
                                        <li>Fine Bone China Tableware, Cutlery, Glassware & Stainless Food Warmers</li>
                                        <li>Service Captains, Uniformed Banquet Waiters & Housekeeping Staff</li>
                                        <li>Continuous DG Generator Backup for Air-Conditioning & Stage Lighting</li>
                                        <li>Hygienic RO Filtered Drinking Water Dispensary</li>
                                    </ul>
                                </div>
                                <div>
                                    <span class="font-bold text-slate-700 uppercase tracking-wider block mb-1">Guest Self-Arrangements:</span>
                                    <ul class="list-disc list-inside text-slate-600 space-y-0.5">
                                        <li v-for="self in form.selfArrangements" :key="self">{{ self }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- ========================================================= -->
                        <!-- PART 3: DETAILED CATERING & DOCX FOOD MENU DOSSIER         -->
                        <!-- ("every singal detail kya menuhai etc sab kuch page me")   -->
                        <!-- ========================================================= -->
                        <div class="border border-slate-400 p-4 sm:p-5 bg-white print-avoid-break">
                            <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-300 bg-slate-50 p-2 rounded-xs">
                                <div class="flex items-center gap-2">
                                    <img src="/images/emblem-dark.png" alt="Senani" class="h-4.5 w-auto object-contain" />
                                    <div>
                                        <span class="font-black text-xs uppercase tracking-wider text-slate-900">Official Catering Menu Specifications</span>
                                        <span class="ml-2 text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                                            {{ currentMenuCatalog.title }} (@ ₹{{ effectiveMenuRate }}/pax)
                                        </span>
                                    </div>
                                </div>
                                <div class="text-right font-mono text-[11px] font-bold text-slate-900">
                                    <span>{{ form.paxGuaranteed }} Pax × ₹{{ effectiveMenuRate }} = ₹{{ foodTotal.toLocaleString('en-IN') }}</span>
                                </div>
                            </div>

                            <!-- Menu Courses Grid (Extracted from official hotel docx catalog) -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                <!-- Welcome Drinks -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🍹 Welcome Drinks</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.welcomeDrinksCount }} Choices</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.welcomeDrinks" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Hot Drinks -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">☕ Hot Beverages</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.hotDrinksCount }} Choices</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.hotDrinks" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Soups (if present) -->
                                <div v-if="currentMenuCatalog.soups.length" class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🍲 Soups</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.soupsCount }} Choices</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.soups" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Starters / Appetizers -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🍢 Starters & Snacks</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.startersCount }} Choices</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.starters" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Dal Preparation -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🍲 Dal Preparation</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.dalCount }} Choice</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.dal" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Paneer Delicacies -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🧀 Paneer Specialty</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.paneerCount }} Choice(s)</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.paneer" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Seasonal Dry Veg -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🥦 Dry Seasonal Veg</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.dryVegCount }} Choice</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.dryVeg" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Gravy Veg (if present) -->
                                <div v-if="currentMenuCatalog.gravyVeg.length" class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🥘 Rich Gravy Veg</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.gravyVegCount }} Choice</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.gravyVeg" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Basmati Rice & Pulao -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🍚 Basmati Rice & Pulao</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.riceCount }} Choice(s)</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.rice" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Curd & Raita -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🥣 Curd & Raita</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.raitaCount }} Choice</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.raita" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Assorted Tandoori Breads -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🫓 Assorted Tandoor Breads</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.breadsCount }} Choices</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.breads" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Desserts & Sweets -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🍨 Desserts & Halwas</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.dessertsCount }} Choices</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.desserts" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Salads & Accompaniments -->
                                <div class="p-2 rounded border border-slate-200 bg-slate-50/40">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🥗 Salads & Accompaniments</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">Included</span>
                                    </div>
                                    <ul class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.salads" :key="item" :class="[item.length > 26 ? 'col-span-2' : '', 'flex items-start gap-1 leading-tight']">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Live Cooking Counters -->
                                <div v-if="currentMenuCatalog.liveCounters.length" class="p-2 rounded border border-slate-200 bg-slate-50/40 sm:col-span-2">
                                    <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                                        <span class="text-[11px]">🍳 Live Cooking Counters</span>
                                        <span class="text-[9.5px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-100">{{ currentMenuCatalog.liveCountersCount }} Live Stations</span>
                                    </div>
                                    <ul class="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-800">
                                        <li v-for="item in currentMenuCatalog.liveCounters" :key="item" class="flex items-start gap-1 leading-tight">
                                            <span class="text-[#673DE6] font-black shrink-0">•</span>
                                            <span class="leading-tight">{{ item }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Extra Fooding / Ritual Catering Table -->
                            <div v-if="extraFoodingItemsDetailed.length" class="mt-3 pt-2.5 border-t border-slate-200">
                                <span class="font-bold text-slate-800 text-[11px] block mb-1">Extra Fooding & Ritual Catering Add-ons:</span>
                                <table class="w-full text-left text-[10px] font-mono">
                                    <thead>
                                        <tr class="border-b border-slate-200 text-slate-500 font-bold">
                                            <th class="pb-1">Item Description</th>
                                            <th class="pb-1 text-center">Quantity / Pax</th>
                                            <th class="pb-1 text-right">Unit Rate</th>
                                            <th class="pb-1 text-right">Total (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        <tr v-for="item in extraFoodingItemsDetailed" :key="item.name">
                                            <td class="py-1 font-sans text-slate-800">{{ item.name }}</td>
                                            <td class="py-1 text-center">{{ item.qty }}</td>
                                            <td class="py-1 text-right">{{ item.rate }}</td>
                                            <td class="py-1 text-right font-bold text-slate-900">₹{{ item.total.toLocaleString('en-IN') }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- ========================================================= -->
                        <!-- PART 4: CONTRACT TERMS & FINAL SIGN-OFF                   -->
                        <!-- ========================================================= -->
                        <div class="border border-slate-400 p-4 bg-white print-avoid-break text-[10px] text-slate-600 space-y-2">
                            <div class="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1 flex items-center justify-between">
                                <div class="flex items-center gap-1.5">
                                    <img src="/images/emblem-dark.png" alt="Senani" class="h-3.5 w-auto object-contain" />
                                    <span>Official Booking Terms & Conditions</span>
                                </div>
                                <span class="font-mono text-[9px] text-slate-400">Hotel Pleasant View Policy</span>
                            </div>
                            <ol class="list-decimal list-inside space-y-0.5 leading-tight">
                                <li><strong>Guaranteed Attendance Billing</strong>: Billed for contracted guaranteed pax ({{ form.paxGuaranteed }} Pax) even if actual attendance is lower. Extra pax billed at contracted per-plate rate.</li>
                                <li><strong>Slot Timings</strong>: Event timings ({{ form.timeFrom }} to {{ form.timeTo }}) must be strictly adhered to. Extension requires management approval and incurs hourly overtime charges.</li>
                                <li><strong>Prohibitions</strong>: Outside food/liquor, commercial firecrackers, and illegal substances strictly barred on hotel premises without statutory municipal/excise permits.</li>
                                <li><strong>Cancellation Policy</strong>: Advance token deposit is strictly non-refundable and non-transferable under any circumstances.</li>
                                <li><strong>Settlement</strong>: 100% net balance (₹{{ balanceDueAmount.toLocaleString('en-IN') }}) must be cleared before event commencement prior to hall key handover.</li>
                            </ol>

                            <!-- Final Signatures with Official Senani Seal -->
                            <div class="pt-4 grid grid-cols-2 gap-8 text-center text-[11px] border-t border-slate-200 mt-2">
                                <div>
                                    <div class="border-t border-slate-400 pt-1 font-bold text-slate-800">Accepted & Confirmed By (Guest)</div>
                                    <div class="text-[9px] text-slate-500 font-mono">{{ form.guestName }} (Ph: {{ form.phonePrimary }})</div>
                                </div>
                                <div class="flex flex-col items-center">
                                    <div class="flex items-center gap-1.5 mb-1">
                                        <img src="/images/emblem-dark.png" alt="Senani" class="h-6 w-auto object-contain" />
                                        <span class="text-[8px] font-mono font-bold text-purple-950 uppercase tracking-wider">Hotel Pleasant View Seal</span>
                                    </div>
                                    <div class="w-full border-t border-slate-400 pt-1 font-bold text-slate-800">For Hotel Pleasant View (Authorized Officer)</div>
                                    <div class="text-[9px] text-emerald-700 font-bold font-mono">{{ authorityLevel.signatureLabel }}</div>
                                </div>
                            </div>

                            <div class="flex items-center justify-center gap-2 text-center text-[9px] text-slate-500 pt-1.5 border-t border-slate-100">
                                <img src="/images/emblem-dark.png" alt="Senani" class="h-3.5 w-auto object-contain opacity-75" />
                                <span>Hotel Pleasant View • A Unit of Senani Group • Manika Cinema Road, Gandhi Nagar, Civil Lines, Raebareli, UP - 229001 • info@hotelpleasantview.com</span>
                            </div>
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
