// Item-Grafiken als Vektorzeichnungen: scharf auf jedem Display und offline verfügbar.
// Jede Form hat einen Füllton: m = Metall der Seltenheit, d = dunkel, t = Zierde.

export const esc = (value) => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const PALETTES = {
  common: { high: '#e3e9f1', low: '#7c8aa0', dark: '#3b4453', trim: '#9eabbd' },
  uncommon: { high: '#b6f7da', low: '#2fa877', dark: '#1d4a3b', trim: '#e3e9f1' },
  rare: { high: '#bfe6ff', low: '#2a8fe0', dark: '#173d66', trim: '#e8f6ff' },
  epic: { high: '#e3d3ff', low: '#8250e8', dark: '#352063', trim: '#ff9df2' },
  legendary: { high: '#fff3c4', low: '#e8a21f', dark: '#6b2a12', trim: '#ff5c4d' },
};

const SWORD = 'rotate(45 32 32)';

const SHAPES = {
  Klinge: { transform: SWORD, parts: [
    ['m', 'M29 2 L32 -3 L35 2 L36 40 H28 Z'], ['d', 'M32 -3 L35 2 L36 40 H32 Z'],
    ['t', 'M19 40 H45 L42 46 H22 Z'], ['d', 'M29 46 H35 V60 H29 Z'], ['t', 'M32 58 L37 63 L32 68 L27 63 Z'],
  ] },
  Dolch: { transform: SWORD, parts: [
    ['m', 'M32 4 C39 14 38 28 36 38 H28 C26 28 25 14 32 4 Z'], ['d', 'M32 4 C39 14 38 28 36 38 H32 Z'],
    ['t', 'M21 38 H43 V43 H21 Z'], ['d', 'M28.5 43 H35.5 V56 H28.5 Z'], ['t', 'M32 54 L37 59 L32 64 L27 59 Z'],
  ] },
  Axt: { transform: 'rotate(20 32 32)', parts: [
    ['d', 'M29.5 2 H34.5 V62 H29.5 Z'],
    ['m', 'M34 8 C46 6 56 12 60 24 C56 34 46 38 34 34 Z'], ['d', 'M34 24 L60 24 C56 34 46 38 34 34 Z'],
    ['m', 'M30 8 C20 8 12 14 8 22 C12 30 20 34 30 32 Z'], ['t', 'M27 14 H37 V30 H27 Z'],
  ] },
  Speer: { transform: SWORD, parts: [
    ['d', 'M30 18 H34 V66 H30 Z'], ['m', 'M32 -6 C40 6 39 16 35 24 H29 C25 16 24 6 32 -6 Z'],
    ['d', 'M32 -6 C40 6 39 16 35 24 H32 Z'], ['t', 'M27 24 H37 V29 H27 Z'], ['t', 'M28 42 H36 V46 H28 Z'],
  ] },
  Helm: { parts: [
    ['m', 'M12 34 C12 16 21 7 32 7 C43 7 52 16 52 34 V50 L42 56 V40 H22 V56 L12 50 Z'],
    ['d', 'M32 7 C43 7 52 16 52 34 V50 L42 56 V40 H32 Z'],
    ['t', 'M29 3 H35 V40 H29 Z'], ['d', 'M22 34 H42 V40 H22 Z'],
  ] },
  Kapuze: { parts: [
    ['d', 'M32 4 C16 8 9 26 10 56 H54 C55 26 48 8 32 4 Z'],
    ['m', 'M32 4 C21 12 14 28 15 56 H22 C20 34 25 20 32 14 C39 20 44 34 42 56 H49 C50 28 43 12 32 4 Z'],
    ['t', 'M23 34 L29 37 L23 39 Z M41 34 L35 37 L41 39 Z'],
  ] },
  Maske: { parts: [
    ['m', 'M12 12 C24 6 40 6 52 12 C54 30 48 48 32 58 C16 48 10 30 12 12 Z'],
    ['d', 'M32 8 C40 8 47 9 52 12 C54 30 48 48 32 58 Z'],
    ['t', 'M18 25 L29 29 L19 33 Z M46 25 L35 29 L45 33 Z'], ['t', 'M30 38 H34 V50 H30 Z'],
  ] },
  Brustpanzer: { parts: [
    ['m', 'M14 10 L24 6 C27 12 37 12 40 6 L50 10 L56 22 L48 28 L47 56 C38 60 26 60 17 56 L16 28 L8 22 Z'],
    ['d', 'M32 10 C35 10 38 9 40 6 L50 10 L56 22 L48 28 L47 56 C42 58 37 59 32 59 Z'],
    ['t', 'M22 22 C28 26 36 26 42 22 L40 30 C35 33 29 33 24 30 Z'], ['t', 'M30 34 H34 V56 H30 Z'],
  ] },
  Mantel: { parts: [
    ['d', 'M20 6 H44 L56 58 C46 54 40 60 32 56 C24 60 18 54 8 58 Z'],
    ['m', 'M20 6 H28 L22 58 C18 56 13 56 8 58 Z'], ['m', 'M44 6 H36 L42 58 C46 56 51 56 56 58 Z'],
    ['t', 'M18 4 H46 V11 H18 Z'], ['t', 'M29 11 H35 V18 H29 Z'],
  ] },
  Harnisch: { parts: [
    ['m', 'M8 18 C12 8 20 6 26 8 L32 14 L38 8 C44 6 52 8 56 18 L46 26 L46 54 L32 60 L18 54 L18 26 Z'],
    ['d', 'M32 14 L38 8 C44 6 52 8 56 18 L46 26 L46 54 L32 60 Z'],
    ['t', 'M18 32 H46 V36 H18 Z M18 42 H46 V46 H18 Z'], ['t', 'M32 18 L38 25 L32 31 L26 25 Z'],
  ] },
  Handschuhe: { parts: [
    ['m', 'M18 30 V16 C18 12 24 12 24 16 V10 C24 6 30 6 30 10 V9 C30 5 36 5 36 9 V12 C36 8 42 8 42 12 V30 L48 24 C52 21 56 25 53 29 L42 46 V54 H20 V46 Z'],
    ['d', 'M36 9 V12 C36 8 42 8 42 12 V30 L48 24 C52 21 56 25 53 29 L42 46 V54 H32 V9 Z'],
    ['t', 'M18 46 H44 V58 H18 Z'], ['d', 'M22 50 H40 V53 H22 Z'],
  ] },
  Armschienen: { parts: [
    ['m', 'M18 6 H46 L50 58 H14 Z'], ['d', 'M32 6 H46 L50 58 H32 Z'],
    ['t', 'M16 16 H48 V21 H16 Z M15 42 H49 V47 H15 Z'], ['t', 'M32 25 L38 32 L32 39 L26 32 Z'],
  ] },
  Faustwickel: { parts: [
    ['m', 'M14 22 C14 14 22 12 26 14 C28 8 38 8 40 14 C46 12 52 16 50 24 L48 48 C40 54 24 54 16 48 Z'],
    ['d', 'M32 10 C36 10 39 12 40 14 C46 12 52 16 50 24 L48 48 C44 51 38 52 32 52 Z'],
    ['t', 'M14 26 L50 32 L49 37 L15 31 Z M15 38 L49 44 L47 49 L17 43 Z'],
  ] },
  Stiefel: { parts: [
    ['m', 'M18 6 H40 V34 L54 44 C58 48 57 54 54 54 H16 Z'], ['d', 'M30 6 H40 V34 L54 44 C58 48 57 54 54 54 H30 Z'],
    ['t', 'M16 12 H42 V18 H16 Z'], ['d', 'M14 54 H58 V60 H14 Z'], ['t', 'M20 28 H40 V32 H20 Z'],
  ] },
  Beinschienen: { parts: [
    ['m', 'M20 4 H44 L42 44 L46 56 H18 L22 44 Z'], ['d', 'M32 4 H44 L42 44 L46 56 H32 Z'],
    ['t', 'M32 24 L40 32 L32 40 L24 32 Z'], ['t', 'M19 8 H45 V13 H19 Z'], ['d', 'M16 56 H48 V61 H16 Z'],
  ] },
  Sandalen: { parts: [
    ['d', 'M10 48 H56 C60 48 60 56 56 56 H10 C6 56 6 48 10 48 Z'],
    ['m', 'M14 48 C18 34 22 26 28 22 L34 28 C32 34 34 40 42 48 Z'], ['t', 'M20 30 L38 44 L35 47 L17 34 Z'],
    ['t', 'M26 14 H32 V24 H26 Z'],
  ] },
};

