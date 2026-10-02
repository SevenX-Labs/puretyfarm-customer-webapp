"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { m, useReducedMotion } from "framer-motion";
import { belowFoldRevealVariants } from "@/lib/marketingAnimations";

type RevealProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
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
