// types.tsx — Shared TypeScript types for WishSync

export interface Person {
  id: string;
  name: string;
  nickname: string;
  color: string;
  initial: string;
  birthday?: string;
}

export interface WishImage {
  tint: string;
  label: string;
}

export type Priority = "must" | "love" | "nice";
export type OccasionTag = "Birthday" | "Christmas" | "Anniversary" | "Valentine's" | "Just because";

export interface Reactions {
  heart: number;
  eyes: number;
  gift: number;
}

export interface Reservation {
  by: string;
  at?: string;
}

export interface Wish {
  id: string;
  title: string;
  image: WishImage;
  price: number;
  originalPrice?: number;
  currency: string;
  store: string;
  storeUrl?: string;
  category: string;
  priority: Priority;
  occasion: OccasionTag;
  notes: string;
  reserved?: Reservation | null;
  reactions: Reactions;
  discount?: boolean;
}

export interface Occasion {
  id: string;
  title: string;
  date: string;
  day: string;
  month: string;
  daysAway: number;
  person: string;
  color: "peach" | "blush" | "butter" | "sage";
}

export interface HistoryItem {
  id: string;
  title: string;
  for: string;
  by: string;
  date: string;
  price: number;
  image: WishImage;
}

export type ViewId = "dashboard" | "partner" | "mine" | "detail" | "groups" | "occasions" | "history" | "profile";

export interface PriorityInfo {
  label: string;
  pill: string;
}
