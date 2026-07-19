import { createSignal, Show } from 'solid-js';
import httpClient from '../lib/httpClient';
import type { NewUser, User } from '../types';

const initialUser: NewUser = {
  username: '',
  password: '',
  password_confirmation: '',
};

const Signup = () => {
  const [newUser, setNewUser] = createSignal(initialUser);
  const [message, setMessage] = createSignal('');

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    try {
      const user = await httpClient.post<User>('/users', newUser());
      setMessage(`The user ${user.username} was created successfully`);
      setNewUser(initialUser);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create account');
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
            placeholder="Choose a username"
            onInput={(event) => setNewUser({ ...newUser(), username: event.currentTarget.value })}
            value={newUser().username}
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
            placeholder="Create a password"
            onInput={(event) => setNewUser({ ...newUser(), password: event.currentTarget.value })}
            value={newUser().password}
            minlength="12"
            maxlength="128"
            required
          />
        </div>
        <div>
          <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            class="input input-bordered w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            placeholder="Confirm your password"
            onInput={(event) =>
              setNewUser({ ...newUser(), password_confirmation: event.currentTarget.value })
            }
            value={newUser().password_confirmation}
            minlength="12"
            maxlength="128"
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
