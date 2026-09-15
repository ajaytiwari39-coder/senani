<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
    Camera,
    Play,
    Video
} from '@lucide/vue';

// -------------------------------------------------------------
// Navigation & Mobile Menu State
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
// Luxury Hero Slider State & Performance Preloading
// -------------------------------------------------------------
interface HeroSlide {
    id: number;
    title: string;
    highlight: string;
    subtitle: string;
    image: string;
    badge: string;
    youtubeId?: string;
}

const heroSlides: HeroSlide[] = [
    {
        id: 1,
        title: 'An Address of Distinction &',
        highlight: 'Timeless Indian Hospitality',
        subtitle: 'Immerse yourself in refined accommodations, monumentally scaled wedding ballrooms, and legendary Awadhi culinary heritage in the heart of Civil Lines.',
        image: '/images/hotel/gmb_assets/mmt_hotel_facade.jpg',
        badge: 'Civil Lines, Raebareli • Uttar Pradesh'
    },
    {
        id: 2,
        title: 'Swarnim Grand Ballroom',
        highlight: '1,000+ Guest Capacity',
        subtitle: "Raebareli's premier pillarless marriage ballroom featuring crystal chandeliers, grand bridal entry stage, and gourmet Awadhi catering.",
        image: '/images/hotel/gmb_assets/mmt_banquet_hall.jpg',
        badge: 'Swarnim Ballroom Gala • Verified Setup'
    },
    {
        id: 3,
        title: 'Executive Quarters & Suites',
        highlight: 'Sanctuary of Peace & Solitude',
        subtitle: 'Spacious guest rooms with plush orthopedic bedding, ice-cold air conditioning, 24/7 hot water, and tranquil city vistas.',
        image: '/images/hotel/gmb_assets/ibibo_room_interior.jpg',
        badge: 'Verified Executive Suite'
    },
    {
        id: 4,
        title: 'Fairytale Wedding Celebrations',
        highlight: 'Watch Live Event Video',
        subtitle: 'Experience authentic royal wedding celebrations filmed live at Swarnim Grand Ballroom.',
        image: '/images/hotel/gmb_assets/fairytale_wedding_thumb.jpg',
        badge: 'Live Wedding Gala • Click to Watch',
        youtubeId: 'qHiHWSd8UVI'
    },
    {
        id: 5,
        title: 'Regal Porte-Cochère & Entrance',
        highlight: '24/7 Valet Concierge',
        subtitle: 'Conveniently located 200m from Gol Chauraha on Manika Cinema Road with ample valet parking.',
        image: '/images/hotel/gmb_assets/trip_hotel_view.jpg',
        badge: '200m from Gol Chauraha'
    }
];

const currentHeroSlide = ref(0);
let heroSlideTimer: any = null;

const nextHeroSlide = () => {
    currentHeroSlide.value = (currentHeroSlide.value + 1) % heroSlides.length;
};

const prevHeroSlide = () => {
    currentHeroSlide.value = (currentHeroSlide.value - 1 + heroSlides.length) % heroSlides.length;
};

const goToHeroSlide = (idx: number) => {
    currentHeroSlide.value = idx;
};

const startHeroSlideTimer = () => {
    stopHeroSlideTimer();
    heroSlideTimer = setInterval(() => {
        nextHeroSlide();
    }, 6000);
};

const stopHeroSlideTimer = () => {
    if (heroSlideTimer) clearInterval(heroSlideTimer);
};

onMounted(() => {
    startHeroSlideTimer();
});

