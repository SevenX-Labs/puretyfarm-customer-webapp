import type { Variants } from "framer-motion";

export function belowFoldRevealVariants(
  delay = 0,
  reduceMotion = false,
): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    };
  }

  return {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };
}

export const staggerChildrenVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
