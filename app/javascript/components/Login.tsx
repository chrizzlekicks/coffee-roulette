import { createSignal, Show } from "solid-js";
import httpClient from "../lib/httpClient";
import createPayload from "../lib/createPayload";

const initialPayload: User = {
	password: "",
	username: "",
};
const Login = () => {
	const [user, setUser] = createSignal(initialPayload);
	const [message, setMessage] = createSignal("");

	const handleSubmit = (e) => {
		e.preventDefault();

		return httpClient
			.post("/login", createPayload(user(), "user"))
			.then((data: { message: string }) => {
				setMessage(data.message);
				setUser(initialPayload);
			})
			.catch((error: Error) => {
				setMessage(error.message);
			})
			.finally(() => setTimeout(() => setMessage(""), 3000));
	};

	return (
		<div class="card bg-base-100 text-primary-content w-96">
			<div class="card-body">
				<h2 class="card-title">Login!</h2>
				<form class="form-control">
					<label for="username" class="label">
						Username:{" "}
					</label>
					<input
						class="input input-bordered"
						name="username"
						type="text"
						onChange={(e) =>
							setUser({
								...user(),
								username: e.target.value,
							})
						}
						value={user().username}
					/>
					<label for="password" class="label">
						Password:{" "}
					</label>
					<input
						class="input input-bordered"
						name="password"
						type="password"
						onChange={(e) =>
							setUser({
								...user(),
								password: e.target.value,
							})
						}
						value={user().password}
					/>
					<Show when={message()}>{message()}</Show>
					<button
						class="btn btn-primary mt-4"
						type="submit"
						onClick={handleSubmit}
					>
						Submit
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;