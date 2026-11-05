import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowUpRight,
  ShoppingBag,
  ShieldCheck,
  ArrowDownLeft,
  History,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import CoinIcon from '@/components/ui/CoinIcon/CoinIcon';
import './WalletModal.css';

type HistoryFilter = 'all' | 'income' | 'expense';

const WalletModal: React.FC = () => {
  const { isWalletOpen, closeWallet, marketBalance, marketHistory, currentUser } = useData();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWalletOpen) {
        closeWallet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWalletOpen, closeWallet]);

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'income') {
      return marketHistory.filter((tx) => tx.amount > 0);
    }
    if (activeFilter === 'expense') {
      return marketHistory.filter((tx) => tx.amount < 0);
    }
    return marketHistory;
  }, [marketHistory, activeFilter]);

  const totalIncome = useMemo(() => {
    return marketHistory
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [marketHistory]);

  const totalExpense = useMemo(() => {
    return marketHistory
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [marketHistory]);

  if (!isWalletOpen) return null;

  const handleGoToMarket = () => {
    closeWallet();
    navigate('/market');
  };

  return (
    <div
      className="wallet-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWallet();
      }}
    >
      <div className="wallet-modal panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wallet-modal__header">
          <div className="wallet-modal__header-left">
            <div className="wallet-header-icon-wrap">
              <CoinIcon size={22} />
            </div>
            <div>
              <div className="wallet-header-title-row">
                <h2>Кошелёк игрока</h2>
                <span className="wallet-live-sync-pill">
                  <span className="wallet-sync-dot" />
                  <span>Синхронизировано</span>
                </span>
              </div>
              <span className="wallet-header-subtitle">
                Внутренний баланс и расчеты лиги ASCENT CS2
              </span>
            </div>
          </div>

          <div className="wallet-modal__header-right">
            <div className="wallet-player-pill">
              <span className="wallet-player-avatar">
                {(currentUser?.nickname || 'P').charAt(0).toUpperCase()}
              </span>
              <span className="wallet-player-name">{currentUser?.nickname || 'Player'}</span>
            </div>

            <button
              type="button"
              className="wallet-modal__close-btn"
              onClick={closeWallet}
              title="Закрыть (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="wallet-modal__content">
          {/* Black VIP Esports Asset Card */}
          <div className="wallet-asset-card">
            <div className="wallet-asset-card__shine" aria-hidden="true" />
            <div className="wallet-asset-card__pattern" aria-hidden="true" />

            {/* Top row of card */}
            <div className="wallet-asset-card__top">
              <div className="wallet-asset-card__brand">
                <span className="wallet-chip-icon">
                  <Zap size={14} />
                </span>
                <span className="wallet-brand-text">ASCENT DIGITAL ASSET</span>
              </div>
              <div className="wallet-asset-card__currency-pill">
                <CoinIcon size={18} />
                <span>ASCENT COIN (AC)</span>
              </div>
            </div>

            {/* Middle Balance */}
            <div className="wallet-asset-card__mid">
              <span className="wallet-asset-label">Доступный баланс</span>
              <div className="wallet-asset-value-row">
                <span className="wallet-asset-value">{(marketBalance ?? 0).toLocaleString('ru-RU')}</span>
                <span className="wallet-asset-curr">AC</span>
              </div>
              <span className="wallet-asset-subtext">
                Используйте баланс для приобретения наград и предметов в Market
              </span>
            </div>

            {/* Bottom row of card */}
            <div className="wallet-asset-card__bottom">
              <div className="wallet-asset-card__owner">
                <span className="owner-title">Держатель счёта</span>
                <span className="owner-name">{currentUser?.nickname || 'ASCENT Player'}</span>
                <span className="owner-status">
                  <CheckCircle2 size={12} style={{ color: '#4ade80' }} />
                  <span>Верифицированный профиль</span>
                </span>
              </div>

              <button
                type="button"
                className="wallet-market-btn"
                onClick={handleGoToMarket}
              >
                <ShoppingBag size={16} />
                <span>Каталог наград Market</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="wallet-stats-strip">
            <div className="wallet-stat-box">
              <div className="wallet-stat-box__icon wallet-stat-box__icon--green">
                <TrendingUp size={16} />
              </div>
              <div className="wallet-stat-box__body">
                <span className="wallet-stat-label">Всего начислено</span>
                <span className="wallet-stat-val wallet-stat-val--green">
                  +{totalIncome.toLocaleString()} AC
                </span>
              </div>
            </div>

            <div className="wallet-stat-box">
              <div className="wallet-stat-box__icon wallet-stat-box__icon--gray">
                <TrendingDown size={16} />
              </div>
              <div className="wallet-stat-box__body">
                <span className="wallet-stat-label">Всего списано</span>
                <span className="wallet-stat-val">
                  -{totalExpense.toLocaleString()} AC
                </span>
              </div>
            </div>

            <div className="wallet-stat-box">
              <div className="wallet-stat-box__icon wallet-stat-box__icon--blue">
                <ShieldCheck size={16} />
              </div>
              <div className="wallet-stat-box__body">
                <span className="wallet-stat-label">Статус кошелька</span>
                <span className="wallet-stat-val wallet-stat-val--status">
                  Активен • Безопасен
                </span>
              </div>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="wallet-ledger-section">
            <div className="wallet-ledger-header">
              <div className="wallet-ledger-header__left">
                <History size={16} />
                <h3>История операций</h3>
                <span className="wallet-ledger-count">{filteredHistory.length}</span>
              </div>

              <div className="wallet-filters">
                <button
                  type="button"
                  className={`wallet-filter-btn${activeFilter === 'all' ? ' active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  Все
                </button>
                <button
                  type="button"
                  className={`wallet-filter-btn${activeFilter === 'income' ? ' active' : ''}`}
                  onClick={() => setActiveFilter('income')}
                >
                  Поступления
                </button>
                <button
                  type="button"
                  className={`wallet-filter-btn${activeFilter === 'expense' ? ' active' : ''}`}
                  onClick={() => setActiveFilter('expense')}
                >
                  Списания
                </button>
              </div>
            </div>

            {/* List */}
            {filteredHistory.length > 0 ? (
              <div className="wallet-tx-list">
                {filteredHistory.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <div key={tx.id} className="wallet-tx-item">
                      <div className="wallet-tx-item__left">
                        <div
                          className={`wallet-tx-item__icon${
                            isPositive
                              ? ' wallet-tx-item__icon--income'
                              : ' wallet-tx-item__icon--expense'
                          }`}
                        >
                          {isPositive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div className="wallet-tx-item__meta">
                          <span className="wallet-tx-item__title">{tx.desc}</span>
                          <div className="wallet-tx-item__details">
                            <span className="wallet-tx-item__badge">{tx.type}</span>
                            <span className="wallet-tx-item__date">{tx.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="wallet-tx-item__right">
                        <span
                          className={`wallet-tx-item__amount${
                            isPositive ? ' wallet-tx-item__amount--green' : ''
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {tx.amount.toLocaleString()} AC
                        </span>
                        <span className="wallet-tx-item__status">
                          <CheckCircle2 size={12} style={{ color: '#4ade80' }} />
                          <span>{tx.status}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="wallet-tx-empty">
                <History size={28} className="wallet-tx-empty__icon" />
                <p>Транзакций в выбранной категории пока нет</p>
                <span>Все начисления за турниры и покупки появятся в этом списке</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
