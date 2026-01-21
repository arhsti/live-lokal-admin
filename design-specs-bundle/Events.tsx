import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronDown, ChevronUp, Eye, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { matches, events } from "@/lib/mockData";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Import generated/stock assets
import storyBg from "@assets/generated_images/vertical_instagram_story_background_for_sports_match.png"; 

export default function EventsPage() {
  const [expandedMatch, setExpandedMatch] = useState<string | null>("m1");
  const [openPreview, setOpenPreview] = useState(false);

  const toggleMatch = (id: string) => {
    setExpandedMatch(expandedMatch === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hendelser</h1>
          <p className="text-muted-foreground">Oversikt over kamper og live-oppdateringer</p>
        </div>
      </div>

      {/* Match Summary Boxes */}
      <div className="flex flex-col gap-6">
        {matches.map((match) => (
          <Card 
            key={match.id} 
            className={`cursor-pointer transition-all duration-300 border-2 ${expandedMatch === match.id ? 'border-primary ring-2 ring-primary/5 shadow-md' : 'border-transparent hover:border-border'}`}
            onClick={() => toggleMatch(match.id)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    Eliteserien
                  </span>
                  <div className="text-sm text-muted-foreground font-medium pt-2">
                    {match.time === "FT" ? "Ferdigspilt" : `Spilles nå • ${match.time}`}
                  </div>
                </div>
                {match.time !== "FT" && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="text-center flex-1">
                  <div className="text-lg font-bold truncate">{match.homeTeam}</div>
                </div>
                <div className="bg-secondary px-4 py-2 rounded-lg font-mono text-2xl font-bold mx-2">
                  {match.score}
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold truncate">{match.awayTeam}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50 mt-2">
                <span className="text-muted-foreground font-medium">{match.eventCount} hendelser registrert</span>
                <Button variant="ghost" size="sm" className={`gap-2 ${expandedMatch === match.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {expandedMatch === match.id ? 'Skjul hendelser' : 'Vis hendelser'}
                  {expandedMatch === match.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events Table */}
      {expandedMatch && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <Card className="border-border/60 shadow-soft overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">Tid</TableHead>
                  <TableHead className="w-[150px]">Type</TableHead>
                  <TableHead>Beskrivelse</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px] text-center">Preview</TableHead>
                  <TableHead className="w-[140px] text-center">Handling</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.filter(e => e.matchId === expandedMatch).map((event) => (
                  <TableRow key={event.id} className="group">
                    <TableCell className="font-mono font-medium text-lg text-muted-foreground">
                      {event.time}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${event.type === 'Goal' ? 'bg-green-500' : event.type === 'Card' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                        <span className="font-semibold">{event.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{event.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.player} #{event.playerNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.status === 'Published' ? 'secondary' : 'outline'} className="font-normal">
                        {event.status === 'Published' ? 'Publisert' : 'Utkast'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-secondary">
                            <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[400px] w-full aspect-[9/16]">
                           {/* Story Preview Modal Content */}
                           <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black shadow-2xl">
                              <img 
                                src={storyBg || "https://placehold.co/1080x1920/1a1a1a/FFF?text=Story+Preview"} 
                                alt="Story Preview" 
                                className="w-full h-full object-cover opacity-90"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-8">
                                <div className="text-white pt-12">
                                  <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium mb-4">
                                    {event.time} • {event.type.toUpperCase()}
                                  </div>
                                  <h2 className="text-4xl font-heading font-bold leading-tight">{event.player}</h2>
                                  <p className="text-xl text-white/80 mt-2">#{event.playerNumber}</p>
                                </div>
                                <div className="text-white pb-12">
                                  <div className="text-2xl font-bold mb-2">Live Lokal IL</div>
                                  <div className="h-1 w-24 bg-white/50 rounded-full" />
                                </div>
                              </div>
                              <Button 
                                className="absolute top-4 right-4 rounded-full h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white z-50"
                                onClick={() => setOpenPreview(false)}
                              >
                                ✕
                              </Button>
                           </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-center">
                      {event.status === 'Published' ? (
                         <Button disabled variant="ghost" size="sm" className="text-green-600 font-medium">
                           <CheckCircle2 className="mr-1 h-4 w-4" /> Posted
                         </Button>
                      ) : (
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                          <Send className="mr-2 h-3 w-3" /> Post
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
