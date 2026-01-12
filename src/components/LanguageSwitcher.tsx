import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from './Button';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ja' ? 'en' : 'ja';
        i18n.changeLanguage(newLang);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="!p-2"
            title={i18n.language === 'ja' ? 'English' : '日本語'}
        >
            <Languages className="w-5 h-5 text-slate-400" />
            <span className="ml-1 text-xs font-bold text-slate-500">
                {i18n.language === 'ja' ? 'EN' : 'JP'}
            </span>
        </Button>
    );
};
