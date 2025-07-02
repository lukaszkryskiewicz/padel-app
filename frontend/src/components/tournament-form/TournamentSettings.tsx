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
            { value: 'Americano', label: 'Americano', id: 'americano' },
            { value: 'Mexicano', label: 'Mexicano', id: 'mexicano' },
          ]}
        />
      </FormSectionCard>

      {/* Scoring System */}
      <FormSectionCard
        icon={<Clock className="w-5 h-5 text-orange-500" />}
        title={t('tournament.scoringSystem')}
      >
        <RadioGroupField
          className="text-sm font-medium"
          name="scoring"
          label={t('tournament.scoringLabel')}
          options={[
            { value: 'Do 11 punktów', label: 'Do 11 punktów', id: '11pts' },
            { value: 'Do 21 punktów', label: 'Do 21 punktów', id: '21pts' },
            { value: 'Do 24 punktów', label: 'Do 24 punktów', id: '24pts' },
            { value: 'Dowolne', label: 'Dowolne', id: 'custom' },
          ]}
        />
        <RadioGroupField
          className="text-sm font-medium"
          name="resultSorting"
          label={t('tournament.resultSortingLabel')}
          options={[
            { value: 'Po punktach', label: 'Po punktach', id: 'points' },
            { value: 'Po wygranych', label: 'Po wygranych', id: 'wins' },
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
            { value: 'Gracz', label: 'Gracz', id: 'player' },
            { value: 'Para', label: 'Para', id: 'pair' },
          ]}
        />
        <RadioGroupField
          name="finalMatch"
          label={t('tournament.finalMatchLabel')}
          options={[
            {
              value: '1 & 2 vs 3 & 4',
              label: '1 & 2 vs 3 & 4',
              id: 'final1',
            },
            {
              value: '1 & 3 vs 2 & 4',
              label: '1 & 3 vs 2 & 4',
              id: 'final2',
            },
            {
              value: '1 & 4 vs 2 & 3',
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
