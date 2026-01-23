import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';

interface MatchEvent {
  id: string;
  eventType: 'goal' | 'yellow' | 'red' | 'substitute';
  time: string;
  jerseyNumber: string;
  status: 'draft' | 'published';
  playerName?: string;
  imageUrl?: string;
}

interface Match {
  id: string;
  name: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished';
  events: MatchEvent[];
}

interface EventsProps {
  matches: Match[];
  onViewStory: (event: MatchEvent, match: Match) => void;
  onPostStory: (eventId: string) => void;
}

export function Events({ matches, onViewStory, onPostStory }: EventsProps) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(
    matches[0]?.id || null
  );

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'goal':
        return 'bg-[#10B981] text-white';
      case 'yellow':
        return 'bg-[#F59E0B] text-white';
      case 'red':
        return 'bg-[#EF4444] text-white';
      case 'substitute':
        return 'bg-[#0EA5E9] text-white';
      default:
        return 'bg-[#94A3B8] text-white';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'goal':
        return 'Mål';
      case 'yellow':
        return 'Gult kort';
      case 'red':
        return 'Rødt kort';
      case 'substitute':
        return 'Bytte';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Hendelser</h1>
        <p className="text-[#64748B]">
          Administrer og publiser kamp-hendelser til sosiale medier
        </p>
      </div>

      {/* Matches Accordion */}
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            {/* Match Header */}
            <button
              onClick={() =>
                setExpandedMatch(expandedMatch === match.id ? null : match.id)
              }
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
            >
              <div className="flex items-center gap-4">
                {expandedMatch === match.id ? (
                  <ChevronDown size={20} className="text-[#94A3B8]" />
                ) : (
                  <ChevronRight size={20} className="text-[#94A3B8]" />
                )}
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <h3>{match.name}</h3>
                    {match.status === 'live' && (
                      <span className="px-2 py-0.5 bg-[#EF4444] text-white text-xs rounded-full uppercase tracking-wide">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#64748B]">
                    {match.homeTeam} vs {match.awayTeam}
                  </div>
                </div>
              </div>
              <div className="text-2xl">
                {match.homeScore} - {match.awayScore}
              </div>
            </button>

            {/* Events Table */}
            {expandedMatch === match.id && (
              <div className="border-t border-[#E2E8F0]">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#94A3B8]">
                          Hendelse
                        </th>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#94A3B8]">
                          Tidspunkt
                        </th>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#94A3B8]">
                          Draktnummer
                        </th>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#94A3B8]">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#94A3B8]">
                          Forhåndsvisning
                        </th>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#94A3B8]">
                          Handling
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {match.events.map((event) => (
                        <tr key={event.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEventBadgeColor(
                                event.eventType
                              )}`}
                            >
                              {getEventLabel(event.eventType)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">{event.time}'</td>
                          <td className="px-6 py-4">
                            <span className="font-medium">
                              #{event.jerseyNumber}
                            </span>
                            {event.playerName && (
                              <div className="text-sm text-[#64748B]">
                                {event.playerName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {event.status === 'published' ? (
                              <span className="text-[#10B981] text-sm font-medium">
                                Publisert
                              </span>
                            ) : (
                              <span className="text-[#94A3B8] text-sm">
                                Utkast
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => onViewStory(event, match)}
                              className="flex items-center gap-2 px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-sm hover:bg-white active:scale-[0.98] transition-all"
                            >
                              <Eye size={16} />
                              Se story
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            {event.status === 'published' ? (
                              <button
                                disabled
                                className="px-4 py-2 bg-[#E2E8F0] text-[#94A3B8] rounded-lg text-sm font-medium cursor-not-allowed"
                              >
                                Postet
                              </button>
                            ) : (
                              <button
                                onClick={() => onPostStory(event.id)}
                                className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
                              >
                                Post story
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-16 text-[#94A3B8]">
          <p>Ingen aktive kamper</p>
        </div>
      )}
    </div>
  );
}
