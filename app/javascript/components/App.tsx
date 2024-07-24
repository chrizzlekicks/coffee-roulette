import { createSignal } from 'solid-js';

const App = () => {
  const [username, setUsername] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData()

    formData.append('username', username())
    formData.append('email', email())
    formData.append('password', password())

    return fetch('/users', { method: 'POST', body: formData })
  }

  return (
      <>
        <header class='flex justify-center p-2'>
          <h1 class='text-4xl'>Welcome to Coffee Roulette</h1>
        </header>
        <form class='form-control'>
          <label class='label'>Username: </label>
          <input class='input input-bordered' name='username' type='text' onChange={(e) => setUsername(e.target.value)} value={username()} />
          <label class='label'>E-Mail address: </label>
          <input class='input input-bordered' name='email' type='email' onChange={(e) => setEmail(e.target.value)} value={email()} />
          <label class='label'>Password: </label>
          <input class='input input-bordered' name='password' type='password' onChange={(e) => setPassword(e.target.value)} value={password()} />
          <button class='btn btn-primary' type='submit' onClick={handleSubmit}>Submit</button>
        </form>
      </>
  );
};

export default App;
