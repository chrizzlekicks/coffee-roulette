import { Route, Router } from "@solidjs/router";
import Home from "../pages/Home";
import Signin from "../pages/Signin";
import Main from "../pages/Main";
import Error from "./Error";
import { AuthProvider } from "../contexts/AuthContext";
import AuthGuard from "./AuthGuard";
import httpClient from "../lib/httpClient";
const App = () => (
	<AuthProvider>
		<Router>
			<Route path="/" component={Home} />
			<Route path="/signin" component={Signin} />
			{/* Private routes */}
			<Route path="/" component={AuthGuard}>
				<Route path="/main" component={Main} />
			</Route>
			<Route path="*" component={Error} />
		</Router>
	</AuthProvider>
);

export default App;
