import type { Transition, Variants } from 'motion/react';

export const routeTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

export const stageTransition: Transition = {
  duration: 0.18,
  ease: 'easeOut',
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
