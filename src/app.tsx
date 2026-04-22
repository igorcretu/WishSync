import React from 'react';
import type { ViewId, Wish, Occasion, HistoryItem, Person } from './types';
import { Sidebar, MobileNav } from './components';
import {
  Dashboard, PartnerList, MyList, DetailView, OccasionsView,
  HistoryView, GroupsView, ProfileView, SecretOverlay, AddWishModal,
  EmptyPartnerView, InviteAcceptView,
} from './views';
import { AuthViews } from './auth-views';
import { useAuth } from './AuthContext';
import { wishes as wishApi, circles as circleApi, occasions as occasionApi, history as historyApi, imageUrl } from './api';
import type { ApiCircle, ApiActivityItem } from './api';

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
  return {
    id: u.id, name: u.name, nickname: u.nickname, color: u.color, initial: u.initial,
    birthday: u.birthday ?? undefined,
    avatarUrl: u.avatarPath ? imageUrl(u.avatarPath) ?? undefined : undefined,
  };
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

function apiOccasionToOccasion(o: any): Occasion {
  const [monthStr, dayStr] = (o.date as string).split(' ');
  return {
    id: o.id,
    circleId: o.circleId,
    title: o.title,
    date: o.date,
    day: dayStr ?? '',
    month: (monthStr ?? '').toUpperCase(),
    daysAway: occasionDaysAway(o.date),
    person: o.personId ?? 'both',
    color: o.color,
  };
}

// ---- main App ----

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return <div className="auth-screen"><div style={{ fontSize: 24 }}>Loading…</div></div>;

  const inviteMatch = window.location.pathname.match(/^\/invite\/([^/]+)/);
  if (inviteMatch) {
    if (!user) return <AuthViews />;
    const token = inviteMatch[1];
    const done = () => {
      window.history.replaceState(null, '', '/');
      window.location.reload();
    };
    return <InviteAcceptView token={token} onDone={done} />;
  }

  if (!user) return <AuthViews />;

  return <AppInner />;
};

