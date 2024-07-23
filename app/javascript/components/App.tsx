import { type Component, createSignal } from 'solid-js';
import './App.css'

const App: Component = () => {
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
          <h1 class='color-sky'>Welcome to Coffee Roulette</h1>
        </header>
        <form>
          <h2>Signup</h2>
          <div>
            <label>Username: </label>
            <input name='username' type='text' onChange={(e) => setUsername(e.target.value)} value={username()} />
          </div>
          <div>
            <label>E-Mail address: </label>
            <input name='email' type='email' onChange={(e) => setEmail(e.target.value)} value={email()} />
          </div>
          <div>
            <label>Password: </label>
            <input name='password' type='password' onChange={(e) => setPassword(e.target.value)} value={password()} />
          </div>
          <button type='submit' onClick={handleSubmit}>Submit</button>
        </form>
      </>
  );
};

export default App;
