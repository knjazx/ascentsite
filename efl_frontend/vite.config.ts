import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function steamProfilePlugin(): Plugin {
  const profileCache = new Map<string, { data: any; expiresAt: number }>();

  return {
    name: 'steam-profile-api',
    configureServer(server) {
      server.middlewares.use('/api/steam-profile', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const steamId = url.searchParams.get('steamId');

          if (!steamId || !/^\d+$/.test(steamId)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Valid numeric steamId query parameter is required' }));
            return;
          }

          // Return from cache if fresh (10 min TTL)
          const cached = profileCache.get(steamId);
          if (cached && Date.now() < cached.expiresAt) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(cached.data));
            return;
          }

          // Fetch from Steam Community XML directly from Node.js
          const steamXmlUrl = `https://steamcommunity.com/profiles/${steamId}?xml=1`;
          let xml = '';

          try {
            const response = await fetch(steamXmlUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            });
            if (response.ok) {
              xml = await response.text();
            }
          } catch (fetchErr) {
            console.warn('[SteamProfile] Direct fetch failed:', fetchErr);
          }

          // If direct fetch was blocked (e.g. 429), try public proxy
          if (!xml) {
            try {
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(steamXmlUrl)}`;
              const proxyRes = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
              if (proxyRes.ok) {
                xml = await proxyRes.text();
              }
            } catch (proxyErr) {
              console.warn('[SteamProfile] Proxy fetch failed:', proxyErr);
            }
          }

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

          const result = {
            success: true,
            steamId,
            nickname: nickname || `Player_${steamId.slice(-4)}`,
            avatar:
              avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${steamId}&backgroundColor=111111`,
            country: country || 'ru',
            realName: realName || '',
          };

          profileCache.set(steamId, { data: result, expiresAt: Date.now() + 600000 });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), steamProfilePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
