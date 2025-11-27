import { query } from '../lib/db';

export async function getServerSideProps({ params, res }) {
  const code = params.code;
  const r = await query('SELECT target_url FROM links WHERE code = $1', [code]);

  if (!r.rows.length) {
    res.statusCode = 404;
    return { props: { notFound: true } };
  }

  const target = r.rows[0].target_url;

  try {
    await query('UPDATE links SET total_clicks = total_clicks + 1, last_clicked = now() WHERE code = $1', [code]);
  } catch (err) {
    console.error('Failed to update stats', err);
  }

  return {
    redirect: {
      destination: target,
      permanent: false
    }
  };
}

export default function Page({ notFound }) {
  if (notFound) {
    return <div>404 - Link not found</div>;
  }
  return null;
}
