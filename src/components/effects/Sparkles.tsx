import React, { useEffect, useState } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

interface SparklesProps {
  active: boolean;
  count?: number;
  duration?: number;
  colors?: string[];
  spread?: 'full' | 'center' | 'bottom';
  onComplete?: () => void;
}

const DEFAULT_COLORS = ['#FFD700', '#FFF8DC', '#FFFACD', '#F0E68C', '#FFE4B5'];

/**
 * SVG sparkle animation effect
 * Twinkling stars for magical moments
 */
export function Sparkles({
  active,
  count = 20,
  duration = 2000,
  colors = DEFAULT_COLORS,
  spread = 'full',
  onComplete,
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    // Generate sparkles with positions based on spread
    const newSparkles: Sparkle[] = Array.from({ length: count }, (_, i) => {
      let x: number;
      let y: number;

      switch (spread) {
        case 'center':
          x = 50 + (Math.random() - 0.5) * 40;
          y = 50 + (Math.random() - 0.5) * 40;
          break;
        case 'bottom':
          x = Math.random() * 100;
          y = 60 + Math.random() * 40;
          break;
        case 'full':
        default:
          x = Math.random() * 100;
          y = Math.random() * 100;
      }

      return {
        id: i,
        x,
        y,
        size: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 500,
      };
    });

    setSparkles(newSparkles);

    const timer = setTimeout(() => {
      setSparkles([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, count, duration, colors, spread, onComplete]);

  if (!active || sparkles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-celebration overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {sparkles.map((sparkle) => (
          <g
            key={sparkle.id}
            style={{
              transformOrigin: `${sparkle.x}% ${sparkle.y}%`,
              animation: `sparkle 1.5s ease-in-out ${sparkle.delay}ms infinite`,
            }}
          >
            {/* Four-pointed star */}
            <path
              d={`
                M ${sparkle.x} ${sparkle.y - sparkle.size / 100 * 1.5}
                L ${sparkle.x + sparkle.size / 100 * 0.3} ${sparkle.y}
                L ${sparkle.x} ${sparkle.y + sparkle.size / 100 * 1.5}
                L ${sparkle.x - sparkle.size / 100 * 0.3} ${sparkle.y}
                Z
                M ${sparkle.x - sparkle.size / 100 * 1.5} ${sparkle.y}
                L ${sparkle.x} ${sparkle.y - sparkle.size / 100 * 0.3}
                L ${sparkle.x + sparkle.size / 100 * 1.5} ${sparkle.y}
                L ${sparkle.x} ${sparkle.y + sparkle.size / 100 * 0.3}
                Z
              `}
              fill={sparkle.color}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default Sparkles;
