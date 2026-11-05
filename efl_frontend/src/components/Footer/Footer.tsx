import React from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord, FaTelegramPlane, FaTwitch, FaTiktok } from 'react-icons/fa';
import { useData } from '@/context/DataContext';

const Footer: React.FC = () => {
  const { settings } = useData();

  const socialLinks = [
    { href: settings.discordUrl, label: 'Discord', modifier: 'discord', Icon: FaDiscord },
    { href: settings.telegramUrl, label: 'Telegram', modifier: 'telegram', Icon: FaTelegramPlane },
    { href: settings.twitchUrl, label: 'Twitch', modifier: 'twitch', Icon: FaTwitch },
    { href: settings.tiktokUrl, label: 'TikTok', modifier: 'tiktok', Icon: FaTiktok },
  ];

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo" style={{ textDecoration: 'none' }}>
            ASCENT
          </Link>
          <span className="site-footer__copyright">
            Competitive CS2 League. All rights reserved.
            <br />© 2026 {settings.leagueName || 'ASCENT CS2 League'}.
          </span>
        </div>

        <div className="social-links">
          {socialLinks
            .filter(({ href }) => Boolean(href))
            .map(({ href, label, modifier, Icon }) => (
              <a
                key={modifier}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`social-link social-link--${modifier}`}
              >
                <Icon />
              </a>
            ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
