import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFormContext } from 'react-hook-form';
import type { RadioGroupFieldProps } from '@/types/tournament';

export const RadioGroupField = ({
  name,
  label,
  options,
  icon,
  className,
}: RadioGroupFieldProps) => {
  const { watch, setValue } = useFormContext();
  const selected = watch(name);

  return (
    <div className={className}>
      {icon}
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <RadioGroup
        value={selected}
        onValueChange={(val) => setValue(name, val)}
        className="mt-2"
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
            <Label htmlFor={`${name}-${opt.value}`}>{opt.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
