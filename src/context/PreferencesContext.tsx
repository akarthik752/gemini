import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CountryInfo, SUPPORTED_COUNTRIES, getCountryByCode } from '../utils/countries';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rate: number; // relative to USD = 1.0
  flag: string;
  decimals: number;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const ALL_CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.50, flag: '🇮🇳', decimals: 2 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.00, flag: '🇺🇸', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, flag: '🇪🇺', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79, flag: '🇬🇧', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', rate: 3.67, flag: '🇦🇪', decimals: 2 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR ', rate: 3.75, flag: '🇸🇦', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.36, flag: '🇨🇦', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52, flag: '🇦🇺', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 155.0, flag: '🇯🇵', decimals: 0 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24, flag: '🇨🇳', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.35, flag: '🇸🇬', decimals: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF ', rate: 0.90, flag: '🇨🇭', decimals: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 1.64, flag: '🇳🇿', decimals: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.25, flag: '🇧🇷', decimals: 2 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R ', rate: 18.50, flag: '🇿🇦', decimals: 2 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 90.0, flag: '🇷🇺', decimals: 2 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 32.5, flag: '🇹🇷', decimals: 2 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1370.0, flag: '🇰🇷', decimals: 0 },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', rate: 17.0, flag: '🇲🇽', decimals: 2 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 58.0, flag: '🇵🇭', decimals: 2 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 36.5, flag: '🇹🇭', decimals: 2 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp ', rate: 16200.0, flag: '🇮🇩', decimals: 0 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM ', rate: 4.70, flag: '🇲🇾', decimals: 2 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 117.0, flag: '🇧🇩', decimals: 2 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨ ', rate: 278.0, flag: '🇵🇰', decimals: 2 },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs ', rate: 302.0, flag: '🇱🇰', decimals: 2 },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू ', rate: 133.5, flag: '🇳🇵', decimals: 2 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh ', rate: 130.0, flag: '🇰🇪', decimals: 2 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1450.0, flag: '🇳🇬', decimals: 2 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£ ', rate: 47.5, flag: '🇪🇬', decimals: 2 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 25400.0, flag: '🇻🇳', decimals: 0 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD ', rate: 0.31, flag: '🇰🇼', decimals: 3 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR ', rate: 3.64, flag: '🇶🇦', decimals: 2 },
];

export const ALL_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tl', name: 'Filipino', nativeName: 'Tagalog', flag: '🇵🇭' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
];

