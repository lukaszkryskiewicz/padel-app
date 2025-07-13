import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { InfoCardProps } from '@/types/tournament';

const InfoCard = ({
  icon,
  title,
  borderColor,
  titleColor,
  children,
  className = '',
}: InfoCardProps) => (
  <Card className={`border-2 ${borderColor} ${className}`}>
    <CardHeader className="pb-3">
      <CardTitle className={`flex items-center gap-2 ${titleColor}`}>
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    {children}
  </Card>
);

export default InfoCard;
