import {A} from "@solidjs/router";
import Navbar from "../components/Navbar";

const Home = () => (
    <>
        <Navbar />
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Welcome to CoffeeRoulette</h1>
                    <p className="py-6">
                        Do you want to get matched with your colleagues for some nice coffee chats? Say no more, we got you covered. Sign up now and get matched on a daily basis by our matching algorithm. Free, easy, hassle-free.
                    </p>
                    <A href="/signin" class="btn btn-primary">Get Started</A>
                </div>
            </div>
        </div>
    </>
);

export default Home;
