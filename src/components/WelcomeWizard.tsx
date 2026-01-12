import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Card } from './Card';
import { Button } from './Button';
import { QuestCard } from './QuestCard';
import { RewardCard } from './RewardCard';
import { PartyPopper, Swords, Trophy } from 'lucide-react';

export const WelcomeWizard = () => {
    const { t, i18n } = useTranslation();
    const completeOnboarding = useStore((state) => state.completeOnboarding);
    const quests = useStore((state) => state.quests);
    const rewards = useStore((state) => state.rewards);

    const [step, setStep] = useState(1);

    const handleLanguageSelect = (lang: 'ja' | 'en') => {
        i18n.changeLanguage(lang);
        setStep(2);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-white overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center shrink-0">
                    <h1 className="text-2xl font-black text-white mb-2">
                        {step === 1 ? 'Otetsudai Quest' : t('welcome.title')}
                    </h1>
                    <p className="text-blue-100 font-bold">
                        {step === 1 ? 'Start your adventure!' : t('welcome.subtitle')}
                    </p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 text-center"
                            >
                                <div className="text-6xl mb-4">🌍</div>
                                <h2 className="text-xl font-bold text-slate-700">Choose Language / ことばをえらんでね</h2>

                                <div className="grid grid-cols-1 gap-4 mt-8">
                                    <button
                                        onClick={() => handleLanguageSelect('ja')}
                                        className="p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                    >
                                        <div className="text-4xl mb-2">🇯🇵</div>
                                        <div className="text-xl font-black text-slate-700 group-hover:text-blue-600">日本語</div>
                                        <div className="text-sm text-slate-400">Japanese</div>
                                    </button>

                                    <button
                                        onClick={() => handleLanguageSelect('en')}
                                        className="p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                    >
                                        <div className="text-4xl mb-2">🇺🇸</div>
                                        <div className="text-xl font-black text-slate-700 group-hover:text-blue-600">English</div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🛡️</div>
                                    <h2 className="text-xl font-bold text-slate-700">{t('welcome.step2Title')}</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                                        <Swords className="text-blue-500 shrink-0" size={32} />
                                        <div className="font-bold text-slate-700">{t('welcome.step2Desc1')}</div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl">
                                        <Trophy className="text-yellow-500 shrink-0" size={32} />
                                        <div className="font-bold text-slate-700">{t('welcome.step2Desc2')}</div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                                        <PartyPopper className="text-purple-500 shrink-0" size={32} />
                                        <div className="font-bold text-slate-700">{t('welcome.step2Desc3')}</div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button onClick={() => setStep(3)} className="w-full py-4 text-lg">
                                        {t('common.next')}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="text-6xl mb-4">✨</div>
                                    <h2 className="text-xl font-bold text-slate-700">{t('welcome.step3Title')}</h2>
                                    <p className="text-slate-500 text-sm mt-2">{t('welcome.step3Desc')}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                                            <Swords size={16} /> {t('parent.quests')} (Example)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {quests.slice(0, 2).map(q => (
                                                <div key={q.id} className="pointer-events-none opacity-80 scale-90 origin-top-left">
                                                    <QuestCard quest={q} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-orange-600 mb-2 flex items-center gap-2">
                                            <Trophy size={16} /> {t('parent.rewards')} (Example)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {rewards.slice(0, 2).map(r => (
                                                <div key={r.id} className="pointer-events-none opacity-80 scale-90 origin-top-left">
                                                    <RewardCard reward={r} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        onClick={completeOnboarding}
                                        variant="primary"
                                        className="w-full py-4 text-xl font-black bg-gradient-to-r from-orange-400 to-pink-500 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        {t('welcome.letsGo')} 🚀
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Dots */}
                <div className="p-4 bg-slate-50 flex justify-center gap-2 shrink-0">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-3 h-3 rounded-full transition-all ${s === step ? 'bg-blue-500 w-6' : 'bg-slate-300'
                                }`}
                        />
                    ))}
                </div>
            </Card>
        </div>
    );
};
