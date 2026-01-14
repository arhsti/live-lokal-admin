'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    fontSize: 64,
  });

  const handleCreateTemplate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    setFormData({
      name: '',
      description: '',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontSize: 64,
    });
    setShowCreateForm(false);
  };

  const testTemplate = async (template: Template) => {
    try {
      const response = await fetch('/api/render-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Sample text for ${template.name}`,
          templateId: template.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        window.open(result.image_url, '_blank');
      } else {
        alert('Failed to render story');
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('Error testing template');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Live Lokal
              </Link>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">Templates</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Create Template Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
          >
            <span>🎨</span>
            <span>{showCreateForm ? 'Cancel' : 'Create New Template'}</span>
          </button>
        </div>

        {/* Create Template Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Create New Template</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Dark Theme, Bright Colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Brief description of the template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-full h-10 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-full h-10 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <input
                  type="number"
                  value={formData.fontSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                  className="w-full p-2 border rounded-lg"
                  min="24"
                  max="120"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleCreateTemplate}
                  disabled={!formData.name.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Your Templates ({templates.length})</h2>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-lg font-medium mb-2">No templates created yet</h3>
              <p className="text-gray-600 mb-4">Create your first template to customize story appearance.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Create Your First Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div
                    className="aspect-square flex items-center justify-center text-white font-bold text-center p-4"
                    style={{ backgroundColor: template.backgroundColor }}
                  >
                    <div>
                      <div
                        className="text-lg mb-2"
                        style={{
                          color: template.textColor,
                          fontSize: `${Math.min(template.fontSize / 4, 24)}px`
                        }}
                      >
                        Sample Text
                      </div>
                      <div className="text-xs opacity-75">
                        {template.name}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      Font Size: {template.fontSize}px
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => testTemplate(template)}
                        className="flex-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Test Render
                      </button>
                      <button className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}