export type Locale = "ar" | "en";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  credits?: {
    trialPoints?: number;
    paidPoints?: number;
    totalSpentPoints?: number;
    updatedAt?: number;
  };
  phoneDigits?: string;
  whatsappDigits?: string;
  campaign?: {
    activityScore?: number;
    founderPosition?: number;
    freeAdsEligible?: boolean;
    tierLabel?: string;
    rewardLabel?: string;
    listingCounts?: {
      cars: number;
      parts: number;
      wanted: number;
      active: number;
      total: number;
    };
    updatedAt?: number;
  };
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
  imageUrl?: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
  images: string[];
  imageThumbs?: string[];
  imageMediums?: string[];
  status: "active" | "sold" | "pending";
  featuredAt?: number | null;
  views?: number;
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
  imageUrl?: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
  images: string[];
  imageThumbs?: string[];
  imageMediums?: string[];
  status: "active" | "sold" | "pending";
  featuredAt?: number | null;
  views?: number;
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
  imageUrl?: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
  images?: string[];
  imageThumbs?: string[];
  imageMediums?: string[];
  status: "open" | "closed";
  views?: number;
  createdAt: any;
  updatedAt?: any;
}

export interface BannerAd {
  id: string;
  title?: string;
  imageUrl: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
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
  "Nissan", "Toyota", "Mitsubishi", "Subaru", "Honda", "Mazda", "Suzuki",
  "Hyundai", "Kia", "Genesis", "Chevrolet", "Ford", "Dodge", "GMC", "Cadillac", "Jeep",
  "Jaguar", "Bentley", "Rolls-Royce", "Lexus", "Infiniti", "Land Rover", "Range Rover", "Mini", "Volkswagen", "Volvo", "Tesla",
  "MG", "Geely", "BYD", "Changan", "GAC", "Haval", "Jetour", "Chery", "Other"
];
