/**
 * Profile - User Profile Settings Page
 * 
 * Features:
 * - Edit name and email
 * - Update profile image with preview
 * - Syncs updated user data to AuthContext + localStorage
 * 
 * @author Omar Tarek
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authApi } from '../lib/api';
import { Button, FormInput, Alert, AvatarUpload } from '../components/ui';
import { getErrorMessage } from '../types';
import Header from '../components/Header';



// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleImageSelect = useCallback((file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (image) formData.append('image', image);

      const response = await authApi.updateProfile(formData);
      updateUser(response.data.user);
      setMessage('Profile updated successfully!');
      showToast('Profile updated', 'success');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, image, updateUser, showToast]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />

      <main className="container-app py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            {message && <Alert variant="success" className="mb-4">{message}</Alert>}
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <AvatarUpload
                currentImage={user?.image || null}
                preview={imagePreview}
                name={user?.name || ''}
                subtext={user?.email || ''}
                onSelect={handleImageSelect}
                showChangeLink
              />

              <FormInput label="Name" value={name} onChange={setName} />
              <FormInput label="Email" type="email" value={email} onChange={setEmail} />

              <div className="pt-4">
                <Button type="submit" isLoading={isSubmitting} loadingText="Saving...">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
