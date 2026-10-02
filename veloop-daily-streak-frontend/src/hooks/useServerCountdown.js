import { useEffect, useMemo, useRef, useState } from 'react';

// A countdown that trusts the BACKEND's clock, not the device's.
// We compute a one-time offset between the server's reported time and the
// device's Date.now() when data arrives, then tick locally using that offset.
// If the user sets their system clock forward, the offset absorbs it —
// the visual countdown still reflects real elapsed time, not the tampered
// clock (doc section 46-47). This is cosmetic either way: the backend
// re-validates independently on every claim regardless of what the UI shows.
export function useServerCountdown(serverTimeIso, targetIso, { onComplete } = {}) {
  const offsetRef = useRef(0);

  useEffect(() => {
    if (serverTimeIso) {
      const serverNow = new Date(serverTimeIso).getTime();
      offsetRef.current = serverNow - Date.now();
    }
  }, [serverTimeIso]);

  const targetMs = useMemo(() => (targetIso ? new Date(targetIso).getTime() : null), [targetIso]);
  const [remainingMs, setRemainingMs] = useState(() => (targetMs ? targetMs - (Date.now() + offsetRef.current) : 0));
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    if (!targetMs) {
      setRemainingMs(0);
      return undefined;
    }

    const tick = () => {
      const approxServerNow = Date.now() + offsetRef.current;
      const next = targetMs - approxServerNow;
      setRemainingMs(next);
      if (next <= 0 && !completedRef.current) {
        completedRef.current = true;
        if (onComplete) onComplete();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMs]);

  const clamped = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return {
    remainingMs: clamped,
    isDone: clamped <= 0,
    label: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    hours,
    minutes,
    seconds,
  };
}
