import React, { useEffect, useRef, useCallback } from 'react';

interface ConfettiPiece {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  velocityX: number;
  velocityY: number;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'triangle';
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  pieceCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

const DEFAULT_COLORS = [
  '#FF6B9D', // Pink
  '#7C3AED', // Purple
  '#10B981', // Green
  '#F59E0B', // Orange
  '#3B82F6', // Blue
  '#FFB4CC', // Light pink
  '#FCD34D', // Light orange
];

/**
 * Canvas-based confetti effect
 * Performant particle system for celebrations
 */
export function Confetti({
  active,
  duration = 3000,
  pieceCount = 100,
  colors = DEFAULT_COLORS,
  onComplete,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const createPiece = useCallback(
    (canvas: HTMLCanvasElement): ConfettiPiece => {
      const shapes: ConfettiPiece['shape'][] = ['square', 'circle', 'triangle'];
      return {
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        velocityX: (Math.random() - 0.5) * 6,
        velocityY: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };
    },
    [colors]
  );

  const drawPiece = useCallback((ctx: CanvasRenderingContext2D, piece: ConfettiPiece) => {
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate((piece.rotation * Math.PI) / 180);
    ctx.fillStyle = piece.color;

    switch (piece.shape) {
      case 'square':
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -piece.size / 2);
        ctx.lineTo(piece.size / 2, piece.size / 2);
        ctx.lineTo(-piece.size / 2, piece.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }, []);

  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw pieces
      piecesRef.current.forEach((piece) => {
        // Apply gravity and drag
        piece.velocityY += 0.1;
        piece.velocityX *= 0.99;

        // Update position
        piece.x += piece.velocityX;
        piece.y += piece.velocityY;
        piece.rotation += piece.rotationSpeed;

        // Add slight sway
        piece.x += Math.sin(piece.y * 0.02) * 0.5;

        // Draw with fade out
        ctx.globalAlpha = 1 - progress * 0.5;
        drawPiece(ctx, piece);
      });

      // Continue animation or complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        piecesRef.current = [];
        startTimeRef.current = null;
        onComplete?.();
      }
    },
    [duration, drawPiece, onComplete]
  );

  useEffect(() => {
    if (!active) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create confetti pieces
    piecesRef.current = Array.from({ length: pieceCount }, () => createPiece(canvas));

    // Start animation
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, pieceCount, createPiece, animate]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-celebration"
      aria-hidden="true"
    />
  );
}

export default Confetti;
