import {
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";

const easeOut: Transition["ease"] = [0.16, 1, 0.3, 1];

export function enterY(): Variants {
  return {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  };
}

export function enterTransition(delay = 0): Transition {
  return {
    duration: 0.35,
    delay,
    ease: easeOut,
  };
}

export function tactileTap(): {
  whileTap: { scale: 0.98 };
  transition: Transition;
} {
  return {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.12, ease: "easeOut" },
  };
}

export function useMotionGate(): boolean {
  const reduce = useReducedMotion();
  return !reduce;
}
