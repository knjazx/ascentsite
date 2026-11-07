import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import type { PlayerProfile } from '@/types';
import SteamIcon from '@/components/ui/SteamIcon/SteamIcon';
import { extractSteamIdFromClaimedId, fetchSteamProfile } from '@/utils/steamAuth';
import './SteamCallbackPage.css';

export const SteamCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithSteam, players } = useData();
  const { showToast } = useToast();
  const processedRef = useRef(false);

  const [statusMessage, setStatusMessage] = useState('Авторизация через Steam OpenID...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const mode = searchParams.get('openid.mode');
    const claimedId =
      searchParams.get('openid.claimed_id') || searchParams.get('openid.identity') || '';
    const redirectTarget = searchParams.get('redirect') || '/profile';

    // If user cancelled on Steam
    if (mode === 'cancel') {
      showToast('Авторизация в Steam была отменена.', 'info');
      navigate('/login', { replace: true });
      return;
    }

    // Official OpenID success response
    if (mode === 'id_res' && claimedId) {
      const steamId = extractSteamIdFromClaimedId(claimedId);

      if (!steamId) {
        setErrorDetails('Не удалось извлечь 64-битный идентификатор SteamID из ответа Steam.');
        return;
      }

      setStatusMessage('Загрузка данных профиля со Steam (ник, аватарка, страна)...');

      (async () => {
        try {
          const profile = await fetchSteamProfile(steamId);

          // Find if this SteamID matches any known pro/demo player
          const knownPlayer = players.find(
            (p): p is PlayerProfile => (p as PlayerProfile).steamId === steamId
          );

          const finalNickname =
            profile.nickname && !profile.nickname.startsWith('Player_')
              ? profile.nickname
              : knownPlayer?.nickname || profile.nickname || `Player_${steamId.slice(-4)}`;

          const finalAvatar =
            profile.avatar && !profile.avatar.includes('dicebear')
              ? profile.avatar
              : knownPlayer?.avatar || profile.avatar;

          const finalCountry = profile.country || knownPlayer?.country || 'ru';
          const finalRealName = profile.realName || knownPlayer?.realName || '';

          const user = loginWithSteam({
            steamId,
            nickname: finalNickname,
            realName: finalRealName,
            avatar: finalAvatar,
            country: finalCountry,
            teamName: knownPlayer?.team || '',
            role: 'player',
          });

          showToast(`Успешный вход через Steam! Добро пожаловать, ${user.nickname}!`, 'success');
          navigate(redirectTarget, { replace: true });
        } catch (err) {
          console.error('[SteamCallbackPage] Error fetching steam profile:', err);
          const user = loginWithSteam({
            steamId,
            nickname: `Player_${steamId.slice(-4)}`,
            country: 'ru',
          });
          showToast(`Успешный вход через Steam! Добро пожаловать, ${user.nickname}!`, 'success');
          navigate(redirectTarget, { replace: true });
        }
      })();
      return;
    }

    // If visited directly without OpenID query params
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate, loginWithSteam, players, showToast]);

  return (
    <div className="steam-callback-page">
      <div className="panel steam-callback-card">
        <div className="steam-callback-icon-wrap">
          <SteamIcon size={38} className="steam-callback-icon" />
          <div className="steam-callback-spinner" />
        </div>

        <h2 className="steam-callback-title">Авторизация Steam Community</h2>
        <p className="steam-callback-sub">{statusMessage}</p>

        {errorDetails && (
          <div className="steam-callback-error">
            <p>{errorDetails}</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/login', { replace: true })}
            >
              Вернуться на страницу входа
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SteamCallbackPage;
