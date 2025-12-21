import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');

    // Load saved preference
    useEffect(() => {
        const saved = localStorage.getItem('gym-tracker-lang');
        if (saved) {
            setLanguage(saved);
        }
    }, []);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'fa' : 'en';
        setLanguage(newLang);
        localStorage.setItem('gym-tracker-lang', newLang);
    };

    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    const isRTL = language === 'fa';

    useEffect(() => {
        document.documentElement.lang = language;
        document.body.dir = isRTL ? 'rtl' : 'ltr';
        if (isRTL) {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }, [language, isRTL]);

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
