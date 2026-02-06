import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * Kid-friendly card component
 * Rounded corners, soft shadows, optional hover effects
 */
export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'md',
}: CardProps) {
  const isInteractive = onClick || hoverable;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`
        bg-white rounded-kid-lg shadow-kid
        border border-gray-100
        transition-all duration-normal
        ${paddingClasses[padding]}
        ${isInteractive ? 'hover:shadow-kid-lg hover:-translate-y-0.5 cursor-pointer' : ''}
        ${onClick ? 'text-left w-full' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`font-bold text-kid-lg text-gray-800 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`text-kid-sm text-gray-600 ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`flex items-center gap-2 mt-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function CardImage({ src, alt, className = '' }: CardImageProps) {
  return (
    <div className={`-mx-4 -mt-4 mb-4 overflow-hidden rounded-t-kid-lg ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </div>
  );
}

export default Card;
