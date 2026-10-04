// Decides how much ambient motion this device should run.
//   'full' — desktop-class: drifting lights, orbit lines, sparkles, particle dust
//   'lite' — touch / ≤4 cores: static lights, no orbit spin, a handful of particles at 30fps
//   'off'  — reduced-motion, save-data or very low memory: static atmosphere only
export function motionTier() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'full';
  const mm = (q) => window.matchMedia(q).matches;
  const nav = window.navigator || {};
  if (mm('(prefers-reduced-motion: reduce)')) return 'off';
  if (nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory <= 2)) return 'off';
  if (mm('(pointer: coarse)') || (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4)) return 'lite';
  return 'full';
}
