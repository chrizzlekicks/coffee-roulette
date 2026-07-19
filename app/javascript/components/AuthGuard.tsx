import { Navigate } from '@solidjs/router';
import { Show, type ParentProps } from 'solid-js';
import { useAuthContext } from '../contexts/AuthContext';

function AuthGuard(props: ParentProps) {
  const { state } = useAuthContext();

  return (
    <Show
      when={!state.loading}
      fallback={<div class="min-h-screen grid place-items-center">Loading...</div>}
    >
      <Show when={state.user} fallback={<Navigate href="/signin" />}>
        {props.children}
      </Show>
    </Show>
  );
}

export default AuthGuard;
