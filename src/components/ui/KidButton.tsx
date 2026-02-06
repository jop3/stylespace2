import React, { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'purple' | 'mint' | 'orange' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface KidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-touch px-4 text-kid-sm',
  md: 'h-touch-md px-6 text-kid-base',
  lg: 'h-touch-lg px-8 text-kid-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-primary text-white
    hover:bg-primary-dark
    shadow-kid hover:shadow-glow-pink
    active:shadow-kid
  `,
  secondary: `
    bg-white text-gray-700
    border-2 border-gray-200
    hover:border-primary hover:text-primary
    shadow-kid
  `,
  purple: `
    bg-purple text-white
    hover:bg-purple-dark
    shadow-kid hover:shadow-glow-purple
    active:shadow-kid
  `,
  mint: `
    bg-mint text-white
    hover:bg-mint-dark
    shadow-kid hover:shadow-glow-mint
    active:shadow-kid
  `,
  orange: `
    bg-orange text-white
    hover:bg-orange-dark
    shadow-kid hover:shadow-glow-orange
    active:shadow-kid
  `,
  ghost: `
    bg-transparent text-gray-600
    hover:bg-gray-100 hover:text-gray-800
  `,
};

/**
 * Kid-friendly button component
 * Large touch targets (48px min), rounded corners, satisfying feedback
 */
export const KidButton = forwardRef<HTMLButtonElement, KidButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          font-bold rounded-kid-lg
          transition-all duration-normal ease-bounce-in
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="animate-spin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="60"
                strokeDashoffset="20"
              />
            </svg>
          </span>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!loading && rightIcon}
      </button>
    );
  }
);

KidButton.displayName = 'KidButton';

export default KidButton;
