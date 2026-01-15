import Link from 'next/link';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="w-full bg-gray-100 border-b border-gray-200">
      <div className="container-base flex items-center justify-between">
        <Link href="/admin" className="text-gray-900 font-semibold no-underline">
          Live lokal
        </Link>
        <div className="text-sm font-medium text-gray-700">{title}</div>
        <button className="text-sm text-gray-600 hover:text-gray-900">Logg ut</button>
      </div>
    </header>
  );
}
