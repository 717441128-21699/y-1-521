import { useEffect, useRef, useState } from 'react';

export function AnimatedNumber({ value, duration = 800, prefix = '', suffix = '', decimals = 0 }: {
  value: number; duration?: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    const start = startRef.current ?? 0;
    startTime.current = performance.now();
    let raf = 0;
    const animate = (now: number) => {
      const elapsed = now - (startTime.current || now);
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (value - start) * eased);
      if (t < 1) {
        startRef.current = start + (value - start) * eased;
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className="animate-number tabular-nums">
      {prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

export default AnimatedNumber;
