import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Trophy className="h-6 w-6 text-blue-600" />
            <div>
              <span className="text-lg font-semibold text-gray-900">
                {t('footer.appTitle')}
              </span>
              <p className="text-sm text-gray-600">{t('footer.appClaim')}</p>
            </div>
          </div>

          <div className="flex space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t('footer.about')}
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t('footer.contact')}
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t('footer.privacyPolicy')}
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t('footer.terms')}
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
