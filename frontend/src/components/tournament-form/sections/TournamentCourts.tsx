import { Square, Plus } from 'lucide-react';
import { DynamicInputList } from '../shared/DynamicInputList';

const TournamentCourts = () => (
  <DynamicInputList
    name="courts"
    icon={<Square />}
    addButtonIcon={<Plus className="w-4 h-4" />}
  />
);

export default TournamentCourts;