onUnmounted(() => {
    stopHeroSlideTimer();
});

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
        image: '/images/hotel/gmb_assets/ibibo_room_interior.jpg',
        gallery: [
            '/images/hotel/gmb_assets/ibibo_room_interior.jpg',
            '/images/hotel/gmb_assets/budget_couple_hotel_thumb.jpg',
            '/images/hotel/gmb_assets/trip_hotel_view.jpg'
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
        image: '/images/hotel/gmb_assets/budget_couple_hotel_thumb.jpg',
        gallery: [
            '/images/hotel/gmb_assets/budget_couple_hotel_thumb.jpg',
            '/images/hotel/gmb_assets/ibibo_room_interior.jpg',
            '/images/hotel/gmb_assets/mmt_hotel_facade.jpg'
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
        image: '/images/hotel/gmb_assets/pleasant_view_tour_thumb.jpg',
        gallery: [
            '/images/hotel/gmb_assets/pleasant_view_tour_thumb.jpg',
            '/images/hotel/gmb_assets/mmt_banquet_hall.jpg',
            '/images/hotel/gmb_assets/mmt_hotel_facade.jpg'
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
            'Magnificent Crystal Chandeliers & Programmable Warm Illumination',
            'Pillar-free unobstructed sightlines for grand bridal entry and stage',
            'Full acoustic insulation with JBL professional sound system',
            'Dedicated Royal Varmala stage with customizable floral installations',
            'Dedicated live catering buffets with Awadhi & Continental counters'
        ],
        idealFor: ['Grand Royal Weddings', 'Varmala & Sangeet Nights', 'High-Profile Corporate Galas'],
        image: '/images/hotel/gmb_assets/mmt_banquet_hall.jpg'
    },
    {
        id: 'swarnmahal',
        name: 'Swarn Mahal Banquet Hall',
        tagline: 'Exquisite Splendor for Intimate Ceremonies & Social Celebrations',
        capacity: '150 – 350 Guests',
        area: '4,200 sq. ft. Air-Conditioned Hall',
        features: [
            'Warm champagne and brushed bronze aesthetic with plush banquet carpeting',
            'Customizable Mandap setup for Tilak, Sagai, and Ring Ceremonies',
            'Integrated high-definition multimedia presentation setup',
            'Attached pre-function reception foyer and VIP dressing suite',
            'Flawless pure vegetarian gourmet catering with live counters'
        ],
        idealFor: ['Engagement & Ring Ceremony', 'Tilak & Roka Celebrations', 'Silver Jubilee & Anniversaries'],
        image: '/images/hotel/gmb_assets/engagement_promo_thumb.jpg'
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
        image: '/images/hotel/gmb_assets/mmt_hotel_facade.jpg'
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
    maharaja: { name: 'Maharaja Sovereign Feast', rate: 1250, items: 'Mocktail Bar, 8 Starters, Paneer Lababdar, Dal Maharani, Kofta, Live Pasta/Dosa, Dry Fruit Pulao, 5 Desserts, Paan Stalls' }
};

const calcDecorCost = computed(() => calcIncludeDecor.value ? (calcGuestCount.value > 300 ? 35000 : 22000) : 0);
const calcDjCost = computed(() => calcIncludeDj.value ? 14000 : 0);
const calcGensetCost = computed(() => calcIncludeGenset.value ? 6000 : 0);
const calcFoodCost = computed(() => calcGuestCount.value * menuPricing[calcMenuTier.value].rate);
const calcHallRent = computed(() => calcGuestCount.value > 300 ? 50000 : 35000);

const calcSubtotal = computed(() => {
    return calcFoodCost.value + calcHallRent.value + calcDecorCost.value + calcDjCost.value + calcGensetCost.value;
});
const calcGst = computed(() => Math.round(calcSubtotal.value * 0.05));
const calcGrandTotal = computed(() => calcSubtotal.value + calcGst.value);

const generateBanquetProposalWhatsApp = () => {
    const text = "*Grand Event / Banquet Proposal Request - Hotel Pleasant View*\n" +
        "----------------------------------------\n" +
        `*Event Type:* ${calcEventType.value}\n` +
        `*Guest Count:* ${calcGuestCount.value} Guests\n` +
        `*Hall Selected:* ${calcGuestCount.value > 300 ? 'Swarnim Grand Ballroom' : 'Swarn Mahal Banquet'}\n` +
        `*Menu Tier:* ${menuPricing[calcMenuTier.value].name} (₹${menuPricing[calcMenuTier.value].rate}/plate)\n` +
        `*Inclusions:* ${calcIncludeDecor.value ? 'Theme Decor, ' : ''}${calcIncludeDj.value ? 'DJ & Lighting, ' : ''}${calcIncludeGenset.value ? '100% Genset Backup' : ''}\n` +
        `*Estimated Investment:* ₹${calcGrandTotal.value.toLocaleString('en-IN')} (incl. taxes)\n` +
        "----------------------------------------\n" +
        "Kindly share dates availability and complete food tasting schedule.";
    return `https://wa.me/919794152222?text=${encodeURIComponent(text)}`;
};

// -------------------------------------------------------------
// Filterable Photo Gallery & Fullscreen Lightbox
// -------------------------------------------------------------
interface GalleryItem {
    id: number;
    title: string;
    category: 'property' | 'rooms' | 'banquets' | 'gatherings' | 'google_media' | 'videos';
    categoryLabel: string;
    image: string;
    caption: string;
    badge?: string;
    youtubeId?: string;
}

const galleryItems: GalleryItem[] = [
    {
        id: 1,
        title: 'Grand Hotel Facade & Porte-Cochère',
        category: 'property',
        categoryLabel: 'Property & Facade',
        image: '/images/hotel/gmb_assets/mmt_hotel_facade.jpg',
        caption: 'The majestic exterior of Hotel Pleasant View on Manika Cinema Road, Civil Lines, illuminated at dusk.',
        badge: 'Authentic Property'
    },
    {
        id: 2,
        title: 'Glass Double-Door Portico Entrance',
        category: 'property',
        categoryLabel: 'Property & Facade',
        image: '/images/hotel/gmb_assets/trip_hotel_view.jpg',
        caption: 'Welcoming porte-cochère portico with grand glass double doors and 24/7 valet concierge desk.',
        badge: 'Authentic Entrance'
    },
    {
        id: 3,
        title: 'Official Landmark Signboard',
        category: 'property',
        categoryLabel: 'Property & Facade',
        image: '/images/hotel/signboard.png',
        caption: 'Prominent luxury landmark situated 200m from Gol Chauraha, Civil Lines, Raebareli.',
        badge: 'Official Sign'
    },
    {
        id: 4,
        title: 'Deluxe Heritage Room Interior',
        category: 'rooms',
        categoryLabel: 'Rooms & Suites',
        image: '/images/hotel/gmb_assets/ibibo_room_interior.jpg',
        caption: 'Authentic guest room featuring warm wood veneers, plush king bedding, and ambient reading illumination.',
        badge: 'Authentic Room'
    },
    {
        id: 5,
        title: 'Deluxe Room Suite Atmosphere',
        category: 'rooms',
        categoryLabel: 'Rooms & Suites',
        image: '/images/hotel/gmb_assets/budget_couple_hotel_thumb.jpg',
        caption: 'Spacious guest sanctuary with modern air conditioning, flat screen TV, and crisp hotel linens.'
    },
    {
        id: 6,
        title: 'Executive Business Suite Lounge',
        category: 'rooms',
        categoryLabel: 'Rooms & Suites',
        image: '/images/hotel/gmb_assets/ibibo_room_interior.jpg',
        caption: 'Generous suite with leatherette sofa seating, work desk, and private mini-bar console.'
    },
    {
        id: 7,
        title: 'Royal Presidential Master Suite',
        category: 'rooms',
        categoryLabel: 'Rooms & Suites',
        image: '/images/hotel/gmb_assets/pleasant_view_tour_thumb.jpg',
        caption: 'Expansive private master suite designed for wedding couples, VIPs, and distinguished families.'
    },
    {
        id: 8,
        title: 'Swarnim Grand Ballroom - Banquet Setup',
        category: 'banquets',
        categoryLabel: 'Banquets & Weddings',
        image: '/images/hotel/gmb_assets/mmt_banquet_hall.jpg',
        caption: 'Pillarless ballroom decorated for a royal wedding reception with crystal chandeliers and round-table seating.',
        badge: '1,000 Capacity'
    },
    {
        id: 9,
        title: 'Swarn Mahal Festive Banquet Setup',
        category: 'banquets',
        categoryLabel: 'Banquets & Weddings',
        image: '/images/hotel/gmb_assets/engagement_promo_thumb.jpg',
        caption: 'Warm ambient banquet hall prepared with elegant table runners for an engagement celebration.'
    },
    {
        id: 10,
        title: 'Royal Stage Floral Illumination',
        category: 'banquets',
        categoryLabel: 'Banquets & Weddings',
        image: '/images/hotel/gmb_assets/fairytale_wedding_thumb.jpg',
        caption: 'Bespoke hand-crafted floral backdrop and golden thrones for the auspicious Varmala ceremony.'
    },
    {
        id: 11,
        title: 'Auspicious Wedding Mandap Decor',
        category: 'banquets',
        categoryLabel: 'Banquets & Weddings',
        image: '/images/hotel/gmb_assets/wedding_trailer_thumb.jpg',
        caption: 'Traditional red and gold floral mandap configured with sacred havan kund and ceremonial seating.'
    },
    {
        id: 12,
        title: 'Grand Wedding Gathering & Reception Gala',
        category: 'gatherings',
        categoryLabel: 'Gatherings & Dining',
        image: '/images/hotel/gmb_assets/fairytale_wedding_thumb.jpg',
        caption: 'Vibrant wedding evening at Hotel Pleasant View hosting hundreds of joyful family guests in regal comfort.'
    },
    {
        id: 13,
        title: 'Royal Buffet Feast & Catering Spread',
        category: 'gatherings',
        categoryLabel: 'Gatherings & Dining',
        image: '/images/hotel/gmb_assets/mmt_banquet_hall.jpg',
        caption: 'Lavish multi-cuisine food display featuring authentic Awadhi gravies, live tandoor, and dessert counters.'
    },
    {
        id: 14,
        title: 'Corporate Conference & Delegate Gathering',
        category: 'gatherings',
        categoryLabel: 'Gatherings & Dining',
        image: '/images/hotel/gmb_assets/mmt_hotel_facade.jpg',
        caption: 'State-of-the-art conference setup hosting doctors and corporate executives with digital presentation screens.'
    },
    {
        id: 15,
        title: 'Hotel Facade & Illumination (Google Verified)',
        category: 'google_media',
        categoryLabel: 'Google & Portal Verified',
        image: '/images/hotel/gmb_assets/mmt_hotel_facade.jpg',
        caption: 'Verified Google Business facade showing the hotel exterior and parking driveway on Manika Cinema Road.',
        badge: 'Google Business'
    },
    {
        id: 16,
        title: 'Swarnim Grand Ballroom Gala (MakeMyTrip Verified)',
        category: 'google_media',
        categoryLabel: 'Google & Portal Verified',
        image: '/images/hotel/gmb_assets/mmt_banquet_hall.jpg',
        caption: 'Verified MakeMyTrip photo showcasing the Swarnim Grand Ballroom during an evening wedding celebration.',
        badge: 'MakeMyTrip Verified'
    },
    {
        id: 17,
        title: 'Executive Suite Interior (Goibibo Verified)',
        category: 'google_media',
        categoryLabel: 'Google & Portal Verified',
        image: '/images/hotel/gmb_assets/ibibo_room_interior.jpg',
        caption: 'Verified Goibibo room photo showing pristine bedding, plush sofa seating, and ambient lighting.',
        badge: 'Goibibo Verified'
    },
    {
        id: 18,
        title: 'Hotel Courtyard & Entrance (Trip.com Verified)',
        category: 'google_media',
        categoryLabel: 'Google & Portal Verified',
        image: '/images/hotel/gmb_assets/trip_hotel_view.jpg',
        caption: 'Verified Trip.com photo of the hotel entrance portico and visitor lobby chauraha.',
        badge: 'Trip.com Verified'
    },
    {
        id: 19,
        title: 'Fairytale Wedding Gala (Divya & Amrit)',
        category: 'videos',
        categoryLabel: 'YouTube Event Video',
        image: '/images/hotel/gmb_assets/fairytale_wedding_thumb.jpg',
        caption: 'Watch full wedding trailer recorded live at Swarnim Grand Ballroom, Hotel Pleasant View.',
        badge: '▶ Play Video (4K)',
        youtubeId: 'qHiHWSd8UVI'
    },
    {
        id: 20,
        title: 'Wedding Trailer (Rakshanda & Rishabh)',
        category: 'videos',
        categoryLabel: 'YouTube Event Video',
        image: '/images/hotel/gmb_assets/wedding_trailer_thumb.jpg',
        caption: 'The Uncut Story wedding trailer filmed across the guest suites and marriage ballrooms.',
        badge: '▶ Play Video',
        youtubeId: 'JetqQrMoYbU'
    },
    {
        id: 21,
        title: 'Swarnim Ballroom Engagement Promo (Aditya & Shraddha)',
        category: 'videos',
        categoryLabel: 'YouTube Event Video',
        image: '/images/hotel/gmb_assets/engagement_promo_thumb.jpg',
        caption: 'Live engagement promo trailer showcasing stage floral decor, music, and gala dinner.',
        badge: '▶ Play Video',
        youtubeId: 't7H2Xot3X-g'
    },
    {
        id: 22,
        title: 'Nikaah Ceremony Teaser (Shanya & Saheer)',
        category: 'videos',
        categoryLabel: 'YouTube Event Video',
        image: '/images/hotel/gmb_assets/nikaah_teaser_thumb.jpg',
        caption: 'Regal Nikaah ceremony teaser recorded in the Swarn Mahal Banquet Hall.',
        badge: '▶ Play Video',
        youtubeId: 'zUIirDnnRd0'
    },
    {
        id: 23,
        title: 'Traditional Indian Wedding Teaser (Amit & Lovely)',
        category: 'videos',
        categoryLabel: 'YouTube Event Video',
        image: '/images/hotel/gmb_assets/indian_wedding_teaser_thumb.jpg',
        caption: 'Colorful Varmala stage and wedding celebrations at Hotel Pleasant View Raebareli.',
        badge: '▶ Play Video',
        youtubeId: 'pDNQz_5GKcA'
    },
    {
        id: 24,
        title: 'Engagement Story (Swapnil & Harshita)',
        category: 'videos',
        categoryLabel: 'YouTube Event Video',
        image: '/images/hotel/gmb_assets/engagement_story_thumb.jpg',
        caption: 'Short film engagement story filmed inside the luxury hall and suites.',
        badge: '▶ Play Video',
        youtubeId: 'kB_Yd-AsGYI'
    },
    {
        id: 25,
        title: 'Hotel Pleasant View Complete Video Tour',
        category: 'videos',
        categoryLabel: 'YouTube Property Tour',
        image: '/images/hotel/gmb_assets/pleasant_view_tour_thumb.jpg',
        caption: 'Comprehensive walk-through tour of rooms, rooftop dining, facade, and banquets.',
        badge: '▶ Play Video Tour',
        youtubeId: '-zFPI1g6s78'
    },
    {
        id: 26,
        title: 'Guest Stay & Room Review Tour',
        category: 'videos',
        categoryLabel: 'YouTube Stay Review',
        image: '/images/hotel/gmb_assets/budget_couple_hotel_thumb.jpg',
        caption: 'Honest patron review and room tour of Hotel Pleasant View Raebareli.',
        badge: '▶ Play Review',
        youtubeId: 'RVmzUYVRyEs'
    }
];

const selectedGalleryFilter = ref<'all' | 'property' | 'rooms' | 'banquets' | 'gatherings' | 'google_media' | 'videos'>('all');

const filteredGallery = computed(() => {
    if (selectedGalleryFilter.value === 'all') return galleryItems;
    return galleryItems.filter(item => item.category === selectedGalleryFilter.value);
});

// Lightbox & Video Modal state
const activeLightboxIndex = ref<number | null>(null);
const showVideoModal = ref(false);
const activeVideoId = ref('');
const activeVideoTitle = ref('');

const openLightbox = (index: number) => {
    activeLightboxIndex.value = index;
};

const closeLightbox = () => {
    activeLightboxIndex.value = null;
};

const openVideoModal = (youtubeId: string, title: string) => {
    activeVideoId.value = youtubeId;
    activeVideoTitle.value = title;
    showVideoModal.value = true;
};

const closeVideoModal = () => {
    showVideoModal.value = false;
    activeVideoId.value = '';
    activeVideoTitle.value = '';
};

const handleGalleryClick = (item: GalleryItem, index: number) => {
    if (item.youtubeId) {
        openVideoModal(item.youtubeId, item.title);
    } else {
        openLightbox(index);
    }
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
// Verified Guest Reviews & Testimonials (With Real Guest Photos)
// -------------------------------------------------------------
interface Testimonial {
    name: string;
    role: string;
    source: string;
    rating: number;
    review: string;
    date: string;
    photo?: string;
    photoCaption?: string;
}

const testimonials: Testimonial[] = [
    {
        name: 'Rajeshwer Singh',
        role: 'Wedding Host (Swarnim Ballroom)',
        source: 'Google Verified Review',
        rating: 5,
        review: "We celebrated my daughter's wedding reception at the Swarnim Grand Ballroom. The management and staff went above and beyond. The food was sensational — guests are still talking about the Paneer Lababdar and Dal Makhani. The rooms were spotless for outstation guests.",
        date: '3 months ago',
        photo: '/images/hotel/gmb_assets/mmt_banquet_hall.jpg',
        photoCaption: 'Swarnim Grand Ballroom wedding gala'
    },
    {
        name: 'Dr. Amitav Shukla',
        role: 'Medical Symposium Delegate',
        source: 'Google Reviewer',
        rating: 5,
        review: "Hotel Pleasant View is hands-down the premier venue in Raebareli. We hosted 120 doctors for an all-day symposium. Projector, audio, high-tea, and dinner were executed with 5-star precision. Ample valet parking made it effortless for attendees.",
        date: '1 month ago',
        photo: '/images/hotel/gmb_assets/mmt_hotel_facade.jpg',
        photoCaption: 'Hotel facade & valet entrance'
    },
    {
        name: 'Sunita & Deepak Verma',
        role: 'Family Vacation Stay',
        source: 'Verified Traveler',
        rating: 5,
        review: "Stayed in the Executive Suite during a family visit. Room was pristine, AC was ice-cold, and room service responded in 10 minutes. Located right in Civil Lines near Gol Chauraha, making shopping and traveling to the station extremely convenient.",
        date: '2 weeks ago',
        photo: '/images/hotel/gmb_assets/ibibo_room_interior.jpg',
        photoCaption: 'Verified Executive Suite bedroom'
    },
    {
        name: 'Anurag & Megha Mishra',
        role: 'Anniversary Stay (Civil Lines)',
        source: 'Google Reviewer',
        rating: 5,
        review: "Cleanest hotel in Raebareli! The suite was spotless with 24/7 hot water, fresh towels, and lovely fragrant toiletries. Breakfast was freshly prepared with hot dosas and parathas. Will definitely stay here whenever in Raebareli.",
        date: '3 weeks ago',
        photo: '/images/hotel/gmb_assets/budget_couple_hotel_thumb.jpg',
        photoCaption: 'Deluxe guest suite sanctuary'
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
        <title>Hotel Pleasant View | Luxury Hotel & Grand Banquets | Raebareli</title>
        <meta name="description" content="Experience refined Indian hospitality at Hotel Pleasant View, Raebareli. Luxury suites, 1000-guest wedding banquets, pure multi-cuisine dining, and central Civil Lines location." />
    </Head>

    <!-- World Luxury Warm Linen & Caviar Canvas -->
    <div class="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-sans selection:bg-[#8E744B] selection:text-white">
        <!-- ========================================================= -->
        <!-- TOP LUXURY PRIVILEGE ANNOUNCEMENT BAR                    -->
        <!-- ========================================================= -->
        <div class="bg-[#1C1B1A] border-b border-[#2D2A27] py-2.5 px-4 text-xs font-normal text-[#C9B28F] tracking-wide">
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
                <div class="flex items-center gap-2.5 flex-wrap justify-center text-xs">
                    <span class="inline-flex items-center gap-1.5 bg-[#2B2723] text-[#DFCEB7] border border-[#453E37] px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-widest">
                        Direct Privilege
                    </span>
                    <span class="text-[#E2D8CC] font-normal">Book directly with us for Complimentary Breakfast & Guaranteed Best Tariff</span>
                </div>

                <div class="flex items-center gap-5 text-[#B8AEA2] text-xs">
                    <a href="tel:+919794152222" class="flex items-center gap-1.5 text-[#E2D8CC] hover:text-[#C9B28F] transition-colors font-medium">
                        <Phone class="w-3.5 h-3.5 text-[#C9B28F]" />
                        <span>Concierge: +91 9794152222</span>
                    </a>
                    <span class="hidden md:inline text-[#4A453E]">|</span>
                    <Link href="/login" class="hidden md:inline-flex items-center gap-1 text-[#9C9388] hover:text-[#DFCEB7] transition-colors">
                        <span>Staff & Management Portal</span>
                        <ChevronRight class="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- PRIMARY REGAL NAVIGATION BAR (Calibrated 1-Row & High Legibility)   -->
        <!-- ========================================================= -->
        <header class="sticky top-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-md border-b border-[#E0D8CB] transition-all">
            <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-6">
                <!-- Official Hotel Logo (From Login & Branding) -->
                <a href="#" @click.prevent="scrollToSection('home')" class="flex items-center gap-3 group py-1 shrink-0 whitespace-nowrap">
                    <img
                        src="/images/logo-dark.png"
                        alt="Senani Hotel Pleasant View - The Lap of Luxury"
                        class="h-11 sm:h-13 md:h-14 w-auto object-contain group-hover:opacity-85 transition-opacity shrink-0"
                    />
                </a>

                <!-- Desktop Links (Calibrated 1-Row with High-Legibility Font Weight) -->
                <nav class="hidden lg:flex items-center gap-4 xl:gap-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1816] shrink-0 whitespace-nowrap">
                    <button @click="scrollToSection('rooms')" class="hover:text-[#8E744B] transition-colors pb-1 border-b-2 border-transparent hover:border-[#8E744B] whitespace-nowrap shrink-0">
                        Accommodations
                    </button>
                    <button @click="scrollToSection('banquets')" class="hover:text-[#8E744B] transition-colors pb-1 border-b-2 border-transparent hover:border-[#8E744B] whitespace-nowrap shrink-0">
                        Grand Banquets
                    </button>
                    <button @click="scrollToSection('gatherings')" class="hover:text-[#8E744B] transition-colors pb-1 border-b-2 border-transparent hover:border-[#8E744B] whitespace-nowrap shrink-0">
                        Celebrations
                    </button>
                    <button @click="scrollToSection('dining')" class="hover:text-[#8E744B] transition-colors pb-1 border-b-2 border-transparent hover:border-[#8E744B] whitespace-nowrap shrink-0">
                        Culinary
                    </button>
                    <button @click="scrollToSection('gallery')" class="hover:text-[#8E744B] transition-colors pb-1 border-b-2 border-transparent hover:border-[#8E744B] whitespace-nowrap shrink-0">
                        Gallery
                    </button>
                    <button @click="scrollToSection('location')" class="hover:text-[#8E744B] transition-colors pb-1 border-b-2 border-transparent hover:border-[#8E744B] whitespace-nowrap shrink-0">
                        Location
                    </button>
                </nav>

                <!-- Action CTA Buttons (Bold, High-Legibility, Calibrated 1-Row) -->
                <div class="hidden sm:flex items-center gap-3 shrink-0 whitespace-nowrap">
                    <button @click="scrollToSection('banquets')" class="px-4.5 py-2.5 rounded border-2 border-[#A88B58] text-[#1A1816] bg-[#FAF8F5] hover:bg-[#F3EDE3] transition-colors text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0 inline-flex items-center justify-center">
                        Plan Event
                    </button>
                    <button @click="initiateBooking()" class="px-5 py-2.5 rounded bg-[#1C1B1A] text-[#FAF8F5] hover:bg-[#312E2B] font-bold text-xs uppercase tracking-wider shadow-sm transition-all border border-[#1C1B1A] whitespace-nowrap shrink-0 inline-flex items-center justify-center">
                        Reserve Room
                    </button>
                </div>

                <!-- Mobile Menu Button -->
                <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden p-2 rounded border border-[#DCD5C9] text-[#1A1816]" aria-label="Toggle menu">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Mobile Drawer -->
            <div v-if="mobileMenuOpen" class="lg:hidden bg-[#FAF8F5] border-b border-[#E8E2D8] px-6 py-6 space-y-4">
                <div class="flex flex-col space-y-3 text-xs font-semibold uppercase tracking-wider text-[#4A453E]">
                    <button @click="scrollToSection('rooms')" class="text-left py-2 hover:text-[#8E744B] border-b border-[#EAE4DA]">Accommodations</button>
                    <button @click="scrollToSection('banquets')" class="text-left py-2 hover:text-[#8E744B] border-b border-[#EAE4DA]">Grand Banquets</button>
                    <button @click="scrollToSection('gatherings')" class="text-left py-2 hover:text-[#8E744B] border-b border-[#EAE4DA]">Celebrations & Gatherings</button>
                    <button @click="scrollToSection('dining')" class="text-left py-2 hover:text-[#8E744B] border-b border-[#EAE4DA]">Culinary Feasts</button>
                    <button @click="scrollToSection('gallery')" class="text-left py-2 hover:text-[#8E744B] border-b border-[#EAE4DA]">Photo Gallery</button>
                    <button @click="scrollToSection('location')" class="text-left py-2 hover:text-[#8E744B] border-b border-[#EAE4DA]">Location & Contact</button>
                    <Link href="/login" class="text-left py-2 text-[#8E744B]">Staff ERP Portal &rarr;</Link>
                </div>
                <div class="pt-2 flex flex-col gap-2.5">
                    <button @click="initiateBooking()" class="w-full py-2.5 text-center bg-[#1C1B1A] text-[#FAF8F5] font-medium uppercase tracking-wider rounded text-xs">
                        Reserve A Stay
                    </button>
                    <a href="tel:+919794152222" class="w-full py-2.5 text-center border border-[#C5A880] text-[#7A6038] font-medium uppercase tracking-wider rounded text-xs flex items-center justify-center gap-2">
                        <Phone class="w-3.5 h-3.5" /> Call Concierge
                    </a>
                </div>
            </div>
        </header>

        <main>
            <!-- ========================================================= -->
            <!-- HERO SECTION: LUXURY HERO SLIDER (Fast & Performance Optimized) -->
            <!-- ========================================================= -->
            <section
                id="home"
                class="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
                @mouseenter="stopHeroSlideTimer"
                @mouseleave="startHeroSlideTimer"
            >
                <!-- Background Slide Images (Preloaded & Optimized) -->
                <div
                    v-for="(slide, idx) in heroSlides"
                    :key="slide.id"
                    :class="[
                        'absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out',
                        currentHeroSlide === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    ]"
                >
                    <img
                        :src="slide.image"
                        :alt="slide.title"
                        :loading="idx === 0 ? 'eager' : 'lazy'"
                        :fetchpriority="idx === 0 ? 'high' : 'auto'"
                        class="w-full h-full object-cover object-center brightness-[0.36] contrast-[1.05] transition-transform duration-[7000ms] ease-out scale-105"
                    />
                    <!-- Vignette Gradients -->
                    <div class="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-black/40 to-[#1C1B1A]/80"></div>
                </div>

                <!-- Hero Navigation Arrows -->
                <button
                    @click="prevHeroSlide"
                    class="absolute left-3 sm:left-6 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/70 border border-white/20 transition-all backdrop-blur-sm group"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                    @click="nextHeroSlide"
                    class="absolute right-3 sm:right-6 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/70 border border-white/20 transition-all backdrop-blur-sm group"
                    aria-label="Next Slide"
                >
                    <ChevronRight class="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <!-- Hero Content Container -->
                <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 text-center">
                    <!-- Brand Subtitle / Crest Badge -->
                    <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1C1B1A]/80 border border-[#C5A880]/40 text-[#DFCEB7] text-[11px] font-normal tracking-[0.2em] uppercase mb-6 backdrop-blur-md transition-all">
                        <Crown class="w-3 h-3 text-[#C5A880]" />
                        <span>{{ heroSlides[currentHeroSlide].badge }}</span>
                    </div>

                    <!-- Main Headline (Editorial Classical Serif) -->
                    <h1 class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal text-[#FAF8F5] tracking-tight leading-[1.12] mb-6 transition-all">
                        {{ heroSlides[currentHeroSlide].title }}
                        <span class="block mt-2 italic font-serif text-[#DFCEB7]">
                            {{ heroSlides[currentHeroSlide].highlight }}
                        </span>
                    </h1>

                    <!-- Subtitle -->
                    <p class="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#E8E2D8] font-normal leading-relaxed mb-6">
                        {{ heroSlides[currentHeroSlide].subtitle }}
                    </p>

                    <!-- Video CTA button for video slide -->
                    <div v-if="heroSlides[currentHeroSlide].youtubeId" class="mb-8">
                        <button
                            @click="openVideoModal(heroSlides[currentHeroSlide].youtubeId, heroSlides[currentHeroSlide].title)"
                            class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#C5A880] text-[#1C1B1A] font-semibold text-xs uppercase tracking-wider hover:bg-[#FAF8F5] transition-all shadow-lg group"
                        >
                            <Play class="w-4 h-4 fill-[#1C1B1A] group-hover:scale-110 transition-transform" />
                            <span>Watch Swarnim Ballroom Event Video</span>
                        </button>
                    </div>

                    <!-- Slider Indicator Pills -->
                    <div class="flex items-center justify-center gap-2 mb-10">
                        <button
                            v-for="(slide, idx) in heroSlides"
                            :key="slide.id"
                            @click="goToHeroSlide(idx)"
                            :class="[
                                'h-1.5 rounded-full transition-all duration-300',
                                currentHeroSlide === idx ? 'w-8 bg-[#C5A880]' : 'w-2 bg-white/40 hover:bg-white/70'
                            ]"
                            :aria-label="`Slide ${idx + 1}`"
                        ></button>
                    </div>

                    <!-- Trust Strip Highlights (Aman Restraint) -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10 text-center">
                        <div class="p-3 rounded bg-[#1C1B1A]/60 border border-[#C5A880]/30 backdrop-blur-sm">
                            <div class="text-[#FAF8F5] font-serif text-lg">4.0 ★</div>
                            <div class="text-[11px] text-[#CFC5B8] mt-0.5">1,000+ Verified Reviews</div>
                        </div>
                        <div class="p-3 rounded bg-[#1C1B1A]/60 border border-[#C5A880]/30 backdrop-blur-sm">
                            <div class="text-[#FAF8F5] font-serif text-lg">1,000+</div>
                            <div class="text-[11px] text-[#CFC5B8] mt-0.5">Banquet Capacity</div>
                        </div>
                        <div class="p-3 rounded bg-[#1C1B1A]/60 border border-[#C5A880]/30 backdrop-blur-sm">
                            <div class="text-[#FAF8F5] font-serif text-lg">2.3 KM</div>
                            <div class="text-[11px] text-[#CFC5B8] mt-0.5">From Railway Jn</div>
                        </div>
                        <div class="p-3 rounded bg-[#1C1B1A]/60 border border-[#C5A880]/30 backdrop-blur-sm">
                            <div class="text-[#FAF8F5] font-serif text-lg">24 / 7</div>
                            <div class="text-[11px] text-[#CFC5B8] mt-0.5">Concierge & Valet</div>
                        </div>
                    </div>

                    <!-- Floating Interactive Booking Widget (Warm White Card) -->
                    <div class="bg-[#FFFFFF] border border-[#E2DCD2] rounded-xl p-5 sm:p-6 shadow-[0_16px_48px_rgba(26,24,22,0.12)] max-w-4xl mx-auto text-left">
                        <div class="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8E744B] mb-4 flex items-center gap-2">
                            <Sparkles class="w-3.5 h-3.5 text-[#8E744B]" />
                            <span>Reservation & Tariff Concierge</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <!-- Check In -->
                            <div>
                                <label class="block text-[10px] font-semibold uppercase tracking-wider text-[#2D2926] mb-1.5">Check-in Date</label>
                                <input
                                    v-model="bookingCheckIn"
                                    type="date"
                                    class="w-full bg-[#FAF8F5] border border-[#DDD6CB] rounded px-3 py-2 text-xs text-[#1A1816] focus:border-[#8E744B] focus:outline-none"
                                />
                            </div>

                            <!-- Check Out -->
                            <div>
                                <label class="block text-[10px] font-semibold uppercase tracking-wider text-[#2D2926] mb-1.5">Check-out Date</label>
                                <input
                                    v-model="bookingCheckOut"
                                    type="date"
                                    class="w-full bg-[#FAF8F5] border border-[#DDD6CB] rounded px-3 py-2 text-xs text-[#1A1816] focus:border-[#8E744B] focus:outline-none"
                                />
                            </div>

                            <!-- Category Selection -->
                            <div>
                                <label class="block text-[10px] font-semibold uppercase tracking-wider text-[#2D2926] mb-1.5">Accommodations</label>
                                <select
                                    v-model="bookingCategory"
                                    class="w-full bg-[#FAF8F5] border border-[#DDD6CB] rounded px-3 py-2 text-xs text-[#1A1816] focus:border-[#8E744B] focus:outline-none"
                                >
                                    <option value="deluxe">Deluxe Heritage (₹1,500/nt)</option>
                                    <option value="executive">Executive Suite (₹1,892/nt)</option>
                                    <option value="presidential">Royal Presidential (₹2,210/nt)</option>
                                </select>
                            </div>

                            <!-- CTA Button -->
                            <div class="flex flex-col justify-end">
                                <button
                                    @click="initiateBooking()"
                                    class="w-full py-2.5 px-4 rounded bg-[#1C1B1A] text-[#FAF8F5] hover:bg-[#312E2B] font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 h-[38px]"
                                >
                                    <span>Check & Reserve</span>
                                    <ArrowRight class="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <!-- Subtext Guarantee -->
                        <div class="mt-3.5 flex items-center justify-between text-[11px] text-[#3D3833] border-t border-[#F0EBE1] pt-3">
                            <div class="flex items-center gap-2">
                                <CheckCircle2 class="w-3.5 h-3.5 text-[#5A7B68]" />
                                <span>Guaranteed Best Rates • Free Cancellation 24h Prior • Direct Desk Confirmation</span>
                            </div>
                            <span class="hidden sm:inline text-[#8E744B] font-medium">WhatsApp Assistance Available</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- THE HERITAGE & PROPERTY (AUTHENTIC ON-SITE VISUALS)       -->
            <!-- ========================================================= -->
            <section class="py-24 bg-[#FAF8F5] relative border-t border-[#EAE4DA]">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <!-- Left Story -->
                        <div class="lg:col-span-6 space-y-6 text-left">
                            <div class="inline-flex items-center gap-2 text-[#8E744B] text-[11px] font-semibold uppercase tracking-[0.2em]">
                                <Sparkles class="w-3.5 h-3.5" />
                                <span>Sense of Place</span>
                            </div>

                            <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#1A1816] leading-tight">
                                A Haven of Warmth & Elegance in
                                <span class="italic font-serif text-[#8E744B]">Civil Lines</span>
                            </h2>

                            <p class="text-[#2C2825] leading-relaxed text-sm sm:text-base font-normal">
                                Situated on Manika Cinema Road in Gandhi Nagar, Civil Lines, <strong class="text-[#1A1816] font-medium">Hotel Pleasant View</strong> has been thoughtfully crafted to offer an authentic retreat for discerning corporate travelers, vacationing families, and magnificent wedding celebrations.
                            </p>

                            <p class="text-[#3D3833] leading-relaxed text-sm">
                                Perfectly positioned just 2.3 km from Raebareli Junction Railway Station and mere steps from Gol Chauraha, guests experience effortless accessibility paired with genuine warmth, immaculate hygiene, and attentive round-the-clock service.
                            </p>

                            <!-- Three Feature Columns -->
                            <div class="grid grid-cols-3 gap-3 pt-2">
                                <div class="p-3.5 rounded bg-[#FFFFFF] border border-[#EAE4DA]">
                                    <ShieldCheck class="w-4 h-4 text-[#8E744B] mb-1.5" />
                                    <div class="text-xs font-semibold text-[#1A1816]">24/7 Service</div>
                                    <div class="text-[11px] text-[#3D3833] mt-0.5">In-room dining & desk</div>
                                </div>
                                <div class="p-3.5 rounded bg-[#FFFFFF] border border-[#EAE4DA]">
                                    <Car class="w-4 h-4 text-[#8E744B] mb-1.5" />
                                    <div class="text-xs font-semibold text-[#1A1816]">Valet Parking</div>
                                    <div class="text-[11px] text-[#3D3833] mt-0.5">Dedicated secure parking</div>
                                </div>
                                <div class="p-3.5 rounded bg-[#FFFFFF] border border-[#EAE4DA]">
                                    <Utensils class="w-4 h-4 text-[#8E744B] mb-1.5" />
                                    <div class="text-xs font-semibold text-[#1A1816]">Awadhi Delights</div>
                                    <div class="text-[11px] text-[#3D3833] mt-0.5">Pure hygienic gourmet</div>
                                </div>
                            </div>

                            <div class="pt-2 flex items-center gap-4">
                                <button @click="scrollToSection('rooms')" class="px-5 py-2.5 rounded bg-[#1C1B1A] text-[#FAF8F5] text-xs font-medium uppercase tracking-wider hover:bg-[#312E2B] transition-colors">
                                    Explore Accommodations
                                </button>
                                <a href="tel:+919794152222" class="px-5 py-2.5 rounded border border-[#C5A880] text-[#7A6038] hover:bg-[#F4EFEA] text-xs font-medium uppercase tracking-wider transition-colors">
                                    Contact Reception
                                </a>
                            </div>
                        </div>

                        <!-- Right Photo Collage (Authentic Property Visuals) -->
                        <div class="lg:col-span-6 relative">
                            <div class="grid grid-cols-2 gap-4">
                                <!-- Real Hotel Entrance Photo -->
                                <div class="space-y-4">
                                    <div class="relative rounded-lg overflow-hidden border border-[#E0D9CE] group shadow-sm bg-[#FFFFFF]">
                                        <img
                                            src="/images/hotel/gmb_assets/trip_hotel_view.jpg"
                                            alt="Hotel Pleasant View Real Portico Entrance"
                                            class="w-full h-56 object-cover group-hover:scale-103 transition-transform duration-500"
                                        />
                                        <div class="p-3 bg-[#FFFFFF] text-left border-t border-[#EAE4DA]">
                                            <span class="text-[10px] font-medium text-[#8E744B] uppercase tracking-wider block">Porte-Cochère</span>
                                            <div class="text-xs font-medium text-[#1A1816]">Main Entrance Portico</div>
                                        </div>
                                    </div>

                                    <div class="relative rounded-lg overflow-hidden border border-[#E0D9CE] group shadow-sm bg-[#FFFFFF]">
                                        <img
                                            src="/images/hotel/gmb_assets/ibibo_room_interior.jpg"
                                            alt="Hotel Pleasant View Real Guest Room"
                                            class="w-full h-44 object-cover group-hover:scale-103 transition-transform duration-500"
                                        />
                                        <div class="p-3 bg-[#FFFFFF] text-left border-t border-[#EAE4DA]">
                                            <span class="text-[10px] font-medium text-[#8E744B] uppercase tracking-wider block">Authentic Bedroom</span>
                                            <div class="text-xs font-medium text-[#1A1816]">Deluxe King Room</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Real Facade & Signboard Photo -->
                                <div class="space-y-4 pt-6">
                                    <div class="relative rounded-lg overflow-hidden border border-[#E0D9CE] group shadow-sm bg-[#FFFFFF]">
                                        <img
                                            src="/images/hotel/gmb_assets/mmt_hotel_facade.jpg"
                                            alt="Hotel Pleasant View Real Multi-story Facade"
                                            class="w-full h-44 object-cover group-hover:scale-103 transition-transform duration-500"
                                        />
                                        <div class="p-3 bg-[#FFFFFF] text-left border-t border-[#EAE4DA]">
                                            <span class="text-[10px] font-medium text-[#8E744B] uppercase tracking-wider block">Civil Lines</span>
                                            <div class="text-xs font-medium text-[#1A1816]">Main Hotel Facade</div>
                                        </div>
                                    </div>

                                    <div class="relative rounded-lg overflow-hidden border border-[#E0D9CE] group shadow-sm bg-[#FFFFFF]">
                                        <img
                                            src="/images/hotel/gmb_assets/mmt_banquet_hall.jpg"
                                            alt="Hotel Pleasant View Grand Banquet Hall"
                                            class="w-full h-56 object-cover group-hover:scale-103 transition-transform duration-500"
                                        />
                                        <div class="p-3 bg-[#FFFFFF] text-left border-t border-[#EAE4DA]">
                                            <span class="text-[10px] font-medium text-[#8E744B] uppercase tracking-wider block">Celebration Hall</span>
                                            <div class="text-xs font-medium text-[#1A1816]">Swarnim Grand Ballroom</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- ROOMS & SUITES COLLECTION (FOUR SEASONS WARM WHITE)       -->
            <!-- ========================================================= -->
            <section id="rooms" class="py-24 bg-[#F5F2ED] relative border-t border-[#EAE4DA]">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <!-- Section Header -->
                    <div class="text-center max-w-2xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-[#8E744B] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
                            <BedDouble class="w-3.5 h-3.5" />
                            <span>Private Sanctuaries</span>
                        </div>
                        <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#1A1816] mb-3">
                            Rooms & Sovereign Suites
                        </h2>
                        <p class="text-[#2D2926] text-sm font-normal leading-relaxed">
                            Each accommodation is meticulously designed with soothing natural wood veneers, premium orthopedic comfort mattresses, high-speed fiber Wi-Fi, and personalized room service.
                        </p>
                    </div>

                    <!-- Room Cards Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div
                            v-for="room in rooms"
                            :key="room.id"
                            class="group rounded-xl bg-[#FFFFFF] border border-[#E2DCD2] hover:border-[#C5A880] overflow-hidden shadow-[0_4px_20px_rgba(26,24,22,0.05)] transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <!-- Room Image -->
                                <div class="relative h-64 overflow-hidden">
                                    <img
                                        :src="room.image"
                                        :alt="room.title"
                                        class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                    />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                    <!-- Price Badge -->
                                    <div class="absolute top-4 right-4 bg-[#FFFFFF]/95 border border-[#E2DCD2] rounded px-3 py-1 text-right backdrop-blur-sm shadow-sm">
                                        <div class="text-[10px] text-[#8C857B] line-through">₹{{ room.originalPrice }}</div>
                                        <div class="text-sm font-semibold text-[#1A1816]">
                                            ₹{{ room.price }}<span class="text-[10px] text-[#2D2926] font-normal"> / night</span>
                                        </div>
                                    </div>

                                    <!-- Rating -->
                                    <div class="absolute top-4 left-4 bg-[#1C1B1A]/85 text-[#FAF8F5] text-xs px-2.5 py-0.5 rounded flex items-center gap-1">
                                        <Star class="w-3 h-3 fill-[#C5A880] text-[#C5A880]" />
                                        <span>{{ room.rating }}</span>
                                    </div>

                                    <div class="absolute bottom-3 left-4 right-4 text-left">
                                        <h3 class="text-xl font-serif text-white group-hover:text-[#DFCEB7] transition-colors">
                                            {{ room.title }}
                                        </h3>
                                        <p class="text-xs text-[#E8E2D8] font-normal">{{ room.subtitle }}</p>
                                    </div>
                                </div>

                                <!-- Specs Strip -->
                                <div class="grid grid-cols-3 gap-2 px-5 py-3 bg-[#FAF8F5] border-y border-[#ECE7DE] text-[11px] text-[#2D2926] text-center">
                                    <div>
                                        <span class="text-[#8C857B] block text-[10px]">Dimension</span>
                                        <span class="font-medium text-[#1A1816]">{{ room.size }}</span>
                                    </div>
                                    <div class="border-x border-[#ECE7DE]">
                                        <span class="text-[#8C857B] block text-[10px]">Capacity</span>
                                        <span class="font-medium text-[#1A1816]">{{ room.occupancy }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[#8C857B] block text-[10px]">Bed Arrangement</span>
                                        <span class="font-medium text-[#1A1816]">King Bed</span>
                                    </div>
                                </div>

                                <!-- Amenities Summary -->
                                <div class="p-6 text-left space-y-4">
                                    <p class="text-xs text-[#2D2926] leading-relaxed line-clamp-3 font-normal">
                                        {{ room.description }}
                                    </p>

                                    <!-- Key Amenities List -->
                                    <div class="space-y-1.5 pt-1">
                                        <div v-for="(am, idx) in room.amenities.slice(0, 4)" :key="idx" class="flex items-center gap-2 text-xs text-[#4A453E]">
                                            <Check class="w-3.5 h-3.5 text-[#8E744B] shrink-0" />
                                            <span>{{ am }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Footer CTAs -->
                            <div class="px-6 pb-6 pt-2 flex items-center gap-3">
                                <button
                                    @click="openRoomDetails(room)"
                                    class="w-1/2 py-2 rounded border border-[#DDD6CB] text-[#4A453E] hover:text-[#1A1816] hover:border-[#8E744B] text-xs font-medium uppercase tracking-wider transition-colors"
                                >
                                    Details
                                </button>
                                <button
                                    @click="initiateBooking(room)"
                                    class="w-1/2 py-2 rounded bg-[#1C1B1A] text-[#FAF8F5] hover:bg-[#312E2B] font-medium text-xs uppercase tracking-wider transition-all"
                                >
                                    Reserve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- GRAND BANQUETS, WEDDINGS & CELEBRATIONS                  -->
            <!-- ========================================================= -->
            <section id="banquets" class="py-24 bg-[#FAF8F5] relative border-t border-[#EAE4DA]">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <!-- Section Header -->
                    <div class="text-center max-w-2xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-[#8E744B] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
                            <Crown class="w-3.5 h-3.5" />
                            <span>Monumental Celebrations</span>
                        </div>
                        <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#1A1816] mb-3">
                            Grand Ballrooms & Wedding Banquets
                        </h2>
                        <p class="text-[#2D2926] text-sm font-normal leading-relaxed">
                            Hosting up to 1,000+ guests with pillarless sightlines, royal stage installations, acoustic harmony, and authentic Awadhi feast catering.
                        </p>
                    </div>

                    <!-- Banquet Tab Selector -->
                    <div class="flex flex-wrap items-center justify-center gap-2.5 mb-12">
                        <button
                            v-for="hall in banquetHalls"
                            :key="hall.id"
                            @click="selectedBanquetTab = hall.id"
                            :class="[
                                'px-5 py-2.5 rounded text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-2',
                                selectedBanquetTab === hall.id
                                    ? 'bg-[#1C1B1A] text-[#FAF8F5] shadow-sm'
                                    : 'bg-[#FFFFFF] text-[#2C2825] border border-[#DDD6CB] hover:border-[#8E744B]'
                            ]"
                        >
                            <Sparkles class="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>{{ hall.name }}</span>
                        </button>
                    </div>

                    <!-- Active Banquet Card -->
                    <div class="rounded-xl bg-[#FFFFFF] border border-[#E2DCD2] overflow-hidden shadow-[0_8px_30px_rgba(26,24,22,0.06)] grid grid-cols-1 lg:grid-cols-12 mb-16">
                        <!-- Image Side -->
                        <div class="lg:col-span-7 relative min-h-[360px] lg:min-h-[480px]">
                            <img
                                :src="activeBanquet.image"
                                :alt="activeBanquet.name"
                                class="w-full h-full object-cover"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                            <div class="absolute bottom-6 left-6 right-6 text-left">
                                <span class="inline-block px-3 py-1 rounded bg-[#1C1B1A]/90 text-[#FAF8F5] font-medium text-[11px] uppercase tracking-wider mb-2 border border-[#C5A880]/30">
                                    {{ activeBanquet.capacity }}
                                </span>
                                <h3 class="text-2xl sm:text-3xl font-serif text-white">
                                    {{ activeBanquet.name }}
                                </h3>
                                <p class="text-xs sm:text-sm text-[#E8E2D8] font-normal mt-1">{{ activeBanquet.tagline }}</p>
                            </div>
                        </div>

                        <!-- Info & Specifications Side -->
                        <div class="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between text-left space-y-6">
                            <div class="space-y-5">
                                <div>
                                    <div class="text-[10px] uppercase tracking-wider text-[#8E744B] font-semibold mb-0.5">Venue Scale</div>
                                    <div class="text-base font-serif font-semibold text-[#1A1816]">{{ activeBanquet.area }}</div>
                                </div>

                                <!-- Key Features -->
                                <div>
                                    <div class="text-[10px] uppercase tracking-wider text-[#3D3833] font-semibold mb-2.5">Specifications & Inclusions</div>
                                    <div class="space-y-2">
                                        <div v-for="(feat, idx) in activeBanquet.features" :key="idx" class="flex items-start gap-2 text-xs text-[#2C2825]">
                                            <CheckCircle2 class="w-3.5 h-3.5 text-[#8E744B] shrink-0 mt-0.5" />
                                            <span>{{ feat }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Ideal For Tags -->
                                <div>
                                    <div class="text-[10px] uppercase tracking-wider text-[#3D3833] font-semibold mb-2">Recommended For</div>
                                    <div class="flex flex-wrap gap-1.5">
                                        <span v-for="(event, idx) in activeBanquet.idealFor" :key="idx" class="px-2.5 py-0.5 rounded bg-[#F4EFEA] text-[#2C2825] border border-[#E2DCD2] text-[11px]">
                                            {{ event }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Action CTAs -->
                            <div class="pt-4 border-t border-[#ECE7DE] flex flex-col sm:flex-row gap-3">
                                <a
                                    :href="generateBanquetProposalWhatsApp()"
                                    target="_blank"
                                    class="w-full py-2.5 rounded bg-[#1C1B1A] text-[#FAF8F5] hover:bg-[#312E2B] font-medium text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageCircle class="w-3.5 h-3.5" />
                                    <span>Check Dates via WhatsApp</span>
                                </a>
                                <a
                                    href="tel:+919794152223"
                                    class="w-full sm:w-auto px-4 py-2.5 rounded border border-[#C5A880] text-[#7A6038] hover:bg-[#F4EFEA] text-xs font-medium uppercase tracking-wider text-center flex items-center justify-center gap-2"
                                >
                                    <Phone class="w-3.5 h-3.5" />
                                    <span>Desk</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- ===================================================== -->
                    <!-- INTERACTIVE BANQUET BUDGET & QUOTATION SIMULATOR     -->
                    <!-- ===================================================== -->
                    <div class="rounded-xl bg-[#FFFFFF] border border-[#E2DCD2] p-6 sm:p-10 text-left shadow-[0_4px_24px_rgba(26,24,22,0.04)]">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#ECE7DE] pb-6">
                            <div>
                                <div class="inline-flex items-center gap-2 text-[#8E744B] text-[11px] font-semibold uppercase tracking-wider mb-1">
                                    <SlidersHorizontal class="w-3.5 h-3.5" />
                                    <span>Event Investment Simulator</span>
                                </div>
                                <h3 class="text-2xl font-serif text-[#1A1816]">
                                    Calculate Your Celebration Budget
                                </h3>
                                <p class="text-xs sm:text-sm text-[#2D2926] font-normal">
                                    Select guest count, catering feast tier, and technical enhancements for an immediate, transparent estimate.
                                </p>
                            </div>

                            <div class="text-right shrink-0 bg-[#FAF8F5] px-5 py-3 rounded border border-[#E2DCD2]">
                                <span class="text-[10px] uppercase tracking-wider text-[#3D3833] block">Estimated Total (Taxes incl.)</span>
                                <span class="text-2xl sm:text-3xl font-serif text-[#1A1816]">₹{{ calcGrandTotal.toLocaleString('en-IN') }}</span>
                            </div>
                        </div>

                        <!-- Simulator Controls Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <!-- Column 1: Event Type & Guest Slider -->
                            <div class="space-y-5">
                                <div>
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-[#2C2825] mb-2">Occasion Type</label>
                                    <select
                                        v-model="calcEventType"
                                        class="w-full bg-[#FAF8F5] border border-[#DDD6CB] rounded px-3 py-2 text-xs text-[#1A1816] focus:border-[#8E744B] focus:outline-none"
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
                                        <label class="text-xs font-semibold uppercase tracking-wider text-[#2C2825]">Expected Attendance</label>
                                        <span class="text-sm font-semibold text-[#8E744B]">{{ calcGuestCount }} Guests</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="1000"
                                        step="25"
                                        v-model.number="calcGuestCount"
                                        class="w-full accent-[#1C1B1A] cursor-pointer"
                                    />
                                    <div class="flex justify-between text-[10px] text-[#8C857B] mt-1 font-normal">
                                        <span>50</span>
                                        <span>350</span>
                                        <span>700</span>
                                        <span>1,000+ Guests</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Column 2: Royal Menu Tiers -->
                            <div class="space-y-3">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-[#2C2825] mb-1">Catering Feast Tier</label>

                                <div
                                    @click="calcMenuTier = 'royal'"
                                    :class="[
                                        'p-3 rounded border cursor-pointer transition-all',
                                        calcMenuTier === 'royal'
                                            ? 'bg-[#F4EFEA] border-[#8E744B] text-[#1A1816]'
                                            : 'bg-[#FAF8F5] border-[#E2DCD2] text-[#2C2825] hover:border-[#C5A880]'
                                    ]"
                                >
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs font-semibold text-[#1A1816]">Royal Awadhi Feast</span>
                                        <span class="text-xs font-semibold">₹750 / plate</span>
                                    </div>
                                    <p class="text-[11px] text-[#3D3833] mt-0.5 line-clamp-1">Welcome Drinks, 4 Starters, 2 Paneer, Dal Makhani, 2 Desserts</p>
                                </div>

                                <div
                                    @click="calcMenuTier = 'imperial'"
                                    :class="[
                                        'p-3 rounded border cursor-pointer transition-all',
                                        calcMenuTier === 'imperial'
                                            ? 'bg-[#F4EFEA] border-[#8E744B] text-[#1A1816]'
                                            : 'bg-[#FAF8F5] border-[#E2DCD2] text-[#2C2825] hover:border-[#C5A880]'
                                    ]"
                                >
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs font-semibold text-[#1A1816]">Imperial Grand Buffet</span>
                                        <span class="text-xs font-semibold">₹950 / plate</span>
                                    </div>
                                    <p class="text-[11px] text-[#3D3833] mt-0.5 line-clamp-1">Live Chaat, 6 Starters, Shahi Paneer, Dal Bukhara, 3 Desserts</p>
                                </div>

                                <div
                                    @click="calcMenuTier = 'maharaja'"
                                    :class="[
                                        'p-3 rounded border cursor-pointer transition-all',
                                        calcMenuTier === 'maharaja'
                                            ? 'bg-[#F4EFEA] border-[#8E744B] text-[#1A1816]'
                                            : 'bg-[#FAF8F5] border-[#E2DCD2] text-[#2C2825] hover:border-[#C5A880]'
                                    ]"
                                >
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs font-semibold text-[#1A1816]">Maharaja Sovereign Feast</span>
                                        <span class="text-xs font-semibold">₹1,250 / plate</span>
                                    </div>
                                    <p class="text-[11px] text-[#3D3833] mt-0.5 line-clamp-1">Mocktail Bar, 8 Starters, Live Counters, Dry Fruit Pulao, 5 Desserts</p>
                                </div>
                            </div>

                            <!-- Column 3: Event Addons & Summary Breakdown -->
                            <div class="space-y-3.5 bg-[#FAF8F5] p-4 rounded border border-[#E2DCD2]">
                                <div class="text-xs font-semibold uppercase tracking-wider text-[#2C2825]">Event Inclusions</div>

                                <label class="flex items-center gap-2.5 cursor-pointer text-xs text-[#2C2825]">
                                    <input type="checkbox" v-model="calcIncludeDecor" class="w-3.5 h-3.5 accent-[#1C1B1A] rounded" />
                                    <span>Stage Floral & Mandap Setup</span>
                                </label>

                                <label class="flex items-center gap-2.5 cursor-pointer text-xs text-[#2C2825]">
                                    <input type="checkbox" v-model="calcIncludeDj" class="w-3.5 h-3.5 accent-[#1C1B1A] rounded" />
                                    <span>Professional Sound & Ambient Lighting</span>
                                </label>

                                <label class="flex items-center gap-2.5 cursor-pointer text-xs text-[#2C2825]">
                                    <input type="checkbox" v-model="calcIncludeGenset" class="w-3.5 h-3.5 accent-[#1C1B1A] rounded" />
                                    <span>100% Uninterrupted Power Backup</span>
                                </label>

                                <!-- Subtotal Breakdown List -->
                                <div class="border-t border-[#ECE7DE] pt-3 space-y-1.5 text-xs text-[#3D3833]">
                                    <div class="flex justify-between">
                                        <span>Hall Venue Rental:</span>
                                        <span class="text-[#1A1816] font-medium">₹{{ calcHallRent.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Gourmet Catering ({{ calcGuestCount }} plates):</span>
                                        <span class="text-[#1A1816] font-medium">₹{{ calcFoodCost.toLocaleString('en-IN') }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>GST (5% composite):</span>
                                        <span class="text-[#1A1816] font-medium">₹{{ calcGst.toLocaleString('en-IN') }}</span>
                                    </div>
                                </div>

                                <a
                                    :href="generateBanquetProposalWhatsApp()"
                                    target="_blank"
                                    class="w-full mt-2 py-2 rounded bg-[#1C1B1A] text-[#FAF8F5] hover:bg-[#312E2B] font-medium text-xs uppercase tracking-wider text-center block transition-all"
                                >
                                    Confirm Proposal via WhatsApp &rarr;
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- GATHERINGS & REAL CELEBRATION MOMENTS                     -->
            <!-- ========================================================= -->
            <section id="gatherings" class="py-24 bg-[#F5F2ED] relative border-t border-[#EAE4DA]">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center max-w-2xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-[#8E744B] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
                            <Users class="w-3.5 h-3.5" />
                            <span>Authentic Milestones</span>
                        </div>
                        <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#1A1816] mb-3">
                            Joyous Gatherings & Celebrations
                        </h2>
                        <p class="text-[#2D2926] text-sm font-normal leading-relaxed">
                            A chronicle of authentic celebrations at Hotel Pleasant View — joyous family weddings, auspicious ceremonies, and executive corporate symposiums.
                        </p>
                    </div>

                    <!-- Celebrations 3-Column Visual Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <!-- Gathering 1: Wedding Reception -->
                        <div class="rounded-xl bg-[#FFFFFF] border border-[#E2DCD2] overflow-hidden shadow-sm group">
                            <div class="relative h-64 overflow-hidden">
                                <img
                                    src="/images/hotel/gmb_assets/fairytale_wedding_thumb.jpg"
                                    alt="Grand Wedding Gathering Reception at Hotel Pleasant View"
                                    class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                <span class="absolute top-4 left-4 px-2.5 py-1 rounded bg-[#1C1B1A]/85 text-[#FAF8F5] text-[10px] font-medium uppercase tracking-wider">
                                    Wedding Reception
                                </span>
                            </div>
                            <div class="p-6">
                                <h3 class="text-lg font-serif text-[#1A1816] mb-1.5 group-hover:text-[#8E744B] transition-colors">
                                    The Grand Wedding Evening
                                </h3>
                                <p class="text-xs text-[#2D2926] leading-relaxed font-normal">
                                    Hundreds of family guests enjoying pristine central air-conditioning, warm hospitality, and seamless evening dinner coordination.
                                </p>
                            </div>
                        </div>

                        <!-- Gathering 2: Sacred Mandap & Ceremony -->
                        <div class="rounded-xl bg-[#FFFFFF] border border-[#E2DCD2] overflow-hidden shadow-sm group">
                            <div class="relative h-64 overflow-hidden">
                                <img
                                    src="/images/hotel/gmb_assets/wedding_trailer_thumb.jpg"
                                    alt="Wedding Mandap and Sacred Rituals at Pleasant View"
                                    class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                <span class="absolute top-4 left-4 px-2.5 py-1 rounded bg-[#1C1B1A]/85 text-[#FAF8F5] text-[10px] font-medium uppercase tracking-wider">
                                    Sacred Mandap
                                </span>
                            </div>
                            <div class="p-6">
                                <h3 class="text-lg font-serif text-[#1A1816] mb-1.5 group-hover:text-[#8E744B] transition-colors">
                                    Auspicious Wedding Rituals
                                </h3>
                                <p class="text-xs text-[#2D2926] leading-relaxed font-normal">
                                    Artisan fresh floral arrangements and traditional mandap architecture designed for sacred wedding vows and lifetime memories.
                                </p>
                            </div>
                        </div>

                        <!-- Gathering 3: Corporate Seminar -->
                        <div class="rounded-xl bg-[#FFFFFF] border border-[#E2DCD2] overflow-hidden shadow-sm group">
                            <div class="relative h-64 overflow-hidden">
                                <img
                                    src="/images/hotel/gmb_assets/mmt_hotel_facade.jpg"
                                    alt="Executive Conference and Corporate Summit"
                                    class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                <span class="absolute top-4 left-4 px-2.5 py-1 rounded bg-[#1C1B1A]/85 text-[#FAF8F5] text-[10px] font-medium uppercase tracking-wider">
                                    Corporate Summit
                                </span>
                            </div>
                            <div class="p-6">
                                <h3 class="text-lg font-serif text-[#1A1816] mb-1.5 group-hover:text-[#8E744B] transition-colors">
                                    Conferences & Seminars
                                </h3>
                                <p class="text-xs text-[#2D2926] leading-relaxed font-normal">
                                    Equipped with high-definition digital projection, boundary microphones, and high-tea buffets favored by executive corporate summits.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- CULINARY EXCELLENCE & AWADHI GASTRONOMY                   -->
            <!-- ========================================================= -->
            <section id="dining" class="py-24 bg-[#FAF8F5] relative border-t border-[#EAE4DA]">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <!-- Left Visual Buffet -->
                        <div class="lg:col-span-6 relative">
                            <div class="rounded-xl overflow-hidden border border-[#E2DCD2] shadow-sm relative bg-[#FFFFFF]">
                                <img
                                    src="/images/hotel/dining_buffet_gathering.jpg"
                                    alt="Lavish Royal Buffet Dining at Hotel Pleasant View"
                                    class="w-full h-[400px] object-cover"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div class="absolute bottom-6 left-6 right-6 text-left">
                                    <span class="inline-block px-2.5 py-0.5 rounded bg-[#1C1B1A]/90 text-[#FAF8F5] font-medium text-[10px] uppercase tracking-wider mb-2">
                                        Hygienic Craftsmanship
                                    </span>
                                    <div class="text-2xl font-serif text-white">The Royal Banquet Buffet</div>
                                    <p class="text-xs text-[#E8E2D8] font-normal mt-1">Multi-course gourmet feasts prepared by experienced master chefs from Awadh.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Right Culinary Story -->
                        <div class="lg:col-span-6 space-y-6 text-left">
                            <div class="inline-flex items-center gap-2 text-[#8E744B] text-[11px] font-semibold uppercase tracking-[0.2em]">
                                <Utensils class="w-3.5 h-3.5" />
                                <span>Gastronomic Heritage</span>
                            </div>

                            <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#1A1816] leading-tight">
                                An Odyssey of
                                <span class="italic font-serif text-[#8E744B]">Awadhi & Multi-Cuisine</span>
                                Flavors
                            </h2>

                            <p class="text-[#2C2825] leading-relaxed text-sm sm:text-base font-normal">
                                Dining at Hotel Pleasant View pays homage to the revered culinary traditions of Awadh along with beloved North Indian and Continental preparations. Our culinary team ensures each delicacy is prepared with cold-pressed oils, pure desi ghee, and freshly roasted spices.
                            </p>

                            <!-- Culinary Highlights -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                <div class="p-3.5 rounded bg-[#FFFFFF] border border-[#EAE4DA]">
                                    <div class="text-xs font-semibold text-[#1A1816] mb-1">Awadhi & Mughlai Specialties</div>
                                    <p class="text-[11px] text-[#3D3833] leading-relaxed">Slow-cooked Dal Makhani, Paneer Lababdar, and fragrant vegetable Dum Biryani.</p>
                                </div>
                                <div class="p-3.5 rounded bg-[#FFFFFF] border border-[#EAE4DA]">
                                    <div class="text-xs font-semibold text-[#1A1816] mb-1">Live Interactive Counters</div>
                                    <p class="text-[11px] text-[#3D3833] leading-relaxed">Delhi Chaat Street, Charcoal Tandoor breads, Artisan Dosas, and fresh Desserts.</p>
                                </div>
                                <div class="p-3.5 rounded bg-[#FFFFFF] border border-[#EAE4DA]">
                                    <div class="text-xs font-semibold text-[#1A1816] mb-1">Strict Food Safety Standards</div>
                                    <p class="text-[11px] text-[#3D3833] leading-relaxed">100% RO Purified water, stainless steel commercial stations, and hygienic service.</p>
                                </div>
                                <div class="p-3.5 rounded bg-[#FFFFFF] border border-[#EAE4DA]">
                                    <div class="text-xs font-semibold text-[#1A1816] mb-1">24/7 In-Room Service</div>
                                    <p class="text-[11px] text-[#3D3833] leading-relaxed">Fresh, piping hot room dining delivered directly to your suite any time of day.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- FILTERABLE PHOTO GALLERY WITH FULLSCREEN LIGHTBOX         -->
            <!-- ========================================================= -->
            <section id="gallery" class="py-24 bg-[#F5F2ED] relative border-t border-[#EAE4DA]">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center max-w-2xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-[#8E744B] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
                            <Camera class="w-3.5 h-3.5" />
                            <span>Visual Portfolio</span>
                        </div>
                        <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#1A1816] mb-3">
                            The Hotel Pleasant View Gallery
                        </h2>
                        <p class="text-[#2D2926] text-sm font-normal leading-relaxed">
                            Discover authentic on-site imagery of our facade, portico entrance, luxury rooms, wedding ballrooms, and vibrant events.
                        </p>
                    </div>

                    <!-- Category Filters -->
                    <div class="flex flex-wrap items-center justify-center gap-2 mb-12">
                        <button
                            @click="selectedGalleryFilter = 'all'"
                            :class="[
                                'px-4 py-2 rounded text-xs font-medium uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'all'
                                    ? 'bg-[#1C1B1A] text-[#FAF8F5]'
                                    : 'bg-[#FFFFFF] text-[#2C2825] border border-[#DDD6CB] hover:border-[#8E744B]'
                            ]"
                        >
                            All Photographs ({{ galleryItems.length }})
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'property'"
                            :class="[
                                'px-4 py-2 rounded text-xs font-medium uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'property'
                                    ? 'bg-[#1C1B1A] text-[#FAF8F5]'
                                    : 'bg-[#FFFFFF] text-[#2C2825] border border-[#DDD6CB] hover:border-[#8E744B]'
                            ]"
                        >
                            Property & Facade
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'rooms'"
                            :class="[
                                'px-4 py-2 rounded text-xs font-medium uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'rooms'
                                    ? 'bg-[#1C1B1A] text-[#FAF8F5]'
                                    : 'bg-[#FFFFFF] text-[#2C2825] border border-[#DDD6CB] hover:border-[#8E744B]'
                            ]"
                        >
                            Rooms & Suites
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'banquets'"
                            :class="[
                                'px-4 py-2 rounded text-xs font-medium uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'banquets'
                                    ? 'bg-[#1C1B1A] text-[#FAF8F5]'
                                    : 'bg-[#FFFFFF] text-[#2C2825] border border-[#DDD6CB] hover:border-[#8E744B]'
                            ]"
                        >
                            Banquets & Weddings
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'gatherings'"
                            :class="[
                                'px-4 py-2 rounded text-xs font-medium uppercase tracking-wider transition-all',
                                selectedGalleryFilter === 'gatherings'
                                    ? 'bg-[#1C1B1A] text-[#FAF8F5]'
                                    : 'bg-[#FFFFFF] text-[#2C2825] border border-[#DDD6CB] hover:border-[#8E744B]'
                            ]"
                        >
                            Gatherings & Dinners
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'google_media'"
                            :class="[
                                'px-4 py-2 rounded text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-1.5',
                                selectedGalleryFilter === 'google_media'
                                    ? 'bg-[#1C1B1A] text-[#FAF8F5]'
                                    : 'bg-[#FFFFFF] text-[#2C2825] border border-[#DDD6CB] hover:border-[#8E744B]'
                            ]"
                        >
                            <Camera class="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>Google Verified Photos</span>
                        </button>
                        <button
                            @click="selectedGalleryFilter = 'videos'"
                            :class="[
                                'px-4 py-2 rounded text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-1.5',
                                selectedGalleryFilter === 'videos'
                                    ? 'bg-[#1C1B1A] text-[#FAF8F5]'
                                    : 'bg-[#FFFFFF] text-[#2C2825] border border-[#DDD6CB] hover:border-[#8E744B]'
                            ]"
                        >
                            <Video class="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>Video & Event Trailers</span>
                        </button>
                    </div>

                    <!-- Gallery Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div
                            v-for="(item, idx) in filteredGallery"
                            :key="item.id"
                            @click="handleGalleryClick(item, idx)"
                            class="group relative rounded-lg overflow-hidden border border-[#E2DCD2] bg-[#FFFFFF] cursor-pointer shadow-sm transition-all duration-300 h-64"
                        >
                            <img
                                :src="item.image"
                                :alt="item.title"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all"></div>

                            <!-- Optional Badge -->
                            <div v-if="item.badge" class="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#1C1B1A]/85 text-[#FAF8F5] font-medium text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <Video v-if="item.youtubeId" class="w-3 h-3 text-[#C5A880]" />
                                <span>{{ item.badge }}</span>
                            </div>

                            <!-- Play Overlay for Video Items -->
                            <div v-if="item.youtubeId" class="absolute inset-0 flex items-center justify-center">
                                <div class="w-12 h-12 rounded-full bg-[#C5A880]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play class="w-5 h-5 fill-white translate-x-0.5" />
                                </div>
                            </div>

                            <!-- Expand Icon for standard photos -->
                            <div v-else class="absolute top-3 right-3 w-7 h-7 rounded bg-black/50 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 class="w-3.5 h-3.5" />
                            </div>

                            <!-- Title & Caption -->
                            <div class="absolute bottom-3 left-4 right-4 text-left">
                                <div class="text-[10px] uppercase tracking-wider text-[#DFCEB7] font-medium">
                                    {{ item.categoryLabel }}
                                </div>
                                <div class="text-sm font-serif text-white group-hover:text-[#E8E2D8] transition-colors line-clamp-1">
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
            <section class="py-24 bg-[#FAF8F5] relative border-t border-[#EAE4DA]">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center max-w-2xl mx-auto mb-16">
                        <div class="inline-flex items-center gap-2 text-[#8E744B] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
                            <Star class="w-3.5 h-3.5 fill-[#8E744B] text-[#8E744B]" />
                            <span>Verified Patron Esteem</span>
                        </div>
                        <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#1A1816] mb-3">
                            Guest Experiences & Reflections
                        </h2>
                        <p class="text-[#2D2926] text-sm font-normal leading-relaxed">
                            Over 1,000 verified patron reviews across Justdial, Google, and major travel portals celebrate our warm hospitality and spotless standards.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                            v-for="(t, idx) in testimonials"
                            :key="idx"
                            class="rounded-xl bg-[#FFFFFF] border border-[#E2DCD2] overflow-hidden flex flex-col justify-between text-left shadow-sm hover:border-[#C5A880] transition-all group"
                        >
                            <!-- Guest Photo from Review -->
                            <div v-if="t.photo" class="relative h-44 w-full overflow-hidden bg-[#F4EFEA]">
                                <img :src="t.photo" :alt="t.name" class="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500" />
                                <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white bg-black/65 backdrop-blur-sm px-2.5 py-1 rounded">
                                    <span class="flex items-center gap-1 font-medium"><CheckCircle2 class="w-3 h-3 text-[#C5A880]" /> Authentic Property</span>
                                    <span class="text-[9px] text-slate-300 truncate max-w-[120px]">{{ t.photoCaption }}</span>
                                </div>
                            </div>

                            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div class="space-y-2.5">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-0.5">
                                            <Star v-for="n in t.rating" :key="n" class="w-3 h-3 fill-[#8E744B] text-[#8E744B]" />
                                        </div>
                                        <span class="text-[9px] font-medium text-[#5A7B68] bg-[#F2F7F4] px-2 py-0.5 rounded border border-[#D5E5DC]">
                                            {{ t.source }}
                                        </span>
                                    </div>
                                    <p class="text-[#4A453E] text-xs leading-relaxed italic font-normal line-clamp-4">
                                        “{{ t.review }}”
                                    </p>
                                </div>

                                <div class="pt-3 border-t border-[#ECE7DE] flex items-center justify-between">
                                    <div>
                                        <div class="text-xs font-semibold text-[#1A1816]">{{ t.name }}</div>
                                        <div class="text-[10px] text-[#8E744B] truncate max-w-[140px]">{{ t.role }}</div>
                                    </div>
                                    <span class="text-[10px] text-[#8C857B]">{{ t.date }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================= -->
            <!-- LOCATION, LANDMARK & DIRECT DIAL DIRECTORY                -->
            <!-- ========================================================= -->
            <section id="location" class="py-24 bg-[#F5F2ED] relative border-t border-[#EAE4DA]">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <!-- Location Info -->
                        <div class="lg:col-span-6 space-y-6 text-left">
                            <div class="inline-flex items-center gap-2 text-[#8E744B] text-[11px] font-semibold uppercase tracking-[0.2em]">
                                <MapPin class="w-3.5 h-3.5" />
                                <span>Civil Lines Enclave</span>
                            </div>

                            <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#1A1816] leading-tight">
                                Located in the Prime Heart of
                                <span class="italic font-serif text-[#8E744B]">Raebareli</span>
                            </h2>

                            <p class="text-[#2C2825] leading-relaxed text-sm sm:text-base font-normal">
                                Hotel Pleasant View enjoys the most convenient address in town — located in Civil Lines, within minutes of the railway station, district administration, and retail landmarks.
                            </p>

                            <!-- Address Box -->
                            <div class="p-6 rounded-xl bg-[#FFFFFF] border border-[#E2DCD2] space-y-2.5">
                                <div class="text-[10px] font-semibold uppercase tracking-wider text-[#8E744B]">Postal Address</div>
                                <div class="text-[#1A1816] text-base font-serif font-medium">
                                    Hotel Pleasant View
                                </div>
                                <p class="text-[#2D2926] text-xs leading-relaxed font-normal">
                                    Manika Cinema Road, Gandhi Nagar, Near Gol Chauraha, Civil Lines, Raebareli, Uttar Pradesh – 229001
                                </p>
                                <div class="pt-2 flex flex-wrap gap-2 text-[11px] text-[#3D3833]">
                                    <span class="px-2.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E2DCD2]">GSTIN: 09AAAAA0000A1Z5</span>
                                    <span class="px-2.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E2DCD2]">PIN: 229001</span>
                                    <span class="px-2.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E2DCD2]">Dist: Raebareli, UP</span>
                                </div>
                            </div>

                            <!-- Proximity Badges -->
                            <div class="grid grid-cols-2 gap-3 pt-1">
                                <div class="p-3 rounded bg-[#FFFFFF] border border-[#E2DCD2]">
                                    <div class="text-[#1A1816] font-semibold text-sm">2.3 KM</div>
                                    <div class="text-[11px] text-[#3D3833]">Raebareli Jn Railway Station (~6 mins)</div>
                                </div>
                                <div class="p-3 rounded bg-[#FFFFFF] border border-[#E2DCD2]">
                                    <div class="text-[#1A1816] font-semibold text-sm">200 Meters</div>
                                    <div class="text-[11px] text-[#3D3833]">Gol Chauraha & Civil Lines Market</div>
                                </div>
                                <div class="p-3 rounded bg-[#FFFFFF] border border-[#E2DCD2]">
                                    <div class="text-[#1A1816] font-semibold text-sm">1.5 KM</div>
                                    <div class="text-[11px] text-[#3D3833]">District Court & Collectorate</div>
                                </div>
                                <div class="p-3 rounded bg-[#FFFFFF] border border-[#E2DCD2]">
                                    <div class="text-[#1A1816] font-semibold text-sm">78 KM</div>
                                    <div class="text-[11px] text-[#3D3833]">Lucknow Airport (CCSI Airport)</div>
                                </div>
                            </div>
                        </div>

                        <!-- Direct Dial Helpdesk Grid -->
                        <div class="lg:col-span-6 space-y-4">
                            <div class="text-left mb-5">
                                <div class="text-[10px] font-semibold uppercase tracking-wider text-[#8E744B] mb-0.5">Concierge Assistance</div>
                                <h3 class="text-2xl font-serif text-[#1A1816]">Telephone Directory</h3>
                                <p class="text-xs text-[#3D3833]">Connect directly with our 24/7 front desk team.</p>
                            </div>

                            <div
                                v-for="(c, idx) in hotelContacts"
                                :key="idx"
                                class="p-4 rounded-lg bg-[#FFFFFF] border border-[#E2DCD2] hover:border-[#8E744B] transition-all flex items-center justify-between text-left group shadow-sm"
                            >
                                <div class="space-y-0.5">
                                    <div class="text-[10px] text-[#3D3833] uppercase tracking-wider">{{ c.label }}</div>
                                    <div class="text-base font-serif font-medium text-[#1A1816] group-hover:text-[#8E744B] transition-colors">
                                        {{ c.number }}
                                    </div>
                                </div>

                                <a
                                    :href="c.tel"
                                    class="p-2.5 rounded bg-[#FAF8F5] border border-[#E2DCD2] text-[#8E744B] group-hover:bg-[#1C1B1A] group-hover:text-[#FAF8F5] group-hover:border-[#1C1B1A] transition-all"
                                    aria-label="Call this number"
                                >
                                    <Phone class="w-4 h-4" />
                                </a>
                            </div>

                            <!-- WhatsApp Direct Assist -->
                            <a
                                href="https://wa.me/919794152222?text=Hello%20Hotel%20Pleasant%20View,%20I%20would%20like%20to%20inquire%20about%20a%20booking"
                                target="_blank"
                                class="w-full py-3.5 rounded bg-[#1C1B1A] text-[#FAF8F5] font-medium text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:bg-[#312E2B] transition-colors shadow-sm"
                            >
                                <MessageCircle class="w-4 h-4" />
                                <span>Connect via WhatsApp (+91 9794152222)</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- ========================================================= -->
        <!-- REGAL FOOTER (Deep Caviar & Warm Taupe)                   -->
        <!-- ========================================================= -->
        <footer class="bg-[#141312] border-t border-[#2B2825] pt-16 pb-12 text-left text-[#FAF8F5]">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#282522]">
                    <!-- Col 1: Brand & Bio -->
                    <div class="lg:col-span-2 space-y-4">
                        <div class="flex items-center gap-3">
                            <img
                                src="/images/logo-white.png"
                                alt="Senani Hotel Pleasant View - The Lap of Luxury"
                                class="h-12 sm:h-14 w-auto object-contain"
                            />
                        </div>

                        <p class="text-xs text-[#A8A196] leading-relaxed max-w-sm font-normal">
                            Raebareli’s leading luxury hotel offering tranquil guest rooms, grand marriage ballrooms for up to 1,000 guests, and legendary Awadhi hospitality.
                        </p>

                        <div class="text-xs text-[#8C8479] space-y-1 font-normal">
                            <div><strong class="text-[#D8D1C5] font-normal">GSTIN:</strong> 09AAAAA0000A1Z5</div>
                            <div><strong class="text-[#D8D1C5] font-normal">Check-in:</strong> 12:00 PM | <strong class="text-[#D8D1C5] font-normal">Check-out:</strong> 11:00 AM</div>
                        </div>
                    </div>

                    <!-- Col 2: Accommodations -->
                    <div class="space-y-3">
                        <div class="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C5A880]">Accommodations</div>
                        <ul class="space-y-2 text-xs text-[#A8A196] font-normal">
                            <li><button @click="initiateBooking(rooms[0])" class="hover:text-[#FAF8F5] transition-colors">Deluxe Heritage Room</button></li>
                            <li><button @click="initiateBooking(rooms[1])" class="hover:text-[#FAF8F5] transition-colors">Executive Business Suite</button></li>
                            <li><button @click="initiateBooking(rooms[2])" class="hover:text-[#FAF8F5] transition-colors">Royal Presidential Suite</button></li>
                            <li><button @click="scrollToSection('rooms')" class="hover:text-[#FAF8F5] transition-colors">Room Amenities</button></li>
                        </ul>
                    </div>

                    <!-- Col 3: Grand Events -->
                    <div class="space-y-3">
                        <div class="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C5A880]">Banquets & Venues</div>
                        <ul class="space-y-2 text-xs text-[#A8A196] font-normal">
                            <li><button @click="scrollToSection('banquets')" class="hover:text-[#FAF8F5] transition-colors">Swarnim Grand Ballroom (1000+)</button></li>
                            <li><button @click="scrollToSection('banquets')" class="hover:text-[#FAF8F5] transition-colors">Swarn Mahal Banquet (350)</button></li>
                            <li><button @click="scrollToSection('banquets')" class="hover:text-[#FAF8F5] transition-colors">The Imperial Boardroom</button></li>
                            <li><button @click="scrollToSection('banquets')" class="hover:text-[#FAF8F5] transition-colors">Banquet Budget Calculator</button></li>
                        </ul>
                    </div>

                    <!-- Col 4: Helpdesk -->
                    <div class="space-y-3">
                        <div class="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C5A880]">Concierge & Portal</div>
                        <ul class="space-y-2 text-xs text-[#A8A196] font-normal">
                            <li><Link href="/login" class="text-[#DFCEB7] hover:text-[#FAF8F5] font-medium">Staff & ERP Login &rarr;</Link></li>
                            <li><a href="tel:+919794152222" class="hover:text-[#FAF8F5] transition-colors">+91 9794152222 (Front Desk)</a></li>
                            <li><a href="tel:+919794152223" class="hover:text-[#FAF8F5] transition-colors">+91 9794152223 (Banquets)</a></li>
                            <li><a href="tel:+919794152225" class="hover:text-[#FAF8F5] transition-colors">+91 9794152225 (Events)</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Bottom Copyright -->
                <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8479] gap-4 font-normal">
                    <div>
                        © {{ new Date().getFullYear() }} Hotel Pleasant View, Raebareli. All Rights Reserved.
                    </div>
                    <div class="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
                        <span>Civil Lines, Gandhi Nagar, Raebareli (UP)</span>
                        <span>•</span>
                        <a href="https://abhiramtechnologies.com" target="_blank" rel="noopener noreferrer" class="text-[#D8C5A8] hover:text-[#FAF8F5] underline underline-offset-4 decoration-[#C5A880]/50 hover:decoration-[#FAF8F5] transition-colors font-medium">
                            Designed & Developed by Abhiram Technologies
                        </a>
                        <span>•</span>
                        <Link href="/login" class="text-[#8C8479] hover:text-[#FAF8F5]">Staff ERP Access</Link>
                    </div>
                </div>
            </div>
        </footer>

        <!-- ========================================================= -->
        <!-- MODAL 1: ROOM DETAILS MODAL                               -->
        <!-- ========================================================= -->
        <div v-if="showRoomModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-[#FFFFFF] border border-[#E2DCD2] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl relative text-left max-h-[90vh] flex flex-col justify-between">
                <div>
                    <!-- Modal Header Image -->
                    <div class="relative h-56">
                        <img :src="selectedRoom.image" :alt="selectedRoom.title" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <button @click="showRoomModal = false" class="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80">
                            <X class="w-4 h-4" />
                        </button>
                        <div class="absolute bottom-4 left-6">
                            <h3 class="text-2xl font-serif text-white">{{ selectedRoom.title }}</h3>
                            <p class="text-xs text-[#E8E2D8] font-normal">{{ selectedRoom.subtitle }}</p>
                        </div>
                    </div>

                    <!-- Modal Body -->
                    <div class="p-6 overflow-y-auto space-y-4 max-h-[45vh]">
                        <div class="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
                            <div>
                                <span class="text-xs text-[#3D3833]">Nightly Tariff:</span>
                                <div class="text-xl font-serif font-semibold text-[#1A1816]">₹{{ selectedRoom.price }} <span class="text-xs text-[#3D3833] font-normal font-sans">+ taxes</span></div>
                            </div>
                            <div class="text-right text-xs text-[#2C2825]">
                                <div><strong>Area:</strong> {{ selectedRoom.size }}</div>
                                <div><strong>Occupancy:</strong> {{ selectedRoom.occupancy }}</div>
                            </div>
                        </div>

                        <p class="text-xs text-[#2D2926] leading-relaxed font-normal">{{ selectedRoom.description }}</p>

                        <div>
                            <div class="text-xs font-semibold uppercase tracking-wider text-[#8E744B] mb-2">Amenities</div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div v-for="(am, idx) in selectedRoom.amenities" :key="idx" class="flex items-center gap-2 text-xs text-[#4A453E]">
                                    <Check class="w-3.5 h-3.5 text-[#8E744B] shrink-0" />
                                    <span>{{ am }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Actions -->
                <div class="p-4 bg-[#FAF8F5] border-t border-[#ECE7DE] flex items-center justify-end gap-3">
                    <button @click="showRoomModal = false" class="px-4 py-2 rounded border border-[#DDD6CB] text-[#4A453E] text-xs font-medium uppercase">Close</button>
                    <button @click="initiateBooking(selectedRoom)" class="px-5 py-2 rounded bg-[#1C1B1A] text-[#FAF8F5] hover:bg-[#312E2B] font-medium text-xs uppercase tracking-wider">
                        Proceed to Reservation
                    </button>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- MODAL 2: DIRECT RESERVATION MODAL                         -->
        <!-- ========================================================= -->
        <div v-if="showReservationModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-[#FFFFFF] border border-[#E2DCD2] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl relative text-left">
                <div class="p-5 bg-[#1C1B1A] text-[#FAF8F5] flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-serif text-[#FAF8F5]">Room Reservation</h3>
                        <p class="text-[11px] text-[#C5A880] font-normal">Instant confirmation via front desk WhatsApp concierge</p>
                    </div>
                    <button @click="showReservationModal = false" class="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white">
                        <X class="w-4 h-4" />
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <!-- Selected Room Banner -->
                    <div class="p-3.5 rounded bg-[#FAF8F5] border border-[#E2DCD2] flex items-center justify-between">
                        <div>
                            <div class="text-[10px] text-[#3D3833] uppercase">Selected Sanctuary</div>
                            <div class="text-sm font-serif font-semibold text-[#1A1816]">{{ activeBookingRoom.title }}</div>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] text-[#3D3833] uppercase">Tariff / Night</span>
                            <div class="text-sm font-semibold text-[#1A1816]">₹{{ activeBookingRoom.price }}</div>
                        </div>
                    </div>

                    <!-- Stay Dates -->
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-[10px] font-semibold uppercase text-[#2D2926] mb-1">Check-in</label>
                            <input v-model="bookingCheckIn" type="date" class="w-full bg-[#FAF8F5] border border-[#DDD6CB] rounded px-3 py-2 text-xs text-[#1A1816]" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold uppercase text-[#2D2926] mb-1">Check-out</label>
                            <input v-model="bookingCheckOut" type="date" class="w-full bg-[#FAF8F5] border border-[#DDD6CB] rounded px-3 py-2 text-xs text-[#1A1816]" />
                        </div>
                    </div>

                    <!-- Guest Details -->
                    <div class="space-y-3">
                        <div>
                            <label class="block text-[10px] font-semibold uppercase text-[#2D2926] mb-1">Guest Full Name</label>
                            <input v-model="guestName" type="text" placeholder="e.g. Ramesh Chandra" class="w-full bg-[#FAF8F5] border border-[#DDD6CB] rounded px-3 py-2 text-xs text-[#1A1816] focus:outline-none focus:border-[#8E744B]" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold uppercase text-[#2D2926] mb-1">Mobile Contact / WhatsApp</label>
                            <input v-model="guestPhone" type="tel" placeholder="+91 98XXXXXXXX" class="w-full bg-[#FAF8F5] border border-[#DDD6CB] rounded px-3 py-2 text-xs text-[#1A1816] focus:outline-none focus:border-[#8E744B]" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold uppercase text-[#2D2926] mb-1">Special Preferences (Optional)</label>
                            <input v-model="guestSpecialRequests" type="text" placeholder="Early check-in, dietary preferences, etc." class="w-full bg-[#FAF8F5] border border-[#DDD6CB] rounded px-3 py-2 text-xs text-[#1A1816] focus:outline-none focus:border-[#8E744B]" />
                        </div>
                    </div>

                    <!-- Total Calculation -->
                    <div class="p-3 rounded bg-[#FAF8F5] border border-[#E2DCD2] flex items-center justify-between text-xs">
                        <span class="text-[#3D3833]">{{ reservationNights }} Night(s) Stay Total:</span>
                        <span class="text-base font-serif font-semibold text-[#1A1816]">₹{{ estimatedStayTotal.toLocaleString('en-IN') }}</span>
                    </div>

                    <!-- WhatsApp CTA -->
                    <a
                        :href="generateWhatsAppBookingUrl()"
                        target="_blank"
                        class="w-full py-3 rounded bg-[#1C1B1A] text-[#FAF8F5] font-medium text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:bg-[#312E2B] transition-colors"
                    >
                        <MessageCircle class="w-4 h-4" />
                        <span>Send Reservation to Front Desk</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- MODAL 3: FULLSCREEN PHOTO LIGHTBOX                        -->
        <!-- ========================================================= -->
        <div v-if="activeLightboxIndex !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <button @click="closeLightbox()" class="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 z-50">
                <X class="w-5 h-5" />
            </button>

            <button @click="prevLightbox()" class="absolute left-6 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 z-50">
                <ChevronLeft class="w-5 h-5" />
            </button>

            <button @click="nextLightbox()" class="absolute right-6 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 z-50">
                <ChevronRight class="w-5 h-5" />
            </button>

            <div class="max-w-5xl max-h-[85vh] flex flex-col items-center">
                <img
                    :src="filteredGallery[activeLightboxIndex].image"
                    :alt="filteredGallery[activeLightboxIndex].title"
                    class="max-h-[72vh] max-w-full object-contain rounded shadow-2xl border border-white/10"
                />
                <div class="mt-4 text-center">
                    <span class="inline-block px-2.5 py-0.5 rounded bg-[#C5A880] text-[#1C1B1A] font-medium text-[10px] uppercase tracking-wider mb-1">
                        {{ filteredGallery[activeLightboxIndex].categoryLabel }}
                    </span>
                    <h4 class="text-base font-serif text-white">{{ filteredGallery[activeLightboxIndex].title }}</h4>
                    <p class="text-xs text-slate-300 max-w-xl mx-auto mt-1 font-normal">{{ filteredGallery[activeLightboxIndex].caption }}</p>
                </div>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- MODAL 4: YOUTUBE / PROPERTY VIDEO PLAYER MODAL            -->
        <!-- ========================================================= -->
        <div v-if="showVideoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div class="bg-[#1C1B1A] border border-[#2B2825] rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl relative text-left">
                <!-- Modal Header -->
                <div class="p-4 bg-[#141312] border-b border-[#2B2825] flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <Video class="w-4 h-4 text-[#C5A880]" />
                        <h3 class="text-sm font-serif text-[#FAF8F5]">{{ activeVideoTitle }}</h3>
                    </div>
                    <button @click="closeVideoModal" class="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-all">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <!-- Video Iframe Container (16:9 Aspect Ratio) -->
                <div class="relative w-full pb-[56.25%] bg-black">
                    <iframe
                        v-if="activeVideoId"
                        :src="`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0`"
                        :title="activeVideoTitle"
                        class="absolute inset-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>

                <!-- Modal Footer -->
                <div class="p-4 bg-[#141312] border-t border-[#2B2825] flex items-center justify-between text-xs text-[#8C8479]">
                    <span class="flex items-center gap-1.5">
                        <CheckCircle2 class="w-3.5 h-3.5 text-[#C5A880]" /> Verified Live Event Video recorded at Hotel Pleasant View Raebareli
                    </span>
                    <button @click="closeVideoModal" class="px-4 py-1.5 rounded bg-[#2B2825] text-[#FAF8F5] hover:bg-[#3D3833] font-medium transition-colors">
                        Close Player
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
