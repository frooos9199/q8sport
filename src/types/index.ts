export type Locale = "ar" | "en";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  phoneDigits?: string;
  whatsappDigits?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  disabled?: boolean;
  deletedAt?: any;
  avatar?: string;
  createdAt: any;
}

export interface Car {
  id: string;
  userId: string;
  userName: string;
  userWhatsapp: string;
  userPhone?: string;
  userAvatar?: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  transmission: "automatic" | "manual";
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  images: string[];
  imageThumbs?: string[];
  status: "active" | "sold" | "pending";
  createdAt: any;
  updatedAt?: any;
}

export interface Part {
  id: string;
  userId: string;
  userName: string;
  userWhatsapp: string;
  userPhone?: string;
  userAvatar?: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  category: string;
  compatibleBrands: string[];
  price: number;
  condition: "new" | "used";
  images: string[];
  imageThumbs?: string[];
  status: "active" | "sold" | "pending";
  createdAt: any;
  updatedAt?: any;
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userWhatsapp: string;
  userPhone?: string;
  userAvatar?: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  category: "car" | "part" | "other";
  budget?: number;
  images?: string[];
  imageThumbs?: string[];
  status: "open" | "closed";
  createdAt: any;
  updatedAt?: any;
}

export interface BannerAd {
  id: string;
  title?: string;
  imageUrl: string;
  targetUrl?: string;
  placements?: BannerPlacement[];
  isActive: boolean;
  createdBy: string;
  createdAt: any;
  updatedAt?: any;
  sortOrder?: number;
}

export type BannerPlacement = 'home' | 'cars' | 'parts';

export const CAR_BRANDS = [
  "Porsche", "Ferrari", "Lamborghini", "McLaren", "Bugatti",
  "Aston Martin", "Maserati", "BMW", "Mercedes-Benz", "Audi",
  "Nissan", "Toyota", "Mitsubishi", "Subaru", "Honda", "Chevrolet", "Ford", "Dodge",
  "Jaguar", "Bentley", "Rolls-Royce", "Lexus", "Other"
];
