import { A, useNavigate } from '@solidjs/router';
import { Show } from 'solid-js';
import { useAuthContext } from '../contexts/AuthContext';
import httpClient from '../lib/httpClient';

const Navbar = () => {
  const { state, setState } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await httpClient.delete('/session');
    setState({ user: null, loading: false });
    navigate('/', { replace: true });
  };

  return (
    <div class="navbar bg-base-100 shadow-lg">
      <div class="flex-1">
        <A class="btn btn-ghost text-xl" href={state.user ? '/main' : '/'}>
          CoffeeRoulette
        </A>
      </div>
      <div class="flex-none">
        <div class="navbar-end">
          <Show
            when={state.user}
            fallback={
              <A class="btn" href="/signin">
                Sign in
              </A>
            }
          >
            <div class="flex justify-between gap-2">
              <A class="btn" href="/settings" aria-label="Settings">
                ⚙️
              </A>
              <button class="btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
