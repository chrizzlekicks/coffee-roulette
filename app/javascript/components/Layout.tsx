import { JSXElement } from 'solid-js';
import Navbar from './Navbar';

const Layout = (props: { children: JSXElement; fullWidth?: boolean }) => (
  <>
    <Navbar />
    <main
      class={props.fullWidth ? 'min-h-screen bg-base-200' : 'flex justify-center items-center min-h-screen bg-base-200'}
    >
      {props.children}
    </main>
  </>
);

export default Layout;
