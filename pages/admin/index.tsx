import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';

export default function AdminDashboard() {
  const [imageCount, setImageCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [imagesRes, templatesRes] = await Promise.all([
        fetch('/api/images'),
        fetch('/api/templates'),
      ]);
      const imagesData = imagesRes.ok ? await imagesRes.json() : [];
      const templatesData = templatesRes.ok ? await templatesRes.json() : [];
      setImageCount(Array.isArray(imagesData) ? imagesData.length : 0);
      setTemplateCount(Array.isArray(templatesData) ? templatesData.length : 0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Header title="Dashboard" />
      <main className="container-base space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Admin overview — quick actions and summaries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Images</h2>
              <span className="text-2xl">🖼️</span>
            </div>
            <p className="text-sm text-gray-600">Upload and manage images</p>
            <div className="text-sm text-gray-500">{imageCount} images</div>
            <Link href="/admin/images" className="btn-primary inline-block">Manage Images</Link>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Templates</h2>
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-sm text-gray-600">Create story templates</p>
            <div className="text-sm text-gray-500">{templateCount} templates</div>
            <Link href="/admin/templates" className="btn-primary inline-block">Manage Templates</Link>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Stories Rendered</h2>
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-sm text-gray-600">Generated stories</p>
            <div className="text-sm text-gray-500">0 stories</div>
            <Link href="/admin/stories" className="btn-primary inline-block">View Rendered Stories</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
