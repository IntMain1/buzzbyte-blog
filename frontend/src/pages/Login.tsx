/**
 * Login - Authentication Page
 * 
 * Design: Split-screen layout
 * - Left: Gradient branding panel (desktop only)
 * - Right: Login form with validation
 * 
 * Uses Toast notifications for success/error feedback.
 * 
 * @author Omar Tarek
 */

import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button, FormInput, Alert } from '../components/ui';
import { getErrorMessage } from '../types';

// ─────────────────────────────────────────────────────────────
// Branding Components
// ─────────────────────────────────────────────────────────────
const BrandingPanel = () => (
  <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center p-12">
    <div className="text-center text-white">
      <h1 className="text-5xl font-bold mb-4">BuzzByte</h1>
      <p className="text-xl opacity-90">Share your thoughts with the world</p>
      <p className="mt-4 opacity-75">Posts expire in 24 hours. Make every moment count.</p>
    </div>
  </div>
);

const MobileLogo = () => (
  <div className="lg:hidden text-center mb-8">
    <h1 className="text-3xl font-bold text-indigo-600">BuzzByte</h1>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, navigate, showToast]);

  return (
    <div className="min-h-screen flex">
      <BrandingPanel />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md">
          <MobileLogo />

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Sign in to your account</p>

          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />

            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              loadingText="Signing in..."
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
