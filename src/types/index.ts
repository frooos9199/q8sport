export type Locale = "ar" | "en";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  isAdmin?: boolean;
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
  status: "active" | "sold" | "pending";
  createdAt: any;
}

export interface Part {
  id: string;
  userId: string;
  userName: string;
  userWhatsapp: string;
  userAvatar?: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  category: string;
  compatibleBrands: string[];
  price: number;
  condition: "new" | "used";
  images: string[];
  status: "active" | "sold" | "pending";
  createdAt: any;
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userWhatsapp: string;
  userAvatar?: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  category: "car" | "part" | "other";
  budget?: number;
  images?: string[];
  status: "open" | "closed";
  createdAt: any;
}

export const CAR_BRANDS = [
  "Porsche", "Ferrari", "Lamborghini", "McLaren", "Bugatti",
  "Aston Martin", "Maserati", "BMW", "Mercedes-Benz", "Audi",
  "Nissan", "Toyota", "Chevrolet", "Ford", "Dodge",
  "Jaguar", "Bentley", "Rolls-Royce", "Lexus", "Other"
];
