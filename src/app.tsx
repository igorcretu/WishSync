import React from 'react';
import type { ViewId, Wish, Occasion, HistoryItem, Person } from './types';
import { Sidebar, MobileNav } from './components';
import {
  Dashboard, PartnerList, MyList, DetailView, OccasionsView,
  HistoryView, GroupsView, ProfileView, SecretOverlay, AddWishModal,
} from './views';
import { AuthViews } from './auth-views';
import { useAuth } from './AuthContext';
import { wishes as wishApi, circles as circleApi, occasions as occasionApi, history as historyApi, imageUrl } from './api';
import type { ApiCircle } from './api';

// ---- theme ----

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{ "theme": "peach" }/*EDITMODE-END*/;
type ThemeId = 'peach' | 'blush' | 'butter' | 'sage' | 'lilac';
const THEMES = [
  { id: 'peach'  as ThemeId, swatch: '#F6B89A', primary: '#F6B89A', primaryDeep: '#E89671', accent: '#F2C2C9', tertiary: '#F6E2A8' },
  { id: 'blush'  as ThemeId, swatch: '#F2C2C9', primary: '#F2C2C9', primaryDeep: '#E89AA5', accent: '#F6B89A', tertiary: '#D4C5E8' },
  { id: 'butter' as ThemeId, swatch: '#F6E2A8', primary: '#F6E2A8', primaryDeep: '#E9C969', accent: '#BED6B0', tertiary: '#F6B89A' },
  { id: 'sage'   as ThemeId, swatch: '#BED6B0', primary: '#BED6B0', primaryDeep: '#96BB82', accent: '#F6E2A8', tertiary: '#F2C2C9' },
  { id: 'lilac'  as ThemeId, swatch: '#D4C5E8', primary: '#D4C5E8', primaryDeep: '#A68BCE', accent: '#F2C2C9', tertiary: '#B8D4E3' },
];

// ---- helpers ----

function apiWishToWish(w: any, currentUserId: string): Wish {
  // build reserved field compatible with existing components
  let reserved: Wish['reserved'] = null;
  if (w.reservation !== undefined) {
    if (w.reservation === null) reserved = null;
    else reserved = { by: w.reservation.byMe ? currentUserId : '__other__' };
  }
  return {
    id: w.id,
    title: w.title,
    image: {
      tint: w.imageTint,
      // if real image exists, imageUrl() gives the full URL; we stuff it in label so Placeholder can use it
      label: imageUrl(w.imagePath) || w.imageLabel,
    },
    price: w.price,
    originalPrice: w.originalPrice,
    currency: w.currency,
    store: w.store,
    storeUrl: w.storeUrl,
    category: w.category,
    priority: w.priority,
    occasion: w.occasion,
    notes: w.notes,
    discount: w.discount,
    reserved,
    reactions: w.reactions,
  };
}

function apiUserToPerson(u: any): Person {
  return { id: u.id, name: u.name, nickname: u.nickname, color: u.color, initial: u.initial, birthday: u.birthday ?? undefined };
}

function occasionDaysAway(dateStr: string): number {
  const now = new Date();
  const [monthStr, dayStr] = dateStr.split(' ');
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const month = months[monthStr] ?? 0;
  const day = parseInt(dayStr, 10);
  let target = new Date(now.getFullYear(), month, day);
  if (target < now) target.setFullYear(now.getFullYear() + 1);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

// ---- main App ----

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return <div className="auth-screen"><div style={{ fontSize: 24 }}>Loading…</div></div>;
  if (!user) return <AuthViews />;

  return <AppInner />;
};

