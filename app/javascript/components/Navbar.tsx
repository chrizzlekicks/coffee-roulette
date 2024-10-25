import {A, useNavigate} from "@solidjs/router";
import { useAuthContext } from "../contexts/AuthContext";
import { Show } from "solid-js";
import httpClient from "../lib/httpClient";

const Navbar = () => {
	const { state, setState } = useAuthContext();
	const navigate = useNavigate();

	const handleLogout = (e) => {
		e.preventDefault()

		return httpClient.delete('/logout').then(() => {
			setState({ username: undefined, isLoggedIn: false })
			localStorage.clear()
			navigate('/')
		})
	}

	return (
		<div class="navbar bg-base-100 shadow-lg">
			<div class="flex-1">
				<A class="btn btn-ghost text-xl" href="/">
					CoffeeRoulette
				</A>
			</div>
			<div class="flex-none">
				<div class="navbar-end">
					<Show
						when={state.isLoggedIn}
						fallback={
							<A class="btn" href="/signin">
								Signin
							</A>
						}
					>
						<button class="btn" onClick={handleLogout}>Logout</button>
					</Show>
				</div>
			</div>
		</div>
	);
};
export default Navbar;
