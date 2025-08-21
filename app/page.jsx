'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Wand2, ShoppingBag, Zap, Users, TrendingUp, Star } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { auth } from './login/firebase'; // path may vary, adjust if needed
import { onAuthStateChanged } from 'firebase/auth';
gsap.registerPlugin(ScrollTrigger);

const AnimatedCartButton = () => {
  const [clicked, setClicked] = useState(false);
  const router = useRouter();

  const cartClick = () => {
    if (clicked) return;
    setClicked(true);
    setTimeout(() => {
      router.push('/create');
    }, 1000);
    setTimeout(() => {
      setClicked(false);
    }, 3000);
  };

  return (
    <>
      <button
        onClick={cartClick}
        className={'cart-button relative px-4 py-2 w-60 h-14 border-0 rounded-md outline-none cursor-pointer text-white transition ease-in-out duration-300 overflow-hidden font-bold active:scale-90 ' + (clicked ? 'clicked' : '')}
      >
        <span
          className="absolute z-30 left-1/2 top-1/2 text-lg text-white transform -translate-x-1/2 -translate-y-1/2 add-to-cart opacity-100"
        >
          Start Creating
        </span>
        <span
          className="flex gap-1 absolute z-30 left-1/2 top-1/2 text-lg text-white transform -translate-x-1/2 -translate-y-1/2 added opacity-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
            stroke="currentColor" className="size-6 fa-solid fa-circle-check">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Starting...
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
          className="size-8 fa-solid cart-shopping-svg absolute z-20 top-1/2 left-[-10%] text-2xl transform -translate-x-1/2 -translate-y-1/2">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" style={{ fill: 'rgb(255, 167, 4)' }} viewBox="0 0 448 512"
          className="size-5 fas cart-box-svg absolute z-30 top-[-20%] left-[52%] text-xl transform -translate-x-1/2 -translate-y-1/2 ">
          <path
            d="M50.7 58.5L0 160l208 0 0-128L93.7 32C75.5 32 58.9 42.3 50.7 58.5zM240 160l208 0L397.3 58.5C389.1 42.3 372.5 32 354.3 32L240 32l0 128zm208 32L0 192 0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-224z" />
        </svg>
      </button>
      <style jsx>{`
        .cart-button { background-color: #2563eb; }
        .cart-button:hover { background-color: #1d4ed8; }
        .cart-button .add-to-cart { transition: opacity 300ms ease; }
        .cart-button .added { transition: opacity 300ms ease; }
        .cart-button.clicked .add-to-cart { opacity: 0; }
        .cart-button.clicked .added { opacity: 1; }
        .cart-shopping-svg, .cart-box-svg { pointer-events: none; }
        .cart-shopping-svg { transition: transform 0.8s ease, left 0.8s ease; }
        .cart-box-svg { transition: transform 0.8s ease, top 0.8s ease, left 0.8s ease, opacity 0.3s ease; }
        .cart-button.clicked .cart-shopping-svg { left: 110%; transform: translate(-50%, -50%) rotate(10deg); }
        .cart-button.clicked .cart-box-svg { top: 50%; left: 70%; transform: translate(-50%, -50%) rotate(10deg); }
      `}</style>
    </>
  );
};

