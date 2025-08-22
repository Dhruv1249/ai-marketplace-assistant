"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useEffect } from "react";

const pathVariants = (delay = 0) => ({
  normal: {
    translateX: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 13,
    },
  },
  animate: {
    translateX: [-6, 0],
    transition: {
      delay,
      type: "spring",
      stiffness: 200,
      damping: 13,
    },
  },
});

export const Users = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#2563eb",
  ...props
}) => {
  const controls = useAnimation();

  // 👇 Reset animation to "normal" whenever component mounts
  useEffect(() => {
    controls.start("normal");
  }, [controls]);

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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />

        <motion.path
          d="M22 21v-2a4 4 0 0 0-3-3.87"
          variants={pathVariants(0)}
          animate={controls}
        />
        <motion.path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          variants={pathVariants(0.25)}
          animate={controls}
        />
      </svg>
    </div>
  );
};
