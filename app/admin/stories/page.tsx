'use client';

export default function StoriesRenderedPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stories rendered</h1>
        <p className="text-sm text-gray-600 mt-1">Placeholder-liste over genererte stories.</p>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-600">Siste renders</h2>
        <ul className="mt-3 text-sm text-gray-600 space-y-2">
          <li>• Ingen renders ennå</li>
          <li>• Denne listen blir fylt når rendering er aktiv</li>
        </ul>
      </div>
    </div>
  );
}
