import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Package,
  History,
  ShoppingBag,
  CheckCircle2,
  X,
  Pencil,
  Clock,
  Calendar,
  AlertTriangle,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import CoinIcon from '@/components/ui/CoinIcon/CoinIcon';
import type { MarketOffer, MarketOfferSpec, MarketDiscountDuration } from '@/types';
import {
  isOfferDiscountActive,
  getOfferFinalPrice,
  calculateDiscountExpiresAt,
  formatDiscountDurationLabel,
} from '@/types';
import { defaultUnifiedAdminSpecs } from '@/data/mocks/marketMockData';
import '../Admin.css';
import './AdminMarket.css';

const quickEmojiList = ['📦', '🎯', '⚡', '👑', '🏆', '💎', '🔫', '🔪', '🛡️'];

type AdminMarketTab = 'lots' | 'history' | 'orders';

const AdminMarket: React.FC = () => {
  const {
    marketOffers,
    marketOrders,
    marketHistory,
    addMarketOffer,
    updateMarketOffer,
    deleteMarketOffer,
    confirmOrderDone,
  } = useData();

  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as AdminMarketTab | null;

  const [activeTab, setActiveTab] = useState<AdminMarketTab>(() => {
    if (queryTab === 'orders' || queryTab === 'history' || queryTab === 'lots') {
      return queryTab;
    }
    return 'lots';
  });

  useEffect(() => {
    if (queryTab === 'orders' || queryTab === 'history' || queryTab === 'lots') {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (tab: AdminMarketTab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'lots' ? {} : { tab });
  };

  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  // Form states
  const [adminTitle, setAdminTitle] = useState('');
  const [adminDesc, setAdminDesc] = useState('');
  const [adminImage, setAdminImage] = useState('');
  const [adminIcon, setAdminIcon] = useState('📦');
  const [adminPrice, setAdminPrice] = useState<number | string>(1500);
  const [adminDiscount, setAdminDiscount] = useState<number | string>(0);
  const [adminDiscountDuration, setAdminDiscountDuration] = useState<MarketDiscountDuration>('forever');
  const [adminDiscountExpiresAt, setAdminDiscountExpiresAt] = useState('');
  const [adminStock, setAdminStock] = useState<number | string>(5);
  const [adminSpecs, setAdminSpecs] = useState<MarketOfferSpec[]>([...defaultUnifiedAdminSpecs]);

  const handleOpenCreateModal = () => {
    setEditingOfferId(null);
    setAdminTitle('');
    setAdminDesc('');
    setAdminImage('');
    setAdminIcon('📦');
    setAdminPrice(1500);
    setAdminDiscount(0);
    setAdminDiscountDuration('forever');
    setAdminDiscountExpiresAt('');
    setAdminStock(5);
    setAdminSpecs([...defaultUnifiedAdminSpecs]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offer: MarketOffer) => {
    setEditingOfferId(offer.id);
    setAdminTitle(offer.title);
    setAdminDesc(offer.desc);
    setAdminImage(offer.image || '');
    setAdminIcon(offer.icon || '📦');
    setAdminPrice(offer.price);
    setAdminDiscount(offer.discount || 0);

    const dur = offer.discountDuration || (offer.discountExpiresAt ? 'custom' : 'forever');
    setAdminDiscountDuration(dur);

    if (offer.discountExpiresAt) {
      try {
        const d = new Date(offer.discountExpiresAt);
        if (!isNaN(d.getTime())) {
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          setAdminDiscountExpiresAt(localISO);
        } else {
          setAdminDiscountExpiresAt('');
        }
      } catch {
        setAdminDiscountExpiresAt('');
      }
    } else {
      setAdminDiscountExpiresAt('');
    }

    setAdminStock(offer.stock);
    setAdminSpecs(offer.specs && offer.specs.length > 0 ? [...offer.specs] : [...defaultUnifiedAdminSpecs]);
    setIsModalOpen(true);
  };

  const handleSelectDurationPreset = (preset: MarketDiscountDuration) => {
    setAdminDiscountDuration(preset);
    if (preset === 'forever') {
      setAdminDiscountExpiresAt('');
    } else if (preset === 'custom') {
      if (!adminDiscountExpiresAt) {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const tzOffset = tomorrow.getTimezoneOffset() * 60000;
        setAdminDiscountExpiresAt(new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16));
      }
    } else {
      const expIso = calculateDiscountExpiresAt(preset);
      const d = new Date(expIso);
      const tzOffset = d.getTimezoneOffset() * 60000;
      setAdminDiscountExpiresAt(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
    }
  };

  const handleAddSpecRow = () => {
    setAdminSpecs((prev) => [...prev, { label: '', value: '' }]);
  };

  const handleUpdateSpecRow = (idx: number, field: 'label' | 'value', val: string) => {
    setAdminSpecs((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveSpecRow = (idx: number) => {
    setAdminSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTitle.trim()) {
      showToast('Введите название лота', 'error');
      return;
    }

    const validSpecs = adminSpecs.filter((s) => s.label.trim() && s.value.trim());
    const finalSpecs = validSpecs.length > 0 ? validSpecs : [...defaultUnifiedAdminSpecs];
    const parsedPrice = Math.max(1, Math.round(Number(adminPrice) || 1000));
    const discountVal = Math.max(0, Math.min(99, Math.round(Number(adminDiscount) || 0)));
    const stockVal = Math.max(0, Math.round(Number(adminStock) || 0));

    let finalExpiresAt: string | undefined = undefined;
    if (discountVal > 0) {
      if (adminDiscountDuration === 'forever') {
        finalExpiresAt = undefined;
      } else if (adminDiscountExpiresAt) {
        finalExpiresAt = new Date(adminDiscountExpiresAt).toISOString();
      } else {
        finalExpiresAt = calculateDiscountExpiresAt(adminDiscountDuration);
      }
    }

    if (editingOfferId) {
      updateMarketOffer(editingOfferId, {
        title: adminTitle.trim(),
        desc: adminDesc.trim() || 'Официальный лот киберспортивной лиги ASCENT CS2.',
        icon: adminIcon.trim() || '📦',
        image: adminImage.trim() || undefined,
        price: parsedPrice,
        discount: discountVal,
        discountDuration: discountVal > 0 ? adminDiscountDuration : 'forever',
        discountExpiresAt: discountVal > 0 ? finalExpiresAt : undefined,
        stock: stockVal,
        specs: finalSpecs,
      });

      showToast(`Лот «${adminTitle.trim()}» успешно обновлен!`, 'success');
      setIsModalOpen(false);
      setEditingOfferId(null);
    } else {
      const newOffer: MarketOffer = {
        id: `lot-${Date.now()}`,
        title: adminTitle.trim(),
        desc: adminDesc.trim() || 'Официальный лот киберспортивной лиги ASCENT CS2.',
        icon: adminIcon.trim() || '📦',
        image: adminImage.trim() || undefined,
        price: parsedPrice,
        discount: discountVal,
        discountDuration: discountVal > 0 ? adminDiscountDuration : 'forever',
        discountExpiresAt: discountVal > 0 ? finalExpiresAt : undefined,
        stock: stockVal,
        popularScore: 90,
        specs: finalSpecs,
      };

      addMarketOffer(newOffer);
      showToast(`Лот «${newOffer.title}» успешно опубликован на рынке!`, 'success');
      setIsModalOpen(false);
    }
  };

  const handleDeleteOffer = (id: string, title: string) => {
    if (window.confirm(`Удалить лот «${title}» с рынка лиги?`)) {
      deleteMarketOffer(id);
      showToast('Лот удален', 'info');
    }
  };

  const handleStockChange = (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    updateMarketOffer(id, { stock: newStock });
    showToast(`Количество обновлено: ${newStock} шт.`, 'info');
  };

  const pendingOrders = useMemo(() => marketOrders.filter((o) => o.status === 'pending'), [marketOrders]);
  const doneOrders = useMemo(() => marketOrders.filter((o) => o.status === 'done'), [marketOrders]);

  const filteredOrders = useMemo(() => {
    return marketOrders.filter((o) => {
      if (orderFilter !== 'all' && o.status !== orderFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesTitle = o.title.toLowerCase().includes(q);
        const matchesBuyer = (o.buyerNickname || '').toLowerCase().includes(q);
        const matchesEmail = (o.buyerEmail || '').toLowerCase().includes(q);
        return matchesId || matchesTitle || matchesBuyer || matchesEmail;
      }
      return true;
    });
  }, [marketOrders, orderFilter, orderSearch]);

  const numDiscount = Math.max(0, Math.min(99, Math.round(Number(adminDiscount) || 0)));
  const numPrice = Math.max(0, Math.round(Number(adminPrice) || 0));
  const previewFinalPrice = numDiscount > 0 ? Math.floor(numPrice * (1 - numDiscount / 100)) : numPrice;
  const previewSavings = Math.max(0, numPrice - previewFinalPrice);

  return (
    <>
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>Управление рынком ASCENT</h1>
          <p className="admin-page-header__subtitle">
            Каталог лотов, публикация предложений, история операций и выдача заказов игрокам.
          </p>
        </div>
        <div className="admin-page-header__right">
          <button
            type="button"
            className="market-btn-create-lot"
            onClick={handleOpenCreateModal}
          >
            <Plus size={18} strokeWidth={2.5} />
            Создать лот
          </button>
        </div>
      </div>

      {/* Alert Banner when pending orders exist and user is on another tab */}
      {pendingOrders.length > 0 && activeTab !== 'orders' && (
        <div className="admin-orders-alert-banner">
          <div className="admin-orders-alert-banner__content">
            <span className="admin-orders-alert-banner__badge">Новые заказы</span>
            <div>
              <strong>В очереди на выдачу: {pendingOrders.length} {pendingOrders.length === 1 ? 'заказ' : 'заказа'}!</strong>
              <p>Игроки приобрели товары на маркете. Перейдите во вкладку заказов для выдачи предметов.</p>
            </div>
          </div>
          <button
            type="button"
            className="market-btn-create-lot"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => handleTabChange('orders')}
          >
            <Package size={15} />
            Перейти к заказам ({pendingOrders.length})
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          className={`admin-btn ${activeTab === 'lots' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          onClick={() => handleTabChange('lots')}
        >
          <ShoppingBag size={16} />
          Каталог лотов ({marketOffers.length})
        </button>

        <button
          className={`admin-btn ${activeTab === 'history' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          onClick={() => handleTabChange('history')}
        >
          <History size={16} />
          История рынка ({marketHistory.length})
        </button>

        <button
          className={`admin-btn ${activeTab === 'orders' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          onClick={() => handleTabChange('orders')}
          style={{ position: 'relative' }}
        >
          <Package size={16} />
          Заказы игроков
          {pendingOrders.length > 0 ? (
            <span className="admin-orders-pill-badge">
              {pendingOrders.length} в очереди
            </span>
          ) : (
            <span style={{ opacity: 0.7 }}>({marketOrders.length})</span>
          )}
        </button>
      </div>

      {/* TAB 1: LOTS CATALOG */}
      {activeTab === 'lots' && (
        <div className="admin-panel-section panel">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Иконка</th>
                  <th>Наименование лота</th>
                  <th>Цена</th>
                  <th style={{ minWidth: '130px' }}>Скидка</th>
                  <th>Наличие (Stock)</th>
                  <th style={{ textAlign: 'right', minWidth: '100px' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {marketOffers.map((offer) => {
                  const finalPrice = getOfferFinalPrice(offer);
                  const isDiscountActive = isOfferDiscountActive(offer);

                  return (
                    <tr key={offer.id}>
                      <td>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            overflow: 'hidden',
                          }}
                        >
                          {offer.image ? (
                            <img
                              src={offer.image}
                              alt={offer.title}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <span>{offer.icon || '📦'}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-primary)' }}>
                          {offer.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {offer.desc}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 'var(--fw-bold)',
                          }}
                        >
                          <CoinIcon size={14} />
                          <span>{finalPrice.toLocaleString()} AC</span>
                        </span>
                        {offer.discount && isDiscountActive ? (
                          <div
                            style={{
                              fontSize: '10px',
                              color: 'var(--text-tertiary)',
                              textDecoration: 'line-through',
                            }}
                          >
                            {offer.price.toLocaleString()} AC
                          </div>
                        ) : null}
                      </td>

                      <td>
                        {offer.discount && offer.discount > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <span
                              style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'var(--fw-bold)',
                                backgroundColor: isDiscountActive
                                  ? 'rgba(34, 197, 94, 0.16)'
                                  : 'rgba(255, 255, 255, 0.08)',
                                color: isDiscountActive ? '#4ade80' : 'var(--text-tertiary)',
                                textDecoration: isDiscountActive ? 'none' : 'line-through',
                              }}
                            >
                              -{offer.discount}%
                            </span>

                            {offer.discountExpiresAt ? (
                              isDiscountActive ? (
                                <span
                                  className="market-discount-duration-pill market-discount-duration-pill--active"
                                  title={`Скидка действует до: ${new Date(offer.discountExpiresAt).toLocaleString('ru-RU')}`}
                                >
                                  <Clock size={11} />
                                  <span>{formatDiscountDurationLabel(offer)}</span>
                                </span>
                              ) : (
                                <span
                                  className="market-discount-duration-pill market-discount-duration-pill--expired"
                                  title={`Скидка истекла ${new Date(offer.discountExpiresAt).toLocaleString('ru-RU')}`}
                                >
                                  <AlertTriangle size={11} />
                                  <span>Истекла</span>
                                </span>
                              )
                            ) : (
                              <span
                                className="market-discount-duration-pill market-discount-duration-pill--forever"
                                title="Скидка действует постоянно"
                              >
                                ♾️ Бессрочно
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>—</span>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            style={{ width: '24px', height: '24px', fontSize: '12px' }}
                            onClick={() => handleStockChange(offer.id, offer.stock, -1)}
                            disabled={offer.stock <= 0}
                            title="Уменьшить на 1"
                          >
                            -
                          </button>

                          <span
                            style={{
                              fontWeight: 'var(--fw-bold)',
                              minWidth: '40px',
                              textAlign: 'center',
                              color: offer.stock > 0 ? 'var(--text-primary)' : 'var(--accent-negative)',
                            }}
                          >
                            {offer.stock} шт.
                          </span>

                          <button
                            type="button"
                            className="admin-icon-btn"
                            style={{ width: '24px', height: '24px', fontSize: '12px' }}
                            onClick={() => handleStockChange(offer.id, offer.stock, 1)}
                            title="Увеличить на 1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="admin-table-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--edit"
                            onClick={() => handleOpenEditModal(offer)}
                            title="Редактировать лот, цену и скидку"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--danger"
                            onClick={() => handleDeleteOffer(offer.id, offer.title)}
                            title="Удалить лот с рынка"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MARKET HISTORY (Moved from Public Page) */}
      {activeTab === 'history' && (
        <div className="admin-panel-section panel">
          <div className="admin-panel-section__header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--fs-base)', fontWeight: 'var(--fw-bold)', margin: 0 }}>
              Реестр транзакций и истории рынка ASCENT
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Полная проводка монет лиги ASCENT Coins (AC)
            </span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Дата</th>
                  <th style={{ width: '130px' }}>Операция</th>
                  <th>Описание транзакции</th>
                  <th style={{ width: '160px', textAlign: 'right' }}>Сумма</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {marketHistory.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{tx.date}</td>
                      <td>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'var(--fw-medium)',
                            backgroundColor: isPositive
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: isPositive ? 'var(--accent-positive)' : 'var(--text-secondary)',
                          }}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'var(--fw-medium)' }}>{tx.desc}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 'var(--fw-bold)',
                            color: isPositive ? 'var(--accent-positive)' : 'var(--text-primary)',
                          }}
                        >
                          <CoinIcon size={14} />
                          <span>
                            {isPositive ? '+' : ''}
                            {tx.amount.toLocaleString()} AC
                          </span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                        {tx.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS QUEUE */}
      {activeTab === 'orders' && (
        <div className="admin-panel-section panel">
          {/* Header Bar with Filters and Search */}
          <div className="admin-orders-header-bar">
            <div className="admin-orders-filter-group">
              <button
                type="button"
                className={`admin-orders-filter-btn${orderFilter === 'all' ? ' active' : ''}`}
                onClick={() => setOrderFilter('all')}
              >
                Все ({marketOrders.length})
              </button>
              <button
                type="button"
                className={`admin-orders-filter-btn${orderFilter === 'pending' ? ' active' : ''}`}
                onClick={() => setOrderFilter('pending')}
              >
                В очереди ({pendingOrders.length})
              </button>
              <button
                type="button"
                className={`admin-orders-filter-btn${orderFilter === 'done' ? ' active' : ''}`}
                onClick={() => setOrderFilter('done')}
              >
                Выдано ({doneOrders.length})
              </button>
            </div>

            <div className="admin-orders-search-box">
              <Search size={15} style={{ opacity: 0.6 }} />
              <input
                type="text"
                placeholder="Поиск по ID, лоту или игроку..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              {orderSearch && (
                <button
                  type="button"
                  onClick={() => setOrderSearch('')}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                  title="Очистить поиск"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '170px' }}>ID / Дата заказа</th>
                  <th style={{ width: '220px' }}>Покупатель (Игрок)</th>
                  <th>Наименование лота</th>
                  <th style={{ width: '150px' }}>Сумма</th>
                  <th style={{ width: '180px' }}>Текущий статус</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>Действие</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
                      {orderSearch ? 'По вашему поисковому запросу ничего не найдено.' : 'В данном статусе заказов нет.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <div style={{ fontWeight: 'var(--fw-bold)' }}>{ord.id}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{ord.date}</div>
                      </td>
                      <td>
                        <div className="admin-buyer-cell">
                          <span className="admin-buyer-name">
                            {ord.buyerNickname || 'BlazeMaster'}
                          </span>
                          {ord.buyerEmail && (
                            <span className="admin-buyer-sub">{ord.buyerEmail}</span>
                          )}
                          {ord.buyerSteamUrl && (
                            <a
                              href={ord.buyerSteamUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-buyer-steam-link"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            >
                              <span>Steam профиль</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 'var(--fw-medium)' }}>{ord.title}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 'var(--fw-bold)',
                          }}
                        >
                          <CoinIcon size={14} />
                          <span>{ord.price.toLocaleString()} AC</span>
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor:
                              ord.status === 'done'
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(234, 179, 8, 0.2)',
                            color: ord.status === 'done' ? '#4ade80' : '#facc15',
                          }}
                        >
                          {ord.status === 'done' ? 'Выдано' : ord.statusLabel}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {ord.status === 'pending' ? (
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            style={{ padding: '5px 12px', fontSize: '12px' }}
                            onClick={() => {
                              confirmOrderDone(ord.id);
                              showToast(`Заказ ${ord.id} успешно выдан игроку!`, 'success');
                            }}
                          >
                            <CheckCircle2 size={14} />
                            Выдать
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} style={{ color: '#4ade80' }} /> Выполнено
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LOT MODAL */}
      {isModalOpen && (
        <div
          className="market-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="market-create-modal">
            {/* Header */}
            <div className="market-modal-header">
              <div className="market-modal-header__info">
                <div className="market-modal-header__icon">
                  {editingOfferId ? <Pencil size={20} /> : <ShoppingBag size={20} />}
                </div>
                <div>
                  <h2 className="market-modal-header__title">
                    {editingOfferId ? 'Редактирование лота' : 'Создание нового лота'}
                  </h2>
                  <p className="market-modal-header__subtitle">
                    {editingOfferId
                      ? 'Изменение параметров, цены, длительности скидки и характеристик'
                      : 'Размещение товара или цифровой награды на рынке ASCENT'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="market-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                title="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="market-modal-form">
              <div className="market-modal-body">
                {/* 1. Title & Desc */}
                <div className="market-form-section">
                  <div className="form-group">
                    <label className="market-form-label">
                      Название лота <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminTitle}
                      onChange={(e) => setAdminTitle(e.target.value)}
                      placeholder="Например: AWP | Hyper Beast (Factory New)"
                      className="market-input"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="market-form-label">Описание предмета</label>
                    <textarea
                      rows={2}
                      value={adminDesc}
                      onChange={(e) => setAdminDesc(e.target.value)}
                      placeholder="Краткое описание характеристик, бонусов или условий выдачи..."
                      className="market-input market-textarea"
                    />
                  </div>
                </div>

                {/* 2. Visuals & Icon */}
                <div className="market-form-section">
                  <div className="market-form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="market-form-label">URL изображения (опционально)</label>
                      <input
                        type="url"
                        value={adminImage}
                        onChange={(e) => setAdminImage(e.target.value)}
                        placeholder="https://..."
                        className="market-input"
                      />
                    </div>

                    <div className="form-group" style={{ width: '130px' }}>
                      <label className="market-form-label">Иконка</label>
                      <div className="market-icon-input-wrap">
                        <input
                          type="text"
                          value={adminIcon}
                          onChange={(e) => setAdminIcon(e.target.value)}
                          placeholder="📦"
                          maxLength={4}
                          className="market-input market-icon-input"
                        />
                        <span className="market-icon-preview">{adminIcon || '📦'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick emoji chips */}
                  <div className="market-emoji-chips">
                    <span className="market-emoji-chips__label">Быстрый выбор:</span>
                    {quickEmojiList.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`market-emoji-chip${adminIcon === emoji ? ' active' : ''}`}
                        onClick={() => setAdminIcon(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Pricing, Discount, Stock */}
                <div className="market-form-section">
                  <div className="market-pricing-grid">
                    <div className="form-group">
                      <label className="market-form-label">
                        Цена (AC) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="market-input-with-icon">
                        <CoinIcon size={16} />
                        <input
                          type="number"
                          value={adminPrice}
                          onChange={(e) => setAdminPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          min={1}
                          step="1"
                          className="market-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="market-form-label">Скидка (%)</label>
                      <input
                        type="number"
                        value={adminDiscount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminDiscount(val === '' ? '' : Math.max(0, Math.min(99, Number(val))));
                        }}
                        min={0}
                        max={99}
                        step="1"
                        placeholder="0"
                        className="market-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="market-form-label">
                        В наличии (Stock) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="number"
                        value={adminStock}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminStock(val === '' ? '' : Math.max(0, Number(val)));
                        }}
                        min={0}
                        max={9999}
                        step="1"
                        className="market-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Discount Duration Box (only when discount > 0) */}
                  {numDiscount > 0 && (
                    <div className="market-discount-duration-box">
                      <div className="market-discount-duration-header">
                        <div className="market-discount-duration-title">
                          <Clock size={15} />
                          <span>Длительность и срок действия скидки</span>
                        </div>
                        <span className="market-discount-duration-hint">
                          {adminDiscountDuration === 'forever'
                            ? '♾️ Скидка бессрочная'
                            : adminDiscountExpiresAt
                            ? `⏳ До: ${new Date(adminDiscountExpiresAt).toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`
                            : 'Срок не установлен'}
                        </span>
                      </div>

                      {/* Preset Chips */}
                      <div className="market-duration-presets">
                        {[
                          { id: '24h', label: '24 часа' },
                          { id: '3d', label: '3 дня' },
                          { id: '7d', label: '7 дней' },
                          { id: '14d', label: '14 дней' },
                          { id: 'forever', label: 'Бессрочно' },
                          { id: 'custom', label: 'Своя дата' },
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            className={`market-duration-preset-btn${
                              adminDiscountDuration === preset.id ? ' active' : ''
                            }`}
                            onClick={() => handleSelectDurationPreset(preset.id as MarketDiscountDuration)}
                          >
                            {preset.id === 'custom' && <Calendar size={13} style={{ marginRight: '4px' }} />}
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom DateTime Picker */}
                      {adminDiscountDuration === 'custom' && (
                        <div className="market-duration-custom-picker">
                          <label className="market-form-label" style={{ marginBottom: '4px' }}>
                            Точная дата и время окончания скидки
                          </label>
                          <div className="market-input-with-icon">
                            <Calendar size={15} />
                            <input
                              type="datetime-local"
                              value={adminDiscountExpiresAt}
                              onChange={(e) => setAdminDiscountExpiresAt(e.target.value)}
                              className="market-input"
                              required={adminDiscountDuration === 'custom'}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live Price Calculator Banner */}
                  <div className="market-price-preview-banner">
                    <span className="market-price-preview-banner__label">Итог на витрине:</span>
                    <span className="market-price-preview-banner__val">
                      <CoinIcon size={15} />
                      <strong>{previewFinalPrice.toLocaleString()} AC</strong>
                    </span>
                    {numDiscount > 0 && (
                      <span className="market-price-preview-banner__badge">
                        Скидка -{numDiscount}% (экономия {previewSavings.toLocaleString()} AC)
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Specifications */}
                <div className="market-specs-box">
                  <div className="market-specs-header">
                    <div>
                      <span className="market-specs-title">Характеристики лота</span>
                      <p className="market-specs-subtitle">Отображаются в карточке товара на витрине</p>
                    </div>
                    <button
                      type="button"
                      className="market-specs-add-btn"
                      onClick={handleAddSpecRow}
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      Добавить поле
                    </button>
                  </div>

                  <div className="market-specs-list">
                    {adminSpecs.map((row, idx) => (
                      <div key={idx} className="market-spec-row">
                        <input
                          type="text"
                          placeholder="Параметр (напр. Состояние)"
                          value={row.label}
                          onChange={(e) => handleUpdateSpecRow(idx, 'label', e.target.value)}
                          className="market-input market-spec-input"
                        />
                        <input
                          type="text"
                          placeholder="Значение (напр. Прямо с завода)"
                          value={row.value}
                          onChange={(e) => handleUpdateSpecRow(idx, 'value', e.target.value)}
                          className="market-input market-spec-input"
                        />
                        <button
                          type="button"
                          className="market-spec-remove-btn"
                          onClick={() => handleRemoveSpecRow(idx)}
                          title="Удалить строку"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="market-modal-footer">
                <button
                  type="button"
                  className="market-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="market-btn-publish"
                >
                  {editingOfferId ? (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      Сохранить изменения
                    </>
                  ) : (
                    <>
                      <Plus size={16} strokeWidth={2.5} />
                      Опубликовать лот на рынке
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminMarket;
