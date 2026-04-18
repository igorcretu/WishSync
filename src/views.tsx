// views.tsx — All page views for WishSync

import React from 'react';
import type { Wish, Person, Occasion, HistoryItem, ViewId, Priority, OccasionTag } from './types';
import { circles as circleApi } from './api';
import type { ApiCircle } from './api';
import { CATEGORIES, OCCASION_TAGS, PRIORITY_LABELS, PH } from './data';
import {
  IconLock, IconGift, IconSearch, IconSparkle, IconLink, IconPlus,
  IconArrowLeft, IconExternal, IconCheck, IconX,
} from './icons';
import { PageHeader, WishCard, Avatar, Placeholder } from './components';

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

// ---------- Partner Wishlist (hero) ----------
interface PartnerListProps {
  wishes: Wish[];
  partner: Person;
  me: Person;
  onOpen: (w: Wish) => void;
  onReserve: (w: Wish) => void;
}
export const PartnerList: React.FC<PartnerListProps> = ({ wishes, partner, me, onOpen, onReserve }) => {
  const [cat, setCat] = React.useState<string>("All");
  const [pri, setPri] = React.useState<string>("All");

  const filtered = wishes.filter(w => {
    if (cat !== "All" && w.category !== cat) return false;
    if (pri === "Must have" && w.priority !== "must") return false;
    if (pri === "Would love" && w.priority !== "love") return false;
    if (pri === "Nice to have" && w.priority !== "nice") return false;
    return true;
  });

  const reservedCount = wishes.filter(w => !!w.reserved).length;
  const totalValue = wishes.reduce((sum, w) => sum + w.price, 0);

  return (
    <>
      <PageHeader
        eyebrow={`${partner.name}'s wishes · synced just now`}
        title="Gifts for"
        accent={partner.name + "."}
        subtitle={`${wishes.length} wishes · ${reservedCount} already claimed · $${totalValue.toLocaleString()} total`}
        actions={
          <>
            <button className="btn btn-ghost"><IconSearch size={15} /> Search</button>
            <button className="btn btn-primary"><IconSparkle size={15} /> Surprise mode</button>
          </>
        }
      />

      <div style={{ background: "var(--paper)", borderRadius: "var(--radius-lg)", padding: "18px 22px", marginBottom: 28, display: "flex", alignItems: "center", gap: 14, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--blush)", display: "grid", placeItems: "center", fontSize: 22 }}>🤫</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>Secret reservations are live</div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Reserve any item — {partner.name} won't see it's taken. The rest of the gifting circle will.</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div className="chip-row">
          {CATEGORIES.map(c => (
            <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
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
}
export const MyList: React.FC<MyListProps> = ({ wishes, me, onOpen, onAdd }) => {
  return (
    <>
      <PageHeader
        eyebrow="Your wishlist"
        title="Things I"
        accent="love."
        subtitle={`${wishes.length} wishes · shared with Theo + 3 others`}
        actions={
          <>
            <button className="btn btn-ghost"><IconLink size={15} /> Quick add</button>
            <button className="btn btn-primary" onClick={onAdd}><IconPlus size={15} /> Add wish</button>
          </>
        }
      />

      <div className="wish-grid">
        {wishes.map(w => (
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
}
export const DetailView: React.FC<DetailViewProps> = ({ wish, mode, me, partner, friends, onBack, onReserve }) => {
  const priorityInfo = PRIORITY_LABELS[wish.priority];
  const reservedByMe = !!wish.reserved && wish.reserved.by === me.id;
  const reservedByOther = !!wish.reserved && wish.reserved.by !== me.id;
  const reserver = wish.reserved ? [...friends, me, partner].find(p => p.id === wish.reserved!.by) : null;

  return (
    <>
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span className={`pill ${priorityInfo.pill}`}>{priorityInfo.label}</span>
            <span className="pill occasion">{wish.occasion}</span>
            <span className="pill">{wish.category}</span>
            {wish.discount && <span className="pill sale">on sale</span>}
          </div>

          <h1 className="detail-title">{wish.title}</h1>
          <div style={{ color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 6 }}>
            from <strong style={{ color: "var(--ink)" }}>{wish.store}</strong>
            <IconExternal size={13} />
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
                <button className="btn btn-ghost btn-lg">
                  <IconExternal size={15} /> View at store
                </button>
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
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-dark btn-lg" style={{ flex: 1 }}>Edit wish</button>
                <button className="btn btn-ghost btn-lg"><IconExternal size={15} /> Store</button>
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
  occasions: Occasion[];
  onNav: (v: ViewId) => void;
}
export const Dashboard: React.FC<DashboardProps> = ({ partnerWishes, myWishes, me, partner, occasions, onNav }) => {
  const nextOccasion = occasions[0];
  return (
    <>
      <PageHeader
        eyebrow={`Good afternoon, ${me.name}`}
        title="You & Theo,"
        accent="synced."
        subtitle="Your shared gifting world at a glance."
      />

      <div className="dash-grid">
        <div className="dash-tile sage" onClick={() => onNav("partner")} style={{ cursor: "pointer" }}>
          <div className="dash-label">{partner.name}'s wishlist</div>
          <div className="dash-value">{partnerWishes.length}</div>
          <div className="dash-sub">3 added this week</div>
          <div className="dash-deco">🎁</div>
        </div>
        <div className="dash-tile blush" onClick={() => onNav("mine")} style={{ cursor: "pointer" }}>
          <div className="dash-label">Your wishlist</div>
          <div className="dash-value">{myWishes.length}</div>
          <div className="dash-sub">15 total reactions</div>
          <div className="dash-deco">♥</div>
        </div>
        <div className="dash-tile butter" onClick={() => onNav("occasions")} style={{ cursor: "pointer" }}>
          <div className="dash-label">Next occasion</div>
          <div className="dash-value" style={{ fontSize: 30 }}>{nextOccasion.title}</div>
          <div className="dash-sub">{nextOccasion.daysAway} days — {nextOccasion.date}</div>
          <div className="dash-deco">🎂</div>
        </div>
        <div className="dash-tile ink">
          <div className="dash-label" style={{ opacity: 0.7 }}>Surprise budget</div>
          <div className="dash-value">$240</div>
          <div className="dash-sub" style={{ opacity: 0.7 }}>of $400 this month</div>
          <div style={{ marginTop: 12, height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "60%", height: "100%", background: "var(--peach)" }} />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Theo's top picks</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav("partner")}>See all →</button>
        </div>
        <div className="wish-grid">
          {partnerWishes.filter(w => w.priority === "must" || w.priority === "love").slice(0, 3).map(w => (
            <WishCard key={w.id} wish={w} mode="partner" me={me} onClick={() => onNav("partner")} />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Coming up</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav("occasions")}>All occasions →</button>
        </div>
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
              <button className="btn btn-ghost btn-sm">Plan</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ---------- Add Wish Modal ----------
interface AddWishModalProps {
  onClose: () => void;
  onAdd: (w: Wish) => void;
}
export const AddWishModal: React.FC<AddWishModalProps> = ({ onClose, onAdd }) => {
  const [step, setStep] = React.useState<"link" | "details">("link");
  const [url, setUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>("");
  const [store, setStore] = React.useState<string>("");
  const [priority, setPriority] = React.useState<Priority>("love");
  const [occasion, setOccasion] = React.useState<OccasionTag>("Just because");
  const [notes, setNotes] = React.useState<string>("");

  const doQuickAdd = () => {
    setLoading(true);
    setTimeout(() => {
      setTitle("Fellow Stagg EKG Kettle");
      setStore("Fellow Products");
      setPrice("195");
      setLoading(false);
      setStep("details");
    }, 1400);
  };

  const submit = () => {
    const w: Wish = {
      id: "new-" + Date.now(),
      title: title || "Untitled wish",
      image: PH("#F6B89A", title.toLowerCase().slice(0, 16) || "new item"),
      price: Number(price) || 0,
      currency: "$",
      store: store || "—",
      category: "Kitchen",
      priority,
      occasion,
      notes,
      reactions: { heart: 0, eyes: 0, gift: 0 },
    };
    onAdd(w);
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
                />
                <button className="btn btn-primary" onClick={doQuickAdd} disabled={loading}>
                  {loading ? "Fetching..." : <><IconSparkle size={14} /> Autofill</>}
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
            <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 96, height: 96, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
                <Placeholder tint="#F6B89A" label="preview" />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <input className="input" placeholder="Item name" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
                  <input className="input" placeholder="Store" value={store} onChange={(e) => setStore(e.target.value)} />
                </div>
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

// ---------- Occasions ----------
interface OccasionsViewProps {
  occasions: Occasion[];
  partner: Person;
  friends: Person[];
}
export const OccasionsView: React.FC<OccasionsViewProps> = ({ occasions, partner, friends }) => (
  <>
    <PageHeader
      eyebrow="Calendar"
      title="Occasions"
      accent="on the way."
      subtitle="Gentle reminders, never pushy."
      actions={<button className="btn btn-primary"><IconPlus size={15} /> Add occasion</button>}
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
              <Avatar person={friends[0]} size="sm" />
              <Avatar person={friends[1]} size="sm" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>3 gifters</span>
          </div>
        </div>
      ))}
    </div>
  </>
);

// ---------- History ----------
interface HistoryViewProps {
  purchased: HistoryItem[];
}
export const HistoryView: React.FC<HistoryViewProps> = ({ purchased }) => (
  <>
    <PageHeader
      eyebrow="Archive"
      title="What we've"
      accent="already given."
      subtitle="So you never repeat a gift (unless it's on purpose)."
    />
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {purchased.map(h => (
        <div key={h.id} className="card" style={{ display: "flex", alignItems: "center", gap: 18, padding: 16 }}>
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
      ))}
    </div>
  </>
);

// ---------- Groups ----------
interface GroupsViewProps {
  me: Person;
  partner: Person;
  friends: Person[];
  circles: ApiCircle[];
  onCircleCreated: (c: ApiCircle) => void;
}
export const GroupsView: React.FC<GroupsViewProps> = ({ circles, onCircleCreated }) => {
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newType, setNewType] = React.useState<'couple' | 'friends'>('friends');
  const [inviteUrl, setInviteUrl] = React.useState('');

  const createCircle = async () => {
    try {
      const circle = await circleApi.create(newName, newType);
      onCircleCreated(circle);
      // immediately generate invite link
      const invite = await circleApi.createInvite(circle.id);
      setInviteUrl(invite.inviteUrl);
      setCreating(false);
      setNewName('');
    } catch {}
  };

  const copyInvite = (circleId: string) => async () => {
    const invite = await circleApi.createInvite(circleId);
    await navigator.clipboard.writeText(invite.inviteUrl).catch(() => {});
    setInviteUrl(invite.inviteUrl);
  };

  const pillColors: Record<string, string> = { couple: 'var(--blush)', friends: 'var(--butter)' };
  const pillText: Record<string, string> = { couple: 'Couple', friends: 'Friend group' };

  return (
    <>
      <PageHeader
        eyebrow="Circles"
        title="Your gifting"
        accent="people."
        subtitle="Couples and groups you sync wishlists with."
        actions={<button className="btn btn-primary" onClick={() => setCreating(true)}><IconPlus size={15} /> New circle</button>}
      />

      {inviteUrl && (
        <div style={{ background: 'var(--paper)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Invite link ready</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', wordBreak: 'break-all' }}>{inviteUrl}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(inviteUrl).catch(() => {}); }}>Copy</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setInviteUrl('')}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
        {circles.map(c => (
          <div key={c.id} className="card" style={{ padding: 24 }}>
            <div className="pill" style={{ background: pillColors[c.type] || 'var(--cream-2)', color: 'var(--ink)' }}>{pillText[c.type] || c.type}</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginTop: 10 }}>{c.name}</h3>
            <div style={{ color: "var(--ink-muted)", fontSize: 13, marginBottom: 16 }}>{c.members.length} member{c.members.length !== 1 ? 's' : ''}</div>
            <div className="members" style={{ marginBottom: 16 }}>
              {c.members.slice(0, 5).map(m => (
                <div key={m.userId} className="avatar sm" style={{ background: m.user.color }}>{m.user.initial}</div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={copyInvite(c.id)}>Copy invite link</button>
          </div>
        ))}

        <button className="card" style={{
          padding: 24, border: "2px dashed var(--line)", background: "transparent",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12, minHeight: 220, color: "var(--ink-muted)", cursor: "pointer",
        }} onClick={() => setCreating(true)}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--cream-2)", display: "grid", placeItems: "center" }}>
            <IconPlus size={22} />
          </div>
          <span style={{ fontWeight: 700 }}>Start a new circle</span>
        </button>
      </div>

      {creating && (
        <div className="modal-backdrop" onClick={() => setCreating(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2 className="modal-title">New circle</h2>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Name</label>
              <input className="input" placeholder="e.g. Nora & Theo" value={newName} onChange={e => setNewName(e.target.value)} />
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
              <button className="btn btn-primary" onClick={createCircle} disabled={!newName.trim()}>Create & get invite link</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ---------- Profile ----------
interface ProfileViewProps { me: Person; onLogout: () => void; }
export const ProfileView: React.FC<ProfileViewProps> = ({ me, onLogout }) => (
  <>
    <PageHeader eyebrow="You" title="Your profile." subtitle="How you show up in the gifting world." />
    <div style={{ maxWidth: 600 }}>
      <div className="card" style={{ padding: 28, display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <Avatar person={me} size="lg" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>{me.name}</div>
          <div style={{ color: "var(--ink-muted)" }}>@{me.nickname.toLowerCase()} · 🎂 {me.birthday}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ color: 'var(--ink-muted)' }}>Sign out</button>
      </div>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 14 }}>Notifications</div>
        {[
          ["Birthdays approaching", true],
          ["Price drops on my wishes", true],
          ["Someone added to their list", false],
          ["Reaction to my wishes", true],
        ].map(([label, on], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 3 ? "1px dotted var(--line)" : "none" }}>
            <span>{label}</span>
            <div style={{ width: 40, height: 22, background: on ? "var(--sage-deep)" : "var(--line)", borderRadius: 999, position: "relative", transition: "background 0.2s" }}>
              <div style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 18, height: 18, background: "white", borderRadius: "50%", transition: "left 0.2s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);
