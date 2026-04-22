// views.tsx — All page views for WishSync

import React from 'react';
import type { Wish, Person, Occasion, HistoryItem, ViewId, Priority, OccasionTag } from './types';
import { circles as circleApi, wishes as wishApi, occasions as occasionApi, auth as authApi, invites as invitesApi, imageUrl } from './api';
import type { ApiCircle, ApiUser, ApiActivityItem } from './api';
import { CATEGORIES, OCCASION_TAGS, PRIORITY_LABELS, PH } from './data';
import {
  IconLock, IconGift, IconSearch, IconSparkle, IconPlus,
  IconArrowLeft, IconExternal, IconCheck, IconX,
} from './icons';
import { PageHeader, WishCard, Avatar, Placeholder } from './components';

// ---------- ConfirmModal ----------
interface ConfirmModalProps {
  title: string;
  detail?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
export const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, detail, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) => (
  <div className="modal-backdrop" onClick={onCancel}>
    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center', padding: '32px 28px' }}>
      <div style={{ marginBottom: 18 }}>
        <svg width="52" height="52" viewBox="0 0 72 72" style={{ margin: '0 auto', display: 'block' }}>
          <rect width="72" height="72" rx="18" fill="#2B2420" />
          <path d="M36 36 C 26 26, 18 34, 24 42 C 28 46, 36 50, 36 50 C 36 50, 44 46, 48 42 C 54 34, 46 26, 36 36 Z" fill="#F6B89A" />
        </svg>
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>{title}</h2>
      {detail && <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 4 }}>{detail}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button
          className="btn btn-dark"
          style={danger ? { background: '#C0392B', color: 'white' } : {}}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ---------- useConfirm hook ----------