const TypingText = ({
  children,
  as: Component = 'span',
  className = '',
  delay = 0,
  duration = 2,
  align = 'left',
  loop = false,
}) => {
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    const extractText = (node) => {
      if (typeof node === 'string' || typeof node === 'number') return node.toString();
      if (Array.isArray(node)) return node.map(extractText).join('');
      if (React.isValidElement(node) && typeof node.props.children !== 'undefined') {
        return extractText(node.props.children);
      }
      return '';
    };
    setTextContent(extractText(children));
  }, [children]);

  const chars = textContent.split('').map((c) => (c === ' ' ? '\u00A0' : c));
  const perCharDelay = duration / (chars.length || 1);
  const alignClasses = align === 'center' ? 'justify-center text-center' : align === 'right' ? 'justify-end text-right' : 'justify-start text-left';

  return (
    <Component className={`inline-flex ${alignClasses} ${className}`}>
      <motion.span className="inline-block" initial="hidden" animate="visible" aria-label={textContent} role="text">
        {chars.map((char, i) => (
          <motion.span
            key={`${i}-${char}`}
            className="inline-block"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * perCharDelay, duration: 0.3, ease: 'easeInOut' }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};

export default function Home() {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const testimonialsRef = useRef(null);
const [welcomeName, setWelcomeName] = useState("");

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) {
      setWelcomeName(user.displayName || user.email || "User");
    } else {
      setWelcomeName("");
    }
  });
  return () => unsub();
}, []);
  const features = [
    {
      icon: Wand2,
      title: 'AI-Powered Content Generation',
      description: 'Generate compelling product descriptions, titles, and features using advanced AI technology.',
    },
    {
      icon: Zap,
      title: 'Real-time Streaming',
      description: 'Watch your content being generated in real-time with our streaming AI interface.',
    },
    {
      icon: ShoppingBag,
      title: 'Marketplace Integration',
      description: 'Seamlessly publish your products to our integrated marketplace platform.',
    },
    {
      icon: Users,
      title: 'Seller Dashboard',
      description: 'Manage all your products, analytics, and settings from one central dashboard.',
    },
  ];

  const stats = [
    { label: 'Products Created', value: '10,000+' },
    { label: 'Active Sellers', value: '2,500+' },
    { label: 'AI Generations', value: '50,000+' },
    { label: 'Success Rate', value: '98%' },
  ];

  useEffect(() => {
    const listeners = [];
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll('.hero-anim:not(.hero-title)'), {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
        });
        gsap.fromTo(heroRef.current.querySelectorAll('.hero-orb'), {
          scale: 0.8,
          opacity: 0,
        }, {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          stagger: 0.2,
        });
        const orb1 = heroRef.current.querySelector('.hero-orb-1');
        const orb2 = heroRef.current.querySelector('.hero-orb-2');
        if (orb1) gsap.to(orb1, { y: -15, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true });
        if (orb2) gsap.to(orb2, { y: 15, duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
      }

      if (statsRef.current) {
        const inView = (() => {
          const r = statsRef.current.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        })();

        const statItems = statsRef.current.querySelectorAll('.stat-anim');
        const statValues = statsRef.current.querySelectorAll('.stat-value');

        if (inView) {
          gsap.from(statItems, {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.08,
          });
        } else {
          gsap.from(statItems, {
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.08,
          });
        }

        const formatNumber = (n) => n.toLocaleString();
        statValues.forEach((el) => {
          const raw = el.getAttribute('data-value') || el.textContent.trim();
          const match = raw.match(/[0-9,.]+/);
          const suffix = raw.replace(match ? match[0] : '', '');
          const target = match ? parseFloat(match[0].replace(/,/g, '')) : 0;
          const counter = { val: 0 };
          const animConf = {
            val: target,
            duration: 1.2,
            ease: 'power1.out',
            onUpdate: () => {
              const current = Math.round(counter.val);
              el.textContent = formatNumber(current) + suffix;
            },
          };
          if (inView) {
            // initialize at 0 for visible stats
            el.textContent = formatNumber(0) + suffix;
            gsap.to(counter, animConf);
          } else {
            gsap.to(counter, { ...animConf, scrollTrigger: { trigger: el, start: 'top 90%' } });
          }
        });
      }

      if (featuresRef.current) {
        gsap.from(featuresRef.current.querySelectorAll('.feature-card'), {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
        });
        const cards = featuresRef.current.querySelectorAll('.feature-card');
        cards.forEach((card) => {
          const qx = gsap.quickTo(card, 'rotationY', { duration: 0.3, ease: 'power3.out' });
          const qy = gsap.quickTo(card, 'rotationX', { duration: 0.3, ease: 'power3.out' });
          const qz = gsap.quickTo(card, 'y', { duration: 0.3, ease: 'power3.out' });
          const handleMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rx = ((y / rect.height) - 0.5) * -8;
            const ry = ((x / rect.width) - 0.5) * 8;
            qx(ry);
            qy(rx);
            qz(-2);
          };
          const reset = () => { qx(0); qy(0); qz(0); };
          card.addEventListener('mousemove', handleMove);
          card.addEventListener('mouseleave', reset);
          listeners.push({ card, handleMove, reset });
        });
      }

      if (ctaRef.current) {
        gsap.from(ctaRef.current.querySelectorAll('.cta-anim'), {
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
        });
      }

      if (testimonialsRef.current) {
        gsap.from(testimonialsRef.current.querySelectorAll('.testimonial-card'), {
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
        });
      }
    ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      listeners.forEach(({ card, handleMove, reset }) => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', reset);
      });
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-300">
      
      {/* Bold Geometric Background Accents */}
