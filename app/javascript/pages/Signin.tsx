import Navbar from "../components/Navbar";
import Signup from "../components/Signup";
import Login from "../components/Login";

const Signin = () => {
	return (
		<>
			<Navbar />
			<section class="flex justify-center items-center min-h-screen bg-base-200">
				<div role="tablist" class="tabs tabs-lifted">
					<input
						type="radio"
						name="my_tabs_2"
						role="tab"
						class="tab"
						aria-label="Signup"
						// @ts-ignore
						checked="checked"
					/>
					<div
						role="tabpanel"
						class="tab-content bg-base-100 border-base-300 rounded-box p-6"
					>
						<Signup />
					</div>
					<input
						type="radio"
						name="my_tabs_2"
						role="tab"
						class="tab"
						aria-label="Login"
					/>
					<div
						role="tabpanel"
						class="tab-content bg-base-100 border-base-300 rounded-box p-6"
					>
						<Login />
					</div>
				</div>
			</section>
		</>
	);
};

export default Signin;
