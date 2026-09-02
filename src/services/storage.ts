import { Account, ProduceItem, Order, UserRole, OrderStatus } from '../types';

const STORAGE_KEYS = {
  ACCOUNTS: 'agri_market_accounts_v1',
  PRODUCE_ITEMS: 'agri_market_produce_items_v1',
  ORDERS: 'agri_market_orders_v1',
  ACTIVE_SESSION: 'agri_market_active_session_v1',
  FARMER_SESSION: 'agri_market_farmer_session_v1',
  BUYER_SESSION: 'agri_market_buyer_session_v1',
};

// Cross-tab / cross-component communication channel
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('agri_market_sync_channel') 
  : null;

export const dispatchSyncEvent = (type: string, payload?: any) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agri_market_update', { detail: { type, payload } }));
    try {
      broadcastChannel?.postMessage({ type, payload });
    } catch {
      // Ignore broadcast errors in restricted environments
    }
  }
};

export const subscribeToSync = (callback: (data: { type: string; payload?: any }) => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail || { type: 'unknown' });
  };

  const handleBroadcast = (event: MessageEvent) => {
    callback(event.data || { type: 'unknown' });
  };

  window.addEventListener('agri_market_update', handleCustomEvent);
  broadcastChannel?.addEventListener('message', handleBroadcast);

  return () => {
    window.removeEventListener('agri_market_update', handleCustomEvent);
    broadcastChannel?.removeEventListener('message', handleBroadcast);
  };
};

// Accounts Management (No pre-existing IDs!)
export const getAccounts = (): Account[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read accounts', err);
    return [];
  }
};

export const saveAccount = (account: Omit<Account, 'id' | 'createdAt'>): { success: boolean; error?: string; account?: Account } => {
  const accounts = getAccounts();
  const normalizedUsername = account.username.trim().toLowerCase();
  const normalizedEmail = (account.email || `${account.username.trim()}@gmail.com`).trim().toLowerCase();

  if (!normalizedUsername) {
    return { success: false, error: 'User ID / Username is required' };
  }

  // Enforce unique user ID / username or email for this role
  const usernameExists = accounts.some(a => a.username.toLowerCase() === normalizedUsername);
  if (usernameExists) {
    return { success: false, error: `The ID "${account.username}" is already registered. Please choose a different ID or log in.` };
  }

  const newAccount: Account = {
    ...account,
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    username: account.username.trim(),
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  setRoleSession(newAccount.role, newAccount);
  dispatchSyncEvent('accounts_updated');

  return { success: true, account: newAccount };
};

export const updateAccount = (
  accountId: string,
  updates: Partial<Omit<Account, 'id' | 'role' | 'createdAt'>>
): { success: boolean; error?: string; account?: Account } => {
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.id === accountId);

  if (index === -1) {
    return { success: false, error: 'Account not found' };
  }

  const existing = accounts[index];

  // If email is changing, verify no duplicate
  if (updates.email && updates.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
    const emailConflict = accounts.some(
      a => a.id !== accountId && a.email.toLowerCase() === updates.email!.trim().toLowerCase()
    );
    if (emailConflict) {
      return { success: false, error: 'This email is already in use by another profile.' };
    }
  }

  const updatedAccount: Account = {
    ...existing,
    ...updates,
    fullName: updates.fullName !== undefined ? updates.fullName.trim() : existing.fullName,
    phone: updates.phone !== undefined ? updates.phone.trim() : existing.phone,
    location: updates.location !== undefined ? updates.location.trim() : existing.location,
    farmName: updates.farmName !== undefined ? updates.farmName?.trim() : existing.farmName,
    email: updates.email !== undefined ? updates.email.trim().toLowerCase() : existing.email,
  };

  accounts[index] = updatedAccount;
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

  // Sync active session if this is the active user
  const active = getActiveSession();
  if (active && active.id === accountId) {
    setActiveSession(updatedAccount);
  }

  setRoleSession(updatedAccount.role, updatedAccount);
  dispatchSyncEvent('accounts_updated', updatedAccount);

  return { success: true, account: updatedAccount };
};

