
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
