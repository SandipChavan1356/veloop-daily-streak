import { useCallback, useEffect, useRef, useState } from 'react';
import * as streakApi from '../../services/streakApi';
import { useToast } from '../../context/ToastContext';
import { useStreakData } from '../../context/StreakDataContext';

import StreakLoader from '../../components/DailyStreak/StreakLoader';
import StreakSkeleton from '../../components/DailyStreak/StreakSkeleton';
import StreakStage from '../../components/DailyStreak/StreakStage';
import RewardIndex from '../../components/DailyStreak/RewardIndex';
import UltimateReward from '../../components/DailyStreak/UltimateReward';
import StreakAtRisk from '../../components/DailyStreak/StreakAtRisk';
import ResetBanner from '../../components/DailyStreak/ResetBanner';
import CpaDemo from '../../components/DailyStreak/CpaDemo';
import ClaimModal from '../../components/DailyStreak/ClaimModal';
import ClaimToast from '../../components/DailyStreak/ClaimToast';
import Reveal from '../../components/common/Reveal';
import ErrorState from '../../components/common/ErrorState';

import styles from './DailyStreak.module.css';

// Doc section 92 — user-facing copy only; never the raw backend `code`.
const ERROR_COPY = {
  ALREADY_CLAIMED: 'This reward has already been claimed.',
  LOCKED: 'Your next reward is not available yet.',
  DAY_MISMATCH: "Your streak was already updated — here's the latest.",
  SEQUENCE_ERROR: 'Please claim the previous day first.',
  SESSION_REQUIRED: 'Please wait for verification to start.',
  SESSION_INVALID: 'Verification session expired. Try claiming again.',
  SESSION_TOO_EARLY: 'Please wait a moment for verification to finish.',
  SESSION_EXPIRED: 'Verification session expired. Try claiming again.',
  NOT_AUTHENTICATED: 'Please log in to continue.',
  INVALID_TOKEN: 'Please log in to continue.',
  RATE_LIMITED: "You're going a bit fast — please slow down.",
  REWARD_NOT_CONFIGURED: 'Unable to process your reward. Please try again.',
};
const friendlyError = (err) => ERROR_COPY[err?.code] || err?.message || 'Unable to process your reward. Please try again.';

// Loader (branded) -> skeleton -> page (doc sections 69, 70, 90).
const LOADER_MS = 700;
const SKELETON_MS = 350;
// How long the in-place celebration holds before the UI settles into the new backend state.
const CELEBRATE_MS = 1500;
const CELEBRATE_VIP_MS = 2100;
const FAIL_HOLD_MS = 6000;

