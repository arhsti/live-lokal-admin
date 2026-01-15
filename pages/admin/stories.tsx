import Header from '../../components/Header';

export default function StoriesPage() {
  return (
    <div>
      <Header title="Stories" />
      <main className="container-base space-y-4">
        <h1 className="text-2xl font-bold">Stories Rendered</h1>
        <p className="text-sm text-gray-600">Ingen renders ennå. Denne siden er en placeholder.</p>
        <div className="card p-4 text-sm text-gray-600">Tom liste</div>
      </main>
    </div>
  );
}
