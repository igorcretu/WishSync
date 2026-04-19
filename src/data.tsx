// data.tsx — Seed data for WishSync

import type { Person, Wish, WishImage, Occasion, HistoryItem, OccasionTag, Priority, PriorityInfo } from './types';

export const ME: Person = {
  id: "me",
  name: "Nora",
  nickname: "Nora",
  color: "#F2C2C9",
  initial: "N",
  birthday: "Jun 14",
};

export const PARTNER: Person = {
  id: "partner",
  name: "Theo",
  nickname: "Theo",
  color: "#BED6B0",
  initial: "T",
  birthday: "Mar 02",
};

export const FRIENDS: Person[] = [
  { id: "mika", name: "Mika", nickname: "Mika", color: "#F6E2A8", initial: "M" },
  { id: "juno", name: "Juno", nickname: "Juno", color: "#D4C5E8", initial: "J" },
  { id: "sam",  name: "Sam",  nickname: "Sam",  color: "#B8D4E3", initial: "S" },
];

export const PH = (tint: string, label: string): WishImage => ({ tint, label });

export const PARTNER_WISHES: Wish[] = [
  {
    id: "p1",
    title: "Hario V60 Ceramic Dripper",
    image: PH("#E9C969", "ceramic dripper"),
    price: 42, originalPrice: 58, currency: "$",
    store: "Blue Bottle Coffee",
    category: "Kitchen",
    priority: "must",
    occasion: "Birthday",
    notes: "Size 02, white preferred. He broke his old one last month :(",
    reserved: null,
    reactions: { heart: 2, eyes: 1, gift: 0 },
    discount: true,
  },
  {
    id: "p2",
    title: "Japanese Selvedge Denim",
    image: PH("#B8D4E3", "indigo jeans"),
    price: 240, currency: "$",
    store: "Kapital",
    category: "Clothing",
    priority: "love",
    occasion: "Just because",
    notes: "Size 32, raw indigo. Wants the tapered cut — NOT the straight.",
    reserved: { by: "mika" },
    reactions: { heart: 4, eyes: 2, gift: 1 },
  },
  {
    id: "p3",
    title: "Le Creuset Dutch Oven",
    image: PH("#F6B89A", "dutch oven"),
    price: 380, currency: "$",
    store: "Williams Sonoma",
    category: "Kitchen",
    priority: "love",
    occasion: "Anniversary",
    notes: "5.5qt, 'Dune' colorway. For Sunday ragùs.",
    reserved: null,
    reactions: { heart: 6, eyes: 3, gift: 2 },
  },
  {
    id: "p4",
    title: "Moleskine Weekly Planner",
    image: PH("#F2C2C9", "leather notebook"),
    price: 28, currency: "$",
    store: "Moleskine",
    category: "Stationery",
    priority: "nice",
    occasion: "Just because",
    notes: "Hardcover, A5, dot grid. 2026 edition.",
    reserved: null,
    reactions: { heart: 1, eyes: 0, gift: 0 },
  },
  {
    id: "p5",
    title: "Teva Original Universal",
    image: PH("#BED6B0", "sandals"),
    price: 58, originalPrice: 75, currency: "$",
    store: "Teva",
    category: "Footwear",
    priority: "nice",
    occasion: "Just because",
    notes: "Size 10, black. For the summer hiking trip.",
    reserved: null,
    reactions: { heart: 2, eyes: 1, gift: 0 },
    discount: true,
  },
  {
    id: "p6",
    title: "Aesop Hand Balm Trio",
    image: PH("#D4C5E8", "skincare trio"),
    price: 65, currency: "$",
    store: "Aesop",
    category: "Beauty",
    priority: "nice",
    occasion: "Valentine's",
    notes: "Resurrection, Reverence, and Rind. Glass bottles, recycle 🙏",
    reserved: { by: "juno" },
    reactions: { heart: 3, eyes: 1, gift: 0 },
  },
];

export const MY_WISHES: Wish[] = [
  {
    id: "m1",
    title: "Seiko 5 Sports Automatic",
    image: PH("#B8D4E3", "wrist watch"),
    price: 295, currency: "$",
    store: "Hodinkee",
    category: "Accessories",
    priority: "must",
    occasion: "Birthday",
    notes: "The 'Field' variant, green dial, 39mm.",
    reactions: { heart: 2, eyes: 3, gift: 0 },
  },
  {
    id: "m2",
    title: "Kaweco Sport Fountain Pen",
    image: PH("#F6E2A8", "fountain pen"),
    price: 32, currency: "$",
    store: "Goulet Pens",
    category: "Stationery",
    priority: "love",
    occasion: "Just because",
    notes: "Fine nib, navy body.",
    reactions: { heart: 1, eyes: 0, gift: 0 },
  },
  {
    id: "m3",
    title: "Ghibli Studio Tote",
    image: PH("#BED6B0", "canvas tote"),
    price: 48, currency: "$",
    store: "Donguri Republic",
    category: "Bags",
    priority: "love",
    occasion: "Just because",
    notes: "Totoro or Kiki print, both are cute.",
    reactions: { heart: 4, eyes: 2, gift: 1 },
  },
  {
    id: "m4",
    title: "La Marzocco Linea Mini",
    image: PH("#F6B89A", "espresso machine"),
    price: 6500, currency: "$",
    store: "La Marzocco",
    category: "Kitchen",
    priority: "nice",
    occasion: "Just because",
    notes: "Dream item. I know it's a lot. Just here in case I win the lottery.",
    reactions: { heart: 8, eyes: 12, gift: 0 },
  },
];

export const OCCASIONS: Occasion[] = [
  { id: "o1", circleId: '', title: "Theo's Birthday", date: "Mar 02", day: "02", month: "MAR", daysAway: 12, person: "partner", color: "sage" },
  { id: "o2", circleId: '', title: "Anniversary", date: "May 18", day: "18", month: "MAY", daysAway: 89, person: "both", color: "blush" },
  { id: "o3", circleId: '', title: "Nora's Birthday", date: "Jun 14", day: "14", month: "JUN", daysAway: 116, person: "me", color: "butter" },
  { id: "o4", circleId: '', title: "Mika's Birthday", date: "Jul 28", day: "28", month: "JUL", daysAway: 160, person: "mika", color: "peach" },
];

export const PURCHASED: HistoryItem[] = [
  { id: "h1", title: "Noise-Cancelling Headphones", for: "Theo", by: "Nora", date: "Dec 25, 2025", price: 349, image: PH("#2B2420", "headphones") },
  { id: "h2", title: "Cashmere Scarf", for: "Nora", by: "Theo", date: "Dec 25, 2025", price: 180, image: PH("#F2C2C9", "scarf") },
  { id: "h3", title: "Vinyl Record Set", for: "Theo", by: "Mika", date: "Nov 14, 2025", price: 95, image: PH("#F6E2A8", "vinyl records") },
  { id: "h4", title: "Linen Bedding", for: "Nora", by: "Juno", date: "Jun 14, 2025", price: 210, image: PH("#BED6B0", "bedding set") },
];

export const CATEGORIES: string[] = ["All", "Kitchen", "Clothing", "Beauty", "Stationery", "Accessories", "Footwear", "Bags"];
export const OCCASION_TAGS: OccasionTag[] = ["Birthday", "Christmas", "Anniversary", "Valentine's", "Just because"];
export const PRIORITY_LABELS: Record<Priority, PriorityInfo> = {
  must: { label: "Must have", pill: "must" },
  love: { label: "Would love", pill: "love" },
  nice: { label: "Nice to have", pill: "nice" },
};
