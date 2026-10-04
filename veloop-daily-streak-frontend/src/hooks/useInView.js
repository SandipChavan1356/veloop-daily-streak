import { useEffect, useState } from 'react';

// True while the element is (nearly) on screen. Used to pause decorative CSS
// animations that are scrolled away — there is no reason to animate what nobody sees.
export function useInView(ref, rootMargin = '160px') {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
