"use client";
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { motion, useAnimation } from "framer-motion";
import { usePathname } from "next/navigation";

const livelyBlobs = [
  {
    style:
      'absolute z-0 top-0 left-0 w-44 h-44 bg-gradient-to-tr from-indigo-300 to-blue-200 rounded-full filter blur-2xl opacity-60 rotate-12',
    gsap: { x: 40, y: 80, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' },
  },
  {
    style:
      'absolute z-0 bottom-0 right-0 w-52 h-52 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-full filter blur-2xl opacity-70 rotate-6',
    gsap: { x: -40, y: -60, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' },
  },
  {
    style:
      'absolute z-0 top-1/2 left-0 w-24 h-24 bg-gradient-to-tr from-amber-100 to-red-100 rounded-full filter blur-xl opacity-50 rotate-2',
    gsap: { x: 40, y: -30, rotation: 18, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut' },
  },
];

// Cable Animated Icon
const DURATION = 0.25;
const calculateDelay = (i) => (i === 0 ? 0.1 : i * DURATION + 0.1);
const Cable = ({ width = 28, height = 28, strokeWidth = 2, stroke = "#fff", ...props }) => {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      controls.start('animate');
    } else {
      controls.start('normal');
    }
  }, [isHovered, controls]);

  return (
    <div
      style={{ cursor: 'pointer', userSelect: 'none', padding: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <motion.path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1" animate={controls} transition={{ duration: DURATION, delay: calculateDelay(4), opacity: { delay: calculateDelay(4) } }} variants={{ normal: { pathLength: 1, pathOffset: 0, opacity: 1, transition: { delay: 0 } }, animate: { pathOffset: [1, 0], pathLength: [0, 1], opacity: [0, 1] } }} />
        <motion.path d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9" animate={controls} transition={{ duration: DURATION, delay: calculateDelay(3), opacity: { delay: calculateDelay(3) } }} variants={{ normal: { pathLength: 1, pathOffset: 0, opacity: 1, transition: { delay: 0 } }, animate: { pathOffset: [1, 0], pathLength: [0, 1], opacity: [0, 1] } }} />
        <motion.path d="M21 21v-2h-4" animate={controls} transition={{ duration: DURATION, delay: calculateDelay(2), opacity: { delay: calculateDelay(2) } }} variants={{ normal: { pathLength: 1, pathOffset: 0, opacity: 1, transition: { delay: 0 } }, animate: { pathOffset: [1, 0], pathLength: [0, 1], opacity: [0, 1] } }} />
        <motion.path d="M3 5h4V3" animate={controls} transition={{ duration: DURATION, delay: calculateDelay(1), opacity: { delay: calculateDelay(1) } }} variants={{ normal: { pathLength: 1, pathOffset: 0, opacity: 1, transition: { delay: 0 } }, animate: { pathOffset: [1, 0], pathLength: [0, 1], opacity: [0, 1] } }} />
        <motion.path d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3" animate={controls} transition={{ duration: DURATION, delay: calculateDelay(0), opacity: { delay: calculateDelay(0) } }} variants={{ normal: { pathLength: 1, pathOffset: 0, opacity: 1, transition: { delay: 0 } }, animate: { pathOffset: [1, 0], pathLength: [0, 1], opacity: [0, 1] } }} />
      </svg>
    </div>
  );
};

// Animated User Icon
const pathVariant = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: { pathLength: [0, 1], opacity: [0, 1], pathOffset: [1, 0] },
};
const circleVariant = {
  normal: { pathLength: 1, pathOffset: 0, scale: 1 },
  animate: { pathLength: [0, 1], pathOffset: [1, 0], scale: [0.5, 1] },
};
const User = ({ width = 28, height = 28, strokeWidth = 2, stroke = "#60a5fa", ...props }) => {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      controls.start('animate');
    } else {
      controls.start('normal');
    }
  }, [isHovered, controls]);
  
  return (
    <div
      style={{ cursor: 'pointer', userSelect: 'none', padding: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <motion.path
          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
          initial="normal"
          animate={controls}
          variants={pathVariant}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
        <motion.circle
          cx="12"
          cy="7"
          r="4"
          initial="normal"
          animate={controls}
          variants={circleVariant}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
      </svg>
    </div>
  );
};

// Animated Check Icon - consistent with User icon
const Check = ({ width = 28, height = 28, strokeWidth = 2, stroke = "#60d394", ...props }) => {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isHovered, controls]);

  return (
    <div
      style={{ cursor: "pointer", userSelect: "none", padding: "1px", display: "flex", alignItems: "center", justifyContent: "center" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        {/* Circle like User icon */}
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          initial="normal"
          animate={controls}
          variants={circleVariant}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
        {/* Check mark */}
        <motion.path
          d="M9 12l2 2 4-4"
          initial="normal"
          animate={controls}
          variants={pathVariant}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
      </svg>
    </div>
  );
};

const IconedLoginForm = () => {
  const pathname = usePathname();
  
  // Refs for animations
  const cardRef = useRef(null);
  const titleRef = useRef(null);
  const userFieldRef = useRef(null);
  const passFieldRef = useRef(null);
  const loginBtnRef = useRef(null);
  const socialBtnsRef = useRef([]);
  const footerLinksRef = useRef([]);
  const bgBlobsRef = useRef([]);

  // Background blob animations
  useEffect(() => {
    livelyBlobs.forEach((blob, i) => {
      const element = bgBlobsRef.current[i];
      if (element) {
        gsap.to(element, blob.gsap);
      }
    });
  }, []);

  // Button scale on hover/tap
  useEffect(() => {
    const buttons = [loginBtnRef.current, ...socialBtnsRef.current];
    buttons.forEach(btn => {
      if (btn) {
        btn.addEventListener('pointerenter', () => {
          gsap.to(btn, { scale: 1.04, boxShadow: '0 6px 22px rgba(40,65,130,.12)', duration: 0.18 });
        });
        btn.addEventListener('pointerleave', () => {
          gsap.to(btn, { scale: 1, boxShadow: '', duration: 0.18 });
        });
        btn.addEventListener('pointerdown', () => {
          gsap.to(btn, { scale: 0.97, duration: 0.06 });
        });
        btn.addEventListener('pointerup', () => {
          gsap.to(btn, { scale: 1.04, duration: 0.13 });
        });
      }
    });
    // Cleanup events
    return () => {
      buttons.forEach(btn => {
        if (btn) {
          btn.onpointerenter = btn.onpointerleave = btn.onpointerdown = btn.onpointerup = null;
        }
      });
    };
  }, []);

  // Card wiggle on hover
  useEffect(() => {
    if (cardRef.current) {
      const card = cardRef.current;
      let tl;
      const onEnter = () => {
        tl = gsap.timeline();
        tl.to(card, {
          rotate: 1.5,
          duration: 0.12,
          yoyo: true,
          repeat: 1
        }).to(card, { rotate: -2.5, duration: 0.10, yoyo: true, repeat: 1 }).to(card, { rotate: 0, duration: 0.2 });
      };
      card.addEventListener('pointerenter', onEnter);
      return () => card.removeEventListener('pointerenter', onEnter);
    }
  }, []);

  // Input focus glow
  useEffect(() => {
    const addGlow = e => gsap.to(e.target, { boxShadow: '0 0 0 4px #a5b4fc55', duration: 0.2 });
    const removeGlow = e => gsap.to(e.target, { boxShadow: '', duration: 0.22 });
    const inputs = [
      userFieldRef.current?.querySelector('input'),
      passFieldRef.current?.querySelector('input'),
    ].filter(Boolean);
    inputs.forEach(input => {
      input.addEventListener('focus', addGlow);
      input.addEventListener('blur', removeGlow);
    });
    return () => {
      inputs.forEach(input => {
        input?.removeEventListener('focus', addGlow);
        input?.removeEventListener('blur', removeGlow);
      });
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-primarylw relative" style={{overflow:'hidden'}}>
      {/* BACKGROUND BLOBS */}
      {livelyBlobs.map((blob, i) => (
        <div
          key={i}
          ref={el => (bgBlobsRef.current[i] = el)}
          className={blob.style}
          style={{ pointerEvents: 'none' }}
        />
      ))}
      {/* LOGIN CARD */}
      <div key={pathname} ref={cardRef} className="z-10 w-full max-w-md m-auto bg-white rounded p-8 md:p-12 relative border border-gray-200 rounded-xl shadow-sm">
        <div className="w-full flex items-center justify-center py-4">
          <div ref={titleRef} className="text-center -mt-4 mb-2">
            <h2 className="text-gray-900 text-2xl font-semibold">Login Here</h2>
          </div>
        </div>
        <form autoComplete="off">
          <div ref={userFieldRef}>
            <div className="flex flex-row items-center ml-1 mb-1 gap-1">
              <User width={22} height={22} stroke="#60a5fa" strokeWidth={2} />
              <label className="text-gray-700 text-sm" htmlFor="username">Username</label>
            </div>
            <input
              className="w-full p-2 pl-3 mb-4 text-gray-900 border-b-2 border-gray-300 bg-white outline-none focus:border-blue-500 rounded-full transition-shadow"
              type="text"
              name="username"
              id="username"
              autoComplete="off"
            />
          </div>
          <div ref={passFieldRef}>
            <div className="flex flex-row items-center ml-1 mb-1 gap-1">
              <Check width={22} height={22} stroke="#60d394" strokeWidth={2} />
              <label className="text-gray-700" htmlFor="password">Password</label>
            </div>
            <input
              className="w-full p-2 pl-3 mb-4 text-gray-900 border-b-2 border-gray-300 bg-white outline-none focus:border-blue-500 rounded-full transition-shadow"
              type="password"
              name="password"
              id="password"
              autoComplete="off"
            />
          </div>
          <div className="relative" ref={loginBtnRef}>
            <button
              ref={loginBtnRef}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-base md:text-lg py-3 px-5 mb-6 mt-4 cursor-pointer rounded-full shadow-md hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200/60 transition-all duration-200"
              style={{ letterSpacing: '0.04em', boxShadow: '0 4px 24px 0 rgba(53,39,145,0.10)' }}
            >
              <Cable width={22} height={22} stroke="#fff" strokeWidth={1.7} />
              Sign in
            </button>
          </div>
          <div className="flex gap-1">
            <button
              ref={el => (socialBtnsRef.current[0] = el)}
              type="button"
              className="w-full border border-blue-700 hover:bg-blue-700 hover:text-white text-gray-700 text-sm py-2 px-4 mb-6 cursor-pointer rounded-full flex items-center justify-center gap-1 transition-transform"
            >
              <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 0 48 48" version="1.1">
                <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <g id="Color-" transform="translate(-401.000000, -860.000000)">
                    <g id="Google" transform="translate(401.000000, 860.000000)">
                      <path d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24" id="Fill-1" fill="#FBBC05"></path>
                      <path d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333" id="Fill-2" fill="#EB4335"></path>
                      <path d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667" id="Fill-3" fill="#34A853"></path>
                      <path d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24" id="Fill-4" fill="#4285F4"></path>
                    </g>
                  </g>
                </g>
              </svg>
              <span className="hidden md:flex">Google</span>
            </button>
            <button
              ref={el => (socialBtnsRef.current[1] = el)}
              type="button"
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 text-sm px-4 mb-6 py-1 cursor-pointer rounded-full flex items-center justify-center gap-1 transition-transform"
            >
              {/* GitHub icon SVG - white */}
              <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.091.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.621.069-.609.069-.609 1.004.07 1.533 1.031 1.533 1.031.892 1.532 2.341 1.09 2.91.834.09-.646.35-1.09.636-1.34-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.104-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.54 9.54 0 0 1 2.504.338c1.909-1.296 2.748-1.026 2.748-1.026.545 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.565 4.945.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.748 0 .267.18.577.688.479C19.138 20.2 22 16.448 22 12.02 22 6.484 17.523 2 12 2Z"
                  fill="#18181b"
                />
              </svg>
              <span className="hidden md:flex">GitHub</span>
            </button>
          </div>
        </form>
        <footer className="flex justify-between">
          <a ref={el => (footerLinksRef.current[0] = el)} className="text-blue-600 hover:text-blue-800 text-xs md:text-sm float-left" href="#">Forgot Password?</a>
          <a ref={el => (footerLinksRef.current[1] = el)} className="text-blue-600 hover:text-blue-800 text-xs md:text-sm float-right" href="#">Create Account</a>
        </footer>
      </div>
    </div>
  );
};

export default function Page() {
  return <IconedLoginForm />;
};