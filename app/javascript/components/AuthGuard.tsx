import { Show } from 'solid-js';
import { useAuthContext } from '../contexts/AuthContext';
import Home from '../pages/Home';

function AuthGuard(props) {
  const { state } = useAuthContext();

  return (
    <Show when={state.isLoggedIn} fallback={<Home />}>
      {props.children}
    </Show>
  );
}

export default AuthGuard;
