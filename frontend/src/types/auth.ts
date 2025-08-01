import type {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from 'react-hook-form';

export interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export interface AuthInputProps<T extends FieldValues> {
  label: string;
  id: Path<T>;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  error?: string;
  showPasswordToggle?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
  autoComplete?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
