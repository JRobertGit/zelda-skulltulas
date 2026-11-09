// All artwork here is original, drawn for this app.
import type { Kind } from './types';

const svg = (body: string, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 32 32" aria-hidden="true">${body}</svg>`;

const HEART_PATH = 'M16 28 C6 21 3 16 3 11 C3 6.5 6.5 4 10 4 C12.6 4 15 5.5 16 8 C17 5.5 19.4 4 22 4 C25.5 4 29 6.5 29 11 C29 16 26 21 16 28 Z';

export function spider(): string {
  return svg(`
    <circle cx="16" cy="16" r="14.5" fill="#3a2d0c" stroke="#f2c14e" stroke-width="1.6"/>
    <g stroke="#f2c14e" stroke-width="1.7" fill="none" stroke-linecap="round">
      <path d="M12 13 L7 9 L5 12"/><path d="M11.5 16 L6 15 L4.5 18"/>
      <path d="M12 19 L7 21 L6 25"/><path d="M13.5 21 L10.5 25 L11 27"/>
      <path d="M20 13 L25 9 L27 12"/><path d="M20.5 16 L26 15 L27.5 18"/>
      <path d="M20 19 L25 21 L26 25"/><path d="M18.5 21 L21.5 25 L21 27"/>
    </g>
    <ellipse cx="16" cy="17" rx="5" ry="6" fill="#f2c14e"/>
    <circle cx="16" cy="10.5" r="3" fill="#f2c14e"/>
    <circle cx="14.8" cy="10" r=".8" fill="#3a2d0c"/><circle cx="17.2" cy="10" r=".8" fill="#3a2d0c"/>`);
}

export function heartPiece(): string {
  return svg(`
    <path d="${HEART_PATH}" fill="#3b1420" stroke="#ff6b81" stroke-width="1.5"/>
    <path d="M16 8 C15 5.5 12.6 4 10 4 C6.5 4 3 6.5 3 11 C3 12.5 3.2 14 4 16 L16 16 Z" fill="#ff6b81"/>`);
}

/** A whole heart made of four pieces, with `filled` of them lit. */
export function quarteredHeart(filled: number): string {
  const lit = (n: number) => (filled > n ? '#ff6b81' : '#2a2238');
  const id = `h${Math.random().toString(36).slice(2, 8)}`;
  return `<svg class="heart-cell" viewBox="0 0 32 32" role="img" aria-label="${filled} of 4 pieces">
    <clipPath id="${id}"><path d="${HEART_PATH}"/></clipPath>
    <g clip-path="url(#${id})">
      <rect x="0" y="0" width="16" height="16" fill="${lit(0)}"/>
      <rect x="16" y="0" width="16" height="16" fill="${lit(1)}"/>
      <rect x="16" y="16" width="16" height="16" fill="${lit(2)}"/>
      <rect x="0" y="16" width="16" height="16" fill="${lit(3)}"/>
    </g>
    <path d="${HEART_PATH}" fill="none" stroke="#ff6b81" stroke-width="1.2" opacity=".7"/>
    <path d="M16 3 V29 M2 16 H30" stroke="#12172b" stroke-width="1"/>
  </svg>`;
}

export function bottle(filled = true): string {
  const fill = filled ? '#6fd8d0' : 'none';
  const stroke = filled ? '#6fd8d0' : '#566080';
  return svg(`
    <rect x="12" y="3" width="8" height="4" rx="1" fill="${stroke}"/>
    <path d="M13 7 V11 C9 13 7.5 15.5 7.5 19 V25 C7.5 27.5 9 29 11.5 29 H20.5 C23 29 24.5 27.5 24.5 25 V19 C24.5 15.5 23 13 19 11 V7" fill="none" stroke="${stroke}" stroke-width="1.8"/>
    <path d="M9.5 19.5 H22.5 V25 C22.5 26.5 21.5 27 20.5 27 H11.5 C10.5 27 9.5 26.5 9.5 25 Z" fill="${fill}" opacity=".55"/>`);
}

export function note(filled = true): string {
  const colour = filled ? '#b89cff' : '#566080';
  return svg(`
    <path d="M12 24 V7 L25 4 V21" fill="none" stroke="${colour}" stroke-width="2.2" stroke-linejoin="round"/>
    <ellipse cx="8.5" cy="24" rx="4" ry="3.2" fill="${colour}"/>
    <ellipse cx="21.5" cy="21" rx="4" ry="3.2" fill="${colour}"/>`);
}

const KIND_ICONS: Record<Kind, () => string> = {
  skulltula: spider,
  heart: heartPiece,
  bottle: () => bottle(),
  song: () => note(),
  upgrade: () =>
    svg(`<path d="M10 9 C7 13 5 18 6 23 C6.6 26.5 9.5 28 16 28 C22.5 28 25.4 26.5 26 23 C27 18 25 13 22 9 Z" fill="#7a5a33" stroke="#d6a65f" stroke-width="1.6"/>
    <path d="M10 9 C13 11 19 11 22 9 L20 4 H12 Z" fill="#d6a65f"/>
    <path d="M16 15 V23 M12 19 H20" stroke="#ffe7b0" stroke-width="2.4" stroke-linecap="round"/>`),
  fairy: () =>
    svg(`<path d="M16 16 C10 3 2 6 4 13 C5 17 11 18 16 16 Z M16 16 C22 3 30 6 28 13 C27 17 21 18 16 16 Z" fill="#ff9fd8" opacity=".85"/>
    <path d="M16 16 C11 19 7 25 11 27 C14 28 16 22 16 16 Z M16 16 C21 19 25 25 21 27 C18 28 16 22 16 16 Z" fill="#ffc8e8" opacity=".85"/>
    <circle cx="16" cy="16" r="3.4" fill="#fff5d6"/>`),
  shield: () =>
    svg(`<path d="M16 3 L27 7 V15 C27 22 22 27 16 29 C10 27 5 22 5 15 V7 Z" fill="#2c4f9e" stroke="#c6d2ee" stroke-width="1.8"/>
    <path d="M16 8 L20 16 L16 24 L12 16 Z" fill="#c6d2ee"/>`),
  plant: () =>
    svg(`<path d="M16 28V15" stroke="#7fd6a0" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M16 17C16 10 11 7 5 8C5 14 9 18 16 17Z" fill="#7fd6a0"/><path d="M16 15C16 9 21 6 27 7C27 13 23 16 16 15Z" fill="#a3e9b9"/>
    <ellipse cx="16" cy="28" rx="8" ry="2.6" fill="#7a5a33"/>`),
  chest: () =>
    svg(`<path d="M4 14C4 8 8 6 16 6S28 8 28 14V26H4Z" fill="#7a5a33" stroke="#d6a65f" stroke-width="1.6"/>
    <path d="M4 15H28" stroke="#d6a65f" stroke-width="2"/><rect x="13" y="12.5" width="6" height="7" rx="1" fill="#f2c14e"/>`),
  quest: () =>
    svg(`<path d="M6 8C13 3 19 3 26 8" fill="none" stroke="#6fd8d0" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M26 8V4M26 8H22M26 24C19 29 13 29 6 24M6 24V28M6 24H10" fill="none" stroke="#6fd8d0" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="16" cy="16" r="4.5" fill="#6fd8d0"/>`),
  story: () =>
    svg(`<path d="M16 3L28 28H4Z" fill="#f2c14e" opacity=".85"/><path d="M16 15L10 28H22Z" fill="#12172b"/>`),
  mask: () =>
    svg(`<path d="M16 4C9 4 5 8 5 15C5 22 10 28 16 28C22 28 27 22 27 15C27 8 23 4 16 4Z" fill="#e8d3a8" stroke="#8c6b3f" stroke-width="1.6"/>
    <ellipse cx="11" cy="14" rx="3" ry="3.6" fill="#3b2a14"/><ellipse cx="21" cy="14" rx="3" ry="3.6" fill="#3b2a14"/>
    <path d="M11 22C14 24.5 18 24.5 21 22" fill="none" stroke="#3b2a14" stroke-width="2" stroke-linecap="round"/>`),
  reward: () =>
    svg(`<rect x="5" y="13" width="22" height="15" rx="2" fill="#7f5fd1"/>
    <rect x="3" y="9" width="26" height="6" rx="1.5" fill="#a184ec"/>
    <rect x="14" y="9" width="4" height="19" fill="#f2c14e"/>
    <path d="M16 9 C11 9 8 7 9.5 4.5 C11 2.5 14.5 4.5 16 9 C17.5 4.5 21 2.5 22.5 4.5 C24 7 21 9 16 9 Z" fill="#f2c14e"/>`),
};

export const kindIcon = (kind: Kind): string => KIND_ICONS[kind]();

const line = (d: string, extra = '') =>
  `<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;

export const ui = {
  moon: line('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" fill="currentColor"/>'),
  check: line('<path d="M5 12.5 10 17.5 19.5 7"/>'),
  lock: line('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  warn: line('<path d="M12 3 2 21h20Z"/><path d="M12 10v5M12 18v.1"/>'),
  flag: line('<path d="M5 22V4c5-3 9 3 14 0v10c-5 3-9-3-14 0"/>'),
  query: line('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.1"/>'),
  pin: line('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  map: line('<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>'),
  route: line('<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>'),
  chart: line('<path d="M12 3a9 9 0 1 0 9 9h-9Z"/><path d="M16 3.5A8 8 0 0 1 20.5 8H16Z" fill="currentColor"/>'),
  foot: line('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  download: line('<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>'),
  upload: line('<path d="M12 16V4M7 8l5-5 5 5M4 21h16"/>'),
};
