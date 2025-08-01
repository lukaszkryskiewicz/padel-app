import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthCard } from '@/components/auth/AuthCard';
import type { LoginFormData } from '@/types/auth';
import { loginUser } from '@/api/auth';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginUser(data);
      navigate('/');
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <AuthCard title={t('auth.login')} description={t('auth.loginHelper')}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput
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
          <AuthInput
            id="password"
            label={t('auth.pass')}
            placeholder={t('auth.passPlaceholder')}
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
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between">
            <Link
              to="/register"
              className="text-sm text-orange-500 hover:text-orange-600 hover:underline"
            >
              {t('auth.noAccount')}
            </Link>
            <Link
              to="#"
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              {t('auth.forgottenPass')}
            </Link>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 font-semibold shadow-lg"
          >
            {isSubmitting ? t('auth.logging') : t('auth.login')}
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

export default LoginPage;
