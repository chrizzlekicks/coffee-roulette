import { createSignal } from 'solid-js';
import { A } from '@solidjs/router';
import Signup from '../components/Signup';
import Login from '../components/Login';

const Signin = () => {
  const [isLogin, setIsLogin] = createSignal(true);

  return (
    <div class="min-h-screen flex">
      {/* Left side - Form */}
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div class="w-full max-w-md">
          {/* Logo/Title */}
          <div class="mb-8">
            <A href="/">
              <h1 class="text-3xl font-bold text-accent mb-2">CoffeeRoulette</h1>
            </A>
            <p class="text-gray-600">Connect over coffee</p>
          </div>

          {/* Tab switcher */}
          <div class="mb-6">
            <h2 class="text-2xl font-semibold mb-6 text-gray-800">{isLogin() ? 'Sign In' : 'Create Account'}</h2>
          </div>

          {/* Form area */}
          <div class="mb-6">{isLogin() ? <Login /> : <Signup />}</div>

          {/* Divider */}
          <div class="divider text-gray-500 text-sm">or</div>

          {/* Switch between login/signup */}
          <div class="text-center">
            <button class="link link-primary text-sm" onClick={() => setIsLogin(!isLogin())}>
              {isLogin() ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Hero/Marketing */}
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent to-primary items-center justify-center p-12">
        <div class="text-white max-w-lg">
          <h2 class="text-4xl font-bold mb-8">The new way to connect with your team</h2>
          <p class="text-xl mb-8 text-sky-100">Build stronger relationships through spontaneous coffee meetings</p>
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <svg class="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p class="font-semibold text-lg">Random matching system</p>
                <p class="text-sky-100">Get paired with different team members each week</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <svg class="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p class="font-semibold text-lg">Break down silos</p>
                <p class="text-sky-100">Connect across departments and roles</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <svg class="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p class="font-semibold text-lg">Build company culture</p>
                <p class="text-sky-100">Foster meaningful connections in your organization</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
