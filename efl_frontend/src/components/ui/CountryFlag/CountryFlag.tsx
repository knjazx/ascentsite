import React from 'react';
import './CountryFlag.css';

export const PLAYER_COUNTRIES: Record<string, string> = {
  donk: 'ru',
  sh1ro: 'ru',
  magixx: 'ru',
  tn1r: 'ru',
  zont1x: 'ua',
  m0nesy: 'ru',
  kyousuke: 'ru',
  zywoo: 'fr',
  apex: 'fr',
  ropz: 'ee',
  flamez: 'il',
  mezii: 'gb',
  w0nderful: 'ua',
  b1t: 'ua',
  aleksib: 'fi',
  im: 'ro',
  makazze: 'ua',
  karrigan: 'dk',
  niko: 'ba',
  teses: 'dk',
  frozen: 'sk',
  matys: 'sk',
  xertion: 'il',
  torzsi: 'hu',
  spinx: 'il',
  jl: 'lt',
  xelex: 'ru',
  molodoy: 'kz',
  fallen: 'br',
  yuurih: 'br',
  yekindar: 'lv',
  kscerato: 'br',
  latto: 'br',
  insani: 'br',
  art: 'br',
  dumau: 'br',
  n1ssim: 'br',
  saadzin: 'br',
  heavygod: 'il',
  hunter: 'ba',
  'hunter-': 'ba',
  nertz: 'il',
  sunpayus: 'es',
  wicadia: 'tr',
  maj3r: 'tr',
  xantares: 'tr',
  woxic: 'tr',
  soulfly: 'tr',
  magnojez: 'ru',
  jame: 'ru',
  hobbit: 'kz',
  boombl4: 'ru',
  zorte: 'ru',
  d1ledeez: 'ru',
  d1ledez: 'ru',
  fl4mus: 'ru',
  max: 'uy',
  dgt: 'uy',
  meyern: 'ar',
  luchov: 'ar',
  huasopeek: 'cl',
  dem0n: 'ua',
  launx: 'ro',
  krabeni: 'pl',
  cmtry: 'bg',
  dziugss: 'lt',
  xielo: 'ru',
  zweih: 'ru',
  slaxejezzz: 'ru',
  s1mple: 'ua',
  electronic: 'ru',
  b1ad3: 'ua',
  chopper: 'ru',
  device: 'dk',
  cadian: 'dk',
};

export function getPlayerCountry(nickname?: string): string {
  if (!nickname) return 'eu';
  const clean = nickname.toLowerCase().trim();
  return PLAYER_COUNTRIES[clean] || 'eu';
}

export interface CountryFlagProps {
  code?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code = 'eu',
  className = '',
  size = 'md',
}) => {
  const cleanCode = code ? code.toLowerCase().trim() : 'eu';
  const flagCode = cleanCode.length === 2 ? cleanCode : (PLAYER_COUNTRIES[cleanCode] || 'eu');
  const flagUrl = `https://flagcdn.com/w40/${flagCode}.png`;

  return (
    <span className={`country-flag-wrap country-flag--${size} ${className}`.trim()}>
      <img
        src={flagUrl}
        alt={flagCode.toUpperCase()}
        title={flagCode.toUpperCase()}
        className="country-flag-img"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    </span>
  );
};

export default CountryFlag;
