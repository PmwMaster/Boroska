import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authAvailable, setAuthAvailable] = useState(true);

  useEffect(() => {
    // Check if Supabase Auth is available
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error && error.message.includes('Auth')) {
          console.warn('Supabase Auth not available:', error.message);
          setAuthAvailable(false);
        }
        setUser(session?.user ?? null);
      } catch (e) {
        console.warn('Auth check failed:', e.message);
        setAuthAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = data.subscription;
    } catch (e) {
      console.warn('Auth listener failed:', e.message);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!authAvailable) {
      throw new Error('Autenticação não disponível. Configure o Supabase Auth.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, name) => {
    if (!authAvailable) {
      throw new Error('Autenticação não disponível. Configure o Supabase Auth.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!authAvailable) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const getToken = async () => {
    if (!authAvailable) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, getToken, authAvailable }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
