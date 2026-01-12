import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { QuestCard } from '../components/QuestCard';
import { Card } from '../components/Card';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const KidPage = () => {
    const { t } = useTranslation();
    const currentPoints = useStore((state) => state.currentPoints);
    const totalPointsEarned = useStore((state) => state.totalPointsEarned);
    const quests = useStore((state) => state.quests);

    // Level calculation: Every 200 points = 1 level, max 50
    const POINTS_PER_LEVEL = 200;
    const rawLevel = Math.floor(totalPointsEarned / POINTS_PER_LEVEL) + 1;
    const level = Math.min(rawLevel, 50);
    const pointsInCurrentLevel = totalPointsEarned % POINTS_PER_LEVEL;
    const progressPercent = level >= 50 ? 100 : (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;

    // Level titles (every 5 levels)
    const getLevelTitle = (lv: number): string => {
        if (lv >= 50) return t('level.level50');
        if (lv >= 45) return t('level.level45');
        if (lv >= 40) return t('level.level40');
        if (lv >= 35) return t('level.level35');
        if (lv >= 30) return t('level.level30');
        if (lv >= 25) return t('level.level25');
        if (lv >= 20) return t('level.level20');
        if (lv >= 15) return t('level.level15');
        if (lv >= 10) return t('level.level10');
        if (lv >= 5) return t('level.level5');
        return t('level.level1');
    };

    // Hero Image based on level (every 5 levels)
    const getHeroImage = (lv: number): string => {
        // We will generate these images: 
        // hero_lv1.png, hero_lv5.png, hero_lv10.png ... hero_lv50.png
        // Fallback to lower tiers if image doesn't exist yet (logic-wise we map to 1, 5, 10...)

        if (lv >= 50) return '/hero_lv50.png';
        if (lv >= 45) return '/hero_lv45.png'; // Will use lv25 or similar if not ready
        if (lv >= 40) return '/hero_lv40.png';
        if (lv >= 35) return '/hero_lv35.png';
        if (lv >= 30) return '/hero_lv30.png';
        if (lv >= 25) return '/hero_lv25.png';
        if (lv >= 20) return '/hero_lv20.png';
        if (lv >= 15) return '/hero_lv15.png';
        if (lv >= 10) return '/hero_lv10.png';
        if (lv >= 5) return '/hero_lv5.png';
        return '/hero_lv1.png';
    };

    return (
        <div className="min-h-screen bg-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b-2 border-blue-100 p-4 shadow-sm">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-400 p-2 rounded-xl text-2xl shadow-inner border-2 border-yellow-500">
                            🪙
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">{t('common.currentPoints')}</p>
                            <div className="text-3xl font-black text-slate-800 tracking-tight">
                                {currentPoints.toLocaleString()}
                                <span className="text-sm ml-1 text-slate-500 font-bold">{t('common.points')}</span>
                            </div>
                        </div>
                    </div>

                    <LanguageSwitcher />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* Progress / Level with Hero */}
                <Card variant="colorful" className="p-4 relative overflow-hidden">
                    <div className="flex items-center gap-4">
                        <img
                            src={getHeroImage(level)}
                            onError={(e) => {
                                // Fallback to lv1 if specific level image missing
                                e.currentTarget.src = '/hero_lv1.png';
                            }}
                            alt="Hero"
                            className="w-20 h-20 object-contain drop-shadow-lg"
                        />
                        <div className="flex-1">
                            <p className="text-xs text-blue-600 font-bold">{getLevelTitle(level)}</p>
                            <h2 className="text-xl font-black text-blue-900">{t('level.title', { level })}</h2>
                            <div className="w-full h-3 bg-white/50 rounded-full mt-2 overflow-hidden border border-blue-200">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <p className="text-xs text-blue-500 mt-1">
                                {t('kid.nextLevel', { points: POINTS_PER_LEVEL - pointsInCurrentLevel })}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Quest Grid */}
                <div>
                    <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <span>🛡️</span> {t('kid.todayQuests')}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {quests.map((quest) => (
                            <QuestCard key={quest.id} quest={quest} />
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
};
