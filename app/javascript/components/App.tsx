import { Route, Router } from "@solidjs/router";
import Home from "../pages/Home";
import Signin from "../pages/Signin";
import Main from "../pages/Main";

const App = () => (
	<Router>
		<Route path="/" component={Home} />
		<Route path="/signin" component={Signin} />
		<Route path="/main" component={Main} />
	</Router>
);

export default App;
