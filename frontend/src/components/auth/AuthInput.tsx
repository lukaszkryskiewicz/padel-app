import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AuthInputProps } from '@/types/auth';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { FieldValues } from 'react-hook-form';

export const AuthInput = <T extends FieldValues>({
  label,
  id,
  type = 'text',
  placeholder,
  register,
  error,
  showPasswordToggle,
  rules,
  autoComplete,
}: AuthInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? 'text'
      : 'password'
    : type;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          {...register(id, rules)}
          className={`border-2 border-gray-200 focus:ring-2 focus:ring-orange-500 pr-10 ${
            error ? 'border-red-500' : ''
          }`}
          autoComplete={autoComplete}
        />
        {showPasswordToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
