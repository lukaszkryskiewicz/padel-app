import { UserPlus, User } from 'lucide-react';
import { DynamicInputList } from './DynamicInputList';

const TournamentPlayers = () => (
  <DynamicInputList
    name="players"
    icon={<User />}
    addButtonIcon={<UserPlus className="w-4 h-4" />}
  />
);
export default TournamentPlayers;
