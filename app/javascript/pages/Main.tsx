import { createResource, Show, Switch, Match as SolidMatch, For } from 'solid-js';
import type { Match } from '../types';
import Layout from '../components/Layout';
import TimelineItem from '../components/TimelineItem';
import httpClient from '../lib/httpClient';

export const getMatches = (): Promise<Match[]> => httpClient.get<Match[]>('/matches');

const Main = () => {
  const [matches] = createResource(getMatches);

  return (
    <Layout>
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-base-content mb-2">Your Coffee Matches</h1>
          <p class="text-base-content/60">Connect with colleagues over coffee ☕</p>
        </div>

        <Show when={matches.loading}>
          <div class="flex justify-center items-center py-12">
            <div class="loading loading-spinner loading-lg text-primary" />
            <span class="ml-3 text-base-content/60">Loading your matches...</span>
          </div>
        </Show>

        <Switch>
          <SolidMatch when={matches.error}>
            <div class="alert alert-error shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 class="font-bold">Error loading matches</h3>
                <div class="text-xs">{matches.error}</div>
              </div>
            </div>
          </SolidMatch>

          <SolidMatch when={matches() && matches()!.length === 0}>
            <div class="text-center py-12">
              <div class="text-6xl mb-4">☕</div>
              <h2 class="text-2xl font-bold text-base-content mb-2">No matches yet</h2>
              <p class="text-base-content/60 mb-6">Check back later for new coffee connections!</p>
              <button class="btn btn-primary" onClick={() => window.location.reload()}>
                Refresh
              </button>
            </div>
          </SolidMatch>

          <SolidMatch when={matches() && matches()!.length > 0}>
            <div class="mb-6">
              <div class="stats shadow w-full">
                <div class="stat">
                  <div class="stat-title">Total Matches</div>
                  <div class="stat-value text-primary">{matches()!.length}</div>
                  <div class="stat-desc">Coffee connections made</div>
                </div>
                <div class="stat">
                  <div class="stat-title">This Week</div>
                  <div class="stat-value">
                    {
                      matches()!.filter(
                        (match) =>
                          new Date().getTime() - new Date(match.date).getTime() <
                          7 * 24 * 60 * 60 * 1000,
                      ).length
                    }
                  </div>
                  <div class="stat-desc">Recent matches</div>
                </div>
              </div>
            </div>

            <ul class="timeline timeline-vertical timeline-compact">
              <For
                each={matches()
                  ?.slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
              >
                {(match) => <TimelineItem match={match} />}
              </For>
            </ul>
          </SolidMatch>
        </Switch>
      </div>
    </Layout>
  );
};

export default Main;
