import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';

type ViewMode = 'day' | 'month' | 'year';

export const HistoryPage = () => {
    const { t, i18n } = useTranslation();
    const history = useStore((state) => state.history);
    const quests = useStore((state) => state.quests);
    const rewards = useStore((state) => state.rewards);

    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [currentDate, setCurrentDate] = useState(new Date());

    const isJa = i18n.language === 'ja';

    // Helper: Item Item Title
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

    // --- DATA AGGREGATION ---

    // 1. Day View Data
    const dayData = useMemo(() => {
        return history.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getFullYear() === currentDate.getFullYear() &&
                itemDate.getMonth() === currentDate.getMonth() &&
                itemDate.getDate() === currentDate.getDate();
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [history, currentDate]);

    // 2. Month View Data (Daily totals)
    const monthData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-indexed
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const dailyTotals = new Array(daysInMonth).fill(0);

        console.log('--- Month Aggregation Debug ---');
        console.log('Current Filter:', { year, month });

        history.forEach(item => {
            const itemDate = new Date(item.date);
            const isQuest = item.type === 'quest';
            const isYearMatch = itemDate.getFullYear() === year;
            const isMonthMatch = itemDate.getMonth() === month;

            if (isQuest && isYearMatch && isMonthMatch) {
                const day = itemDate.getDate(); // 1-31
                const index = day - 1; // 0-30
                console.log(`Matching Item: ${item.date} -> Day ${day} (+${item.pointDiff})`);
                if (index >= 0 && index < daysInMonth) {
                    dailyTotals[index] += item.pointDiff;
                }
            } else {
                // Log why it failed only for recent items
                // console.log(`Skipping: ${item.date} (Quest:${isQuest} Y:${isYearMatch} M:${isMonthMatch})`);
            }
        });

        // Debug: Check if today's data is included
        // console.log('Month Data:', dailyTotals);

        return dailyTotals.map((total, idx) => ({ day: idx + 1, total }));
    }, [history, currentDate]);

    // 3. Year View Data (Monthly totals)
    const yearData = useMemo(() => {
        const year = currentDate.getFullYear();
        const monthlyTotals = new Array(12).fill(0);

        history.forEach(item => {
            const itemDate = new Date(item.date);
            // Check if item is in the current year (local time)
            if (item.type === 'quest' && itemDate.getFullYear() === year) {
                const monthIndex = itemDate.getMonth(); // 0-11
                if (monthIndex >= 0 && monthIndex < 12) {
                    monthlyTotals[monthIndex] += item.pointDiff;
                }
            }
        });

        return monthlyTotals.map((total, idx) => ({ month: idx + 1, total }));
    }, [history, currentDate]);


    // --- NAVIGATION ---
    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
        if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
        if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
        setCurrentDate(newDate);
    };

    const getHeaderLabel = () => {
        if (viewMode === 'day') return currentDate.toLocaleDateString(isJa ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (viewMode === 'month') return currentDate.toLocaleDateString(isJa ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long' });
        return currentDate.getFullYear().toString();
    };


    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            <header className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 shadow-lg sticky top-0 z-10">
                <div className="max-w-md mx-auto">
                    <h1 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar /> {isJa ? 'きろく' : 'History'}
                    </h1>

                    {/* View Mode Tabs */}
                    <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-sm">
                        {(['day', 'month', 'year'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`flex-1 py-1 px-3 rounded-lg text-sm font-bold transition-all ${viewMode === mode
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {t(`common.${mode}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-4">
                {/* Date Navigator */}
                <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm">
                    <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ChevronLeft />
                    </button>
                    <h2 className="font-bold text-lg text-slate-700">
                        {getHeaderLabel()}
                    </h2>
                    <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ChevronRight />
                    </button>
                </div>

                {/* --- DAY VIEW --- */}
                {viewMode === 'day' && (
                    <div className="space-y-3">
                        {dayData.length === 0 ? (
                            <Card className="p-8 text-center text-slate-400 bg-white border-dashed">
                                <p>{t('kid.noHistory')}</p>
                            </Card>
                        ) : (
                            dayData.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-l-transparent data-[type=quest]:border-l-green-400 data-[type=reward]:border-l-orange-400"
                                    data-type={item.type}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">
                                            {item.type === 'quest' ? '⚔️' : '🎁'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700 text-sm">{getItemTitle(item)}</div>
                                            <div className="text-xs text-slate-400">
                                                {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-black ${item.pointDiff > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                        {item.pointDiff > 0 ? '+' : ''}{item.pointDiff}pt
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* --- MONTH VIEW (Bar Chart) --- */}
                {viewMode === 'month' && (
                    <Card className="p-6 bg-white min-h-[300px]">
                        <h3 className="font-bold text-slate-500 mb-4 flex items-center gap-2">
                            <BarChart3 size={18} /> Daily Points
                        </h3>
                        <div className="flex items-end h-60 gap-1 overflow-x-auto pb-6">
                            {monthData.map((d) => {
                                const maxVal = Math.max(...monthData.map(m => m.total), 1);
                                const heightPercent = (d.total / maxVal) * 100;
                                return (
                                    <div key={d.day} className="flex-1 min-w-[20px] flex flex-col items-center group relative">
                                        {/* Bar */}
                                        <div
                                            className="w-full bg-blue-200 rounded-t-sm group-hover:bg-blue-400 transition-all relative"
                                            style={{ height: `${heightPercent}%` }}
                                        >
                                            {d.total > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {d.total}pt
                                                </div>
                                            )}
                                        </div>
                                        {/* Label */}
                                        <div className="text-[10px] text-slate-400 mt-1 absolute -bottom-4">
                                            {d.day % 5 === 1 ? d.day : ''}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {/* --- YEAR VIEW (Bar Chart) --- */}
                {viewMode === 'year' && (
                    <Card className="p-6 bg-white min-h-[300px]">
                        <h3 className="font-bold text-slate-500 mb-4 flex items-center gap-2">
                            <BarChart3 size={18} /> Monthly Points
                        </h3>
                        <div className="flex items-end h-60 gap-2">
                            {yearData.map((m) => {
                                const maxVal = Math.max(...yearData.map(y => y.total), 1);
                                const heightPercent = (m.total / maxVal) * 100;
                                return (
                                    <div key={m.month} className="flex-1 flex flex-col items-center group relative">
                                        {/* Bar */}
                                        <div
                                            className="w-full bg-indigo-200 rounded-t-md group-hover:bg-indigo-400 transition-all relative"
                                            style={{ height: `${heightPercent}%` }}
                                        >
                                            {m.total > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {m.total}pt
                                                </div>
                                            )}
                                        </div>
                                        {/* Label */}
                                        <div className="text-xs text-slate-400 mt-1 font-bold">
                                            {m.month}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
};
