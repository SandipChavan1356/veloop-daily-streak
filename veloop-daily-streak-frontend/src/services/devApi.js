import api from './api';

// DEV ONLY — these routes exist on the backend only when ENABLE_DEV_TOOLS=true
// (and never in production). They move the SERVER's clock, not the browser's,
// so the 24h timer and missed-day reset can be demoed without waiting.
export const timeTravel = (hours) => api.post('/dev/time-travel', { hours }).then((r) => r.data);
export const timeReset = () => api.post('/dev/time-reset').then((r) => r.data);
