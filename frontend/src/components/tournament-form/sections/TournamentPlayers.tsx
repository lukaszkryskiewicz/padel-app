import { UserPlus, User } from 'lucide-react';
import { DynamicInputList } from '../shared/DynamicInputList';

const TournamentPlayers = () => (
  <DynamicInputList
    name="players"
    icon={<User className="w-5 h-5 text-orange-500" />}
    addButtonIcon={<UserPlus className="w-4 h-4" />}
  />
);
export default TournamentPlayers;