const AppInner: React.FC = () => {
  const { user, logout, updateUser } = useAuth();

  // ---- state ----
  const [view, setView] = React.useState<ViewId>(() => (localStorage.getItem('ws-view') as ViewId) || 'partner');
  const [detailWish, setDetailWish] = React.useState<Wish | null>(null);
  const [detailMode, setDetailMode] = React.useState<'partner' | 'mine'>('partner');
  const [secretWish, setSecretWish] = React.useState<Wish | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [toast, setToast] = React.useState('');
  const [theme, setTheme] = React.useState<ThemeId>(TWEAK_DEFAULTS.theme as ThemeId);
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  // friend member wishlist view
  const [friendView, setFriendView] = React.useState<{ circleId: string; person: Person; wishes: Wish[]; loaded: boolean } | null>(null);

  // ---- data ----
  const [myWishes, setMyWishes] = React.useState<Wish[]>([]);
  const [partnerWishes, setPartnerWishes] = React.useState<Wish[]>([]);
  const [partner, setPartner] = React.useState<Person | null>(null);
  const [friends, setFriends] = React.useState<Person[]>([]);
  const [myCircles, setMyCircles] = React.useState<ApiCircle[]>([]);
  const [occasionList, setOccasionList] = React.useState<Occasion[]>([]);
  const [historyList, setHistoryList] = React.useState<HistoryItem[]>([]);
  const [activityFeed, setActivityFeed] = React.useState<ApiActivityItem[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  const me: Person = apiUserToPerson(user);

  // ---- initial load ----
  React.useEffect(() => {
    if (!user) return;
    // Load activity feed in the background (non-blocking)
    wishApi.activity().then(setActivityFeed).catch(() => {});

    Promise.all([
      wishApi.list().catch(() => [] as any[]),
      circleApi.list().catch(() => [] as any[]),
      occasionApi.list().catch(() => [] as any[]),
      historyApi.list().catch(() => [] as any[]),
    ]).then(([myW, circleList, occ, hist]) => {
      setMyWishes(myW.map(w => apiWishToWish(w, user.id)));
      setMyCircles(circleList);

      const couple = circleList.find(c => c.type === 'couple');
      const otherMembers = circleList
        .flatMap(c => c.members)
        .filter(m => m.userId !== user.id)
        .map(m => apiUserToPerson(m.user));

      const uniqueOthers = Array.from(new Map(otherMembers.map(p => [p.id, p])).values());

      if (couple) {
        const partnerMember = couple.members.find((m: any) => m.userId !== user.id);
        if (partnerMember) {
          const p = apiUserToPerson(partnerMember.user);
          setPartner(p);
          setFriends(uniqueOthers.filter(o => o.id !== p.id));
          circleApi.memberWishes(couple.id, partnerMember.userId).then(pw => {
            setPartnerWishes(pw.map(w => apiWishToWish(w, user.id)));
          }).catch(() => {});
        } else {
          setFriends(uniqueOthers);
        }
      } else {
        setFriends(uniqueOthers);
      }

      setOccasionList(occ.map(apiOccasionToOccasion).sort((a, b) => a.daysAway - b.daysAway));

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

  // Handle PWA shortcuts (?view=X) and share_target (?share_url=X)
  React.useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const targetView = params.get('view') as ViewId | null;
    const addWish = params.get('add');
    const shareUrl = params.get('share_url') || params.get('share_title') || params.get('share_text');
    if (targetView) setView(targetView);
    if (addWish === 'true' || shareUrl) {
      setShowAdd(true);
      if (shareUrl) {
        // Pre-fill share URL — store in sessionStorage for AddWishModal to pick up
        sessionStorage.setItem('ws-share-url', shareUrl);
      }
    }
    // Clean up URL without reload
    if (params.toString()) window.history.replaceState({}, '', '/');
  }, [user]);

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
      const updateWishReservation = (prev: Wish[]) =>
        prev.map(w => w.id === secretWish.id
          ? { ...w, reserved: nowReserved ? { by: user!.id } : null }
          : w);
      setPartnerWishes(updateWishReservation);
      if (friendView) setFriendView(prev => prev ? { ...prev, wishes: updateWishReservation(prev.wishes) } : null);
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

  // ---- delete wish ----
  const deleteWish = async (id: string) => {
    try {
      await wishApi.remove(id);
      setMyWishes(prev => prev.filter(w => w.id !== id));
      setView('mine');
    } catch {
      showToast('Could not delete wish');
    }
  };

  // ---- update wish ----
  const updateWish = (id: string, updated: Wish) => {
    setMyWishes(prev => prev.map(w => w.id === id ? updated : w));
    setDetailWish(updated);
    showToast('Wish updated ✨');
  };

  // ---- purchase wish ----
  const purchaseWish = async (id: string) => {
    try {
      setPartnerWishes(prev => prev.filter(w => w.id !== id));
      if (friendView) setFriendView(prev => prev ? { ...prev, wishes: prev.wishes.filter(w => w.id !== id) } : null);
      setView(detailMode === 'partner' ? 'partner' : 'friend');
      // reload history
      historyApi.list().then(hist => {
        setHistoryList(hist.map(h => ({
          id: h.id, title: h.title, for: h.for, by: h.by, date: h.date, price: h.price,
          image: { tint: h.imageTint, label: imageUrl(h.imagePath) || h.imageLabel },
        })));
      }).catch(() => {});
      showToast('Marked as purchased 🎁');
    } catch {
      showToast('Could not mark as purchased');
    }
  };

  // ---- add wish ----
  const addWish = async (w: Wish, imageFile?: File) => {
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
      if (imageFile) {
        const uploaded = await wishApi.uploadImage(created.id, imageFile);
        created.imagePath = uploaded.imagePath;
      }
      setMyWishes(prev => [apiWishToWish(created, user!.id), ...prev]);
      setShowAdd(false);
      showToast('Wish added ✨');
    } catch (err: any) {
      showToast(err.message || 'Could not add wish');
    }
  };

  // ---- occasion CRUD ----
  const addOccasion = (o: Occasion) => {
    setOccasionList(prev => [...prev, o].sort((a, b) => a.daysAway - b.daysAway));
  };
  const editOccasion = (o: Occasion) => {
    setOccasionList(prev => prev.map(x => x.id === o.id ? o : x).sort((a, b) => a.daysAway - b.daysAway));
  };
  const removeOccasion = (id: string) => {
    setOccasionList(prev => prev.filter(o => o.id !== id));
  };

  // ---- group member wishlist ----
  const viewMember = async (circleId: string, person: Person) => {
    setFriendView({ circleId, person, wishes: [], loaded: false });
    setView('friend');
    try {
      const wishes = await circleApi.memberWishes(circleId, person.id);
      setFriendView({ circleId, person, wishes: wishes.map(w => apiWishToWish(w, user!.id)), loaded: true });
    } catch {
      setFriendView(prev => prev ? { ...prev, loaded: true } : null);
    }
  };

  // ---- circle updates ----
  const updateCircle = (updated: ApiCircle) => {
    setMyCircles(prev => prev.map(c => c.id === updated.id ? updated : c));
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
        return <Dashboard partnerWishes={partnerWishes} myWishes={myWishes} me={me} partner={effectivePartner} hasPartner={!!partner} occasions={occasionList} activityFeed={activityFeed} circles={myCircles} onViewMember={(circleId, person) => { viewMember(circleId, person); setView('friend'); }} onNav={setView} />;
      case 'partner':
        if (!partner) return <EmptyPartnerView onGoToGroups={() => setView('groups')} />;
        return <PartnerList wishes={partnerWishes} partner={effectivePartner} me={me} onOpen={w => openDetail(w, 'partner')} onReserve={handleReserveClick} />;
      case 'mine':
        return <MyList wishes={myWishes} me={me} onOpen={w => openDetail(w, 'mine')} onAdd={() => setShowAdd(true)} partnerName={effectivePartner.name} friendsCount={friends.length} />;
      case 'detail':
        return detailWish && (
          <DetailView
            wish={detailWish}
            mode={detailMode}
            me={me}
            partner={effectivePartner}
            friends={friends}
            onBack={() => setView(detailMode === 'partner' ? 'partner' : 'mine')}
            onReserve={handleReserveClick}
            onDelete={detailMode === 'mine' ? deleteWish : undefined}
            onUpdate={detailMode === 'mine' ? updateWish : undefined}
            onPurchase={detailMode === 'partner' ? purchaseWish : undefined}
          />
        );
      case 'occasions':
        return (
          <OccasionsView
            occasions={occasionList}
            partner={effectivePartner}
            friends={friends}
            circles={myCircles}
            onAdd={addOccasion}
            onEdit={editOccasion}
            onDelete={removeOccasion}
          />
        );
      case 'history':
        return <HistoryView purchased={historyList} myNickname={user!.nickname} />;
      case 'groups':
        return (
          <GroupsView
            me={me}
            partner={effectivePartner}
            friends={friends}
            circles={myCircles}
            myId={user!.id}
            onCircleCreated={circle => setMyCircles(prev => [...prev, circle])}
            onCircleLeft={id => setMyCircles(prev => prev.filter(c => c.id !== id))}
            onCircleUpdated={updateCircle}
            onViewMember={viewMember}
          />
        );
      case 'profile':
        return <ProfileView me={me} apiUser={user!} onLogout={logout} onUpdateUser={updateUser} onDeleteAccount={logout} />;
      case 'friend':
        if (!friendView) return null;
        return (
          <PartnerList
            wishes={friendView.loaded ? friendView.wishes : []}
            partner={friendView.person}
            me={me}
            onOpen={w => openDetail(w, 'partner')}
            onReserve={handleReserveClick}
            backLabel="Back to groups"
            onBack={() => setView('groups')}
          />
        );
      default:
        return null;
    }
  };

  const newCount = partnerWishes.filter(w => !w.reserved).length >= 3 ? 3 : 0;

  return (
    <div className="app">
      <Sidebar currentView={view} onNav={setView} me={me} newCount={newCount} partnerNickname={effectivePartner.nickname} hasPartner={!!partner} />
      <main className="main">{renderView()}</main>
      <MobileNav currentView={view} onNav={setView} partnerNickname={effectivePartner.nickname} hasPartner={!!partner} />

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
