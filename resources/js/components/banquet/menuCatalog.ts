// -------------------------------------------------------------
// Official Docx Menu Catalogs (Extracted from 499, 799, 999 docx)
// -------------------------------------------------------------
export interface MenuCatalogTier {
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

export const menuCatalogs: Record<499 | 799 | 999 | 1199, MenuCatalogTier> = {
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
