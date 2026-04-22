// components.tsx — Shared UI components for WishSync

import React from 'react';
import type { Person, Wish, ViewId } from './types';
import { PRIORITY_LABELS } from './data';
import type { IconProps } from './icons';
import {
  IconHome, IconHeart, IconGift, IconUsers, IconCal, IconClock,
  IconUser, IconLock,
} from './icons';

interface MobileTopBarProps {
  me: Person;
  onProfileClick: () => void;
}
export const MobileTopBar: React.FC<MobileTopBarProps> = ({ me, onProfileClick }) => (
  <div className="mobile-topbar-bar">
    <div className="mobile-topbar-logo">
      <div className="mobile-topbar-logo-mark">
        <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
          <path d="M32 32 C 22 22, 14 30, 20 38 C 24 42, 32 46, 32 46 C 32 46, 40 42, 44 38 C 50 30, 42 22, 32 32 Z" fill="#2B2420"/>
        </svg>
      </div>
      WishSync
    </div>
    <button onClick={onProfileClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      <Avatar person={me} />
    </button>
  </div>
);

interface PlaceholderProps {
  tint?: string;
  label?: string;
}
export const Placeholder: React.FC<PlaceholderProps> = ({ tint = "#F6B89A", label = "product" }) => {
  if (label?.startsWith('http')) {
    return <img src={label} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
  }
  return (
    <div className="ph" style={{ background: tint }}>
      <span className="ph-label">{label}</span>
    </div>
  );
};

interface AvatarProps {
  person: Person;
  size?: "sm" | "md" | "lg";
}
export const Avatar: React.FC<AvatarProps> = ({ person, size = "md" }) => {
  const cls = size === "lg" ? "avatar lg" : size === "sm" ? "avatar sm" : "avatar";
  if (person.avatarUrl) {
    return (
      <div className={cls} style={{ background: person.color, padding: 0, overflow: 'hidden' }}>
        <img src={person.avatarUrl} alt={person.initial} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div className={cls} style={{ background: person.color }}>
      {person.initial}
    </div>
  );
};

interface SidebarProps {
  currentView: ViewId;
  onNav: (v: ViewId) => void;
  me: Person;
  newCount: number;
  partnerNickname?: string;
  hasPartner?: boolean;
}
export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNav, me, newCount, partnerNickname = "Partner", hasPartner = false }) => {
  const items: { id: ViewId; label: string; icon: React.FC<IconProps> }[] = [
    { id: "dashboard", label: "Home", icon: IconHome },
    { id: "partner", label: hasPartner ? `${partnerNickname}'s list` : "Find your +1", icon: IconHeart },
    { id: "mine", label: "My list", icon: IconGift },
    { id: "groups", label: "Friends", icon: IconUsers },
    { id: "occasions", label: "Occasions", icon: IconCal },
    { id: "history", label: "Purchased", icon: IconClock },
  ];
  return (
    <aside className="sidebar">
      <div className="logo">
        <svg width="34" height="34" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
          <rect width="64" height="64" rx="14" fill="var(--primary)"/>
          <path d="M32 32 C 22 22, 14 30, 20 38 C 24 42, 32 46, 32 46 C 32 46, 40 42, 44 38 C 50 30, 42 22, 32 32 Z" fill="#2B2420"/>
        </svg>
        <span>WishSync</span>
      </div>

      <div className="nav">
        {items.map(it => {
          const I = it.icon;
          const isInviteCta = it.id === "partner" && !hasPartner;
          return (
            <button
              key={it.id}
              className={`nav-item ${currentView === it.id ? "active" : ""} ${isInviteCta ? "nav-cta" : ""}`}
              onClick={() => onNav(it.id)}
            >
              <I size={18} />
              {it.label}
              {it.id === "partner" && hasPartner && newCount > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 11, background: "var(--blush)", padding: "2px 8px", borderRadius: 999, fontWeight: 800 }}>
                  {newCount} new
                </span>
              )}
            </button>
          );
        })}

        <div className="nav-section">Account</div>
        <button
          className={`nav-item ${currentView === "profile" ? "active" : ""}`}
          onClick={() => onNav("profile")}
        >
          <IconUser size={18} />
          Profile
        </button>
      </div>

      <div className="profile-card">
        <Avatar person={me} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="name">{me.nickname}</div>
          <div className="sub">🎂 {me.birthday || '—'}</div>
        </div>
      </div>
    </aside>
  );
};