const AppInner: React.FC = () => {
  const { user, logout } = useAuth();

  // ---- state ----
  const [view, setView] = React.useState<ViewId>(() => (localStorage.getItem('ws-view') as ViewId) || 'partner');
  const [detailWish, setDetailWish] = React.useState<Wish | null>(null);
  const [detailMode, setDetailMode] = React.useState<'partner' | 'mine'>('partner');
  const [secretWish, setSecretWish] = React.useState<Wish | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [toast, setToast] = React.useState('');
  const [theme, setTheme] = React.useState<ThemeId>(TWEAK_DEFAULTS.theme as ThemeId);
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  // ---- data ----
  const [myWishes, setMyWishes] = React.useState<Wish[]>([]);
  const [partnerWishes, setPartnerWishes] = React.useState<Wish[]>([]);
  const [partner, setPartner] = React.useState<Person | null>(null);
  const [friends, setFriends] = React.useState<Person[]>([]);
  const [myCircles, setMyCircles] = React.useState<ApiCircle[]>([]);
  const [occasionList, setOccasionList] = React.useState<Occasion[]>([]);
  const [historyList, setHistoryList] = React.useState<HistoryItem[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  const me: Person = apiUserToPerson(user);

  // ---- initial load ----
  React.useEffect(() => {
    if (!user) return;
    Promise.all([
      wishApi.list(),
      circleApi.list(),
      occasionApi.list(),
      historyApi.list(),
    ]).then(([myW, circleList, occ, hist]) => {
      setMyWishes(myW.map(w => apiWishToWish(w, user.id)));
      setMyCircles(circleList);

      // derive partner + friends from circles
      const couple = circleList.find(c => c.type === 'couple');
      const otherMembers = circleList
        .flatMap(c => c.members)
        .filter(m => m.userId !== user.id)
        .map(m => apiUserToPerson(m.user));

      const uniqueOthers = Array.from(new Map(otherMembers.map(p => [p.id, p])).values());

      if (couple) {
        const partnerMember = couple.members.find(m => m.userId !== user.id);
        if (partnerMember) {
          const p = apiUserToPerson(partnerMember.user);
          setPartner(p);
          setFriends(uniqueOthers.filter(o => o.id !== p.id));
          // fetch partner wishes
          circleApi.memberWishes(couple.id, partnerMember.userId).then(pw => {
            setPartnerWishes(pw.map(w => apiWishToWish(w, user.id)));
          }).catch(() => {});
        } else {
          setFriends(uniqueOthers);
        }
      } else {
        setFriends(uniqueOthers);
      }

      setOccasionList(occ.map(o => ({
        id: o.id,
        title: o.title,
        date: o.date,
        day: o.date.split(' ')[1] ?? '',
        month: o.date.split(' ')[0]?.toUpperCase() ?? '',
        daysAway: occasionDaysAway(o.date),
        person: o.personId ?? 'both',
        color: o.color,
      })));

      setHistoryList(hist.map(h => ({
        id: h.id,
        title: h.title,
        for: h.for,
        by: h.by,
        date: h.date,
        price: h.price,
        image: { tint: h.imageTint, label: imageUrl(h.imagePath) || h.imageLabel },
      })));

      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, [user]);

  React.useEffect(() => { localStorage.setItem('ws-view', view); }, [view]);

  // ---- theme ----
  React.useEffect(() => {
    const t = THEMES.find(x => x.id === theme) || THEMES[0];
    const r = document.documentElement.style;
    r.setProperty('--primary', t.primary);
    r.setProperty('--primary-deep', t.primaryDeep);
    r.setProperty('--accent', t.accent);
    r.setProperty('--tertiary', t.tertiary);
  }, [theme]);

  React.useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const setThemeAndPersist = (t: ThemeId) => {
    setTheme(t);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: t } }, '*');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  };

  const openDetail = (w: Wish, mode: 'partner' | 'mine') => {
    setDetailWish(w);
    setDetailMode(mode);
    setView('detail');
  };

  // ---- reserve ----
  const confirmReserve = async () => {
    if (!secretWish) return;
    try {
      const res = await wishApi.reserve(secretWish.id);
      const nowReserved = res.reserved;
      setPartnerWishes(prev =>
        prev.map(w => w.id === secretWish.id
          ? { ...w, reserved: nowReserved ? { by: user!.id } : null }
          : w)
      );
      if (detailWish?.id === secretWish.id) {
        setDetailWish(prev => prev ? { ...prev, reserved: nowReserved ? { by: user!.id } : null } : null);
      }
      showToast(nowReserved ? `Reserved — ${partner?.nickname ?? 'them'} won't see a thing 🤫` : 'Released — someone else can claim it');
    } catch (err: any) {
      showToast(err.message || 'Could not reserve');
    }
    setSecretWish(null);
  };

  const handleReserveClick = (w: Wish) => {
    if (w.reserved && w.reserved.by !== user!.id) return;
    setSecretWish(w);
  };

  // ---- add wish ----
  const addWish = async (w: Wish) => {
    try {
      const created = await wishApi.create({
        title: w.title,
        imageTint: w.image.tint,
        imageLabel: w.image.label,
        price: w.price,
        originalPrice: w.originalPrice,
        currency: w.currency,
        store: w.store,
        storeUrl: w.storeUrl,
        category: w.category,
        priority: w.priority,
        occasion: w.occasion,
        notes: w.notes,
        discount: w.discount ?? false,
      });
      setMyWishes(prev => [apiWishToWish(created, user!.id), ...prev]);
      setShowAdd(false);
      showToast('Wish added ✨');
    } catch (err: any) {
      showToast(err.message || 'Could not add wish');
    }
  };

  if (dataLoading) {
    return (
      <div className="app">
        <Sidebar currentView={view} onNav={setView} me={me} newCount={0} />
        <main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--ink-muted)', fontSize: 18 }}>Loading your wishes…</div>
        </main>
      </div>
    );
  }

  const effectivePartner = partner || { id: '__none__', name: 'Partner', nickname: 'Partner', color: '#BED6B0', initial: 'P' };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard partnerWishes={partnerWishes} myWishes={myWishes} me={me} partner={effectivePartner} occasions={occasionList} onNav={setView} />;
      case 'partner':
        return <PartnerList wishes={partnerWishes} partner={effectivePartner} me={me} onOpen={w => openDetail(w, 'partner')} onReserve={handleReserveClick} />;
      case 'mine':
        return <MyList wishes={myWishes} me={me} onOpen={w => openDetail(w, 'mine')} onAdd={() => setShowAdd(true)} partnerName={effectivePartner.name} friendsCount={friends.length} />;
      case 'detail':
        return detailWish && <DetailView wish={detailWish} mode={detailMode} me={me} partner={effectivePartner} friends={friends} onBack={() => setView(detailMode === 'partner' ? 'partner' : 'mine')} onReserve={handleReserveClick} />;
      case 'occasions':
        return <OccasionsView occasions={occasionList} partner={effectivePartner} friends={friends} />;
      case 'history':
        return <HistoryView purchased={historyList} />;
      case 'groups':
        return <GroupsView me={me} partner={effectivePartner} friends={friends} circles={myCircles} onCircleCreated={circle => setMyCircles(prev => [...prev, circle])} />;
      case 'profile':
        return <ProfileView me={me} onLogout={logout} />;
      default:
        return null;
    }
  };

  const newCount = partnerWishes.filter(w => !w.reserved).length >= 3 ? 3 : 0;

  return (
    <div className="app">
      <Sidebar currentView={view} onNav={setView} me={me} newCount={newCount} partnerNickname={effectivePartner.nickname} />
      <main className="main">{renderView()}</main>
      <MobileNav currentView={view} onNav={setView} partnerNickname={effectivePartner.nickname} />

      {secretWish && (
        <SecretOverlay
          wish={secretWish}
          partnerNickname={effectivePartner.nickname}
          onConfirm={confirmReserve}
          onCancel={() => setSecretWish(null)}
        />
      )}

      {showAdd && <AddWishModal onClose={() => setShowAdd(false)} onAdd={addWish} />}
      {toast && <div className="toast">{toast}</div>}

      {tweaksOpen && (
        <div className="tweaks-panel">
          <div className="tweaks-title">Tweaks</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Color theme</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {THEMES.map(t => (
              <button key={t.id} className={`theme-swatch ${theme === t.id ? 'active' : ''}`} style={{ background: t.swatch }} onClick={() => setThemeAndPersist(t.id)} title={t.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
