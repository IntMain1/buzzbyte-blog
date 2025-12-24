/**
 * Signup - User Registration Page
 * 
 * Features:
 * - Profile image upload with preview (optional)
 * - Form validation (client-side + server-side)
 * - Split-screen layout matching Login page
 * - Auto-login after successful registration
 * 
 * @author Omar Tarek
 */

import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button, FormInput, Alert, AvatarUpload } from '../components/ui';
import { getErrorMessage } from '../types';

// ─────────────────────────────────────────────────────────────
// Branding Components
// ─────────────────────────────────────────────────────────────
const BrandingPanel = () => (
  <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 items-center justify-center p-12">
    <div className="text-center text-white">
      <h1 className="text-5xl font-bold mb-4">BuzzByte</h1>
      <p className="text-xl opacity-90">Join the conversation</p>
      <p className="mt-4 opacity-75">Create ephemeral posts that matter.</p>
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
export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = useCallback((file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const validate = useCallback(() => {
    if (!name.trim()) return 'Name is required';
    if (!email.trim()) return 'Email is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== passwordConfirmation) return 'Passwords do not match';
    return null;
  }, [name, email, password, passwordConfirmation]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('password_confirmation', passwordConfirmation);
      if (image) formData.append('image', image);

      await register(formData);
      showToast('Account created successfully!', 'success');
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password, passwordConfirmation, image, validate, register, navigate, showToast]);

  return (
    <div className="min-h-screen flex">
      <BrandingPanel />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md">
          <MobileLogo />

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create account</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Start sharing your thoughts</p>

          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AvatarUpload preview={imagePreview} name={name} onSelect={handleImageSelect} />

            <FormInput label="Name" value={name} onChange={setName} placeholder="John Doe" required />
            <FormInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
            <FormInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
            <FormInput label="Confirm Password" type="password" value={passwordConfirmation} onChange={setPasswordConfirmation} placeholder="••••••••" required />

            <Button type="submit" isLoading={isLoading} loadingText="Creating account..." className="w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
