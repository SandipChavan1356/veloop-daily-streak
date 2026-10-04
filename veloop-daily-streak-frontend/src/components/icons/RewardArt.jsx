import { useId, useState } from 'react';
import { ASSETS } from '../../assets/veloop';
import Asset from '../common/Asset';
import styles from './RewardArt.module.css';

// Reward artwork. The official VELoop assets (src/assets/veloop.js) are used
// everywhere; the inline animated SVGs below remain only as a safety fallback
// (and for tiny UI glyphs like the flame badge) if an image ever fails to load.

const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, '');

/* ------------------------------------------------------------------ */
/* Official asset renderer                                            */
/* ------------------------------------------------------------------ */
// Renders the official design asset inside a `size` x `size` box using
// object-fit: contain (so any aspect ratio is preserved). If the file ever
// fails to load, the built-in SVG `fallback` is shown instead.
export function AssetOrArt({ name, size = 64, fallback, className = '', float = true }) {
  const [failed, setFailed] = useState(false);
  const a = ASSETS[name];
  if (!a || failed) return fallback;
  return (
    <Asset
      name={name}
      maxPx={size}
      decorative
      className={`${float ? styles.asset : ''} ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Sparkle helper                                                     */
/* ------------------------------------------------------------------ */
const Sparkle = ({ x, y, s = 4, fill = '#fff3d6', cls = styles.twinkle }) => (
  <path
    className={cls}
    d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`}
    fill={fill}
  />
);

/* ------------------------------------------------------------------ */
/* Coin                                                               */
/* ------------------------------------------------------------------ */
export function CoinStackSvg({ size = 64, className = '' }) {
  const id = useUid();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}f`} cx="34%" cy="28%" r="82%">
          <stop offset="0%" stopColor="#fff2bd" />
          <stop offset="45%" stopColor="#f7c94f" />
          <stop offset="100%" stopColor="#c98a1f" />
        </radialGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe9a0" />
          <stop offset="55%" stopColor="#e5a52b" />
          <stop offset="100%" stopColor="#9a5f10" />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <circle cx="32" cy="27" r="19" />
        </clipPath>
      </defs>
      <ellipse cx="32" cy="58.5" rx="17" ry="3.2" fill="#000" opacity="0.32" />
      <g className={styles.floatMed}>
        {/* stacked coin edges for depth */}
        <ellipse cx="32" cy="50" rx="19" ry="6" fill="#8a5a12" />
        <ellipse cx="32" cy="47" rx="19" ry="6" fill="#c9861c" />
        <ellipse cx="32" cy="44" rx="19" ry="6" fill="#e3a52a" />
        {/* front coin */}
        <circle cx="32" cy="27" r="20" fill={`url(#${id}r)`} />
        <circle cx="32" cy="27" r="16.6" fill={`url(#${id}f)`} stroke="#a26a14" strokeWidth="1" />
        <circle cx="32" cy="27" r="13" fill="none" stroke="#fff3c4" strokeOpacity="0.55" strokeWidth="0.8" strokeDasharray="1.6 2.4" />
        <text x="32" y="33.4" textAnchor="middle" fontSize="18" fontWeight="800" fill="#8a560f" fontFamily="Sora, sans-serif">
          V
        </text>
        <text x="32" y="32.6" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff0b8" fillOpacity="0.55" fontFamily="Sora, sans-serif">
          V
        </text>
        <path d="M17 22 A16.5 16.5 0 0 1 32 10.6" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
        <g clipPath={`url(#${id}c)`}>
          <rect className={styles.shine} x="6" y="4" width="14" height="46" fill={`url(#${id}s)`} transform="skewX(-18)" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Gift box                                                           */
/* ------------------------------------------------------------------ */
export function GiftBoxSvg({ size = 64, className = '' }) {
  const id = useUid();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b79cff" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9b6ff" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f2b53a" />
          <stop offset="50%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#e39b22" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="58.6" rx="18" ry="3" fill="#000" opacity="0.32" />
      <g className={styles.floatSlow}>
        {/* box */}
        <rect x="11" y="29" width="42" height="27" rx="3.5" fill={`url(#${id}b)`} />
        <rect x="11" y="29" width="42" height="6" fill="#000" opacity="0.14" />
        <rect x="27.5" y="29" width="9" height="27" fill={`url(#${id}g)`} />
        <path d="M11 33 h42" stroke="#fff" strokeOpacity="0.14" />
        {/* lid + bow */}
        <g className={styles.lid}>
          <rect x="8" y="21" width="48" height="10" rx="3" fill={`url(#${id}l)`} />
          <rect x="27.5" y="21" width="9" height="10" fill={`url(#${id}g)`} />
          <path d="M32 21 C 20 21 16 9 25 9.5 C 30 10 32 16 32 21 Z" fill={`url(#${id}g)`} stroke="#b9791c" strokeWidth="0.8" />
          <path d="M32 21 C 44 21 48 9 39 9.5 C 34 10 32 16 32 21 Z" fill="#ffd977" stroke="#b9791c" strokeWidth="0.8" />
          <circle cx="32" cy="21.5" r="3" fill="#ffe9a8" stroke="#b9791c" strokeWidth="0.8" />
        </g>
        <Sparkle x={9} y={16} s={3.6} />
        <Sparkle x={55} y={26} s={3} cls={styles.twinkle2} fill="#ffd977" />
        <Sparkle x={51} y={8} s={2.6} cls={styles.twinkle3} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Gift card                                                          */
/* ------------------------------------------------------------------ */
export function GiftCardSvg({ size = 64, className = '' }) {
  const id = useUid();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2b1c55" />
          <stop offset="100%" stopColor="#0d0820" />
        </linearGradient>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#b9791c" />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect x="5" y="15" width="54" height="35" rx="6" />
        </clipPath>
      </defs>
      <ellipse cx="32" cy="57" rx="19" ry="3" fill="#000" opacity="0.32" />
      <g className={styles.floatMed}>
        <g transform="rotate(-6 32 32)">
          <rect x="5" y="15" width="54" height="35" rx="6" fill={`url(#${id}b)`} stroke={`url(#${id}e)`} strokeWidth="1.6" />
          <rect x="5" y="23" width="54" height="6" fill={`url(#${id}e)`} opacity="0.9" />
          <text x="13" y="45" fontSize="12" fontWeight="800" fill="#ffe08a" fontFamily="Sora, sans-serif">
            ₹
          </text>
          <rect x="24" y="38" width="20" height="3.2" rx="1.6" fill="#cbc2df" opacity="0.7" />
          <rect x="24" y="44" width="12" height="2.6" rx="1.3" fill="#8f82ae" />
          {/* gift glyph */}
          <g transform="translate(46 36)">
            <rect x="0" y="4" width="9" height="7" rx="1" fill="#f5c451" />
            <rect x="-0.8" y="2" width="10.6" height="3" rx="1" fill="#ffd977" />
            <rect x="3.9" y="2" width="1.2" height="9" fill="#7c3aed" />
          </g>
          <g clipPath={`url(#${id}c)`}>
            <rect className={styles.shine} x="6" y="10" width="12" height="46" fill={`url(#${id}s)`} transform="skewX(-18)" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Crown (Ultimate reward)                                            */
/* ------------------------------------------------------------------ */
export function CrownSvg({ size = 160, className = '', animated = true }) {
  const id = useUid();
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}glow`} cx="50%" cy="52%" r="52%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff0b8" />
          <stop offset="45%" stopColor="#f5c451" />
          <stop offset="100%" stopColor="#b9791c" />
        </linearGradient>
        <linearGradient id={`${id}band`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c98a1f" />
          <stop offset="50%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#c98a1f" />
        </linearGradient>
        <radialGradient id={`${id}ruby`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ff9db0" />
          <stop offset="100%" stopColor="#c81e4a" />
        </radialGradient>
        <radialGradient id={`${id}sap`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#c9b6ff" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
        <radialGradient id={`${id}em`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#a7f3c0" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="108" r="92" fill={`url(#${id}glow)`} className={animated ? styles.pulseGlow : ''} />

      {/* soft rays */}
      <g className={animated ? styles.spinRays : ''} opacity="0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d="M100 108 L96 30 L104 30 Z"
            fill="#c4b0ff"
            opacity={i % 2 ? 0.1 : 0.2}
            transform={`rotate(${i * 30} 100 108)`}
          />
        ))}
      </g>

      <circle
        cx="100"
        cy="108"
        r="66"
        fill="none"
        stroke="#a78bfa"
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeDasharray="2 9"
        strokeLinecap="round"
        className={animated ? styles.spinSlow : ''}
      />
      <circle cx="100" cy="108" r="78" fill="none" stroke="#f5c451" strokeOpacity="0.18" strokeWidth="1" />

      <g className={animated ? styles.floatSlow : ''}>
        <ellipse cx="100" cy="158" rx="50" ry="9" fill="#3b0f8c" opacity="0.55" />
        {/* body */}
        <path
          d="M48 132 L56 80 L80 104 L100 62 L120 104 L144 80 L152 132 Z"
          fill={`url(#${id}gold)`}
          stroke="#8a5a12"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M100 62 L120 104 L152 132 L100 132 Z" fill="#000" opacity="0.1" />
        <path d="M60 96 L80 108" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
        {/* band */}
        <rect x="46" y="130" width="108" height="18" rx="5" fill={`url(#${id}band)`} stroke="#8a5a12" strokeWidth="2" />
        <rect x="50" y="133" width="100" height="3" rx="1.5" fill="#fff" opacity="0.35" />
        {/* jewels */}
        <circle cx="100" cy="139" r="6" fill={`url(#${id}ruby)`} stroke="#7f1234" strokeWidth="1" />
        <circle cx="72" cy="139" r="4" fill={`url(#${id}sap)`} stroke="#3b1d8f" strokeWidth="1" />
        <circle cx="128" cy="139" r="4" fill={`url(#${id}em)`} stroke="#0f5a2b" strokeWidth="1" />
        {/* tip pearls */}
        <circle cx="56" cy="79" r="6" fill="#fff8e1" stroke="#b9791c" strokeWidth="1.2" />
        <circle cx="100" cy="61" r="7.5" fill="#fff8e1" stroke="#b9791c" strokeWidth="1.2" />
        <circle cx="144" cy="79" r="6" fill="#fff8e1" stroke="#b9791c" strokeWidth="1.2" />
        <circle cx="98" cy="58.5" r="2.3" fill="#fff" />
        <Sparkle x={38} y={72} s={7} />
        <Sparkle x={166} y={64} s={6} cls={styles.twinkle2} fill="#ffd977" />
        <Sparkle x={150} y={34} s={5} cls={styles.twinkle3} />
        <Sparkle x={52} y={40} s={4.5} cls={styles.twinkle3} fill="#c4b0ff" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Calendar (hero banner)                                             */
/* ------------------------------------------------------------------ */
export function CalendarSvg({ size = 120, className = '' }) {
  const id = useUid();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2477" />
          <stop offset="100%" stopColor="#1a0f3a" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#e39b22" />
        </linearGradient>
      </defs>
      <g className={styles.floatSlow}>
        <ellipse cx="60" cy="112" rx="34" ry="5" fill="#000" opacity="0.3" />
        <rect x="16" y="22" width="88" height="82" rx="14" fill={`url(#${id}p)`} stroke={`url(#${id}g)`} strokeWidth="3" />
        <path d="M16 46 H104" stroke={`url(#${id}g)`} strokeWidth="3" />
        <rect x="36" y="10" width="7" height="22" rx="3.5" fill={`url(#${id}g)`} />
        <rect x="77" y="10" width="7" height="22" rx="3.5" fill={`url(#${id}g)`} />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <rect key={`${r}${c}`} x={26 + c * 18} y={54 + r * 15} width="11" height="9" rx="2.5" fill="#fff" opacity={r === 1 && c === 1 ? 0 : 0.12} />
          ))
        )}
        <circle cx="60" cy="76" r="15" fill={`url(#${id}g)`} />
        <path d="M52 76 l6 6 l11 -12" fill="none" stroke="#3b2205" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        <Sparkle x={104} y={30} s={7} />
        <Sparkle x={12} y={60} s={5} cls={styles.twinkle2} fill="#c4b0ff" />
        <Sparkle x={98} y={98} s={4} cls={styles.twinkle3} fill="#ffd977" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Flame (streak badge)                                               */
