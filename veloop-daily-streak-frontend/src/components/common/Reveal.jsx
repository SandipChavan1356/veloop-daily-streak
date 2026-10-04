import { useEffect, useRef, useState } from 'react';

// Staggered entrance that waits until the section is actually near the viewport.
// Content is never blocked: no IntersectionObserver → shown immediately, and the
// transition is short (see .vl-rv in theme.css). `i` = position in the sequence.
export default function Reveal({ i = 0, as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (shown) return undefined;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -4% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag ref={ref} className={`vl-rv ${shown ? 'in' : ''} ${className}`} style={{ '--i': i }} {...rest}>
      {children}
    </Tag>
  );
}
