export type Locale = "ar" | "en";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatar?: string;
  createdAt: Date;
}

export interface Car {
  id: string;
  userId: string;
  userName: string;
  userWhatsapp: string;
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
  tags: string[];
  ratings: Rating[];
  status: "active" | "sold" | "pending";
  createdAt: Date;
}

export interface Part {
  id: string;
  userId: string;
  userName: string;
  userWhatsapp: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  category: string;
  compatibleBrands: string[];
  price: number;
  condition: "new" | "used";
  images: string[];
  status: "active" | "sold" | "pending";
  createdAt: Date;
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userWhatsapp: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  category: "car" | "part" | "other";
  budget?: number;
  status: "open" | "closed";
  createdAt: Date;
}

export interface Rating {
  label: string;
  value: number;
}

export interface GalleryItem {
  id: string;
  title: { ar: string; en: string };
  images: string[];
  videoUrl?: string;
  createdAt: Date;
}

export const CAR_BRANDS = [
  "Porsche", "Ferrari", "Lamborghini", "McLaren", "Bugatti",
  "Aston Martin", "Maserati", "BMW", "Mercedes-Benz", "Audi",
  "Nissan", "Toyota", "Chevrolet", "Ford", "Dodge",
  "Jaguar", "Bentley", "Rolls-Royce", "Lexus", "Other"
];

export const PRESET_RATINGS: Rating[] = [
  { label: "بائع موثوق", value: 5 },
  { label: "سعر ممتاز", value: 4 },
  { label: "سيارة نظيفة", value: 5 },
  { label: "وصف دقيق", value: 4 },
  { label: "تجاوب سريع", value: 5 },
  { label: "سعر مبالغ فيه", value: 2 },
  { label: "وصف غير دقيق", value: 1 },
];

export const PART_CATEGORIES = [
  "engine", "body", "interior", "wheels", "exhaust",
  "suspension", "brakes", "electrical", "accessories", "other"
];
