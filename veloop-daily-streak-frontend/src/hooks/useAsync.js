import { useCallback, useEffect, useRef, useState } from 'react';

// Tiny data-loading hook for the read-only pages: { data, error, loading, reload }.
// `fn` must be a stable function (declared at module level or wrapped in useCallback).
export function useAsync(fn) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const alive = useRef(true);

  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    return fn()
      .then((data) => alive.current && setState({ data, error: null, loading: false }))
      .catch((err) => alive.current && setState({ data: null, error: err, loading: false }));
  }, [fn]);

  useEffect(() => {
    alive.current = true;
    run();
    return () => {
      alive.current = false;
    };
  }, [run]);

  return { ...state, reload: run };
}
