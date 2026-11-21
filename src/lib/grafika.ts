/* Własne ilustracje rysowane w SVG: portrety (styl zdjęcia do dokumentu), pojazdy z boku i wzór giloszowy kart. */

type Portret = { skin: string; shade: string; hair: string; styl: 'long' | 'short' | 'bob' | 'messy' | 'ponytail' | 'curly' | 'kid'; shirt: string; collar: string; zarost?: boolean; okulary?: boolean; dziecko?: boolean };

const P: Record<string, Portret> = {
  alicja: { skin: '#F1C9AA', shade: '#DEAB8C', hair: '#8A5A36', styl: 'ponytail', shirt: '#3D5A6C', collar: '#324B5A' },
  rafal: { skin: '#E3B08C', shade: '#CB936F', hair: '#3A302A', styl: 'short', shirt: '#4A4F57', collar: '#3C4047', zarost: true },
  bozena: { skin: '#F0CBB2', shade: '#DCAD93', hair: '#A0522D', styl: 'bob', shirt: '#7A4E5E', collar: '#683F4F', okulary: true },
  wiktor: { skin: '#EDC3A2', shade: '#D8A584', hair: '#1F1B19', styl: 'messy', shirt: '#2D5B4A', collar: '#244A3C' },
  pawel: { skin: '#E8BB98', shade: '#D19D7A', hair: '#6A4E3A', styl: 'short', shirt: '#2F3D57', collar: '#273349' },
  lena: { skin: '#F2CEB3', shade: '#E0B194', hair: '#9A6B42', styl: 'long', shirt: '#B65A7A', collar: '#9E4C68', dziecko: true },
  franek: { skin: '#F3D1B7', shade: '#E2B598', hair: '#B98A55', styl: 'kid', shirt: '#3F7A68', collar: '#356857', dziecko: true },
  ida: { skin: '#F6D8C2', shade: '#E7BDA1', hair: '#D9BC8F', styl: 'kid', shirt: '#E7A6B8', collar: '#D493A6', dziecko: true },
  kasia: { skin: '#EFC5A6', shade: '#DBA787', hair: '#2E211B', styl: 'curly', shirt: '#5C6F4E', collar: '#4E5F42' },
  szymon: { skin: '#E6B793', shade: '#CF9A77', hair: '#4B3628', styl: 'messy', shirt: '#2F3E57', collar: '#273349', dziecko: true },
  nela: { skin: '#F1CBAE', shade: '#DEAD8F', hair: '#3E2A20', styl: 'ponytail', shirt: '#D08A3C', collar: '#B87632', dziecko: true },
  zbigniew: { skin: '#EBC2A5', shade: '#D6A588', hair: '#CFCBC6', styl: 'short', shirt: '#5D6A73', collar: '#4E5961', okulary: true },
  agata: { skin: '#F0C9AE', shade: '#DDAA8D', hair: '#6E3F2A', styl: 'long', shirt: '#2E3646', collar: '#3B4558' },
};

const BACK: Record<string, string> = {
  long: 'M33 66C30 36 45 25 60 25c16 0 31 11 28 41l3 40c-10 7-21-3-19-12H48c2 9-9 19-19 12z',
  bob: 'M33 70c-2-32 12-42 27-42 17 0 30 11 27 42-1 10-5 16-9 18V70H42v18c-5-2-8-8-9-18z',
  ponytail: 'M86 52c10 6 14 20 10 34-2 8-8 12-12 10 4-12 3-24 2-44z',
  curly: 'M30 70c-6-14-2-30 8-38 10-10 34-12 46-2 12 8 14 26 8 40-2 8-6 14-10 16V68H42v18c-6-2-10-8-12-16z',
};
const FRONT: Record<string, string> = {
  long: 'M37 61c-1-23 11-31 23-31 14 0 25 9 23 30-6-12-17-18-31-16-6 2-11 8-15 17z',
  short: 'M38 60c-2-22 10-31 23-31 14 0 24 9 21 31-2-10-8-15-18-16-10-1-20 2-26 16z',
  bob: 'M37 58c1-20 13-26 25-26s22 9 21 26c-13-6-25-8-37-8-4 2-7 5-9 8z',
  messy: 'M37 58c-3-18 7-29 21-30 6-2 12 0 16 3 6 2 11 10 9 27-3-6-7-9-11-8-2-5-8-6-12-3-4-4-12-2-14 3-4 0-7 3-9 8z',
  ponytail: 'M37 60c-1-22 11-30 23-30 14 0 24 8 23 28-8-8-18-12-30-12-7 2-12 6-16 14z',
  curly: 'M36 60c-4-10 0-24 10-28 6-6 18-6 26-2 10 4 15 16 12 30-4-8-8-10-12-8-4-6-10-6-14-2-4-4-10-2-12 2-4 0-8 4-10 8z',
  kid: 'M38 58c0-18 10-27 22-27 13 0 23 8 22 26-6-8-13-11-22-11-9 0-16 4-22 12z',
};

