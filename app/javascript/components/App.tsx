import { Route, Router } from "@solidjs/router";
import Home from "../pages/Home";
import Signin from "../pages/Signin";
import Main from "../pages/Main";
import { AuthProvider } from "../contexts/AuthContext";

const App = () => (
	<AuthProvider>
		<Router>
			<Route path="/" component={Home} />
			<Route path="/signin" component={Signin} />
			<Route path="/main" component={Main} />
		</Router>
	</AuthProvider>
);

export default App;
