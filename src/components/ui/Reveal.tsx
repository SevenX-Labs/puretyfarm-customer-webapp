"use client";

import type { ReactNode } from "react";
import { m, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { belowFoldRevealVariants } from "@/lib/marketingAnimations";

type RevealProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
};

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      {...props}
      variants={belowFoldRevealVariants(delay, Boolean(reduceMotion))}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </m.div>
  );
}
