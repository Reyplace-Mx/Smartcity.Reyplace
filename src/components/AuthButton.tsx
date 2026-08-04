import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, getAccessToken } from '../lib/firebase';

export function AuthButton({ onAuthChange }: { onAuthChange?: (token: string | null) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        if (onAuthChange) onAuthChange(token);
      },
      () => {
        setUser(null);
        if (onAuthChange) onAuthChange(null);
      }
    );
    return () => unsubscribe();
  }, [onAuthChange]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        if (onAuthChange) onAuthChange(result.accessToken);
        
        // Sync user with backend
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await result.user.getIdToken()}`,
          },
        });
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
        <button 
          onClick={handleLogout}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-medium text-slate-300 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin} 
      disabled={isLoggingIn}
      className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-md text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
    >
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </svg>
      {isLoggingIn ? 'Conectando...' : 'Acceder con Google'}
    </button>
  );
}
