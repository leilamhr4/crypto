import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';
import { Link, NavLink } from 'react-router-dom';
import { layoutTransition, listItemVariants, stageVariants, tapTransition } from '../animation/motion-tokens';

const MotionLink = motion.create(Link);
const MotionNavLink = motion.create(NavLink);

export function TapButton({ children, disabled, ...props }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      {...props}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={tapTransition}
    >
      {children}
    </motion.button>
  );
}

export function TapLink(props: ComponentPropsWithoutRef<typeof MotionLink>) {
  return <MotionLink {...props} whileTap={{ scale: 0.985 }} transition={tapTransition} />;
}

export function TapNavLink(props: ComponentPropsWithoutRef<typeof MotionNavLink>) {
  return <MotionNavLink {...props} whileTap={{ scale: 0.96 }} transition={tapTransition} />;
}

export function TransitionStage({
  stage,
  className,
  children,
}: {
  stage: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={stage}
        className={className}
        variants={stageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function AnimatedList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>{children}</div>
  );
}

export function AnimatedListItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      layout
      className={className}
      variants={listItemVariants}
      initial="initial"
      animate="animate"
      transition={{ layout: layoutTransition }}
    >
      {children}
    </motion.div>
  );
}
