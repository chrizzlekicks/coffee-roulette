import { A } from '@solidjs/router';
import Layout from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';

const Home = () => {
  const { state } = useAuthContext();

  return (
    <Layout fullWidth>
      {/* Hero Section */}
      <section class="hero bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div class="hero-content text-center max-w-6xl mx-auto px-4">
          <div class="max-w-4xl">
            <h1 class="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
              CoffeeRoulette
            </h1>
            <p class="text-xl md:text-2xl text-base-content/80 mb-4 font-medium">
              Connect with colleagues over coffee, one match at a time
            </p>
            <p class="text-lg md:text-xl text-base-content/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Break down silos and build meaningful relationships with your team. Our smart matching
              algorithm pairs you with colleagues for spontaneous coffee chats that spark
              collaboration and friendship.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <A href={state.isLoggedIn ? '/main' : '/signin'} class="btn btn-primary btn-lg">
                Start Matching Today
              </A>
              <A href="#how-it-works" class="btn btn-outline btn-lg">
                How It Works
              </A>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section class="py-20 bg-base-100">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-4">Why CoffeeRoulette?</h2>
            <p class="text-lg text-base-content/70 max-w-2xl mx-auto">
              Transform your workplace culture with meaningful connections that happen naturally
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="card bg-base-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div class="card-body text-center">
                <div class="text-5xl mb-4">🎲</div>
                <h3 class="card-title text-2xl justify-center mb-3">Smart Matching</h3>
                <p class="text-base-content/80">
                  Our algorithm intelligently pairs you with colleagues you haven't connected with
                  recently, ensuring diverse and meaningful interactions.
                </p>
              </div>
            </div>
            <div class="card bg-base-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div class="card-body text-center">
                <div class="text-5xl mb-4">☕</div>
                <h3 class="card-title text-2xl justify-center mb-3">Daily Opportunities</h3>
                <p class="text-base-content/80">
                  Get matched regularly for coffee chats that fit into your schedule. Build
                  relationships one conversation at a time.
                </p>
              </div>
            </div>
            <div class="card bg-base-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div class="card-body text-center">
                <div class="text-5xl mb-4">📧</div>
                <h3 class="card-title text-2xl justify-center mb-3">Effortless Setup</h3>
                <p class="text-base-content/80">
                  Simple signup, instant email notifications, and zero maintenance. Focus on the
                  conversations, not the logistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" class="py-20 bg-base-200/30">
        <div class="max-w-4xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p class="text-lg text-base-content/70">
              Getting started is simple and takes less than 2 minutes
            </p>
          </div>
          <div class="space-y-12">
            <div class="flex flex-col md:flex-row items-center gap-8">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                  1
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-2xl font-bold mb-2">Sign Up</h3>
                <p class="text-base-content/80">
                  Create your account with just your email and name. Join your organization's
                  CoffeeRoulette community.
                </p>
              </div>
            </div>
            <div class="flex flex-col md:flex-row items-center gap-8">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-2xl font-bold">
                  2
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-2xl font-bold mb-2">Get Matched</h3>
                <p class="text-base-content/80">
                  Our algorithm pairs you with colleagues for coffee meetups. Receive email
                  notifications with your match details.
                </p>
              </div>
            </div>
            <div class="flex flex-col md:flex-row items-center gap-8">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-full bg-accent text-accent-content flex items-center justify-center text-2xl font-bold">
                  3
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-2xl font-bold mb-2">Connect & Chat</h3>
                <p class="text-base-content/80">
                  Meet up for coffee, tea, or a quick chat. Build meaningful relationships that
                  enhance collaboration and workplace culture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits/Social Proof Section */}
      <section class="py-20 bg-base-100">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-4">Transform Your Workplace</h2>
            <p class="text-lg text-base-content/70 max-w-2xl mx-auto">
              Join teams that are already building stronger connections and more collaborative
              cultures
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="stat bg-base-200/50 rounded-lg">
              <div class="stat-title">Team Collaboration</div>
              <div class="stat-value text-primary">+47%</div>
              <div class="stat-desc">Increase in cross-team projects</div>
            </div>
            <div class="stat bg-base-200/50 rounded-lg">
              <div class="stat-title">Employee Satisfaction</div>
              <div class="stat-value text-secondary">+32%</div>
              <div class="stat-desc">Higher workplace happiness scores</div>
            </div>
            <div class="stat bg-base-200/50 rounded-lg">
              <div class="stat-title">New Connections</div>
              <div class="stat-value text-accent">150+</div>
              <div class="stat-desc">Relationships formed monthly</div>
            </div>
          </div>
          <div class="mt-16 grid md:grid-cols-2 gap-8">
            <div class="chat chat-start">
              <div class="chat-bubble chat-bubble-primary">
                "CoffeeRoulette helped me connect with people I never would have talked to
                otherwise. It's amazing how a simple coffee chat can lead to great collaborations!"
              </div>
            </div>
            <div class="chat chat-end">
              <div class="chat-bubble chat-bubble-secondary">
                "I was skeptical at first, but now I look forward to my coffee matches. It's the
                highlight of my week and has made work so much more enjoyable."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section class="py-20 bg-gradient-to-r from-primary to-accent">
        <div class="max-w-4xl mx-auto text-center px-4">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Connecting?</h2>
          <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already building stronger workplace
            relationships through CoffeeRoulette
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <A href="/signin" class="btn btn-white btn-lg text-primary hover:bg-white/90">
              Get Started Free
            </A>
            <A
              href="/signin"
              class="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary"
            >
              Sign In to Your Account
            </A>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
