import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

export default function Dashboard({ onLogout }) {
  const [urls, setUrls] = useState([]);
  const [targetUrl, setTargetUrl] = useState('');
  const [shortResult, setShortResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUrls = useCallback(async () => {
    try {
      const data = await api.myUrls();
      setUrls(data || []);
    } catch { }
  }, []);

  useEffect(() => { loadUrls(); }, [loadUrls]);

  async function handleShorten(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShortResult(null);
    try {
      const data = await api.shorten(targetUrl);
      setShortResult(data);
      setTargetUrl('');
      await loadUrls();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(code) {
    try {
      await api.deleteUrl(code);
      await loadUrls();
    } catch { }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shortFull = shortResult ? `${window.location.origin}/urls/r/${shortResult.short_code}` : '';

  return (
    <div class="max-w-4xl mx-auto p-4 space-y-6">
      {/* Navbar */}
      <div class="flex items-center justify-between py-4">
        <div>
          <h1 class="text-xl font-bold">LinkShort</h1>
          <p class="text-xs text-[var(--text2)]">URL Shortener</p>
        </div>
        <button onClick={onLogout} class="btn btn-ghost text-sm">Sign Out</button>
      </div>

      {/* Shorten form */}
      <div class="card glow">
        <h2 class="font-semibold mb-4">Create Short URL</h2>
        <form onSubmit={handleShorten} class="flex gap-3">
          <input
            type="url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
            placeholder="https://example.com/very-long-url-you-want-to-shorten"
            required class="flex-1"
          />
          <button type="submit" disabled={loading} class="btn btn-primary shrink-0">
            {loading ? '...' : 'Shorten'}
          </button>
        </form>

        {error && (
          <div class="mt-3 text-[var(--red)] text-sm bg-[var(--red)]/10 p-3 rounded-lg">{error}</div>
        )}

        {shortResult && (
          <div class="mt-4 p-4 bg-[var(--accent)]/10 rounded-lg border border-[var(--accent)]/30">
            <div class="text-sm text-[var(--text2)] mb-1">Short URL created:</div>
            <div class="flex items-center gap-2">
              <code class="flex-1 text-[var(--accent)] font-mono text-lg truncate">{shortFull}</code>
              <button onClick={() => copyToClipboard(shortFull)} class="btn btn-ghost text-xs py-1 px-3 shrink-0">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div class="text-xs text-[var(--text2)] mt-2 truncate">
              → {shortResult.target_url}
            </div>
          </div>
        )}
      </div>

      {/* URL list */}
      <div class="card">
        <h2 class="font-semibold mb-4">Your URLs <span class="text-[var(--text2)] font-normal">({urls.length})</span></h2>
        {urls.length === 0 ? (
          <p class="text-[var(--text2)] text-sm py-4 text-center">No URLs yet. Create your first short link above!</p>
        ) : (
          <div class="space-y-2">
            {urls.map(u => (
              <div key={u.id} class="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface2)] hover:bg-[var(--surface2)]/80 transition-colors group">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <code class="text-[var(--accent)] font-mono text-sm">{window.location.origin}/urls/r/{u.short_code}</code>
                    <span class={`text-xs px-1.5 py-0.5 rounded-full ${u.is_active ? 'bg-[var(--green)]/20 text-[var(--green)]' : 'bg-[var(--red)]/20 text-[var(--red)]'}`}>
                      {u.is_active ? 'active' : 'inactive'}
                    </span>
                  </div>
                  <div class="text-xs text-[var(--text2)] truncate mt-0.5">{u.target_url}</div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <div class="text-center">
                    <div class="text-sm font-semibold">{u.clicks}</div>
                    <div class="text-[10px] text-[var(--text2)]">clicks</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/urls/r/${u.short_code}`)}
                    class="btn-ghost text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </button>
                  <button
                    onClick={() => handleDelete(u.short_code)}
                    class="btn-ghost text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[var(--red)]"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
