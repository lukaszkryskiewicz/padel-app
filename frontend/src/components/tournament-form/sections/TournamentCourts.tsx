import { Square, Plus } from 'lucide-react';
import { DynamicInputList } from '../shared/DynamicInputList';

const TournamentCourts = () => (
  <DynamicInputList
    name="courts"
    icon={<Square className="w-5 h-5 text-orange-500" />}
    addButtonIcon={<Plus className="w-4 h-4" />}
  />
);

export default TournamentCourts;
