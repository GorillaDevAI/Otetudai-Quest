import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { RewardCard } from '../components/RewardCard';
import { Card } from '../components/Card';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const RewardsPage = () => {
    const { t } = useTranslation();

    // Get all state from store unconditionally
    const profiles = useStore((state) => state.profiles);
    const activeProfileId = useStore((state) => state.activeProfileId);
    const legacyPoints = useStore((state) => state.currentPoints);
    const rewards = useStore((state) => state.rewards);

    // Profile-aware points
    const activeProfile = profiles.find(p => p.id === activeProfileId);
    const currentPoints = activeProfile?.currentPoints ?? legacyPoints;

    return (
        <div className="min-h-screen bg-pink-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-gradient-to-r from-pink-500 to-rose-400 p-4 shadow-lg">
                <div className="max-w-md mx-auto flex items-center justify-between text-white">
                    <div>
                        <h1 className="text-xl font-black">🎁 {t('reward.shopTitle')}</h1>
                        <p className="text-sm opacity-90">
                            {t('common.currentPoints')}: <span className="font-bold">{currentPoints.toLocaleString()}{t('common.points')}</span>
                        </p>
                    </div>
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Rewards Grid */}
            <main className="max-w-md mx-auto p-4">
                {rewards.length === 0 ? (
                    <Card className="p-8 text-center text-slate-400">
                        {t('reward.noRewards') || 'ごほうびがまだないよ'}
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {rewards.map((reward) => (
                            <RewardCard key={reward.id} reward={reward} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
