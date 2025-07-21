import { TableCell } from '@/components/ui/table';
import type { StandingsTableCellProps } from '@/types/tournament';

const StandingsTableCell = ({ className, value }: StandingsTableCellProps) => {
  return (
    <TableCell className="text-center">
      <span className={className}>{value}</span>
    </TableCell>
  );
};

export default StandingsTableCell;
