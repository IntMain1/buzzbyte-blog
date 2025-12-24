/**
 * AvatarUpload - Reusable Image Upload Component
 * 
 * Used in Signup and Profile pages for selecting profile images.
 * 
 * Features:
 * - Click avatar to trigger file picker
 * - Supports preview (base64) and existing image URL
 * - Customizable label text
 * - Hidden file input with ref forwarding
 * 
 * @author Omar Tarek
 */

import { useRef } from 'react';
import { Avatar } from './Avatar';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface AvatarUploadProps {
    /** Base64 preview of selected file */
    preview: string | null;
    /** Existing image URL (for edit mode) */
    currentImage?: string | null;
    /** Name for avatar fallback initials */
    name: string;
    /** Callback when file is selected */
    onSelect: (file: File) => void;
    /** Label text below avatar */
    label?: string;
    /** Show "Change photo" link */
    showChangeLink?: boolean;
    /** Additional info to display (e.g., email) */
    subtext?: string;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function AvatarUpload({
    preview,
    currentImage,
    name,
    onSelect,
    label = 'Profile photo (optional)',
    showChangeLink = false,
    subtext,
}: AvatarUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onSelect(file);
    };

    const triggerPicker = () => inputRef.current?.click();

    // Use preview if available, otherwise fall back to current image
    const displayImage = preview || currentImage || null;

    return (
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
            <Avatar
                src={displayImage}
                name={name || '+'}
                size="xl"
                onClick={triggerPicker}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 cursor-pointer transition-colors"
            />

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />

            <div className="text-center sm:text-left">
                {showChangeLink ? (
                    <>
                        <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
                        {subtext && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{subtext}</p>
                        )}
                        <button
                            type="button"
                            onClick={triggerPicker}
                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                            Change photo
                        </button>
                    </>
                ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                )}
            </div>
        </div>
    );
}
