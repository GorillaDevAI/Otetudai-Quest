import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { type Quest } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { triggerConfetti } from '../lib/confetti';
import { useStore } from '../store/useStore';
import { useLocalizedTitle } from '../lib/useLocalizedTitle';
import { useState } from 'react';

interface QuestCardProps {
    quest: Quest;
}

export const QuestCard = ({ quest }: QuestCardProps) => {
    const { t } = useTranslation();
    const { getQuestTitle } = useLocalizedTitle();
    const addPoints = useStore((state) => state.addPoints);
    const [isCompleted, setIsCompleted] = useState(false);

    const title = getQuestTitle(quest);

    const handleComplete = () => {
        if (isCompleted) return;

        // Play sound (optional, placeholder for now)

        // Trigger visual effects
        setIsCompleted(true);
        triggerConfetti();

        // Update state
        addPoints(quest.point, 'quest', quest.id, title);

        // Reset after a while so they can do it again? 
        // Or keep it checked for the day? 
        // For now, let's reset it after 3 seconds so it's reusable
        setTimeout(() => setIsCompleted(false), 3000);
    };

    return (
        <Card className="p-4 flex flex-col items-center gap-3 relative overflow-hidden bg-white">
            {isCompleted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-b from-yellow-100 to-orange-100 flex flex-col items-center justify-center z-10 p-2"
                >
                    <motion.img
                        src="/celebration.png"
                        alt="おめでとう！"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-full h-auto max-h-24 object-contain"
                    />
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mt-1"
                    >
                        <p className="text-orange-600 font-black text-sm">{t('kid.congratulations')}</p>
                        <p className="text-yellow-600 font-bold text-xs">{t('kid.pointsGet', { points: quest.point })}</p>
                    </motion.div>
                </motion.div>
            )}

            <div className="text-6xl my-2 select-none group-hover:scale-110 transition-transform">
                {quest.icon}
            </div>

            <div className="text-center w-full">
                <h3 className="text-lg font-bold text-slate-700 leading-tight mb-1">
                    {title}
                </h3>
                <div className="inline-flex items-center gap-1 bg-yellow-100 text-orange-600 px-3 py-1 rounded-full font-black text-lg">
                    <span className="text-yellow-500">🪙</span>
                    {quest.point}
                </div>
            </div>

            <Button
                variant="primary"
                className="w-full mt-2"
                onClick={handleComplete}
                disabled={isCompleted}
            >
                {t('kid.complete')}
            </Button>
        </Card>
    );
};
