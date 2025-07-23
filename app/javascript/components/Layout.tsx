import { JSXElement } from 'solid-js';
import Navbar from './Navbar';

const Layout = (props: { children: JSXElement }) => (
  <>
    <Navbar />
    <section class="flex justify-center items-center min-h-screen bg-base-200">
      {props.children}
    </section>
  </>
);

export default Layout;
