/**
 * Official Steam OpenID 2.0 URL Builder and Helper Functions
 */

export function getSteamLoginUrl(redirectAfterLogin?: string): string {
  const origin = window.location.origin;
  const callbackUrl = new URL('/auth/steam/callback', origin);
  if (redirectAfterLogin) {
    callbackUrl.searchParams.set('redirect', redirectAfterLogin);
  }
  const returnTo = callbackUrl.toString();
  const realm = `${origin}/`;

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': realm,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}

export interface SteamProfileData {
  steamId: string;
  nickname: string;
  avatar: string;
  country: string;
  realName: string;
}

export function parseSteamXml(xml: string, steamId: string): SteamProfileData {
  const getTag = (tag: string) => {
    const cdataRegex = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
    const textRegex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(cdataRegex) || xml.match(textRegex);
    return match ? match[1].trim() : '';
  };

  const nickname = getTag('steamID');
  const avatar = getTag('avatarFull') || getTag('avatarMedium') || getTag('avatarIcon');
  const locCountryCode = getTag('locCountryCode').toLowerCase();
  const location = getTag('location');
  const realName = getTag('realname');

  let country = locCountryCode;
  if (!country && location) {
    const locLower = location.toLowerCase();
    const map: { keys: string[]; code: string }[] = [
      { keys: ['russia', 'россия', 'moscow', 'saint petersburg', 'russian federation'], code: 'ru' },
      { keys: ['ukraine', 'украина', 'kyiv', 'kiev', 'odessa', 'kharkiv'], code: 'ua' },
      { keys: ['kazakhstan', 'казахстан', 'almaty', 'astana'], code: 'kz' },
      { keys: ['belarus', 'беларусь', 'белоруссия', 'minsk'], code: 'by' },
      { keys: ['armenia', 'армения', 'yerevan'], code: 'am' },
      { keys: ['georgia', 'грузия', 'tbilisi'], code: 'ge' },
      { keys: ['germany', 'deutschland', 'berlin'], code: 'de' },
      { keys: ['france', 'paris'], code: 'fr' },
      { keys: ['united states', 'usa', 'us'], code: 'us' },
      { keys: ['united kingdom', 'uk', 'great britain', 'england', 'london'], code: 'gb' },
      { keys: ['poland', 'polska', 'warsaw'], code: 'pl' },
      { keys: ['sweden', 'stockholm'], code: 'se' },
      { keys: ['denmark', 'copenhagen'], code: 'dk' },
      { keys: ['finland', 'helsinki'], code: 'fi' },
      { keys: ['serbia', 'belgrade'], code: 'rs' },
      { keys: ['japan', 'tokyo'], code: 'jp' },
      { keys: ['turkey', 'türkiye', 'istanbul'], code: 'tr' },
    ];
    for (const item of map) {
      if (item.keys.some((k) => locLower.includes(k))) {
        country = item.code;
        break;
      }
    }
  }

  return {
    steamId,
    nickname: nickname || `Player_${steamId.slice(-4)}`,
    avatar:
      avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${steamId}&backgroundColor=111111`,
    country: country || 'ru',
    realName: realName || '',
  };
}

export async function fetchSteamProfile(steamId: string): Promise<SteamProfileData> {
  // 1. Try local dev/backend API endpoint first
  try {
    const res = await fetch(`/api/steam-profile?steamId=${encodeURIComponent(steamId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.nickname) {
        return {
          steamId,
          nickname: data.nickname,
          avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${steamId}&backgroundColor=111111`,
          country: data.country || 'ru',
          realName: data.realName || '',
        };
      }
    }
  } catch (err) {
    console.warn('[SteamProfile] Local endpoint unavailable, trying public proxy...', err);
  }

  // 2. Fallback to public CORS proxy
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://steamcommunity.com/profiles/${steamId}?xml=1`)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const xml = await res.text();
      return parseSteamXml(xml, steamId);
    }
  } catch (proxyErr) {
    console.warn('[SteamProfile] Public proxy unavailable:', proxyErr);
  }

  // 3. Fallback default
  return {
    steamId,
    nickname: `Player_${steamId.slice(-4)}`,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${steamId}&backgroundColor=111111`,
    country: 'ru',
    realName: '',
  };
}

export function extractSteamIdFromClaimedId(claimedId: string): string | null {
  const match = claimedId.match(/\/id\/(\d+)/);
  return match ? match[1] : null;
}

export function redirectToSteam(redirectAfterLogin?: string): void {
  window.location.href = getSteamLoginUrl(redirectAfterLogin);
}
