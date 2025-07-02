import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Target, Users } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { RadioGroupField } from './RadioGroupField';
import { useTranslation } from 'react-i18next';

export const TournamentSettings = () => {
  const { t } = useTranslation();
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Target className="w-5 h-5 text-orange-500" />
            {t('tournament.basicInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">{t('tournament.tournamentName')}</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={t('tournament.tournamentName')}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tournament Type */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-800">
            {t('tournament.tournamentType')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroupField
            className="text-sm font-medium"
            name="format"
            options={[
              { value: 'Americano', label: 'Americano', id: 'americano' },
              { value: 'Mexicano', label: 'Mexicano', id: 'mexicano' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Clock className="w-5 h-5 text-orange-500" />
            {t('tournament.scoringSystem')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroupField
            className="text-sm font-medium"
            name="scoring"
            label={t('tournament.scoring')}
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
            label={t('tournament.resultSorting')}
            options={[
              { value: 'Po punktach', label: 'Po punktach', id: 'points' },
              { value: 'Po wygranych', label: 'Po wygranych', id: 'wins' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Team Format & Final Match */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Users className="w-5 h-5 text-orange-500" />
            {t('tournament.teamFormat')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroupField
            className="text-sm font-medium"
            name="teamFormat"
            label={t('tournament.teamFormat')}
            options={[
              { value: 'Gracz', label: 'Gracz', id: 'player' },
              { value: 'Para', label: 'Para', id: 'pair' },
            ]}
          />
          <RadioGroupField
            name="finalMatch"
            label={t('tournament.finalParing')}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentSettings;
