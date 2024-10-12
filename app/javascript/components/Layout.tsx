import Navbar from "./Navbar";
import { JSXElement } from "solid-js";

const Layout = ({ children }: { children: JSXElement }) => {
	return (
		<>
			<Navbar />
			<section class="flex justify-center items-center min-h-screen bg-base-200">
				{children}
			</section>
		</>
	);
};

export default Layout;
