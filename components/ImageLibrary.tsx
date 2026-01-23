import { useState } from 'react';
import { Upload, Search, ZoomIn } from 'lucide-react';

interface ImageData {
  id: string;
  url: string;
  description: string;
  jerseyNumber: string;
  eventType: string;
}

interface ImageLibraryProps {
  images: ImageData[];
  onUpload: () => void;
  onUpdateImage: (id: string, data: Partial<ImageData>) => void;
  onUseInStory: (id: string) => void;
  onPostStory: (id: string) => void;
}

export function ImageLibrary({
  images,
  onUpload,
  onUpdateImage,
  onUseInStory,
  onPostStory,
}: ImageLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const filteredImages = images.filter((img) =>
    searchQuery ? img.jerseyNumber.includes(searchQuery) : true
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Bildebibliotek</h1>
        <p className="text-[#64748B]">
          Bilder som brukes ved automatiske kamp-hendelser
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={onUpload}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0EA5E9] text-white rounded-lg font-medium hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Upload size={20} />
          Last opp bilde
        </button>

        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Søk etter draktnummer..."
            className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
        >
          <option value="newest">Nyeste først</option>
          <option value="oldest">Eldste først</option>
          <option value="jersey">Draktnummer</option>
        </select>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-8">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div
              className="relative aspect-[4/3] bg-[#F8FAFC] overflow-hidden group cursor-pointer"
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <img
                src={image.url}
                alt={image.description || 'Player image'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {hoveredImage === image.id && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <ZoomIn size={32} className="text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wide text-[#94A3B8] mb-2">
                  Beskrivelse
                </label>
                <textarea
                  value={image.description}
                  onChange={(e) =>
                    onUpdateImage(image.id, { description: e.target.value })
                  }
                  placeholder="Beskriv bildet..."
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent resize-none"
                />
              </div>

              {/* Jersey Number & Event Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-[#94A3B8] mb-2">
                    Draktnummer
                  </label>
                  <input
                    type="text"
                    value={image.jerseyNumber}
                    onChange={(e) =>
                      onUpdateImage(image.id, { jerseyNumber: e.target.value })
                    }
                    placeholder="10"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-[#94A3B8] mb-2">
                    Hendelse
                  </label>
                  <select
                    value={image.eventType}
                    onChange={(e) =>
                      onUpdateImage(image.id, { eventType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                  >
                    <option value="">Velg...</option>
                    <option value="goal">Mål</option>
                    <option value="yellow">Gult kort</option>
                    <option value="red">Rødt kort</option>
                    <option value="substitute">Bytte</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onUpdateImage(image.id, {})}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] active:scale-[0.98] transition-all"
                >
                  Lagre
                </button>
                <button
                  onClick={() => onUseInStory(image.id)}
                  className="flex-1 px-3 py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Bruk i story
                </button>
              </div>
              <button
                onClick={() => onPostStory(image.id)}
                className="w-full px-3 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Post story
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-16 text-[#94A3B8]">
          <p>Ingen bilder funnet</p>
        </div>
      )}
    </div>
  );
}