export function useConfirm(): [
  (opts: { title: string; detail?: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>,
  React.ReactElement | null
] {
  const [state, setState] = React.useState<{
    title: string;
    detail?: string;
    confirmLabel?: string;
    danger?: boolean;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = React.useCallback(
    (opts: { title: string; detail?: string; confirmLabel?: string; danger?: boolean }) =>
      new Promise<boolean>(resolve => setState({ ...opts, resolve })),
    []
  );

  const el = state ? (
    <ConfirmModal
      title={state.title}
      detail={state.detail}
      confirmLabel={state.confirmLabel}
      danger={state.danger}
      onConfirm={() => { state.resolve(true); setState(null); }}
      onCancel={() => { state.resolve(false); setState(null); }}
    />
  ) : null;

  return [confirm, el];
}

// ---------- Secret Mode overlay ----------
interface SecretOverlayProps {
  wish: Wish;
  partnerNickname: string;
  onConfirm: () => void;
  onCancel: () => void;
}
export const SecretOverlay: React.FC<SecretOverlayProps> = ({ wish, partnerNickname, onConfirm, onCancel }) => (
  <div className="secret-overlay" onClick={onCancel}>
    <div className="secret-modal" onClick={(e) => e.stopPropagation()}>
      <div className="secret-ribbon">Secret Mode</div>
      <div className="secret-eye">🤫</div>
      <h2 className="secret-title">Reserve <em>{wish.title}</em>?</h2>
      <p className="secret-text">
        Only you'll know. {partnerNickname} won't see this wish is taken —
        they'll still see it on their list as if nothing happened.
        The rest of the group will see it's spoken for.
      </p>
      <div className="secret-actions">
        <button className="btn btn-ghost" onClick={onCancel}>Never mind</button>
        <button className="btn btn-dark" onClick={onConfirm}>
          <IconLock size={14} /> Lock it in
        </button>
      </div>
    </div>
  </div>
);

// ---------- Invite Accept ----------
interface InviteAcceptViewProps {
  token: string;
  onDone: () => void;
}
export const InviteAcceptView: React.FC<InviteAcceptViewProps> = ({ token, onDone }) => {
  const [state, setState] = React.useState<'loading' | 'preview' | 'accepting' | 'done' | 'error'>('loading');
  const [info, setInfo] = React.useState<{ circleName: string; circleType: string; inviterName: string } | null>(null);
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    invitesApi.preview(token)
      .then((data: any) => { setInfo(data); setState('preview'); })
      .catch((err: any) => { setErrorMsg(err.message || 'Invalid or expired invite'); setState('error'); });
  }, [token]);

  const accept = () => {
    setState('accepting');
    invitesApi.accept(token)
      .then(() => setState('done'))
      .catch((err: any) => { setErrorMsg(err.message || 'Could not accept invite'); setState('error'); });
  };

  return (
    <div className="auth-screen">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 20 }}>
          <svg width="64" height="64" viewBox="0 0 72 72" style={{ margin: '0 auto' }}>
            <rect width="72" height="72" rx="18" fill="#2B2420"/>
            <path d="M36 36 C 26 26, 18 34, 24 42 C 28 46, 36 50, 36 50 C 36 50, 44 46, 48 42 C 54 34, 46 26, 36 36 Z" fill="#F6B89A"/>
          </svg>
        </div>
        {state === 'loading' && <p style={{ color: 'var(--ink-muted)' }}>Loading invite…</p>}
        {state === 'error' && (
          <>
            <h2 className="auth-title">Invite issue</h2>
            <p className="auth-sub">{errorMsg}</p>
            <button className="btn btn-ghost" onClick={onDone}>Go to app</button>
          </>
        )}
        {(state === 'preview' || state === 'accepting') && info && (
          <>
            <h2 className="auth-title">You're invited!</h2>
            <p className="auth-sub">
              <strong>{info.inviterName}</strong> invited you to join<br />
              <strong>"{info.circleName}"</strong> ({info.circleType === 'couple' ? 'Couple' : 'Friend group'})
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={onDone}>Skip</button>
              <button className="btn btn-primary btn-lg" onClick={accept} disabled={state === 'accepting'}>
                {state === 'accepting' ? 'Joining…' : 'Accept & join 🎁'}
              </button>
            </div>
          </>
        )}
        {state === 'done' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h2 className="auth-title">You're in!</h2>
            <p className="auth-sub">Welcome to the circle. Your wishlists are now synced.</p>
            <button className="btn btn-primary btn-lg" onClick={onDone} style={{ marginTop: 16 }}>
              Go to app →
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ---------- Partner Wishlist (hero) ----------
interface PartnerListProps {
  wishes: Wish[];
  partner: Person;
  me: Person;
  onOpen: (w: Wish) => void;
  onReserve: (w: Wish) => void;
  backLabel?: string;
  onBack?: () => void;
}
const VISIBLE_CATS = 8;

export const PartnerList: React.FC<PartnerListProps> = ({ wishes, partner, me, onOpen, onReserve, backLabel, onBack }) => {
  const [cat, setCat] = React.useState<string>("All");
  const [pri, setPri] = React.useState<string>("All");
  const [search, setSearch] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [showAllCats, setShowAllCats] = React.useState(false);

  const doSurprise = () => {
    const unreserved = wishes.filter(w => !w.reserved);
    if (unreserved.length === 0) return;
    onReserve(unreserved[Math.floor(Math.random() * unreserved.length)]);
  };

  const q = search.toLowerCase();
  let filtered = wishes.filter(w => {
    if (cat !== "All" && w.category !== cat) return false;
    if (pri === "Must have" && w.priority !== "must") return false;
    if (pri === "Would love" && w.priority !== "love") return false;
    if (pri === "Nice to have" && w.priority !== "nice") return false;
    if (q && !w.title.toLowerCase().includes(q) && !w.store.toLowerCase().includes(q) && !w.notes.toLowerCase().includes(q)) return false;
    return true;
  });
  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);

  const reservedCount = wishes.filter(w => !!w.reserved).length;
  const totalValue = wishes.reduce((sum, w) => sum + w.price, 0);
  const visibleCats = showAllCats ? CATEGORIES : CATEGORIES.slice(0, VISIBLE_CATS);

  return (
    <>
      {onBack && (
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 24 }}>
          <IconArrowLeft size={14} /> {backLabel || 'Back'}
        </button>
      )}
      <PageHeader
        eyebrow={`${partner.name}'s wishes · synced just now`}
        title="Gifts for"
        accent={partner.name + "."}
        subtitle={`${wishes.length} wishes · ${reservedCount} already claimed · $${totalValue.toLocaleString()} total`}
        actions={
          <button className="btn btn-primary" onClick={doSurprise}><IconSparkle size={15} /> Surprise mode</button>
        }
      />

      <div style={{ background: "var(--paper)", borderRadius: "var(--radius-lg)", padding: "18px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--blush)", display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0 }}>🤫</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>Secret reservations are live</div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Reserve any item — {partner.name} won't see it's taken. The rest of the gifting circle will.</div>
        </div>
      </div>

      <div className="filter-panel">
        <div className="filter-search-row">
          <div className="filter-search-wrap">
            <span className="filter-search-icon"><IconSearch size={14} /></span>
            <input className="input" placeholder="Search wishes…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input filter-sort" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
        <div className="chip-row">
          {visibleCats.map(c => (
            <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
          {CATEGORIES.length > VISIBLE_CATS && (
            <button className="chip show-more-chip" onClick={() => setShowAllCats(p => !p)}>
              {showAllCats ? '← Less' : `+${CATEGORIES.length - VISIBLE_CATS} more`}
            </button>
          )}
        </div>
        <div className="tabs">
          {["All", "Must have", "Would love", "Nice to have"].map(p => (
            <button key={p} className={`tab ${pri === p ? "active" : ""}`} onClick={() => setPri(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="wish-grid">
        {filtered.map(w => (
          <WishCard key={w.id} wish={w} mode="partner" me={me} onClick={() => onOpen(w)} onReserve={onReserve} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--ink-muted)" }}>
          No wishes match that filter.
        </div>
      )}
    </>
  );
};

// ---------- My Wishlist ----------
interface MyListProps {
  wishes: Wish[];
  me: Person;
  onOpen: (w: Wish) => void;
  onAdd: () => void;
  partnerName?: string;
  friendsCount?: number;
}
export const MyList: React.FC<MyListProps> = ({ wishes, me, onOpen, onAdd, partnerName = 'Partner', friendsCount = 0 }) => {
  const [cat, setCat] = React.useState<string>("All");
  const [pri, setPri] = React.useState<string>("All");
  const [search, setSearch] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [showAllCats, setShowAllCats] = React.useState(false);

  const q = search.toLowerCase();
  let filtered = wishes.filter(w => {
    if (cat !== "All" && w.category !== cat) return false;
    if (pri === "Must have" && w.priority !== "must") return false;
    if (pri === "Would love" && w.priority !== "love") return false;
    if (pri === "Nice to have" && w.priority !== "nice") return false;
    if (q && !w.title.toLowerCase().includes(q) && !w.store.toLowerCase().includes(q) && !w.notes.toLowerCase().includes(q)) return false;
    return true;
  });
  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);

  const visibleCats = showAllCats ? CATEGORIES : CATEGORIES.slice(0, VISIBLE_CATS);

  return (
    <>
      <PageHeader
        eyebrow="Your wishlist"
        title="Things I"
        accent="love."
        subtitle={`${wishes.length} wishes · shared with ${partnerName}${friendsCount > 0 ? ` + ${friendsCount} others` : ''}`}
        actions={<button className="btn btn-primary" onClick={onAdd}><IconPlus size={15} /> Add wish</button>}
      />

      <div className="filter-panel">
        <div className="filter-search-row">
          <div className="filter-search-wrap">
            <span className="filter-search-icon"><IconSearch size={14} /></span>
            <input className="input" placeholder="Search your wishes…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input filter-sort" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
            <option value="default">Sort: Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
        <div className="chip-row">
          {visibleCats.map(c => (
            <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
          {CATEGORIES.length > VISIBLE_CATS && (
            <button className="chip show-more-chip" onClick={() => setShowAllCats(p => !p)}>
              {showAllCats ? '← Less' : `+${CATEGORIES.length - VISIBLE_CATS} more`}
            </button>
          )}
        </div>
        <div className="tabs">
          {["All", "Must have", "Would love", "Nice to have"].map(p => (
            <button key={p} className={`tab ${pri === p ? "active" : ""}`} onClick={() => setPri(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="wish-grid">
        {filtered.map(w => (
          <WishCard key={w.id} wish={w} mode="mine" me={me} onClick={() => onOpen(w)} />
        ))}

        <button
          onClick={onAdd}
          style={{
            border: "2px dashed var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: 14,
            background: "transparent",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 10, minHeight: 300,
            color: "var(--ink-muted)", fontWeight: 700, fontSize: 15,
            cursor: "pointer",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cream-2)", display: "grid", placeItems: "center" }}>
            <IconPlus size={24} />
          </div>
          Add another wish
        </button>
      </div>

      {filtered.length === 0 && wishes.length > 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--ink-muted)" }}>
          No wishes match that filter.
        </div>
      )}
    </>
  );
};

// ---------- Item Detail ----------
interface DetailViewProps {
  wish: Wish;
  mode: "partner" | "mine";
  me: Person;
  partner: Person;
  friends: Person[];
  onBack: () => void;
  onReserve: (w: Wish) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, w: Wish) => void;
  onPurchase?: (id: string) => void;
}
export const DetailView: React.FC<DetailViewProps> = ({ wish, mode, me, partner, friends, onBack, onReserve, onDelete, onUpdate, onPurchase }) => {
  const priorityInfo = PRIORITY_LABELS[wish.priority];
  const reservedByMe = !!wish.reserved && wish.reserved.by === me.id;
  const reservedByOther = !!wish.reserved && wish.reserved.by !== me.id;
  const reserver = wish.reserved ? [...friends, me, partner].find(p => p.id === wish.reserved!.by) : null;

  const [confirm, confirmEl] = useConfirm();
  const [myReactions, setMyReactions] = React.useState<Set<string>>(new Set());
  const [reactionCounts, setReactionCounts] = React.useState({ heart: wish.reactions.heart, eyes: wish.reactions.eyes, gift: wish.reactions.gift });
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(wish.title);
  const [editPrice, setEditPrice] = React.useState(String(wish.price));
  const [editOriginalPrice, setEditOriginalPrice] = React.useState(wish.originalPrice ? String(wish.originalPrice) : '');
  const [editStore, setEditStore] = React.useState(wish.store);
  const [editStoreUrl, setEditStoreUrl] = React.useState(wish.storeUrl || '');
  const [editCategory, setEditCategory] = React.useState(wish.category);
  const [editPriority, setEditPriority] = React.useState<Priority>(wish.priority);
  const [editOccasion, setEditOccasion] = React.useState<OccasionTag>(wish.occasion);
  const [editNotes, setEditNotes] = React.useState(wish.notes);
  const [editCurrency, setEditCurrency] = React.useState(wish.currency ?? '$');
  const [editDiscount, setEditDiscount] = React.useState(wish.discount ?? false);
  const [editImageFile, setEditImageFile] = React.useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = React.useState<string>('');
  const [editIsDragging, setEditIsDragging] = React.useState(false);
  const editImageInputRef = React.useRef<HTMLInputElement>(null);
  const applyEditImageFile = (file: File) => {
    setEditImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setEditImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  const [saving, setSaving] = React.useState(false);
  const [purchasing, setPurchasing] = React.useState(false);
  const [editError, setEditError] = React.useState('');

  const handleReact = async (type: 'heart' | 'eyes' | 'gift') => {
    try {
      const res = await wishApi.react(wish.id, type);
      setMyReactions(prev => {
        const next = new Set(prev);
        res.active ? next.add(type) : next.delete(type);
        return next;
      });
      setReactionCounts(prev => ({
        ...prev,
        [type]: res.active ? prev[type] + 1 : prev[type] - 1,
      }));
    } catch {}
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) { setEditError('Title is required.'); return; }
    if (editPrice === '' || isNaN(Number(editPrice)) || Number(editPrice) < 0) { setEditError('Enter a valid price.'); return; }
    setSaving(true);
    setEditError('');
    try {
      const updated = await wishApi.update(wish.id, {
        title: editTitle.trim(),
        price: Number(editPrice),
        currency: editCurrency,
        originalPrice: editOriginalPrice ? Number(editOriginalPrice) : undefined,
        store: editStore.trim() || '—',
        storeUrl: editStoreUrl.trim() || undefined,
        category: editCategory,
        priority: editPriority,
        occasion: editOccasion,
        notes: editNotes,
        discount: editDiscount,
      });
      if (editImageFile) {
        const uploaded = await wishApi.uploadImage(wish.id, editImageFile);
        updated.imagePath = uploaded.imagePath;
      }
      onUpdate?.(wish.id, {
        ...wish,
        title: updated.title,
        price: updated.price,
        currency: updated.currency ?? editCurrency,
        originalPrice: updated.originalPrice,
        store: updated.store,
        storeUrl: updated.storeUrl,
        category: updated.category,
        priority: updated.priority as Priority,
        occasion: updated.occasion as OccasionTag,
        notes: updated.notes,
        discount: updated.discount,
        image: { tint: updated.imageTint ?? wish.image.tint, label: imageUrl(updated.imagePath) || updated.imageLabel || wish.image.label },
      });
      setIsEditing(false);
    } catch (e: any) {
      setEditError(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Remove this wish?', detail: `"${wish.title}" will be removed from your list.`, confirmLabel: 'Remove', danger: true });
    if (ok) onDelete?.(wish.id);
  };

  const handlePurchase = async () => {
    const ok = await confirm({ title: 'Mark as purchased?', detail: `This will move "${wish.title}" to the gift history.`, confirmLabel: 'Mark purchased' });
    if (!ok) return;
    setPurchasing(true);
    try {
      await wishApi.purchase(wish.id);
      onPurchase?.(wish.id);
    } catch {} finally {
      setPurchasing(false);
    }
  };

  return (
    <>
      {confirmEl}
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 24 }}>
        <IconArrowLeft size={14} /> Back
      </button>

      <div className="detail-grid">
        <div>
          <div className="detail-image">
            <Placeholder tint={wish.image.tint} label={wish.image.label} />
          </div>
        </div>

        <div>
          {!isEditing ? (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span className={`pill ${priorityInfo.pill}`}>{priorityInfo.label}</span>
                <span className="pill occasion">{wish.occasion}</span>
                <span className="pill">{wish.category}</span>
                {wish.discount && <span className="pill sale">on sale</span>}
              </div>

              <h1 className="detail-title">{wish.title}</h1>
              <div style={{ color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                from{' '}
                {wish.storeUrl
                  ? <a href={wish.storeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>{wish.store} <IconExternal size={13} /></a>
                  : <strong style={{ color: "var(--ink)" }}>{wish.store}</strong>
                }
              </div>

              <div className="detail-price">
                {wish.originalPrice && <span className="original">{wish.currency}{wish.originalPrice}</span>}
                {wish.currency}{wish.price}
              </div>

              {wish.notes && (
                <div className="note-card">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: 6, fontFamily: "var(--font-ui)" }}>
                    {mode === "partner" ? `${partner.name}'s note` : "Note to gifters"}
                  </div>
                  "{wish.notes}"
                </div>
              )}

              <hr className="dots" />

              {mode === "partner" && (
                <>
                  {reservedByMe ? (
                    <div style={{ padding: 16, background: "var(--sage)", borderRadius: "var(--radius)", marginBottom: 16 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 4 }}>You're getting this 🎁</div>
                      <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
                        {partner.name} can't see this reservation. We'll hide the "purchased" marker until your chosen date.
                      </div>
                    </div>
                  ) : reservedByOther && reserver ? (
                    <div style={{ padding: 16, background: "var(--cream-2)", borderRadius: "var(--radius)", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar person={reserver} size="sm" />
                      <div style={{ fontSize: 14 }}>
                        <strong>{reserver.name}</strong> already claimed this one.
                      </div>
                    </div>
                  ) : null}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {!reservedByOther && (
                      <button className="btn btn-primary btn-lg" onClick={() => onReserve(wish)} style={{ flex: 1 }}>
                        <IconGift size={16} /> {reservedByMe ? "Release reservation" : "Reserve secretly"}
                      </button>
                    )}
                    {reservedByMe && onPurchase && (
                      <button className="btn btn-ghost btn-lg" onClick={handlePurchase} disabled={purchasing}>
                        {purchasing ? 'Moving…' : '✓ Mark as purchased'}
                      </button>
                    )}
                    {wish.storeUrl && (
                      <a className="btn btn-ghost btn-lg" href={wish.storeUrl} target="_blank" rel="noopener noreferrer">
                        <IconExternal size={15} /> View at store
                      </a>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", textTransform: 'uppercase', letterSpacing: '0.06em' }}>React:</div>
                    {(['heart', 'eyes', 'gift'] as const).map(type => (
                      <button
                        key={type}
                        className={`reaction ${myReactions.has(type) ? 'active' : ''}`}
                        onClick={() => handleReact(type)}
                        title={type === 'heart' ? 'Love it' : type === 'eyes' ? 'I want this too' : 'I\'ll get this'}
                      >
                        {type === 'heart' ? '♥' : type === 'eyes' ? '👀' : '🎁'} {reactionCounts[type]}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {mode === "mine" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-muted)" }}>Reactions from your circle:</div>
                    <button className="reaction active">♥ {wish.reactions.heart}</button>
                    <button className="reaction">👀 {wish.reactions.eyes}</button>
                    <button className="reaction">🎁 {wish.reactions.gift}</button>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {wish.storeUrl && (
                      <a className="btn btn-ghost btn-lg" href={wish.storeUrl} target="_blank" rel="noopener noreferrer">
                        <IconExternal size={15} /> View at store
                      </a>
                    )}
                    {onUpdate && (
                      <button className="btn btn-ghost btn-lg" onClick={() => setIsEditing(true)}>
                        ✏️ Edit wish
                      </button>
                    )}
                    {onDelete && (
                      <button className="btn btn-ghost btn-lg" style={{ color: '#C0392B' }} onClick={handleDelete}>
                        Delete wish
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            /* Edit mode */
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 18 }}>Edit wish</h2>
              {editError && (
                <div style={{ background: 'var(--butter)', borderRadius: 10, padding: '8px 14px', fontSize: 13, marginBottom: 14 }}>
                  {editError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                    background: editIsDragging ? 'var(--blush)' : 'var(--cream-2)',
                    cursor: 'pointer', position: 'relative',
                    border: editIsDragging ? '2px dashed var(--primary)' : '2px dashed var(--line)',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onClick={() => editImageInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setEditIsDragging(true); }}
                  onDragLeave={() => setEditIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setEditIsDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) applyEditImageFile(f); }}
                  onPaste={e => { const f = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'))?.getAsFile(); if (f) applyEditImageFile(f); }}
                  tabIndex={0}
                  title="Click, drag, or paste to change image"
                >
                  {(editImagePreview || wish.image.label)
                    ? <img src={editImagePreview || wish.image.label || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'var(--blush)', fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--ink)', opacity: 0.7 }}>{wish.title[0]}</div>
                  }
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.35)', opacity: 0, transition: 'opacity 0.18s', fontSize: 18, color: 'white' }} className="img-hover-overlay">✏</div>
                  <input ref={editImageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) applyEditImageFile(f); e.target.value = ''; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Title</label>
                  <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label className="label">Price</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select className="input" value={editCurrency} onChange={e => setEditCurrency(e.target.value)} style={{ width: 68, flexShrink: 0 }}>
                      {['$', '€', '£', '¥', 'C$', 'A$', 'CHF', 'kr', 'zł', '₹'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input className="input" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label className="label">Original price</label>
                  <input className="input" placeholder="if discounted" value={editOriginalPrice} onChange={e => setEditOriginalPrice(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label className="label">Store</label>
                  <input className="input" value={editStore} onChange={e => setEditStore(e.target.value)} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label className="label">Store URL</label>
                  <input className="input" placeholder="https://..." value={editStoreUrl} onChange={e => setEditStoreUrl(e.target.value)} />
                </div>
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="label">Priority</label>
                <div className="chip-row">
                  {(['must', 'love', 'nice'] as Priority[]).map(p => (
                    <button key={p} className={`chip ${p === 'must' ? 'peach' : p === 'love' ? 'butter' : 'sage'} ${editPriority === p ? 'active' : ''}`} onClick={() => setEditPriority(p)}>
                      {PRIORITY_LABELS[p].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="label">Category</label>
                <div className="chip-row">
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <button key={c} className={`chip ${editCategory === c ? 'active' : ''}`} onClick={() => setEditCategory(c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="label">Occasion</label>
                <div className="chip-row">
                  {OCCASION_TAGS.map(o => (
                    <button key={o} className={`chip ${editOccasion === o ? 'active' : ''}`} onClick={() => setEditOccasion(o)}>{o}</button>
                  ))}
                </div>
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label className="label">Notes for gifters</label>
                <textarea className="textarea" value={editNotes} onChange={e => setEditNotes(e.target.value)} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={editDiscount} onChange={e => setEditDiscount(e.target.checked)} />
                This item is on sale / discounted
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => { setIsEditing(false); setEditError(''); }}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                  {saving ? 'Saving…' : <><IconCheck size={15} /> Save changes</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ---------- Dashboard ----------
interface DashboardProps {
  partnerWishes: Wish[];
  myWishes: Wish[];
  me: Person;
  partner: Person;
  hasPartner: boolean;
  occasions: Occasion[];
  activityFeed?: ApiActivityItem[];
  circles?: ApiCircle[];
  onViewMember?: (circleId: string, person: Person) => void;
  onNav: (v: ViewId) => void;
}
export const Dashboard: React.FC<DashboardProps> = ({ partnerWishes, myWishes, me, partner, hasPartner, occasions, activityFeed, circles, onViewMember, onNav }) => {
  const nextOccasion = occasions[0];
  const reservedWishes = partnerWishes.filter(w => !!w.reserved);
  const budgetByCurrency = reservedWishes.reduce<Record<string, number>>((acc, w) => {
    const c = w.currency || '$';
    acc[c] = (acc[c] || 0) + w.price;
    return acc;
  }, {});
  const budgetTotal = Object.entries(budgetByCurrency).map(([c, amt]) => `${c}${amt.toLocaleString()}`).join(' + ') || '—';
  return (
    <>
      <PageHeader
        eyebrow={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${me.name}`}
        title={hasPartner ? `You & ${partner.name},` : `Hey ${me.name},`}
        accent={hasPartner ? "synced." : "welcome."}
        subtitle={hasPartner ? "Your shared gifting world at a glance." : "Invite your partner to start syncing wishlists."}
      />

      <div className="dash-grid">
        <div className="dash-tile sage" onClick={() => onNav("partner")} style={{ cursor: "pointer" }}>
          <div className="dash-label">{partner.name}'s wishlist</div>
          <div className="dash-value">{partnerWishes.length}</div>
          <div className="dash-sub">{partnerWishes.filter(w => !w.reserved).length} unreserved</div>
          <div className="dash-deco">🎁</div>
        </div>
        <div className="dash-tile blush" onClick={() => onNav("mine")} style={{ cursor: "pointer" }}>
          <div className="dash-label">Your wishlist</div>
          <div className="dash-value">{myWishes.length}</div>
          <div className="dash-sub">{myWishes.reduce((s, w) => s + w.reactions.heart + w.reactions.eyes + w.reactions.gift, 0)} reactions</div>
          <div className="dash-deco">♥</div>
        </div>
        <div className="dash-tile butter" onClick={() => onNav("occasions")} style={{ cursor: "pointer" }}>
          <div className="dash-label">Next occasion</div>
          {nextOccasion ? (
            <>
              <div className="dash-value" style={{ fontSize: 30 }}>{nextOccasion.title}</div>
              <div className="dash-sub">{nextOccasion.daysAway} days — {nextOccasion.date}</div>
            </>
          ) : (
            <>
              <div className="dash-value" style={{ fontSize: 22 }}>None yet</div>
              <div className="dash-sub">Add one in Occasions</div>
            </>
          )}
          <div className="dash-deco">🎂</div>
        </div>
        <div className="dash-tile ink" onClick={() => onNav("history")} style={{ cursor: "pointer" }}>
          <div className="dash-label" style={{ opacity: 0.7 }}>Budget reserved</div>
          <div className="dash-value" style={{ fontSize: Object.keys(budgetByCurrency).length > 1 ? 24 : undefined }}>{budgetTotal}</div>
          <div className="dash-sub" style={{ opacity: 0.7 }}>{reservedWishes.length} gift{reservedWishes.length !== 1 ? 's' : ''} claimed from {partner.name}'s list</div>
          <div className="dash-deco">💰</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">{partner.name}'s top picks</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav("partner")}>See all →</button>
        </div>
        {partnerWishes.filter(w => w.priority === "must" || w.priority === "love").length === 0 ? (
          <div style={{ color: 'var(--ink-muted)', fontSize: 14, padding: '12px 0' }}>
            {partner.name} hasn't marked any top picks yet.
          </div>
        ) : (
          <div className="wish-grid">
            {partnerWishes.filter(w => w.priority === "must" || w.priority === "love").slice(0, 3).map(w => (
              <WishCard key={w.id} wish={w} mode="partner" me={me} onClick={() => onNav("partner")} />
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Coming up</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav("occasions")}>All occasions →</button>
        </div>
        {occasions.length === 0 ? (
          <div style={{ color: 'var(--ink-muted)', fontSize: 14, padding: '12px 0' }}>
            No occasions yet — <span onClick={() => onNav("occasions")} style={{ color: 'var(--primary-deep)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>add one</span> to get reminders.
          </div>
        ) : (
          <div className="timeline">
            {occasions.slice(0, 3).map(o => (
              <div key={o.id} className="timeline-item">
                <div className="timeline-date">
                  <div className="day">{o.day}</div>
                  <div className="month">{o.month}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{o.title}</div>
                  <div style={{ color: "var(--ink-muted)", fontSize: 13 }}>
                    {o.daysAway} days away · time to plan something good
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNav("occasions")}>Plan</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {(() => {
        const friendCircles = (circles || []).filter(c => c.type !== 'couple');
        const friendMembers = Array.from(
          new Map(
            friendCircles.flatMap(c => c.members.filter(m => m.userId !== me.id).map(m => [m.userId, { m, c }]))
          ).values()
        );
        if (!friendMembers.length) return null;
        return (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">From your groups</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav("groups")}>See all →</button>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {friendMembers.map(({ m, c }) => {
                const person: Person = { id: m.userId, name: m.user.name, nickname: m.user.nickname, color: m.user.color, initial: m.user.initial, avatarUrl: m.user.avatarPath ? imageUrl(m.user.avatarPath) ?? undefined : undefined };
                return (
                  <button key={m.userId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    onClick={() => onViewMember?.(c.id, person)}>
                    <Avatar person={person} size="lg" />
                    <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'center' }}>{m.user.name.split(' ')[0]}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{c.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {activityFeed && activityFeed.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Circle activity</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("history")}>History →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activityFeed.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--paper)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="avatar sm" style={{ background: item.person.color, flexShrink: 0 }}>{item.person.initial}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>
                    <strong>{item.person.nickname}</strong>
                    {item.type === 'reserve' ? ' reserved ' : ' bought '}
                    <em>"{item.wishTitle}"</em>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    {new Date(item.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <span style={{ fontSize: 18 }}>{item.type === 'reserve' ? '🤫' : '🎁'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// ---------- Add Wish Modal ----------
interface AddWishModalProps {
  onClose: () => void;
  onAdd: (w: Wish, imageFile?: File) => void;
}
export const AddWishModal: React.FC<AddWishModalProps> = ({ onClose, onAdd }) => {
  const [step, setStep] = React.useState<"link" | "details">("link");
  const [url, setUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [scrapeError, setScrapeError] = React.useState<string>("");
  const [scrapeImageUrl, setScrapeImageUrl] = React.useState<string>("");
  const [customImageFile, setCustomImageFile] = React.useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = React.useState<string>("");
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const applyImageFile = (file: File) => {
    setCustomImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setCustomImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setScrapeImageUrl('');
  };
  const [title, setTitle] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>("");
  const [currency, setCurrency] = React.useState<string>("$");
  const [store, setStore] = React.useState<string>("");
  const [category, setCategory] = React.useState<string>("Kitchen");
  const [priority, setPriority] = React.useState<Priority>("love");
  const [occasion, setOccasion] = React.useState<OccasionTag>("Just because");
  const [notes, setNotes] = React.useState<string>("");

  const doQuickAdd = async () => {
    if (!url.trim()) { setStep("details"); return; }
    setLoading(true);
    setScrapeError("");
    try {
      const data = await wishApi.scrape(url.trim());
      if (data.title) setTitle(data.title);
      if (data.store) setStore(data.store);
      if (data.price) setPrice(String(data.price));
      if (data.currency) setCurrency(data.currency);
      if (data.image) setScrapeImageUrl(data.image);
      if (data._note === 'amazon') {
        setScrapeError("Amazon doesn't allow scraping — title filled from URL. Please enter the price manually.");
      }
      setStep("details");
    } catch {
      setScrapeError("Couldn't read that page — fill in the details manually.");
      setStep("details");
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (!title.trim()) { setScrapeError("Please enter a title."); return; }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) { setScrapeError("Please enter a valid price (0 or more)."); return; }
    const w: Wish = {
      id: "new-" + Date.now(),
      title: title || "Untitled wish",
      image: scrapeImageUrl
        ? { tint: "#F6B89A", label: scrapeImageUrl }
        : PH("#F6B89A", title.toLowerCase().slice(0, 16) || "new item"),
      price: Number(price) || 0,
      currency,
      store: store || "—",
      storeUrl: url.startsWith('http') ? url : undefined,
      category,
      priority,
      occasion,
      notes,
      reactions: { heart: 0, eyes: 0, gift: 0 },
    };
    onAdd(w, customImageFile ?? undefined);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 className="modal-title">Add a wish</h2>
            <div className="modal-sub">Paste a link and we'll fill in the rest.</div>
          </div>
          <button className="icon-btn" onClick={onClose}><IconX size={16} /></button>
        </div>

        {step === "link" && (
          <>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Store link</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doQuickAdd()}
                />
                <button className="btn btn-primary" onClick={doQuickAdd} disabled={loading}>
                  {loading ? "Fetching…" : <><IconSparkle size={14} /> Autofill</>}
                </button>
              </div>
            </div>

            {loading && (
              <div style={{ display: "flex", gap: 12, padding: 14, background: "var(--cream-2)", borderRadius: 14 }}>
                <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 12 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                  <div className="skeleton" style={{ height: 16, width: "70%" }} />
                  <div className="skeleton" style={{ height: 12, width: "40%" }} />
                  <div className="skeleton" style={{ height: 14, width: "30%" }} />
                </div>
              </div>
            )}

            <div style={{ textAlign: "center", color: "var(--ink-muted)", margin: "18px 0", fontSize: 13 }}>
              — or —
            </div>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => setStep("details")}>
              Enter manually
            </button>
          </>
        )}

        {step === "details" && (
          <>
            {scrapeError && (
              <div style={{ background: "var(--butter)", borderRadius: 10, padding: "8px 14px", fontSize: 13, marginBottom: 14 }}>
                {scrapeError}
              </div>
            )}
            <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
              <div
                style={{
                  width: 96, height: 96, borderRadius: 14, overflow: "hidden", flexShrink: 0,
                  background: isDragging ? 'var(--blush)' : 'var(--cream-2)',
                  cursor: 'pointer', position: 'relative',
                  border: isDragging ? '2px dashed var(--primary)' : '2px dashed transparent',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onClick={() => imageInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault(); setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith('image/')) applyImageFile(file);
                }}
                onPaste={e => {
                  const file = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'))?.getAsFile();
                  if (file) applyImageFile(file);
                }}
                tabIndex={0}
                title="Click, drag, or paste an image"
              >
                {(customImagePreview || scrapeImageUrl)
                  ? <img
                      src={customImagePreview || scrapeImageUrl}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'var(--blush)', fontSize: 36, fontFamily: 'var(--font-display)', color: 'var(--ink)', opacity: 0.7 }}>
                      {(store || title || '?')[0].toUpperCase()}
                    </div>
                }
                <div style={{
                  position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                  background: 'rgba(0,0,0,0.35)', opacity: 0, transition: 'opacity 0.18s',
                  fontSize: 22, color: 'white',
                }} className="img-hover-overlay">
                  ✏
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) applyImageFile(f); e.target.value = ''; }} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <input className="input" placeholder="Item name" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    className="input"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    style={{ width: 68, flexShrink: 0 }}
                  >
                    {['$', '€', '£', '¥', 'C$', 'A$', 'CHF', 'kr', 'zł', '₹'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input className="input" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} style={{ flex: 1 }} />
                </div>
                <input className="input" placeholder="Store" value={store} onChange={(e) => setStore(e.target.value)} />
              </div>
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Priority</label>
              <div className="chip-row">
                {(["must", "love", "nice"] as Priority[]).map(p => (
                  <button
                    key={p}
                    className={`chip ${p === "must" ? "peach" : p === "love" ? "butter" : "sage"} ${priority === p ? "active" : ""}`}
                    onClick={() => setPriority(p)}
                  >
                    {PRIORITY_LABELS[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Category</label>
              <div className="chip-row">
                {CATEGORIES.filter(c => c !== "All").map(c => (
                  <button key={c} className={`chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Occasion</label>
              <div className="chip-row">
                {OCCASION_TAGS.map(o => (
                  <button
                    key={o}
                    className={`chip ${occasion === o ? "active" : ""}`}
                    onClick={() => setOccasion(o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 20 }}>
              <label className="label">Notes for gifters</label>
              <textarea
                className="textarea"
                placeholder="Size, color, version, anything else..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>
                <IconCheck size={15} /> Add to my list
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ---------- Occasion helpers ----------
const OCCASION_COLORS: Array<'peach' | 'blush' | 'butter' | 'sage'> = ['peach', 'blush', 'butter', 'sage'];

function toApiDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function toInputDate(apiDate: string): string {
  const months: Record<string, number> = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };
  const [monthStr, dayStr] = apiDate.split(' ');
  const month = months[monthStr] ?? 1;
  const day = parseInt(dayStr, 10);
  const year = new Date().getFullYear();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ---------- Occasions ----------
interface OccasionsViewProps {
  occasions: Occasion[];
  partner: Person;
  friends: Person[];
  circles: ApiCircle[];
  onAdd: (o: Occasion) => void;
  onEdit: (o: Occasion) => void;
  onDelete: (id: string) => void;
}
export const OccasionsView: React.FC<OccasionsViewProps> = ({ occasions, partner, friends, circles, onAdd, onEdit, onDelete }) => {
  const [confirm, confirmEl] = useConfirm();
  const [showModal, setShowModal] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Occasion | null>(null);
  const [oTitle, setOTitle] = React.useState('');
  const [oDate, setODate] = React.useState('');
  const [oColor, setOColor] = React.useState<'peach' | 'blush' | 'butter' | 'sage'>('peach');
  const [oCircleId, setOCircleId] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const openAdd = () => {
    setEditTarget(null);
    setOTitle('');
    setODate('');
    setOColor('peach');
    setOCircleId(circles[0]?.id ?? '');
    setError('');
    setShowModal(true);
  };

  const openEdit = (o: Occasion) => {
    setEditTarget(o);
    setOTitle(o.title);
    setODate(toInputDate(o.date));
    setOColor(o.color);
    setOCircleId(o.circleId);
    setError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!oTitle.trim()) { setError('Title is required.'); return; }
    if (!oDate) { setError('Date is required.'); return; }
    if (!oCircleId) { setError('Select a circle.'); return; }
    setSaving(true);
    setError('');
    const apiDate = toApiDate(oDate);
    try {
      if (editTarget) {
        const updated = await occasionApi.update(editTarget.id, { title: oTitle.trim(), date: apiDate, color: oColor, circleId: oCircleId });
        const [monthStr, dayStr] = updated.date.split(' ');
        const daysAway = (() => {
          const now = new Date();
          const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
          const month = months[monthStr] ?? 0;
          const day = parseInt(dayStr, 10);
          let target = new Date(now.getFullYear(), month, day);
          if (target < now) target.setFullYear(now.getFullYear() + 1);
          return Math.ceil((target.getTime() - now.getTime()) / 86400000);
        })();
        onEdit({
          id: updated.id,
          circleId: updated.circleId,
          title: updated.title,
          date: updated.date,
          day: dayStr ?? '',
          month: (monthStr ?? '').toUpperCase(),
          daysAway,
          person: updated.personId ?? 'both',
          color: updated.color,
        });
      } else {
        const created = await occasionApi.create({ circleId: oCircleId, title: oTitle.trim(), date: apiDate, color: oColor });
        const [monthStr, dayStr] = created.date.split(' ');
        const daysAway = (() => {
          const now = new Date();
          const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
          const month = months[monthStr] ?? 0;
          const day = parseInt(dayStr, 10);
          let target = new Date(now.getFullYear(), month, day);
          if (target < now) target.setFullYear(now.getFullYear() + 1);
          return Math.ceil((target.getTime() - now.getTime()) / 86400000);
        })();
        onAdd({
          id: created.id,
          circleId: created.circleId,
          title: created.title,
          date: created.date,
          day: dayStr ?? '',
          month: (monthStr ?? '').toUpperCase(),
          daysAway,
          person: created.personId ?? 'both',
          color: created.color,
        });
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o: Occasion) => {
    const ok = await confirm({ title: `Delete "${o.title}"?`, detail: 'This occasion will be removed for everyone in the circle.', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    await occasionApi.remove(o.id).catch(() => {});
    onDelete(o.id);
  };

  return (
    <>
      {confirmEl}
      <PageHeader
        eyebrow="Calendar"
        title="Occasions"
        accent="on the way."
        subtitle="Gentle reminders, never pushy."
        actions={<button className="btn btn-primary" onClick={openAdd}><IconPlus size={15} /> Add occasion</button>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {occasions.map(o => (
          <div key={o.id} className={`dash-tile ${o.color}`} style={{ minHeight: 200 }}>
            <div className="dash-label">In {o.daysAway} days</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "10px 0 4px", lineHeight: 1.1 }}>{o.title}</div>
            <div className="dash-sub">{o.date}</div>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div className="members">
                <Avatar person={partner} size="sm" />
                {friends.slice(0, 2).map(f => <Avatar key={f.id} person={f} size="sm" />)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{1 + friends.slice(0, 2).length} gifters</span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(o)}>Edit</button>
              <button className="btn btn-ghost btn-sm" style={{ color: '#C0392B' }} onClick={() => handleDelete(o)}>Delete</button>
            </div>
          </div>
        ))}
        {occasions.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: 'var(--ink-muted)' }}>
            No occasions yet. Add one to get reminders before important dates.
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <h2 className="modal-title">{editTarget ? 'Edit occasion' : 'Add occasion'}</h2>
            {error && <div style={{ background: 'var(--butter)', borderRadius: 10, padding: '8px 14px', fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. Birthday, Anniversary" value={oTitle} onChange={e => setOTitle(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Date</label>
              <input className="input" type="date" value={oDate} onChange={e => setODate(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Color</label>
              <div className="chip-row">
                {OCCASION_COLORS.map(c => (
                  <button key={c} className={`chip ${c} ${oColor === c ? 'active' : ''}`} onClick={() => setOColor(c)} style={{ textTransform: 'capitalize' }}>{c}</button>
                ))}
              </div>
            </div>
            {circles.length > 1 && (
              <div className="field" style={{ marginBottom: 14 }}>
                <label className="label">Circle</label>
                <select className="input" value={oCircleId} onChange={e => setOCircleId(e.target.value)}>
                  {circles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : <><IconCheck size={15} /> {editTarget ? 'Save changes' : 'Add occasion'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ---------- History ----------
interface HistoryViewProps {
  purchased: HistoryItem[];
  myNickname?: string;
}

function HistoryRow({ h }: { h: HistoryItem }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 18, padding: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
        <Placeholder tint={h.image.tint} label={h.image.label} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{h.title}</div>
        <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
          For <strong style={{ color: "var(--ink)" }}>{h.for}</strong> · from <strong style={{ color: "var(--ink)" }}>{h.by}</strong> · {h.date}
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>${h.price}</div>
    </div>
  );
}

export const HistoryView: React.FC<HistoryViewProps> = ({ purchased, myNickname }) => {
  const given = myNickname ? purchased.filter(h => h.by === myNickname) : [];
  const received = myNickname ? purchased.filter(h => h.for === myNickname) : [];
  const all = !myNickname ? purchased : [];

  return (
    <>
      <PageHeader
        eyebrow="Archive"
        title="What we've"
        accent="already given."
        subtitle="So you never repeat a gift (unless it's on purpose)."
      />

      {myNickname ? (
        <>
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Gifts I've given 🎁</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {given.map(h => <HistoryRow key={h.id} h={h} />)}
              {given.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-muted)' }}>
                  Nothing yet — reserve and mark a wish as purchased to see it here.
                </div>
              )}
            </div>
          </div>
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Gifts I've received 💝</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {received.map(h => <HistoryRow key={h.id} h={h} />)}
              {received.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-muted)' }}>
                  Nothing yet — when someone buys from your wishlist, it'll appear here.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {all.map(h => <HistoryRow key={h.id} h={h} />)}
          {all.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-muted)' }}>
              No gifts in the history yet. Mark a reservation as purchased to see it here.
            </div>
          )}
        </div>
      )}
    </>
  );
};

// ---------- Groups ----------
interface GroupsViewProps {
  me: Person;
  partner: Person;
  friends: Person[];
  circles: ApiCircle[];
  myId: string;
  onCircleCreated: (c: ApiCircle) => void;
  onCircleLeft: (id: string) => void;
  onCircleUpdated: (c: ApiCircle) => void;
  onViewMember: (circleId: string, person: Person) => void;
}
export const GroupsView: React.FC<GroupsViewProps> = ({ circles, myId, onCircleCreated, onCircleLeft, onCircleUpdated, onViewMember }) => {
  const [confirm, confirmEl] = useConfirm();
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newType, setNewType] = React.useState<'couple' | 'friends'>('friends');
  const [creatingLoading, setCreatingLoading] = React.useState(false);
  const [invitePanel, setInvitePanel] = React.useState<{ url: string; circleId: string; circleName: string } | null>(null);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [sendingEmail, setSendingEmail] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);
  const [copyDone, setCopyDone] = React.useState(false);
  const [renamingCircle, setRenamingCircle] = React.useState<ApiCircle | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [renameSaving, setRenameSaving] = React.useState(false);

  const openInvitePanel = async (circleId: string, circleName: string) => {
    try {
      const inv = await circleApi.createInvite(circleId);
      setInvitePanel({ url: inv.inviteUrl, circleId, circleName });
      setInviteEmail('');
      setEmailSent(false);
      setCopyDone(false);
    } catch {}
  };

  const createCircle = async () => {
    if (!newName.trim()) return;
    setCreatingLoading(true);
    try {
      const circle = await circleApi.create(newName, newType);
      onCircleCreated(circle);
      setCreating(false);
      setNewName('');
      await openInvitePanel(circle.id, circle.name);
    } catch {} finally {
      setCreatingLoading(false);
    }
  };

  const sendEmailInvite = async () => {
    if (!invitePanel || !inviteEmail.trim()) return;
    setSendingEmail(true);
    try {
      await circleApi.createInvite(invitePanel.circleId, inviteEmail.trim());
      setEmailSent(true);
      setInviteEmail('');
    } catch {} finally {
      setSendingEmail(false);
    }
  };

  const leaveCircle = async (circleId: string, circleName: string, isCreator: boolean) => {
    const ok = await confirm({
      title: `Leave "${circleName}"?`,
      detail: isCreator ? 'You created this circle — leaving will delete it for everyone.' : 'You\'ll lose access to this circle\'s wishlists.',
      confirmLabel: isCreator ? 'Delete circle' : 'Leave circle',
      danger: true,
    });
    if (!ok) return;
    try {
      await circleApi.leave(circleId);
      onCircleLeft(circleId);
    } catch {}
  };

  const removeMember = async (circle: ApiCircle, member: { userId: string; user: any }) => {
    const ok = await confirm({
      title: `Remove ${member.user.name}?`,
      detail: `They'll be removed from "${circle.name}" and lose access to the group's wishlists.`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    try {
      await circleApi.removeMember(circle.id, member.userId);
      onCircleUpdated({
        ...circle,
        members: circle.members.filter(m => m.userId !== member.userId),
      });
    } catch {}
  };

  const saveRename = async () => {
    if (!renamingCircle || !renameValue.trim()) return;
    setRenameSaving(true);
    try {
      const updated = await circleApi.rename(renamingCircle.id, renameValue.trim());
      onCircleUpdated(updated);
      setRenamingCircle(null);
    } catch {} finally {
      setRenameSaving(false);
    }
  };

  const pillColors: Record<string, string> = { couple: 'var(--blush)', friends: 'var(--butter)' };
  const pillText: Record<string, string> = { couple: 'Couple', friends: 'Friend group' };

  // All non-self members, deduplicated by userId, with their circle info
  const allFriends = Array.from(
    new Map(
      circles.flatMap(c => c.members.filter(m => m.userId !== myId).map(m => [m.userId, { m, c }]))
    ).values()
  );

  return (
    <>
      {confirmEl}
      <PageHeader
        eyebrow="Friends"
        title="Your gifting"
        accent="people."
        subtitle="Everyone you share wishlists with."
        actions={<button className="btn btn-ghost btn-sm" onClick={() => setCreating(true)}><IconPlus size={14} /> New circle</button>}
      />

      {/* ── People grid ── */}
      {allFriends.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>No friends yet</div>
          <div style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 20 }}>Create a circle and invite someone to get started.</div>
          <button className="btn btn-primary" onClick={() => setCreating(true)}><IconPlus size={14} /> New circle</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 40 }}>
          {allFriends.map(({ m, c }) => (
            <button
              key={m.userId}
              className="card"
              style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', border: 'none', textAlign: 'center', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => onViewMember(c.id, { id: m.userId, name: m.user.name, nickname: m.user.nickname, color: m.user.color, initial: m.user.initial, birthday: m.user.birthday ?? undefined })}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <Avatar person={{ id: m.userId, name: m.user.name, nickname: m.user.nickname, color: m.user.color, initial: m.user.initial, avatarUrl: m.user.avatarPath ? imageUrl(m.user.avatarPath) ?? undefined : undefined }} size="lg" />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{m.user.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>@{m.user.nickname.toLowerCase()}</div>
              </div>
              <div className="pill" style={{ background: pillColors[c.type] || 'var(--cream-2)', color: 'var(--ink)', fontSize: 11 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--primary-deep)', fontWeight: 700 }}>View wishlist →</div>
            </button>
          ))}
        </div>
      )}

      {/* ── Circle management ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Circles</div>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}><IconPlus size={13} /> New</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {circles.map(c => (
          <div key={c.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="pill" style={{ background: pillColors[c.type] || 'var(--cream-2)', color: 'var(--ink)' }}>{pillText[c.type] || c.type}</div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{c.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setRenamingCircle(c); setRenameValue(c.name); }} title="Rename">✏️</button>
                <button className="btn btn-ghost btn-sm" onClick={() => openInvitePanel(c.id, c.name)}>Invite</button>
                <button className="btn btn-ghost btn-sm" style={{ color: '#C0392B' }} onClick={() => leaveCircle(c.id, c.name, c.members.find(m => m.userId === myId) !== undefined)}>Leave</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {c.members.map(m => (
                <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--cream-2)', borderRadius: 20 }}>
                  <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, background: m.user.color }}>{m.user.initial}</div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m.user.name}</span>
                  {m.userId === myId && <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>you</span>}
                  {m.userId !== myId && (
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 13, padding: '0 0 0 2px', lineHeight: 1 }} onClick={() => removeMember(c, m)} title="Remove">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rename modal */}
      {renamingCircle && (
        <div className="modal-backdrop" onClick={() => setRenamingCircle(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <h2 className="modal-title">Rename circle</h2>
            <div className="field" style={{ marginBottom: 20 }}>
              <label className="label">Circle name</label>
              <input
                className="input"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveRename()}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setRenamingCircle(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveRename} disabled={!renameValue.trim() || renameSaving}>
                {renameSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create circle modal */}
      {creating && (
        <div className="modal-backdrop" onClick={() => setCreating(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2 className="modal-title">New circle</h2>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Name</label>
              <input className="input" placeholder="e.g. Us two" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createCircle()} />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label className="label">Type</label>
              <div className="chip-row">
                {(['couple', 'friends'] as const).map(t => (
                  <button key={t} className={`chip ${newType === t ? 'active' : ''}`} onClick={() => setNewType(t)}>
                    {t === 'couple' ? 'Couple' : 'Friend group'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createCircle} disabled={!newName.trim() || creatingLoading}>
                {creatingLoading ? 'Creating…' : 'Create & invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {invitePanel && (
        <div className="modal-backdrop" onClick={() => setInvitePanel(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h2 className="modal-title">Invite to {invitePanel.circleName}</h2>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Share this link <span style={{ fontWeight: 400, color: 'var(--ink-muted)' }}>— valid 7 days</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  readOnly
                  value={invitePanel.url}
                  style={{ flex: 1, fontSize: 12, cursor: 'text' }}
                  onFocus={e => e.currentTarget.select()}
                />
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flexShrink: 0 }}
                  onClick={() => { navigator.clipboard.writeText(invitePanel.url).catch(() => {}); setCopyDone(true); setTimeout(() => setCopyDone(false), 2000); }}
                >
                  {copyDone ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>or send by email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Their email address</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={e => { setInviteEmail(e.target.value); setEmailSent(false); }}
                  onKeyDown={e => e.key === 'Enter' && sendEmailInvite()}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flexShrink: 0 }}
                  onClick={sendEmailInvite}
                  disabled={sendingEmail || !inviteEmail.trim()}
                >
                  {sendingEmail ? 'Sending…' : 'Send invite'}
                </button>
              </div>
              {emailSent && (
                <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 8 }}>
                  ✓ Invite sent! Enter another address to invite more people.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setInvitePanel(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ---------- Empty Partner (no couple circle yet) ----------
interface EmptyPartnerViewProps {
  onGoToGroups: () => void;
}
export const EmptyPartnerView: React.FC<EmptyPartnerViewProps> = ({ onGoToGroups }) => (
  <>
    <PageHeader
      eyebrow="Partner list"
      title="Sync with"
      accent="someone special."
      subtitle="Create a couple circle and invite your partner — their wishes will appear here."
    />
    <div style={{ maxWidth: 480, margin: '40px auto 0', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>💝</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 12 }}>No partner connected yet</h2>
      <p style={{ color: 'var(--ink-muted)', fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>
        Create a couple circle, copy the invite link, and send it to your partner.
        Once they join, their wishlist will show up here — and yours will show up for them.
      </p>
      <button className="btn btn-primary btn-lg" onClick={onGoToGroups}>
        Create a couple circle →
      </button>
    </div>
  </>
);

// ---------- Profile ----------
interface ProfileViewProps {
  me: Person;
  apiUser: ApiUser;
  onLogout: () => void;
  onUpdateUser: (u: ApiUser) => void;
  onDeleteAccount?: () => void;
}
export const ProfileView: React.FC<ProfileViewProps> = ({ me, apiUser, onLogout, onUpdateUser, onDeleteAccount }) => {
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = React.useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const updated = await authApi.uploadAvatar(file);
      onUpdateUser(updated);
    } catch {} finally {
      setAvatarLoading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarLoading(true);
    try {
      const updated = await authApi.removeAvatar();
      onUpdateUser(updated);
    } catch {} finally {
      setAvatarLoading(false);
    }
  };

  const [notifs, setNotifs] = React.useState({
    notifBirthdays: apiUser.notifBirthdays,
    notifPriceDrops: apiUser.notifPriceDrops,
    notifNewWishes: apiUser.notifNewWishes,
    notifReactions: apiUser.notifReactions,
  });
  const [saving, setSaving] = React.useState(false);

  const [changePwOpen, setChangePwOpen] = React.useState(false);
  const [currentPw, setCurrentPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [pwError, setPwError] = React.useState('');
  const [pwSaving, setPwSaving] = React.useState(false);
  const [pwDone, setPwDone] = React.useState(false);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState(me.name);
  const [editNickname, setEditNickname] = React.useState(me.nickname);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const parsedBd = apiUser.birthday?.match(/^(\w{3})\s+(\d{1,2})$/);
  const [editBdMonth, setEditBdMonth] = React.useState(parsedBd?.[1] ?? '');
  const [editBdDay, setEditBdDay] = React.useState(parsedBd?.[2] ?? '');
  const editBirthday = editBdMonth && editBdDay ? `${editBdMonth} ${editBdDay.padStart(2,'0')}` : '';
  const [editError, setEditError] = React.useState('');
  const [editSaving, setEditSaving] = React.useState(false);

  const handleSaveDetails = async () => {
    if (!editName.trim()) { setEditError('Name is required.'); return; }
    if (!editNickname.trim()) { setEditError('Nickname is required.'); return; }
    setEditSaving(true); setEditError('');
    try {
      const updated = await authApi.updateMe({
        name: editName.trim(),
        nickname: editNickname.trim(),
        birthday: editBirthday || undefined,
      });
      onUpdateUser(updated);
      setEditOpen(false);
    } catch (e: any) {
      setEditError(e.message || 'Could not save changes');
    } finally {
      setEditSaving(false);
    }
  };

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletePw, setDeletePw] = React.useState('');
  const [deleteError, setDeleteError] = React.useState('');
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const toggle = async (key: keyof typeof notifs) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    setSaving(true);
    try {
      const updated = await authApi.updateMe({ [key]: next[key] });
      onUpdateUser(updated);
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePw) { setDeleteError('Enter your password to confirm.'); return; }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await authApi.deleteAccount(deletePw);
      localStorage.removeItem('ws-token');
      onDeleteAccount?.();
      window.location.reload();
    } catch (e: any) {
      setDeleteError(e.message || 'Could not delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const changePassword = async () => {
    if (!currentPw) { setPwError('Enter your current password.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    setPwSaving(true);
    setPwError('');
    try {
      await authApi.updateMe({ currentPassword: currentPw, newPassword: newPw });
      setPwDone(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => { setPwDone(false); setChangePwOpen(false); }, 2000);
    } catch (e: any) {
      setPwError(e.message || 'Could not change password');
    } finally {
      setPwSaving(false);
    }
  };

  const notifRows: { key: keyof typeof notifs; label: string; desc: string }[] = [
    { key: 'notifBirthdays', label: 'Birthdays approaching', desc: 'Reminder before important dates' },
    { key: 'notifPriceDrops', label: 'Price drops on my wishes', desc: 'Alert me when prices go down' },
    { key: 'notifNewWishes', label: 'Someone added to their list', desc: 'Email when circle members add wishes' },
    { key: 'notifReactions', label: 'Reactions to my wishes', desc: 'Email when someone reacts to your list' },
  ];

  return (
    <>
      <PageHeader eyebrow="You" title="Your profile." subtitle="How you show up in the gifting world." />
      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ padding: 28, display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar person={me} size="lg" />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarLoading}
              style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--ink)', color: 'white', border: '2px solid var(--paper)',
                fontSize: 12, cursor: 'pointer', display: 'grid', placeItems: 'center',
                opacity: avatarLoading ? 0.5 : 1,
              }}
              title="Change photo"
            >
              {avatarLoading ? '…' : '✏'}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>{me.name}</div>
            <div style={{ color: "var(--ink-muted)" }}>@{me.nickname.toLowerCase()} · 🎂 {me.birthday}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{apiUser.email}</div>
            {apiUser.avatarPath && (
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 6, fontSize: 12, color: 'var(--ink-muted)' }} onClick={handleRemoveAvatar} disabled={avatarLoading}>
                Remove photo
              </button>
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ color: 'var(--ink-muted)' }}>Sign out</button>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editOpen ? 16 : 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>Details</div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setEditOpen(o => !o); setEditError(''); }}>
              {editOpen ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {!editOpen ? (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--ink-muted)', fontSize: 13, width: 80 }}>Name</span>
                <span style={{ fontWeight: 600 }}>{me.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--ink-muted)', fontSize: 13, width: 80 }}>Nickname</span>
                <span style={{ fontWeight: 600 }}>@{me.nickname.toLowerCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--ink-muted)', fontSize: 13, width: 80 }}>Email</span>
                <span>{apiUser.email}</span>
              </div>
              {apiUser.birthday && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--ink-muted)', fontSize: 13, width: 80 }}>Birthday</span>
                  <span>🎂 {apiUser.birthday}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Name</label>
                <input className="input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="label">Nickname</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }}>@</span>
                  <input className="input" style={{ paddingLeft: 24 }} value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="nickname" />
                </div>
              </div>
              <div>
                <label className="label">Birthday (optional)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="input" value={editBdMonth} onChange={e => setEditBdMonth(e.target.value)} style={{ flex: 1 }}>
                    <option value="">Month</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="input" value={editBdDay} onChange={e => setEditBdDay(e.target.value)} style={{ width: 90 }}>
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              {editError && <div style={{ color: '#C0392B', fontSize: 13 }}>{editError}</div>}
              <button className="btn btn-primary" onClick={handleSaveDetails} disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 4 }}>Notifications</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 16 }}>
            Emails go to <strong>{apiUser.email}</strong>{saving && ' · saving…'}
          </div>
          {notifRows.map(({ key, label, desc }, i) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 0", borderBottom: i < notifRows.length - 1 ? "1px dotted var(--line)" : "none" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{desc}</div>
              </div>
              <button
                onClick={() => toggle(key)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
              >
                <div style={{ width: 40, height: 22, background: notifs[key] ? "var(--primary-deep)" : "var(--line)", borderRadius: 999, position: "relative", transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: 2, left: notifs[key] ? 20 : 2, width: 18, height: 18, background: "white", borderRadius: "50%", transition: "left 0.2s", boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 4 }}>Security</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 16 }}>Manage your account credentials</div>
          {!changePwOpen ? (
            <button className="btn btn-ghost" onClick={() => setChangePwOpen(true)}>Change password</button>
          ) : (
            <div>
              {pwDone && <div style={{ background: 'var(--sage)', borderRadius: 10, padding: '8px 14px', fontSize: 13, marginBottom: 14 }}>✓ Password changed successfully!</div>}
              {pwError && <div style={{ background: 'var(--butter)', borderRadius: 10, padding: '8px 14px', fontSize: 13, marginBottom: 14 }}>{pwError}</div>}
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="label">Current password</label>
                <input className="input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="label">New password</label>
                <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label className="label">Confirm new password</label>
                <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && changePassword()} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => { setChangePwOpen(false); setPwError(''); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }}>Cancel</button>
                <button className="btn btn-primary" onClick={changePassword} disabled={pwSaving}>
                  {pwSaving ? 'Saving…' : 'Update password'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24, borderColor: 'rgba(192, 57, 43, 0.25)', border: '1px solid rgba(192,57,43,0.2)' }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 4, color: '#C0392B' }}>Danger zone</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 16 }}>Permanently delete your account and all your data.</div>
          {!deleteOpen ? (
            <button className="btn btn-ghost" style={{ color: '#C0392B' }} onClick={() => setDeleteOpen(true)}>Delete my account…</button>
          ) : (
            <div>
              <div style={{ background: 'rgba(192,57,43,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                This will permanently delete your account, all your wishes, and your circle memberships. <strong>This cannot be undone.</strong>
              </div>
              {deleteError && <div style={{ background: 'var(--butter)', borderRadius: 10, padding: '8px 14px', fontSize: 13, marginBottom: 14 }}>{deleteError}</div>}
              <div className="field" style={{ marginBottom: 16 }}>
                <label className="label">Confirm with your password</label>
                <input className="input" type="password" value={deletePw} onChange={e => setDeletePw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDeleteAccount()} placeholder="Enter your password" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => { setDeleteOpen(false); setDeleteError(''); setDeletePw(''); }}>Cancel</button>
                <button
                  className="btn btn-dark"
                  style={{ background: '#C0392B', color: 'white' }}
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting…' : 'Delete account forever'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