<div className="pointer-events-none absolute z-0 w-full h-full">
  {/* Large Circle, top left */}
  <div
    style={{
      position: "absolute",
      top: "-100px",
      left: "-120px",
      width: "340px",
      height: "340px",
      background: "radial-gradient(circle at 60% 40%, #a78bfa 70%, #8366eb 100%)",
      borderRadius: "50%",
      filter: "blur(16px)",
      opacity: 0.25,
    }}
  />

  {/* Vertical Rectangle, right side */}
  <div
    style={{
      position: "absolute",
      top: "15vh",
      right: "-60px",
      width: "120px",
      height: "320px",
      background: "linear-gradient(120deg, #ddd6fe 60%, #c4b5fd 100%)",
      borderRadius: "40px",
      filter: "blur(18px)",
      opacity: 0.17,
    }}
  />

  {/* Small Circle, bottom left for balance */}
  <div
    style={{
      position: "absolute",
      bottom: "-60px",
      left: "40px",
      width: "110px",
      height: "110px",
      background: "radial-gradient(circle at 40% 65%, #d1d5fa 75%, #a5b4fc 100%)",
      borderRadius: "50%",
      filter: "blur(10px)",
      opacity: 0.19,
    }}
  />
  
  
</div>
      {welcomeName && (
  <div className="pt-10 text-3xl font-semibold text-blue-800 mb-4 text-center">
    Welcome, {welcomeName}!
  </div>
)}
      {/* Hero Section */}
      <div ref={heroRef} className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-orb hero-orb-1 absolute -top-10 -left-10 w-64 h-64 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 blur-3xl opacity-60"></div>
          <div className="hero-orb hero-orb-2 absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 blur-3xl opacity-60"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="hero-anim hero-title text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <TypingText as="span" className="block" align="center" delay={0} duration={1.2}>AI-Powered</TypingText>
              <TypingText as="span" className="block text-blue-600" align="center" delay={0.15} duration={1.2}>Marketplace</TypingText>
              <TypingText as="span" className="block" align="center" delay={0.3} duration={1.2}>Assistant</TypingText>
            </h1>
            <p className="hero-anim text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create stunning product pages in minutes with our AI assistant. 
              Generate content, optimize for SEO, and publish to your marketplace 
              with just a few clicks.
            </p>
            
            <div className="hero-anim flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedCartButton />
              <Link href="/marketplace">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <ShoppingBag className="mr-2" size={20} />
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="from-blue-100 to-purple-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="stat-anim text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  <span className="stat-value" data-value={stat.value}>{stat.value}</span>
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="py-24 bg-gray-50" style={{ perspective: '1000px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need to create, 
              optimize, and sell your products online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow transform-gpu will-change-transform">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div ref={ctaRef} className="from-blue-100 to-purple-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="cta-anim text-3xl font-bold text-white mb-4">
            Ready to transform your product listings?
          </h2>
          <p className="cta-anim text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers who are already using AI to create 
            better product pages and increase their sales.
          </p>
          <div className="cta-anim flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Wand2 className="mr-2" size={20} />
                Get Started Free
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div ref={testimonialsRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What our users say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'E-commerce Seller',
                content: 'This AI assistant has revolutionized how I create product listings. What used to take hours now takes minutes!',
                rating: 5,
              },
              {
                name: 'Mike Chen',
                role: 'Small Business Owner',
                content: 'The SEO optimization features have significantly improved my product visibility. Sales are up 40%!',
                rating: 5,
              },
              {
                name: 'Emily Rodriguez',
                role: 'Digital Marketer',
                content: 'The streaming AI generation is amazing to watch. The quality of content is consistently excellent.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="testimonial-card bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}