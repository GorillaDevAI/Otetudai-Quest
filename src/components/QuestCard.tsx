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
    const { t, i18n } = useTranslation();
    const isJa = i18n.language === 'ja';
    const { getQuestTitle } = useLocalizedTitle();
    const addPoints = useStore((state) => state.addPoints);
    const isQuestCompletedToday = useStore((state) => state.isQuestCompletedToday);
    const [isCompleted, setIsCompleted] = useState(false);

    const title = getQuestTitle(quest);

    // Check if quest has daily limit and already completed today
    const alreadyDoneToday = quest.oncePerDay && isQuestCompletedToday(quest.id);

    const handleComplete = () => {
        if (isCompleted || alreadyDoneToday) return;

        // Trigger visual effects
        setIsCompleted(true);
        triggerConfetti();

        // Update state
        addPoints(quest.point, 'quest', quest.id, title);

        // Reset after 3 seconds (unless it's a once-per-day quest)
        if (!quest.oncePerDay) {
            setTimeout(() => setIsCompleted(false), 3000);
        }
    };

    return (
        <Card className={`p-4 flex flex-col items-center gap-3 relative overflow-hidden ${alreadyDoneToday ? 'bg-slate-100 opacity-60' : 'bg-white'
            }`}>
            {/* Already done today indicator */}
            {alreadyDoneToday && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ✓ {isJa ? 'かんりょう' : 'Done'}
                </div>
            )}

            {isCompleted && !alreadyDoneToday && (
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

            <div className={`text-6xl my-2 select-none group-hover:scale-110 transition-transform ${alreadyDoneToday ? 'grayscale' : ''
                }`}>
                {quest.icon}
            </div>

            <div className="text-center w-full">
                <h3 className="text-lg font-bold text-slate-700 leading-tight mb-1">
                    {title}
                </h3>
                {quest.oncePerDay && (
                    <div className="text-xs text-orange-500 font-bold mb-1">
                        1️⃣ {isJa ? '1日1回' : 'Once/day'}
                    </div>
                )}
                <div className="inline-flex items-center gap-1 bg-yellow-100 text-orange-600 px-3 py-1 rounded-full font-black text-lg">
                    <span className="text-yellow-500">🪙</span>
                    {quest.point}
                </div>
            </div>

            <Button
                variant={alreadyDoneToday ? 'ghost' : 'primary'}
                className="w-full mt-2"
                onClick={handleComplete}
                disabled={isCompleted || alreadyDoneToday}
            >
                {alreadyDoneToday
                    ? (isJa ? 'おわったよ！' : 'Completed!')
                    : t('kid.complete')
                }
            </Button>
        </Card>
    );
};
