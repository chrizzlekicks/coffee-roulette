import { useNavigate } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import { useAuthContext } from '../contexts/AuthContext';
import httpClient from '../lib/httpClient';
import type { Credentials, User } from '../types';

const initialCredentials: Credentials = { username: '', password: '' };

const Login = () => {
  const { setState } = useAuthContext();
  const [credentials, setCredentials] = createSignal(initialCredentials);
  const [message, setMessage] = createSignal('');
  const navigate = useNavigate();

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    try {
      const user = await httpClient.post<User>('/session', credentials());
      setState({ user, loading: false });
      setCredentials(initialCredentials);
      navigate('/main', { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in');
    }
  };

  return (
    <div class="w-full">
      <form class="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            class="input input-bordered w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            onInput={(event) =>
              setCredentials({ ...credentials(), username: event.currentTarget.value })
            }
            value={credentials().username}
            required
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            class="input input-bordered w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            onInput={(event) =>
              setCredentials({ ...credentials(), password: event.currentTarget.value })
            }
            value={credentials().password}
            required
          />
        </div>
        <Show when={message()}>
          <div class="alert alert-error text-sm">{message()}</div>
        </Show>
        <button
          class="btn btn-primary w-full text-white font-semibold text-base h-12"
          type="submit"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default Login;
