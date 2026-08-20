import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In local Docker mode, we don't have auth
    // Just set loading to false
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    throw new Error('Autenticação não disponível no modo local');
  };

  const signUp = async (email, password, name) => {
    throw new Error('Autenticação não disponível no modo local');
  };

  const signOut = async () => {
    // No-op in local mode
  };

  const getToken = async () => {
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, getToken, authAvailable: false }}>
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
