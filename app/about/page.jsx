'use client';
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import Link from 'next/link';
import { Button } from '@/components/ui';
import StartCreatingButton from '@/components/animated icon/StartCreating';
import { Wand2, Target, Users, Lightbulb, ArrowRight } from 'lucide-react';
import dynamic from "next/dynamic";

// Client-only testimonial carousel with random animation, NO hydration mismatch
const AnimatedTestimonials = dynamic(
  () => import("@/components/animated icon/aboutus").then(mod => mod.AnimatedTestimonials),
  { ssr: false }
);

const testimonials = [
  {
    quote:
      "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
    name: "Jainam Jyoat",
    designation: "Dhruvs dad",
    src: "/images/Jainam.jpeg",
  },
  {
    quote:
      "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
    name: "Dhruv",
    designation: "Jainam Son",
    src: "/images/Dhruv.jpeg",
  },
  {
    quote:
      "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
    name: "Yukta Shree",
    designation: "Food Lover",
    src: "/images/Yukta.jpeg",
  },
];

export default function About() {
  const values = [
    {
      icon: Wand2,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI technology to simplify complex tasks and empower sellers.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a supportive ecosystem where sellers can thrive and grow their businesses.',
    },
    {
      icon: Target,
      title: 'Results',
      description: 'Focused on delivering measurable outcomes that drive real business growth.',
    },
    {
      icon: Lightbulb,
      title: 'Simplicity',
      description: 'Making advanced technology accessible to everyone, regardless of technical expertise.',
    },
  ];

  const team = [
    {
      name: 'Dhruv',
      role: 'CEO & Founder',
      description: 'Something Something',
    },
    {
      name: 'Jainam',
      role: 'CTO',
      description: 'Chutiya',
    },
    {
      name: 'Yukta Shree',
      role: 'Head of Product',
      description: 'Something Something',
    },
  ];

  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const valuesRef = useRef(null);
  const teamRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll('.about-hero-anim'), {
          y: 48,
          opacity: 0,
          duration: 1.7,
          ease: 'power3.out',
          stagger: 0.23,
          clearProps: 'all',
        });
      }
      [storyRef, valuesRef, teamRef].forEach((ref) => {
        if (ref.current) {
          gsap.from(ref.current.querySelectorAll('.section-heading'), {
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 90%',
              scrub: false
            },
            y: 44,
            opacity: 0,
            duration: 1.3,
            ease: 'power2.out',
            stagger: 0.28,
            clearProps: 'all',
          });
        }
      });
      if (valuesRef.current) {
        gsap.from(valuesRef.current.querySelectorAll('.about-value-card'), {
          scrollTrigger: {
            trigger: valuesRef.current,
            start: 'top 93%',
            scrub: false
          },
          scale: 0.7,
          opacity: 0,
          duration: 1.1,
          ease: 'back.out(1.7)',
          stagger: 0.17,
          clearProps: 'all',
        });
      }
      if (teamRef.current) {
        gsap.from(teamRef.current.querySelectorAll('.about-team-avatar'), {
          scrollTrigger: {
            trigger: teamRef.current,
            start: 'top 92%',
            scrub: false
          },
          scale: 0.5,
          opacity: 0,
          duration: 1.19,
          ease: 'elastic.out(1, .67)',
          stagger: 0.21,
          clearProps: 'all',
        });
      }
      ScrollTrigger.refresh();
    });
    return () => { ctx.revert(); };
  }, [heroRef, storyRef, valuesRef, teamRef]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="bg-gradient-to-br from-indigo-200 to-purple-200 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="about-hero-anim text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Our Mission
            </h1>
            <p className="about-hero-anim text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We're revolutionizing e-commerce by making AI-powered product creation 
              accessible to sellers of all sizes. Our platform empowers entrepreneurs 
              to create professional product listings in minutes, not hours.
            </p>
            <div className="about-hero-anim flex justify-center">
              <Link href="/create">
                <Button size="lg">
                  <Wand2 className="mr-2" size={20} />
                  Try It Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div ref={storyRef} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2024, AI Marketplace Assistant was born from a simple observation: 
                  creating compelling product listings was one of the biggest barriers for 
                  new sellers entering the e-commerce space.
                </p>
                <p>
                  Our founders, having built and scaled multiple marketplace platforms, 
                  recognized that while AI technology had advanced tremendously, it wasn't 
                  being applied effectively to solve real seller problems.
                </p>
                <p>
                  Today, we're proud to serve thousands of sellers worldwide, helping them 
                  create professional product pages that convert visitors into customers.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">2024</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Company Founded</h3>
                    <p className="text-gray-600">Started with a vision to democratize AI for e-commerce</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">1K</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">First 1,000 Users</h3>
                    <p className="text-gray-600">Reached our first milestone in just 3 months</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">AI</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Advanced AI Integration</h3>
                    <p className="text-gray-600">Launched streaming AI with real-time generation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div ref={valuesRef} className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and shape how we build 
              products for our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="about-value-card bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section replaced with AnimatedTestimonials */}
      <div ref={teamRef} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the real-world impact we bring through the voices of our users.
            </p>
          </div>
          <AnimatedTestimonials testimonials={testimonials} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-200 to-purple-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to join our community?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Start creating professional product listings with AI assistance today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <StartCreatingButton className="w-full sm:w-auto">
                Start Creating
              </StartCreatingButton>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                <ArrowRight className="mr-2" size={20} />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
