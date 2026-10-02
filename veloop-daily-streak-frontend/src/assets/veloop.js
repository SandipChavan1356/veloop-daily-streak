// Official VELoop design assets (optimised WebP derivatives of the supplied PNGs,
// transparent margins trimmed). Originals stay in /public/assets/VELoop assests.
// w/h are the intrinsic pixel size — used for width/height attrs so layout never
// shifts and the art is never stretched.
const base = '/assets/veloop';

export const ASSETS = {
  coin: { src: `${base}/ves-coin.webp`, w: 640, h: 512, alt: 'VES coins' },
  giftBurst: { src: `${base}/day-4.webp`, w: 760, h: 717, alt: 'Gift box with an Amazon gift card' },
  giftCard: { src: `${base}/day-5.webp`, w: 760, h: 497, alt: 'Amazon gift card' },
  crown: { src: `${base}/day-7.webp`, w: 860, h: 684, alt: 'Ultimate reward crown' },
  exclusive: { src: `${base}/exclusive-reward.webp`, w: 640, h: 494, alt: 'Exclusive reward gift box' },
  flame: { src: `${base}/flame.webp`, w: 579, h: 720, alt: 'Streak flame' },
  mobileHero: { src: `${base}/mobile-hero.webp`, w: 1400, h: 478, alt: 'Login daily and earn bigger rewards' },
  stayActive: { src: `${base}/stay-active.webp`, w: 640, h: 629, alt: 'Calendar check-in' },
  heroGift: { src: `${base}/top-left.webp`, w: 900, h: 592, alt: 'Gift box with coins' },
  heroCrown: { src: `${base}/top-right.webp`, w: 900, h: 501, alt: 'Crown on a podium with coins and gems' },
  trust: { src: `${base}/trust.webp`, w: 560, h: 462, alt: 'Verified shield' },
  biggerStreak: { src: `${base}/bigger-streak.webp`, w: 640, h: 632, alt: 'Growing rewards chart' },
};

// Backend sends an asset *identifier*; this maps it to official art.
export const ASSET_FOR_TYPE = {
  coin: 'coin',
  'gift-box': 'giftBurst',
  'gift-card': 'giftCard',
  crown: 'crown',
};
