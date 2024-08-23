import { createSignal } from 'solid-js';
import httpClient from '../lib/httpClient.ts';
import createPayload from '../lib/createPayload.ts';
import {A} from "@solidjs/router";

interface User {
    username?: string,
    email?: string
    password?: string
    confirmPassword?: string
}

const initialPayload: User = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const Signin = () => {
  const [user, setUser] = createSignal(initialPayload);
  const [message, setMessage] = createSignal();

  const handleSubmit = (e) => {
    e.preventDefault();

    return httpClient.post('/users', createPayload(user(), 'user')).then((data) => {
      setMessage(`The user ${data.username} was created successfully`);
      setUser(initialPayload);
    }).catch((error: Error) => {
      setMessage(error.message);
    }).finally(() => setTimeout(() => setMessage(), 3000));
  };

  return (
      <>
          <nav>
              <A href='/'>Home</A>
              <A href='/signin'>Signin</A>
          </nav>
        <header class='flex justify-center p-2'>
          <h1 class='text-4xl'>Welcome to Coffee Roulette</h1>
        </header>
        <div>{message()}</div>
        <form class='form-control'>
          <label for='username' class='label'>Username: </label>
          <input class='input input-bordered' name='username' type='text' onChange={(e) => setUser({ ...user(), username: e.target.value })} value={user().username} />
          <label for='email' class='label'>E-Mail address: </label>
          <input class='input input-bordered' name='email' type='email' onChange={(e) => setUser({ ...user(), email: e.target.value })} value={user().email} />
          <label for='password' class='label'>Password: </label>
          <input class='input input-bordered' name='password' type='password' onChange={(e) => setUser({ ...user(), password: e.target.value })} value={user().password} />
          <label for='password_confirmation' class='label'>Confirm password: </label>
          <input class='input input-bordered' name='password_confirmation' type='password' onChange={(e) => setUser({ ...user(), confirmPassword: e.target.value })} value={user().confirmPassword} />
          <button class='btn btn-primary' type='submit' onClick={handleSubmit}>Submit</button>
        </form>
      </>
  );
};

export default Signin;
