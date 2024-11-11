import Navbar from "../components/Navbar";
import Signup from "../components/Signup";
import Login from "../components/Login";
import Layout from "../components/Layout";

const Signin = () => (
	<Layout>
		<div role="tablist" class="tabs tabs-lifted">
			<input
				id="register"
				type="radio"
				name="my_tabs_2"
				role="tab"
				class="tab"
				aria-label="Signup"
				checked
			/>
			<div
				role="tabpanel"
				class="tab-content bg-base-100 border-base-300 rounded-box p-6"
			>
				<Signup />
			</div>
			<input
				id="login"
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
	</Layout>
);

export default Signin;