export const changeAccountPassword = (
  accountId: string,
  newPass: string
): { success: boolean; error?: string } => {
  if (!newPass || newPass.trim().length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }
  // Record security update timestamp and credentials
  try {
    const key = `agri_pwd_${accountId}`;
    localStorage.setItem(key, JSON.stringify({
      updatedAt: new Date().toISOString(),
      secured: true
    }));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update password' };
  }
};

export const authenticateAccount = (
  identifier: string, 
  role: UserRole
): { success: boolean; error?: string; account?: Account } => {
  const accounts = getAccounts();
  const normalized = identifier.trim().toLowerCase();

  const found = accounts.find(
    a => a.username.toLowerCase() === normalized || a.email.toLowerCase() === normalized
  );

  if (!found) {
    return { 
      success: false, 
      error: `No account found with ID or Gmail "${identifier}". Please register first.` 
    };
  }

  if (found.role !== role) {
    return {
      success: false,
      error: `Account "${identifier}" is registered as a ${found.role.toUpperCase()}, not a ${role.toUpperCase()}. Please sign in with a dedicated ${role.toUpperCase()} Gmail account.`
    };
  }

  setActiveSession(found);
  setRoleSession(role, found);
  return { success: true, account: found };
};

// Login or register directly using a Google / Gmail account
export const loginWithGmail = (
  email: string,
  role: UserRole,
  extraDetails?: {
    fullName?: string;
    farmName?: string;
    location?: string;
    phone?: string;
  }
): { success: boolean; error?: string; account?: Account } => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid Gmail address (e.g. yourname@gmail.com)' };
  }

  const accounts = getAccounts();
  const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);

  if (existing) {
    if (existing.role !== role) {
      return {
        success: false,
        error: `Gmail "${cleanEmail}" is already registered as a ${existing.role.toUpperCase()}. Switching to ${role.toUpperCase()} requires signing in with another Gmail account.`
      };
    }
    setActiveSession(existing);
    setRoleSession(role, existing);
    return { success: true, account: existing };
  }

  // Derive username and name from email
  const emailPrefix = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '_');
  let candidateUsername = emailPrefix;
  let counter = 1;
  while (accounts.some(a => a.username.toLowerCase() === candidateUsername.toLowerCase())) {
    candidateUsername = `${emailPrefix}_${counter++}`;
  }

  const defaultName = extraDetails?.fullName?.trim() || 
    emailPrefix.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 
    (role === 'farmer' ? 'Local Farmer' : 'Direct Consumer');

  const newAccount: Account = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    role,
    email: cleanEmail,
    username: candidateUsername,
    fullName: defaultName,
    phone: extraDetails?.phone?.trim() || 'N/A',
    location: extraDetails?.location?.trim() || (role === 'farmer' ? 'Local Valley Farms' : 'Metro Delivery Area'),
    farmName: role === 'farmer' ? (extraDetails?.farmName?.trim() || `${defaultName}'s Harvest Farm`) : undefined,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  setActiveSession(newAccount);
  setRoleSession(role, newAccount);
  dispatchSyncEvent('accounts_updated');

  return { success: true, account: newAccount };
};

// Role-specific and active session management
export const getRoleSession = (role: UserRole): Account | null => {
  if (typeof window === 'undefined') return null;
  try {
    const key = role === 'farmer' ? STORAGE_KEYS.FARMER_SESSION : STORAGE_KEYS.BUYER_SESSION;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setRoleSession = (role: UserRole, account: Account | null) => {
  if (typeof window === 'undefined') return;
  const key = role === 'farmer' ? STORAGE_KEYS.FARMER_SESSION : STORAGE_KEYS.BUYER_SESSION;
  if (account) {
    localStorage.setItem(key, JSON.stringify(account));
  } else {
    localStorage.removeItem(key);
  }
};

// Active Session Management
export const getActiveSession = (): Account | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setActiveSession = (account: Account | null) => {
  if (typeof window === 'undefined') return;
  if (account) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(account));
    setRoleSession(account.role, account);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }
  dispatchSyncEvent('session_changed', account);
};

