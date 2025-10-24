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
    <Layout fullWidth>
      {/* Hero Section */}
      <section class="hero bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div class="hero-content text-center max-w-4xl mx-auto px-4">
          <div class="max-w-2xl">
            <h1 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Account Settings
            </h1>
            <p class="text-lg md:text-xl text-base-content/80 mb-6">
              Manage your profile and preferences for CoffeeRoulette
            </p>
          </div>
        </div>
      </section>

      {/* Settings Form Section */}
      <section class="py-16 bg-base-100">
        <div class="max-w-2xl mx-auto px-4">
          <Show when={isLoading()}>
            <div class="flex justify-center py-20">
              <div class="flex flex-col items-center gap-4">
                <span class="loading loading-spinner loading-lg text-primary" />
                <p class="text-base-content/70">Loading your settings...</p>
              </div>
            </div>
          </Show>

          <Show when={!isLoading()}>
            <div class="card bg-base-200/50 shadow-xl">
              <div class="card-body p-8">
                <form class="space-y-6" onSubmit={handleSubmit}>
                  {/* Profile Information Section */}
                  <div class="space-y-4">
                    <h3 class="text-2xl font-bold text-base-content mb-6 flex items-center gap-2">
                      <div class="text-2xl">👤</div>
                      Profile Information
                    </h3>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Username</span>
                      </label>
                      <input
                        class="input input-bordered input-lg"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        onChange={(e) =>
                          setUserSettings({
                            ...userSettings(),
                            username: e.target.value,
                          })
                        }
                        value={userSettings().username}
                      />
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Email Address</span>
                      </label>
                      <input
                        class="input input-bordered input-lg"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        onChange={(e) =>
                          setUserSettings({
                            ...userSettings(),
                            email: e.target.value,
                          })
                        }
                        value={userSettings().email}
                      />
                    </div>
                  </div>

                  <div class="divider" />

                  {/* Security Section */}
                  <div class="space-y-4">
                    <h3 class="text-2xl font-bold text-base-content mb-6 flex items-center gap-2">
                      <div class="text-2xl">🔒</div>
                      Security Settings
                    </h3>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">New Password</span>
                        <span class="label-text-alt text-base-content/60">
                          Leave empty to keep current
                        </span>
                      </label>
                      <input
                        class="input input-bordered input-lg"
                        name="password"
                        type="password"
                        placeholder="Enter new password"
                        onChange={(e) =>
                          setUserSettings({
                            ...userSettings(),
                            password: e.target.value,
                          })
                        }
                        value={userSettings().password}
                      />
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Confirm New Password</span>
                      </label>
                      <input
                        class="input input-bordered input-lg"
                        name="password_confirmation"
                        type="password"
                        placeholder="Confirm new password"
                        onChange={(e) =>
                          setUserSettings({
                            ...userSettings(),
                            password_confirmation: e.target.value,
                          })
                        }
                        value={userSettings().password_confirmation}
                      />
                    </div>
                  </div>

                  <div class="divider" />

                  {/* Preferences Section */}
                  <div class="space-y-4">
                    <h3 class="text-2xl font-bold text-base-content mb-6 flex items-center gap-2">
                      <div class="text-2xl">⚙️</div>
                      Matching Preferences
                    </h3>

                    <div class="card bg-base-100 border border-base-300">
                      <div class="card-body p-6">
                        <div class="flex items-center justify-between">
                          <div class="flex-1">
                            <h4 class="font-semibold text-lg">Active Status</h4>
                            <p class="text-base-content/70 text-sm">
                              Enable this to receive coffee match notifications and be included in
                              the matching algorithm
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            class="toggle toggle-primary toggle-lg ml-4"
                            checked={userSettings().active}
                            onChange={(e) =>
                              setUserSettings({
                                ...userSettings(),
                                active: e.target.checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Display */}
                  <Show when={message()}>
                    <div
                      class={`alert ${message().includes('successfully') ? 'alert-success' : 'alert-error'} shadow-lg`}
                    >
                      <div class="flex items-center gap-2">
                        <div class="text-lg">
                          {message().includes('successfully') ? '✅' : '❌'}
                        </div>
                        <span>{message()}</span>
                      </div>
                    </div>
                  </Show>

                  {/* Action Buttons */}
                  <div class="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      class="btn btn-primary btn-lg flex-1"
                      type="submit"
                      disabled={isLoading()}
                    >
                      <Show
                        when={isLoading()}
                        fallback={
                          <div class="flex items-center gap-2">
                            <div class="text-lg">💾</div>
                            Update Settings
                          </div>
                        }
                      >
                        <span class="loading loading-spinner loading-sm" />
                        Updating...
                      </Show>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Show>
        </div>
      </section>
    </Layout>
  );
};

export default Settings;
