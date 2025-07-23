import { createContext, useContext, JSXElement } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createEffect } from 'solid-js/types/server';

type AuthContextValues = {
  state: UserStatus;
  setState: <T>(state: T) => void;
};

const initialUserState: UserStatus = {
  username: undefined,
  isLoggedIn: false,
};

const AuthContext = createContext<AuthContextValues>({
  state: initialUserState,
  setState: () => {},
});

const getInitialState = () => {
  const user = sessionStorage.getItem('user');

  return user ? { username: user, isLoggedIn: true } : initialUserState;
};

export function AuthProvider(props: { children: JSXElement }) {
  const [state, setState] = createStore(getInitialState());

  return (
    <AuthContext.Provider value={{ state, setState }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext: cannot find a AuthContext');
  }

  return context;
}
