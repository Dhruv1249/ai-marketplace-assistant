  "use client";
  import React, { useRef, useEffect, useState } from 'react';
  import Script from 'next/script';
  import { gsap } from 'gsap';
  import LoginInput from "../../components/animated icon/LoginInputs";
  import { motion, useAnimation } from "framer-motion";
  import { usePathname } from "next/navigation";
  // --- Firebase imports (added) ---
  import { auth } from "./firebase";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    GithubAuthProvider,
    updateProfile,
    signOut, 
    onAuthStateChanged
  } from "firebase/auth";
  // ------------------------------

  
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
    
    // --- Auth state (added) ---
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const emailInputRef = useRef(null); // to focus email after sign-up
const [noticeMsg, setNoticeMsg] = useState(""); // to show success notice

// Sign-up modal state
const [showSignup, setShowSignup] = useState(false);
const [signupUsername, setSignupUsername] = useState("");
const [signupEmail, setSignupEmail] = useState("");
const [signupPassword, setSignupPassword] = useState("");
const [signupLoading, setSignupLoading] = useState(false);
const [signupError, setSignupError] = useState("");
const [welcomeName, setWelcomeName] = useState("");
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

// Firebase handles persistence -- no need for localStorage welcomeName anymore
useEffect(() => {
  // Listen to changes in auth state (persisted)
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setWelcomeName(user.displayName || user.email || "User");
      setIsLoggedIn(true);
    } else {
      setWelcomeName("");
      setIsLoggedIn(false);
    }
  });
  return () => unsubscribe();
}, []);
const handleLogout = async () => {
  try {
    await signOut(auth);
    // welcomeName and isLoggedIn will reset via onAuthStateChanged!
  } catch (error) {
    setErrorMsg("Logout failed: " + error.message);
  }
};

    // ---------------------------

    
    // Disable page scrolling while on the login page
    useEffect(() => {
      const previousHtmlOverflow = document.documentElement.style.overflow;
      const previousBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = previousHtmlOverflow || '';
        document.body.style.overflow = previousBodyOverflow || '';
      };
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

    // --- Auth handlers (added) ---
    const handleLogin = async (e) => {
      // if called by button submit it will be native submit; prevent default
      if (e && e.preventDefault) e.preventDefault();
      setErrorMsg("");
      setLoading(true);
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
setLoading(false);
// Store the username for greeting use
if (cred.user?.displayName) {
  localStorage.setItem('welcomeName', cred.user.displayName);
} else {
  localStorage.removeItem('welcomeName'); // fallback
}
// Redirect to homepage
window.location.href = '/';
        // optionally: window.location.href = '/';
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.message);
      }
    };

    const handleSignup = async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      setErrorMsg("");
      setLoading(true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setLoading(false);
        alert("Account created successfully 🎉");
        // optionally: window.location.href = '/';
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.message);
      }
    };

    const handleGoogle = async () => {
      setErrorMsg("");
      setLoading(true);
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        setLoading(false);
        alert("Signed in with Google ✅");
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.message);
      }
    };
    const openSignup = () => {
  setSignupUsername("");
  setSignupEmail("");
  setSignupPassword("");
  setSignupError("");
  setShowSignup(true);
};

const closeSignup = () => {
  setShowSignup(false);
  setSignupLoading(false);
};
const handleGithub = async () => {
  setErrorMsg("");
  setLoading(true);
  try {
    const provider = new GithubAuthProvider();
    await signInWithPopup(auth, provider);
    setLoading(false);
    alert("Signed in with GitHub ✅");
  } catch (err) {
    setLoading(false);
    if (err.code === 'auth/account-exists-with-different-credential') {
      setErrorMsg(
        "An account with your GitHub email already exists. Please sign in with the associated provider (e.g. Google), then link GitHub in your account settings."
      );
    } else {
      setErrorMsg(err.message);
    }
  }
};

const handleSignupSubmit = async (e) => {
  if (e && e.preventDefault) e.preventDefault();
  setSignupError("");
  setNoticeMsg("");
  if (!signupUsername.trim()) return setSignupError("Please enter a username.");
  if (!signupEmail.trim()) return setSignupError("Please enter an email.");
  if (!signupPassword) return setSignupError("Please enter a password.");
  if (!signupConfirmPassword) return setSignupError("Please confirm your password.");
  if (signupPassword !== signupConfirmPassword)
    return setSignupError("Passwords do not match.");

  setSignupLoading(true);
  try {
    const cred = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
    // Save username to displayName (optional but recommended)
    if (cred?.user) {
      try {
        await updateProfile(cred.user, { displayName: signupUsername.trim() });
      } catch {
        // ignore displayName errors; account is created anyway
      }
    }
    setSignupLoading(false);
    closeSignup();

    // Prefill email in the login form and show a notice
    setEmail(signupEmail);
    setNoticeMsg("Account created successfully. Please sign in with your email and password.");
    setSignupConfirmPassword(""); // clear
    // Focus email input
    setTimeout(() => emailInputRef.current?.focus(), 0);
  } catch (err) {
    setSignupLoading(false);
    setSignupError(err?.message || "Failed to create account.");
  }
};

