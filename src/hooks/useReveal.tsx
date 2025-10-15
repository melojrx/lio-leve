import { useEffect, useRef, useState } from 'react';

/**
 * Hook para animar elementos quando entram no viewport.
 * Retorna ref e boolean visible.
 */
export function useReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, [options, visible]);
  return { ref, visible } as const;
}
