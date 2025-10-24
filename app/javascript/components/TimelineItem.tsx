import { createSignal, Show, For } from 'solid-js';
import type { Match } from '../types';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const getInitials = (username: string) =>
  username
    .split('_')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const TimelineItem = (props: { match: Match }) => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const isRecent = () =>
    new Date().getTime() - new Date(props.match.date).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <li class="group">
      <hr class={`${isRecent() ? 'bg-primary' : 'bg-gray-300'} transition-all duration-300`} />
      <div class="timeline-start">
        <div class="text-right">
          <div class="text-sm font-semibold text-base-content">{formatDate(props.match.date)}</div>
          <div class="text-xs text-base-content/60">{formatTime(props.match.date)}</div>
        </div>
      </div>
      <div class="timeline-middle">
        <div
          class={`w-8 h-8 rounded-full flex items-center justify-center ${isRecent() ? 'bg-primary text-primary-content' : 'bg-gray-300 text-gray-600'} shadow-lg transition-all duration-300 group-hover:scale-110`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-4 h-4"
          >
            <path d="M2.879 7.121A3 3 0 007.5 6.5a2.997 2.997 0 005 0 3 3 0 004.621.621 3 3 0 000 5.758A3 3 0 0012.5 13.5a2.997 2.997 0 00-5 0 3 3 0 00-4.621-.621 3 3 0 000-5.758z" />
          </svg>
        </div>
      </div>
      <div class="timeline-end">
        <div
          class={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${isExpanded() ? 'scale-105' : ''}`}
          onClick={() => setIsExpanded(!isExpanded())}
        >
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="flex -space-x-2">
                  <For each={props.match.users}>
                    {(user) => (
                      <div class="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold ring-2 ring-base-100">
                        {getInitials(user.username)}
                      </div>
                    )}
                  </For>
                </div>
                <div>
                  <h3 class="font-semibold text-base-content">
                    Coffee with {props.match.users.map((user) => user.username).join(' & ')}
                  </h3>
                  <p class="text-sm text-base-content/60">
                    {props.match.users.length} participant
                    {props.match.users.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div class={`transition-transform duration-300 ${isExpanded() ? 'rotate-180' : ''}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-base-content/40"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <Show when={isExpanded()}>
              <div class="mt-4 pt-4 border-t border-base-300 space-y-3 animate-fade-in">
                <div>
                  <h4 class="text-sm font-semibold text-base-content mb-2">Participants:</h4>
                  <div class="space-y-2">
                    <For each={props.match.users}>
                      {(user) => (
                        <div class="flex items-center space-x-3 p-2 bg-base-200 rounded-lg">
                          <div class="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold">
                            {getInitials(user.username)}
                          </div>
                          <div>
                            <div class="font-medium text-sm">{user.username}</div>
                            <div class="text-xs text-base-content/60">{user.email}</div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>

                <div class="flex space-x-2">
                  <button class="btn btn-primary btn-sm flex-1">📧 Send Message</button>
                  <button class="btn btn-outline btn-sm flex-1">📅 Schedule</button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
      <hr class={`${isRecent() ? 'bg-primary' : 'bg-gray-300'} transition-all duration-300`} />
    </li>
  );
};

export default TimelineItem;