// Optional: close modal on Escape
useEffect(() => {
  const onKeyDown = (e) => {
    if (e.key === "Escape" && showSignup) closeSignup();
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [showSignup]);
    // ------------------------------

    return (
      <div className="flex h-screen bg-white font-primarylw relative overflow-hidden">
        <Script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js" type="module" strategy="afterInteractive" />
                <div className="z-10 flex w-full">
          <div className="hidden md:flex w-1/2 items-center justify-center p-6">
            <dotlottie-wc
              src="https://lottie.host/a3c06cd4-e5d4-4da8-bb7c-a2cb74e6c66b/sSky3a3mo9.lottie"
              style={{ width: 520, height: 520 }}
              speed="1"
              autoplay
              loop
            ></dotlottie-wc>
          </div>
          <div className="w-full md:w-1/2 flex items-center justify-center p-6">
            {/* LOGIN CARD */}
            <div key={pathname} ref={cardRef} className="z-10 w-full max-w-md bg-white rounded p-8 md:p-12 relative border border-gray-200 rounded-xl shadow-sm">
              <div className="w-full flex items-center justify-center py-4">
                <div ref={titleRef} className="text-center -mt-4 mb-2">
                  <h2 className="text-gray-900 text-2xl ">Sign in</h2>
                  {noticeMsg && <p className="text-sm text-emerald-600 mt-2">{noticeMsg}</p>}
                  {/* Show auth error if any (added) */}
                  {errorMsg && <p className="text-sm text-red-500 mt-2">{errorMsg}</p>}
                </div>
              </div>
              {/* wire form submit to handleLogin */}
              <form autoComplete="off" onSubmit={handleLogin}>
                <div ref={userFieldRef} className="mb-6">
                  <LoginInput
                    inputRef={emailInputRef}
                    name="username"
                    id="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username"
                    autoComplete="off"
                  />
                </div>
                <div ref={passFieldRef} className="mb-6">

                  <LoginInput
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="off"
                  />
                </div>
                <div className="relative" ref={loginBtnRef}>
                  {welcomeName && (
  <div className="font-semibold text-blue-800 text-10xl mb-3 text-center">
    Welcome, {welcomeName}!
  </div>
)}
                  <button
                    ref={loginBtnRef}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-purple-300 hover:from-indigo-700 hover:to-indigo-200 text-white font-semibold text-base md:text-lg py-3 px-5 mb-6 mt-4 cursor-pointer rounded-full shadow-md hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200/60 transition-all duration-200"
                    style={{ letterSpacing: '0.04em', boxShadow: '0 4px 24px 0 rgba(53,39,145,0.10)' }}
                  >
                    <Cable width={22} height={22} stroke="#fff" strokeWidth={1.7} />
                    {loading ? "Please wait..." : "Sign in"}
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    ref={el => (socialBtnsRef.current[0] = el)}
                    type="button"
                    onClick={handleGoogle} // wired Google sign-in (added)
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
                    onClick={handleGithub}
                    // GitHub left unconnected intentionally — you can wire OAuth if desired
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
               <button
  ref={el => (footerLinksRef.current[1] = el)}
  onClick={openSignup} 
  className="text-blue-600 hover:text-blue-800 text-xs md:text-sm float-right bg-transparent border-0 p-0"
>
  Create Account
</button>
              </footer>
            </div>
          </div>
        </div>
        {showSignup && (
  <div className="fixed inset-0 z-20 flex items-center justify-center">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={closeSignup}
      aria-hidden="true"
    />
    {/* Modal panel */}
    <div className="relative z-30 w-full max-w-md mx-4 rounded-xl bg-white shadow-xl border border-gray-200">
      <div className="px-6 py-5 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Create account</h3>
      </div>
      <form onSubmit={handleSignupSubmit} className="px-6 pt-5 pb-6">
  {signupError && (
    <p className="text-sm text-red-600 mb-3">{signupError}</p>
  )}
  <div className="mb-4">
    <LoginInput
      id="su-username"
      name="su-username"
      type="text"
      value={signupUsername}
      onChange={(e) => setSignupUsername(e.target.value)}
      placeholder="Username"
      autoComplete="off"
    />
  </div>
  <div className="mb-4">
    <LoginInput
      id="su-email"
      name="su-email"
      type="email"
      value={signupEmail}
      onChange={(e) => setSignupEmail(e.target.value)}
      placeholder="Email"
      autoComplete="off"
    />
  </div>
  <div className="mb-4">
    <LoginInput
      id="su-password"
      name="su-password"
      type="password"
      value={signupPassword}
      onChange={(e) => setSignupPassword(e.target.value)}
      placeholder="Password"
      autoComplete="new-password"
    />
  </div>
  <div className="mb-4">
    <LoginInput
      id="su-confirmpassword"
      name="su-confirmpassword"
      type="password"
      value={signupConfirmPassword}
      onChange={(e) => setSignupConfirmPassword(e.target.value)}
      placeholder="Confirm Password"
      autoComplete="new-password"
    />
  </div>
  <div className="flex items-center justify-end gap-3">
    <button
      type="button"
      onClick={closeSignup}
      className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={signupLoading}
      className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-200 to-purple-300 text-gray-800 hover:from-indigo-300 hover:to-purple-400 disabled:opacity-60 border-0 shadow-none font-semibold transition-all"
    >
      {signupLoading ? "Creating..." : "Create account"}
    </button>
  </div>
</form>
    </div>
  </div>
)}
      </div>
    );
  };

  export default function Page() {
    return <IconedLoginForm />;
  };
