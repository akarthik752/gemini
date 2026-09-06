export type UserRole = 'farmer' | 'buyer';

export interface Account {
  id: string;
  role: UserRole;
  email: string; // Gmail / Google account email
  username: string; // The user's chosen custom ID / username
  fullName: string;
  phone: string;
  location: string;
  country?: string; // Country name e.g. 'India', 'United States', 'Spain'
  countryCode?: string; // e.g. 'IN', 'US', 'ES'
  farmName?: string; // Specific to farmers
  createdAt: string;
}

export interface PriceHistoryEntry {
  price: number;
  date: string;
  note?: string;
}

export interface ProduceItem {
  id: string;
  farmerId: string;
  farmerUsername: string;
  farmerName: string;
  farmName: string;
  farmerLocation: string;
  farmerPhone: string;
  country?: string; // Country where produce is grown/available e.g. 'India', 'United States'
  countryCode?: string; // e.g. 'IN', 'US', 'ES'
  countryFlag?: string; // e.g. '🇮🇳', '🇺🇸'
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Dairy & Eggs' | 'Herbs & Spices' | 'Honey & Others';
  unit: string; // 'kg', 'quintal', 'liter', 'dozen', 'bunch', 'crate'
  price: number; // The fixed price per unit set by the farmer
  quantity: number; // Available stock
  harvestDate: string;
  description: string;
  imageUrl?: string;
  produceTag?: string; // e.g. 'Organic', 'Farm Fresh', 'Non-GMO', 'Hydroponic'
  status: 'available' | 'low_stock' | 'out_of_stock';
  isFarmerAdded?: boolean; // Set to true for produce directly listed by farmers
  priceHistory: PriceHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  farmerId: string;
  farmName: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  buyerId: string;
  buyerUsername: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  farmerId: string;
  farmName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  item: ProduceItem;
  quantity: number;
}
