import { ASSETS } from '../../assets/veloop';

// One official asset, optimised:
//  • <picture> AVIF → WebP fallback, each with a width ladder (srcset)
//  • `maxPx` = the largest CSS width it is painted at → `sizes`, so a 66px
//    trail icon never downloads the 860px file the 322px crown needs
//  • lazy by default; `eager` for above-the-fold, `priority` for the LCP image
//  • intrinsic width/height reserve the box (no layout shift); never stretched
export default function Asset({ name, className = '', style, decorative = true, alt, eager = false, priority = false, maxPx, sizes, ...rest }) {
  const a = ASSETS[name];
  if (!a) return null;
  const s = sizes || `${Math.min(maxPx || 240, a.w)}px`;
  return (
    <picture>
      <source type="image/avif" srcSet={a.avif} sizes={s} />
      <img
        src={a.src}
        srcSet={a.webp}
        sizes={s}
        width={a.w}
        height={a.h}
        alt={decorative ? '' : alt ?? a.alt}
        aria-hidden={decorative ? 'true' : undefined}
        className={className}
        style={style}
        draggable="false"
        decoding="async"
        loading={eager || priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        {...rest}
      />
    </picture>
  );
}
