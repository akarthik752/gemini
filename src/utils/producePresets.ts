export interface ProduceTemplate {
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Dairy & Eggs' | 'Herbs & Spices' | 'Honey & Others';
  unit: string;
  defaultPrice: number;
  defaultQuantity: number;
  description: string;
  tag: string;
  imageUrl: string;
}

export const CATEGORIES = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains',
  'Dairy & Eggs',
  'Herbs & Spices',
  'Honey & Others',
] as const;

export const UNITS = [
  'kg',
  'quintal',
  'liter',
  'dozen',
  'bunch',
  'crate',
  'bag (25kg)',
  'lb',
] as const;

export const PRODUCE_TEMPLATES: ProduceTemplate[] = [
  {
    name: 'Farm Fresh Organic Tomatoes',
    category: 'Vegetables',
    unit: 'kg',
    defaultPrice: 2.80,
    defaultQuantity: 150,
    description: 'Vine-ripened, pesticide-free juicy red tomatoes directly handpicked this morning.',
    tag: '100% Organic',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Golden Basmati Rice (Aged)',
    category: 'Grains',
    unit: 'bag (25kg)',
    defaultPrice: 42.00,
    defaultQuantity: 40,
    description: 'Traditional long-grain fragrant aged basmati rice harvested directly from paddy fields.',
    tag: 'Premium Grain',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Pure Raw Blossom Honey',
    category: 'Honey & Others',
    unit: 'liter',
    defaultPrice: 14.50,
    defaultQuantity: 65,
    description: 'Unfiltered, pure multi-flora raw bee honey extracted directly from apiaries.',
    tag: 'Raw & Pure',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Crisp Royal Gala Apples',
    category: 'Fruits',
    unit: 'kg',
    defaultPrice: 3.20,
    defaultQuantity: 200,
    description: 'Sweet, crunchy high-altitude orchard apples carefully sorted by size and grade.',
    tag: 'Orchard Fresh',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Fresh Farm Cow Milk',
    category: 'Dairy & Eggs',
    unit: 'liter',
    defaultPrice: 1.60,
    defaultQuantity: 90,
    description: 'Fresh, non-homogenized whole milk from grass-fed pasture-raised cows.',
    tag: 'Pasture Raised',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Free-Range Brown Country Eggs',
    category: 'Dairy & Eggs',
    unit: 'dozen',
    defaultPrice: 4.80,
    defaultQuantity: 50,
    description: 'Farm-fresh fertile brown eggs from hens fed on organic grains and natural forage.',
    tag: 'Free Range',
    imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Green Field Spinach & Herbs',
    category: 'Vegetables',
    unit: 'bunch',
    defaultPrice: 1.25,
    defaultQuantity: 120,
    description: 'Tender baby spinach leaves washed and packed immediately after morning harvest.',
    tag: 'Morning Harvest',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
  },
];
