import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncAuthState = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Gagal memeriksa sesi Supabase:', error.message);
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(Boolean(session));
    } catch (error) {
      console.error('Gagal mengakses sesi autentikasi:', error.message);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncAuthState();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(Boolean(session));
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const login = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    setIsLoggedIn(true);
    return true;
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error) {
        setIsLoggedIn(false);
        return false;
      }

      setIsLoggedIn(false);
      return true;
    } catch (error) {
      setIsLoggedIn(false);
      return false;
    }
  };

  return {
    isLoggedIn,
    loading,
    login,
    logout,
    refreshSession: syncAuthState,
  };
}
