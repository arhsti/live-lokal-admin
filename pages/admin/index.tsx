import Link from 'next/link';
import Header from '../../components/Header';

export default function Admin() {
  return (
    <div>
      <Header title="Dashboard" />
      <main className="container-base space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Admin overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-3">
            <h2 className="text-lg font-semibold">Images</h2>
            <p className="text-sm text-gray-600">Manage uploaded images</p>
            <Link href="/admin/images" className="btn-primary inline-block">
              Open Images
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