export function portretSvg(id: string): string {
  const p = P[id] ?? P.alicja;
  const k = p.dziecko;
  const head = k ? '<ellipse cx="60" cy="66" rx="23" ry="25" fill="SKIN"/>' : '<ellipse cx="60" cy="64" rx="22" ry="27" fill="SKIN"/>';
  return `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF0F3"/><stop offset="1" stop-color="#D9DDE3"/></linearGradient></defs>
  <rect width="120" height="150" fill="url(#t)"/>
  ${BACK[p.styl] ? `<path d="${BACK[p.styl]}" fill="${p.hair}"/>` : ''}
  <path d="${k ? 'M18 150c4-22 20-34 42-36 22 2 38 14 42 36z' : 'M8 150c4-26 24-40 52-42 28 2 48 16 52 42z'}" fill="${p.shirt}"/>
  <path d="M47 108l13 14 13-14-4-3H51z" fill="${p.collar}"/>
  <path d="M50 88h20v18c-6 6-14 6-20 0z" fill="${p.shade}"/>
  <ellipse cx="38.5" cy="68" rx="4" ry="6" fill="${p.shade}"/><ellipse cx="81.5" cy="68" rx="4" ry="6" fill="${p.shade}"/>
  ${head.replace('SKIN', p.skin)}
  ${p.zarost ? `<path d="M40 72c2 14 10 19 20 19s18-5 20-19c-4 7-11 10-20 10s-16-3-20-10z" fill="${p.hair}" opacity=".28"/>` : ''}
  <path d="${FRONT[p.styl]}" fill="${p.hair}"/>
  <path d="M46 57.5q5-2.6 9 0M65 57.5q5-2.6 9 0" stroke="${p.hair}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="50.5" cy="65" rx="${k ? 2.6 : 2.3}" ry="${k ? 2.9 : 2.6}" fill="#2B2624"/><ellipse cx="69.5" cy="65" rx="${k ? 2.6 : 2.3}" ry="${k ? 2.9 : 2.6}" fill="#2B2624"/>
  <path d="M60 67v7.5q-2 1.6-4 .4" stroke="${p.shade}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M52.5 80q7.5 ${k ? 5 : 3.8} 15 0" stroke="#A8655A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  ${p.okulary ? `<g fill="none" stroke="#3C3A3A" stroke-width="1.8"><rect x="42.5" y="59" width="15" height="12" rx="4"/><rect x="62.5" y="59" width="15" height="12" rx="4"/><path d="M57.5 64h5M42.5 64l-4-1.5M77.5 64l4-1.5"/></g>` : ''}
  </svg>`;
}