export default function DailyStreakPage() {
  const toast = useToast();
  const { data, streak, rewards, serverTime, wallet, ves, loading, error, reload, retry } = useStreakData();
  const [phase, setPhase] = useState(data ? 'ready' : 'loader');
  const [claimingDay, setClaimingDay] = useState(null);
  const [cpaVisible, setCpaVisible] = useState(false);
  const [cpaWait, setCpaWait] = useState(3);
  const [claimResult, setClaimResult] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cpaClosing, setCpaClosing] = useState(false);
  // Claim feedback. `celebration` is set ONLY from a successful claim response.
  const [celebration, setCelebration] = useState(null); // { key, day, card, reward }
  const [claimToast, setClaimToast] = useState(null); // { key, day, reward }
  const [failDay, setFailDay] = useState(null);
  const timers = useRef([]);
  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (phase !== 'loader') return undefined;
    const t = setTimeout(() => setPhase('wait'), LOADER_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'wait' && !loading) setPhase('skeleton');
  }, [phase, loading]);

  useEffect(() => {
    if (phase !== 'skeleton') return undefined;
    const t = setTimeout(() => setPhase('ready'), SKELETON_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Doc section 48 — timer hitting zero only triggers a fresh backend check,
  // never an assumption that the claim is now allowed.
  const handleTimerComplete = useCallback(async () => {
    try {
      const status = await streakApi.getStatus();
      if (status.status === 'AVAILABLE') await reload({ silent: true });
    } catch {
      /* silent — next manual refresh will recover */
    }
  }, [reload]);

  const handleClaim = async (day) => {
    const card = rewards.find((r) => r.day === day);
    const currency = card?.reward?.currency;
    const before = wallet?.balances?.[currency] ?? 0;
    setClaimingDay(day);
    setFailDay(null);
    try {
      const initiated = await streakApi.initiateClaim(day);
      setCpaWait(initiated.minWaitSeconds || 3);
      setCpaVisible(true);

      // The CPA demo runs for its minimum duration; it never grants anything itself.
      await new Promise((resolve) => setTimeout(resolve, (initiated.minWaitSeconds || 3) * 1000 + 200));

      const result = await streakApi.claimReward(day, initiated.sessionToken);

      // The backend has now CONFIRMED the claim. Only from here may anything celebrate.
      if (!result.alreadyClaimed) {
        const key = Date.now();
        const vip = card?.reward?.assetType === 'crown';
        setCelebration({ key, day, card, reward: result.reward });
        setClaimToast({ key, day, reward: result.reward });
        const hold = vip ? CELEBRATE_VIP_MS : CELEBRATE_MS;
        // fade the celebration out first, THEN swap to the new state (no blank beat)
        later(() => setCelebration((c) => (c && c.key === key ? { ...c, leaving: true } : c)), hold - 300);
        later(() => setCelebration((c) => (c && c.key === key ? null : c)), hold);
        // verification overlay fades out over the celebration instead of vanishing
        setCpaClosing(true);
        later(() => {
          setCpaVisible(false);
          setCpaClosing(false);
        }, 260);
      } else {
        setCpaVisible(false);
      }

      // Doc section 93: re-fetch everything from the backend; no optimistic updates.
      const fresh = await reload({ silent: true }).catch(() => null);

      if (result.alreadyClaimed) {
        toast.info(friendlyError({ code: 'ALREADY_CLAIMED' }));
      } else {
        setClaimResult({
          day,
          reward: result.reward,
          assetType: card?.reward?.assetType,
          transactionId: result.transactionId,
          before,
          after: fresh ? fresh.wallet.balances?.[result.reward.currency] ?? null : null,
          streak: fresh?.data?.streak ?? result.streak ?? null,
          serverTime: fresh?.data?.serverTime ?? null,
        });
      }
    } catch (err) {
      // Failure: no celebration, the reward stays unclaimed, the button flips to "Try again".
      setCpaVisible(false);
      setCpaClosing(false);
      setFailDay(day);
      later(() => setFailDay((d) => (d === day ? null : d)), FAIL_HOLD_MS);
      toast.error(friendlyError(err));
      reload({ silent: true }).catch(() => {});
    } finally {
      setClaimingDay(null);
    }
  };

  if (phase === 'loader' || phase === 'wait') return <StreakLoader />;
  if (error && !data) {
    return (
      <div className={styles.page}>
        <ErrorState message={friendlyError(error)} onRetry={retry} />
      </div>
    );
  }
  if (phase === 'skeleton' || !data) return <StreakSkeleton />;

  const ultimate = rewards[rewards.length - 1];
  const checkedIn = streak.checkedIn;
  const completed = streak.status === 'COMPLETED' || (rewards.length > 0 && rewards.every((r) => r.status === 'CLAIMED'));

  return (
    <div className={styles.page}>
      <StreakStage
        streak={streak}
        rewards={rewards}
        serverTime={serverTime}
        onClaim={handleClaim}
        claimingDay={claimingDay}
        celebration={celebration}
        failDay={failDay}
        completed={completed}
        onTimerComplete={handleTimerComplete}
        notices={
          <>
            <ResetBanner streak={streak} />
            <StreakAtRisk streak={streak} serverTime={serverTime} onExpire={handleTimerComplete} />
          </>
        }
      />

      <Reveal i={3}>
        <RewardIndex
          rewards={rewards}
          checkedIn={checkedIn}
          total={streak.totalRewards}
          onClaim={handleClaim}
          claimingDay={claimingDay}
          celebrationDay={celebration?.day ?? null}
          failDay={failDay}
        />
      </Reveal>

      <Reveal i={4}>
        <UltimateReward reward={ultimate?.reward} unlockDay={ultimate?.day} isClaimed={ultimate?.status === 'CLAIMED'} checkedIn={checkedIn} />
      </Reveal>

      {cpaVisible && <CpaDemo minWaitSeconds={cpaWait} closing={cpaClosing} />}

      {claimToast && (
        <ClaimToast
          key={claimToast.key}
          reward={claimToast.reward}
          day={claimToast.day}
          onDetails={claimResult ? () => setDetailsOpen(true) : null}
          onClose={() => setClaimToast(null)}
        />
      )}
      {claimResult && detailsOpen && <ClaimModal result={claimResult} onClose={() => { setDetailsOpen(false); setClaimResult(null); }} />}
    </div>
  );
}
