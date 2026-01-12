import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Button } from './Button';

// Tutorial step configuration
interface TutorialStep {
    targetSelector: string;
    titleKey: string;
    descKey: string;
    arrowPosition: 'top' | 'bottom' | 'left' | 'right';
    highlightPadding?: number;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        targetSelector: '[data-tutorial="profile-button"]',
        titleKey: 'tutorial.step1Title',
        descKey: 'tutorial.step1Desc',
        arrowPosition: 'top',
        highlightPadding: 8,
    },
    {
        targetSelector: '[data-tutorial="settings-button"]',
        titleKey: 'tutorial.step2Title',
        descKey: 'tutorial.step2Desc',
        arrowPosition: 'bottom',
        highlightPadding: 8,
    },
];

export const TutorialOverlay = () => {
    const { t } = useTranslation();
    const showTutorial = useStore((s) => s.showTutorial);
    const completeTutorial = useStore((s) => s.completeTutorial);

    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Find and measure the target element
    useEffect(() => {
        if (!showTutorial) return;

        const step = TUTORIAL_STEPS[currentStep];
        if (!step) return;

        const findTarget = () => {
            const target = document.querySelector(step.targetSelector);
            if (target) {
                setTargetRect(target.getBoundingClientRect());
            }
        };

        // Initial find with small delay to ensure DOM is ready
        const timer = setTimeout(findTarget, 100);

        // Re-find on resize/scroll
        window.addEventListener('resize', findTarget);
        window.addEventListener('scroll', findTarget, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', findTarget);
            window.removeEventListener('scroll', findTarget, true);
        };
    }, [showTutorial, currentStep]);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTutorial();
        }
    };

    const handleSkip = () => {
        completeTutorial();
    };

    if (!showTutorial) return null;

    const step = TUTORIAL_STEPS[currentStep];
    const padding = step?.highlightPadding || 8;
    const isLastStep = currentStep >= TUTORIAL_STEPS.length - 1;

    // Calculate positions for the spotlight and tooltip
    const spotlightStyle = targetRect
        ? {
            left: targetRect.left - padding,
            top: targetRect.top - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
        }
        : null;

    // Calculate tooltip position based on arrow direction
    const getTooltipStyle = () => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const arrowPos = step?.arrowPosition || 'bottom';
        const tooltipWidth = 280;
        const tooltipHeight = 180;
        const spacing = 20;

        let style: React.CSSProperties = {};

        switch (arrowPos) {
            case 'top':
                style = {
                    top: targetRect.bottom + spacing,
                    left: Math.max(16, Math.min(
                        targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                        window.innerWidth - tooltipWidth - 16
                    )),
                };
                break;
            case 'bottom':
                style = {
                    top: Math.max(16, targetRect.top - tooltipHeight - spacing),
                    left: Math.max(16, Math.min(
                        targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                        window.innerWidth - tooltipWidth - 16
                    )),
                };
                break;
            case 'left':
                style = {
                    top: targetRect.top + targetRect.height / 2 - 60,
                    left: targetRect.right + spacing,
                };
                break;
            case 'right':
                style = {
                    top: targetRect.top + targetRect.height / 2 - 60,
                    right: window.innerWidth - targetRect.left + spacing,
                };
                break;
        }

        return style;
    };

    // Arrow SVG based on position
    const ArrowSvg = ({ position }: { position: string }) => {
        const arrowClass = "absolute text-white drop-shadow-lg";

        switch (position) {
            case 'top':
                return (
                    <motion.div
                        className={`${arrowClass} -top-10 left-1/2 -translate-x-1/2`}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4L6 14h12L12 4z" />
                        </svg>
                    </motion.div>
                );
            case 'bottom':
                return (
                    <motion.div
                        className={`${arrowClass} -bottom-10 left-1/2 -translate-x-1/2`}
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 20L6 10h12L12 20z" />
                        </svg>
                    </motion.div>
                );
            case 'left':
                return (
                    <motion.div
                        className={`${arrowClass} -left-10 top-1/2 -translate-y-1/2`}
                        animate={{ x: [0, -8, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 12L14 6v12L4 12z" />
                        </svg>
                    </motion.div>
                );
            case 'right':
                return (
                    <motion.div
                        className={`${arrowClass} -right-10 top-1/2 -translate-y-1/2`}
                        animate={{ x: [0, 8, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 12L10 6v12L20 12z" />
                        </svg>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100]"
                style={{ pointerEvents: 'none' }}
            >
                {/* Dark overlay with spotlight cutout - blocks clicks */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ pointerEvents: 'auto' }}
                    onClick={handleNext}
                >
                    <defs>
                        <mask id="spotlight-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {spotlightStyle && (
                                <rect
                                    x={spotlightStyle.left}
                                    y={spotlightStyle.top}
                                    width={spotlightStyle.width}
                                    height={spotlightStyle.height}
                                    rx="16"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.75)"
                        mask="url(#spotlight-mask)"
                    />
                </svg>

                {/* Highlight border around target - no pointer events */}
                {spotlightStyle && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute rounded-2xl border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                        style={{
                            left: spotlightStyle.left,
                            top: spotlightStyle.top,
                            width: spotlightStyle.width,
                            height: spotlightStyle.height,
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Tooltip with arrow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute w-[280px] bg-white rounded-2xl p-5 shadow-2xl"
                    style={{
                        ...getTooltipStyle(),
                        pointerEvents: 'auto',
                    }}
                >
                    <ArrowSvg position={step?.arrowPosition || 'top'} />

                    {/* Step indicator */}
                    <div className="flex gap-1.5 mb-4 justify-center">
                        {TUTORIAL_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentStep
                                        ? 'bg-blue-500 w-6'
                                        : idx < currentStep
                                            ? 'bg-blue-300'
                                            : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <h3 className="text-lg font-black text-slate-800 mb-2 text-center">
                        {t(step?.titleKey || '')}
                    </h3>
                    <p className="text-sm text-slate-600 mb-5 text-center leading-relaxed">
                        {t(step?.descKey || '')}
                    </p>

                    <div className="flex gap-2">
                        {!isLastStep && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSkip}
                                className="flex-1 text-slate-400"
                            >
                                {t('tutorial.skip')}
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleNext}
                            className={`${isLastStep ? 'w-full' : 'flex-1'} bg-gradient-to-r from-blue-500 to-indigo-500`}
                        >
                            {isLastStep ? t('tutorial.finish') : t('tutorial.next')}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
