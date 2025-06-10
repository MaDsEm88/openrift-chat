// packages/shared/types/billing.ts
export interface Subscription {
  _id: string;
  userId: string;
  platform: 'stripe' | 'apple' | 'google';
  externalId: string;
  productId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: number;
  createdAt: number;
  updatedAt: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface CheckoutSession {
  userId: string;
  productId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  platform: 'ios' | 'android' | 'web';
}