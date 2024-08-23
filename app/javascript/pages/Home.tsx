import {A} from "@solidjs/router";

const Home = () => (
    <>
        <nav>
            <A href='/'>Home</A>
            <A href='/signin'>Signin</A>
        </nav>
        <div>Homepage</div>
    </>
);

export default Home;
