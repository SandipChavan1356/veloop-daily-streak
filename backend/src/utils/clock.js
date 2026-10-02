// Single source of "now" for every streak decision (server time is the authority).
// The offset is only ever non-zero when the dev-only time-travel route is enabled,
// which lets you test missed days without waiting 48 real hours.
let offsetMs = 0;

const now = () => new Date(Date.now() + offsetMs);
const advance = (ms) => {
  offsetMs += ms;
  return offsetMs;
};
const reset = () => {
  offsetMs = 0;
};
const getOffsetMs = () => offsetMs;

module.exports = { now, advance, reset, getOffsetMs };
