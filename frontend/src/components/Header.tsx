/**
 * Header Component - Main Navigation Bar
 * 
 * Features:
 * - Responsive design (mobile/desktop)
 * - Dark mode toggle with localStorage persistence
 * - User dropdown menu with auth actions
 * - Glassmorphism effect (backdrop-blur)
 * 
 * Pattern: Component Composition
 * - Icons, Logo, NavLink, DropdownItem as sub-components
 * 
 * @author Omar Tarek
 */

import { useState, useCallback } from 'react';
import { Link, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks';
import { Avatar } from './ui';

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
const ChevronIcon = () => (
  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-lg">B</span>
    </div>
    <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">BuzzByte</span>
  </Link>
);

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
        ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-800'
      }`
    }
  >
    {children}
  </RouterNavLink>
);

const DarkModeToggle = ({ isDark, toggle }: { isDark: boolean; toggle: () => void }) => (
  <button
    onClick={toggle}
    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {isDark ? <SunIcon /> : <MoonIcon />}
  </button>
);

const DropdownItem = ({ to, onClick, children, variant = 'default' }: {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}) => {
  const baseClass = 'block w-full px-4 py-2 text-left text-sm transition';
  const colorClass = variant === 'danger'
    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700';

  if (to) {
    return <Link to={to} className={`${baseClass} ${colorClass}`}>{children}</Link>;
  }
  return <button onClick={onClick} className={`${baseClass} ${colorClass}`}>{children}</button>;
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleDropdown = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
      <div className="container-app h-16 flex items-center justify-between relative">
        <div className="flex items-center">
          <Logo />
        </div>

        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <NavLink to="/">Feed</NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <DarkModeToggle isDark={isDark} toggle={toggleDarkMode} />

          {isAuthenticated && user ? (
            <div className="relative">
              <button onClick={toggleDropdown} className="flex items-center gap-2 focus:outline-none">
                <Avatar src={user.image} name={user.name} size="sm" />
                <span className="hidden sm:inline text-gray-700 dark:text-gray-300 font-medium">{user.name}</span>
                <ChevronIcon />
              </button>

              {isOpen && (
                <>
                  <div className="fixed inset-0" onClick={closeDropdown} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1">
                    <DropdownItem to="/profile">Profile</DropdownItem>
                    <DropdownItem to="/tags">Manage Tags</DropdownItem>
                    <hr className="my-1 border-gray-100 dark:border-slate-700" />
                    <DropdownItem onClick={handleLogout} variant="danger">Sign Out</DropdownItem>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
