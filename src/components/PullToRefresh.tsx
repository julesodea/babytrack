import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PullToRefreshProps {
  children: ReactNode;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const queryClient = useQueryClient();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80; // Distance needed to trigger refresh
  const MAX_PULL = 120; // Maximum pull distance

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Check if container is scrolled to top
      const scrollTop = container.scrollTop;

      if (scrollTop === 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY;
        currentY.current = startY.current;
        isPulling.current = true;
      } else {
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || !isPulling.current || startY.current === 0) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      // Only allow pull-to-refresh if we started at the top and pulling down
      if (distance > 0) {
        // Prevent default scrolling behavior
        e.preventDefault();

        // Apply resistance curve - gets harder to pull as you go further
        const resistance = Math.min(distance / 2.5, MAX_PULL);
        setPullDistance(resistance);
      }
    };

    const handleTouchEnd = async () => {
      if (startY.current === 0) return;

      const wasPulling = isPulling.current;

      startY.current = 0;
      currentY.current = 0;
      isPulling.current = false;

      // Trigger refresh if pulled beyond threshold
      if (wasPulling && pullDistance >= PULL_THRESHOLD && !isRefreshing) {
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
  }, [pullDistance, isRefreshing, queryClient]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldShowSpinner = pullDistance > 20 || isRefreshing;

  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? PULL_THRESHOLD : 0)}px`,
          opacity: shouldShowSpinner ? 1 : 0,
          transition: pullDistance === 0 ? 'height 0.3s ease-out, opacity 0.2s' : 'opacity 0.2s',
        }}
      >
        <div
          className="relative text-gray-600"
          style={{
            transform: isRefreshing ? 'none' : `scale(${progress})`,
            transition: isRefreshing ? 'transform 0.2s' : 'none',
          }}
        >
          {/* Spinner */}
          <svg
            className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              opacity: Math.max(progress, 0.3),
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
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
