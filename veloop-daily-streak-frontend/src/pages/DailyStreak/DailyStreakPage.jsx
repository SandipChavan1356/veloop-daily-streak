import { useCallback, useEffect, useState } from 'react';
import * as streakApi from '../../services/streakApi';
import { useToast } from '../../context/ToastContext';
import { useStreakData } from '../../context/StreakDataContext';

import StreakLoader from '../../components/DailyStreak/StreakLoader';
import StreakSkeleton from '../../components/DailyStreak/StreakSkeleton';
import StreakStage from '../../components/DailyStreak/StreakStage';
import StreakJourney from '../../components/DailyStreak/StreakJourney';
import RewardVault from '../../components/DailyStreak/RewardVault';
import UltimateReward from '../../components/DailyStreak/UltimateReward';
import StreakAtRisk from '../../components/DailyStreak/StreakAtRisk';
import ResetBanner from '../../components/DailyStreak/ResetBanner';
import CpaDemo from '../../components/DailyStreak/CpaDemo';
import ClaimModal from '../../components/DailyStreak/ClaimModal';
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

export default function DailyStreakPage() {
  const toast = useToast();
  const { data, streak, rewards, serverTime, wallet, ves, loading, error, reload, retry } = useStreakData();
  const [phase, setPhase] = useState(data ? 'ready' : 'loader');
  const [claimingDay, setClaimingDay] = useState(null);
  const [cpaVisible, setCpaVisible] = useState(false);
  const [cpaWait, setCpaWait] = useState(3);
  const [justClaimedDay, setJustClaimedDay] = useState(null);
  const [claimResult, setClaimResult] = useState(null);

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
    try {
      const initiated = await streakApi.initiateClaim(day);
      setCpaWait(initiated.minWaitSeconds || 3);
      setCpaVisible(true);

      // The CPA demo runs for its minimum duration; it never grants anything itself.
      await new Promise((resolve) => setTimeout(resolve, (initiated.minWaitSeconds || 3) * 1000 + 200));

      const result = await streakApi.claimReward(day, initiated.sessionToken);
      setCpaVisible(false);

      // Doc section 93: re-fetch everything from the backend; no optimistic updates.
      const fresh = await reload({ silent: true }).catch(() => null);

      if (result.alreadyClaimed) {
        toast.info(friendlyError({ code: 'ALREADY_CLAIMED' }));
      } else {
        setJustClaimedDay(day);
        setTimeout(() => setJustClaimedDay(null), 800);
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
      setCpaVisible(false);
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
        claiming={claimingDay != null}
        completed={completed}
        onTimerComplete={handleTimerComplete}
        burstKey={justClaimedDay}
        notices={
          <>
            <ResetBanner streak={streak} />
            <StreakAtRisk streak={streak} serverTime={serverTime} onExpire={handleTimerComplete} />
          </>
        }
      />

      <StreakJourney rewards={rewards} checkedIn={checkedIn} total={streak.totalRewards} onClaim={handleClaim} claimingDay={claimingDay} />

      <RewardVault rewards={rewards} streak={streak} />

      <UltimateReward reward={ultimate?.reward} unlockDay={ultimate?.day} isClaimed={ultimate?.status === 'CLAIMED'} checkedIn={checkedIn} />

      {cpaVisible && <CpaDemo minWaitSeconds={cpaWait} />}
      {claimResult && <ClaimModal result={claimResult} onClose={() => setClaimResult(null)} />}
    </div>
  );
}
