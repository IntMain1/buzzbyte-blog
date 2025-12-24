/**
 * TokenService - Secure JWT Token Management
 * 
 * This service provides a secure approach to token storage:
 * - Access tokens stored in memory (not localStorage) - immune to XSS
 * - Refresh tokens should be stored in HttpOnly cookies (handled by backend)
 * 
 * Note: Full security requires backend changes to use HttpOnly cookies.
 * See BACKEND_REQUIREMENTS.md for implementation details.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface TokenData {
  accessToken: string;
  expiresAt: number; // Unix timestamp
}

interface User {
  id: number;
  name: string;
  email: string;
  image: string | null;
}

type TokenChangeCallback = (token: string | null) => void;

// ─────────────────────────────────────────────────────────────
// Storage Keys (for fallback/hybrid mode)
// ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

// ─────────────────────────────────────────────────────────────
// Token Service Class
// ─────────────────────────────────────────────────────────────

class TokenService {
  // In-memory token storage (primary - secure)
  private tokenData: TokenData | null = null;
  
  // User data (can be in memory or localStorage)
  private userData: User | null = null;
  
  // Subscribers for token changes
  private listeners: Set<TokenChangeCallback> = new Set();
  
  // Configuration
  private useLocalStorageFallback: boolean;
  
  constructor(useLocalStorageFallback = true) {
    this.useLocalStorageFallback = useLocalStorageFallback;
    this.initializeFromStorage();
  }

  // ─────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────

  private initializeFromStorage(): void {
    if (!this.useLocalStorageFallback) return;
    
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (storedToken) {
        // In fallback mode, we don't have expiry info from localStorage
        this.tokenData = {
          accessToken: storedToken,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Assume 24h expiry
        };
      }
      
      if (storedUser) {
        this.userData = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Failed to initialize from storage:', error);
      this.clear();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Token Management
  // ─────────────────────────────────────────────────────────────

  /**
   * Store access token and user data
   */
  setToken(accessToken: string, expiresIn?: number, user?: User): void {
    const expiresAt = expiresIn 
      ? Date.now() + expiresIn * 1000 
      : Date.now() + 15 * 60 * 1000; // Default 15 min

    this.tokenData = { accessToken, expiresAt };
    
    if (user) {
      this.userData = user;
    }

    // Fallback: also store in localStorage (less secure but persistent)
    if (this.useLocalStorageFallback) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
    }

    this.notifyListeners(accessToken);
  }

  /**
   * Get current access token if not expired
   */
  getToken(): string | null {
    if (!this.tokenData) return null;
    
    // Check if token is expired (with 30s buffer)
    if (Date.now() >= this.tokenData.expiresAt - 30000) {
      return null; // Token expired, need refresh
    }
    
    return this.tokenData.accessToken;
  }

  /**
   * Get raw token without expiry check (for refresh flow)
   */
  getRawToken(): string | null {
    return this.tokenData?.accessToken ?? null;
  }

  /**
   * Check if token exists and is valid
   */
  hasValidToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Check if token needs refresh soon (within 5 minutes)
   */
  needsRefresh(): boolean {
    if (!this.tokenData) return false;
    return Date.now() >= this.tokenData.expiresAt - 5 * 60 * 1000;
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry(): number {
    if (!this.tokenData) return 0;
    return Math.max(0, Math.floor((this.tokenData.expiresAt - Date.now()) / 1000));
  }

  // ─────────────────────────────────────────────────────────────
  // User Management
  // ─────────────────────────────────────────────────────────────

  getUser(): User | null {
    return this.userData;
  }

  updateUser(user: User): void {
    this.userData = user;
    if (this.useLocalStorageFallback) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Clear / Logout
  // ─────────────────────────────────────────────────────────────

  clear(): void {
    this.tokenData = null;
    this.userData = null;
    
    if (this.useLocalStorageFallback) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }

    this.notifyListeners(null);
  }

  // ─────────────────────────────────────────────────────────────
  // Subscription / Observers
  // ─────────────────────────────────────────────────────────────

  subscribe(callback: TokenChangeCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(token: string | null): void {
    this.listeners.forEach((callback) => callback(token));
  }
}

// ─────────────────────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────────────────────

/**
 * Default token service instance
 * Uses localStorage fallback for persistence until backend implements HttpOnly cookies
 */
export const tokenService = new TokenService(true);

/**
 * Create a new token service instance with custom config
 */
export const createTokenService = (useLocalStorageFallback = true): TokenService => {
  return new TokenService(useLocalStorageFallback);
};

export default tokenService;
