import { X } from 'lucide-react';
import { useEffect } from 'react';

interface StoryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: string;
  time: string;
  score: string;
  imageUrl: string;
  jerseyNumber: string;
  playerName?: string;
  teamName: string;
}

export function StoryPreviewModal({
  isOpen,
  onClose,
  eventType,
  time,
  score,
  imageUrl,
  jerseyNumber,
  playerName,
  teamName,
}: StoryPreviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'goal':
        return 'MÅL!';
      case 'yellow':
        return 'GULT KORT';
      case 'red':
        return 'RØDT KORT';
      case 'substitute':
        return 'INNBYTTE';
      default:
        return type.toUpperCase();
    }
  };

  const getEventEmoji = (type: string) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'yellow':
        return '🟨';
      case 'red':
        return '🟥';
      case 'substitute':
        return '🔄';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Story Card - Instagram Story Ratio 9:16 */}
          <div className="w-[360px] h-[640px] bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Story Content */}
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={imageUrl}
                  alt="Story background"
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-between p-6 text-white">
                {/* Top Section */}
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wider opacity-90">
                    {teamName}
                  </div>
                  <div className="text-sm font-medium opacity-90">
                    {time}' • {score}
                  </div>
                </div>

                {/* Center Section - Event Type */}
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-2">
                    {getEventEmoji(eventType)}
                  </div>
                  <div className="text-4xl font-semibold tracking-tight">
                    {getEventLabel(eventType)}
                  </div>
                </div>

                {/* Bottom Section - Player Info */}
                <div className="text-center space-y-2">
                  <div className="text-5xl font-semibold">
                    #{jerseyNumber}
                  </div>
                  {playerName && (
                    <div className="text-xl font-medium">
                      {playerName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
