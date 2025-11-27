import useSWR from 'swr';
import { useRouter } from 'next/router';

const fetcher = (url) => fetch(url).then(r => r.json());

export default function CodeStats() {
  const router = useRouter();
  const { code } = router.query;
  const { data, error } = useSWR(() => code ? `/api/links/${code}` : null, fetcher);

  if (!code) return <div>Loading...</div>;
  if (error) return <div>Error loading link.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Stats for {data.code}</h1>
      <p><b>Target URL:</b> <a href={data.target_url} target="_blank" rel="noreferrer">{data.target_url}</a></p>
      <p><b>Total Clicks:</b> {data.total_clicks}</p>
      <p><b>Last Clicked:</b> {data.last_clicked || '—'}</p>
      <p><b>Created At:</b> {data.created_at}</p>
    </div>
  );
}
