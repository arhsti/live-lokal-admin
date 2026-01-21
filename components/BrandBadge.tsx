import { brand } from '@/styles/tokens';

interface BrandBadgeProps {
  text: string;
}

export default function BrandBadge({ text }: BrandBadgeProps) {
  return <div className={brand.badge}>{text}</div>;
}