const SPARKLE = 'M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z';

export function installArtDefs() {
  const gradients = Object.entries(PALETTES).map(([id, palette]) => `
    <linearGradient id="art-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.high}"></stop>
      <stop offset="1" stop-color="${palette.low}"></stop>
    </linearGradient>`).join('');
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${gradients}</defs></svg>`,
  );
}

export function itemArt(item) {
  const palette = PALETTES[item.rarity];
  const shape = SHAPES[item.name] ?? SHAPES.Klinge;
  const fills = { m: `url(#art-${item.rarity})`, d: palette.dark, t: palette.trim };
  const parts = shape.parts.map(([fill, path]) => `<path fill="${fills[fill]}" d="${path}"></path>`).join('');
  const sparkles = ['epic', 'legendary'].includes(item.rarity)
    ? `<path class="spark" fill="${palette.high}" transform="translate(10 12)" d="${SPARKLE}"></path>
       <path class="spark two" fill="${palette.high}" transform="translate(55 48)" d="${SPARKLE}"></path>`
    : '';
  return `
    <span class="art ${item.rarity}" aria-hidden="true">
      <svg viewBox="-4 -4 72 72"><g${shape.transform ? ` transform="${shape.transform}"` : ''}>${parts}</g>${sparkles}</svg>
    </span>`;
}

export function chestArt() {
  return `
    <svg class="chest" viewBox="0 0 96 76" aria-hidden="true">
      <path fill="#1c2a44" d="M8 34 H88 V70 C88 73 86 74 84 74 H12 C10 74 8 73 8 70 Z"></path>
      <path fill="#2c4066" d="M8 34 V24 C8 10 18 4 30 4 H66 C78 4 88 10 88 24 V34 Z"></path>
      <path fill="var(--accent)" d="M8 32 H88 V38 H8 Z M22 4 H30 V74 H22 Z M66 4 H74 V74 H66 Z"></path>
      <path fill="var(--text)" d="M40 28 H56 V48 C56 52 40 52 40 48 Z"></path>
      <circle fill="#05101e" cx="48" cy="38" r="3.5"></circle>
      <path fill="#05101e" d="M46.5 40 H49.5 V46 H46.5 Z"></path>
    </svg>`;
}