// Core UI translation dictionaries
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    settings: 'Settings',
    home: 'Home',
    profile: 'Profile',
    passwordChange: 'Password Change',
    orders: 'Orders',
    contact: 'Contact',
    logout: 'Logout',
    signIn: 'Sign In',
    language: 'Language',
    currency: 'Currency',
    languageCurrency: 'Language & Currency',
    farmerPortal: 'Farmer Producer Portal',
    buyerMarketplace: 'Buyer Marketplace',
    fixedPricing: 'Fixed Pricing',
    farmToConsumer: 'Direct Farm-to-Consumer Protocol',
    searchPlaceholder: 'Search produce name, farm origin, or region...',
    allCategories: 'All',
    vegetables: 'Vegetables',
    fruits: 'Fruits',
    grains: 'Grains',
    dairyEggs: 'Dairy & Eggs',
    herbsSpices: 'Herbs & Spices',
    honeyOthers: 'Honey & Others',
    sortFresh: 'Fresh Harvest (Newest)',
    sortLowToHigh: 'Price: Low to High',
    sortHighToLow: 'Price: High to Low',
    farmerFixedPrice: 'Farmer Fixed Price',
    direct: 'Direct',
    inStock: 'available',
    soldOut: 'Sold Out',
    addToCart: 'Add to Basket',
    orderProduct: 'Order Product',
    specification: 'Specification',
    harvest: 'Harvest',
    cart: 'Basket',
    checkout: 'Checkout',
    totalAmount: 'Total Amount',
    deliveryAddress: 'Delivery Address',
    contactPhone: 'Contact Phone',
    placeOrder: 'Confirm & Place Direct Order',
    listNewHarvest: 'List New Harvest Crop',
    cropName: 'Crop Name',
    category: 'Category',
    pricePerUnit: 'Fixed Price per Unit',
    availableStock: 'Available Stock',
    totalRevenue: 'Total Revenue',
    ordersReceived: 'Orders Received',
    saveProfile: 'Save Profile',
    updatePassword: 'Update Password',
    selectLanguage: 'Select Language',
    selectCurrency: 'Select Currency',
    preferencesTitle: 'Display & Regional Preferences',
    preferencesSubtitle: 'Configure your localized language and preferred currency across all pricing',
  },
  hi: {
    settings: 'सेटिंग्स',
    home: 'होम',
    profile: 'प्रोफ़ाइल',
    passwordChange: 'पासवर्ड बदलें',
    orders: 'ऑर्डर',
    contact: 'संपर्क करें',
    logout: 'लॉग आउट',
    signIn: 'साइन इन करें',
    language: 'भाषा',
    currency: 'मुद्रा',
    languageCurrency: 'भाषा और मुद्रा',
    farmerPortal: 'किसान पोर्टल',
    buyerMarketplace: 'उपभोक्ता मंडी',
    fixedPricing: 'निश्चित मूल्य',
    farmToConsumer: 'सीधा खेत से ग्राहक तक',
    searchPlaceholder: 'फसल का नाम, खेत या क्षेत्र खोजें...',
    allCategories: 'सभी',
    vegetables: 'सब्जियाँ',
    fruits: 'फल',
    grains: 'अनाज',
    dairyEggs: 'डेयरी और अंडे',
    herbsSpices: 'जड़ी-बूटी और मसाले',
    honeyOthers: 'शहद और अन्य',
    sortFresh: 'ताजा फसल (नई)',
    sortLowToHigh: 'मूल्य: कम से ज्यादा',
    sortHighToLow: 'मूल्य: ज्यादा से कम',
    farmerFixedPrice: 'किसान का निश्चित मूल्य',
    direct: 'प्रत्यक्ष',
    inStock: 'उपलब्ध',
    soldOut: 'बिक गया',
    addToCart: 'टोकरी में डालें',
    orderProduct: 'अभी ऑर्डर करें',
    specification: 'विवरण',
    harvest: 'कटाई',
    cart: 'टोकरी',
    checkout: 'चेकआउट',
    totalAmount: 'कुल राशि',
    deliveryAddress: 'डिलीवरी का पता',
    contactPhone: 'संपर्क फोन',
    placeOrder: 'सीधा ऑर्डर दें',
    listNewHarvest: 'नई फसल सूची बनाएं',
    cropName: 'फसल का नाम',
    category: 'श्रेणी',
    pricePerUnit: 'प्रति इकाई निश्चित मूल्य',
    availableStock: 'उपलब्ध भंडार',
    totalRevenue: 'कुल आय',
    ordersReceived: 'प्राप्त ऑर्डर',
    saveProfile: 'प्रोफ़ाइल सहेजें',
    updatePassword: 'पासवर्ड अपडेट करें',
    selectLanguage: 'भाषा चुनें',
    selectCurrency: 'मुद्रा चुनें',
    preferencesTitle: 'प्रदर्शन और क्षेत्रीय प्राथमिकताएँ',
    preferencesSubtitle: 'अपनी स्थानीय भाषा और पसंदीदा मूल्य मुद्रा चुनें',
  },
  es: {
    settings: 'Ajustes',
    home: 'Inicio',
    profile: 'Perfil',
    passwordChange: 'Cambiar Contraseña',
    orders: 'Pedidos',
    contact: 'Contacto',
    logout: 'Cerrar Sesión',
    signIn: 'Iniciar Sesión',
    language: 'Idioma',
    currency: 'Moneda',
    languageCurrency: 'Idioma y Moneda',
    farmerPortal: 'Portal del Agricultor',
    buyerMarketplace: 'Mercado de Compradores',
    fixedPricing: 'Precio Fijo',
    farmToConsumer: 'Del Campo al Consumidor Directo',
    searchPlaceholder: 'Buscar productos, finca o región...',
    allCategories: 'Todos',
    vegetables: 'Verduras',
    fruits: 'Frutas',
    grains: 'Granos',
    dairyEggs: 'Lácteos y Huevos',
    herbsSpices: 'Hierbas y Especias',
    honeyOthers: 'Miel y Otros',
    sortFresh: 'Cosecha Fresca (Más reciente)',
    sortLowToHigh: 'Precio: Menor a Mayor',
    sortHighToLow: 'Precio: Mayor a Menor',
    farmerFixedPrice: 'Precio Fijo del Agricultor',
    direct: 'Directo',
    inStock: 'disponible',
    soldOut: 'Agotado',
    addToCart: 'Añadir a la Cesta',
    orderProduct: 'Pedir Producto',
    specification: 'Especificación',
    harvest: 'Cosecha',
    cart: 'Cesta',
    checkout: 'Pagar',
    totalAmount: 'Total a Pagar',
    deliveryAddress: 'Dirección de Entrega',
    contactPhone: 'Teléfono de Contacto',
    placeOrder: 'Confirmar Pedido Directo',
    listNewHarvest: 'Publicar Nueva Cosecha',
    cropName: 'Nombre del Cultivo',
    category: 'Categoría',
    pricePerUnit: 'Precio Fijo por Unidad',
    availableStock: 'Stock Disponible',
    totalRevenue: 'Ingresos Totales',
    ordersReceived: 'Pedidos Recibidos',
    saveProfile: 'Guardar Perfil',
    updatePassword: 'Actualizar Contraseña',
    selectLanguage: 'Seleccionar Idioma',
    selectCurrency: 'Seleccionar Moneda',
    preferencesTitle: 'Preferencias Regionales',
    preferencesSubtitle: 'Configure su idioma y moneda de precios en toda la plataforma',
  },
  fr: {
    settings: 'Paramètres',
    home: 'Accueil',
    profile: 'Profil',
    passwordChange: 'Changer Mot de Passe',
    orders: 'Commandes',
    contact: 'Contact',
    logout: 'Déconnexion',
    signIn: 'Se Connecter',
    language: 'Langue',
    currency: 'Devise',
    languageCurrency: 'Langue et Devise',
    farmerPortal: 'Portail Producteur Agricole',
    buyerMarketplace: 'Marché Acheteur',
    fixedPricing: 'Prix Fixe Garanti',
    farmToConsumer: 'Direct Ferme au Consommateur',
    searchPlaceholder: 'Rechercher un produit, une ferme...',
    allCategories: 'Tous',
    vegetables: 'Légumes',
    fruits: 'Fruits',
    grains: 'Céréales',
    dairyEggs: 'Produits Laitiers et Œufs',
    herbsSpices: 'Herbes et Épices',
    honeyOthers: 'Miel et Autres',
    sortFresh: 'Récolte Fraîche (Plus récent)',
    sortLowToHigh: 'Prix : Croissant',
    sortHighToLow: 'Prix : Décroissant',
    farmerFixedPrice: 'Prix Fixe Producteur',
    direct: 'Direct',
    inStock: 'disponible',
    soldOut: 'Épuisé',
    addToCart: 'Ajouter au Panier',
    orderProduct: 'Commander',
    specification: 'Fiche Produit',
    harvest: 'Récolte',
    cart: 'Panier',
    checkout: 'Commander',
    totalAmount: 'Montant Total',
    deliveryAddress: 'Adresse de Livraison',
    contactPhone: 'Téléphone',
    placeOrder: 'Confirmer Commande Directe',
    listNewHarvest: 'Ajouter Nouvelle Récolte',
    cropName: 'Nom de la Culture',
    category: 'Catégorie',
    pricePerUnit: 'Prix Fixe Unitaire',
    availableStock: 'Stock Disponible',
    totalRevenue: 'Revenus Totaux',
    ordersReceived: 'Commandes Reçues',
    saveProfile: 'Enregistrer Profil',
    updatePassword: 'Mettre à Jour Mot de Passe',
    selectLanguage: 'Choisir la Langue',
    selectCurrency: 'Choisir la Devise',
    preferencesTitle: 'Préférences Régionales',
    preferencesSubtitle: 'Configurez la langue et la devise de tarification',
  },
  de: {
    settings: 'Einstellungen',
    home: 'Startseite',
    profile: 'Profil',
    passwordChange: 'Passwort Ändern',
    orders: 'Bestellungen',
    contact: 'Kontakt',
    logout: 'Abmelden',
    signIn: 'Anmelden',
    language: 'Sprache',
    currency: 'Währung',
    languageCurrency: 'Sprache & Währung',
    farmerPortal: 'Bauern-Portal',
    buyerMarketplace: 'Marktplatz',
    fixedPricing: 'Festpreis',
    farmToConsumer: 'Direkt vom Hof zum Verbraucher',
    searchPlaceholder: 'Erzeugnis, Hof oder Region suchen...',
    allCategories: 'Alle',
    vegetables: 'Gemüse',
    fruits: 'Früchte',
    grains: 'Getreide',
    dairyEggs: 'Milch & Eier',
    herbsSpices: 'Kräuter & Gewürze',
    honeyOthers: 'Honig & Sonstiges',
    sortFresh: 'Frische Ernte (Neueste)',
    sortLowToHigh: 'Preis: Niedrig bis Hoch',
    sortHighToLow: 'Preis: Hoch bis Niedrig',
    farmerFixedPrice: 'Bauern-Festpreis',
    direct: 'Direkt',
    inStock: 'verfügbar',
    soldOut: 'Ausverkauft',
    addToCart: 'In den Warenkorb',
    orderProduct: 'Produkt Bestellen',
    specification: 'Spezifikation',
    harvest: 'Ernte',
    cart: 'Warenkorb',
    checkout: 'Zur Kasse',
    totalAmount: 'Gesamtbetrag',
    deliveryAddress: 'Lieferadresse',
    contactPhone: 'Telefonnummer',
    placeOrder: 'Direktbestellung Aufgeben',
    listNewHarvest: 'Neue Ernte Einstellen',
    cropName: 'Erzeugnis-Name',
    category: 'Kategorie',
    pricePerUnit: 'Festpreis pro Einheit',
    availableStock: 'Verfügbarer Vorrat',
    totalRevenue: 'Gesamtumsatz',
    ordersReceived: 'Eingegangene Bestellungen',
    saveProfile: 'Profil Speichern',
    updatePassword: 'Passwort Aktualisieren',
    selectLanguage: 'Sprache Wählen',
    selectCurrency: 'Währung Wählen',
    preferencesTitle: 'Regionale Einstellungen',
    preferencesSubtitle: 'Sprache und gewünschte Währung konfigurieren',
  },
  zh: {
    settings: '设置',
    home: '首页',
    profile: '个人资料',
    passwordChange: '修改密码',
    orders: '订单',
    contact: '联系客服',
    logout: '退出登录',
    signIn: '登录',
    language: '语言',
    currency: '货币',
    languageCurrency: '语言与货币',
    farmerPortal: '农户直销门户',
    buyerMarketplace: '买家集市',
    fixedPricing: '固定一口价',
    farmToConsumer: '农场直达消费者协议',
    searchPlaceholder: '搜索农产品、产地农场或地区...',
    allCategories: '全部',
    vegetables: '新鲜蔬菜',
    fruits: '时令水果',
    grains: '优质粮谷',
    dairyEggs: '乳品蛋禽',
    herbsSpices: '香料草药',
    honeyOthers: '天然蜂蜜及其他',
    sortFresh: '最新采摘 (最新)',
    sortLowToHigh: '价格：从低到高',
    sortHighToLow: '价格：从高到低',
    farmerFixedPrice: '农户定价 (不砍价)',
    direct: '直供',
    inStock: '现货库存',
    soldOut: '已售罄',
    addToCart: '加入购物车',
    orderProduct: '立即下单',
    specification: '产品详情',
    harvest: '采摘日期',
    cart: '购物车',
    checkout: '结算',
    totalAmount: '订单总计',
    deliveryAddress: '收货地址',
    contactPhone: '联系电话',
    placeOrder: '确认提交直销订单',
    listNewHarvest: '发布新收获批次',
    cropName: '农作物名称',
    category: '品类',
    pricePerUnit: '每单位固定单价',
    availableStock: '可供库存量',
    totalRevenue: '累计销售额',
    ordersReceived: '已接订单数',
    saveProfile: '保存资料',
    updatePassword: '更新密码',
    selectLanguage: '切换语言',
    selectCurrency: '切换货币',
    preferencesTitle: '语言与货币偏好设置',
    preferencesSubtitle: '在全平台无缝切换您的母语和结算货币汇率',
  },
  ar: {
    settings: 'الإعدادات',
    home: 'الرئيسية',
    profile: 'الملف الشخصي',
    passwordChange: 'تغيير كلمة المرور',
    orders: 'الطلبات',
    contact: 'الاتصال بالدعم',
    logout: 'تسجيل الخروج',
    signIn: 'تسجيل الدخول',
    language: 'اللغة',
    currency: 'العملة',
    languageCurrency: 'اللغة والعملة',
    farmerPortal: 'بوابة المزارع والمنتج',
    buyerMarketplace: 'سوق المشترين',
    fixedPricing: 'سعر محدد وثابت',
    farmToConsumer: 'من المزرعة للمستهلك مباشرة',
    searchPlaceholder: 'ابحث عن المحاصيل، المزارع...',
    allCategories: 'الكل',
    vegetables: 'خضروات',
    fruits: 'فواكه',
    grains: 'حبوب',
    dairyEggs: 'ألبان وبيض',
    herbsSpices: 'أعشاب وتوابل',
    honeyOthers: 'عسل ومنتجات أخرى',
    sortFresh: 'الحصاد الطازج (الأحدث)',
    sortLowToHigh: 'السعر: من الأقل للأعلى',
    sortHighToLow: 'السعر: من الأعلى للأقل',
    farmerFixedPrice: 'السعر الثابت للمزارع',
    direct: 'مباشر',
    inStock: 'متوفر',
    soldOut: 'نفد من المخزون',
    addToCart: 'أضف للسلة',
    orderProduct: 'طلب المنتج الآن',
    specification: 'المواصفات',
    harvest: 'الحصاد',
    cart: 'السلة',
    checkout: 'الدفع والإنهاء',
    totalAmount: 'المبلغ الإجمالي',
    deliveryAddress: 'عنوان التوصيل',
    contactPhone: 'رقم الهاتف',
    placeOrder: 'تأكيد وإرسال الطلب',
    listNewHarvest: 'إدراج محصول جديد',
    cropName: 'اسم المحصول',
    category: 'الفئة',
    pricePerUnit: 'السعر المحدد لكل وحدة',
    availableStock: 'الكمية المتوفرة',
    totalRevenue: 'إجمالي الأرباح',
    ordersReceived: 'الطلبات المستلمة',
    saveProfile: 'حفظ الملف',
    updatePassword: 'تحديث كلمة المرور',
    selectLanguage: 'اختر اللغة',
    selectCurrency: 'اختر العملة',
    preferencesTitle: 'تفضيلات العرض والمنطقة',
    preferencesSubtitle: 'خصص لغتك المفضلة وعملة الأسعار بسهولة',
  },
  te: {
    settings: 'సెట్టింగ్‌లు',
    home: 'హోమ్',
    profile: 'ప్రొఫైల్',
    passwordChange: 'పాస్‌వర్డ్ మార్చండి',
    orders: 'ఆర్డర్లు',
    contact: 'సంప్రదించండి',
    logout: 'లాగౌట్',
    signIn: 'సైన్ ఇన్',
    language: 'భాష',
    currency: 'కరెన్సీ',
    languageCurrency: 'భాష & కరెన్సీ',
    farmerPortal: 'రైతు పోర్టల్',
    buyerMarketplace: 'వినియోగదారుల మార్కెట్',
    fixedPricing: 'స్థిర ధర',
    farmToConsumer: 'రైతు పొలం నుండి నేరుగా మీకు',
    searchPlaceholder: 'పంట పేరు, గ్రామం లేదా ప్రాంతం వెతకండి...',
    allCategories: 'అన్ని',
    vegetables: 'కూరగాయలు',
    fruits: 'పండ్లు',
    grains: 'ధాన్యాలు',
    dairyEggs: 'డైరీ & గుడ్లు',
    herbsSpices: 'మసాలాలు & మూలికలు',
    honeyOthers: 'తేనె & ఇతరములు',
    sortFresh: 'తాజా పంట (తాజా)',
    sortLowToHigh: 'ధర: తక్కువ నుండి ఎక్కువ',
    sortHighToLow: 'ధర: ఎక్కువ నుండి తక్కువ',
    farmerFixedPrice: 'రైతు స్థిర ధర',
    direct: 'నేరుగా',
    inStock: 'అందుబాటులో ఉంది',
    soldOut: 'పూర్తయింది',
    addToCart: 'బుట్టలో చేర్చండి',
    orderProduct: 'ఆర్డర్ చేయండి',
    specification: 'వివరాలు',
    harvest: 'కోత',
    cart: 'బుట్ట',
    checkout: 'చెక్‌అవుట్',
    totalAmount: 'మొత్తం ధర',
    deliveryAddress: 'డెలివరీ చిరునామా',
    contactPhone: 'ఫోన్ నంబర్',
    placeOrder: 'ఆర్డర్ ఖరారు చేయండి',
    listNewHarvest: 'కొత్త పంట నమోదు చేయండి',
    cropName: 'పంట పేరు',
    category: 'వర్గం',
    pricePerUnit: 'యూనిట్ స్థిర ధర',
    availableStock: 'లభ్యమైన నిల్వ',
    totalRevenue: 'మొత్తం రాబడి',
    ordersReceived: 'వచ్చిన ఆర్డర్లు',
    saveProfile: 'సేవ్ చేయండి',
    updatePassword: 'పాస్‌వర్డ్ నవీకరించండి',
    selectLanguage: 'భాష ఎంచుకోండి',
    selectCurrency: 'కరెన్సీ ఎంచుకోండి',
    preferencesTitle: 'ప్రాంతీయ ప్రాధాన్యతలు',
    preferencesSubtitle: 'మీ స్థానిక భాష మరియు ధరల కరెన్సీని ఎంచుకోండి',
  },
  ta: {
    settings: 'அமைப்புகள்',
    home: 'முகப்பு',
    profile: 'சுயவிவரம்',
    passwordChange: 'கடவுச்சொல் மாற்று',
    orders: 'ஆர்டர்கள்',
    contact: 'தொடர்பு கொள்ள',
    logout: 'வெளியேறு',
    signIn: 'உள்நுழைக',
    language: 'மொழி',
    currency: 'நாணயம்',
    languageCurrency: 'மொழி மற்றும் நாணயம்',
    farmerPortal: 'விவசாயி தளம்',
    buyerMarketplace: 'வாங்குவோர் சந்தை',
    fixedPricing: 'நிலையான விலை',
    farmToConsumer: 'பண்ணையிலிருந்து நேரடியாக வாடிக்கையாளருக்கு',
    searchPlaceholder: 'பயிர் பெயர் அல்லது ஊரைத் தேடுங்கள்...',
    allCategories: 'அனைத்தும்',
    vegetables: 'காய்கறிகள்',
    fruits: 'பழங்கள்',
    grains: 'தானியங்கள்',
    dairyEggs: 'பால் மற்றும் முட்டை',
    herbsSpices: 'மூலிகைகள் & மசாலாக்கள்',
    honeyOthers: 'தேன் மற்றும் பிற',
    sortFresh: 'புதிய அறுவடை',
    sortLowToHigh: 'விலை: குறைவிலிருந்து அதிகம்',
    sortHighToLow: 'விலை: அதிகத்திலிருந்து குறைவு',
    farmerFixedPrice: 'விவசாயி நிர்ணயித்த விலை',
    direct: 'நேரடி',
    inStock: 'இருப்பில் உள்ளது',
    soldOut: 'தீர்ந்துவிட்டது',
    addToCart: 'கூடையில் சேர்க்கவும்',
    orderProduct: 'ஆர்டர் செய்க',
    specification: 'விவரக்குறிப்பு',
    harvest: 'அறுவடை',
    cart: 'கூடை',
    checkout: 'செக் அவுட்',
    totalAmount: 'மொத்த தொகை',
    deliveryAddress: 'டெலிவரி முகவரி',
    contactPhone: 'தொலைபேசி எண்',
    placeOrder: 'நேரடி ஆர்டரை உறுதிசெய்',
    listNewHarvest: 'புதிய பயிரைப் பட்டியலிடுங்கள்',
    cropName: 'பயிர் பெயர்',
    category: 'வகை',
    pricePerUnit: 'ஒரு யூனிட் விலை',
    availableStock: 'கிடைக்கும் இருப்பு',
    totalRevenue: 'மொத்த வருவாய்',
    ordersReceived: 'பெறப்பட்ட ஆர்டர்கள்',
    saveProfile: 'சுயவிவரத்தைச் சேமி',
    updatePassword: 'கடவுச்சொல்லைப் புதுப்பி',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    selectCurrency: 'நாணயத்தைத் தேர்ந்தெடுக்கவும்',
    preferencesTitle: 'விருப்பத்தேர்வுகள்',
    preferencesSubtitle: 'உங்கள் மொழி மற்றும் விலைக் குறியீட்டைத் தேர்ந்தெடுக்கவும்',
  },
};

