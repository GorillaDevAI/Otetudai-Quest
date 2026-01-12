import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Modal } from './Modal';
import { type Quest, type Reward } from '../types';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, point: number, icon: string, oncePerDay?: boolean) => void;
    type: 'quest' | 'reward';
    editItem?: Quest | Reward | null; // If provided, modal is in edit mode
}

const POINT_OPTIONS = [10, 30, 50, 100, 300];

// Emoji options for quests
const QUEST_EMOJIS = [
    '📝', '🧹', '🍽️', '🛁', '👟', '👕', '🐕', '🌱', '🚿', '🧺',
    '📚', '🎒', '📅', '📓', '✏️', '🎹', '⚽', '🏃', '🛏️', '🪥',
    '🐱', '🐕', '🐹', '🐠', '🚗', '🛒', '📮', '🗑️', '🍳', '🥗',
];

// Emoji options for rewards
const REWARD_EMOJIS = [
    '🎁', '📺', '🍭', '🎮', '🍕', '🍦', '🎬', '🎨', '🎪', '🎢',
    '🛝', '🧸', '📱', '🎧', '🎤', '🎾', '⚽', '🏊', '🍩', '🧁',
    '🍿', '🥤', '🎂', '🌟', '💎', '👑', '🏆', '🎖️', '💰', '🎉',
];

export const AddItemModal = ({ isOpen, onClose, onSave, type, editItem }: AddItemModalProps) => {
    const { i18n } = useTranslation();
    const isJa = i18n.language === 'ja';

    const [title, setTitle] = useState('');
    const [point, setPoint] = useState(10);
    const [icon, setIcon] = useState(type === 'quest' ? '📝' : '🎁');
    const [oncePerDay, setOncePerDay] = useState(false);
    const [customPoint, setCustomPoint] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const emojiOptions = type === 'quest' ? QUEST_EMOJIS : REWARD_EMOJIS;

    // Populate fields when editing
    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title);
            setIcon(editItem.icon);
            if (type === 'quest') {
                const quest = editItem as Quest;
                setPoint(quest.point);
                setOncePerDay(quest.oncePerDay || false);
                // Check if point is not in options
                if (!POINT_OPTIONS.includes(quest.point)) {
                    setShowCustomInput(true);
                    setCustomPoint(quest.point.toString());
                }
            } else {
                const reward = editItem as Reward;
                setPoint(reward.cost);
                if (!POINT_OPTIONS.includes(reward.cost)) {
                    setShowCustomInput(true);
                    setCustomPoint(reward.cost.toString());
                }
            }
        } else {
            // Reset for new item
            setTitle('');
            setPoint(10);
            setIcon(type === 'quest' ? '📝' : '🎁');
            setOncePerDay(false);
            setCustomPoint('');
            setShowCustomInput(false);
        }
        setShowEmojiPicker(false);
    }, [editItem, isOpen, type]);

    const handleSubmit = () => {
        if (!title.trim()) return;
        const finalPoint = showCustomInput ? parseInt(customPoint) || point : point;
        onSave(title, finalPoint, icon, type === 'quest' ? oncePerDay : undefined);
        setTitle('');
        setPoint(10);
        setIcon(type === 'quest' ? '📝' : '🎁');
        setOncePerDay(false);
        setCustomPoint('');
        setShowCustomInput(false);
        setShowEmojiPicker(false);
        onClose();
    };

    const isEditMode = !!editItem;
    const modalTitle = isEditMode
        ? (type === 'quest' ? (isJa ? 'クエストをへんしゅう' : 'Edit Quest') : (isJa ? 'ごほうびをへんしゅう' : 'Edit Reward'))
        : (type === 'quest' ? (isJa ? 'クエストをついか' : 'Add Quest') : (isJa ? 'ごほうびをついか' : 'Add Reward'));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
        >
            <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">
                        {type === 'quest' ? (isJa ? 'クエストのなまえ' : 'Quest Name') : (isJa ? 'ごほうびのなまえ' : 'Reward Name')}
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={type === 'quest' ? (isJa ? 'いぬのさんぽ' : 'Walk the dog') : (isJa ? 'ゲーム1じかん' : '1 hour of gaming')}
                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none font-bold"
                    />
                </div>

                {/* Point Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">
                        {type === 'quest' ? (isJa ? 'もらえるポイント' : 'Points Earned') : (isJa ? 'ひつようなポイント' : 'Points Cost')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {POINT_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    setPoint(opt);
                                    setShowCustomInput(false);
                                }}
                                className={`p-3 rounded-xl border-2 font-bold transition-all ${point === opt && !showCustomInput
                                    ? 'bg-blue-500 border-blue-600 text-white shadow-md transform scale-105'
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-blue-200'
                                    }`}
                            >
                                {opt}pt
                            </button>
                        ))}
                        <button
                            onClick={() => setShowCustomInput(true)}
                            className={`p-3 rounded-xl border-2 font-bold transition-all ${showCustomInput
                                ? 'bg-purple-500 border-purple-600 text-white shadow-md'
                                : 'bg-white border-slate-200 text-slate-400 hover:border-purple-200'
                                }`}
                        >
                            {isJa ? 'その他' : 'Custom'}
                        </button>
                    </div>
                    {showCustomInput && (
                        <input
                            type="number"
                            value={customPoint}
                            onChange={(e) => setCustomPoint(e.target.value)}
                            placeholder={isJa ? 'ポイントをにゅうりょく' : 'Enter points'}
                            className="w-full p-3 bg-slate-50 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none font-bold mt-2"
                        />
                    )}
                </div>

                {/* Icon Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">
                        {isJa ? 'アイコン' : 'Icon'}
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="w-20 h-20 text-center text-4xl bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-blue-400 transition-colors flex items-center justify-center"
                        >
                            {icon}
                        </button>
                        <span className="ml-3 text-xs text-slate-400">
                            {isJa ? '👆 タップしてえらぶ' : '👆 Tap to choose'}
                        </span>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="absolute top-full left-0 mt-2 p-3 bg-white border-2 border-slate-200 rounded-xl shadow-lg z-50 w-full max-w-[300px]">
                                <div className="grid grid-cols-6 gap-2">
                                    {emojiOptions.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                setIcon(emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                            className={`w-10 h-10 text-2xl rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center ${icon === emoji ? 'bg-blue-200 ring-2 ring-blue-400' : 'bg-slate-50'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
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
                    {isEditMode ? (isJa ? 'へんこうする' : 'Save Changes') : (isJa ? 'ほぞんする' : 'Save')}
                </Button>
            </div>
        </Modal>
    );
};
