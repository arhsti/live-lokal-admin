import Link from 'next/link';

export const metadata = {
  title: 'Live Lokal – Bildegalleri',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <nav className="hidden md:flex items-center space-x-3">
            <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Dashboard</Link>
            <Link href="/admin/images" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Images</Link>
            <Link href="/admin/templates" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Templates</Link>
            <Link href="/admin/config" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Admin</Link>
          </nav>

          <div className="flex items-center space-x-3" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
