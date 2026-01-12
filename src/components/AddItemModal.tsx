import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Modal } from './Modal';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, point: number, icon: string, oncePerDay?: boolean) => void;
    type: 'quest' | 'reward';
}

const POINT_OPTIONS = [10, 30, 50, 100, 300];

export const AddItemModal = ({ isOpen, onClose, onSave, type }: AddItemModalProps) => {
    const { t, i18n } = useTranslation();
    const isJa = i18n.language === 'ja';

    const [title, setTitle] = useState('');
    const [point, setPoint] = useState(10);
    const [icon, setIcon] = useState(type === 'quest' ? '📝' : '🎁');
    const [oncePerDay, setOncePerDay] = useState(false);

    const handleSubmit = () => {
        if (!title.trim()) return;
        onSave(title, point, icon, type === 'quest' ? oncePerDay : undefined);
        setTitle('');
        setPoint(10);
        setIcon(type === 'quest' ? '📝' : '🎁');
        setOncePerDay(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={type === 'quest' ? t('parent.addQuest') : t('parent.addReward')}
        >
            <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">
                        {type === 'quest' ? t('parent.questName') : t('parent.rewardName')}
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={type === 'quest' ? t('parent.addQuestName') : t('parent.addRewardName')}
                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none font-bold"
                    />
                </div>

                {/* Point Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">
                        {type === 'quest' ? t('parent.pointsToGet') : t('parent.pointsNeeded')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {POINT_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setPoint(opt)}
                                className={`p-3 rounded-xl border-2 font-bold transition-all ${point === opt
                                    ? 'bg-blue-500 border-blue-600 text-white shadow-md transform scale-105'
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-blue-200'
                                    }`}
                            >
                                {opt}pt
                            </button>
                        ))}
                    </div>
                </div>

                {/* Icon Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">
                        {t('parent.icon')}
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="w-16 h-16 text-center text-3xl bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none"
                            maxLength={2}
                        />
                        <div className="text-xs text-slate-400 flex items-center">
                            {t('parent.iconDesc')}
                        </div>
                    </div>
                </div>

                {/* Once Per Day Toggle (Quest only) */}
                {type === 'quest' && (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500">
                            {isJa ? '完了せいげん' : 'Completion Limit'}
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setOncePerDay(false)}
                                className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all ${!oncePerDay
                                        ? 'bg-green-500 border-green-600 text-white shadow-md'
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-green-200'
                                    }`}
                            >
                                {isJa ? '🔄 なんかいでもOK' : '🔄 Unlimited'}
                            </button>
                            <button
                                onClick={() => setOncePerDay(true)}
                                className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all ${oncePerDay
                                        ? 'bg-orange-500 border-orange-600 text-white shadow-md'
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-orange-200'
                                    }`}
                            >
                                {isJa ? '1️⃣ 1日1回まで' : '1️⃣ Once per day'}
                            </button>
                        </div>
                    </div>
                )}

                <Button
                    variant="primary"
                    className="w-full py-3 text-lg"
                    onClick={handleSubmit}
                    disabled={!title.trim()}
                >
                    {t('parent.save')}
                </Button>
            </div>
        </Modal>
    );
};