/* ---------- pojazdy z boku: typ nadwozia z modelu, kolor z CEPiK ---------- */
const KOLOR: Record<string, string> = { srebrny: '#BFC4CB', granatowy: '#243150', 'biały': '#F1F2F4', bialy: '#F1F2F4', czerwony: '#C0282F', czarny: '#24262B', szary: '#7A7F87', niebieski: '#2D5B9A', zielony: '#3E6B4A' };
type Typ = { w: [number, number]; body: string; glass: string[]; door: number };
const T: Record<string, Typ> = {
  hatch: { w: [60, 180], body: 'M24 76 23 60c0-8 5-14 15-16l14-6c12-7 28-10 48-10h34c14 0 24 4 36 14l10 8 24 4c10 2 16 8 16 16v6c0 4-3 6-7 6h-17a16 16 0 0 0-32 0H76a16 16 0 0 0-32 0H30c-4 0-6-2-6-6z', glass: ['M50 47l10-8c10-5 22-6 38-6h4v14z', 'M108 33h24c12 0 20 4 30 12l5 4h-59z'], door: 104 },
  sedan: { w: [60, 180], body: 'M22 76V62c0-6 4-10 12-11l28-2c10-11 24-18 42-19h30c14 0 24 5 36 14l10 6 24 4c10 2 16 8 16 16v6c0 4-3 6-7 6h-17a16 16 0 0 0-32 0H76a16 16 0 0 0-32 0H28c-4 0-6-2-6-6z', glass: ['M70 48c8-9 18-14 32-14h2v14z', 'M110 34h22c12 0 20 4 30 12l4 3h-56z'], door: 106 },
  kombi: { w: [60, 182], body: 'M20 76V52c0-8 4-14 12-16l14-4c10-3 24-4 46-4h44c14 0 24 5 36 15l10 7 24 4c10 2 16 8 16 16v6c0 4-3 6-7 6h-17a16 16 0 0 0-32 0H76a16 16 0 0 0-32 0H26c-4 0-6-2-6-6z', glass: ['M30 48l4-10c6-4 14-6 26-6h16v16z', 'M82 32h24v16H82z', 'M112 32h22c12 0 20 4 30 13l3 3h-55z'], door: 109 },
  van: { w: [60, 184], body: 'M18 78V26c0-6 4-10 10-10h122c10 0 16 4 22 12l18 20 18 5c8 2 14 8 14 15v10c0 3-2 5-5 5h-17a16 16 0 0 0-32 0H76a16 16 0 0 0-32 0H22c-3 0-4-2-4-5z', glass: ['M26 24h34v20H26z', 'M66 24h46v20H66z', 'M118 24h32c6 0 10 2 14 7l14 15h-60z'], door: 115 },
  city: { w: [64, 170], body: 'M34 76 33 52c0-12 5-20 17-22l70-2c14 0 22 5 32 16l8 8 30 5c8 2 14 7 14 14v5c0 4-3 6-7 6h-11a16 16 0 0 0-32 0H80a16 16 0 0 0-32 0h-8c-4 0-6-2-6-6z', glass: ['M42 47l1-8c1-4 5-5 11-5l34-1v14z', 'M94 33l24-1c10 0 18 4 26 13l2 2H94z'], door: 91 },
};
export const typAuta = (m: string) => { const n = (m || '').toLowerCase(); return /transporter|transit|van|bus|sprinter|vito/.test(n) ? 'van' : /panda|yaris|aygo|\bup\b|500/.test(n) ? 'city' : /combi|kombi|touring|variant|avant|estate/.test(n) ? 'kombi' : /golf|corolla|polo|astra|focus|hatch/.test(n) ? 'hatch' : 'sedan'; };
let uid = 0;
export function autoSvg(model: string, kolor?: string, cien = true): string {
  const t = T[typAuta(model)], c = KOLOR[(kolor || '').toLowerCase()] || KOLOR.srebrny, id = 'a' + (++uid), van = t === T.van;
  const wheel = (x: number) => `<g transform="translate(${x} ${van ? 83 : 82})"><circle r="13" fill="#1B1C1F"/><circle r="8" fill="#9EA3AB"/><circle r="8" fill="none" stroke="#6B7078" stroke-width="1.2" stroke-dasharray="2.2 2.4"/><circle r="2.6" fill="#55595F"/></g>`;
  const front = Math.max(...t.w) + 40;
  return `<svg viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>
  ${cien ? '<ellipse cx="121" cy="95" rx="104" ry="4.5" fill="#000" opacity=".16"/>' : ''}
  <path d="${t.body}" fill="${c}"/><path d="${t.body}" fill="url(#${id})"/>
  ${t.glass.map(g => `<path d="${g}" fill="#2A323D" opacity=".88"/>`).join('')}
  <path d="M${t.door} ${van ? 26 : 34}v44" stroke="#000" stroke-opacity=".22" stroke-width="1.2"/>
  <rect x="${t.door + 8}" y="56" width="10" height="2.6" rx="1.3" fill="#000" opacity=".25"/>
  <rect x="${front - 14}" y="${van ? 56 : 58}" width="12" height="6" rx="3" fill="#FFF6D8"/>
  <rect x="${van ? 18 : t === T.city ? 33 : 21}" y="${van ? 44 : 56}" width="5" height="9" rx="2" fill="#B3161E"/>
  ${wheel(t.w[0])}${wheel(t.w[1])}
  </svg>`;
}

/* ---------- wzór giloszowy: fale i okręgi rysowane z kodu ---------- */
export function giloszSvg(seed: number, kolor: string, krycie = 0.22): string {
  let p = '';
  for (let r = 0; r < 16; r++) {
    let d = ''; const a = 5 + r * 0.5, f = 0.032 + seed * 0.004, ph = r * 0.5 + seed;
    for (let x = -10; x <= 330; x += 6) { const y = 14 + r * 11 + a * Math.sin(x * f + ph) + 2.5 * Math.sin(x * 0.11 + r); d += (x < 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1); }
    p += `<path d="${d}"/>`;
  }
  for (let r = 0; r < 10; r++) p += `<circle cx="${250 + seed * 6}" cy="36" r="${18 + r * 12}"/>`;
  return `<svg viewBox="0 0 320 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${kolor}" stroke-width=".55" opacity="${krycie}">${p}</g></svg>`;
}
