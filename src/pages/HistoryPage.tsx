import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, Trophy, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';

export const HistoryPage = () => {
    const { t, i18n } = useTranslation();
    const history = useStore((state) => state.history);
    const quests = useStore((state) => state.quests);
    const rewards = useStore((state) => state.rewards);

    // Group history by date
    const groupedByDate = useMemo(() => {
        const groups: Record<string, typeof history> = {};
        history.forEach((item) => {
            const date = item.date.split('T')[0]; // Get YYYY-MM-DD
            if (!groups[date]) groups[date] = [];
            groups[date].push(item);
        });
        return groups;
    }, [history]);

    // Monthly summary
    const monthlySummary = useMemo(() => {
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let questCount = 0;
        let rewardCount = 0;
        let pointsEarned = 0;
        let pointsSpent = 0;

        history.forEach((item) => {
            if (item.date.startsWith(thisMonth)) {
                if (item.type === 'quest') {
                    questCount++;
                    pointsEarned += item.pointDiff;
                } else if (item.type === 'reward') {
                    rewardCount++;
                    pointsSpent += Math.abs(item.pointDiff);
                }
            }
        });

        return { questCount, rewardCount, pointsEarned, pointsSpent, month: thisMonth };
    }, [history]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const isJa = i18n.language === 'ja';
        if (isJa) {
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString(i18n.language === 'ja' ? 'ja-JP' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getItemTitle = (item: typeof history[0]) => {
        if (item.itemTitle) return item.itemTitle;
        if (item.type === 'quest') {
            const quest = quests.find(q => q.id === item.itemId);
            return quest?.title || 'クエスト';
        }
        if (item.type === 'reward') {
            const reward = rewards.find(r => r.id === item.itemId);
            return reward?.title || 'ごほうび';
        }
        return '';
    };

    const isJa = i18n.language === 'ja';

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 shadow-lg">
                <div className="max-w-md mx-auto">
                    <h1 className="text-xl font-bold text-white">
                        📅 {isJa ? 'きろく' : 'History'}
                    </h1>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6">
                {/* Monthly Summary Card */}
                <Card className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
                        <Calendar size={20} />
                        {isJa ? 'こんげつのまとめ' : "This Month's Summary"}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/20 rounded-xl p-3 text-center">
                            <Trophy className="mx-auto mb-1" size={24} />
                            <div className="text-2xl font-black">{monthlySummary.questCount}</div>
                            <div className="text-xs opacity-80">
                                {isJa ? 'クエストクリア' : 'Quests Done'}
                            </div>
                        </div>
                        <div className="bg-white/20 rounded-xl p-3 text-center">
                            <TrendingUp className="mx-auto mb-1" size={24} />
                            <div className="text-2xl font-black">+{monthlySummary.pointsEarned}</div>
                            <div className="text-xs opacity-80">
                                {isJa ? 'かせいだポイント' : 'Points Earned'}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Daily History */}
                <div>
                    <h2 className="font-bold text-slate-600 mb-3">
                        {isJa ? '📝 にっきちょう' : '📝 Daily Log'}
                    </h2>

                    {Object.keys(groupedByDate).length === 0 ? (
                        <Card className="p-6 text-center text-slate-400">
                            {isJa ? 'まだきろくがないよ！' : 'No records yet!'}
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(groupedByDate)
                                .sort(([a], [b]) => b.localeCompare(a))
                                .slice(0, 7) // Show last 7 days with records
                                .map(([date, items]) => (
                                    <Card key={date} className="p-4 bg-white">
                                        <h3 className="font-bold text-blue-600 mb-2 text-sm">
                                            {formatDate(date)}
                                        </h3>
                                        <div className="space-y-2">
                                            {items.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">
                                                            {item.type === 'quest' ? '⚔️' : '🎁'}
                                                        </span>
                                                        <div>
                                                            <div className="font-medium text-slate-700">
                                                                {getItemTitle(item)}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                {formatTime(item.date)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`font-bold ${item.pointDiff > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                                        {item.pointDiff > 0 ? '+' : ''}{item.pointDiff}pt
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
