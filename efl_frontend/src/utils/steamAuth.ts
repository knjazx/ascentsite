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

export function extractSteamIdFromClaimedId(claimedId: string): string | null {
  const match = claimedId.match(/\/id\/(\d+)/);
  return match ? match[1] : null;
}

export function redirectToSteam(redirectAfterLogin?: string): void {
  window.location.href = getSteamLoginUrl(redirectAfterLogin);
}
