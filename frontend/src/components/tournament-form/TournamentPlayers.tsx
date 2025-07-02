import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, UserPlus, Pencil, Check } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const TournamentPlayers = () => {
  const { t } = useTranslation();
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'players',
  });

  const [editableIndexes, setEditableIndexes] = useState<number[]>([]);
  const isCommittingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditable = (index: number) => editableIndexes.includes(index);

  const enableEdit = (index: number) => {
    setEditableIndexes((prev) => [...prev, index]);
  };

  const disableEdit = (index: number) => {
    setEditableIndexes((prev) => prev.filter((i) => i !== index));
  };

  const handleBlur = (index: number) => {
    if (isCommittingRef.current) {
      isCommittingRef.current = false;
      return;
    }
    disableEdit(index);
  };

  const handleAddPlayer = () => {
    const value = inputRef.current?.value.trim();
    if (value) {
      append({ name: value });
      inputRef.current!.value = '';
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-gray-800">
          {t('tournament.playersTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            ref={inputRef}
            className="w-fit"
            placeholder={t('tournament.playerPlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddPlayer();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddPlayer}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center justify-start bg-gray-50 rounded-lg"
            >
              <span className="mr-2">{index + 1}. </span>
              <Input
                id={`player-${index}`}
                {...register(`players.${index}.name`)}
                placeholder={`${t('tournament.player')} ${index + 1}`}
                disabled={!isEditable(index)}
                onBlur={() => handleBlur(index)}
                className="w-1/2 mx-2"
              />
              {isEditable(index) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onMouseDown={() => {
                    isCommittingRef.current = true;
                  }}
                  onClick={() => disableEdit(index)}
                  className="text-green-500 hover:text-green-700"
                >
                  <Check className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => enableEdit(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-3 text-sm text-gray-600">
          {t('tournament.playersSum')} {fields.length}
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentPlayers;
