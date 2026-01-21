import { useEffect, useState } from 'react';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/Card';
import { DashboardGrid } from '@/components/ui/Grid';
import { IconBadge } from '@/components/ui/IconBadge';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/LinkButton';
import { cn } from '@/components/ui/utils';
import { container, spacing, typography, layout, icon, effects } from '@/styles/tokens';

export default function Admin() {
  const [imageCount, setImageCount] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  useEffect(() => {
    loadImageCount();
    loadMatchCount();
  }, []);

  async function loadImageCount() {
    try {
      const res = await fetch('/api/images');
      if (!res.ok) return;
      const data = await res.json();
      setImageCount(Array.isArray(data) ? data.length : null);
    } catch (_e) {
      setImageCount(null);
    }
  }

  async function loadMatchCount() {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const ids = new Set<string>();
      data.forEach((event) => {
        if (typeof event?.objectId_match === 'string' && event.objectId_match.trim()) {
          ids.add(event.objectId_match.trim());
        }
      });
      setMatchCount(ids.size);
    } catch (_e) {
      setMatchCount(null);
    }
  }

  return (
    <div>
      <Header title="Admin" />
      <main className={cn(container.base, spacing.section)}>
        <div className={cn(layout.col, spacing.stackTight)}>
          <h1 className={typography.pageTitle}>Oversikt</h1>
          <p className={typography.lead}>Velg område for å administrere innhold.</p>
        </div>

        <DashboardGrid>
          <Card className={cn(layout.col, effects.cardHover)}>
            <CardContent className={cn(layout.col, spacing.cardLarge, spacing.gap6)}>
              <IconBadge>
                <ImageIcon className={icon.lg} />
              </IconBadge>
              <div className={cn(layout.col, spacing.field)}>
                <div className={cn(layout.rowBetween, spacing.inline)}>
                  <h2 className={typography.cardTitle}>Bilder</h2>
                  <Badge>{imageCount === null ? '—' : `${imageCount} bilder`}</Badge>
                </div>
                <p className={typography.subtitle}>Last opp og administrer bilder som brukes i stories.</p>
              </div>
              <div className={cn(layout.row, layout.mtAuto)}>
                <LinkButton href="/admin/images">Åpne bilder</LinkButton>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(layout.col, effects.cardHover)}>
            <CardContent className={cn(layout.col, spacing.cardLarge, spacing.gap6)}>
              <IconBadge>
                <Calendar className={icon.lg} />
              </IconBadge>
              <div className={cn(layout.col, spacing.field)}>
                <h2 className={typography.cardTitle}>Hendelser</h2>
                <p className={typography.subtitle}>Motta og publiser kamp-hendelser.</p>
                <Badge>{matchCount === null ? '—' : `${matchCount} aktive kamper`}</Badge>
              </div>
              <div className={cn(layout.row, layout.mtAuto)}>
                <LinkButton href="/admin/hendelser">Administrer hendelser</LinkButton>
              </div>
            </CardContent>
          </Card>
        </DashboardGrid>
      </main>
    </div>
  );
}
