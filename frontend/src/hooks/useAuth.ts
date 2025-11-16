import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await authService.getCurrentUser();
          setState({
            user,
            firebaseUser,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Feil ved henting av brukerdata:', error);
          setState({
            user: null,
            firebaseUser,
            isLoading: false,
            isAuthenticated: true,
          });
        }
      } else {
        setState({
          user: null,
          firebaseUser: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = await authService.signIn(email, password);
    return user;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const user = await authService.register(email, password, name);
    return user;
  };

  const signOut = async () => {
    await authService.signOut();
    setState({
      user: null,
      firebaseUser: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const updateSettings = async (
    settings: Partial<User['settings']>
  ) => {
    await authService.updateSettings(settings);
    if (state.user) {
      setState({
        ...state,
        user: {
          ...state.user,
          settings: { ...state.user.settings, ...settings },
        },
      });
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateSettings,
  };
}
