import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Gamepad2, Target, Users } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { RadioGroupField } from './RadioGroupField';
import { useTranslation } from 'react-i18next';
import { FormSectionCard } from './FormCardSection';
import {
  FINAL_MATCH_OPTIONS,
  POINTS_PER_MATCH_OPTIONS,
  RESULT_SORTING_OPTIONS,
  TEAM_FORMAT_OPTIONS,
  TOURNAMENT_FORMAT_OPTIONS,
} from '@/constants/tournaments';

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
          options={TOURNAMENT_FORMAT_OPTIONS}
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
          options={POINTS_PER_MATCH_OPTIONS}
        />
        <RadioGroupField
          className="text-sm font-medium"
          name="resultSorting"
          label={t('tournament.resultSortingLabel')}
          options={RESULT_SORTING_OPTIONS}
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
          options={TEAM_FORMAT_OPTIONS}
        />
        <RadioGroupField
          name="finalMatch"
          label={t('tournament.finalMatchLabel')}
          options={FINAL_MATCH_OPTIONS}
        />
      </FormSectionCard>
    </div>
  );
};

export default TournamentSettings;
