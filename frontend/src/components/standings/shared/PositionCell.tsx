import { Badge } from '@/components/ui/badge';
import { TableCell } from '@/components/ui/table';
import { getRankBadge, getRankIcon } from '@/lib/standings-utils';

const PositionCell = ({ position }: { position: number }) => {
  return (
    <TableCell className="text-center">
      <Badge variant="outline" className={`${getRankBadge(position)} border`}>
        <span className="flex items-center gap-1">{getRankIcon(position)}</span>
      </Badge>
    </TableCell>
  );
};

export default PositionCell;
