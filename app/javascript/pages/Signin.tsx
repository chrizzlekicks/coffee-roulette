import { createSignal, Show } from 'solid-js';
import httpClient from '../lib/httpClient';
import createPayload from '../lib/createPayload';
import Navbar from "../components/Navbar";

interface User {
    username: string,
    email: string
    password: string
    confirmPassword: string
}



const initialPayload: User = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
};

const Signin = () => {
    const [user, setUser] = createSignal(initialPayload);
    const [message, setMessage] = createSignal('');

    const handleSubmit = (e) => {
        e.preventDefault();

        return httpClient.post('/users', createPayload(user(), 'user')).then((data: User) => {
            setMessage(`The user ${data.username} was created successfully`);
            setUser(initialPayload);
        }).catch((error: Error) => {
            setMessage(error.message);
        }).finally(() => setTimeout(() => setMessage(''), 3000));
    };

    return (
        <>
            <Navbar />
            <section class="flex justify-center items-center min-h-screen bg-base-200">
                <div class="card bg-base-100 text-primary-content w-96">
                    <div class="card-body">
                        <h2 class="card-title">Signup with us!</h2>
                        <form class='form-control'>
                            <label for='username' class='label'>Username: </label>
                            <input class='input input-bordered' name='username' type='text' onChange={(e) => setUser({ ...user(), username: e.target.value })} value={user().username} />
                            <label for='email' class='label'>E-Mail address: </label>
                            <input class='input input-bordered' name='email' type='email' onChange={(e) => setUser({ ...user(), email: e.target.value })} value={user().email} />
                            <label for='password' class='label'>Password: </label>
                            <input class='input input-bordered' name='password' type='password' onChange={(e) => setUser({ ...user(), password: e.target.value })} value={user().password} />
                            <label for='password_confirmation' class='label'>Confirm password: </label>
                            <input class='input input-bordered' name='password_confirmation' type='password' onChange={(e) => setUser({ ...user(), confirmPassword: e.target.value })} value={user().confirmPassword} />
                            <Show when={message()}>{message()}</Show>
                            <button class='btn btn-primary mt-4' type='submit' onClick={handleSubmit}>Submit</button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Signin;
