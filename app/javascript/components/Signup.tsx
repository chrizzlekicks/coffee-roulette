import { createSignal, Show } from 'solid-js';
import httpClient from '../lib/httpClient';
import createPayload from '../lib/createPayload';
import type { NewUser } from '../types';

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
    <div class="w-full">
      <form class="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            class="input input-bordered w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
            name="username"
            type="text"
            placeholder="Choose a username"
            onChange={(e) =>
              setNewUser({
                ...newUser(),
                username: e.target.value,
              })
            }
            value={newUser().username}
            required
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            class="input input-bordered w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
            name="email"
            type="email"
            placeholder="your.email@company.com"
            onChange={(e) =>
              setNewUser({
                ...newUser(),
                email: e.target.value,
              })
            }
            value={newUser().email}
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
            placeholder="Create a password"
            onChange={(e) =>
              setNewUser({
                ...newUser(),
                password: e.target.value,
              })
            }
            value={newUser().password}
            required
          />
        </div>
        <div>
          <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            class="input input-bordered w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
            name="password_confirmation"
            type="password"
            placeholder="Confirm your password"
            onChange={(e) =>
              setNewUser({
                ...newUser(),
                confirmPassword: e.target.value,
              })
            }
            value={newUser().confirmPassword}
            required
          />
        </div>
        <Show when={message()}>
          <div
            class={`alert ${message().includes('successfully') ? 'alert-success' : 'alert-error'} text-sm`}
          >
            {message()}
          </div>
        </Show>
        <button
          class="btn btn-primary w-full text-white font-semibold text-base h-12"
          type="submit"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Signup;
