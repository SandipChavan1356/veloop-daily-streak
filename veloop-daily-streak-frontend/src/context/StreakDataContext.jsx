import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as streakApi from '../services/streakApi';
import { useToast } from './ToastContext';

// The single client-side cache of BACKEND state (streak + wallet). Nothing in
// here computes anything: it stores what the API returned and re-fetches after
// every mutation. The top bar, sidebar, dashboard and streak page all read
// the same copy, so the gem balance and streak badge can never disagree.
const StreakDataContext = createContext(null);

export function StreakDataProvider({ children }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const shownResetToast = useRef(false);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setError(null);
      try {
        const [streakRes, walletRes] = await Promise.all([streakApi.getDailyStreak(), streakApi.getWallet()]);
        setData(streakRes);
        setWallet(walletRes);
        if (streakRes.streak.wasReset && !shownResetToast.current) {
          shownResetToast.current = true;
          toast.info('Your streak was reset — starting fresh from Day 1.');
        }
        if (!streakRes.streak.wasReset) shownResetToast.current = false;
        return { data: streakRes, wallet: walletRes };
      } catch (err) {
        if (!silent) setError(err);
        throw err;
      }
    },
    [toast]
  );

  useEffect(() => {
    let alive = true;
    load()
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  const value = useMemo(
    () => ({
      data,
      streak: data?.streak ?? null,
      rewards: data?.rewards ?? [],
      serverTime: data?.serverTime ?? null,
      wallet,
      ves: wallet?.balances?.VES ?? null,
      inr: wallet?.balances?.INR ?? null,
      loading,
      error,
      reload: load,
      retry: () => {
        setLoading(true);
        return load()
          .catch(() => {})
          .finally(() => setLoading(false));
      },
    }),
    [data, wallet, loading, error, load]
  );

  return <StreakDataContext.Provider value={value}>{children}</StreakDataContext.Provider>;
}

export const useStreakData = () => {
  const ctx = useContext(StreakDataContext);
  if (!ctx) throw new Error('useStreakData must be used within StreakDataProvider');
  return ctx;
};
