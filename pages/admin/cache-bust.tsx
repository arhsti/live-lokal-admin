export default function CacheBustPage() {
  return (
    <div>
      <h1 style={{ fontSize: '48px', fontWeight: 700 }}>CACHE BUST PAGE</h1>
      <div>{new Date().toISOString()}</div>
    </div>
  );
}
