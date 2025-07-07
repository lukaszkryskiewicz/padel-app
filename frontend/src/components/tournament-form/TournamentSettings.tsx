import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Gamepad2, Target, Users } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { RadioGroupField } from './RadioGroupField';
import { useTranslation } from 'react-i18next';
import { FormSectionCard } from './FormCardSection';

export const TournamentSettings = () => {
  const { t } = useTranslation();
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <FormSectionCard
        icon={<Target className="w-5 h-5 text-orange-500" />}
        title={t('tournament.basicInfo')}
      >
        <div>
          <Label htmlFor="title">{t('tournament.tournamentName')}</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder={t('tournament.tournamentName')}
            className="mt-1"
          />
        </div>
      </FormSectionCard>

      {/* Tournament Type */}
      <FormSectionCard
        icon={<Gamepad2 className="w-5 h-5 text-orange-500" />}
        title={t('tournament.tournamentType')}
      >
        <RadioGroupField
          className="text-sm font-medium"
          name="format"
          options={[
            { value: 'AMERICANO', label: 'Americano', id: 'americano' },
            { value: 'MEXICANO', label: 'Mexicano', id: 'mexicano' },
          ]}
        />
      </FormSectionCard>

      {/* Scoring System */}
      <FormSectionCard
        icon={<Clock className="w-5 h-5 text-orange-500" />}
        title={t('tournament.pointsPerMatch')}
      >
        <RadioGroupField
          className="text-sm font-medium"
          name="pointsPerMatch"
          label={t('tournament.pointsPerMatchLabel')}
          options={[
            { value: '11', label: 'Do 11 punktów', id: '11pts' },
            { value: '21', label: 'Do 21 punktów', id: '21pts' },
            { value: '24', label: 'Do 24 punktów', id: '24pts' },
            { value: '0', label: 'Dowolne', id: 'custom' },
          ]}
        />
        <RadioGroupField
          className="text-sm font-medium"
          name="resultSorting"
          label={t('tournament.resultSortingLabel')}
          options={[
            { value: 'POINTS', label: 'Po punktach', id: 'points' },
            { value: 'WINS', label: 'Po wygranych', id: 'wins' },
          ]}
        />
      </FormSectionCard>

      {/* Team Format & Final Match */}
      <FormSectionCard
        icon={<Users className="w-5 h-5 text-orange-500" />}
        title={t('tournament.teamFormatLabel')}
      >
        <RadioGroupField
          className="text-sm font-medium"
          name="teamFormat"
          label={t('tournament.teamFormatLabel')}
          options={[
            { value: 'PLAYER', label: 'Gracz', id: 'player' },
            { value: 'PAIR', label: 'Para', id: 'pair' },
          ]}
        />
        <RadioGroupField
          name="finalMatch"
          label={t('tournament.finalMatchLabel')}
          options={[
            {
              value: '1',
              label: '1 & 2 vs 3 & 4',
              id: 'final1',
            },
            {
              value: '2',
              label: '1 & 3 vs 2 & 4',
              id: 'final2',
            },
            {
              value: '3',
              label: '1 & 4 vs 2 & 3',
              id: 'final3',
            },
          ]}
        />
      </FormSectionCard>
    </div>
  );
};

export default TournamentSettings;
