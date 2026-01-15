import Link from 'next/link';

export const metadata = {
  title: 'Live Lokal – Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-2xl font-bold text-gray-900">Live Lokal</Link>
            <div className="text-sm text-gray-600">Live Lokal – Admin</div>
          </div>

          <nav className="hidden md:flex items-center space-x-3">
            <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Dashboard</Link>
            <Link href="/admin/images" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Images</Link>
            <Link href="/admin/templates" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Templates</Link>
            <Link href="/admin/config" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Admin</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link href="/login" className="text-sm px-3 py-2 rounded-md border">Logout</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
