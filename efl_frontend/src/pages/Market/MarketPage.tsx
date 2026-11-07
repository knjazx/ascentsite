import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutGrid,
  ShoppingCart,
  Package,
  Search,
  Trash2,
  X,
  PackageSearch,
  ShoppingBag,
  ChevronRight,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import CoinIcon from '@/components/ui/CoinIcon/CoinIcon';
import type {
  MarketOffer,
  MarketSortOption,
  MarketOrderFilter,
} from '@/types';
import {
  isOfferDiscountActive,
  getOfferFinalPrice,
  formatDiscountDurationLabel,
} from '@/types';
import { defaultUnifiedAdminSpecs } from '@/data/mocks/marketMockData';
import './MarketPage.css';

const sortOptions = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'discount', label: 'По размеру скидки %' },
];

const MarketPage: React.FC = () => {
  const {
    currentUser,
    marketOffers,
    marketOrders,
    marketBalance,
    marketCart,
    openWallet,
    addToCart,
    removeFromCart,
    clearCart,
    checkoutMarket,
    confirmOrderDone,
  } = useData();

  const { showToast } = useToast();

  // Navigation Sub-tab: showcase, cart, or orders
  const [activeSubTab, setActiveSubTab] = useState<'showcase' | 'cart' | 'orders'>('showcase');

  // Search and Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('popular');

  // Orders Filter
  const [orderFilter, setOrderFilter] = useState<MarketOrderFilter>('all');

  // Modals
  const [detailOffer, setDetailOffer] = useState<MarketOffer | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailOffer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered & Sorted Offers
  const displayedOffers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = marketOffers.filter((o) => {
      if (!query) return true;
      return (
        o.title.toLowerCase().includes(query) ||
        o.desc.toLowerCase().includes(query)
      );
    });

    return filtered.sort((a, b) => {
      const aOut = a.stock <= 0 ? 1 : 0;
      const bOut = b.stock <= 0 ? 1 : 0;
      if (aOut !== bOut) return aOut - bOut;

      const pa = getOfferFinalPrice(a);
      const pb = getOfferFinalPrice(b);

      if (sortOption === 'price_asc') return pa - pb;
      if (sortOption === 'price_desc') return pb - pa;
      if (sortOption === 'discount') {
        const da = isOfferDiscountActive(a) ? a.discount || 0 : 0;
        const db = isOfferDiscountActive(b) ? b.discount || 0 : 0;
        return db - da;
      }
      return (b.popularScore || 0) - (a.popularScore || 0);
    });
  }, [marketOffers, searchQuery, sortOption]);

  const totalOffersCount = marketOffers.length;
  const inStockOffersCount = marketOffers.filter((o) => o.stock > 0).length;

  // Cart Items details
  const cartItemsWithDetails = useMemo(() => {
    return marketCart
      .map((id, index) => {
        const offer = marketOffers.find((o) => o.id === id);
        return { offer, cartIndex: index };
      })
      .filter((item): item is { offer: MarketOffer; cartIndex: number } => Boolean(item.offer));
  }, [marketCart, marketOffers]);

  const cartCalculations = useMemo(() => {
    let subtotal = 0;
    let finalTotal = 0;

    cartItemsWithDetails.forEach(({ offer }) => {
      const finalP = getOfferFinalPrice(offer);
      subtotal += offer.price;
      finalTotal += finalP;
    });

    const discountSavings = subtotal - finalTotal;
    const remainingBalance = marketBalance - finalTotal;
    const isDeficit = remainingBalance < 0;

    return { subtotal, finalTotal, discountSavings, remainingBalance, isDeficit };
  }, [cartItemsWithDetails, marketBalance]);

  // Orders filtered
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return marketOrders;
    return marketOrders.filter((o) => o.status === orderFilter);
  }, [marketOrders, orderFilter]);

  const pendingOrdersCount = useMemo(() => {
    return marketOrders.filter((o) => o.status === 'pending').length;
  }, [marketOrders]);

  // Handlers
  const handleAddToCart = (offer: MarketOffer) => {
    if (offer.stock <= 0) {
      showToast('Лота нет в наличии', 'error');
      return;
    }
    const currentInCart = marketCart.filter((id) => id === offer.id).length;
    if (currentInCart >= offer.stock) {
      showToast(`Достигнут лимит наличия лота (${offer.stock} шт.)`, 'error');
      return;
    }
    const success = addToCart(offer.id);
    if (success) {
      showToast(`Добавлено в корзину: ${offer.title}`, 'success');
    }
  };

  const handleRemoveFromCart = (index: number) => {
    removeFromCart(index);
    showToast('Лот удален из корзины', 'info');
  };

  const handleClearCart = () => {
    if (marketCart.length === 0) return;
    clearCart();
    showToast('Корзина очищена', 'info');
  };

  const handleCheckout = () => {
    const res = checkoutMarket();
    if (!res.success) {
      showToast(res.message, 'error');
    } else {
      showToast(res.message, 'success');
      setActiveSubTab('orders');
    }
  };

  const handleConfirmOrder = (orderId: string) => {
    confirmOrderDone(orderId);
    showToast(`Заказ ${orderId} успешно подтвержден!`, 'success');
  };

  return (
    <section className="market-page">
      <div className="container">
        {/* Hero Banner */}
        <div className="market-hero panel">
          <div className="market-hero__info">
            <span className="market-hero__badge">Торговая площадка лиги</span>
          </div>

          <div className="market-hero__actions">
            {/* Wallet Balance Display Widget - Opens Player Wallet anywhere */}
            {currentUser && (
              <div
                className="market-balance-widget"
                onClick={openWallet}
                role="button"
                tabIndex={0}
                title="Открыть кошелёк игрока"
              >
                <CoinIcon size={32} />
                <div className="market-balance-widget__info">
                  <span className="market-balance-widget__label">Кошелёк игрока</span>
                  <span className="market-balance-widget__val">{marketBalance.toLocaleString()} AC</span>
                </div>
              </div>
            )}

            {/* Quick Cart Button */}
            <button
              type="button"
              className={`btn-primary market-cart-btn${activeSubTab === 'cart' ? ' active' : ''}`}
              onClick={() => setActiveSubTab(activeSubTab === 'cart' ? 'showcase' : 'cart')}
              title="Открыть корзину"
            >
              <ShoppingCart size={18} />
              <span>Корзина</span>
              <span className="market-cart-btn__count">{marketCart.length}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs: strictly 2 tabs (showcase & orders) */}
        <div className="market-nav-bar">
          <div className="tabs-header">
            <button
              type="button"
              className={`tab-btn${activeSubTab === 'showcase' ? ' active' : ''}`}
              onClick={() => setActiveSubTab('showcase')}
            >
              <LayoutGrid size={16} />
              <span>Витрина лотов</span>
            </button>

            <button
              type="button"
              className={`tab-btn${activeSubTab === 'orders' ? ' active' : ''}`}
              onClick={() => setActiveSubTab('orders')}
            >
              <Package size={16} />
              <span>Мои заказы</span>
              {pendingOrdersCount > 0 && (
                <span className="market-tab-badge">{pendingOrdersCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SUB-PANE 1: SHOWCASE                                              */}
        {/* ================================================================= */}
        {activeSubTab === 'showcase' && (
          <div className="market-showcase">
            {/* Toolbar: Search & Sort */}
            <div className="market-showcase__toolbar">
              <div className="market-showcase__meta">
                <span className="market-showcase__title">Каталог лотов</span>
                <span className="market-showcase__count-badge">
                  {totalOffersCount} лотов • {inStockOffersCount} в наличии
                </span>
              </div>

              <div className="market-showcase__controls">
                {/* Search Box */}
                <div className="market-search-box">
                  <Search size={16} className="market-search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск лота по названию..."
                    className="market-search-input"
                  />
                </div>

                {/* Sort Dropdown */}
                <CustomSelect
                  value={sortOption}
                  onChange={(val) => setSortOption(val as MarketSortOption)}
                  options={sortOptions}
                  className="market-sort-select"
                />
              </div>
            </div>

            {/* Offers Grid */}
            {displayedOffers.length > 0 ? (
              <div className="market-grid">
                {displayedOffers.map((offer) => {
                  const isDiscountActive = isOfferDiscountActive(offer);
                  const finalPrice = getOfferFinalPrice(offer);
                  const isOutOfStock = offer.stock <= 0;

                  return (
                    <div
                      key={offer.id}
                      className={`market-card${isOutOfStock ? ' market-card--out-of-stock' : ''}`}
                      onClick={() => setDetailOffer(offer)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* Media Stage */}
                      <div className="market-card__media">
                        <span
                          className={`market-card__stock-tag${
                            isOutOfStock ? ' market-card__stock-tag--empty' : ''
                          }`}
                        >
                          {isOutOfStock
                            ? 'Нет в наличии'
                            : offer.stock > 50
                            ? 'В наличии'
                            : `В наличии: ${offer.stock} шт.`}
                        </span>

                        {offer.image ? (
                          <img
                            src={offer.image}
                            alt={offer.title}
                            className="market-card__img"
                            loading="lazy"
                          />
                        ) : (
                          <span className="market-card__icon">{offer.icon || '📦'}</span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="market-card__body">
                        <div className="market-card__header-info">
                          <h4 className="market-card__title" title={offer.title}>
                            {offer.title}
                          </h4>
                          <p className="market-card__desc">{offer.desc}</p>
                        </div>

                        {/* Footer */}
                        <div className="market-card__footer">
                          <span className="market-card__league-tag">ASCENT League</span>

                          <div className="market-card__pricing">
                            {offer.discount && isDiscountActive && !isOutOfStock ? (
                              <div className="market-card__pricing-discounted">
                                <span
                                  className="market-card__discount-pill"
                                  title={
                                    offer.discountExpiresAt
                                      ? `Скидка действует ещё: ${formatDiscountDurationLabel(offer)}`
                                      : undefined
                                  }
                                >
                                  -{offer.discount}%
                                </span>
                                <span className="market-card__old-price">
                                  {offer.price.toLocaleString()}
                                </span>
                                <span className="market-card__price">
                                  <CoinIcon size={14} />
                                  <span>{finalPrice.toLocaleString()} AC</span>
                                </span>
                              </div>
                            ) : (
                              <span
                                className="market-card__price"
                                style={{ color: isOutOfStock ? 'var(--text-tertiary)' : undefined }}
                              >
                                <CoinIcon size={14} />
                                <span>{offer.price.toLocaleString()} AC</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="market-empty panel">
                <PackageSearch size={44} className="market-empty__icon" />
                <h3 className="market-empty__title">Лоты не найдены</h3>
                <p className="market-empty__text">
                  По запросу «{searchQuery}» ничего не найдено. Попробуйте изменить параметры поиска.
                </p>
                <button
                  type="button"
                  className="btn-outline market-empty__action"
                  onClick={() => setSearchQuery('')}
                >
                  Сбросить поиск
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* SUB-PANE 2: CART (ОРИГИНАЛЬНЫЙ ДИЗАЙН КОРЗИНЫ)                    */}
        {/* ================================================================= */}
        {activeSubTab === 'cart' && (
          <div className="market-cart-layout">
            {/* Left: Cart Items List */}
            <div className="market-cart-items-col">
              <div className="market-cart-header">
                <div className="market-cart-header__title">
                  <ShoppingCart size={18} />
                  <span>Выбранные позиции</span>
                  <span className="market-cart-header__counter">
                    {cartItemsWithDetails.length} {cartItemsWithDetails.length === 1 ? 'товар' : 'товаров'}
                  </span>
                </div>
                {cartItemsWithDetails.length > 0 && (
                  <button
                    type="button"
                    className="market-cart-clear-btn"
                    onClick={handleClearCart}
                  >
                    Очистить корзину
                  </button>
                )}
              </div>

              {cartItemsWithDetails.length > 0 ? (
                cartItemsWithDetails.map(({ offer, cartIndex }) => {
                  const finalP = getOfferFinalPrice(offer);
                  const isDiscountActive = isOfferDiscountActive(offer);

                  return (
                    <div key={`${offer.id}-${cartIndex}`} className="market-cart-item panel">
                      <div className="market-cart-item__left">
                        <div className="market-cart-item__visual">
                          {offer.image ? (
                            <img src={offer.image} alt={offer.title} />
                          ) : (
                            <span>{offer.icon || '📦'}</span>
                          )}
                        </div>
                        <div className="market-cart-item__meta">
                          <h4 className="market-cart-item__title">{offer.title}</h4>
                          <p className="market-cart-item__desc">{offer.desc}</p>
                        </div>
                      </div>

                      <div className="market-cart-item__right">
                        <div className="market-cart-item__price">
                          {offer.discount && isDiscountActive ? (
                            <>
                              <div className="market-cart-item__old-price">
                                {offer.price.toLocaleString()} AC
                              </div>
                              <div className="market-cart-item__final-price">
                                <CoinIcon size={14} />
                                <span>{finalP.toLocaleString()} AC</span>
                              </div>
                            </>
                          ) : (
                            <div className="market-cart-item__final-price">
                              <CoinIcon size={14} />
                              <span>{offer.price.toLocaleString()} AC</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="market-cart-item__remove-btn"
                          onClick={() => handleRemoveFromCart(cartIndex)}
                          title="Удалить из корзины"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="market-empty panel">
                  <ShoppingBag size={44} className="market-empty__icon" />
                  <h3 className="market-empty__title">Корзина пуста</h3>
                  <p className="market-empty__text">
                    Добавьте доступные лоты из витрины рынка лиги.
                  </p>
                  <button
                    type="button"
                    className="btn-primary market-empty__action"
                    onClick={() => setActiveSubTab('showcase')}
                  >
                    Перейти к витрине
                  </button>
                </div>
              )}
            </div>

            {/* Right: Summary Card */}
            <div className="market-summary-card panel">
              <h3 className="market-summary-card__title">Сводка заказа</h3>

              <div className="market-summary-card__rows">
                <div className="market-summary-row">
                  <span>Лотов в заказе:</span>
                  <span className="market-summary-row__val">
                    {cartItemsWithDetails.length} шт.
                  </span>
                </div>
                <div className="market-summary-row">
                  <span>Базовая стоимость:</span>
                  <span className="market-summary-row__val">
                    <CoinIcon size={14} />
                    <span>{cartCalculations.subtotal.toLocaleString()} AC</span>
                  </span>
                </div>
                {cartCalculations.discountSavings > 0 && (
                  <div className="market-summary-row">
                    <span>Скидка по акциям:</span>
                    <span className="market-summary-row__val" style={{ color: 'var(--accent-positive)' }}>
                      -{cartCalculations.discountSavings.toLocaleString()} AC
                    </span>
                  </div>
                )}

                <div className="market-summary-row market-summary-row--total">
                  <span>ИТОГО К ОПЛАТЕ:</span>
                  <span className="market-summary-row__val">
                    <CoinIcon size={20} />
                    <span>{cartCalculations.finalTotal.toLocaleString()} AC</span>
                  </span>
                </div>
              </div>

              {/* Balance Box */}
              <div className="market-summary-balance-box">
                <div className="market-summary-row">
                  <span>Ваш баланс:</span>
                  <span className="market-summary-row__val">
                    <CoinIcon size={13} />
                    <span>{marketBalance.toLocaleString()} AC</span>
                  </span>
                </div>

                <div className="market-summary-row">
                  <span>Остаток после оплаты:</span>
                  <span
                    className="market-summary-row__val"
                    style={{
                      color: cartCalculations.isDeficit ? 'var(--accent-negative)' : undefined,
                    }}
                  >
                    <CoinIcon size={13} />
                    <span>
                      {cartCalculations.isDeficit
                        ? `${cartCalculations.remainingBalance.toLocaleString()} AC (Дефицит)`
                        : `${cartCalculations.remainingBalance.toLocaleString()} AC`}
                    </span>
                  </span>
                </div>

                {cartCalculations.isDeficit && (
                  <div className="market-summary-balance-box__deficit">
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>Недостаточно монет на балансе для оплаты выбранных позиций.</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="market-summary-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCheckout}
                  disabled={cartItemsWithDetails.length === 0 || cartCalculations.isDeficit}
                >
                  <CoinIcon size={16} />
                  <span>Оформить заказ и списать AC</span>
                </button>

                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setActiveSubTab('showcase')}
                >
                  ← Продолжить покупки
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SUB-PANE 3: ORDERS                                                */}
        {/* ================================================================= */}
        {activeSubTab === 'orders' && (
          <div className="market-orders-panel panel">
            <div className="market-orders-header">
              <h3 className="market-orders-header__title">Мои заказы</h3>

              <div className="market-orders-filters">
                <button
                  type="button"
                  className={`market-order-filter-btn${orderFilter === 'all' ? ' active' : ''}`}
                  onClick={() => setOrderFilter('all')}
                >
                  Все
                </button>
                <button
                  type="button"
                  className={`market-order-filter-btn${orderFilter === 'pending' ? ' active' : ''}`}
                  onClick={() => setOrderFilter('pending')}
                >
                  В обработке
                </button>
                <button
                  type="button"
                  className={`market-order-filter-btn${orderFilter === 'done' ? ' active' : ''}`}
                  onClick={() => setOrderFilter('done')}
                >
                  Выполнено
                </button>
              </div>
            </div>

            {filteredOrders.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '180px' }}>ID / Дата</th>
                      <th>Наименование лота</th>
                      <th style={{ width: '160px' }}>Стоимость</th>
                      <th style={{ width: '180px' }}>Статус заказа</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Действие</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div style={{ fontWeight: 'var(--fw-bold)' }}>{order.id}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            {order.date}
                          </div>
                        </td>
                        <td style={{ fontWeight: 'var(--fw-medium)' }}>{order.title}</td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontWeight: 'var(--fw-bold)',
                            }}
                          >
                            <CoinIcon size={14} />
                            <span>{order.price.toLocaleString()} AC</span>
                          </span>
                        </td>
                        <td>
                          {order.status === 'done' ? (
                            <span className="order-badge--done">Выполнено</span>
                          ) : (
                            <span className="order-badge--pending">{order.statusLabel}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {order.status === 'pending' ? (
                            <button
                              type="button"
                              className="btn-primary order-confirm-btn"
                              onClick={() => handleConfirmOrder(order.id)}
                            >
                              Подтвердить
                            </button>
                          ) : (
                            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                              Архив
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="market-empty">
                <Package size={40} className="market-empty__icon" />
                <h4 className="market-empty__title">Заказы не найдены</h4>
                <p className="market-empty__text">С выбранным фильтром нет ни одной записи.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: ITEM DETAIL MODAL (Redesigned per Reference)               */}
      {/* =================================================================== */}
      {detailOffer && (
        <div
          className="market-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailOffer(null);
          }}
        >
          <div className="market-modal">
            {/* Top Bar */}
            <div className="market-modal__top-bar">
              <div className="market-modal__breadcrumb">
                <span>Рынок ASCENT</span>
                <ChevronRight size={14} />
                <span className="market-modal__breadcrumb-active">{detailOffer.title}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'monospace',
                  }}
                >
                  #{detailOffer.id.toUpperCase().slice(0, 14)}
                </span>
                <button
                  type="button"
                  className="market-modal__close-btn"
                  onClick={() => setDetailOffer(null)}
                  title="Закрыть (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="market-modal__content">
              {/* TOP SECTION */}
              {(() => {
                const isDiscountActive = isOfferDiscountActive(detailOffer);
                const finalPrice = getOfferFinalPrice(detailOffer);
                const inCart = marketCart.filter((id) => id === detailOffer.id).length;
                const isOutOfStock = detailOffer.stock <= 0;
                const isCartLimitReached = !isOutOfStock && inCart >= detailOffer.stock;
                const balanceAfter = marketBalance - finalPrice;
                const isShortage = balanceAfter < 0;

                return (
                  <div className="market-modal__top-grid">
                    {/* Left: Stage */}
                    <div
                      className={`market-modal__stage${
                        isOutOfStock ? ' market-modal__stage--empty' : ''
                      }`}
                    >
                      {detailOffer.image ? (
                        <img
                          src={detailOffer.image}
                          alt={detailOffer.title}
                          className="market-modal__stage-img"
                        />
                      ) : (
                        <span className="market-modal__stage-icon">
                          {detailOffer.icon || '📦'}
                        </span>
                      )}
                    </div>

                    {/* Right: Info, Price, Cart CTA, Metrics */}
                    <div className="market-modal__details-col">
                      <div>
                        <div className="market-modal__badge-row">
                          <span
                            className={`market-modal__stock-pill${
                              isOutOfStock ? ' market-modal__stock-pill--out' : ''
                            }`}
                          >
                            {isOutOfStock
                              ? 'Нет в наличии (0 шт.)'
                              : detailOffer.stock > 50
                              ? 'Количество: Безлимит'
                              : `Количество: ${detailOffer.stock} шт.`}
                          </span>
                        </div>
                        <h3 className="market-modal__title">{detailOffer.title}</h3>
                      </div>

                      {/* Price Section */}
                      <div className="market-modal__price-section">
                        <div className="market-modal__price-main-row">
                          <div className="market-modal__price-info">
                            <span className="market-modal__price-label">Итоговая стоимость</span>
                            <div className="market-modal__price-val-wrap">
                              <span className="market-modal__price-val">
                                <CoinIcon size={24} />
                                <span>{finalPrice.toLocaleString()} AC</span>
                              </span>
                              {detailOffer.discount && isDiscountActive && !isOutOfStock ? (
                                <span className="market-modal__discount-pill">
                                  -{detailOffer.discount}%
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`btn-primary market-modal__add-btn${
                              isOutOfStock || isCartLimitReached ? ' market-modal__add-btn--disabled' : ''
                            }`}
                            disabled={isOutOfStock || isCartLimitReached}
                            onClick={() => {
                              handleAddToCart(detailOffer);
                              setDetailOffer(null);
                            }}
                          >
                            <ShoppingCart size={16} />
                            <span>
                              {isOutOfStock
                                ? 'Нет в наличии'
                                : isCartLimitReached
                                ? 'Лимит в корзине'
                                : inCart > 0
                                ? 'В корзину (+1)'
                                : 'В корзину'}
                            </span>
                          </button>
                        </div>

                        {/* Dedicated Discount Details Strip */}
                        {detailOffer.discount && isDiscountActive && !isOutOfStock ? (
                          <div className="market-modal__discount-details-strip">
                            <div className="market-modal__discount-strip-left">
                              <span className="market-modal__strip-old">
                                {detailOffer.price.toLocaleString()} AC
                              </span>
                              <span className="market-modal__strip-savings">
                                (экономия {(detailOffer.price - finalPrice).toLocaleString()} AC)
                              </span>
                            </div>
                            {detailOffer.discountExpiresAt && (
                              <span className="market-modal__strip-timer">
                                <Clock size={12} />
                                <span>до {new Date(detailOffer.discountExpiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>

                      {/* 2 Metric Cards */}
                      <div className="market-modal__metrics-grid">
                        <div className="market-metric-box">
                          <span className="market-metric-box__label">В наличии / В корзине</span>
                          <span className="market-metric-box__val">
                            {isOutOfStock
                              ? '0 шт.'
                              : `${inCart} из ${detailOffer.stock > 50 ? '∞' : detailOffer.stock} шт.`}
                          </span>
                        </div>

                        <div className="market-metric-box">
                          <span className="market-metric-box__label">
                            {isShortage ? 'Не хватает для покупки' : 'Остаток баланса'}
                          </span>
                          <span
                            className="market-metric-box__val"
                            style={{
                              color: isShortage ? 'var(--accent-negative)' : undefined,
                            }}
                          >
                            <CoinIcon size={14} />
                            <span>
                              {isShortage
                                ? `${Math.abs(balanceAfter).toLocaleString()} AC`
                                : `${balanceAfter.toLocaleString()} AC`}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* BOTTOM SECTION */}
              <div className="market-modal__bottom-grid">
                {/* Specifications */}
                <div className="market-modal__section">
                  <div>
                    <div className="market-modal__section-header">
                      <h4 className="market-modal__section-title">Specifications</h4>
                      <span className="market-modal__section-sub">Характеристики</span>
                    </div>

                    <div className="market-specs-list">
                      {(detailOffer.specs && detailOffer.specs.length > 0
                        ? detailOffer.specs
                        : defaultUnifiedAdminSpecs
                      ).map((spec, idx) => (
                        <div key={idx} className="market-spec-row">
                          <span className="market-spec-row__label">{spec.label}</span>
                          <span className="market-spec-row__value">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description & Stock */}
                <div className="market-modal__section">
                  <div>
                    <div className="market-modal__section-header">
                      <h4 className="market-modal__section-title">Описание лота</h4>
                      <span className="market-modal__section-sub">ASCENT Season One</span>
                    </div>

                    <p className="market-modal__desc-text">{detailOffer.desc}</p>
                  </div>

                  <div className="market-modal__desc-footer">
                    <span>Доступное количество:</span>
                    <span style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-primary)' }}>
                      {detailOffer.stock <= 0
                        ? 'Нет в наличии'
                        : detailOffer.stock > 50
                        ? 'Без ограничений (∞)'
                        : `${detailOffer.stock} шт. в наличии`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MarketPage;
