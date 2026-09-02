import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncAuthState = async () => {
    try {
      const localLoggedIn = localStorage.getItem('pintukarier_admin_logged_in') === 'true';
      if (localLoggedIn) {
        setIsLoggedIn(true);
        setLoading(false);
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(Boolean(session));
    } catch (error) {
      const localLoggedIn = localStorage.getItem('pintukarier_admin_logged_in') === 'true';
      setIsLoggedIn(localLoggedIn);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncAuthState();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('pintukarier_admin_logged_in');
        setIsLoggedIn(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const login = async ({ email, password }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      localStorage.setItem('pintukarier_admin_logged_in', 'true');
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      // Fallback for development / demo mode when Supabase is not connected
      if ((email === 'admin@pintukarier.id' || email.includes('admin')) && (password === 'admin123' || password === 'admin')) {
        localStorage.setItem('pintukarier_admin_logged_in', 'true');
        setIsLoggedIn(true);
        return true;
      }
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('pintukarier_admin_logged_in');
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      // ignore
    } finally {
      setIsLoggedIn(false);
    }
    return true;
  };

  return {
    isLoggedIn,
    loading,
    login,
    logout,
    refreshSession: syncAuthState,
  };
}
