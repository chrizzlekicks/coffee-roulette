import { createSignal, Show } from 'solid-js';
import httpClient from '../lib/httpClient';
import createPayload from '../lib/createPayload';

const initialPayload: NewUser = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const Signup = () => {
  const [newUser, setNewUser] = createSignal(initialPayload);
  const [message, setMessage] = createSignal('');

  const handleSubmit = (e) => {
    e.preventDefault();

    return httpClient
      .post('/users', createPayload(newUser(), 'user'))
      .then((data: NewUser) => {
        setMessage(`The user ${data.username} was created successfully`);
        setNewUser(initialPayload);
      })
      .catch((error: Error) => {
        setMessage(error.message);
      })
      .finally(() => setTimeout(() => setMessage(''), 3000));
  };

  return (
    <div class="card bg-base-100 text-primary-content w-96">
      <div class="card-body">
        <h2 class="card-title">Register now!</h2>
        <form class="form-control">
          <label for="username" class="label">
            Username:{' '}
          </label>
          <input
            class="input input-bordered"
            name="username"
            type="text"
            onChange={(e) => setNewUser({
              ...newUser(),
              username: e.target.value,
            })
            }
            value={newUser().username}
          />
          <label for="email" class="label">
            E-Mail address:{' '}
          </label>
          <input
            class="input input-bordered"
            name="email"
            type="email"
            onChange={(e) => setNewUser({
              ...newUser(),
              email: e.target.value,
            })
            }
            value={newUser().email}
          />
          <label for="password" class="label">
            Password:{' '}
          </label>
          <input
            class="input input-bordered"
            name="password"
            type="password"
            onChange={(e) => setNewUser({
              ...newUser(),
              password: e.target.value,
            })
            }
            value={newUser().password}
          />
          <label for="password_confirmation" class="label">
            Confirm password:{' '}
          </label>
          <input
            class="input input-bordered"
            name="password_confirmation"
            type="password"
            onChange={(e) => setNewUser({
              ...newUser(),
              confirmPassword: e.target.value,
            })
            }
            value={newUser().confirmPassword}
          />
          <Show when={message()}>{message()}</Show>
          <button
            class="btn btn-primary mt-4"
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
