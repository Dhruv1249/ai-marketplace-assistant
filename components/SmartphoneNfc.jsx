"use client";

import { motion, useAnimation } from "motion/react";
import React from "react";

const pathVariants = {
  normal: {
    opacity: 1,
    scale: 1,
  },
  animate: (i) => ({
    opacity: [0.3, 1, 0.3],
    scale: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      delay: i * 0.2,
    },
  }),
};

export const SmartphoneNfc = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#2563eb",
  ...props
}) => {
  const controls = useAnimation();

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "8px",
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
        <rect width="7" height="12" x="2" y="6" rx="1" />
        <motion.path
          d="M13 8.32a7.43 7.43 0 0 1 0 7.36"
          variants={pathVariants}
          animate={controls}
          custom={0}
        />
        <motion.path
          d="M16.46 6.21a11.76 11.76 0 0 1 0 11.58"
          variants={pathVariants}
          animate={controls}
          custom={1}
        />
        <motion.path
          d="M19.91 4.1a15.91 15.91 0 0 1 .01 15.8"
          variants={pathVariants}
          animate={controls}
          custom={2}
        />
      </svg>
    </div>
  );
};

