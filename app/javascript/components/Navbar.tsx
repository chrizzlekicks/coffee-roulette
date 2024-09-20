import { A } from "@solidjs/router";

const Navbar = () => (
	<div class="navbar bg-base-100 shadow-lg">
		<div class="flex-1">
			<A class="btn btn-ghost text-xl" href="/">
				CoffeeRoulette
			</A>
		</div>
		<div class="flex-none">
			<div class="navbar-end">
				<A class="btn" href="/signin">
					Signin
				</A>
			</div>
		</div>
	</div>
);
export default Navbar;
