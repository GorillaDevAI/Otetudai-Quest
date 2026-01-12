import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { X, Lock } from 'lucide-react';

interface ParentGateProps {
    isOpen: boolean;
    onSuccess: () => void;
    onClose: () => void;
}

// Generate a random math problem for parent authentication
const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    const isAddition = Math.random() > 0.5;

    if (isAddition) {
        return {
            question: `${num1} + ${num2}`,
            answer: num1 + num2,
        };
    } else {
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        return {
            question: `${larger} - ${smaller}`,
            answer: larger - smaller,
        };
    }
};

export const ParentGate = ({ isOpen, onSuccess, onClose }: ParentGateProps) => {
    const { i18n } = useTranslation();
    const isJa = i18n.language === 'ja';

    const [problem] = useState(generateMathProblem);
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert full-width numbers to half-width (for Japanese IME)
        const normalizedAnswer = answer
            .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
            .trim();

        if (parseInt(normalizedAnswer, 10) === problem.answer) {
            onSuccess();
            setAnswer('');
            setError(false);
        } else {
            setError(true);
            setAnswer('');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">
                                    {isJa ? 'おとなようです' : 'Adults Only'}
                                </h3>
                                <p className="text-slate-300 text-xs">
                                    {isJa ? '保護者の方が操作してください' : 'For parents'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white p-1">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="text-center">
                            <p className="text-slate-600 mb-4">
                                {isJa ? 'こたえをいれてね' : 'Solve this problem'}
                            </p>
                            <div className="text-4xl font-black text-slate-800 bg-slate-100 py-4 rounded-xl">
                                {problem.question} = ?
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-center font-bold text-sm"
                            >
                                {isJa ? 'ざんねん！こたえがちがうよ' : 'Oops! Wrong answer'}
                            </motion.p>
                        )}

                        <input
                            type="text"
                            inputMode="numeric"
                            value={answer}
                            onChange={(e) => {
                                setAnswer(e.target.value);
                                setError(false);
                            }}
                            placeholder={isJa ? 'こたえをにゅうりょく' : 'Enter the answer'}
                            className="w-full p-4 text-2xl font-bold text-center border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none"
                            autoFocus
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3"
                        >
                            {isJa ? 'せっていをひらく' : 'Open Settings'}
                        </Button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
