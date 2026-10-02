import { ASSETS } from '../../assets/veloop';

// One official asset, rendered with its real aspect ratio (never stretched).
// Pass `decorative` for purely ornamental art so screen readers skip it.
export default function Asset({ name, className = '', style, decorative = true, alt, eager = false, ...rest }) {
  const a = ASSETS[name];
  if (!a) return null;
  return (
    <img
      src={a.src}
      width={a.w}
      height={a.h}
      alt={decorative ? '' : alt ?? a.alt}
      aria-hidden={decorative ? 'true' : undefined}
      className={className}
      style={style}
      draggable="false"
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      {...rest}
    />
  );
}
