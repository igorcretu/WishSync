const BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('ws-token');
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- types returned by the API ----

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  nickname: string;
  color: string;
  initial: string;
  birthday: string | null;
  notifBirthdays: boolean;
  notifPriceDrops: boolean;
  notifNewWishes: boolean;
  notifReactions: boolean;
}

export interface ApiWish {
  id: string;
  title: string;
  imagePath: string | null;
  imageTint: string;
  imageLabel: string;
  price: number;
  originalPrice?: number;
  currency: string;
  store: string;
  storeUrl?: string;
  category: string;
  priority: 'must' | 'love' | 'nice';
  occasion: string;
  notes: string;
  discount: boolean;
  reactions: { heart: number; eyes: number; gift: number };
  // only present when viewing someone else's wishes
  reservation?: null | { byMe: boolean };
}

export interface ApiCircle {
  id: string;
  name: string;
  type: 'couple' | 'friends';
  members: { userId: string; joinedAt: string; user: ApiUser }[];
}

export interface ApiOccasion {
  id: string;
  circleId: string;
  title: string;
  date: string;
  personId: string | null;
  color: 'peach' | 'blush' | 'butter' | 'sage';
}

export interface ApiHistoryItem {
  id: string;
  title: string;
  for: string;
  by: string;
  date: string;
  price: number;
  imageTint: string;
  imageLabel: string;
  imagePath: string | null;
}

// ---- auth ----

export const auth = {
  register: (data: { email: string; password: string; name: string; nickname: string; birthday?: string }) =>
    request<{ token: string; user: ApiUser }>('POST', '/api/auth/register', data),

  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>('POST', '/api/auth/login', { email, password }),

  me: () => request<ApiUser>('GET', '/api/auth/me'),

  updateMe: (data: Partial<Pick<ApiUser, 'name' | 'nickname' | 'color' | 'birthday'>>) =>
    request<ApiUser>('PATCH', '/api/auth/me', data),
};

// ---- wishes ----

export const wishes = {
  list: () => request<ApiWish[]>('GET', '/api/wishes'),

  create: (data: Omit<ApiWish, 'id' | 'imagePath' | 'reactions' | 'reservation'>) =>
    request<ApiWish>('POST', '/api/wishes', data),

  update: (id: string, data: Partial<Omit<ApiWish, 'id' | 'imagePath' | 'reactions' | 'reservation'>>) =>
    request<ApiWish>('PATCH', `/api/wishes/${id}`, data),

  remove: (id: string) => request<void>('DELETE', `/api/wishes/${id}`),

  uploadImage: async (id: string, file: File) => {
    const token = getToken();
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/api/wishes/${id}/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json() as Promise<{ imagePath: string }>;
  },

  scrape: (url: string) =>
    request<{ title: string | null; image: string | null; price: number | null; store: string | null }>(
      'GET', `/api/wishes/scrape?url=${encodeURIComponent(url)}`
    ),

  reserve: (id: string) => request<{ reserved: boolean }>('POST', `/api/wishes/${id}/reserve`),

  react: (id: string, type: 'heart' | 'eyes' | 'gift') =>
    request<{ active: boolean }>('POST', `/api/wishes/${id}/reactions/${type}`),

  purchase: (id: string) => request<{ id: string }>('POST', `/api/wishes/${id}/purchase`),
};

// ---- circles ----

export const circles = {
  list: () => request<ApiCircle[]>('GET', '/api/circles'),

  create: (name: string, type: 'couple' | 'friends') =>
    request<ApiCircle>('POST', '/api/circles', { name, type }),

  memberWishes: (circleId: string, memberId: string) =>
    request<ApiWish[]>('GET', `/api/circles/${circleId}/members/${memberId}/wishes`),

  createInvite: (circleId: string, email?: string) =>
    request<{ inviteUrl: string; expiresAt: string }>('POST', `/api/circles/${circleId}/invites`, email ? { email } : {}),

  leave: (id: string) => request<void>('DELETE', `/api/circles/${id}`),
};

// ---- invites ----

export const invites = {
  preview: (token: string) =>
    request<{ circleName: string; circleType: string; inviterName: string }>('GET', `/api/invites/${token}`),

  accept: (token: string) =>
    request<{ circleId: string; circleName: string }>('POST', `/api/invites/${token}/accept`),
};

// ---- occasions ----

export const occasions = {
  list: () => request<ApiOccasion[]>('GET', '/api/occasions'),

  create: (data: Omit<ApiOccasion, 'id'>) =>
    request<ApiOccasion>('POST', '/api/occasions', data),

  update: (id: string, data: Partial<Omit<ApiOccasion, 'id'>>) =>
    request<ApiOccasion>('PATCH', `/api/occasions/${id}`, data),

  remove: (id: string) => request<void>('DELETE', `/api/occasions/${id}`),
};

// ---- history ----

export const history = {
  list: () => request<ApiHistoryItem[]>('GET', '/api/history'),
};

// ---- image URL helper ----

export function imageUrl(path: string | null): string | null {
  if (!path) return null;
  return `${BASE}/uploads/${path}`;
}
