export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const ROUTES = {
  CUSTOMER: '/menu',
  STAFF: '/tickets',
  DRIVER: '/jobs',
  ADMIN: '/admin/staffs',
  menu: "/menu",
  cart: "/cart",
  orders: (id: string) => `/orders/${id}`,
} as const;

// ---------------------------------------------------------------------------
// Static UI Config
// ---------------------------------------------------------------------------

/** Header navigation links */
export const NAV_LINKS = [
  { href: '/promotions', label: 'Promotions' },
  { href: '/menu', label: 'Menu' },
] as const;

/** Footer — menu category links */
export const FOOTER_MENU_LINKS = [
  { href: '/menu/fried-chicken', label: 'Fried Chicken' },
  { href: '/menu/burgers', label: 'Burgers' },
  { href: '/menu/drinks', label: 'Drinks' },
  { href: '/menu/combos', label: 'Combos' },
] as const;

/** Footer — help/policy links */
export const FOOTER_HELP_LINKS = [
  { href: '/support', label: 'Support' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
] as const;

/** Footer & brand info — static, không có API */
export const CONTACT_INFO = {
  brandName: 'FoodGo',
  tagline: 'The best fried chicken and burgers in town, delivered hot and fresh to your doorstep.',
  address: {
    street: '123 Food Street, District 1',
    city: 'Ho Chi Minh City',
  },
  phone: '1900-8888',
} as const;

/**
 * Tabs filter UI trên trang chủ — đây là UI config, không ánh xạ với category backend.
 * Khi gọi API thực, frontend sẽ filter theo tag/field riêng (e.g. featured=true, isNew=true).
 */
export const PRODUCT_TABS = [
  { id: 'must-try', label: 'Must Try' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'new', label: 'New Items' },
] as const;

/**
 * Style cho promo banners trang chủ — UI-only
 * Index tương ứng với thứ tự banner trong MOCK_PROMO_BANNERS / API response.
 */
export const PROMO_BANNER_STYLES = [
  {
    bgGradient: 'from-gray-900 to-gray-800',
    labelColor: 'text-yellow-400',
    ctaStyle: 'bg-white text-gray-900 hover:bg-gray-100',
  },
  {
    bgGradient: 'from-red-600 to-red-500',
    labelColor: 'text-white',
    ctaStyle: 'bg-white text-red-600 hover:bg-gray-100',
  },
] as const;

/**
 * Màu gradient background cho từng hero slide — UI-only, backend không trả về.
 * Index tương ứng với thứ tự slide trong MOCK_HERO_SLIDES / API response.
 */
export const HERO_SLIDE_COLORS = [
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
  'from-red-500 to-red-600',
] as const;

// ---------------------------------------------------------------------------
// Static Banner / Slide Data (moved from /mocks — no backend endpoint)
// ---------------------------------------------------------------------------

/** Hero carousel slides on the homepage */
export const HERO_SLIDES = [
  {
    id: 'slide-001',
    title: 'BIG DEAL',
    subtitle: '50% OFF',
    description: 'Crispy Chicken Bucket Family Feast',
    imageUrl: '/1.png',
    ctaText: 'Order Now',
    ctaLink: '/menu',
  },
  {
    id: 'slide-002',
    title: 'WEEKEND SPECIAL',
    subtitle: 'BUY 1 GET 1',
    description: 'Delicious Burgers & Crispy Fries',
    imageUrl: '/2.png',
    ctaText: 'Get Offer',
    ctaLink: '/menu',
  },
  {
    id: 'slide-003',
    title: 'FAMILY FEAST',
    subtitle: 'PIZZA & MORE',
    description: 'Pizza, Burger, Chicken & Drinks Combo',
    imageUrl: '/3.png',
    ctaText: 'Try Now',
    ctaLink: '/menu',
  },
];

/** Promotional banners displayed at the bottom of the homepage */
export const PROMO_BANNERS = [
  {
    id: 'promo-001',
    label: 'Weekend Special',
    title: 'BUY 1 GET 1\nFREE',
    imageUrl: '/Image-menu.png',
    ctaText: 'Get Code',
    ctaLink: '/promotions',
  },
  {
    id: 'promo-002',
    label: 'New Customers',
    title: 'FREE SHIPPING\nFIRST ORDER',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070',
    ctaText: 'Order Now',
    ctaLink: '/register',
  },
];
