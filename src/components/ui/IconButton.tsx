import React, { forwardRef } from 'react';

type IconButtonVariant = 'primary' | 'secondary' | 'purple' | 'mint' | 'orange' | 'ghost';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  label: string; // Required for accessibility
  children: React.ReactNode; // Icon
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-touch h-touch',
  md: 'w-touch-md h-touch-md',
  lg: 'w-touch-lg h-touch-lg',
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  sm: '[&>svg]:w-5 [&>svg]:h-5',
  md: '[&>svg]:w-6 [&>svg]:h-6',
  lg: '[&>svg]:w-7 [&>svg]:h-7',
};

const variantClasses: Record<IconButtonVariant, string> = {
  primary: `
    bg-primary text-white
    hover:bg-primary-dark
    shadow-kid hover:shadow-glow-pink
  `,
  secondary: `
    bg-white text-gray-600
    border-2 border-gray-200
    hover:border-primary hover:text-primary
    shadow-kid
  `,
  purple: `
    bg-purple text-white
    hover:bg-purple-dark
    shadow-kid hover:shadow-glow-purple
  `,
  mint: `
    bg-mint text-white
    hover:bg-mint-dark
    shadow-kid hover:shadow-glow-mint
  `,
  orange: `
    bg-orange text-white
    hover:bg-orange-dark
    shadow-kid hover:shadow-glow-orange
  `,
  ghost: `
    bg-transparent text-gray-600
    hover:bg-gray-100 hover:text-gray-800
  `,
};

/**
 * Round icon button for actions
 * Large touch targets, clear visual feedback
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      label,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={`
          inline-flex items-center justify-center
          rounded-full
          transition-all duration-normal ease-bounce-in
          active:scale-90
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          ${sizeClasses[size]}
          ${iconSizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
