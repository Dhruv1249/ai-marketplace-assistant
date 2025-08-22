"use client";

import { motion, useAnimation } from "motion/react";
import React from "react";

const transition = {
  duration: 0.7, // slower animation
  opacity: { delay: 0.15 },
};

const variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: (custom) => ({
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      ...transition,
      delay: 0.1 * custom,
    },
  }),
};

export const Box = ({
  width = 20, // reduced from 28
  height = 20, // reduced from 28
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}) => {
  const controls = useAnimation();

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "2px", // reduced from 8px
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <motion.path
          d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
          variants={variants}
          animate={controls}
          custom={0}
        />
        <motion.path
          d="m3.3 7 8.7 5 8.7-5"
          variants={variants}
          animate={controls}
          custom={1}
        />
        <motion.path
          d="M12 22V12"
          variants={variants}
          animate={controls}
          custom={2}
        />
      </svg>
    </div>
  );
};
