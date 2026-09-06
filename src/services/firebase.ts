import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Account, ProduceItem, Order } from '../types';

// Resolved configuration supporting both direct config and Render / Vite env variables
const activeFirebaseConfig = {
  projectId: (import.meta.env?.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfig.projectId,
  appId: (import.meta.env?.VITE_FIREBASE_APP_ID as string) || firebaseConfig.appId,
  apiKey: (import.meta.env?.VITE_FIREBASE_API_KEY as string) || firebaseConfig.apiKey,
  authDomain: (import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfig.authDomain,
  firestoreDatabaseId: (import.meta.env?.VITE_FIREBASE_DATABASE_ID as string) || firebaseConfig.firestoreDatabaseId || '(default)',
  storageBucket: (import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfig.messagingSenderId,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(activeFirebaseConfig) : getApp();

// Initialize Firestore with specific database ID from config
export const db: Firestore = getFirestore(
  app, 
  activeFirebaseConfig.firestoreDatabaseId || '(default)'
);

// Collections
export const COLLECTIONS = {
  PRODUCE: 'produce',
  ORDERS: 'orders',
  ACCOUNTS: 'accounts'
} as const;

/**
 * Real-time listener for all produce items across devices
 */
export const subscribeToCloudProduce = (callback: (items: ProduceItem[]) => void) => {
  try {
    const produceCol = collection(db, COLLECTIONS.PRODUCE);
    return onSnapshot(produceCol, (snapshot) => {
      const items: ProduceItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ProduceItem;
        if (data && data.id) {
          items.push(data);
        }
      });
      callback(items);
    }, (error) => {
      console.warn('Firestore produce sync notice:', error.message);
    });
  } catch (err) {
    console.warn('Failed to subscribe to cloud produce:', err);
    return () => {};
  }
};

/**
 * Real-time listener for orders across devices
 */
export const subscribeToCloudOrders = (callback: (orders: Order[]) => void) => {
  try {
    const ordersCol = collection(db, COLLECTIONS.ORDERS);
    return onSnapshot(ordersCol, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Order;
        if (data && data.id) {
          orders.push(data);
        }
      });
      callback(orders);
    }, (error) => {
      console.warn('Firestore orders sync notice:', error.message);
    });
  } catch (err) {
    console.warn('Failed to subscribe to cloud orders:', err);
    return () => {};
  }
};

/**
 * Save or update a produce item in Firestore
 */
export const saveCloudProduceItem = async (item: ProduceItem): Promise<boolean> => {
  try {
    const itemRef = doc(db, COLLECTIONS.PRODUCE, item.id);
    await setDoc(itemRef, item, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save produce to cloud:', err);
    return false;
  }
};

/**
 * Delete a produce item from Firestore
 */
export const deleteCloudProduceItem = async (itemId: string): Promise<boolean> => {
  try {
    const itemRef = doc(db, COLLECTIONS.PRODUCE, itemId);
    await deleteDoc(itemRef);
    return true;
  } catch (err) {
    console.warn('Failed to delete produce from cloud:', err);
    return false;
  }
};

/**
 * Save an order in Firestore
 */
export const saveCloudOrder = async (order: Order): Promise<boolean> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, order.id);
    await setDoc(orderRef, order, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save order to cloud:', err);
    return false;
  }
};

/**
 * Save an account in Firestore so farmers/buyers can log in across devices
 */
export const saveCloudAccount = async (account: Account): Promise<boolean> => {
  try {
    const accountRef = doc(db, COLLECTIONS.ACCOUNTS, account.id);
    await setDoc(accountRef, account, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save account to cloud:', err);
    return false;
  }
};

/**
 * Fetch all cloud accounts to allow cross-device login
 */
export const fetchCloudAccounts = async (): Promise<Account[]> => {
  try {
    const accountsCol = collection(db, COLLECTIONS.ACCOUNTS);
    const snap = await getDocs(accountsCol);
    const accounts: Account[] = [];
    snap.forEach((d) => {
      const data = d.data() as Account;
      if (data && data.id) {
        accounts.push(data);
      }
    });
    return accounts;
  } catch (err) {
    console.warn('Failed to fetch cloud accounts:', err);
    return [];
  }
};