/* ------------------------------------------------------------------ */
export function FlameSvg({ size = 22, className = '', lit = true }) {
  const id = useUid();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}o`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={lit ? '#ff7a18' : '#6b6485'} />
          <stop offset="60%" stopColor={lit ? '#ffb02e' : '#8a83a3'} />
          <stop offset="100%" stopColor={lit ? '#ffe08a' : '#a59fbd'} />
        </linearGradient>
      </defs>
      <g className={lit ? styles.flicker : ''}>
        <path
          d="M16 2 C17 8 25 11 25 20 C25 26 21 30 16 30 C11 30 7 26 7 20 C7 16 9 14 11 12 C11 15 12 16 13.5 16 C13 11 14 6 16 2 Z"
          fill={`url(#${id}o)`}
        />
        <path
          d="M16 15 C17 18 20 19 20 23 C20 26 18 27.5 16 27.5 C14 27.5 12 26 12 23 C12 20.5 14.5 19 16 15 Z"
          fill={lit ? '#fff3c4' : '#c9c3dc'}
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */
// `float` toggles the gentle idle bob on the official art; `className` styles the <img>.
const wrap = (name, Fallback) =>
  function Art({ size = 64, float = true, className = '', animated, ...rest }) {
    return (
      <AssetOrArt
        name={name}
        size={size}
        float={float}
        className={className}
        fallback={<Fallback size={size} animated={animated} {...rest} />}
      />
    );
  };
export const CoinStack = wrap('coin', CoinStackSvg);
export const GiftBox = wrap('giftBurst', GiftBoxSvg);
export const GiftCardArt = wrap('giftCard', GiftCardSvg);
export const CrownArt = wrap('crown', CrownSvg);
export const CalendarArt = wrap('stayActive', CalendarSvg);

// Backend sends an asset *identifier* (coin | gift-box | gift-card | crown);
// the image itself is static frontend art (doc section 21).
export function assetForType(type, props = {}) {
  switch (type) {
    case 'gift-box':
      return <GiftBox {...props} />;
    case 'gift-card':
      return <GiftCardArt {...props} />;
    case 'crown':
      return <CrownArt {...props} />;
    case 'coin':
    default:
      return <CoinStack {...props} />;
  }
}