interface PreferencesContextType {
  currency: CurrencyInfo;
  language: LanguageInfo;
  selectedCountry: CountryInfo | null;
  setCurrencyByCode: (code: string) => void;
  setLanguageByCode: (code: string) => void;
  setSelectedCountryByCode: (code: string | null, syncCurrency?: boolean) => void;
  formatPrice: (amountInUSD: number, options?: { showCode?: boolean; decimals?: number }) => string;
  convertPrice: (amountInUSD: number) => number;
  t: (key: string, fallback?: string) => string;
  currencies: CurrencyInfo[];
  languages: LanguageInfo[];
  countries: CountryInfo[];
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const PREF_STORAGE_KEYS = {
  CURRENCY: 'agri_pref_currency_v1',
  LANGUAGE: 'agri_pref_language_v1',
  COUNTRY: 'agri_pref_country_v1',
};

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to INR or previously saved currency
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(PREF_STORAGE_KEYS.CURRENCY);
      if (saved && ALL_CURRENCIES.some(c => c.code === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'INR'; // default to Indian Rupee as requested
  });

  // Country selection: defaults to null (showing all countries) or saved country code
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(PREF_STORAGE_KEYS.COUNTRY);
      if (saved && SUPPORTED_COUNTRIES.some(c => c.code === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return null; // null means 'All Countries'
  });

