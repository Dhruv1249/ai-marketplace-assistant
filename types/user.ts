export interface User {
  id: string;
  email: string;
  name: string;
  role: 'seller' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Seller extends User {
  role: 'seller';
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
  verified: boolean;
  subscription: SubscriptionPlan;
}

export interface SubscriptionPlan {
  type: 'free' | 'basic' | 'premium';
  maxProducts: number;
  aiGenerationsPerMonth: number;
  customBranding: boolean;
  analyticsAccess: boolean;
  expiresAt?: Date;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}