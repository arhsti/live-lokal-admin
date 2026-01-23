import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { ImageLibrary } from '@/components/ImageLibrary';

interface ImageData {
  id: string;
  url: string;
  description: string;
  jerseyNumber: string;
  eventType: string;
}

export default function ImagesV2Page() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        const mappedImages = Array.isArray(data) ? data.map((img: any) => ({
          id: img.id,
          url: img.imageUrl || img.url || '',
          description: img.tags?.description || '',
          jerseyNumber: img.tags?.number || '',
          eventType: img.tags?.eventType || '',
        })) : [];
        setImages(mappedImages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = () => {
    alert('Last opp bilde-funksjonalitet vil bli implementert');
  };

  const handleUpdateImage = async (id: string, data: Partial<ImageData>) => {
    try {
      const res = await fetch(`/api/images/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: data.jerseyNumber,
          eventType: data.eventType,
          description: data.description,
        }),
      });

      if (res.ok) {
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, ...data } : img
        ));
        alert('Bilde oppdatert');
      }
    } catch (error) {
      console.error(error);
      alert('Kunne ikke oppdatere bilde');
    }
  };

  const handleUseInStory = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      alert(`Bildet for spiller #${image.jerseyNumber} er nå klart for bruk i story`);
    }
  };

  const handlePostStory = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      alert(`Story publisert for spiller #${image.jerseyNumber}!`);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Bildebibliotek" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-[#64748B]">Laster...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Bildebibliotek" />
      <main>
        <ImageLibrary
          images={images}
          onUpload={handleUpload}
          onUpdateImage={handleUpdateImage}
          onUseInStory={handleUseInStory}
          onPostStory={handlePostStory}
        />
      </main>
    </>
  );
}
