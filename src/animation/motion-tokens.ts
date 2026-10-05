import type { Transition, Variants } from 'motion/react';

export const routeTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

export const stageTransition: Transition = {
  duration: 0.18,
  ease: 'easeOut',
};

export const loadingMotion = {
  minimumIntroVisibleMs: 560,
  visualEntrance: {
    duration: 0.48,
    ease: [0.16, 1, 0.3, 1],
  } satisfies Transition,
  traceDraw: {
    duration: 0.88,
    ease: [0.16, 1, 0.3, 1],
  } satisfies Transition,
  nodeTravel: {
    duration: 2.4,
    ease: 'easeInOut',
    repeat: Infinity,
    repeatType: 'reverse',
  } satisfies Transition,
  overlayExit: {
    duration: 0.24,
    ease: 'easeOut',
  } satisfies Transition,
};

export const tapTransition: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 32,
  mass: 0.45,
};

export const layoutTransition: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.7,
};

export const bottomNavTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 40,
  mass: 0.65,
};

export const allocationMotion = {
  card: { duration: 0.2, ease: 'easeOut' } satisfies Transition,
  arc: { duration: 0.52, ease: [0.16, 1, 0.3, 1] } satisfies Transition,
  selection: { duration: 0.18, ease: 'easeOut' } satisfies Transition,
  arcStaggerSeconds: 0.045,
};

export const routeVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: routeTransition },
  exit: { opacity: 0, y: -4, transition: { duration: 0.14, ease: 'easeIn' } },
};

export const stageVariants: Variants = {
  initial: { opacity: 0, y: 9, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: stageTransition },
  exit: { opacity: 0, y: -5, scale: 0.995, transition: { duration: 0.14, ease: 'easeIn' } },
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 7 },
  animate: { opacity: 1, y: 0 },
};
