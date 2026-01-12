import { useTranslation } from 'react-i18next';
import { type Quest, type Reward } from '../types';

// Helper hook to get the correct title based on current language
export const useLocalizedTitle = () => {
    const { i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';

    const getQuestTitle = (quest: Quest): string => {
        if (isEnglish && quest.titleEn) {
            return quest.titleEn;
        }
        return quest.title;
    };

    const getRewardTitle = (reward: Reward): string => {
        if (isEnglish && reward.titleEn) {
            return reward.titleEn;
        }
        return reward.title;
    };

    return { getQuestTitle, getRewardTitle, isEnglish };
};
