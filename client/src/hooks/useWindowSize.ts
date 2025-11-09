/**
 * useWindowSize Hook
 *
 * Custom React hook to track window dimensions
 * Useful for responsive confetti effects and other dynamic layouts
 *
 * Features:
 * - Returns current window width and height
 * - Updates on window resize events
 * - Automatically cleans up event listeners
 * - TypeScript typed for safety
 *
 * Usage:
 * ```tsx
 * const { width, height } = useWindowSize();
 * ```
 */

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Handler to update window size
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler immediately to set initial size
    handleResize();

    // Cleanup: remove event listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array means this effect runs once on mount

  return windowSize;
}
