import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { QuestCard } from '../components/QuestCard';
import { Card } from '../components/Card';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ProfileSelector } from '../components/ProfileSelector';
import { Users } from 'lucide-react';

// Monthly level system constants
// Target: 200pt/day × 30 days × 80% = 4800pt for max level
const MAX_LEVEL = 50;
const POINTS_FOR_MAX = 4800; // 80% of theoretical max (6000pt)
const POINTS_PER_LEVEL = Math.floor(POINTS_FOR_MAX / (MAX_LEVEL - 1)); // ~100pt per level

// Helper: Get current month's start timestamp
const getMonthStart = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

export const KidPage = () => {
    const { t, i18n } = useTranslation();
    const isJa = i18n.language === 'ja';

    // Get all state from store unconditionally (React hooks rules)
    const profiles = useStore((state) => state.profiles);
    const activeProfileId = useStore((state) => state.activeProfileId);
    const legacyPoints = useStore((state) => state.currentPoints);
    const legacyHistory = useStore((state) => state.history);
    const quests = useStore((state) => state.quests);

    // Profile-aware state
    const activeProfile = profiles.find(p => p.id === activeProfileId);
    const currentPoints = activeProfile?.currentPoints ?? legacyPoints;
    const history = activeProfile?.history ?? legacyHistory;

    const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);

    // Calculate monthly points (for level calculation)
    const monthlyPoints = useMemo(() => {
        const monthStart = getMonthStart();
        return history
            .filter(item => {
                const itemDate = new Date(item.date);
                return item.type === 'quest' && itemDate >= monthStart;
            })
            .reduce((sum, item) => sum + item.pointDiff, 0);
    }, [history]);

    // Level calculation: Based on monthly points, resets each month
    const rawLevel = Math.floor(monthlyPoints / POINTS_PER_LEVEL) + 1;
    const level = Math.min(rawLevel, MAX_LEVEL);
    const pointsInCurrentLevel = monthlyPoints % POINTS_PER_LEVEL;
    const progressPercent = level >= MAX_LEVEL ? 100 : (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;

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
        if (lv >= 50) return '/hero_lv50.png';
        if (lv >= 45) return '/hero_lv45.png';
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

    // Get current month name
    const currentMonthName = new Date().toLocaleDateString(isJa ? 'ja-JP' : 'en-US', { month: 'long' });

    return (
        <div className="min-h-screen bg-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b-2 border-blue-100 p-4 shadow-sm">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Profile Switcher */}
                        {profiles.length > 0 && (
                            <button
                                onClick={() => setIsProfileSelectorOpen(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                            >
                                <span className="text-xl">{activeProfile?.icon || '🦸'}</span>
                                <span className="font-bold text-sm max-w-[60px] truncate">
                                    {activeProfile?.name || 'ゆうしゃ'}
                                </span>
                                {profiles.length > 1 && <Users size={14} />}
                            </button>
                        )}
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
                    {/* Monthly Reset Badge */}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        📅 {currentMonthName}
                    </div>

                    <div className="flex items-center gap-4">
                        <img
                            src={getHeroImage(level)}
                            onError={(e) => {
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
                            <div className="flex justify-between text-xs mt-1">
                                <span className="text-blue-500">
                                    {level < MAX_LEVEL
                                        ? t('kid.nextLevel', { points: POINTS_PER_LEVEL - pointsInCurrentLevel })
                                        : (isJa ? '🎉 さいこうレベル！' : '🎉 Max Level!')
                                    }
                                </span>
                                <span className="text-slate-400">
                                    {isJa ? `今月: ${monthlyPoints}pt` : `This month: ${monthlyPoints}pt`}
                                </span>
                            </div>
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

            {/* Profile Selector Modal */}
            <ProfileSelector
                isOpen={isProfileSelectorOpen}
                onClose={() => setIsProfileSelectorOpen(false)}
            />
        </div>
    );
};
