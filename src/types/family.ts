export enum RelationCategory {
  Parents = 'parents',
  Siblings = 'siblings',
  SpouseKids = 'spouse_kids',
  Grandparents = 'grandparents',
  Other = 'other',
}

export enum ContactChannel {
  Phone = 'phone',
  WhatsApp = 'whatsapp',
  ViberCall = 'viber_call',
  ViberChat = 'viber_chat',
  Sms = 'sms',
}

export type ViewMode = 'grid' | 'comfort';

export interface FamilyMember {
  id: string;
  name: string;
  relationLabel: string;
  category: RelationCategory;
  phone: string; // E.164 format e.g. +9647701234567
  photoUrl: string;
  isPinned: boolean;
  notes?: string;
  lastContactedAt?: number;
  lastChannel?: ContactChannel;
  createdAt: number;
  order: number;
}

export interface CountryCodeOption {
  code: string;
  countryAr: string;
  placeholder: string;
}
