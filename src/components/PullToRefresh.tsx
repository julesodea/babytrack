import { useEffect, useRef, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PullToRefreshProps {
  children: ReactNode;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const queryClient = useQueryClient();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80; // Distance needed to trigger refresh
  const MAX_PULL = 120; // Maximum pull distance

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchId: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start if we're at the top of the page
      if (window.scrollY === 0 && !isRefreshing) {
        touchId = e.touches[0].identifier;
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      // Find the touch that started the gesture
      const touch = Array.from(e.touches).find(t => t.identifier === touchId);
      if (!touch) return;

      const currentY = touch.clientY;
      const distance = currentY - startY.current;

      // Only allow pulling down when at top of page
      if (distance > 0 && window.scrollY === 0) {
        // Prevent default scrolling behavior
        e.preventDefault();

        // Apply resistance curve - gets harder to pull as you go further
        const resistance = Math.min(distance / 2.5, MAX_PULL);
        setPullDistance(resistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      setIsPulling(false);
      touchId = null;

      // Trigger refresh if pulled beyond threshold
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);

        try {
          // Invalidate all queries to trigger refetch
          await queryClient.invalidateQueries();

          // Keep the spinner visible for a minimum time for better UX
          await new Promise(resolve => setTimeout(resolve, 500));
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Snap back if didn't reach threshold
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, queryClient]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldShowSpinner = pullDistance > 20 || isRefreshing;

  return (
    <div ref={containerRef} className="relative h-full">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity"
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? PULL_THRESHOLD : 0)}px`,
          opacity: shouldShowSpinner ? 1 : 0,
          transition: isRefreshing || !isPulling ? 'height 0.3s ease-out, opacity 0.2s' : 'opacity 0.2s',
        }}
      >
        <div
          className="relative"
          style={{
            transform: isRefreshing ? 'none' : `scale(${progress})`,
            transition: isRefreshing ? 'transform 0.2s' : 'none',
          }}
        >
          {/* Spinner */}
          <svg
            className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              opacity: progress,
            }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>

      {/* Content with offset */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
