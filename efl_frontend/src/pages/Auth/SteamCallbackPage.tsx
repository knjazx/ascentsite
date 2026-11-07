import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import type { PlayerProfile } from '@/types';
import SteamIcon from '@/components/ui/SteamIcon/SteamIcon';
import { extractSteamIdFromClaimedId } from '@/utils/steamAuth';
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

      setStatusMessage('Верификация SteamID и загрузка данных игрока...');

      // Find if this SteamID matches any known pro/demo player
      const knownPlayer = players.find(
        (p): p is PlayerProfile => (p as PlayerProfile).steamId === steamId
      );

      // Perform login in DataContext
      setTimeout(() => {
        const user = loginWithSteam({
          steamId,
          nickname: knownPlayer?.nickname || `Player_${steamId.slice(-4)}`,
          realName: knownPlayer?.realName || '',
          avatar:
            knownPlayer?.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${steamId}&backgroundColor=111111`,
          country: knownPlayer?.country || 'ru',
          teamName: knownPlayer?.team || '',
          role: 'player',
        });

        showToast(`Успешный вход через Steam! Добро пожаловать, ${user.nickname}!`, 'success');
        navigate(redirectTarget, { replace: true });
      }, 700);
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
