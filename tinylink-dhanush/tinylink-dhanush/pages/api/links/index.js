import { query } from '../../../../lib/db';

function isValidCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function generateCode(len = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const r = await query('SELECT code, target_url, total_clicks, last_clicked, created_at FROM links ORDER BY created_at DESC', []);
      return res.status(200).json(r.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error' });
    }
  }

  if (req.method === 'POST') {
    const { target_url, code } = req.body || {};
    if (!target_url || !isValidUrl(target_url)) {
      return res.status(400).json({ error: 'Invalid or missing target_url' });
    }

    if (code) {
      if (!isValidCode(code)) {
        return res.status(400).json({ error: 'Code format invalid (6-8 alphanumeric)' });
      }
      try {
        await query('INSERT INTO links(code, target_url) VALUES($1, $2)', [code, target_url]);
        return res.status(201).json({ code });
      } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Code already exists' });
        console.error(err);
        return res.status(500).json({ error: 'DB error' });
      }
    } else {
      const maxRetries = parseInt(process.env.CODE_GENERATE_MAX_RETRIES || '6', 10);
      for (let i = 0; i < maxRetries; i++) {
        const generated = generateCode(6);
        try {
          await query('INSERT INTO links(code, target_url) VALUES($1, $2)', [generated, target_url]);
          return res.status(201).json({ code: generated });
        } catch (err) {
          if (err.code === '23505') continue;
          console.error(err);
          return res.status(500).json({ error: 'DB error' });
        }
      }
      return res.status(500).json({ error: 'Could not generate unique code' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end('Method Not Allowed');
}
