'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
    // Temporarily disabled - uncomment when API key is configured
    return null;

    /* 
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 border-white/20 hover:bg-white/10"
        >
            <Languages className="h-4 w-4" />
            <span className="text-sm font-medium">
                {language === 'en' ? 'العربية' : 'English'}
            </span>
        </Button>
    );
    */
}
