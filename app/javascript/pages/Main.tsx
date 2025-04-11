import Layout from "../components/Layout";
import httpClient from "../lib/httpClient";
import {createResource, Show, Switch, Match, For} from "solid-js";

export const getMatches = () => httpClient.get('/matches').then((data: any) => data)

const Main = () => {
	const [matches] = createResource(getMatches)

	return (
		<Layout>
			<Show when={matches.loading}>
				<h1>Welcome</h1>
			</Show>
			<Switch>
				<Match when={matches.error}>
					<span>Error: {matches.error}</span>
				</Match>
				<Match when={matches()}>
					<ul class="timeline timeline-vertical">
						<For each={matches()}>
							{(match) =>
								<li>
									<hr class="bg-primary"/>
									<div class="timeline-start">{match.date}</div>
									<div class="timeline-middle">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											class="text-primary h-5 w-5">
											<path
												fill-rule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
												clip-rule="evenodd"/>
										</svg>
									</div>
									<div class="timeline-end timeline-box">{match.users.map((user) => user.username)}</div>
									<hr class="bg-primary"/>
								</li>}
						</For>
					</ul>
				</Match>
			</Switch>
		</Layout>
	);
}

export default Main;
