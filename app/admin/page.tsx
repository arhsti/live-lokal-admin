// TODO: Implement admin dashboard
export default function AdminPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          {/* TODO: List uploaded images */}
          <div>Images management placeholder</div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Templates</h2>
          {/* TODO: List templates */}
          <div>Templates management placeholder</div>
        </div>
      </div>
    </main>
  );
}