interface MobileNavProps {
  currentView: ViewId;
  onNav: (v: ViewId) => void;
  partnerNickname?: string;
  hasPartner?: boolean;
}
export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNav, partnerNickname = 'Partner', hasPartner = false }) => {
  const items: { id: ViewId; icon: React.FC<IconProps>; label: string }[] = [
    { id: 'dashboard', icon: IconHome, label: 'Home' },
    { id: 'partner', icon: IconHeart, label: hasPartner ? partnerNickname : '+1' },
    { id: 'mine', icon: IconGift, label: 'My list' },
    { id: 'groups', icon: IconUsers, label: 'Friends' },
    { id: 'occasions', icon: IconCal, label: 'Occasions' },
    { id: 'history', icon: IconClock, label: 'History' },
  ];
  return (
    <nav className="mobile-nav">
      {items.map(it => {
        const I = it.icon;
        return (
          <button key={it.id} className={`mobile-nav-item ${currentView === it.id ? 'active' : ''}`} onClick={() => onNav(it.id)}>
            <I size={22} />
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

interface WishCardProps {
  wish: Wish;
  mode: "partner" | "mine";
  me: Person;
  onClick?: () => void;
  onReserve?: (w: Wish) => void;
}
export const WishCard: React.FC<WishCardProps> = ({ wish, mode, me, onClick, onReserve }) => {
  const { title, image, price, originalPrice, currency, store, priority, reserved, reactions, discount } = wish;
  const priorityInfo = PRIORITY_LABELS[priority];

  const reservedByMe = !!reserved && reserved.by === me.id;
  const reservedBySomeone = !!reserved;

  const handleReserveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReserve) onReserve(wish);
  };

  return (
    <div className={`wish-card ${reservedByMe ? "reserved-by-me" : ""}`} onClick={onClick}>
      {mode === "partner" && reservedBySomeone && (
        <div className="ribbon">
          {reservedByMe ? "You reserved" : "Reserved"}
        </div>
      )}

      <div className="wish-image">
        <Placeholder tint={image.tint} label={image.label} />
        {discount && originalPrice && (
          <span className="pill sale" style={{ position: "absolute", top: 10, left: 10 }}>
            ↓ {Math.round(((originalPrice - price) / originalPrice) * 100)}% off
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="wish-title">{title}</h3>
          <div className="wish-store">{store}</div>
        </div>
        <span className={`pdot ${priority}`} title={priorityInfo.label} style={{ marginTop: 8 }} />
      </div>

      <div className="wish-meta">
        <div className="wish-price">
          {originalPrice && <span className="original">{currency}{originalPrice}</span>}
          {currency}{price}
        </div>
        <span className={`pill ${priorityInfo.pill}`}>{priorityInfo.label}</span>
      </div>

      {mode === "partner" && (
        <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
          {reservedByMe ? (
            <button className="btn btn-sm" style={{ flex: 1, justifyContent: "center", background: "var(--sage)", color: "var(--ink)" }} onClick={handleReserveClick}>
              <IconLock size={13} /> You've got this
            </button>
          ) : reservedBySomeone ? (
            <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center", opacity: 0.6 }} disabled>
              Taken by another buddy
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={handleReserveClick}>
              <IconGift size={13} /> Reserve secretly
            </button>
          )}
        </div>
      )}

      {mode === "mine" && (
        <div className="reaction-bar">
          <span className="reaction">♥ {reactions.heart}</span>
          <span className="reaction">👀 {reactions.eyes}</span>
          <span className="reaction">🎁 {reactions.gift}</span>
        </div>
      )}
    </div>
  );
};

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  accent?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, accent, subtitle, actions }) => (
  <div className="page-header">
    <div>
      {eyebrow && <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{eyebrow}</div>}
      <h1 className="page-title">
        {title}{accent && <> <span className="accent">{accent}</span></>}
      </h1>
      {subtitle && <div className="page-sub">{subtitle}</div>}
    </div>
    {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
  </div>
);
