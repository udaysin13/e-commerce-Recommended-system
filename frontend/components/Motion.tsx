"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  once?: boolean;
} & Omit<HTMLMotionProps<"div">, "children">;

export const createFadeUpVariants = (reducedMotion: boolean, distance = 24): Variants => {
  if (reducedMotion) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    };
  }

  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
};

export const createStaggerContainerVariants = (
  reducedMotion: boolean,
  staggerChildren = 0.07,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: reducedMotion
      ? { delayChildren: 0 }
      : {
          staggerChildren,
          delayChildren,
        },
  },
});

export const createStaggerItemVariants = (reducedMotion: boolean): Variants =>
  reducedMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: 18, scale: 0.985 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

export const Reveal = ({
  children,
  className,
  delay = 0,
  distance = 24,
  once = true,
  ...props
}: RevealProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={createFadeUpVariants(Boolean(reducedMotion), distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      transition={{ delay: reducedMotion ? 0 : delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Appear = ({
  children,
  className,
  delay = 0,
  distance = 24,
  ...props
}: RevealProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={createFadeUpVariants(Boolean(reducedMotion), distance)}
      initial="hidden"
      animate="visible"
      transition={{ delay: reducedMotion ? 0 : delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
