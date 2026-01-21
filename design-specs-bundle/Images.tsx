import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ChevronLeft, Plus, Instagram, Save, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Import stock images
import img1 from "@assets/stock_images/action_shot_of_a_soc_eec0232a.jpg";
import img2 from "@assets/stock_images/soccer_player_celebr_ef452fb3.jpg";
import img3 from "@assets/stock_images/soccer_team_huddle_o_7c4e3b6c.jpg";

const mockImages = [
  { id: 1, src: img1, desc: "Action shot from first half", number: "10", event: "goal" },
  { id: 2, src: img2, desc: "Goal celebration", number: "07", event: "goal" },
  { id: 3, src: img3, desc: "Team huddle before match", number: "00", event: "" },
  { id: 4, src: img1, desc: "Free kick setup", number: "23", event: "card" },
];

export default function ImagesPage() {
  const [sortBy, setSortBy] = useState<string>("default");
  const [filterNumber, setFilterNumber] = useState<string>("");

  const filteredAndSortedImages = useMemo(() => {
    let images = [...mockImages];
    
    // Apply filter first
    if (filterNumber) {
      images = images.filter(img => img.number.includes(filterNumber));
    }

    // Apply sorting
    if (sortBy === "number") {
      return images.sort((a, b) => a.number.localeCompare(b.number));
    }
    if (sortBy === "event") {
      return images.sort((a, b) => (a.event || "").localeCompare(b.event || ""));
    }
    return images;
  }, [sortBy, filterNumber]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bildebibliotek</h1>
            <p className="text-muted-foreground">Administrer og tagg bilder fra kamper</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-lg border border-border/50">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Søk draktnr:</span>
            <Input 
              placeholder="F.eks. 10" 
              value={filterNumber}
              onChange={(e) => setFilterNumber(e.target.value)}
              className="w-[80px] h-8 border-none bg-transparent focus-visible:ring-0 shadow-none font-mono text-sm p-0"
            />
          </div>

          <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-lg border border-border/50">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Sorter:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] h-8 border-none bg-transparent focus:ring-0 shadow-none">
                <SelectValue placeholder="Velg..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Nyeste</SelectItem>
                <SelectItem value="number">Draktnummer</SelectItem>
                <SelectItem value="event">Hendelse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Last opp
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedImages.map((img) => (
          <Card key={img.id} className="overflow-hidden border-border/60 hover:shadow-md transition-shadow">
            <div className="aspect-[4/3] relative group cursor-pointer bg-secondary/20 overflow-hidden">
              <img 
                src={img.src} 
                alt="Match photo" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`desc-${img.id}`} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Beskrivelse</Label>
                <Textarea 
                  id={`desc-${img.id}`} 
                  defaultValue={img.desc} 
                  className="min-h-[50px] text-xs bg-secondary/30 border-transparent focus:bg-white focus:border-primary/10 transition-all resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`num-${img.id}`} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Draktnr</Label>
                  <Input 
                    id={`num-${img.id}`} 
                    defaultValue={img.number} 
                    className="h-8 text-xs bg-secondary/30 border-transparent focus:bg-white focus:border-primary/10 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`event-${img.id}`} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hendelse</Label>
                  <Select defaultValue={img.event}>
                    <SelectTrigger id={`event-${img.id}`} className="h-8 text-xs bg-secondary/30 border-transparent focus:bg-white focus:border-primary/10 transition-all">
                      <SelectValue placeholder="Velg..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goal">Mål</SelectItem>
                      <SelectItem value="card">Kort</SelectItem>
                      <SelectItem value="sub">Bytte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button variant="secondary" className="flex-1 h-8 text-[11px] font-semibold uppercase tracking-tight hover-elevate">
                  <Save className="mr-1.5 h-3 w-3" /> Lagre
                </Button>
                <Button variant="outline" className="flex-1 h-8 text-[11px] font-semibold uppercase tracking-tight border-primary/20 text-primary hover:bg-primary/5">
                  <Instagram className="mr-1.5 h-3 w-3" /> Story
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