// Produce Items Management (Seeds fresh harvest items if empty)
export const SEED_PRODUCE_ITEMS: ProduceItem[] = [
  {
    id: 'prod_tomatoes_01',
    farmerId: 'usr_farmer_sarah',
    farmerUsername: 'sarah_farms',
    farmerName: 'Sarah Jenkins',
    farmName: 'Green Valley Organic Estate',
    farmerLocation: 'Sonoma Valley, CA',
    farmerPhone: '+1 (707) 555-0142',
    name: 'Farm Fresh Organic Tomatoes',
    category: 'Vegetables',
    unit: 'kg',
    price: 2.80,
    quantity: 140,
    harvestDate: '2026-09-01',
    description: 'Vine-ripened, pesticide-free juicy red tomatoes handpicked fresh this morning. 100% direct farmer pricing.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    produceTag: '100% Organic',
    status: 'available',
    priceHistory: [
      { price: 2.80, date: new Date().toISOString(), note: 'Initial Fixed Price' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'prod_apples_02',
    farmerId: 'usr_farmer_marcus',
    farmerUsername: 'marcus_orchards',
    farmerName: 'Marcus Lindqvist',
    farmName: 'Highland Crest Orchards',
    farmerLocation: 'Yakima Valley, WA',
    farmerPhone: '+1 (509) 555-0188',
    name: 'Crisp Royal Gala Apples',
    category: 'Fruits',
    unit: 'kg',
    price: 3.20,
    quantity: 200,
    harvestDate: '2026-08-30',
    description: 'Sweet, crunchy mountain-grown Gala apples sorted by size and brix sweetness. Direct from grower.',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    produceTag: 'Orchard Fresh',
    status: 'available',
    priceHistory: [
      { price: 3.20, date: new Date().toISOString(), note: 'Initial Fixed Price' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'prod_honey_03',
    farmerId: 'usr_farmer_elena',
    farmerUsername: 'elena_apiary',
    farmerName: 'Elena Rostova',
    farmName: 'Wild Blossom Apiary',
    farmerLocation: 'Willamette Valley, OR',
    farmerPhone: '+1 (503) 555-0199',
    name: 'Pure Raw Blossom Honey',
    category: 'Honey & Others',
    unit: 'liter',
    price: 14.50,
    quantity: 65,
    harvestDate: '2026-08-28',
    description: 'Unfiltered, cold-extracted raw wildflower honey with active enzymes and pollen intact.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    produceTag: 'Raw & Pure',
    status: 'available',
    priceHistory: [
      { price: 14.50, date: new Date().toISOString(), note: 'Initial Fixed Price' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'prod_rice_04',
    farmerId: 'usr_farmer_raj',
    farmerUsername: 'singh_harvest',
    farmerName: 'Rajinder Singh',
    farmName: 'Fertile Plains Farms',
    farmerLocation: 'Sacramento Delta, CA',
    farmerPhone: '+1 (916) 555-0122',
    name: 'Golden Basmati Rice (Aged)',
    category: 'Grains',
    unit: 'bag (25kg)',
    price: 42.00,
    quantity: 40,
    harvestDate: '2026-08-15',
    description: 'Traditional long-grain aged aromatic basmati rice from family paddy fields. Direct mill packing.',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    produceTag: 'Premium Grain',
    status: 'available',
    priceHistory: [
      { price: 42.00, date: new Date().toISOString(), note: 'Initial Fixed Price' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: 'prod_milk_05',
    farmerId: 'usr_farmer_sarah',
    farmerUsername: 'sarah_farms',
    farmerName: 'Sarah Jenkins',
    farmName: 'Green Valley Organic Estate',
    farmerLocation: 'Sonoma Valley, CA',
    farmerPhone: '+1 (707) 555-0142',
    name: 'Fresh Pasture Whole Milk',
    category: 'Dairy & Eggs',
    unit: 'liter',
    price: 1.60,
    quantity: 85,
    harvestDate: '2026-09-02',
    description: 'Non-homogenized whole milk from grass-fed pasture-raised cows bottled within hours of milking.',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    produceTag: 'Pasture Raised',
    status: 'available',
    priceHistory: [
      { price: 1.60, date: new Date().toISOString(), note: 'Initial Fixed Price' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'prod_spinach_06',
    farmerId: 'usr_farmer_sarah',
    farmerUsername: 'sarah_farms',
    farmerName: 'Sarah Jenkins',
    farmName: 'Green Valley Organic Estate',
    farmerLocation: 'Sonoma Valley, CA',
    farmerPhone: '+1 (707) 555-0142',
    name: 'Crisp Baby Spinach Leaves',
    category: 'Vegetables',
    unit: 'bunch',
    price: 1.25,
    quantity: 95,
    harvestDate: '2026-09-02',
    description: 'Tender baby spinach leaves triple-washed and packed fresh at morning harvest.',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    produceTag: 'Morning Harvest',
    status: 'available',
    priceHistory: [
      { price: 1.25, date: new Date().toISOString(), note: 'Initial Fixed Price' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  }
];

export const getProduceItems = (): ProduceItem[] => {
  if (typeof window === 'undefined') return SEED_PRODUCE_ITEMS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCE_ITEMS);
    if (!data) {
      // Initialize with seed items so the marketplace is ready to browse & order immediately
      localStorage.setItem(STORAGE_KEYS.PRODUCE_ITEMS, JSON.stringify(SEED_PRODUCE_ITEMS));
      return SEED_PRODUCE_ITEMS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read produce items', err);
    return SEED_PRODUCE_ITEMS;
  }
};

export const addProduceItem = (
  itemData: Omit<ProduceItem, 'id' | 'createdAt' | 'updatedAt' | 'priceHistory' | 'status'>
): ProduceItem => {
  const items = getProduceItems();
  const now = new Date().toISOString();

  const newItem: ProduceItem = {
    ...itemData,
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    status: itemData.quantity <= 0 ? 'out_of_stock' : itemData.quantity < 10 ? 'low_stock' : 'available',
    priceHistory: [
      {
        price: itemData.price,
        date: now,
        note: 'Initial Fixed Price',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.PRODUCE_ITEMS, JSON.stringify(items));
  dispatchSyncEvent('produce_updated', newItem);
  return newItem;
};

// Fix / Update Price Feature
export const fixProducePrice = (
  itemId: string, 
  newPrice: number, 
  farmerId: string,
  note?: string
): { success: boolean; error?: string; item?: ProduceItem } => {
  const items = getProduceItems();
  const index = items.findIndex(i => i.id === itemId);

  if (index === -1) {
    return { success: false, error: 'Produce item not found' };
  }

  const currentItem = items[index];
  if (currentItem.farmerId !== farmerId) {
    return { success: false, error: 'Unauthorized: Only the listing farmer can fix the price of this item' };
  }

  if (newPrice <= 0) {
    return { success: false, error: 'Fixed price must be greater than 0' };
  }

  const now = new Date().toISOString();
  const updatedItem: ProduceItem = {
    ...currentItem,
    price: newPrice,
    updatedAt: now,
    priceHistory: [
      {
        price: newPrice,
        date: now,
        note: note || `Price updated from $${currentItem.price.toFixed(2)} to $${newPrice.toFixed(2)}`,
      },
      ...currentItem.priceHistory,
    ],
  };

  items[index] = updatedItem;
  localStorage.setItem(STORAGE_KEYS.PRODUCE_ITEMS, JSON.stringify(items));
  dispatchSyncEvent('produce_updated', updatedItem);

  return { success: true, item: updatedItem };
};

export const updateProduceQuantity = (
  itemId: string,
  quantityDelta: number,
  farmerId: string
): { success: boolean; error?: string; item?: ProduceItem } => {
  const items = getProduceItems();
  const index = items.findIndex(i => i.id === itemId);

  if (index === -1) {
    return { success: false, error: 'Produce item not found' };
  }

  const currentItem = items[index];
  if (currentItem.farmerId !== farmerId) {
    return { success: false, error: 'Unauthorized: Only listing farmer can adjust stock' };
  }

  const newQty = Math.max(0, currentItem.quantity + quantityDelta);
  const now = new Date().toISOString();
  const updatedItem: ProduceItem = {
    ...currentItem,
    quantity: newQty,
    status: newQty <= 0 ? 'out_of_stock' : newQty < 10 ? 'low_stock' : 'available',
    updatedAt: now,
  };

  items[index] = updatedItem;
  localStorage.setItem(STORAGE_KEYS.PRODUCE_ITEMS, JSON.stringify(items));
  dispatchSyncEvent('produce_updated', updatedItem);

  return { success: true, item: updatedItem };
};

export const deleteProduceItem = (
  itemId: string, 
  farmerId: string
): { success: boolean; error?: string } => {
  const items = getProduceItems();
  const item = items.find(i => i.id === itemId);

  if (!item) {
    return { success: false, error: 'Item not found' };
  }

  if (item.farmerId !== farmerId) {
    return { success: false, error: 'Unauthorized to delete this item' };
  }

  const filtered = items.filter(i => i.id !== itemId);
  localStorage.setItem(STORAGE_KEYS.PRODUCE_ITEMS, JSON.stringify(filtered));
  dispatchSyncEvent('produce_updated', { deletedId: itemId });

  return { success: true };
};

// Orders Management
export const getOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read orders', err);
    return [];
  }
};

export interface BuyerCheckoutInput {
  id?: string;
  username?: string;
  fullName: string;
  phone: string;
  location?: string;
  role?: UserRole;
}

export const placeOrder = (
  buyer: Account | BuyerCheckoutInput,
  cartItems: Array<{ item: ProduceItem; quantity: number }>,
  deliveryAddress: string,
  buyerPhone: string,
  notes?: string
): { success: boolean; error?: string; ordersCreated?: Order[]; buyerAccount?: Account } => {
  if (cartItems.length === 0) {
    return { success: false, error: 'Cart is empty. Please add produce items before ordering.' };
  }

  const finalAddress = (deliveryAddress || buyer.location || '').trim();
  if (!finalAddress) {
    return { success: false, error: 'Please enter a valid shipping / delivery address.' };
  }

  const finalPhone = (buyerPhone || buyer.phone || '').trim();
  if (!finalPhone) {
    return { success: false, error: 'Please provide a contact phone number for delivery updates.' };
  }

  const finalName = (buyer.fullName || 'Valued Buyer').trim();

  // Ensure buyer has an Account representation
  let actualBuyerAccount: Account;
  const accounts = getAccounts();

  if (buyer.id) {
    const existing = accounts.find(a => a.id === buyer.id);
    if (existing) {
      actualBuyerAccount = existing;
    } else {
      actualBuyerAccount = {
        id: buyer.id,
        email: (buyer as any).email || `${buyer.username || 'buyer'}@gmail.com`,
        username: buyer.username || 'buyer_' + Math.random().toString(36).substring(2, 6),
        fullName: finalName,
        phone: finalPhone,
        location: finalAddress,
        role: 'buyer',
        createdAt: new Date().toISOString(),
      };
      accounts.push(actualBuyerAccount);
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }
  } else {
    // Guest checkout: automatically create dynamic buyer account so user can track order
    const autoUsername = finalName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'buyer_' + Math.random().toString(36).substring(2, 6);
    let uniqueUsername = autoUsername;
    let counter = 1;
    while (accounts.some(a => a.username.toLowerCase() === uniqueUsername.toLowerCase())) {
      uniqueUsername = `${autoUsername}${counter++}`;
    }

    actualBuyerAccount = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      email: `${uniqueUsername}@gmail.com`,
      username: uniqueUsername,
      fullName: finalName,
      phone: finalPhone,
      location: finalAddress,
      role: 'buyer',
      createdAt: new Date().toISOString(),
    };
    accounts.push(actualBuyerAccount);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    setActiveSession(actualBuyerAccount);
    dispatchSyncEvent('accounts_updated');
  }

  const allItems = getProduceItems();
  const now = new Date().toISOString();

  // Validate stock
  for (const { item, quantity } of cartItems) {
    const current = allItems.find(i => i.id === item.id);
    if (!current || current.quantity < quantity) {
      return { 
        success: false, 
        error: `Insufficient stock for "${item.name}". Available: ${current ? current.quantity : 0} ${item.unit}` 
      };
    }
  }

  // Deduct stock
  cartItems.forEach(({ item, quantity }) => {
    const idx = allItems.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      allItems[idx].quantity -= quantity;
      allItems[idx].status = allItems[idx].quantity <= 0 ? 'out_of_stock' : allItems[idx].quantity < 10 ? 'low_stock' : 'available';
      allItems[idx].updatedAt = now;
    }
  });
  localStorage.setItem(STORAGE_KEYS.PRODUCE_ITEMS, JSON.stringify(allItems));

  // Group items by farmer so each farmer gets an order
  const ordersByFarmer = new Map<string, Array<{ item: ProduceItem; quantity: number }>>();
  cartItems.forEach(cartItem => {
    const fId = cartItem.item.farmerId;
    if (!ordersByFarmer.has(fId)) {
      ordersByFarmer.set(fId, []);
    }
    ordersByFarmer.get(fId)!.push(cartItem);
  });

  const existingOrders = getOrders();
  const createdOrders: Order[] = [];

  ordersByFarmer.forEach((itemsForFarmer, farmerId) => {
    const firstItem = itemsForFarmer[0].item;
    const orderItems = itemsForFarmer.map(ci => ({
      itemId: ci.item.id,
      itemName: ci.item.name,
      unit: ci.item.unit,
      unitPrice: ci.item.price,
      quantity: ci.quantity,
      totalPrice: Number((ci.item.price * ci.quantity).toFixed(2)),
      farmerId: ci.item.farmerId,
      farmName: ci.item.farmName,
    }));

    const totalAmount = Number(
      orderItems.reduce((sum, it) => sum + it.totalPrice, 0).toFixed(2)
    );

    const order: Order = {
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      buyerId: actualBuyerAccount.id,
      buyerUsername: actualBuyerAccount.username,
      buyerName: actualBuyerAccount.fullName,
      buyerPhone: finalPhone,
      deliveryAddress: finalAddress,
      farmerId: farmerId,
      farmName: firstItem.farmName,
      items: orderItems,
      totalAmount,
      status: 'pending',
      notes,
      createdAt: now,
      updatedAt: now,
    };

    createdOrders.push(order);
    existingOrders.unshift(order);
  });

  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));
  dispatchSyncEvent('produce_updated');
  dispatchSyncEvent('orders_updated');

  return { success: true, ordersCreated: createdOrders, buyerAccount: actualBuyerAccount };
};

export const updateOrderStatus = (
  orderId: string,
  newStatus: OrderStatus,
  farmerId: string
): { success: boolean; error?: string } => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);

  if (index === -1) {
    return { success: false, error: 'Order not found' };
  }

  if (orders[index].farmerId !== farmerId) {
    return { success: false, error: 'Unauthorized: Only the assigned farmer can update this order status' };
  }

  orders[index].status = newStatus;
  orders[index].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  dispatchSyncEvent('orders_updated', orders[index]);

  return { success: true };
};

export const resetStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
  localStorage.setItem(STORAGE_KEYS.PRODUCE_ITEMS, JSON.stringify(SEED_PRODUCE_ITEMS));
  localStorage.removeItem(STORAGE_KEYS.ORDERS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  dispatchSyncEvent('all_reset');
};
