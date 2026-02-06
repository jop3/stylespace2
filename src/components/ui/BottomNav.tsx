import React from 'react';
import { NavIcon } from './NavIcon';
import type { NavIconType } from './NavIcon';
import type { Screen } from '../../styles/kidTheme';

interface NavItem {
  id: Screen;
  icon: NavIconType;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'closet', icon: 'closet', label: 'Closet' },
  { id: 'dress-up', icon: 'sparkle', label: 'Dress Up' },
  { id: 'play', icon: 'star', label: 'Play' },
  { id: 'gallery', icon: 'heart', label: 'Gallery' },
];

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

/**
 * Kid-friendly bottom navigation bar
 * Large touch targets, clear icons, simple labels
 */
export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="glass border-t border-gray-200/50">
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  nav-item flex-1 py-3
                  ${isActive ? 'nav-item-active' : ''}
                `}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Go to ${item.label}`}
              >
                <div
                  className={`
                    transition-transform duration-normal
                    ${isActive ? 'scale-110' : 'scale-100'}
                  `}
                >
                  <NavIcon
                    type={item.icon}
                    size={28}
                    className={isActive ? 'text-primary' : 'text-gray-400'}
                  />
                </div>
                <span
                  className={`
                    text-kid-xs font-semibold mt-1
                    ${isActive ? 'text-primary' : 'text-gray-500'}
                  `}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
