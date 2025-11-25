import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) return res.status(400).json({ error: 'Missing code' });

  if (req.method === 'GET') {
    try {
      const r = await query('SELECT code, target_url, total_clicks, last_clicked, created_at FROM links WHERE code = $1', [code]);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(r.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const r = await query('DELETE FROM links WHERE code = $1 RETURNING *', [code]);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error' });
    }
  }

  res.setHeader('Allow', 'GET, DELETE');
  res.status(405).end('Method Not Allowed');
}
