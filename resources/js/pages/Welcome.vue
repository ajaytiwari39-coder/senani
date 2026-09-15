<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import {
    Calendar,
    Clock,
    Building2,
    Sparkles,
    CheckCircle2,
    Users,
    ArrowRight,
    ShieldCheck,
    Utensils,
    ChevronRight,
    BedDouble,
    Phone,
    Mail,
    MapPin,
    Star,
    Award,
    Wifi,
    Tv,
    Coffee,
    Car,
    SlidersHorizontal,
    X,
    ChevronLeft,
    Maximize2,
    ExternalLink,
    MessageCircle,
    Check,
    Crown,
    HeartHandshake,
    Music,
    Camera
} from '@lucide/vue';

// -------------------------------------------------------------
// Active Navigation & Mobile Menu State
// -------------------------------------------------------------
const mobileMenuOpen = ref(false);
const activeNav = ref('home');

const scrollToSection = (id: string) => {
    mobileMenuOpen.value = false;
    activeNav.value = id;
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

// -------------------------------------------------------------
// Hero Quick Booking Widget State
// -------------------------------------------------------------
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const bookingCheckIn = ref(today);
const bookingCheckOut = ref(tomorrow);
const bookingGuests = ref(2);
const bookingCategory = ref('deluxe');

// -------------------------------------------------------------
// Room Modal & Reservation Flow
// -------------------------------------------------------------
interface Room {
    id: string;
    title: string;
    subtitle: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviewsCount: number;
    size: string;
    occupancy: string;
    bed: string;
    view: string;
    image: string;
    gallery: string[];
    description: string;
    amenities: string[];
    highlights: string[];
}

const rooms: Room[] = [
    {
        id: 'deluxe',
        title: 'Deluxe Heritage Room',
        subtitle: 'Refined Comfort with Authentic Indian Hospitality',
        price: 1500,
        originalPrice: 2200,
        rating: 4.8,
        reviewsCount: 428,
        size: '240 sq. ft.',
        occupancy: '2 Adults + 1 Child',
        bed: 'Comfort King / Twin Bed',
        view: 'Civil Lines City Vista',
        image: '/images/hotel/room.jpg',
        gallery: [
            '/images/hotel/room.jpg',
            '/images/hotel/deluxe_room_interior.jpg',
            '/images/hotel/entrance.jpg'
        ],
        description: 'Impeccably designed for discerning business travelers and couples. Features plush orthopedic bedding, custom ambient warm lighting, high-speed Wi-Fi, and a spa-inspired ensuite bath with 24-hour hot water.',
        amenities: [
            'Climate Controlled Air Conditioning',
            'High-Speed Wi-Fi (100 Mbps)',
            '43" Smart LED TV with OTT Support',
            '24/7 In-Room Dining Service',
            'Ensuite Bath with Premium Toiletries',
            'Daily Housekeeping & Turndown',
            'Complimentary Mineral Water',
            'Direct Dial Intercom Concierge'
        ],
        highlights: ['Most Popular for Corporate Stays', 'Complimentary Morning Tea / Coffee', 'Zero Cancellation Fee (24h before)']
    },
    {
        id: 'executive',
        title: 'Executive Business Suite',
        subtitle: 'Elevated Luxury with Dedicated Work & Lounge Quarters',
        price: 1892,
        originalPrice: 2800,
        rating: 4.9,
        reviewsCount: 312,
        size: '340 sq. ft.',
        occupancy: '2-3 Adults',
        bed: 'Royal King Bed + Sofa Lounge',
        view: 'Garden & Boulevard View',
        image: '/images/hotel/executive_suite.jpg',
        gallery: [
            '/images/hotel/executive_suite.jpg',
            '/images/hotel/deluxe_room_interior.jpg',
            '/images/hotel/facade.jpg'
        ],
        description: 'Tailored for corporate leaders and families who appreciate generous space. Includes a dedicated ergonomic work station, plush leatherette seating lounge, electric tea/coffee maker, and express laundry privileges.',
        amenities: [
            'Spacious Dedicated Executive Desk',
            'Plush 3-Seater Sofa & Coffee Lounge',
            'Tea & Coffee Crafting Station',
            'Mini-Refrigerator Bar',
            '50" 4K Smart Android TV',
            'High-Speed Dedicated Wi-Fi Access',
            'Walk-in Wardrobe with Digital Safe',
            'Complimentary Executive Breakfast'
        ],
        highlights: ['VIP Express Check-in', 'Ideal for Long Business Stays', 'Priority Banquet Reservations']
    },
    {
        id: 'presidential',
        title: 'Royal Presidential Suite',
        subtitle: 'The Crown Jewel of Grandeur & Opulent Living',
        price: 2210,
        originalPrice: 3500,
        rating: 5.0,
        reviewsCount: 184,
        size: '480 sq. ft.',
        occupancy: 'Up to 4 Adults',
        bed: 'Master California King Bed',
        view: 'Panoramic Civil Lines Skyline',
        image: '/images/hotel/royal_presidential_suite.jpg',
        gallery: [
            '/images/hotel/royal_presidential_suite.jpg',
            '/images/hotel/gathering_reception.jpg',
            '/images/hotel/facade.jpg'
        ],
        description: 'An expansive master suite offering unmatched royal dignity. Features a distinct living parlor for receiving guests, a magnificent king bedroom, luxury marble bathroom with rain shower, and dedicated butler concierge assistance.',
        amenities: [
            'Separate Royal Living Room & Bedroom',
            'Private Dining & Reception Parlor',
            'Luxury Marble Ensuite with Rain Shower',
            'Complimentary Welcome Fruit & Sweet Basket',
            '55" Curved Smart Cinema TV',
            'Nespresso / Gourmet Tea Service',
            '24/7 Dedicated Butler Concierge',
            'Complimentary Lavish Buffet Breakfast'
        ],
        highlights: ['Favored by Wedding Couples & Dignitaries', 'Complimentary Airport / Station Pickup (On Request)', 'Finest Suite in Raebareli']
    }
];

const selectedRoom = ref<Room>(rooms[0]);
const showRoomModal = ref(false);
const showReservationModal = ref(false);

const openRoomDetails = (room: Room) => {
    selectedRoom.value = room;
    showRoomModal.value = true;
};

const initiateBooking = (room?: Room) => {
    if (room) {
        selectedRoom.value = room;
        bookingCategory.value = room.id;
    }
    showRoomModal.value = false;
    showReservationModal.value = true;
};

// Reservation Form Data
const guestName = ref('');
const guestPhone = ref('');
const guestEmail = ref('');
const guestSpecialRequests = ref('');

const reservationNights = computed(() => {
    const start = new Date(bookingCheckIn.value).getTime();
    const end = new Date(bookingCheckOut.value).getTime();
    const diff = Math.ceil((end - start) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
});

const activeBookingRoom = computed(() => {
    return rooms.find(r => r.id === bookingCategory.value) || rooms[0];
});

const estimatedStayTotal = computed(() => {
    return activeBookingRoom.value.price * reservationNights.value;
});

const generateWhatsAppBookingUrl = () => {
    const text = `*Luxury Stay Reservation Request - Hotel Pleasant View, Raebareli*
----------------------------------------
*Guest Name:* ${guestName.value || 'Valued Guest'}
*Contact:* ${guestPhone.value || 'Not provided'}
*Room Type:* ${activeBookingRoom.value.title} (₹${activeBookingRoom.value.price}/night)
*Check-in:* ${bookingCheckIn.value}
*Check-out:* ${bookingCheckOut.value} (${reservationNights.value} Night(s))
*Guests:* ${bookingGuests.value}
*Estimated Tariff:* ₹${estimatedStayTotal.value.toLocaleString('en-IN')} + applicable taxes
*Special Request:* ${guestSpecialRequests.value || 'None'}
----------------------------------------
Please confirm room availability and payment link. Thank you!`;
    return `https://wa.me/919794152222?text=${encodeURIComponent(text)}`;
};

// -------------------------------------------------------------
// Banquet Halls & Grand Events Showcase
// -------------------------------------------------------------
interface BanquetHall {
    id: string;
    name: string;
    tagline: string;
    capacity: string;
    area: string;
    features: string[];
    idealFor: string[];
    image: string;
}

const banquetHalls: BanquetHall[] = [
    {
        id: 'swarnim',
        name: 'Swarnim Grand Ballroom',
        tagline: 'The Ultimate Venue for Regal Weddings & Mega Receptions',
        capacity: '500 – 1,000+ Guests',
        area: '8,500 sq. ft. (Pillarless Grand Hall)',
        features: [
            'Magnificent Crystal Chandeliers & Programmable Dynamic Illumination',
            'Pillar-free unobstructed sightlines for grand bridal entry and stage',
            'Full acoustic insulation with JBL professional sound system',
            'Dedicated Royal Varmala stage with customizable floral installations',
            'Dedicated live catering buffets with Awadhi & Continental counters'
        ],
        idealFor: ['Grand Royal Weddings', 'Varmala & Sangeet Nights', 'High-Profile Political & Corporate Galas'],
        image: '/images/hotel/banquet_swarnim.jpg'
    },
    {
        id: 'swarnmahal',
        name: 'Swarn Mahal Banquet Hall',
        tagline: 'Exquisite Splendor for Intimate Ceremonies & Social Celebrations',
        capacity: '150 – 350 Guests',
        area: '4,200 sq. ft. Air-Conditioned Hall',
        features: [
            'Warm champagne gold aesthetic with plush banquet carpeting',
            'Customizable Mandap setup for Tilak, Sagai, and Ring Ceremonies',
            'Integrated high-definition multimedia presentation setup',
            'Attached pre-function reception foyer and VIP dressing suite',
            'Flawless pure vegetarian gourmet catering with live counters'
        ],
        idealFor: ['Engagement & Ring Ceremony', 'Tilak & Roka Celebrations', 'Silver Jubilee & Milestone Anniversaries'],
        image: '/images/hotel/banquet_swarnmahal.jpg'
    },
    {
        id: 'summit',
        name: 'The Imperial Boardroom & Meeting Suite',
        tagline: 'Sophisticated Venues for Corporate Conferences & Executive Dinners',
        capacity: '40 – 120 Delegates',
        area: '1,800 sq. ft. Executive Space',
        features: [
            'Motorized high-lumen digital projector and dual conferencing monitors',
            'High-fidelity boundary microphones and podium audio',
            'Ergonomic leather executive seating with flexible U-shape or theater layouts',
            'High-speed dedicated fiber Wi-Fi network for webinars',
            'Executive corporate high-tea and buffet lunch packages'
        ],
        idealFor: ['Annual Corporate General Meetings', 'Dealer & Distributor Meets', 'Medical & Industrial Seminars'],
        image: '/images/hotel/conference_meeting.jpg'
    }
];

const selectedBanquetTab = ref(banquetHalls[0].id);
const activeBanquet = computed(() => {
    return banquetHalls.find(b => b.id === selectedBanquetTab.value) || banquetHalls[0];
});

// -------------------------------------------------------------
// Interactive Banquet Quotation Simulator (Real-Time Budget Math)
// -------------------------------------------------------------
const calcEventType = ref('Wedding Reception');
const calcGuestCount = ref(350);
const calcMenuTier = ref<'royal' | 'imperial' | 'maharaja'>('imperial');
const calcIncludeDecor = ref(true);
const calcIncludeDj = ref(true);
const calcIncludeGenset = ref(true);

const menuPricing = {
    royal: { name: 'Royal Awadhi Feast', rate: 750, items: 'Welcome Drinks, 4 Starters, 2 Paneer, Dal Makhani, 2 Seasonal Veg, Biryani, Naan/Roti, 2 Desserts' },
    imperial: { name: 'Imperial Grand Buffet', rate: 950, items: 'Live Chaat Counter, 6 Starters, Shahi Paneer, Dal Bukhara, 3 Mains, Pulao, Bread Basket, 3 Desserts, Ice Cream' },
    maharaja: { name: 'Maharaja Gold Sovereign', rate: 1250, items: 'Mocktail Bar, 8 Starters, Paneer Lababdar, Dal Maharani, Kofta, Live Pasta/Dosa, Dry Fruit Pulao, 5 Desserts, Paan Stalls' }
};

const calcDecorCost = computed(() => calcIncludeDecor.value ? (calcGuestCount.value > 300 ? 35000 : 22000) : 0);
const calcDjCost = computed(() => calcIncludeDj.value ? 14000 : 0);
const calcGensetCost = computed(() => calcIncludeGenset.value ? 6000 : 0);
const calcFoodCost = computed(() => calcGuestCount.value * menuPricing[calcMenuTier.value].rate);
const calcHallRent = computed(() => calcGuestCount.value > 300 ? 50000 : 35000);

const calcSubtotal = computed(() => {
    return calcFoodCost.value + calcHallRent.value + calcDecorCost.value + calcDjCost.value + calcGensetCost.value;
});
const calcGst = computed(() => Math.round(calcSubtotal.value * 0.05)); // 5% composite catering
const calcGrandTotal = computed(() => calcSubtotal.value + calcGst.value);

const generateBanquetProposalWhatsApp = () => {
    const text = `*Grand Event / Banquet Proposal Request - Hotel Pleasant View*
----------------------------------------
*Event Type:* ${calcEventType.value}
*Guest Count:* ${calcGuestCount.value} Guests
*Hall Selected:* ${calcGuestCount.value > 300 ? 'Swarnim Grand Ballroom' : 'Swarn Mahal Banquet'}
*Menu Tier:* ${menuPricing[calcMenuTier.value].name} (₹${menuPricing[calcMenuTier.value].rate}/plate)
*Inclusions:* ${calcIncludeDecor.value ? 'Theme Decor, ' : ''}${calcIncludeDj.value ? 'DJ & Lighting, ' : ''}${calcIncludeGenset.value ? '100% Genset Backup' : ''}
*Estimated Investment:* ₹${calcGrandTotal.value.toLocaleString('en-IN')} (incl. taxes)
----------------------------------------
Kindly share dates availability and complete food tasting schedule.`;
    return `https://wa.me/919794152222?text=${encodeURIComponent(text)}`;
};

// -------------------------------------------------------------
// Filterable Photo Gallery & Fullscreen Lightbox
// -------------------------------------------------------------
interface GalleryItem {
    id: number;
    title: string;
    category: 'property' | 'rooms' | 'banquets' | 'gatherings';
    categoryLabel: string;
    image: string;
    caption: string;
    badge?: string;
}

const galleryItems: GalleryItem[] = [
    {
        id: 1,
        title: 'Grand Hotel Facade & Porte-Cochère',
        category: 'property',
        categoryLabel: 'Property & Facade',
        image: '/images/hotel/facade.jpg',
        caption: 'The majestic exterior of Hotel Pleasant View on Manika Cinema Road, Civil Lines, illuminated at dusk.',
        badge: 'Authentic On-Site'
    },
    {
        id: 2,
        title: 'Royal Glass Porte-Cochère & Main Entrance',
        category: 'property',
        categoryLabel: 'Property & Facade',
        image: '/images/hotel/entrance.jpg',
        caption: 'Welcoming royal portico with grand glass double doors and 24/7 valet concierge desk.',
        badge: 'Authentic On-Site'
    },
    {
        id: 3,
        title: 'Official Landmark Signboard',
        category: 'property',
        categoryLabel: 'Property & Facade',
        image: '/images/hotel/signboard.png',
        caption: 'Prominent luxury landmark situated 200m from Gol Chauraha, Civil Lines, Raebareli.',
        badge: 'Official Identity'
    },
    {
        id: 4,
        title: 'Deluxe Heritage Room Interior',
        category: 'rooms',
        categoryLabel: 'Rooms & Suites',
        image: '/images/hotel/room.jpg',
        caption: 'Authentic guest room featuring warm wood veneers, plush king bedding, and ambient reading illumination.',
        badge: 'Authentic Room'
    },
    {
        id: 5,
        title: 'Deluxe Room Suite Atmosphere',
        category: 'rooms',
        categoryLabel: 'Rooms & Suites',
        image: '/images/hotel/deluxe_room_interior.jpg',
        caption: 'Spacious guest sanctuary with modern air conditioning, flat screen TV, and crisp hotel linens.'
    },
    {
        id: 6,
        title: 'Executive Business Suite Lounge',
        category: 'rooms',
        categoryLabel: 'Rooms & Suites',
        image: '/images/hotel/executive_suite.jpg',
        caption: 'Generous suite with leatherette sofa seating, work desk, and private mini-bar console.'
    },
    {
        id: 7,
        title: 'Royal Presidential Master Suite',
        category: 'rooms',
        categoryLabel: 'Rooms & Suites',
        image: '/images/hotel/royal_presidential_suite.jpg',
        caption: 'Expansive private master suite designed for wedding couples, VIPs, and distinguished families.'
    },
    {
        id: 8,
        title: 'Swarnim Grand Ballroom - Banquet Setup',
        category: 'banquets',
        categoryLabel: 'Banquets & Weddings',
        image: '/images/hotel/banquet_swarnim.jpg',
        caption: 'Pillarless ballroom decorated for a royal wedding reception with crystal chandeliers and round-table seating.',
        badge: '1,000 Capacity'
    },
    {
        id: 9,
        title: 'Swarn Mahal Festive Banquet Setup',
        category: 'banquets',
        categoryLabel: 'Banquets & Weddings',
        image: '/images/hotel/banquet_swarnmahal.jpg',
        caption: 'Warm ambient banquet hall prepared with elegant table runners for an engagement celebration.'
    },
    {
        id: 10,
        title: 'Royal Stage Floral Illumination',
        category: 'banquets',
        categoryLabel: 'Banquets & Weddings',
        image: '/images/hotel/stage_decor.jpg',
        caption: 'Bespoke hand-crafted floral backdrop and golden thrones for the auspicious Varmala ceremony.'
    },
    {
        id: 11,
        title: 'Auspicious Wedding Mandap Decor',
        category: 'banquets',
        categoryLabel: 'Banquets & Weddings',
        image: '/images/hotel/mandap_ceremony.jpg',
        caption: 'Traditional red and gold floral mandap configured with sacred havan kund and ceremonial seating.'
    },
    {
        id: 12,
        title: 'Grand Wedding Gathering & Reception Gala',
        category: 'gatherings',
        categoryLabel: 'Gatherings & Dining',
        image: '/images/hotel/gathering_reception.jpg',
        caption: 'Vibrant wedding evening at Hotel Pleasant View hosting hundreds of joyful family guests in regal comfort.'
    },
    {
        id: 13,
        title: 'Royal Buffet Feast & Catering Spread',
        category: 'gatherings',
        categoryLabel: 'Gatherings & Dining',
        image: '/images/hotel/dining_buffet_gathering.jpg',
        caption: 'Lavish multi-cuisine food display featuring authentic Awadhi gravies, live tandoor, and dessert counters.'
    },
    {
        id: 14,
        title: 'Corporate Conference & Delegate Gathering',
        category: 'gatherings',
        categoryLabel: 'Gatherings & Dining',
        image: '/images/hotel/conference_meeting.jpg',
        caption: 'State-of-the-art conference setup hosting doctors and corporate executives with digital presentation screens.'
    }
];

const selectedGalleryFilter = ref<'all' | 'property' | 'rooms' | 'banquets' | 'gatherings'>('all');

const filteredGallery = computed(() => {
    if (selectedGalleryFilter.value === 'all') return galleryItems;
    return galleryItems.filter(item => item.category === selectedGalleryFilter.value);
});

// Lightbox state
const activeLightboxIndex = ref<number | null>(null);

const openLightbox = (index: number) => {
    activeLightboxIndex.value = index;
};

const closeLightbox = () => {
    activeLightboxIndex.value = null;
};

const nextLightbox = () => {
    if (activeLightboxIndex.value === null) return;
    activeLightboxIndex.value = (activeLightboxIndex.value + 1) % filteredGallery.value.length;
};

const prevLightbox = () => {
    if (activeLightboxIndex.value === null) return;
    activeLightboxIndex.value = (activeLightboxIndex.value - 1 + filteredGallery.value.length) % filteredGallery.value.length;
};

// -------------------------------------------------------------
// Verified Guest Reviews & Testimonials
// -------------------------------------------------------------
const testimonials = [
    {
        name: 'Rajeshwer Singh',
        role: 'Wedding Host (November Gala)',
        source: 'Justdial Verified',
        rating: 5,
        review: "We celebrated my daughter's wedding reception at the Swarnim Grand Ballroom. The management and staff went above and beyond. The food was sensational — guests are still talking about the Paneer Lababdar and Dal Makhani. The rooms were spotless for outstation guests.",
        date: '3 months ago'
    },
    {
        name: 'Dr. Amitav Shukla',
        role: 'Medical Conference Organizer',
        source: 'Google Review',
        rating: 5,
        review: 'Hotel Pleasant View is hands-down the premier venue in Raebareli. We hosted 120 doctors for an all-day symposium. Projector, audio, high-tea, and dinner were executed with 5-star precision. Ample valet parking made it effortless for attendees.',
        date: '1 month ago'
    },
    {
        name: 'Sunita & Deepak Verma',
        role: 'Family Vacation Stay',
        source: 'Goibibo Verified',
        rating: 4,
        review: 'Stayed in the Executive Suite during a family visit. Room was pristine, AC was ice-cold, and room service responded in 10 minutes. Located right in Civil Lines near Gol Chauraha, making shopping and traveling to the station extremely convenient.',
        date: '2 weeks ago'
    }
];

// Quick Contact Numbers
const hotelContacts = [
    { label: 'Front Desk & Reservations', number: '+91 9794152222', tel: 'tel:+919794152222' },
    { label: 'Banquet & Events Manager', number: '+91 9794152223', tel: 'tel:+919794152223' },
    { label: 'Corporate Desk & Concierge', number: '+91 9794152225', tel: 'tel:+919794152225' },
    { label: 'Guest Relations Hotline', number: '+91 9794152224', tel: 'tel:+919794152224' }
];
</script>

<template>
    <Head>
        <title>Hotel Pleasant View | Ultra-Luxury 5-Star Hotel & Grand Banquets | Raebareli</title>
        <meta name="description" content="Welcome to Hotel Pleasant View, Raebareli's premier luxury destination. Experience royal rooms, monumental 1000-guest wedding banquets, exquisite multi-cuisine dining, and unmatched Awadhi hospitality in Civil Lines." />
    </Head>

    <div class="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
        <!-- ========================================================= -->
        <!-- TOP LUXURY PRIVILEGE ANNOUNCEMENT BAR                    -->
        <!-- ========================================================= -->
        <div class="bg-gradient-to-r from-[#171309] via-[#2d2208] to-[#171309] border-b border-amber-500/20 py-2 px-4 text-xs font-medium text-amber-200/90 tracking-wide">
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
                <div class="flex items-center gap-2 flex-wrap justify-center">
                    <span class="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px]">
                        <Crown class="w-3 h-3 text-amber-400" /> Direct Privilege
                    </span>
                    <span>Book Direct for Complimentary Royal Breakfast & Guaranteed Best Tariff</span>
                </div>

                <div class="flex items-center gap-4 text-slate-300 text-xs">
                    <a href="tel:+919794152222" class="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors font-medium">
                        <Phone class="w-3.5 h-3.5 text-amber-400" />
                        <span>24x7 Concierge: +91 9794152222</span>
                    </a>
                    <span class="hidden md:inline text-slate-600">|</span>
                    <Link href="/login" class="hidden md:inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors">
                        <span>Staff / ERP Portal</span>
                        <ChevronRight class="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- PRIMARY REGAL NAVIGATION BAR                             -->
        <!-- ========================================================= -->
        <header class="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-amber-500/15 transition-all">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <!-- Brand Logo & Royal Crest -->
                <a href="#" @click.prevent="scrollToSection('home')" class="flex items-center gap-3.5 group">
                    <div class="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-[1px] shadow-lg shadow-amber-500/10">
                        <div class="w-full h-full bg-[#0d121c] rounded-[7px] flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                            <Crown class="w-6 h-6 text-amber-400" />
                        </div>
                    </div>
                    <div class="text-left">
                        <div class="text-lg md:text-xl font-serif font-bold tracking-[0.18em] text-white group-hover:text-amber-300 transition-colors leading-tight">
                            HOTEL PLEASANT VIEW
                        </div>
                        <div class="text-[10px] tracking-[0.25em] font-semibold text-amber-400/80 uppercase">
                            Raebareli • Est. Excellence
                        </div>
                    </div>
                </a>

                <!-- Desktop Links -->
                <nav class="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <button @click="scrollToSection('rooms')" class="hover:text-amber-400 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-400">
                        Rooms & Suites
                    </button>
                    <button @click="scrollToSection('banquets')" class="hover:text-amber-400 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-400">
                        Banquets & Weddings
                    </button>
                    <button @click="scrollToSection('gatherings')" class="hover:text-amber-400 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-400">
                        Gatherings
                    </button>
                    <button @click="scrollToSection('dining')" class="hover:text-amber-400 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-400">
                        Catering & Dining
                    </button>
                    <button @click="scrollToSection('gallery')" class="hover:text-amber-400 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-400">
                        Gallery
                    </button>
                    <button @click="scrollToSection('location')" class="hover:text-amber-400 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-400">
                        Location
                    </button>
                </nav>

                <!-- Action CTA Buttons -->
                <div class="hidden sm:flex items-center gap-3">
                    <button @click="scrollToSection('banquets')" class="px-4 py-2.5 rounded-md border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 transition-colors text-xs font-bold uppercase tracking-wider">
                        Plan An Event
                    </button>
                    <button @click="initiateBooking()" class="px-5 py-2.5 rounded-md bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all">
                        Book Stay
                    </button>
                </div>

                <!-- Mobile Menu Button -->
                <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden p-2 rounded-md border border-slate-700 text-slate-300 hover:text-white" aria-label="Toggle menu">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Mobile Drawer -->
            <div v-if="mobileMenuOpen" class="lg:hidden bg-[#0a0e17] border-b border-amber-500/20 px-6 py-6 space-y-4">
                <div class="flex flex-col space-y-3 text-sm font-semibold uppercase tracking-wider text-slate-200">
                    <button @click="scrollToSection('rooms')" class="text-left py-2 hover:text-amber-400 border-b border-slate-800">Rooms & Suites</button>
                    <button @click="scrollToSection('banquets')" class="text-left py-2 hover:text-amber-400 border-b border-slate-800">Banquets & Weddings</button>
                    <button @click="scrollToSection('gatherings')" class="text-left py-2 hover:text-amber-400 border-b border-slate-800">Gatherings & Events</button>
                    <button @click="scrollToSection('dining')" class="text-left py-2 hover:text-amber-400 border-b border-slate-800">Catering & Dining</button>
                    <button @click="scrollToSection('gallery')" class="text-left py-2 hover:text-amber-400 border-b border-slate-800">Photo Gallery</button>
                    <button @click="scrollToSection('location')" class="text-left py-2 hover:text-amber-400 border-b border-slate-800">Location & Contact</button>
                    <Link href="/login" class="text-left py-2 text-amber-400 hover:text-amber-300">Staff ERP Login &rarr;</Link>
                </div>
                <div class="pt-2 flex flex-col gap-3">
                    <button @click="initiateBooking()" class="w-full py-3 text-center bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold uppercase tracking-wider rounded-md text-xs">
                        Reserve A Room
                    </button>
                    <a href="tel:+919794152222" class="w-full py-3 text-center border border-amber-500/40 text-amber-300 font-bold uppercase tracking-wider rounded-md text-xs flex items-center justify-center gap-2">
                        <Phone class="w-4 h-4" /> Call Front Desk
                    </a>
                </div>
            </div>
        </header>

        <main>
            <!-- ========================================================= -->
            <!-- HERO SECTION: THE PINNACLE OF ROYAL HOSPITALITY           -->
            <!-- ========================================================= -->
            <section id="home" class="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
                <!-- Hero High-Res Background with Subtle Pan & Zoom -->
                <div class="absolute inset-0 z-0">
                    <img
                        src="/images/hotel/facade.jpg"
                        alt="Hotel Pleasant View Luxury Facade Raebareli"
                        class="w-full h-full object-cover object-center brightness-[0.40] scale-105 transform animate-subtle-zoom"
                    />
                    <!-- Vignette Gradients -->
                    <div class="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/80"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-[#07090e]/80 via-transparent to-[#07090e]/80"></div>
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)]"></div>
                </div>

                <!-- Hero Content Container -->
                <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 text-center">
                    <!-- Rating / Heritage Crest -->
                    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111723]/90 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-6 shadow-xl backdrop-blur-md">
                        <Crown class="w-3.5 h-3.5 text-amber-400" />
                        <span>The Premier 5-Star Hospitality Experience in Raebareli</span>
                        <div class="flex items-center gap-0.5 text-amber-400 ml-1">
                            <Star v-for="n in 5" :key="n" class="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                    </div>

                    <!-- Main Headline -->
                    <h1 class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-6">
                        Where Timeless Grandeur Meets
                        <span class="block mt-2 bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 bg-clip-text text-transparent italic font-serif">
                            Regal Indian Hospitality
                        </span>
                    </h1>

                    <!-- Subtitle -->
                    <p class="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-10">
                        Nestled in the prime heart of Civil Lines, Hotel Pleasant View delivers supreme luxury accommodations, monumental pillarless wedding ballrooms, and legendary Awadhi gastronomic feasts.
                    </p>

                    <!-- Trust Strip Highlights -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-12 text-left">
                        <div class="p-3.5 rounded-lg bg-[#0d121c]/80 border border-amber-500/20 backdrop-blur-sm">
                            <div class="text-amber-400 font-bold text-xl">4.0 ★</div>
                            <div class="text-xs text-slate-400 mt-0.5">1,000+ Verified Reviews</div>
                        </div>
                        <div class="p-3.5 rounded-lg bg-[#0d121c]/80 border border-amber-500/20 backdrop-blur-sm">
                            <div class="text-amber-400 font-bold text-xl">1,000+</div>
                            <div class="text-xs text-slate-400 mt-0.5">Banquet Guest Capacity</div>
                        </div>
                        <div class="p-3.5 rounded-lg bg-[#0d121c]/80 border border-amber-500/20 backdrop-blur-sm">
                            <div class="text-amber-400 font-bold text-xl">2.3 KM</div>
                            <div class="text-xs text-slate-400 mt-0.5">From Raebareli Jn Station</div>
                        </div>
                        <div class="p-3.5 rounded-lg bg-[#0d121c]/80 border border-amber-500/20 backdrop-blur-sm">
                            <div class="text-amber-400 font-bold text-xl">24x7</div>
                            <div class="text-xs text-slate-400 mt-0.5">Royal Concierge & Valet</div>
                        </div>
                    </div>

                    <!-- Floating Interactive Booking Widget -->
                    <div class="bg-[#0f1522]/95 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl max-w-4xl mx-auto text-left">
                        <div class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                            <Sparkles class="w-4 h-4 text-amber-400" />
                            <span>Quick Reservation & Tariff Estimator</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <!-- Check In -->
                            <div>
                                <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Check-in Date</label>
                                <div class="relative">
                                    <input
                                        v-model="bookingCheckIn"
                                        type="date"
                                        class="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <!-- Check Out -->
                            <div>
                                <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Check-out Date</label>
                                <div class="relative">
                                    <input
                                        v-model="bookingCheckOut"
                                        type="date"
                                        class="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <!-- Category Selection -->
                            <div>
                                <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Room / Event Type</label>
                                <select
                                    v-model="bookingCategory"
                                    class="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                                >
                                    <option value="deluxe">Deluxe Heritage (₹1,500/nt)</option>
                                    <option value="executive">Executive Suite (₹1,892/nt)</option>
                                    <option value="presidential">Royal Presidential (₹2,210/nt)</option>
                                </select>
                            </div>

                            <!-- Guests & CTA -->
                            <div class="flex flex-col justify-end">
                                <button
                                    @click="initiateBooking()"
                                    class="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 h-[42px]"
                                >
                                    <span>Check & Book</span>
                                    <ArrowRight class="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <!-- Subtext Guarantee -->
                        <div class="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
                            <div class="flex items-center gap-2">
                                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
                                <span>Best Price Guaranteed • Free Cancellation 24h Before • No Hidden Fees</span>
                            </div>
                            <span class="hidden sm:inline text-amber-300 font-medium">Instant WhatsApp Confirmation</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- THE HERITAGE & PROPERTY (REAL ON-SITE PHOTOS)             -->
            <!-- ========================================================= -->
            <section class="py-24 bg-[#0a0d14] relative border-t border-amber-500/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <!-- Left Story -->
                        <div class="lg:col-span-6 space-y-6 text-left">
                            <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
                                <Sparkles class="w-4 h-4" />
                                <span>A Sanctuary of Distinction</span>
                            </div>

                            <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                                Raebareli’s Most Revered Address for
                                <span class="text-amber-400 italic font-serif">Luxury & Grand Celebrations</span>
                            </h2>

                            <p class="text-slate-300 leading-relaxed text-sm sm:text-base font-light">
                                Situated on Manika Cinema Road in Gandhi Nagar, Civil Lines, <strong class="text-white font-medium">Hotel Pleasant View</strong> has set the gold standard for hospitality in Raebareli. Designed with royal neoclassical elements and state-of-the-art conveniences, we cater to distinguished business delegates, holidaying families, and prestigious wedding celebrations.
                            </p>

                            <p class="text-slate-400 leading-relaxed text-sm">
                                Located just 2.3 km from Raebareli Junction Railway Station and a stone’s throw from Gol Chauraha, our guests enjoy seamless connectivity while residing in an oasis of tranquility, 24/7 security, and peerless service.
                            </p>

                            <!-- Feature Badges -->
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                                <div class="p-3 rounded-lg bg-[#111723] border border-amber-500/20">
                                    <ShieldCheck class="w-5 h-5 text-amber-400 mb-1" />
                                    <div class="text-xs font-bold text-white">24/7 Concierge</div>
                                    <div class="text-[11px] text-slate-400">Round-the-clock room dining</div>
                                </div>
                                <div class="p-3 rounded-lg bg-[#111723] border border-amber-500/20">
                                    <Car class="w-5 h-5 text-amber-400 mb-1" />
                                    <div class="text-xs font-bold text-white">Valet Parking</div>
                                    <div class="text-[11px] text-slate-400">Secure on-premises parking</div>
                                </div>
                                <div class="p-3 rounded-lg bg-[#111723] border border-amber-500/20">
                                    <Utensils class="w-5 h-5 text-amber-400 mb-1" />
                                    <div class="text-xs font-bold text-white">Pure Delicacies</div>
                                    <div class="text-[11px] text-slate-400">Authentic Awadhi cooking</div>
                                </div>
                            </div>

                            <div class="pt-2 flex items-center gap-4">
                                <button @click="scrollToSection('rooms')" class="px-6 py-3 rounded-md bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all">
                                    Explore Suites
                                </button>
                                <a href="tel:+919794152222" class="px-6 py-3 rounded-md border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider hover:text-amber-400 hover:border-amber-400 transition-colors">
                                    Call Reception
                                </a>
                            </div>
                        </div>

                        <!-- Right Photo Collage (Authentic Property Visuals) -->
                        <div class="lg:col-span-6 relative">
                            <div class="grid grid-cols-2 gap-4">
                                <!-- Real Hotel Entrance Photo -->
                                <div class="space-y-4">
                                    <div class="relative rounded-xl overflow-hidden border border-amber-500/30 group shadow-2xl">
                                        <img
                                            src="/images/hotel/entrance.jpg"
                                            alt="Hotel Pleasant View Real Portico Entrance"
                                            class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div class="absolute bottom-3 left-3 right-3 text-left">
                                            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider mb-1">
                                                Authentic View
                                            </span>
                                            <div class="text-xs font-semibold text-white">Grand Entrance Portico</div>
                                        </div>
                                    </div>

                                    <div class="relative rounded-xl overflow-hidden border border-amber-500/30 group shadow-2xl">
                                        <img
                                            src="/images/hotel/room.jpg"
                                            alt="Hotel Pleasant View Real Guest Room"
                                            class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div class="absolute bottom-3 left-3 right-3 text-left">
                                            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider mb-1">
                                                Authentic Room
                                            </span>
                                            <div class="text-xs font-semibold text-white">Deluxe King Bedroom</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Real Facade & Signboard Photo -->
                                <div class="space-y-4 pt-6">
                                    <div class="relative rounded-xl overflow-hidden border border-amber-500/30 group shadow-2xl">
                                        <img
                                            src="/images/hotel/facade.jpg"
                                            alt="Hotel Pleasant View Real Multi-story Facade"
                                            class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div class="absolute bottom-3 left-3 right-3 text-left">
                                            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider mb-1">
                                                Civil Lines
                                            </span>
                                            <div class="text-xs font-semibold text-white">Main Building Facade</div>
                                        </div>
                                    </div>

                                    <div class="relative rounded-xl overflow-hidden border border-amber-500/30 group shadow-2xl">
                                        <img
                                            src="/images/hotel/banquet_swarnim.jpg"
                                            alt="Hotel Pleasant View Grand Banquet Hall"
                                            class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div class="absolute bottom-3 left-3 right-3 text-left">
                                            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider mb-1">
                                                Banquet
                                            </span>
                                            <div class="text-xs font-semibold text-white">Swarnim Ballroom</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Decorative Stamp -->
                            <div class="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 bg-[#111723] border border-amber-500/40 rounded-full px-5 py-3 shadow-2xl">
                                <Award class="w-8 h-8 text-amber-400" />
                                <div class="text-left">
                                    <div class="text-xs font-bold text-white">Award of Excellence</div>
                                    <div class="text-[10px] text-slate-400">Best Hospitality in Raebareli</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- ROOMS & SUITES COLLECTION                                -->
            <!-- ========================================================= -->
            <section id="rooms" class="py-24 bg-[#07090e] relative border-t border-amber-500/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <!-- Section Header -->
                    <div class="text-center max-w-3xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                            <BedDouble class="w-4 h-4" />
                            <span>Accommodations of Pure Serenity</span>
                        </div>
                        <h2 class="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
                            Rooms & Sovereign Suites
                        </h2>
                        <p class="text-slate-400 text-sm sm:text-base font-light">
                            Each sanctuary at Hotel Pleasant View is thoughtfully appointed with bespoke wooden furnishings, orthopedic comfort mattresses, high-speed fiber internet, and attentive around-the-clock service.
                        </p>
                    </div>

                    <!-- Room Cards Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div
                            v-for="room in rooms"
                            :key="room.id"
                            class="group rounded-2xl bg-[#0d121c] border border-amber-500/20 hover:border-amber-500/50 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <!-- Room Image Container -->
                                <div class="relative h-64 overflow-hidden">
                                    <img
                                        :src="room.image"
                                        :alt="room.title"
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div class="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-black/40"></div>

                                    <!-- Price Badge -->
                                    <div class="absolute top-4 right-4 bg-[#07090e]/90 border border-amber-500/40 rounded-lg px-3 py-1.5 text-right backdrop-blur-md">
                                        <div class="text-xs text-slate-400 line-through">₹{{ room.originalPrice }}</div>
                                        <div class="text-base font-bold text-amber-400">
                                            ₹{{ room.price }}<span class="text-[10px] text-slate-300 font-normal"> / night</span>
                                        </div>
                                    </div>

                                    <!-- Rating -->
                                    <div class="absolute top-4 left-4 bg-amber-500/90 text-black font-bold text-xs px-2.5 py-1 rounded flex items-center gap-1 shadow-md">
                                        <Star class="w-3.5 h-3.5 fill-black text-black" />
                                        <span>{{ room.rating }}</span>
                                    </div>

                                    <div class="absolute bottom-3 left-4 right-4 text-left">
                                        <h3 class="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                                            {{ room.title }}
                                        </h3>
                                        <p class="text-xs text-amber-200/80">{{ room.subtitle }}</p>
                                    </div>
                                </div>

                                <!-- Specs Strip -->
                                <div class="grid grid-cols-3 gap-2 px-6 py-3 bg-[#111723] border-y border-slate-800 text-[11px] text-slate-300 text-center">
                                    <div>
                                        <span class="text-slate-400 block text-[10px]">Area</span>
                                        <span class="font-semibold text-white">{{ room.size }}</span>
                                    </div>
                                    <div class="border-x border-slate-800">
                                        <span class="text-slate-400 block text-[10px]">Occupancy</span>
                                        <span class="font-semibold text-white">{{ room.occupancy }}</span>
                                    </div>
                                    <div>
                                        <span class="text-slate-400 block text-[10px]">Bed Type</span>
                                        <span class="font-semibold text-white">King Bed</span>
                                    </div>
                                </div>

                                <!-- Amenities Summary -->
                                <div class="p-6 text-left space-y-4">
                                    <p class="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                        {{ room.description }}
                                    </p>

                                    <!-- Key Amenities List -->
                                    <div class="space-y-1.5 pt-1">
                                        <div v-for="(am, idx) in room.amenities.slice(0, 4)" :key="idx" class="flex items-center gap-2 text-xs text-slate-300">
                                            <Check class="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span>{{ am }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Footer CTAs -->
                            <div class="px-6 pb-6 pt-2 flex items-center gap-3">
                                <button
                                    @click="openRoomDetails(room)"
                                    class="w-1/2 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-amber-500/50 text-xs font-semibold uppercase tracking-wider transition-colors"
                                >
                                    View Details
                                </button>
                                <button
                                    @click="initiateBooking(room)"
                                    class="w-1/2 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- GRAND BANQUETS, WEDDINGS & CELEBRATIONS                  -->
            <!-- ========================================================= -->
            <section id="banquets" class="py-24 bg-[#0a0e17] relative border-t border-amber-500/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <!-- Section Header -->
                    <div class="text-center max-w-3xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                            <Crown class="w-4 h-4" />
                            <span>Monumental Wedding & Event Spaces</span>
                        </div>
                        <h2 class="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
                            Grand Banquets & Royal Celebrations
                        </h2>
                        <p class="text-slate-400 text-sm sm:text-base font-light">
                            From lavish fairy-tale weddings and monumental receptions of 1,000+ guests to intimate sagai and corporate seminars, Hotel Pleasant View offers Raebareli's finest pillarless banquet venues.
                        </p>
                    </div>

                    <!-- Banquet Tab Selector -->
                    <div class="flex flex-wrap items-center justify-center gap-3 mb-12">
                        <button
                            v-for="hall in banquetHalls"
                            :key="hall.id"
                            @click="selectedBanquetTab = hall.id"
                            :class="[
                                'px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2',
                                selectedBanquetTab === hall.id
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'bg-[#111723] text-slate-300 border border-slate-800 hover:border-amber-500/40'
                            ]"
                        >
                            <Sparkles class="w-3.5 h-3.5" />
                            <span>{{ hall.name }}</span>
                        </button>
                    </div>

                    <!-- Active Banquet Detailed Showcase Card -->
                    <div class="rounded-3xl bg-[#0d121c] border-2 border-amber-500/30 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 mb-16">
                        <!-- Image Side -->
                        <div class="lg:col-span-7 relative min-h-[380px] lg:min-h-[500px]">
                            <img
                                :src="activeBanquet.image"
                                :alt="activeBanquet.name"
                                class="w-full h-full object-cover"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-black/30"></div>

                            <div class="absolute bottom-6 left-6 right-6 text-left">
                                <span class="inline-block px-3 py-1 rounded bg-amber-500 text-black font-bold text-xs uppercase tracking-wider mb-2">
                                    {{ activeBanquet.capacity }}
                                </span>
                                <h3 class="text-2xl sm:text-3xl font-serif font-bold text-white">
                                    {{ activeBanquet.name }}
                                </h3>
                                <p class="text-sm text-amber-200/90 font-light mt-1">{{ activeBanquet.tagline }}</p>
                            </div>
                        </div>

                        <!-- Info & Specifications Side -->
                        <div class="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between text-left space-y-6">
                            <div class="space-y-6">
                                <div>
                                    <div class="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">Venue Dimension & Layout</div>
                                    <div class="text-lg font-bold text-white">{{ activeBanquet.area }}</div>
                                </div>

                                <!-- Key Features -->
                                <div>
                                    <div class="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">Hall Specifications & Amenities</div>
                                    <div class="space-y-2.5">
                                        <div v-for="(feat, idx) in activeBanquet.features" :key="idx" class="flex items-start gap-2.5 text-xs text-slate-300">
                                            <CheckCircle2 class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                            <span>{{ feat }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Ideal For Tags -->
                                <div>
                                    <div class="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Recommended Celebrations</div>
                                    <div class="flex flex-wrap gap-2">
                                        <span v-for="(event, idx) in activeBanquet.idealFor" :key="idx" class="px-3 py-1 rounded-full bg-[#161f30] text-amber-300 border border-amber-500/20 text-xs">
                                            {{ event }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Action CTAs -->
                            <div class="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                                <a
                                    :href="generateBanquetProposalWhatsApp()"
                                    target="_blank"
                                    class="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider text-center hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle class="w-4 h-4" />
                                    <span>Inquire Dates via WhatsApp</span>
                                </a>
                                <a
                                    href="tel:+919794152223"
                                    class="w-full sm:w-auto px-5 py-3 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2"
                                >
                                    <Phone class="w-4 h-4 text-amber-400" />
                                    <span>Call Banquet Desk</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- ===================================================== -->
                    <!-- INTERACTIVE BANQUET BUDGET & QUOTATION SIMULATOR     -->
                    <!-- ===================================================== -->
                    <div class="rounded-2xl bg-[#0f1420] border border-amber-500/30 p-6 sm:p-10 text-left shadow-2xl">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
                            <div>
                                <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                                    <SlidersHorizontal class="w-4 h-4" />
                                    <span>Instant Event Budget Planner</span>
                                </div>
                                <h3 class="text-2xl font-serif font-bold text-white">
                                    Simulate Your Banquet Investment
                                </h3>
                                <p class="text-xs sm:text-sm text-slate-400">
                                    Adjust guest count, menu tier, and decor selections to receive an instant, transparent price estimate for your upcoming celebration.
                                </p>
                            </div>

                            <div class="text-right shrink-0 bg-[#161f30] px-5 py-3 rounded-xl border border-amber-500/20">
                                <span class="text-[11px] uppercase tracking-wider text-slate-400 block">Estimated Total (Taxes incl.)</span>
                                <span class="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">₹{{ calcGrandTotal.toLocaleString('en-IN') }}</span>
                            </div>
                        </div>

                        <!-- Simulator Controls Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <!-- Column 1: Event Type & Guest Slider -->
                            <div class="space-y-6">
                                <div>
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Occasion Type</label>
                                    <select
                                        v-model="calcEventType"
                                        class="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                                    >
                                        <option>Wedding Reception</option>
                                        <option>Varmala & Sangeet Night</option>
                                        <option>Tilak & Engagement Ceremony</option>
                                        <option>Anniversary Celebration</option>
                                        <option>Corporate Annual Convention</option>
                                        <option>Birthday Gala</option>
                                    </select>
                                </div>

                                <div>
                                    <div class="flex justify-between items-center mb-2">
                                        <label class="text-xs font-semibold uppercase tracking-wider text-slate-300">Expected Guests</label>
                                        <span class="text-sm font-bold text-amber-400 font-mono">{{ calcGuestCount }} Guests</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="1000"
                                        step="25"
                                        v-model.number="calcGuestCount"
                                        class="w-full accent-amber-500 cursor-pointer"
                                    />
                                    <div class="flex justify-between text-[10px] text-slate-500 mt-1">
                                        <span>50 Guests</span>
                                        <span>350 Guests</span>
                                        <span>700 Guests</span>
                                        <span>1000+ Guests</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Column 2: Royal Menu Tiers -->
                            <div class="space-y-3">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Catering Feast Tier</label>

                                <div
                                    @click="calcMenuTier = 'royal'"
                                    :class="[
                                        'p-3.5 rounded-xl border cursor-pointer transition-all',
                                        calcMenuTier === 'royal'
                                            ? 'bg-amber-500/10 border-amber-400 text-white'
                                            : 'bg-[#161f30] border-slate-800 text-slate-300 hover:border-slate-700'
                                    ]"
                                >
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs font-bold text-amber-300">Royal Awadhi Feast</span>
                                        <span class="text-xs font-bold font-mono">₹750 / plate</span>
                                    </div>
                                    <p class="text-[11px] text-slate-400 mt-1 line-clamp-1">Welcome Drinks, 4 Starters, 2 Paneer, Dal Makhani, 2 Desserts</p>
                                </div>

                                <div
                                    @click="calcMenuTier = 'imperial'"
                                    :class="[
                                        'p-3.5 rounded-xl border cursor-pointer transition-all',
                                        calcMenuTier === 'imperial'
                                            ? 'bg-amber-500/10 border-amber-400 text-white'
                                            : 'bg-[#161f30] border-slate-800 text-slate-300 hover:border-slate-700'
                                    ]"
                                >
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs font-bold text-amber-300">Imperial Grand Buffet</span>
                                        <span class="text-xs font-bold font-mono">₹950 / plate</span>
                                    </div>
                                    <p class="text-[11px] text-slate-400 mt-1 line-clamp-1">Live Chaat, 6 Starters, Shahi Paneer, Dal Bukhara, 3 Desserts</p>
                                </div>

                                <div
                                    @click="calcMenuTier = 'maharaja'"
                                    :class="[
                                        'p-3.5 rounded-xl border cursor-pointer transition-all',
                                        calcMenuTier === 'maharaja'
                                            ? 'bg-amber-500/10 border-amber-400 text-white'
                                            : 'bg-[#161f30] border-slate-800 text-slate-300 hover:border-slate-700'
                                    ]"
                                >
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs font-bold text-amber-300">Maharaja Gold Sovereign</span>
                                        <span class="text-xs font-bold font-mono">₹1,250 / plate</span>
                                    </div>
                                    <p class="text-[11px] text-slate-400 mt-1 line-clamp-1">Mocktail Bar, 8 Starters, Live Counters, Dry Fruit Pulao, 5 Desserts</p>
                                </div>
                            </div>

                            <!-- Column 3: Event Addons & Summary Breakdown -->
                            <div class="space-y-4 bg-[#141b2b] p-4 rounded-xl border border-slate-800">
                                <div class="text-xs font-semibold uppercase tracking-wider text-slate-300">Signature Event Enhancements</div>

                                <label class="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                                    <input type="checkbox" v-model="calcIncludeDecor" class="w-4 h-4 accent-amber-500 rounded" />
                                    <span>Theme Stage & Mandap Floral Decor</span>
                                </label>

                                <label class="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                                    <input type="checkbox" v-model="calcIncludeDj" class="w-4 h-4 accent-amber-500 rounded" />
                                    <span>Professional Sound & Moving-Head DJ</span>
                                </label>

                                <label class="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                                    <input type="checkbox" v-model="calcIncludeGenset" class="w-4 h-4 accent-amber-500 rounded" />
                                    <span>100% Uninterrupted Power Backup Genset</span>
                                </label>

                                <!-- Subtotal Breakdown List -->
                                <div class="border-t border-slate-700/60 pt-3 space-y-1.5 text-xs text-slate-400">
                                    <div class="flex justify-between">
                                        <span>Hall Venue Rental:</span>
                                        <span class="text-white font-mono">₹{{ calcHallRent.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Gourmet Food ({{ calcGuestCount }} plates):</span>
                                        <span class="text-white font-mono">₹{{ calcFoodCost.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>GST (5% composite catering):</span>
                                        <span class="text-white font-mono">₹{{ calcGst.toLocaleString('en-IN') }}</span>
                                    </div>
                                </div>

                                <a
                                    :href="generateBanquetProposalWhatsApp()"
                                    target="_blank"
                                    class="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider text-center block hover:brightness-110 shadow-md"
                                >
                                    Lock This Quotation via WhatsApp &rarr;
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- GATHERINGS & REAL CELEBRATION MOMENTS                     -->
            <!-- ========================================================= -->
            <section id="gatherings" class="py-24 bg-[#07090e] relative border-t border-amber-500/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center max-w-3xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                            <Users class="w-4 h-4" />
                            <span>Cherished Moments at Pleasant View</span>
                        </div>
                        <h2 class="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
                            Joyous Gatherings & Milestones
                        </h2>
                        <p class="text-slate-400 text-sm sm:text-base font-light">
                            Witness authentic celebrations hosted at Hotel Pleasant View — from glittering wedding receptions with hundreds of joyful guests to corporate conventions and intimate family rituals.
                        </p>
                    </div>

                    <!-- Celebrations 3-Column Visual Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <!-- Gathering 1: Wedding Reception -->
                        <div class="rounded-2xl bg-[#0d121c] border border-amber-500/20 overflow-hidden shadow-xl group">
                            <div class="relative h-64 overflow-hidden">
                                <img
                                    src="/images/hotel/gathering_reception.jpg"
                                    alt="Grand Wedding Gathering Reception at Hotel Pleasant View"
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-transparent"></div>
                                <span class="absolute top-4 left-4 px-3 py-1 rounded bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider">
                                    Wedding Reception
                                </span>
                            </div>
                            <div class="p-6">
                                <h3 class="text-lg font-serif font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                                    The Grand Wedding Evening
                                </h3>
                                <p class="text-xs text-slate-400 leading-relaxed">
                                    Hundreds of honored family members and distinguished guests enjoying royal hospitality, central air-conditioning, and seamless dinner coordination.
                                </p>
                            </div>
                        </div>

                        <!-- Gathering 2: Sacred Mandap & Ceremony -->
                        <div class="rounded-2xl bg-[#0d121c] border border-amber-500/20 overflow-hidden shadow-xl group">
                            <div class="relative h-64 overflow-hidden">
                                <img
                                    src="/images/hotel/mandap_ceremony.jpg"
                                    alt="Wedding Mandap and Sacred Rituals at Pleasant View"
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-transparent"></div>
                                <span class="absolute top-4 left-4 px-3 py-1 rounded bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider">
                                    Sacred Mandap
                                </span>
                            </div>
                            <div class="p-6">
                                <h3 class="text-lg font-serif font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                                    Auspicious Wedding Rituals
                                </h3>
                                <p class="text-xs text-slate-400 leading-relaxed">
                                    Bespoke fresh floral arrangements and traditional mandap architecture designed for sacred vows, varmala exchanges, and timeless photography.
                                </p>
                            </div>
                        </div>

                        <!-- Gathering 3: Corporate Seminar -->
                        <div class="rounded-2xl bg-[#0d121c] border border-amber-500/20 overflow-hidden shadow-xl group">
                            <div class="relative h-64 overflow-hidden">
                                <img
                                    src="/images/hotel/conference_meeting.jpg"
                                    alt="Executive Conference and Corporate Summit"
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-transparent"></div>
                                <span class="absolute top-4 left-4 px-3 py-1 rounded bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider">
                                    Corporate Summit
                                </span>
                            </div>
                            <div class="p-6">
                                <h3 class="text-lg font-serif font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                                    Conferences & Seminars
                                </h3>
                                <p class="text-xs text-slate-400 leading-relaxed">
                                    Equipped with high-definition digital projection, wireless audio systems, and high-tea buffets favored by state-level corporate delegations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- CULINARY EXCELLENCE & ROYAL AWADHI GASTRONOMY             -->
            <!-- ========================================================= -->
            <section id="dining" class="py-24 bg-[#0a0d14] relative border-t border-amber-500/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <!-- Left Visual Buffet -->
                        <div class="lg:col-span-6 relative">
                            <div class="rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl relative">
                                <img
                                    src="/images/hotel/dining_buffet_gathering.jpg"
                                    alt="Lavish Royal Buffet Dining at Hotel Pleasant View"
                                    class="w-full h-[420px] object-cover"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div class="absolute bottom-6 left-6 right-6 text-left">
                                    <span class="inline-block px-3 py-1 rounded bg-amber-500 text-black font-bold text-xs uppercase tracking-wider mb-2">
                                        Pure & Hygienic
                                    </span>
                                    <div class="text-2xl font-serif font-bold text-white">The Royal Banquet Buffet</div>
                                    <p class="text-xs text-slate-300 mt-1">Multi-course gourmet feasts prepared by master chefs from Awadh and North India.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Right Culinary Story -->
                        <div class="lg:col-span-6 space-y-6 text-left">
                            <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
                                <Utensils class="w-4 h-4" />
                                <span>The Culinary Legacy</span>
                            </div>

                            <h2 class="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
                                An Odyssey of
                                <span class="text-amber-400 italic font-serif">Awadhi & Multi-Cuisine</span>
                                Flavors
                            </h2>

                            <p class="text-slate-300 leading-relaxed text-sm sm:text-base font-light">
                                Dining at Hotel Pleasant View is a tribute to the legendary culinary traditions of Awadh combined with contemporary Pan-Asian and Continental favorites. Our culinary brigade prepares every delicacy in state-of-the-art hygienic commercial kitchens with cold-pressed oils, pure desi ghee, and hand-ground spices.
                            </p>

                            <!-- Culinary Highlights -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div class="p-4 rounded-xl bg-[#111723] border border-amber-500/20">
                                    <div class="text-sm font-bold text-amber-300 mb-1">Authentic Awadhi & Mughlai</div>
                                    <p class="text-xs text-slate-400">Signature Dum Biryani, Paneer Lababdar, Dal Makhani slow-cooked overnight for rich aroma.</p>
                                </div>
                                <div class="p-4 rounded-xl bg-[#111723] border border-amber-500/20">
                                    <div class="text-sm font-bold text-amber-300 mb-1">Live Interactive Counters</div>
                                    <p class="text-xs text-slate-400">Delhi Chaat Street, Charcoal Tandoor breads, Artisan Dosas, and Handcrafted Desserts.</p>
                                </div>
                                <div class="p-4 rounded-xl bg-[#111723] border border-amber-500/20">
                                    <div class="text-sm font-bold text-amber-300 mb-1">Strict Hygiene Protocols</div>
                                    <p class="text-xs text-slate-400">100% RO Purified water, stainless steel food-grade prep stations, and pristine dining ware.</p>
                                </div>
                                <div class="p-4 rounded-xl bg-[#111723] border border-amber-500/20">
                                    <div class="text-sm font-bold text-amber-300 mb-1">24/7 In-Room Dining</div>
                                    <p class="text-xs text-slate-400">Prompt, hot room service delivering piping delicacies to your suite day and night.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- FILTERABLE PHOTO GALLERY WITH FULLSCREEN LIGHTBOX         -->
            <!-- ========================================================= -->
            <section id="gallery" class="py-24 bg-[#07090e] relative border-t border-amber-500/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center max-w-3xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                            <Camera class="w-4 h-4" />
                            <span>Visual Treasury of Grandeur</span>
                        </div>
                        <h2 class="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
                            The Hotel Pleasant View Gallery
                        </h2>
                        <p class="text-slate-400 text-sm sm:text-base font-light">
                            Explore authentic on-site photographs of our iconic facade, luxurious guest rooms, grand banquet halls, and vibrant gatherings.
                        </p>
                    </div>

                    <!-- Category Filters -->
                    <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
                        <button
                            @click="selectedGalleryFilter = 'all'"
                            :class="[
                                'px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'all'
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'bg-[#111723] text-slate-300 border border-slate-800 hover:border-amber-500/40'
                            ]"
                        >
                            All Photographs ({{ galleryItems.length }})
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'property'"
                            :class="[
                                'px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'property'
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'bg-[#111723] text-slate-300 border border-slate-800 hover:border-amber-500/40'
                            ]"
                        >
                            Property & Facade
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'rooms'"
                            :class="[
                                'px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'rooms'
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'bg-[#111723] text-slate-300 border border-slate-800 hover:border-amber-500/40'
                            ]"
                        >
                            Rooms & Suites
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'banquets'"
                            :class="[
                                'px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'banquets'
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'bg-[#111723] text-slate-300 border border-slate-800 hover:border-amber-500/40'
                            ]"
                        >
                            Banquets & Weddings
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'gatherings'"
                            :class="[
                                'px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'gatherings'
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'bg-[#111723] text-slate-300 border border-slate-800 hover:border-amber-500/40'
                            ]"
                        >
                            Gatherings & Dinners
                        </button>
                    </div>

                    <!-- Gallery Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div
                            v-for="(item, idx) in filteredGallery"
                            :key="item.id"
                            @click="openLightbox(idx)"
                            class="group relative rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-400 bg-[#0d121c] cursor-pointer shadow-xl transition-all duration-300 h-64"
                        >
                            <img
                                :src="item.image"
                                :alt="item.title"
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-black/30 group-hover:via-black/20 transition-all"></div>

                            <!-- Optional Authentic Badge -->
                            <div v-if="item.badge" class="absolute top-3 left-3 px-2.5 py-1 rounded bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider shadow">
                                {{ item.badge }}
                            </div>

                            <!-- Expand Icon -->
                            <div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 class="w-4 h-4" />
                            </div>

                            <!-- Title & Caption -->
                            <div class="absolute bottom-4 left-4 right-4 text-left">
                                <div class="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-0.5">
                                    {{ item.categoryLabel }}
                                </div>
                                <div class="text-base font-serif font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                                    {{ item.title }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- VERIFIED GUEST REVIEWS & REPUTATION                       -->
            <!-- ========================================================= -->
            <section class="py-24 bg-[#0a0d14] relative border-t border-amber-500/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center max-w-3xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                            <Star class="w-4 h-4 fill-amber-400" />
                            <span>Unrivaled Guest Esteem</span>
                        </div>
                        <h2 class="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
                            Verified Guest Experiences
                        </h2>
                        <p class="text-slate-400 text-sm sm:text-base font-light">
                            Over 1,000 verified patron reviews across Justdial, Google, and major travel portals celebrate our unwavering commitment to genuine hospitality.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div
                            v-for="(t, idx) in testimonials"
                            :key="idx"
                            class="rounded-2xl bg-[#0d121c] border border-amber-500/20 p-8 flex flex-col justify-between text-left shadow-xl hover:border-amber-500/40 transition-colors"
                        >
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1 text-amber-400">
                                        <Star v-for="n in t.rating" :key="n" class="w-4 h-4 fill-amber-400 text-amber-400" />
                                    </div>
                                    <span class="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                        {{ t.source }}
                                    </span>
                                </div>
                                <p class="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                                    “{{ t.review }}”
                                </p>
                            </div>

                            <div class="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                                <div>
                                    <div class="text-sm font-bold text-white">{{ t.name }}</div>
                                    <div class="text-xs text-amber-400/80">{{ t.role }}</div>
                                </div>
                                <span class="text-[11px] text-slate-500">{{ t.date }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- LOCATION, LANDMARK & DIRECT DIAL HOTLINE                  -->
            <!-- ========================================================= -->
            <section id="location" class="py-24 bg-[#07090e] relative border-t border-amber-500/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <!-- Location Info -->
                        <div class="lg:col-span-6 space-y-6 text-left">
                            <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
                                <MapPin class="w-4 h-4" />
                                <span>Prime Civil Lines District</span>
                            </div>

                            <h2 class="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
                                Located at the Very Heart of
                                <span class="text-amber-400 italic font-serif">Raebareli</span>
                            </h2>

                            <p class="text-slate-300 leading-relaxed text-sm sm:text-base font-light">
                                Hotel Pleasant View enjoys the most coveted postal address in town — located in Civil Lines, within effortless reach of the railway junction, administrative offices, and shopping hubs.
                            </p>

                            <!-- Address Box -->
                            <div class="p-6 rounded-2xl bg-[#0f1420] border-2 border-amber-500/30 space-y-3">
                                <div class="text-xs font-bold uppercase tracking-wider text-amber-400">Postal Address</div>
                                <div class="text-white text-base font-semibold">
                                    Hotel Pleasant View
                                </div>
                                <p class="text-slate-300 text-xs leading-relaxed">
                                    Manika Cinema Road, Gandhi Nagar, Near Gol Chauraha, Civil Lines, Raebareli, Uttar Pradesh – 229001
                                </p>
                                <div class="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                                    <span class="px-2.5 py-1 rounded bg-[#161f30] border border-slate-800">GSTIN: 09AAAAA0000A1Z5</span>
                                    <span class="px-2.5 py-1 rounded bg-[#161f30] border border-slate-800">PIN: 229001</span>
                                    <span class="px-2.5 py-1 rounded bg-[#161f30] border border-slate-800">Dist: Raebareli, UP</span>
                                </div>
                            </div>

                            <!-- Proximity Badges -->
                            <div class="grid grid-cols-2 gap-3 pt-2">
                                <div class="p-3 rounded-lg bg-[#111723] border border-slate-800">
                                    <div class="text-amber-400 font-bold text-sm">2.3 KM</div>
                                    <div class="text-xs text-slate-400">Raebareli Jn Railway Station (~6 mins)</div>
                                </div>
                                <div class="p-3 rounded-lg bg-[#111723] border border-slate-800">
                                    <div class="text-amber-400 font-bold text-sm">200 Meters</div>
                                    <div class="text-xs text-slate-400">Gol Chauraha & Civil Lines Market</div>
                                </div>
                                <div class="p-3 rounded-lg bg-[#111723] border border-slate-800">
                                    <div class="text-amber-400 font-bold text-sm">1.5 KM</div>
                                    <div class="text-xs text-slate-400">District Court & Govt Collectorate</div>
                                </div>
                                <div class="p-3 rounded-lg bg-[#111723] border border-slate-800">
                                    <div class="text-amber-400 font-bold text-sm">78 KM</div>
                                    <div class="text-xs text-slate-400">Lucknow Airport (CCSI Airport)</div>
                                </div>
                            </div>
                        </div>

                        <!-- Direct Dial Concierge Desk Grid -->
                        <div class="lg:col-span-6 space-y-4">
                            <div class="text-left mb-6">
                                <div class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Direct Helpdesk & Inquiries</div>
                                <h3 class="text-2xl font-serif font-bold text-white">24-Hour Telephone Directory</h3>
                                <p class="text-xs text-slate-400">Touch any number below to connect directly with our front desk managers.</p>
                            </div>

                            <div
                                v-for="(c, idx) in hotelContacts"
                                :key="idx"
                                class="p-5 rounded-xl bg-[#0f1420] border border-amber-500/20 hover:border-amber-400 transition-all flex items-center justify-between text-left group"
                            >
                                <div class="space-y-1">
                                    <div class="text-xs text-slate-400 uppercase tracking-wider">{{ c.label }}</div>
                                    <div class="text-lg font-bold text-white group-hover:text-amber-300 transition-colors font-mono">
                                        {{ c.number }}
                                    </div>
                                </div>

                                <a
                                    :href="c.tel"
                                    class="p-3 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-all"
                                    aria-label="Call this number"
                                >
                                    <Phone class="w-5 h-5" />
                                </a>
                            </div>

                            <!-- WhatsApp Direct Assist -->
                            <a
                                href="https://wa.me/919794152222?text=Hello%20Hotel%20Pleasant%20View,%20I%20would%20like%20to%20inquire%20about%20a%20booking"
                                target="_blank"
                                class="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-emerald-600/20"
                            >
                                <MessageCircle class="w-5 h-5" />
                                <span>Chat Instantly on WhatsApp (+91 9794152222)</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- ========================================================= -->
        <!-- REGAL FOOTER WITH HERITAGE LOGO & STATUTORY DETAILS       -->
        <!-- ========================================================= -->
        <footer class="bg-[#05070a] border-t border-amber-500/20 pt-16 pb-12 text-left">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
                    <!-- Col 1: Brand & Bio -->
                    <div class="lg:col-span-2 space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 p-[1px]">
                                <div class="w-full h-full bg-[#0d121c] rounded-[7px] flex items-center justify-center text-amber-400">
                                    <Crown class="w-5 h-5 text-amber-400" />
                                </div>
                            </div>
                            <div>
                                <div class="text-lg font-serif font-bold tracking-wider text-white">HOTEL PLEASANT VIEW</div>
                                <div class="text-[10px] tracking-[0.2em] font-semibold text-amber-400/80 uppercase">Raebareli, Uttar Pradesh</div>
                            </div>
                        </div>

                        <p class="text-xs text-slate-400 leading-relaxed max-w-sm">
                            Raebareli’s leading 5-star standard hotel offering luxurious suites, grand marriage ballrooms for up to 1,000 guests, and legendary Awadhi hospitality.
                        </p>

                        <div class="text-xs text-slate-400 space-y-1">
                            <div><strong class="text-slate-300">GSTIN:</strong> 09AAAAA0000A1Z5</div>
                            <div><strong class="text-slate-300">Check-in:</strong> 12:00 PM | <strong class="text-slate-300">Check-out:</strong> 11:00 AM</div>
                        </div>
                    </div>

                    <!-- Col 2: Accommodations -->
                    <div class="space-y-3">
                        <div class="text-xs font-bold uppercase tracking-wider text-amber-400">Suites & Rooms</div>
                        <ul class="space-y-2 text-xs text-slate-400">
                            <li><button @click="initiateBooking(rooms[0])" class="hover:text-amber-300 transition-colors">Deluxe Heritage Room</button></li>
                            <li><button @click="initiateBooking(rooms[1])" class="hover:text-amber-300 transition-colors">Executive Business Suite</button></li>
                            <li><button @click="initiateBooking(rooms[2])" class="hover:text-amber-300 transition-colors">Royal Presidential Suite</button></li>
                            <li><button @click="scrollToSection('rooms')" class="hover:text-amber-300 transition-colors">Room Amenities & Tariffs</button></li>
                        </ul>
                    </div>

                    <!-- Col 3: Grand Events -->
                    <div class="space-y-3">
                        <div class="text-xs font-bold uppercase tracking-wider text-amber-400">Banquets & Venues</div>
                        <ul class="space-y-2 text-xs text-slate-400">
                            <li><button @click="scrollToSection('banquets')" class="hover:text-amber-300 transition-colors">Swarnim Grand Ballroom (1000+)</button></li>
                            <li><button @click="scrollToSection('banquets')" class="hover:text-amber-300 transition-colors">Swarn Mahal Banquet (350)</button></li>
                            <li><button @click="scrollToSection('banquets')" class="hover:text-amber-300 transition-colors">The Imperial Boardroom</button></li>
                            <li><button @click="scrollToSection('banquets')" class="hover:text-amber-300 transition-colors">Banquet Budget Calculator</button></li>
                        </ul>
                    </div>

                    <!-- Col 4: Portals & Helpdesk -->
                    <div class="space-y-3">
                        <div class="text-xs font-bold uppercase tracking-wider text-amber-400">Hotel Governance</div>
                        <ul class="space-y-2 text-xs text-slate-400">
                            <li><Link href="/login" class="text-amber-300 hover:text-amber-200 font-semibold">Staff ERP Portal &rarr;</Link></li>
                            <li><a href="tel:+919794152222" class="hover:text-amber-300 transition-colors">+91 9794152222 (Desk 1)</a></li>
                            <li><a href="tel:+919794152223" class="hover:text-amber-300 transition-colors">+91 9794152223 (Desk 2)</a></li>
                            <li><a href="tel:+919794152225" class="hover:text-amber-300 transition-colors">+91 9794152225 (Events)</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Bottom Copyright -->
                <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                    <div>
                        © {{ new Date().getFullYear() }} Hotel Pleasant View, Raebareli. All Rights Reserved.
                    </div>
                    <div class="flex items-center gap-4">
                        <span>Civil Lines, Gandhi Nagar, Raebareli (UP)</span>
                        <span>•</span>
                        <Link href="/login" class="text-slate-400 hover:text-white">ERP Access</Link>
                    </div>
                </div>
            </div>
        </footer>

        <!-- ========================================================= -->
        <!-- MODAL 1: ROOM DETAILS MODAL                               -->
        <!-- ========================================================= -->
        <div v-if="showRoomModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div class="bg-[#0e1420] border-2 border-amber-500/40 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative text-left max-h-[90vh] flex flex-col justify-between">
                <div>
                    <!-- Modal Header Image -->
                    <div class="relative h-56">
                        <img :src="selectedRoom.image" :alt="selectedRoom.title" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-gradient-to-t from-[#0e1420] via-transparent to-black/40"></div>
                        <button @click="showRoomModal = false" class="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black">
                            <X class="w-5 h-5" />
                        </button>
                        <div class="absolute bottom-4 left-6">
                            <h3 class="text-2xl font-serif font-bold text-white">{{ selectedRoom.title }}</h3>
                            <p class="text-xs text-amber-300">{{ selectedRoom.subtitle }}</p>
                        </div>
                    </div>

                    <!-- Modal Body -->
                    <div class="p-6 overflow-y-auto space-y-4 max-h-[45vh]">
                        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div>
                                <span class="text-xs text-slate-400">Tariff per night:</span>
                                <div class="text-xl font-bold text-amber-400">₹{{ selectedRoom.price }} <span class="text-xs text-slate-400 font-normal">+ taxes</span></div>
                            </div>
                            <div class="text-right text-xs text-slate-300">
                                <div><strong>Area:</strong> {{ selectedRoom.size }}</div>
                                <div><strong>Occupancy:</strong> {{ selectedRoom.occupancy }}</div>
                            </div>
                        </div>

                        <p class="text-xs text-slate-300 leading-relaxed">{{ selectedRoom.description }}</p>

                        <div>
                            <div class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Room Amenities</div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div v-for="(am, idx) in selectedRoom.amenities" :key="idx" class="flex items-center gap-2 text-xs text-slate-300">
                                    <Check class="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>{{ am }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Actions -->
                <div class="p-4 bg-[#0a0e17] border-t border-slate-800 flex items-center justify-end gap-3">
                    <button @click="showRoomModal = false" class="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold uppercase">Close</button>
                    <button @click="initiateBooking(selectedRoom)" class="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110">
                        Proceed to Reservation
                    </button>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- MODAL 2: DIRECT RESERVATION MODAL                         -->
        <!-- ========================================================= -->
        <div v-if="showReservationModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div class="bg-[#0e1420] border-2 border-amber-500/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative text-left">
                <div class="p-6 bg-gradient-to-r from-[#171309] to-[#251d08] border-b border-amber-500/30 flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-serif font-bold text-white">Direct Room Reservation</h3>
                        <p class="text-xs text-amber-300">Instant confirmation via official WhatsApp concierge</p>
                    </div>
                    <button @click="showReservationModal = false" class="p-2 rounded-full bg-black/40 text-slate-300 hover:text-white">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <!-- Selected Room Banner -->
                    <div class="p-3.5 rounded-xl bg-[#141b2a] border border-amber-500/20 flex items-center justify-between">
                        <div>
                            <div class="text-xs text-slate-400">Selected Category:</div>
                            <div class="text-sm font-bold text-amber-300">{{ activeBookingRoom.title }}</div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-slate-400">Tariff / Night</span>
                            <div class="text-sm font-bold text-white">₹{{ activeBookingRoom.price }}</div>
                        </div>
                    </div>

                    <!-- Stay Dates & Guests -->
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Check-in</label>
                            <input v-model="bookingCheckIn" type="date" class="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Check-out</label>
                            <input v-model="bookingCheckOut" type="date" class="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
                        </div>
                    </div>

                    <!-- Guest Details -->
                    <div class="space-y-3">
                        <div>
                            <label class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Guest Full Name</label>
                            <input v-model="guestName" type="text" placeholder="e.g. Ramesh Chandra" class="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" />
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Mobile Contact / WhatsApp</label>
                            <input v-model="guestPhone" type="tel" placeholder="+91 98XXXXXXXX" class="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" />
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Special Preferences (Optional)</label>
                            <input v-model="guestSpecialRequests" type="text" placeholder="Early check-in, extra bed, etc." class="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" />
                        </div>
                    </div>

                    <!-- Total Calculation -->
                    <div class="p-3 rounded-lg bg-[#111723] border border-slate-800 flex items-center justify-between text-xs">
                        <span class="text-slate-400">{{ reservationNights }} Night(s) Stay Total:</span>
                        <span class="text-base font-bold text-amber-400 font-mono">₹{{ estimatedStayTotal.toLocaleString('en-IN') }}</span>
                    </div>

                    <!-- WhatsApp CTA -->
                    <a
                        :href="generateWhatsAppBookingUrl()"
                        target="_blank"
                        class="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-emerald-600/20"
                    >
                        <MessageCircle class="w-4 h-4" />
                        <span>Send Booking to Front Desk WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- MODAL 3: FULLSCREEN PHOTO LIGHTBOX                        -->
        <!-- ========================================================= -->
        <div v-if="activeLightboxIndex !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4">
            <button @click="closeLightbox()" class="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 z-50">
                <X class="w-6 h-6" />
            </button>

            <button @click="prevLightbox()" class="absolute left-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 z-50">
                <ChevronLeft class="w-6 h-6" />
            </button>

            <button @click="nextLightbox()" class="absolute right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 z-50">
                <ChevronRight class="w-6 h-6" />
            </button>

            <div class="max-w-5xl max-h-[85vh] flex flex-col items-center">
                <img
                    :src="filteredGallery[activeLightboxIndex].image"
                    :alt="filteredGallery[activeLightboxIndex].title"
                    class="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
                />
                <div class="mt-4 text-center">
                    <span class="inline-block px-3 py-1 rounded bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider mb-1">
                        {{ filteredGallery[activeLightboxIndex].categoryLabel }}
                    </span>
                    <h4 class="text-lg font-serif font-bold text-white">{{ filteredGallery[activeLightboxIndex].title }}</h4>
                    <p class="text-xs text-slate-300 max-w-xl mx-auto mt-1">{{ filteredGallery[activeLightboxIndex].caption }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes subtle-zoom {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.04);
    }
    100% {
        transform: scale(1);
    }
}

.animate-subtle-zoom {
    animation: subtle-zoom 20s infinite ease-in-out;
}
</style>
