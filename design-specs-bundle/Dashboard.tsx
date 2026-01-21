import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Calendar, ArrowUpRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Oversikt</h1>
        <p className="text-muted-foreground text-lg">Velkommen tilbake, Admin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Images Card */}
        <Link href="/images">
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/20 h-full flex flex-col">
            <CardContent className="p-8 flex-1 flex flex-col items-start space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-secondary text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <ImageIcon className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">Bilder</h2>
                <p className="text-muted-foreground">
                  Administrer bildebiblioteket, last opp nye bilder og koble dem til spillere.
                </p>
              </div>
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-0 flex justify-between items-center">
              <span className="text-sm font-medium bg-secondary px-3 py-1 rounded-full text-secondary-foreground">
                124 bilder
              </span>
              <Button variant="ghost" className="group-hover:translate-x-1 transition-transform p-0 hover:bg-transparent text-primary font-semibold">
                Åpne <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>

        {/* Events Card */}
        <Link href="/events">
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/20 h-full flex flex-col">
            <CardContent className="p-8 flex-1 flex flex-col items-start space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-secondary text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">Hendelser</h2>
                <p className="text-muted-foreground">
                  Se kampoversikt, rediger hendelser og publiser stories direkte.
                </p>
              </div>
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-0 flex justify-between items-center">
              <span className="text-sm font-medium bg-secondary px-3 py-1 rounded-full text-secondary-foreground">
                5 aktive kamper
              </span>
              <Button variant="ghost" className="group-hover:translate-x-1 transition-transform p-0 hover:bg-transparent text-primary font-semibold">
                Administrer <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>
    </div>
  );
}
