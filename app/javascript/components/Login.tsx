import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import httpClient from '../lib/httpClient';
import createPayload from '../lib/createPayload';
import { useAuthContext } from '../contexts/AuthContext';

const initialPayload: User = {
  password: '',
  username: '',
};
const Login = () => {
  const { setState } = useAuthContext();
  const [user, setUser] = createSignal(initialPayload);
  const [message, setMessage] = createSignal('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    return httpClient
      .post('/login', createPayload(user(), 'user'))
      .then((data: { username: string; message: string }) => {
        setState((prevState: UserStatus) => ({
          ...prevState,
          username: data.username,
          isLoggedIn: true,
        }));
        sessionStorage.setItem('user', data.username);
        setUser(initialPayload);
        navigate('/main', { replace: true });
      })
      .catch((error: Error) => {
        setMessage(error.message);
      })
      .finally(() => {
        setTimeout(() => setMessage(''), 3000);
      });
  };

  return (
    <div class="w-full">
      <form class="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            Email or Username
          </label>
          <input
            class="input input-bordered w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
            name="username"
            type="text"
            placeholder="Enter your username"
            onChange={(e) => setUser({
              ...user(),
              username: e.target.value,
            })
            }
            value={user().username}
            required
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            class="input input-bordered w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
            name="password"
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setUser({
              ...user(),
              password: e.target.value,
            })
            }
            value={user().password}
            required
          />
        </div>
        <Show when={message()}>
          <div class="alert alert-error text-sm">{message()}</div>
        </Show>
        <button class="btn btn-primary w-full text-white font-semibold text-base h-12" type="submit">
          Continue
        </button>
      </form>
    </div>
  );
};

export default Login;
