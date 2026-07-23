import { createContext, onMount, type ParentProps, useContext } from 'solid-js';
import { createStore, type SetStoreFunction } from 'solid-js/store';
import httpClient from '../lib/httpClient';
import type { User } from '../types';

type AuthState = {
  user: User | null;
  loading: boolean;
};

type AuthContextValues = {
  state: AuthState;
  setState: SetStoreFunction<AuthState>;
};

const AuthContext = createContext<AuthContextValues>();

export function AuthProvider(props: ParentProps) {
  const [state, setState] = createStore<AuthState>({ user: null, loading: true });

  onMount(async () => {
    try {
      setState({ user: await httpClient.get<User>('/me') });
    } catch {
      setState({ user: null });
    } finally {
      setState({ loading: false });
    }
  });

  return <AuthContext.Provider value={{ state, setState }}>{props.children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider');

  return context;
}
