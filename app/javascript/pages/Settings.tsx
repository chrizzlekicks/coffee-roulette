import { createSignal, Show } from 'solid-js';
import Layout from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';
import httpClient from '../lib/httpClient';
import type { ProfileUpdate, User } from '../types';

type SettingsForm = ProfileUpdate & {
  password: string;
  password_confirmation: string;
  current_password: string;
};

const Settings = () => {
  const { state, setState } = useAuthContext();
  const user = state.user!;
  const [settings, setSettings] = createSignal<SettingsForm>({
    username: user.username,
    active: user.active,
    password: '',
    password_confirmation: '',
    current_password: '',
  });
  const [message, setMessage] = createSignal('');
  const [isSaving, setIsSaving] = createSignal(false);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const form = settings();

    if (form.password && form.password !== form.password_confirmation) {
      setMessage('Password confirmation does not match');
      return;
    }

    const update: ProfileUpdate = {
      username: form.username,
      active: form.active,
      ...(form.password
        ? {
            password: form.password,
            password_confirmation: form.password_confirmation,
            current_password: form.current_password,
          }
        : {}),
    };

    setIsSaving(true);
    try {
      const updatedUser = await httpClient.patch<User>('/me', update);
      setState({ user: updatedUser });
      setSettings({
        ...form,
        password: '',
        password_confirmation: '',
        current_password: '',
      });
      setMessage('Settings updated successfully');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout fullWidth>
      <section class="hero bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div class="hero-content text-center max-w-4xl mx-auto px-4">
          <div class="max-w-2xl">
            <h1 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Account Settings
            </h1>
            <p class="text-lg md:text-xl text-base-content/80 mb-6">
              Manage your profile and matching preferences
            </p>
          </div>
        </div>
      </section>

      <section class="py-16 bg-base-100">
        <div class="max-w-2xl mx-auto px-4">
          <div class="card bg-base-200/50 shadow-xl">
            <div class="card-body p-8">
              <form class="space-y-6" onSubmit={handleSubmit}>
                <div class="space-y-4">
                  <h2 class="text-2xl font-bold">Profile</h2>
                  <label class="form-control">
                    <span class="label-text font-medium">Username</span>
                    <input
                      class="input input-bordered input-lg"
                      name="username"
                      value={settings().username}
                      onInput={(event) =>
                        setSettings({ ...settings(), username: event.currentTarget.value })
                      }
                      required
                    />
                  </label>
                </div>

                <div class="divider" />

                <div class="space-y-4">
                  <h2 class="text-2xl font-bold">Password</h2>
                  <label class="form-control">
                    <span class="label-text font-medium">New password</span>
                    <input
                      class="input input-bordered input-lg"
                      name="password"
                      type="password"
                      value={settings().password}
                      onInput={(event) =>
                        setSettings({ ...settings(), password: event.currentTarget.value })
                      }
                      minlength="12"
                      maxlength="128"
                    />
                  </label>
                  <Show when={settings().password}>
                    <label class="form-control">
                      <span class="label-text font-medium">Current password</span>
                      <input
                        class="input input-bordered input-lg"
                        name="current_password"
                        type="password"
                        value={settings().current_password}
                        onInput={(event) =>
                          setSettings({
                            ...settings(),
                            current_password: event.currentTarget.value,
                          })
                        }
                        required
                      />
                    </label>
                  </Show>
                  <label class="form-control">
                    <span class="label-text font-medium">Confirm new password</span>
                    <input
                      class="input input-bordered input-lg"
                      name="password_confirmation"
                      type="password"
                      value={settings().password_confirmation}
                      onInput={(event) =>
                        setSettings({
                          ...settings(),
                          password_confirmation: event.currentTarget.value,
                        })
                      }
                      minlength="12"
                      maxlength="128"
                    />
                  </label>
                </div>

                <div class="divider" />

                <label class="flex items-center justify-between gap-4">
                  <span>
                    <span class="block font-semibold text-lg">Active status</span>
                    <span class="text-sm text-base-content/70">Include me in coffee matching.</span>
                  </span>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary toggle-lg"
                    checked={settings().active}
                    onChange={(event) =>
                      setSettings({ ...settings(), active: event.currentTarget.checked })
                    }
                  />
                </label>

                <Show when={message()}>
                  <div
                    class={`alert ${message().includes('successfully') ? 'alert-success' : 'alert-error'} shadow-lg`}
                  >
                    {message()}
                  </div>
                </Show>

                <button class="btn btn-primary btn-lg w-full" type="submit" disabled={isSaving()}>
                  <Show when={isSaving()} fallback="Update settings">
                    <span class="loading loading-spinner loading-sm" /> Updating...
                  </Show>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Settings;
