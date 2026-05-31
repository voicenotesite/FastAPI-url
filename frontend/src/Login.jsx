import { useState } from 'react';
import { api } from './api';

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const data = await fn(email, password);
      api.setToken(data.access_token);
      onAuth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="card glow w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold tracking-tight">LinkShort</h1>
          <p class="text-[var(--text2)] mt-2 text-sm">Professional URL Shortener</p>
        </div>

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm text-[var(--text2)] mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
            />
          </div>
          <div>
            <label class="block text-sm text-[var(--text2)] mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
            />
          </div>

          {error && (
            <div class="text-[var(--red)] text-sm bg-[var(--red)]/10 p-3 rounded-lg">{error}</div>
          )}

          <button type="submit" disabled={loading} class="btn btn-primary w-full">
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} class="text-sm text-[var(--text2)] hover:text-[var(--accent)] transition-colors">
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
