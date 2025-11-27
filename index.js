import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url) => fetch(url).then(r => r.json());

export default function Home() {
  const { data, mutate } = useSWR('/api/links', fetcher);
  const [target, setTarget] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createLink(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: target, code: code || undefined })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unknown error');
      setTarget('');
      setCode('');
      mutate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteLink(c) {
    if (!confirm(`Delete ${c}?`)) return;
    await fetch(`/api/links/${c}`, { method: 'DELETE' });
    mutate();
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'Arial' }}>
      <h1>TinyLink</h1>
      <form onSubmit={createLink} style={{ marginBottom: 20 }}>
        <div>
          <input placeholder="Target URL (https://...)" value={target} onChange={e => setTarget(e.target.value)} style={{ width: '60%', padding: 8 }} />
          <input placeholder="Custom Code (optional, 6-8 chars)" value={code} onChange={e => setCode(e.target.value)} style={{ width: '25%', padding: 8, marginLeft: 8 }} />
          <button disabled={loading} style={{ marginLeft: 8, padding: '8px 12px' }}>{loading ? 'Creating...' : 'Create'}</button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>

      <div>
        <h2>All Links</h2>
        {!data && <div>Loading...</div>}
        {data && data.length === 0 && <div>No links yet</div>}
        {data && data.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Code</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Target</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Clicks</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Last Clicked</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(link => (
                <tr key={link.code}>
                  <td style={{ padding: 8 }}><a href={`/${link.code}`}>{link.code}</a></td>
                  <td style={{ padding: 8 }}>{link.target_url}</td>
                  <td style={{ padding: 8 }}>{link.total_clicks}</td>
                  <td style={{ padding: 8 }}>{link.last_clicked || '—'}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/${link.code}`)}>Copy</button>
                    <button onClick={() => deleteLink(link.code)} style={{ marginLeft: 8 }}>Delete</button>
                    <a href={`/code/${link.code}`} style={{ marginLeft: 8 }}>Stats</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
