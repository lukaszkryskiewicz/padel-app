import type { TournamentApiValues } from '@/types/tournament';
import { CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const TournamentRulesCard = ({
  format,
}: Pick<TournamentApiValues, 'format'>) => {
  const { t } = useTranslation();
  const formatRules = t(`dashboard.rules.${format}`, {
    returnObjects: true,
  }) as string[];

  const getTournamentRules = () => {
    if (!Array.isArray(formatRules)) return null;

    return formatRules.map((line: string) => <li key={line}>{line}</li>);
  };
  return (
    <CardContent>
      <div className="space-y-3 text-gray-900">
        <ul className="list-disc list-outside space-y-2 ml-4">
          {getTournamentRules()}
        </ul>
      </div>
    </CardContent>
  );
};

export default TournamentRulesCard;
