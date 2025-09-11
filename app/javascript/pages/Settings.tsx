import { createSignal, Show, onMount } from 'solid-js';
import Layout from '../components/Layout';
import httpClient from '../lib/httpClient';
import createPayload from '../lib/createPayload';
import { useAuthContext } from '../contexts/AuthContext';

type UserSettings = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  active: boolean;
};

type UserProfile = Omit<UserSettings, 'password', 'password_confirmation'>;

const initialPayload: UserSettings = {
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  active: true,
};

const Settings = () => {
  const { _state, setState } = useAuthContext();
  const [userSettings, setUserSettings] = createSignal(initialPayload);
  const [message, setMessage] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  // Fetch current user data on component mount
  onMount(() => {
    setIsLoading(true);
    httpClient
      .get('/profile')
      .then((data: UserProfile) => {
        setUserSettings({
          username: data.username || '',
          email: data.email || '',
          password: '',
          password_confirmation: '',
          active: data.active ?? true,
        });
      })
      .catch((_error: Error) => {
        setMessage('Failed to load user data');
      })
      .finally(() => setIsLoading(false));
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const settings = userSettings();

    // Basic validation
    if (settings.password && settings.password !== settings.password_confirmation) {
      setMessage('Password confirmation does not match');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsLoading(true);

    // Prepare payload - only include password if it's being changed
    const updateData = {
      username: settings.username,
      email: settings.email,
      active: settings.active,
      ...(settings.password
        ? {
          password: settings.password,
          password_confirmation: settings.password_confirmation,
        }
        : {}),
    };

    // Capture current settings outside the promise chain to avoid reactivity issues
    const currentSettings = userSettings();

    httpClient
      .put('/users', createPayload(updateData, 'user'))
      .then((data: UserSettings) => {
        setMessage('Settings updated successfully');
        setState((prevState) => ({
          ...prevState,
          username: data.username,
        }));
        // Clear password fields after successful update
        setUserSettings({
          ...currentSettings,
          password: '',
          password_confirmation: '',
        });
      })
      .catch((error: Error) => {
        setMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => setMessage(''), 3000);
      });
  };

  return (
    <Layout>
      <div class="flex justify-center items-center min-h-screen bg-base-200">
        <div class="card bg-base-100 text-primary-content w-96">
          <div class="card-body">
            <h2 class="card-title">Account Settings</h2>
            <Show when={isLoading()}>
              <div class="flex justify-center">
                <span class="loading loading-spinner loading-md" />
              </div>
            </Show>
            <Show when={!isLoading()}>
              <form class="form-control">
                <label for="username" class="label">
                  Username:{' '}
                </label>
                <input
                  class="input input-bordered"
                  name="username"
                  type="text"
                  onChange={(e) => setUserSettings({
                    ...userSettings(),
                    username: e.target.value,
                  })
                  }
                  value={userSettings().username}
                />

                <label for="email" class="label">
                  Email address:{' '}
                </label>
                <input
                  class="input input-bordered"
                  name="email"
                  type="email"
                  onChange={(e) => setUserSettings({
                    ...userSettings(),
                    email: e.target.value,
                  })
                  }
                  value={userSettings().email}
                />

                <label for="password" class="label">
                  New Password (leave empty to keep current):{' '}
                </label>
                <input
                  class="input input-bordered"
                  name="password"
                  type="password"
                  onChange={(e) => setUserSettings({
                    ...userSettings(),
                    password: e.target.value,
                  })
                  }
                  value={userSettings().password}
                />

                <label for="password_confirmation" class="label">
                  Confirm New Password:{' '}
                </label>
                <input
                  class="input input-bordered"
                  name="password_confirmation"
                  type="password"
                  onChange={(e) => setUserSettings({
                    ...userSettings(),
                    password_confirmation: e.target.value,
                  })
                  }
                  value={userSettings().password_confirmation}
                />

                <div class="form-control">
                  <label class="cursor-pointer label">
                    <span class="label-text">Active (receive coffee matches)</span>
                    <input
                      type="checkbox"
                      class="toggle toggle-primary"
                      checked={userSettings().active}
                      onChange={(e) => setUserSettings({
                        ...userSettings(),
                        active: e.target.checked,
                      })
                      }
                    />
                  </label>
                </div>

                <Show when={message()}>
                  <div class={message().includes('successfully') ? 'alert alert-success' : 'alert alert-error'}>
                    {message()}
                  </div>
                </Show>

                <button class="btn btn-primary mt-4" type="submit" onClick={handleSubmit} disabled={isLoading()}>
                  <Show when={isLoading()} fallback="Update Settings">
                    <span class="loading loading-spinner loading-sm" />
                    Updating...
                  </Show>
                </button>
              </form>
            </Show>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