  // Default to English or previously saved language
  const [languageCode, setLanguageCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(PREF_STORAGE_KEYS.LANGUAGE);
      if (saved && ALL_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const currency = useMemo(() => {
    return ALL_CURRENCIES.find(c => c.code === currencyCode) || ALL_CURRENCIES[0];
  }, [currencyCode]);

  const language = useMemo(() => {
    return ALL_LANGUAGES.find(l => l.code === languageCode) || ALL_LANGUAGES[0];
  }, [languageCode]);

  const selectedCountry = useMemo(() => {
    if (!selectedCountryCode) return null;
    return getCountryByCode(selectedCountryCode) || null;
  }, [selectedCountryCode]);

  const setSelectedCountryByCode = (code: string | null, syncCurrency: boolean = false) => {
    if (!code) {
      setSelectedCountryCode(null);
      try {
        localStorage.removeItem(PREF_STORAGE_KEYS.COUNTRY);
      } catch (err) {
        console.error('Failed to remove country preference', err);
      }
      return;
    }

    const found = getCountryByCode(code);
    if (found) {
      setSelectedCountryCode(found.code);
      try {
        localStorage.setItem(PREF_STORAGE_KEYS.COUNTRY, found.code);
      } catch (err) {
        console.error('Failed to save country preference', err);
      }

      // Optionally align currency to the country's native currency
      if (syncCurrency && found.defaultCurrencyCode) {
        setCurrencyByCode(found.defaultCurrencyCode);
      }
    }
  };

  const setCurrencyByCode = (code: string) => {
    const found = ALL_CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrencyCode(code);
      try {
        localStorage.setItem(PREF_STORAGE_KEYS.CURRENCY, code);
      } catch (err) {
        console.error('Failed to save currency', err);
      }
    }
  };

  const setLanguageByCode = (code: string) => {
    const found = ALL_LANGUAGES.find(l => l.code === code);
    if (found) {
      setLanguageCode(code);
      try {
        localStorage.setItem(PREF_STORAGE_KEYS.LANGUAGE, code);
      } catch (err) {
        console.error('Failed to save language', err);
      }
    }
  };

  const convertPrice = (amountInUSD: number): number => {
    if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) return 0;
    return Number((amountInUSD * currency.rate).toFixed(currency.decimals));
  };

  const formatPrice = (
    amountInUSD: number, 
    options?: { showCode?: boolean; decimals?: number }
  ): string => {
    if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) {
      return `${currency.symbol}0.00`;
    }

    const converted = amountInUSD * currency.rate;
    const decimals = options?.decimals !== undefined ? options.decimals : currency.decimals;

    // Localize formatted number
    const formattedNum = converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    if (options?.showCode) {
      return `${currency.symbol}${formattedNum} ${currency.code}`;
    }
    return `${currency.symbol}${formattedNum}`;
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language.code];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <PreferencesContext.Provider
      value={{
        currency,
        language,
        selectedCountry,
        setCurrencyByCode,
        setLanguageByCode,
        setSelectedCountryByCode,
        formatPrice,
        convertPrice,
        t,
        currencies: ALL_CURRENCIES,
        languages: ALL_LANGUAGES,
        countries: SUPPORTED_COUNTRIES,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
