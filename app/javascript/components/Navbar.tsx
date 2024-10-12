import { A } from "@solidjs/router";
import { useAuthContext } from "../contexts/AuthContext";
import { Show } from "solid-js";

const Navbar = () => {
	const { state } = useAuthContext();
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
						<button class="btn">Logout</button>
					</Show>
				</div>
			</div>
		</div>
	);
};
export default Navbar;
