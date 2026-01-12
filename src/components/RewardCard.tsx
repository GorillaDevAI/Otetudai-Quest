import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { type Reward } from '../types';
import { Button } from './Button';
import { Card } from './Card';
import { triggerConfetti } from '../lib/confetti';
import { useLocalizedTitle } from '../lib/useLocalizedTitle';
import { useState } from 'react';

interface RewardCardProps {
    reward: Reward;
}

export const RewardCard = ({ reward }: RewardCardProps) => {
    const { t } = useTranslation();
    const { getRewardTitle } = useLocalizedTitle();
    const { currentPoints, removePoints } = useStore();
    const canAfford = currentPoints >= reward.cost;
    const [isExchanged, setIsExchanged] = useState(false);

    const title = getRewardTitle(reward);

    const handleExchange = () => {
        if (!canAfford) return;
        if (!confirm(t('reward.exchangeConfirm', { name: title }))) return;

        removePoints(reward.cost, 'reward', reward.id, title);
        triggerConfetti();
        setIsExchanged(true);
    };

    if (isExchanged) {
        return (
            <Card className="p-4 bg-yellow-50 border-4 border-yellow-200 text-center animate-pulse">
                <h3 className="text-xl font-bold text-orange-600 mb-2">{t('reward.exchanged')}</h3>
                <div className="text-4xl mb-2">{reward.icon}</div>
                <div className="font-bold text-slate-700">{title}</div>
                <div className="mt-2 text-sm text-slate-500">{t('reward.showParent')}</div>
                <Button
                    variant="ghost"
                    className="mt-2"
                    onClick={() => setIsExchanged(false)}
                >
                    {t('reward.back')}
                </Button>
            </Card>
        );
    }

    return (
        <Card className="p-4 flex flex-col items-center gap-2">
            <div className="text-5xl mb-1 group-hover:scale-110 transition-transform">
                {reward.icon}
            </div>
            <div className="text-center w-full grow">
                <h3 className="font-bold text-slate-700 leading-tight">
                    {title}
                </h3>
            </div>
            <Button
                variant={canAfford ? 'primary' : 'ghost'}
                className="w-full mt-2"
                onClick={handleExchange}
                disabled={!canAfford}
            >
                <span className="mr-1">🪙</span>
                {reward.cost}
            </Button>
        </Card>
    );
};
