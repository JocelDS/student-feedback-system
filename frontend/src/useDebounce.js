import { useEffect, useState } from 'react';

// Returns `value` only after it has stopped changing for `delay` ms
// (used so we don't call the API on every single keystroke).
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}