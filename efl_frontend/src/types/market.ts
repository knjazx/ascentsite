export type MarketDiscountDuration = '24h' | '3d' | '7d' | '14d' | 'custom' | 'forever';

export interface MarketOfferSpec {
  label: string;
  value: string;
}

export interface MarketOffer {
  id: string;
  title: string;
  desc: string;
  icon?: string;
  image?: string;
  price: number;
  discount?: number;
  discountDuration?: MarketDiscountDuration;
  discountExpiresAt?: string;
  stock: number;
  popularScore?: number;
  specs: MarketOfferSpec[];
}

/** Check if the offer currently has an active, unexpired discount */
export const isOfferDiscountActive = (offer: MarketOffer): boolean => {
  if (!offer.discount || offer.discount <= 0) return false;
  if (!offer.discountExpiresAt) return true;
  const exp = new Date(offer.discountExpiresAt).getTime();
  if (isNaN(exp)) return true;
  return exp > Date.now();
};

/** Get the effective final price after applying discount (if active) */
export const getOfferFinalPrice = (offer: MarketOffer): number => {
  if (!isOfferDiscountActive(offer)) return offer.price;
  const discount = Math.max(0, Math.min(99, offer.discount || 0));
  return Math.floor(offer.price * (1 - discount / 100));
};

/** Calculate ISO expiration date based on selected duration preset */
export const calculateDiscountExpiresAt = (
  duration: MarketDiscountDuration,
  customDate?: string
): string => {
  const now = Date.now();
  switch (duration) {
    case '24h':
      return new Date(now + 24 * 60 * 60 * 1000).toISOString();
    case '3d':
      return new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
    case '14d':
      return new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString();
    case 'custom':
      return customDate || '';
    case 'forever':
    default:
      return '';
  }
};

/** Human-readable status/duration text of the discount */
export const formatDiscountDurationLabel = (offer: MarketOffer): string => {
  if (!offer.discount || offer.discount <= 0) return '';
  if (!offer.discountExpiresAt) return 'Бессрочно';

  const exp = new Date(offer.discountExpiresAt).getTime();
  if (isNaN(exp)) return 'Бессрочно';

  const diff = exp - Date.now();
  if (diff <= 0) return 'Истекла';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days >= 2) {
    return `${days} дн.`;
  } else if (hours >= 1) {
    return `${hours} ч.`;
  } else {
    const mins = Math.max(1, Math.floor(diff / (1000 * 60)));
    return `${mins} мин.`;
  }
};

export type MarketOrderStatus = 'pending' | 'done';

export interface MarketOrder {
  id: string;
  title: string;
  price: number;
  date: string;
  status: MarketOrderStatus;
  statusLabel: string;
  buyerNickname?: string;
  buyerEmail?: string;
  buyerSteamUrl?: string;
}

export interface MarketTransaction {
  id: string;
  date: string;
  type: string;
  desc: string;
  amount: number;
  status: string;
}

export type MarketSubTab = 'showcase' | 'cart' | 'orders' | 'history';
export type MarketSortOption = 'popular' | 'price_asc' | 'price_desc' | 'discount';
export type MarketOrderFilter = 'all' | 'pending' | 'done';
