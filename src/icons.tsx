// icons.tsx — Inline SVG icons, stroke style

import React from 'react';

export interface IconProps {
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

interface PathIconProps extends IconProps {
  d: string;
}

const Icon: React.FC<PathIconProps> = ({ d, size = 20, fill = "none", stroke = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const IconHome: React.FC<IconProps> = (p) => <Icon {...p} d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z" />;
export const IconHeart: React.FC<IconProps> = (p) => <Icon {...p} d="M20.4 4.6a5.5 5.5 0 00-7.8 0L12 5.2l-.6-.6a5.5 5.5 0 00-7.8 7.8l.6.6L12 21l7.8-8 .6-.6a5.5 5.5 0 000-7.8z" />;
export const IconGift: React.FC<IconProps> = (p) => <Icon {...p} d="M20 12v9H4v-9 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />;
export const IconUsers: React.FC<IconProps> = (p) => <Icon {...p} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" />;
export const IconCal: React.FC<IconProps> = (p) => <Icon {...p} d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4 M8 2v4 M3 10h18" />;
export const IconClock: React.FC<IconProps> = (p) => <Icon {...p} d="M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2" />;
export const IconUser: React.FC<IconProps> = (p) => <Icon {...p} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z" />;
export const IconPlus: React.FC<IconProps> = (p) => <Icon {...p} d="M12 5v14 M5 12h14" />;
export const IconLink: React.FC<IconProps> = (p) => <Icon {...p} d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.72" />;
export const IconLock: React.FC<IconProps> = (p) => <Icon {...p} d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4" />;
export const IconEye: React.FC<IconProps> = (p) => <Icon {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 100-6 3 3 0 000 6z" />;
export const IconCheck: React.FC<IconProps> = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
export const IconX: React.FC<IconProps> = (p) => <Icon {...p} d="M18 6L6 18 M6 6l12 12" />;
export const IconSparkle: React.FC<IconProps> = (p) => <Icon {...p} d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />;
export const IconSearch: React.FC<IconProps> = (p) => <Icon {...p} d="M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35" />;
export const IconBell: React.FC<IconProps> = (p) => <Icon {...p} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0" />;
export const IconArrowLeft: React.FC<IconProps> = (p) => <Icon {...p} d="M19 12H5 M12 19l-7-7 7-7" />;
export const IconExternal: React.FC<IconProps> = (p) => <Icon {...p} d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3" />;
export const IconTag: React.FC<IconProps> = (p) => <Icon {...p} d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01" />;
export const IconTrash: React.FC<IconProps> = (p) => <Icon {...p} d="M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6 M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />;
