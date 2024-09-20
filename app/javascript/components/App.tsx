import { Route, Router } from "@solidjs/router";
import Home from "../pages/Home";
import Signin from "../pages/Signin";

const App = () => (
	<Router>
		<Route path="/" component={Home} />
		<Route path="/signin" component={Signin} />
	</Router>
);

export default App;
