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
    <div class="card bg-base-100 text-primary-content w-96">
      <div class="card-body">
        <h2 class="card-title">Login!</h2>
        <form class="form-control" onSubmit={handleSubmit}>
          <label for="username" class="label">
            Username:{' '}
          </label>
          <input
            class="input input-bordered"
            name="username"
            type="text"
            onChange={(e) => setUser({
              ...user(),
              username: e.target.value,
            })
            }
            value={user().username}
          />
          <label for="password" class="label">
            Password:{' '}
          </label>
          <input
            class="input input-bordered"
            name="password"
            type="password"
            onChange={(e) => setUser({
              ...user(),
              password: e.target.value,
            })
            }
            value={user().password}
          />
          <Show when={message()}>{message()}</Show>
          <button class="btn btn-primary mt-4" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
