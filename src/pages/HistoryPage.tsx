import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, BarChart3, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';

type ViewMode = 'day' | 'month' | 'year';

export const HistoryPage = () => {
    const { t, i18n } = useTranslation();

    // Get all state from store (unconditionally to respect React hooks rules)
    const profiles = useStore((state) => state.profiles);
    const activeProfileId = useStore((state) => state.activeProfileId);
    const legacyHistory = useStore((state) => state.history);
    const quests = useStore((state) => state.quests);
    const rewards = useStore((state) => state.rewards);
    const deleteHistoryItem = useStore((state) => state.deleteHistoryItem);
    const deleteHistoryByDate = useStore((state) => state.deleteHistoryByDate);

    // Profile-aware history: use active profile's history if available, else legacy
    const activeProfile = profiles.find(p => p.id === activeProfileId);
    const history = activeProfile?.history ?? legacyHistory;

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

    // Helper: format date as YYYY-MM-DD
    const formatDateStr = (date: Date): string => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

        history.forEach(item => {
            const itemDate = new Date(item.date);
            const isQuest = item.type === 'quest';
            const isYearMatch = itemDate.getFullYear() === year;
            const isMonthMatch = itemDate.getMonth() === month;

            if (isQuest && isYearMatch && isMonthMatch) {
                const day = itemDate.getDate(); // 1-31
                const index = day - 1; // 0-30
                if (index >= 0 && index < daysInMonth) {
                    dailyTotals[index] += item.pointDiff;
                }
            }
        });

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

    const handleJumpToToday = () => {
        setCurrentDate(new Date());
    };

    const getHeaderLabel = () => {
        if (viewMode === 'day') return currentDate.toLocaleDateString(isJa ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (viewMode === 'month') return currentDate.toLocaleDateString(isJa ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long' });
        return currentDate.getFullYear().toString();
    };

    // --- DELETE HANDLERS ---
    const handleDeleteItem = (itemId: string) => {
        const confirmMsg = isJa ? 'この記録を削除しますか？ポイントも取り消されます。' : 'Delete this record? Points will be reversed.';
        if (confirm(confirmMsg)) {
            deleteHistoryItem(itemId);
        }
    };

    const handleDeleteDayRecords = () => {
        const dateStr = formatDateStr(currentDate);
        const confirmMsg = isJa
            ? `${getHeaderLabel()}の記録をすべて削除しますか？ポイントも取り消されます。`
            : `Delete all records for ${getHeaderLabel()}? Points will be reversed.`;
        if (confirm(confirmMsg)) {
            deleteHistoryByDate(dateStr);
        }
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
                    <Button variant="ghost" size="sm" onClick={handleJumpToToday} className="ml-2">
                        <RotateCcw size={16} />
                    </Button>
                </div>

                {/* --- DAY VIEW --- */}
                {viewMode === 'day' && (
                    <div className="space-y-3">
                        {/* Delete All Day Records Button */}
                        {dayData.length > 0 && (
                            <button
                                onClick={handleDeleteDayRecords}
                                className="w-full flex items-center justify-center gap-2 p-2 bg-red-50 text-red-500 rounded-xl border-2 border-red-200 hover:bg-red-100 transition-colors text-sm font-bold"
                            >
                                <Trash2 size={16} />
                                {isJa ? 'この日の記録をすべて削除' : 'Delete all records for this day'}
                            </button>
                        )}

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
                                    <div className="flex items-center gap-2">
                                        <div className={`font-black ${item.pointDiff > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                            {item.pointDiff > 0 ? '+' : ''}{item.pointDiff}pt
                                        </div>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
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
                        <div className="flex items-end h-60 gap-2 overflow-x-auto pb-6 px-2">
                            {monthData.map((d) => {
                                const maxVal = Math.max(...monthData.map(m => m.total), 1);
                                const heightPercent = (d.total / maxVal) * 100;
                                const isToday = d.day === currentDate.getDate() && viewMode === 'month';

                                return (
                                    <div key={d.day} className="flex-1 min-w-[24px] flex flex-col items-center group relative cursor-pointer">
                                        {/* Bar */}
                                        <div
                                            className={`w-full rounded-t-sm transition-all relative ${isToday ? 'bg-orange-400' : 'bg-blue-300 group-hover:bg-blue-400'
                                                }`}
                                            style={{ height: `${heightPercent}%`, minHeight: d.total > 0 ? '4px' : '0' }}
                                        >
                                            {d.total > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-1 rounded opacity-100 whitespace-nowrap z-10">
                                                    {d.total}
                                                </div>
                                            )}
                                        </div>
                                        {/* Label */}
                                        <div className={`text-[10px] mt-1 absolute -bottom-4 font-bold ${isToday ? 'text-orange-500' : 'text-slate-400'}`}>
                                            {d.day}
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
                        <div className="flex items-end h-60 gap-2 overflow-x-auto px-2">
                            {yearData.map((m) => {
                                const maxVal = Math.max(...yearData.map(y => y.total), 1);
                                const heightPercent = (m.total / maxVal) * 100;
                                return (
                                    <div key={m.month} className="flex-1 min-w-[30px] flex flex-col items-center group relative">
                                        {/* Bar */}
                                        <div
                                            className="w-full bg-indigo-300 rounded-t-md group-hover:bg-indigo-400 transition-all relative"
                                            style={{ height: `${heightPercent}%`, minHeight: m.total > 0 ? '4px' : '0' }}
                                        >
                                            {m.total > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-1 rounded opacity-100 whitespace-nowrap z-10">
                                                    {m.total}
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
