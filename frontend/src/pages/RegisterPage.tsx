import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import type { RegisterFormData } from '@/types/auth';
import { useForm } from 'react-hook-form';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { registerUser } from '@/api/auth';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <AuthCard
        title={t('auth.register')}
        description={t('auth.registerHelper')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AuthInput<RegisterFormData>
              id="firstName"
              label={t('auth.firstName')}
              register={register}
              error={errors.firstName?.message}
              rules={{ required: t('auth.required') }}
              autoComplete="given-name"
            />
            <AuthInput<RegisterFormData>
              id="lastName"
              label={t('auth.lastName')}
              register={register}
              error={errors.lastName?.message}
              rules={{ required: t('auth.required') }}
              autoComplete="family-name"
            />
          </div>
          <AuthInput<RegisterFormData>
            id="email"
            label={t('auth.email')}
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            register={register}
            error={errors.email?.message}
            rules={{
              required: t('auth.required'),
              pattern: {
                value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                message: t('auth.emailInvalid'),
              },
            }}
            autoComplete="email"
          />
          <AuthInput<RegisterFormData>
            id="password"
            label={t('auth.pass')}
            placeholder={t('auth.passCreatePlaceholder')}
            register={register}
            error={errors.password?.message}
            showPasswordToggle
            rules={{
              required: t('auth.required'),
              minLength: {
                value: 6,
                message: t('auth.passTooShort'),
              },
            }}
            autoComplete="new-password"
          />
          <AuthInput<RegisterFormData>
            id="confirmPassword"
            label={t('auth.confirmPass')}
            placeholder={t('auth.confirmPass')}
            register={register}
            error={errors.confirmPassword?.message}
            showPasswordToggle
            rules={{
              required: t('auth.required'),
              validate: (value) =>
                value === password || t('auth.passwordsMustMatch'),
            }}
            autoComplete="new-password"
          />
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-orange-500 hover:text-orange-600 hover:underline"
            >
              {t('auth.alreadyHaveAccount')}
            </Link>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 font-semibold shadow-lg"
          >
            {isSubmitting ? t('auth.creating') : t('auth.register')}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.back')}
            <Link
              to="/"
              className="text-orange-500 hover:text-orange-600 hover:underline font-medium"
            >
              {t('auth.homePage')}
            </Link>
          </p>
        </div>
      </AuthCard>
    </div>
  );
};

export default RegisterPage;
