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
					<ol>
						<For each={matches()}>
							{(match)=> <li>{match.date}</li>}
						</For>
					</ol>
				</Match>
			</Switch>
		</Layout>
	);
}

export default Main;
