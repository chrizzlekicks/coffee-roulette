import { createSignal } from 'solid-js';

const App = () => {
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('')

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('username', username());
    formData.append('email', email());
    formData.append('password', password());
    formData.append('password_confirmation', confirmPassword())

    const headers = new Headers({
      "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')['content'],
      "Content-Type": "application/json"
    })

    return fetch('/users', { method: 'POST', headers, body: JSON.stringify({user: Object.fromEntries(formData)})});
  };

  return (
      <>
        <header class='flex justify-center p-2'>
          <h1 class='text-4xl'>Welcome to Coffee Roulette</h1>
        </header>
        <form class='form-control'>
          <label for='username' class='label'>Username: </label>
          <input class='input input-bordered' name='username' type='text' onChange={(e) => setUsername(e.target.value)} value={username()} />
          <label for='email' class='label'>E-Mail address: </label>
          <input class='input input-bordered' name='email' type='email' onChange={(e) => setEmail(e.target.value)} value={email()} />
          <label for='password' class='label'>Password: </label>
          <input class='input input-bordered' name='password' type='password' onChange={(e) => setPassword(e.target.value)} value={password()} />
          <label for='password_confirmation' class='label'>Confirm password: </label>
          <input class='input input-bordered' name='password_confirmation' type='password' onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword()} />
          <button class='btn btn-primary' type='submit' onClick={handleSubmit}>Submit</button>
        </form>
      </>
  );
};

export default App;
